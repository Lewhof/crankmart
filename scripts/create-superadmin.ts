/**
 * Create (or upgrade) a superadmin account. Idempotent — re-running for the
 * same email just resets role + password.
 *
 * Usage:
 *   npx tsx scripts/create-superadmin.ts <email> "<full name>" [country]
 *
 * Prints the generated temp password once to stdout. Share it via a secure
 * channel — it is never written to disk or logs.
 */

import { neon } from '@neondatabase/serverless'
import { randomUUID, randomBytes } from 'crypto'
import bcrypt from 'bcryptjs'

function generatePassword(): string {
  // 16 chars, URL-safe, no ambiguous characters
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%'
  const bytes = randomBytes(16)
  let out = ''
  for (let i = 0; i < 16; i++) out += alphabet[bytes[i] % alphabet.length]
  return out
}

function deriveHandle(email: string): string {
  const local = email.split('@')[0].toLowerCase()
  return local.replace(/[^a-z0-9_]/g, '').slice(0, 40)
}

async function main() {
  const [, , emailArg, nameArg, countryArg] = process.argv
  if (!emailArg || !nameArg) {
    console.error('Usage: npx tsx scripts/create-superadmin.ts <email> "<full name>" [country]')
    process.exit(1)
  }
  const email = emailArg.trim().toLowerCase()
  const name = nameArg.trim()
  const country = (countryArg ?? 'za').toLowerCase()
  if (!['za', 'au'].includes(country)) {
    console.error(`Invalid country "${country}" — must be za or au`)
    process.exit(1)
  }

  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL not set')
  const sql = neon(url)

  const password = generatePassword()
  const passwordHash = await bcrypt.hash(password, 10)
  const handle = deriveHandle(email)

  const existing = await sql`SELECT id, role FROM users WHERE email = ${email} LIMIT 1`

  if (existing[0]) {
    await sql`
      UPDATE users
      SET role = 'superadmin'::user_role,
          password_hash = ${passwordHash},
          name = ${name},
          country = ${country},
          email_verified = true,
          is_active = true
      WHERE id = ${existing[0].id}::uuid
    `
    console.log('\n✓ Upgraded existing user to superadmin')
  } else {
    const id = randomUUID()
    // Handle may collide; append a suffix if it does.
    const handleTaken = await sql`SELECT 1 FROM users WHERE handle = ${handle} LIMIT 1`
    const finalHandle = handleTaken[0] ? `${handle}_${randomBytes(2).toString('hex')}` : handle
    await sql`
      INSERT INTO users (id, email, name, password_hash, role, country, handle, email_verified, is_active)
      VALUES (${id}, ${email}, ${name}, ${passwordHash}, 'superadmin'::user_role, ${country}, ${finalHandle}, true, true)
    `
    console.log('\n✓ Created new superadmin')
  }

  console.log('─'.repeat(60))
  console.log(`  Email:    ${email}`)
  console.log(`  Name:     ${name}`)
  console.log(`  Country:  ${country}`)
  console.log(`  Password: ${password}`)
  console.log('─'.repeat(60))
  console.log('  Share via secure channel. Password is not stored in plaintext.')
  console.log('  User should change it after first login.\n')
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
