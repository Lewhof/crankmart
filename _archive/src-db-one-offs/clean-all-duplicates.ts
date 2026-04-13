import { neon } from "@neondatabase/serverless";
const sql = neon(process.env.DATABASE_URL!);

async function run() {
  // Find all duplicates by website
  const dups = await sql`
    SELECT website, COUNT(*) as cnt,
      array_agg(id ORDER BY 
        (CASE WHEN logo_url IS NOT NULL AND logo_url != '' THEN 1 ELSE 0 END) DESC,
        (CASE WHEN cover_url IS NOT NULL AND cover_url != '' AND cover_url NOT LIKE '%placeholder%' THEN 1 ELSE 0 END) DESC,
        (CASE WHEN description IS NOT NULL AND length(description) > 50 THEN 1 ELSE 0 END) DESC,
        created_at ASC
      ) as ids,
      array_agg(name ORDER BY 
        (CASE WHEN logo_url IS NOT NULL AND logo_url != '' THEN 1 ELSE 0 END) DESC,
        (CASE WHEN cover_url IS NOT NULL AND cover_url != '' AND cover_url NOT LIKE '%placeholder%' THEN 1 ELSE 0 END) DESC,
        (CASE WHEN description IS NOT NULL AND length(description) > 50 THEN 1 ELSE 0 END) DESC,
        created_at ASC
      ) as names
    FROM businesses
    WHERE website IS NOT NULL AND website != ''
    GROUP BY website
    HAVING COUNT(*) > 1
    ORDER BY cnt DESC
  `;

  console.log(`\n=== Found ${dups.length} duplicate website groups ===\n`);

  let totalDeleted = 0;

  for (const d of dups) {
    const ids: string[] = d.ids as string[];
    const names: string[] = d.names as string[];
    const keepId = ids[0];
    const keepName = names[0];
    const deleteIds = ids.slice(1);
    const deleteNames = names.slice(1);

    console.log(`Keep:   [${keepName}] (${keepId.substring(0,8)}...)`);
    deleteNames.forEach((n: string, i: number) => 
      console.log(`Delete: [${n}] (${deleteIds[i].substring(0,8)}...)`)
    );
    console.log(`  URL: ${d.website}`);

    await sql`DELETE FROM businesses WHERE id = ANY(${deleteIds}::uuid[])`;
    totalDeleted += deleteIds.length;
    console.log(`  → deleted ${deleteIds.length}\n`);
  }

  // Also catch duplicates by name+city
  const nameDups = await sql`
    SELECT name, city, COUNT(*) as cnt,
      array_agg(id ORDER BY 
        (CASE WHEN logo_url IS NOT NULL AND logo_url != '' THEN 1 ELSE 0 END) DESC,
        created_at ASC
      ) as ids
    FROM businesses
    WHERE (website IS NULL OR website = '')
    GROUP BY name, city
    HAVING COUNT(*) > 1
  `;

  if (nameDups.length > 0) {
    console.log(`=== Found ${nameDups.length} duplicates by name+city (no website) ===`);
    for (const d of nameDups) {
      const ids: string[] = d.ids as string[];
      const deleteIds = ids.slice(1);
      await sql`DELETE FROM businesses WHERE id = ANY(${deleteIds}::uuid[])`;
      console.log(`  Deleted ${deleteIds.length} × "${d.name}" in ${d.city}`);
      totalDeleted += deleteIds.length;
    }
  }

  // Final stats
  const total = await sql`SELECT COUNT(*) as n FROM businesses`;
  const byProvince = await sql`
    SELECT province, COUNT(*) as n FROM businesses GROUP BY province ORDER BY n DESC
  `;

  console.log(`\n=== Done: ${totalDeleted} duplicates removed ===`);
  console.log(`Total businesses remaining: ${(total[0] as any).n}`);
  console.log(`\nBy province:`);
  byProvince.forEach((r: any) => console.log(`  ${r.province || 'Unknown'}: ${r.n}`));
}
run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
