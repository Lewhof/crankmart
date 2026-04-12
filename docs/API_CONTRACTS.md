# CrankMart API Contracts Reference

**Version:** 2.0 | **Date:** 2026-04-11 | **Endpoints:** 91+

---

## Authentication

### POST /api/auth/register
**Auth:** None | **Purpose:** Create new user account
```
Request:  { name: string, email: string, password: string (min 8), province: string }
Response: { success: boolean }
Errors:   400 (validation), 409 (email exists), 500
```

### POST /api/auth/forgot-password
**Auth:** None | **Purpose:** Initiate password reset
```
Request:  { email: string }
Response: { ok: boolean } (always 200 to prevent enumeration)
Errors:   400 (invalid email), 503 (SMTP disabled), 500
```

### GET|POST /api/auth/[...nextauth]
**Auth:** None | **Purpose:** NextAuth sign-in, sign-out, callbacks

---

## Listings

### GET /api/listings
**Auth:** None | **Purpose:** Browse/search listings with filters
```
Query: limit (max 100), page, category, condition, province, minPrice, maxPrice,
       search, seller, exclude, status, attrs (JSON), suggest, offset
Response: [ { id, slug, title, price, condition, province, city, status, bikeMake,
              bikeModel, bikeYear, description, categoryId, sellerId, createdAt,
              isFeatured, boostEnabled, expiresAt, image: { listing_id, image_url,
              thumb_url, display_order } } ]
Errors: 403 (status=all without auth), 500
```

### GET /api/listings/[slug]
**Auth:** None | **Purpose:** Single listing detail + view increment
```
Response: { ...listing, category: {}, images: [], user: {} }
Errors: 404, 500
```

### GET /api/listings/by-id/[id]/edit
**Auth:** Required (owner) | **Purpose:** Get listing for editing
```
Response: { id, title, description, price, negotiable, condition, province, city,
           postalCode, bikeMake, bikeModel, bikeYear, colour, frameSize,
           wheelSizeInches, drivetrainSpeeds, brakeType, frameMaterial,
           shippingAvailable, slug, images: [] }
Errors: 401, 403, 404, 500
```

### PATCH /api/listings/by-id/[id]/edit
**Auth:** Required (owner) | **Purpose:** Update listing
```
Request:  { title?, description?, price?, negotiable?, condition?, province?, city?,
            postalCode?, bikeMake?, bikeModel?, bikeYear?, colour?, frameSize?,
            wheelSizeInches?, drivetrainSpeeds?, brakeType?, frameMaterial?,
            shippingAvailable?, deleteImageIds?: string[], newImages?: string[] }
Response: { success: boolean, slug: string }
Errors: 401, 403, 404, 500
```

### POST /api/listings/save
**Auth:** Required | **Purpose:** Toggle save/favourite
```
Request:  { listingId: UUID }
Response: { saved: boolean }
Errors: 400, 401, 500
```

### GET /api/listings/saved
**Auth:** Required | **Purpose:** Get user's saved listings
```
Response: [ { id, title, slug, price, condition, province, city, status, bikeMake,
              bikeModel, bikeYear, createdAt, savedAt, thumbUrl } ]
Errors: 401, 500
```

### GET /api/listings/saved/ids
**Auth:** Required | **Purpose:** Get IDs of saved listings
```
Response: [ string ]
Errors: 401, 500
```

### POST /api/listings/by-id/[id]/mark-sold
**Auth:** Required (owner) | **Purpose:** Mark listing as sold
```
Response: { success: boolean }
Errors: 401, 403, 404, 500
```

### POST /api/listings/[slug]/renew
**Auth:** Required (owner) | **Purpose:** Renew listing for 30 days
```
Response: { expiresAt: ISO date }
Errors: 401, 403, 404, 500
```

---

## Sell/Publish

### POST /api/sell/draft
**Auth:** Required | **Purpose:** Save/update sell wizard draft
```
Request:  { step: number, data: object }
Response: { id: string }
Errors: 401, 500
```

### GET /api/sell/draft
**Auth:** Required | **Purpose:** Get current draft
```
Response: { id, step, data, createdAt, updatedAt } | null
Errors: 401, 500
```

### DELETE /api/sell/draft
**Auth:** Required | **Purpose:** Clear draft
```
Response: { success: boolean }
Errors: 401, 500
```

### POST /api/sell/publish
**Auth:** Required | **Purpose:** Publish listing from draft
```
Request:  { title (req), price (req), condition (req), category (req), description?,
            negotiable?, province?, city?, postalCode?, bikeMake?, bikeModel?,
            bikeYear?, colour?, frameSize?, wheelSizeInches?, suspensionTravelMm?,
            frameMaterial?, drivetrainSpeeds?, brakeType?, componentBrands?,
            damageNotes?, shippingAvailable?, images?: string[],
            forceDuplicate?: boolean, + 30 extended spec fields }
Response: { slug: string, listingId: string }
Errors: 400 (validation), 401, 409 (duplicate), 500
```

### POST /api/sell/upload
**Auth:** Required | **Purpose:** Upload listing image
```
Request:  FormData { file: File } (max 10MB, jpeg/png/webp/heic)
Response: { url: string, filename: string }
Errors: 400 (size/type), 401, 500
```

---

## Directory

### GET /api/directory
**Auth:** None | **Purpose:** Browse business directory
```
Query: type, province, city, search, featured, limit (max 200), page, lat, lng, nearbyKm
Response: { success, data: [ { id, name, slug, type, province, city, logo, cover,
           description, website, email, phone, whatsapp, brands[], services[],
           verified, featured, views, lat, lng, distance_from_user } ],
           pagination: { total, page, limit, pages } }
Errors: 500
```

### GET /api/directory/[slug]
**Auth:** None | **Purpose:** Business detail
```
Response: { success, data: { ...business, address, hours_json, rating, reviews },
           related: [ 4 related businesses ] }
Errors: 404, 500
```

### POST /api/directory/register
**Auth:** Required | **Purpose:** Register new business
```
Request (concierge): { mode: 'concierge', name, website_url, contact_email }
Request (self):      { mode: 'self', name, business_type, province, city, address?,
                       phone?, description?, services?[], brands_stocked?[],
                       website_url?, contact_email? }
Response: { success, message, data: { id, slug } }
Errors: 400, 401, 500
```

### POST /api/directory/claim
**Auth:** None | **Purpose:** Claim business listing via token
```
Request:  { token (req), name?, phone?, email?, website?, address?, suburb?,
            city?, province?, description? } (phone or email required)
Response: { success, slug }
Errors: 400 (token invalid/expired, missing contact), 500
```

---

## Events

### GET /api/events
**Auth:** None | **Purpose:** Browse events
```
Query: type, province, month (1-12), search, limit (max 200), page
Response: [ { id, title, slug, description, eventType, city, province, venueName,
              eventDateStart, eventDateEnd, entryUrl, entryStatus, isFeatured,
              isVerified, coverImageUrl, discipline, viewsCount, savesCount,
              entryFee, distance, organiserName, organiserWebsite } ]
Errors: 500
```

### GET /api/events/[slug]
**Auth:** None | **Purpose:** Event detail
```
Response: { ...full event object }
Errors: 404, 500
```

### POST /api/events/submit
**Auth:** Required | **Purpose:** Submit new event
```
Request:  { title (req), city (req), organiserEmail (req), eventDateStart (req),
            description?, eventType?, province?, venueName?, eventDateEnd?,
            entryUrl?, entryStatus?, entryFee?, distance?, discipline?,
            organiserName?, organiserWebsite?, coverImageUrl? }
Response: { success: boolean }
Errors: 400, 401, 500
```

---

## Routes (Cycling)

### GET /api/routes
**Auth:** None | **Purpose:** Browse cycling routes
```
Query: discipline, province, city, difficulty, distanceRange (under30/30to60/60to100/over100),
       search, limit (max 100), page, lat, lng, nearbyKm
Response: { routes: [ { id, slug, name, description, discipline, difficulty, surface,
           distanceKm, elevationM, estTimeMin, province, region, town, lat, lng,
           heroImageUrl, facilities, tags, isVerified, isFeatured, viewsCount,
           savesCount, loopDifficulties[] } ], total, page, totalPages }
Errors: 500
```

### GET /api/routes/[slug]
**Auth:** None | **Purpose:** Route detail with gallery, loops, reviews
```
Response: { route: { ...fields, avg_rating, review_count },
           images: [], loops: [], reviews: [ { ...review, user } ],
           nearby: [ 3 nearby routes ] }
Errors: 404, 500
```

### POST /api/routes/[slug]/save
**Auth:** Required | **Purpose:** Toggle save route
```
Response: { saved: boolean }
Errors: 401, 404, 500
```

### GET /api/routes/[slug]/reviews
**Auth:** None | **Purpose:** Get route reviews
```
Response: [ review objects ]
Errors: 500
```

---

## Messages

### GET /api/messages
**Auth:** Required | **Purpose:** List conversations
```
Response: [ { id, listingId, buyerId, sellerId, lastMessageAt, status,
              buyerUnreadCount, sellerUnreadCount, listingTitle, listingSlug,
              listingImage, lastMessage, buyerName, buyerAvatar, sellerName,
              sellerAvatar } ]
Errors: 401, 500
```

### POST /api/messages/start
**Auth:** Required | **Purpose:** Start new conversation
```
Request:  { listingId: UUID, body: string (1-2000 chars) }
Response: { conversationId: string }
Errors: 400 (validation, self-message), 401, 404 (listing), 500
```

### GET /api/messages/[conversationId]
**Auth:** Required | **Purpose:** Get message thread
```
Response: { conversation: {}, messages: [ { id, conversationId, senderId, body,
           isRead, createdAt } ] }
Errors: 401, 404, 500
```

### POST /api/messages/[conversationId]
**Auth:** Required | **Purpose:** Send message
```
Request:  { body: string }
Response: { id, conversationId, senderId, body, isRead, createdAt }
Errors: 400, 401, 404, 500
```

### GET /api/messages/unread-count
**Auth:** Optional | **Purpose:** Unread count
```
Response: { count: number }
```

---

## Boosts & Payments

### GET /api/boosts/packages
**Auth:** None | **Purpose:** List boost packages
```
Response: [ { id, name, priceCents, durationDays, type, isActive, displayOrder } ]
Errors: 500
```

### POST /api/boosts/initiate
**Auth:** Required | **Purpose:** Start boost payment
```
Request:  { packageId (req), listingId?, directoryId?, eventId?, routeId?, newsId? }
          (exactly one target ID required)
Response: { checkoutUrl: string, fields: object, boostId: string }
Errors: 400, 401, 403, 404, 500
```

### POST /api/payments/payfast/itn
**Auth:** None (IP-verified) | **Purpose:** PayFast payment webhook
```
Request:  URL-encoded { payment_status, m_payment_id, custom_str1, pf_payment_id,
          signature, ...PayFast standard fields }
Response: "OK" (text/plain)
Security: IP whitelist + MD5 signature validation
Errors: 400 (signature), 403 (IP), 404 (boost), 500
```

---

## Account

### PATCH /api/account/update
**Auth:** Required | **Purpose:** Update user profile field
```
Request:  { field: 'name'|'province', value: string }
       OR { field: 'password', value: string, currentPassword: string }
Response: { success, [field]: updated_value }
Errors: 400, 401, 500
```

### POST /api/account/avatar
**Auth:** Required | **Purpose:** Upload avatar
```
Request:  FormData { file: File } (max 5MB, jpeg/png/webp)
Response: { avatarUrl: string }
Errors: 400, 401, 500
```

### GET /api/account/my-listing
**Auth:** Required | **Purpose:** Get user's business listing
```
Response: { business object } | null
Errors: 401, 500
```

### GET /api/account/my-events
**Auth:** Required | **Purpose:** Get user's events
```
Response: [ event objects with boost/verification status ]
Errors: 401, 500
```

---

## Admin (All require admin role)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | /api/admin/listings | List all listings (filterable) |
| PATCH | /api/admin/listings/[id] | Update listing status/moderation |
| DELETE | /api/admin/listings/[id] | Remove listing |
| GET | /api/admin/events | List all events |
| PATCH | /api/admin/events/[id] | Update event status |
| GET | /api/admin/directory | List all businesses |
| PATCH | /api/admin/directory/[id] | Update business |
| GET | /api/admin/users | List users |
| PATCH | /api/admin/users/[id] | Update user role |
| GET | /api/admin/verifications | Verification queue |
| PATCH | /api/admin/verifications/[id] | Approve/reject |
| GET | /api/admin/boosts | List all boosts |
| GET/POST | /api/admin/boost-packages | CRUD boost packages |
| GET/POST | /api/admin/settings | Site settings |
| GET/POST | /api/admin/theme | Theme customisation |
| GET | /api/admin/analytics/stats | Analytics dashboard |
| GET | /api/admin/stats | Dashboard overview |
| GET | /api/admin/messages | All messages |
| POST | /api/admin/payfast/verify | Manual payment verify |
| GET | /api/admin/seo-audit | SEO audit |
| GET | /api/admin/routes | Route management |
| POST | /api/admin/routes | Create route |
| PATCH/DELETE | /api/admin/routes/[id] | Edit/remove route |

---

## Cron Jobs

| Endpoint | Purpose |
|----------|---------|
| GET /api/cron/expire-listings | Expire listings past expiresAt |
| GET /api/cron/expire-boosts | Expire boosts past expiresAt |
| GET /api/cron/saved-listing-alerts | Email alerts for saved listings |

---

## Common Error Response Format
```json
{ "error": "Human-readable message" }
```
HTTP status codes: 400 (bad request), 401 (unauthenticated), 403 (forbidden), 404 (not found), 409 (conflict), 500 (server error), 503 (service unavailable)
