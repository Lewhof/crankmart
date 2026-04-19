import {
  pgTable,
  pgEnum,
  uuid,
  varchar,
  char,
  text,
  integer,
  boolean,
  timestamp,
  numeric,
  serial,
  jsonb,
  customType,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core'

// Custom type for PostgreSQL tsvector
const tsvector = customType<{ data: string; driverData: string }>({
  dataType() {
    return 'tsvector'
  },
  toDriver(value: string): string {
    return value
  },
  fromDriver(value: string): string {
    return value
  },
})
import { relations, sql } from 'drizzle-orm'

// Enums (match live DB)
export const conditionEnum = pgEnum('listing_condition', [
  'new',
  'like_new',
  'used',
  'poor',
])

export const listingStatusEnum = pgEnum('listing_status', [
  'draft',
  'active',
  'sold',
  'expired',
  'removed',
  'paused',
])

export const userRoleEnum = pgEnum('user_role', [
  'buyer',
  'seller',
  'shop_owner',
  'organiser',
  'vendor',
  'admin',
  'superadmin',
])

export const sellerTypeEnum = pgEnum('seller_type', [
  'individual',
  'shop',
  'brand',
])

export const moderationStatusEnum = pgEnum('moderation_status', [
  'pending',
  'approved',
  'rejected',
  'flagged',
])

export const kycStatusEnum = pgEnum('kyc_status', [
  'not_submitted',
  'pending',
  'approved',
  'rejected',
])

export const eventTypeEnum = pgEnum('event_type', [
  'race',
  'sportive',
  'fun_ride',
  'social_ride',
  'training_camp',
  'expo',
  'club_event',
  'charity_ride',
])

export const eventStatusEnum = pgEnum('event_status', [
  'draft',
  'pending_review',
  'verified',
  'cancelled',
  'completed',
])

// Users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  emailVerified: boolean('email_verified').default(false),
  passwordHash: varchar('password_hash', { length: 255 }),
  phone: varchar('phone', { length: 20 }),
  name: varchar('name', { length: 255 }).notNull(),
  avatarUrl: varchar('avatar_url', { length: 500 }),
  role: userRoleEnum('role').default('buyer'),
  kycStatus: kycStatusEnum('kyc_status').default('not_submitted'),
  kycDocumentUrl: varchar('kyc_document_url', { length: 500 }),
  country: char('country', { length: 2 }).notNull().default('za'),
  province: varchar('province', { length: 100 }),
  city: varchar('city', { length: 100 }),
  bio: text('bio'),
  handle: varchar('handle', { length: 40 }),
  profileBio: text('profile_bio'),
  profileCity: varchar('profile_city', { length: 100 }),
  profileProvince: varchar('profile_province', { length: 100 }),
  profileShowCity: boolean('profile_show_city').default(false),
  isActive: boolean('is_active').default(true),
  bannedAt: timestamp('banned_at'),
  banReason: text('ban_reason'),
  lastActiveAt: timestamp('last_active_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// Listing categories
export const listingCategories = pgTable('listing_categories', {
  id: serial('id').primaryKey(),
  parentId: integer('parent_id'),
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 100 }).unique().notNull(),
  iconUrl: varchar('icon_url', { length: 200 }),
  displayOrder: integer('display_order').default(0),
  listingCount: integer('listing_count').default(0),
})

// Listings
export const listings = pgTable('listings', {
  id: uuid('id').primaryKey().defaultRandom(),
  sellerId: uuid('seller_id').references(() => users.id).notNull(),
  categoryId: integer('category_id').references(() => listingCategories.id),
  title: varchar('title', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).unique().notNull(),
  description: text('description'),
  bikeMake: varchar('bike_make', { length: 100 }),
  bikeModel: varchar('bike_model', { length: 100 }),
  bikeYear: integer('bike_year'),
  frameSize: varchar('frame_size', { length: 10 }),
  wheelSizeInches: integer('wheel_size_inches'),
  suspensionTravelMm: integer('suspension_travel_mm'),
  frameMaterial: varchar('frame_material', { length: 50 }),
  drivetrainSpeeds: integer('drivetrain_speeds'),
  brakeType: varchar('brake_type', { length: 50 }),
  componentBrands: varchar('component_brands', { length: 255 }),
  serialNumber: varchar('serial_number', { length: 64 }),
  damageNotes: text('damage_notes'),
  tradeConsidered: boolean('trade_considered').default(false),
  originalReceipt: boolean('original_receipt').default(false),
  warrantyRemaining: text('warranty_remaining'),
  recentUpgrades: text('recent_upgrades'),
  postalCode: varchar('postal_code', { length: 10 }),
  colour: varchar('colour', { length: 50 }),
  youtubeUrl: varchar('youtube_url', { length: 500 }),
  condition: conditionEnum('condition').notNull(),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  negotiable: boolean('negotiable').default(true),
  sellerType: sellerTypeEnum('seller_type').default('individual'),
  locationLat: numeric('location_lat', { precision: 10, scale: 7 }),
  locationLng: numeric('location_lng', { precision: 10, scale: 7 }),
  locationAddress: varchar('location_address', { length: 255 }),
  country: char('country', { length: 2 }).notNull().default('za'),
  province: varchar('province', { length: 100 }),
  city: varchar('city', { length: 100 }),
  shippingAvailable: boolean('shipping_available').default(false),
  status: listingStatusEnum('status').default('active'),
  moderationStatus: moderationStatusEnum('moderation_status').default('approved'),
  boostEnabled: boolean('boost_enabled').default(false),
  attributes: jsonb('attributes').$type<Record<string, string | boolean>>().default({}),
  boostExpiresAt: timestamp('boost_expires_at'),
  isFeatured: boolean('is_featured').default(false),
  featuredExpiresAt: timestamp('featured_expires_at'),
  viewsCount: integer('views_count').default(0),
  savesCount: integer('saves_count').default(0),
  enquiryCount: integer('enquiry_count').default(0),
  expiresAt: timestamp('expires_at'),
  renewalEmailSent: boolean('renewal_email_sent').default(false),
  soldAt: timestamp('sold_at'),
  searchVector: tsvector('search_vector'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// Listing images
export const listingImages = pgTable('listing_images', {
  id: uuid('id').primaryKey().defaultRandom(),
  listingId: uuid('listing_id').references(() => listings.id).notNull(),
  imageUrl: varchar('image_url', { length: 500 }).notNull(),
  thumbUrl: varchar('thumb_url', { length: 500 }),
  displayOrder: integer('display_order').default(0),
  isPrimary: boolean('is_primary').default(false),
  uploadedAt: timestamp('uploaded_at').defaultNow(),
})

// Listing saves (favourites)
export const listingSaves = pgTable('listing_saves', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  listingId: uuid('listing_id').references(() => listings.id).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
})

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  listings: many(listings),
  saves: many(listingSaves),
}))

export const listingsRelations = relations(listings, ({ one, many }) => ({
  seller: one(users, {
    fields: [listings.sellerId],
    references: [users.id],
  }),
  category: one(listingCategories, {
    fields: [listings.categoryId],
    references: [listingCategories.id],
  }),
  images: many(listingImages),
  saves: many(listingSaves),
}))

export const listingImagesRelations = relations(listingImages, ({ one }) => ({
  listing: one(listings, {
    fields: [listingImages.listingId],
    references: [listings.id],
  }),
}))

export const listingCategoriesRelations = relations(listingCategories, ({ many }) => ({
  listings: many(listings),
}))

// ─── Boost / Payment tables ──────────────────────────────────────────────

export const boostTypeEnum = pgEnum('boost_type', [
  'bump', 'category_top', 'homepage', 'directory',
])

export const boostStatusEnum = pgEnum('boost_status', [
  'pending', 'active', 'expired', 'failed', 'refunded',
])

export const boostPackages = pgTable('boost_packages', {
  id:           serial('id').primaryKey(),
  type:         boostTypeEnum('type').notNull(),
  name:         varchar('name', { length: 100 }).notNull(),
  description:  text('description'),
  durationDays: integer('duration_days'),
  priceCents:   integer('price_cents').notNull(),
  isActive:     boolean('is_active').default(true),
  displayOrder: integer('display_order').default(0),
  createdAt:    timestamp('created_at').defaultNow(),
})

export const boosts = pgTable('boosts', {
  id:                uuid('id').primaryKey().defaultRandom(),
  userId:            uuid('user_id').references(() => users.id).notNull(),
  packageId:         integer('package_id').references(() => boostPackages.id).notNull(),
  listingId:         uuid('listing_id'),
  directoryId:       uuid('directory_id'),
  status:            boostStatusEnum('status').default('pending'),
  payfastPaymentId:  varchar('payfast_payment_id', { length: 255 }),
  payfastMPaymentId: varchar('payfast_m_payment_id', { length: 255 }),
  amountCents:       integer('amount_cents').notNull(),
  startsAt:          timestamp('starts_at'),
  expiresAt:         timestamp('expires_at'),
  createdAt:         timestamp('created_at').defaultNow(),
  updatedAt:         timestamp('updated_at').defaultNow(),
})

export const boostPackagesRelations = relations(boostPackages, ({ many }) => ({
  boosts: many(boosts),
}))

export const boostsRelations = relations(boosts, ({ one }) => ({
  user:    one(users,         { fields: [boosts.userId],    references: [users.id] }),
  package: one(boostPackages, { fields: [boosts.packageId], references: [boostPackages.id] }),
}))

// ─── Routes ───────────────────────────────────────────────────────────────────

export const routeDisciplineEnum = pgEnum('route_discipline', ['road', 'mtb', 'gravel', 'urban', 'bikepacking'])
export const routeDifficultyEnum = pgEnum('route_difficulty', ['beginner', 'intermediate', 'advanced', 'expert'])
export const routeSurfaceEnum    = pgEnum('route_surface',    ['tarmac', 'gravel', 'singletrack', 'mixed'])
export const routeStatusEnum     = pgEnum('route_status',     ['pending', 'approved', 'rejected'])

export const routes = pgTable('routes', {
  id:              uuid('id').primaryKey().defaultRandom(),
  slug:            varchar('slug', { length: 255 }).unique().notNull(),
  name:            varchar('name', { length: 255 }).notNull(),
  description:     text('description'),
  discipline:      routeDisciplineEnum('discipline').notNull().default('mtb'),
  difficulty:      routeDifficultyEnum('difficulty').notNull().default('intermediate'),
  surface:         routeSurfaceEnum('surface').default('mixed'),
  distanceKm:      numeric('distance_km', { precision: 6, scale: 1 }),
  elevationM:      integer('elevation_m'),
  estTimeMin:      integer('est_time_min'),
  country:         char('country', { length: 2 }).notNull().default('za'),
  province:        varchar('province', { length: 100 }),
  region:          varchar('region', { length: 100 }),
  town:            varchar('town', { length: 100 }),
  lat:             numeric('lat', { precision: 10, scale: 7 }),
  lng:             numeric('lng', { precision: 10, scale: 7 }),
  gpxUrl:          varchar('gpx_url', { length: 500 }),
  heroImageUrl:    varchar('hero_image_url', { length: 500 }),
  facilities:      jsonb('facilities').$type<Record<string, boolean>>().default({}),
  tags:            text('tags').array().default([]),
  websiteUrl:      varchar('website_url', { length: 500 }),
  contactEmail:    varchar('contact_email', { length: 255 }),
  contactPhone:    varchar('contact_phone', { length: 50 }),
  isVerified:      boolean('is_verified').default(false),
  isFeatured:      boolean('is_featured').default(false),
  status:          routeStatusEnum('status').default('approved'),
  avgRating:       numeric('avg_rating', { precision: 3, scale: 2 }).default('0'),
  reviewCount:     integer('review_count').default(0),
  imageCount:      integer('image_count').default(0),
  primaryImageUrl: varchar('primary_image_url', { length: 500 }),
  sourceName:      varchar('source_name', { length: 100 }),
  sourceUrl:       varchar('source_url', { length: 500 }),
  lastScrapedAt:   timestamp('last_scraped_at'),
  submittedBy:     uuid('submitted_by').references(() => users.id),
  viewsCount:      integer('views_count').default(0),
  savesCount:      integer('saves_count').default(0),
  source:          varchar('source', { length: 100 }),
  createdAt:       timestamp('created_at').defaultNow(),
  updatedAt:       timestamp('updated_at').defaultNow(),
})

export const routeImages = pgTable('route_images', {
  id:           uuid('id').primaryKey().defaultRandom(),
  routeId:      uuid('route_id').references(() => routes.id, { onDelete: 'cascade' }).notNull(),
  url:          varchar('url', { length: 500 }).notNull(),
  thumbUrl:     varchar('thumb_url', { length: 500 }),
  mediumUrl:    varchar('medium_url', { length: 500 }),
  altText:      varchar('alt_text', { length: 255 }),
  source:       varchar('source', { length: 100 }).default('scrape'),
  displayOrder: integer('display_order').default(0),
  isPrimary:    boolean('is_primary').default(false),
  width:        integer('width'),
  height:       integer('height'),
  uploadedAt:   timestamp('uploaded_at').defaultNow(),
})

export const routeLoops = pgTable('route_loops', {
  id:           uuid('id').primaryKey().defaultRandom(),
  routeId:      uuid('route_id').references(() => routes.id, { onDelete: 'cascade' }).notNull(),
  name:         varchar('name', { length: 255 }).notNull(),
  distanceKm:   numeric('distance_km', { precision: 6, scale: 1 }),
  difficulty:   routeDifficultyEnum('difficulty').default('intermediate'),
  category:     varchar('category', { length: 20 }).default('green'),
  subtitle:     varchar('subtitle', { length: 100 }),
  description:  text('description'),
  displayOrder: integer('display_order').default(0),
})

export const routeReviews = pgTable('route_reviews', {
  id:             uuid('id').primaryKey().defaultRandom(),
  routeId:        uuid('route_id').references(() => routes.id, { onDelete: 'cascade' }).notNull(),
  userId:         uuid('user_id').references(() => users.id).notNull(),
  rating:         integer('rating').notNull(),
  body:           text('body'),
  conditionsNote: text('conditions_note'),
  riddenAt:       timestamp('ridden_at'),
  createdAt:      timestamp('created_at').defaultNow(),
})

export const routeSaves = pgTable('route_saves', {
  id:        uuid('id').primaryKey().defaultRandom(),
  userId:    uuid('user_id').references(() => users.id).notNull(),
  routeId:   uuid('route_id').references(() => routes.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
})

export const scrapeRuns = pgTable('scrape_runs', {
  id:            uuid('id').primaryKey().defaultRandom(),
  sourceName:    varchar('source_name', { length: 100 }).notNull(),
  startedAt:     timestamp('started_at').defaultNow(),
  finishedAt:    timestamp('finished_at'),
  routesFound:   integer('routes_found').default(0),
  routesAdded:   integer('routes_added').default(0),
  routesUpdated: integer('routes_updated').default(0),
  errors:        jsonb('errors').$type<string[]>().default([]),
  status:        varchar('status', { length: 50 }).default('running'),
})

export const routesRelations = relations(routes, ({ one, many }) => ({
  submitter: one(users, { fields: [routes.submittedBy], references: [users.id] }),
  images:    many(routeImages),
  loops:     many(routeLoops),
  reviews:   many(routeReviews),
  saves:     many(routeSaves),
}))
export const routeImagesRelations  = relations(routeImages,  ({ one }) => ({ route: one(routes, { fields: [routeImages.routeId],  references: [routes.id] }) }))
export const routeLoopsRelations   = relations(routeLoops,   ({ one }) => ({ route: one(routes, { fields: [routeLoops.routeId],   references: [routes.id] }) }))
export const routeReviewsRelations = relations(routeReviews, ({ one }) => ({ route: one(routes, { fields: [routeReviews.routeId], references: [routes.id] }), user: one(users, { fields: [routeReviews.userId], references: [users.id] }) }))
export const routeSavesRelations   = relations(routeSaves,   ({ one }) => ({ route: one(routes, { fields: [routeSaves.routeId],   references: [routes.id] }), user: one(users,  { fields: [routeSaves.userId],  references: [users.id] }) }))

// Events table
export const events = pgTable('events', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).unique().notNull(),
  description: text('description'),
  eventType: eventTypeEnum('event_type').default('race'),
  status: eventStatusEnum('status').default('draft'),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date'),
  country: char('country', { length: 2 }).notNull().default('za'),
  province: varchar('province', { length: 100 }),
  city: varchar('city', { length: 100 }),
  venue: varchar('venue', { length: 255 }),
  distance: varchar('distance', { length: 100 }),
  entryFee: varchar('entry_fee', { length: 100 }),
  entryUrl: varchar('entry_url', { length: 500 }),
  websiteUrl: varchar('website_url', { length: 500 }),
  bannerUrl: varchar('banner_url', { length: 500 }),
  organiserName: varchar('organiser_name', { length: 255 }),
  organiserEmail: varchar('organiser_email', { length: 255 }),
  organiserPhone: varchar('organiser_phone', { length: 50 }),
  isScraped: boolean('is_scraped').default(false),
  scrapeSource: varchar('scrape_source', { length: 100 }),
  isFeatured: boolean('is_featured').default(false),
  submittedBy: uuid('submitted_by'),
  moderationStatus: varchar('moderation_status', { length: 50 }).default('approved'),
  boostTier: varchar('boost_tier', { length: 50 }),
  boostExpiresAt: timestamp('boost_expires_at'),
  organiserUserId: uuid('organiser_user_id').references(() => users.id),
  editToken: varchar('edit_token', { length: 500 }),
  outreachSentAt: timestamp('outreach_sent_at'),
  viewsCount: integer('views_count').default(0),
  savesCount: integer('saves_count').default(0),
  source: varchar('source', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// ─── Business Directory ──────────────────────────────────────────────────────

export const businessTypeEnum = pgEnum('business_type', [
  'shop',
  'brand',
  'service_center',
  'tour_operator',
  'event_organiser',
])

export const businessStatusEnum = pgEnum('business_status', [
  'pending',
  'verified',
  'suspended',
  'claimed',
  'removed',
])

export const businesses = pgTable('businesses', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).unique().notNull(),
  businessType: businessTypeEnum('business_type').default('shop').notNull(),
  description: text('description'),
  country: char('country', { length: 2 }).notNull().default('za'),
  province: varchar('province', { length: 100 }),
  city: varchar('city', { length: 100 }),
  suburb: varchar('suburb', { length: 100 }),
  address: varchar('address', { length: 500 }),
  phone: varchar('phone', { length: 50 }),
  whatsapp: varchar('whatsapp', { length: 50 }),
  email: varchar('email', { length: 255 }),
  website: varchar('website', { length: 500 }),
  brandsStocked: text('brands_stocked').array().default([]),
  services: text('services').array().default([]),
  specialisation: text('specialisation').array().default([]),
  seoTags: text('seo_tags').array().default([]),
  logoUrl: varchar('logo_url', { length: 500 }),
  bannerUrl: varchar('banner_url', { length: 500 }),
  locationLat: numeric('location_lat', { precision: 10, scale: 7 }),
  locationLng: numeric('location_lng', { precision: 10, scale: 7 }),
  status: businessStatusEnum('status').default('pending').notNull(),
  verified: boolean('verified').default(false).notNull(),
  isPremium: boolean('is_premium').default(false).notNull(),
  tier: varchar('tier', { length: 50 }).default('free'),
  boostTier: varchar('boost_tier', { length: 50 }).default('free'),
  boostPosition: integer('boost_position'),
  boostExpiresAt: timestamp('boost_expires_at'),
  autoVerified: boolean('auto_verified').default(false),
  outreachSentAt: timestamp('outreach_sent_at'),
  outreachTouch2At: timestamp('outreach_touch2_at'),
  outreachTouch3At: timestamp('outreach_touch3_at'),
  claimToken: varchar('claim_token', { length: 500 }),
  claimTokenExpiresAt: timestamp('claim_token_expires_at'),
  hours: jsonb('hours').$type<Record<string, unknown>>().default({}),
  contactSource: varchar('contact_source', { length: 100 }),
  consentAt: timestamp('consent_at'),
  viewsCount: integer('views_count').default(0),
  savesCount: integer('saves_count').default(0),
  claimedBy: uuid('claimed_by').references(() => users.id),
  claimedAt: timestamp('claimed_at'),
  verifiedAt: timestamp('verified_at'),
  searchVector: tsvector('search_vector'),
  source: varchar('source', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

export const businessesRelations = relations(businesses, ({ one }) => ({
  owner: one(users, { fields: [businesses.claimedBy], references: [users.id] }),
}))

// ---- Messaging (ported from src/db/migrate-messaging.ts) ----
export const conversations = pgTable('conversations', {
  id: uuid('id').primaryKey().defaultRandom(),
  listingId: uuid('listing_id').notNull(),
  buyerId: uuid('buyer_id').notNull(),
  sellerId: uuid('seller_id').notNull(),
  subject: varchar('subject', { length: 255 }),
  status: varchar('status', { length: 50 }).default('active'),
  buyerUnreadCount: integer('buyer_unread_count').default(0),
  sellerUnreadCount: integer('seller_unread_count').default(0),
  lastMessageAt: timestamp('last_message_at').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
})

export const messages = pgTable('messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  conversationId: uuid('conversation_id').notNull().references(() => conversations.id, { onDelete: 'cascade' }),
  senderId: uuid('sender_id').notNull(),
  body: text('body').notNull(),
  isRead: boolean('is_read').default(false),
  createdAt: timestamp('created_at').defaultNow(),
})

export const conversationsRelations = relations(conversations, ({ one, many }) => ({
  listing: one(listings, { fields: [conversations.listingId], references: [listings.id] }),
  buyer: one(users, { fields: [conversations.buyerId], references: [users.id] }),
  seller: one(users, { fields: [conversations.sellerId], references: [users.id] }),
  messages: many(messages),
}))

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, { fields: [messages.conversationId], references: [conversations.id] }),
  sender: one(users, { fields: [messages.senderId], references: [users.id] }),
}))

// ---- News / Editorial (ported from src/db/migrate-news.ts) ----
export const newsStatusEnum = pgEnum('news_status', [
  'pending',
  'approved',
  'rejected',
  'draft',
])

export const newsArticles = pgTable('news_articles', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  excerpt: text('excerpt'),
  body: text('body').notNull(),
  coverImageUrl: text('cover_image_url'),
  country: char('country', { length: 2 }).notNull().default('za'),
  category: varchar('category', { length: 100 }).default('general'),
  tags: text('tags').array(),
  authorName: varchar('author_name', { length: 150 }),
  authorEmail: varchar('author_email', { length: 255 }),
  authorBio: text('author_bio'),
  sourceUrl: text('source_url'),
  status: newsStatusEnum('status').default('pending'),
  isFeatured: boolean('is_featured').default(false),
  viewsCount: integer('views_count').default(0),
  submittedBy: uuid('submitted_by').references(() => users.id, { onDelete: 'set null' }),
  approvedBy: uuid('approved_by').references(() => users.id, { onDelete: 'set null' }),
  approvedAt: timestamp('approved_at', { withTimezone: true }),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

export const newsArticlesRelations = relations(newsArticles, ({ one }) => ({
  submitter: one(users, { fields: [newsArticles.submittedBy], references: [users.id] }),
  approver: one(users, { fields: [newsArticles.approvedBy], references: [users.id] }),
}))

// ─── Regions (country-scoped provinces / states) ────────────────────────────
export const regions = pgTable(
  'regions',
  {
    id: serial('id').primaryKey(),
    country: char('country', { length: 2 }).notNull(),
    code: varchar('code', { length: 16 }).notNull(),
    name: varchar('name', { length: 100 }).notNull(),
    type: varchar('type', { length: 32 }).notNull(), // 'province' | 'state' | 'county'
    displayOrder: integer('display_order').default(0),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (t) => ({
    countryCodeUniq: uniqueIndex('regions_country_code_uniq').on(t.country, t.code),
    countryIdx: index('regions_country_idx').on(t.country),
  }),
)

// ─── Marketing launch-readiness checklist ──────────────────────────────────
export const marketingChecklistItems = pgTable(
  'marketing_checklist_items',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    section: varchar('section', { length: 32 }).notNull(),
    sectionLabel: varchar('section_label', { length: 120 }).notNull(),
    label: text('label').notNull().unique(),
    description: text('description'),
    sortOrder: integer('sort_order').notNull().default(0),
    isComplete: boolean('is_complete').notNull().default(false),
    completedBy: uuid('completed_by').references(() => users.id, { onDelete: 'set null' }),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    sectionIdx: index('marketing_checklist_section_idx').on(t.section, t.sortOrder),
  }),
)

// ─── Whiteboard — strategic backlog for operators ──────────────────────────
export const whiteboardPriorityEnum = pgEnum('whiteboard_priority', ['urgent','high','medium','low'])
export const whiteboardStatusEnum   = pgEnum('whiteboard_status',   ['backlog','todo','in_progress','done','archived'])
export const whiteboardEffortEnum   = pgEnum('whiteboard_effort',   ['s','m','l','xl'])

export const whiteboardItems = pgTable(
  'whiteboard_items',
  {
    id:          uuid('id').primaryKey().defaultRandom(),
    country:     char('country', { length: 2 }).notNull().default('za'),
    title:       varchar('title',  { length: 200 }).notNull(),
    description: text('description'),
    priority:    whiteboardPriorityEnum('priority').notNull().default('medium'),
    status:      whiteboardStatusEnum('status').notNull().default('backlog'),
    effort:      whiteboardEffortEnum('effort'),
    categories:  text('categories').array().notNull().default(sql`ARRAY[]::text[]`),
    sourceUrl:   text('source_url'),
    owner:       varchar('owner', { length: 100 }),
    createdAt:   timestamp('created_at').notNull().defaultNow(),
    updatedAt:   timestamp('updated_at').notNull().defaultNow(),
  },
  (t) => ({
    countryStatusPriorityIdx: index('whiteboard_country_status_priority_idx').on(t.country, t.status, t.priority),
    countryTitleUniq:         uniqueIndex('whiteboard_country_title_uniq').on(t.country, t.title),
  }),
)

// ─── Page Views — traffic + visitor tracking for admin analytics ───────────
// Geo fields are populated from cf-ipcountry / ip-api lookup at write time
// (see /api/analytics/track). Admin analytics reads via raw SQL in
// /api/admin/analytics/stats; this definition exists so the table has a
// canonical schema source + drizzle-kit sees it on future generate runs.
export const pageViews = pgTable(
  'page_views',
  {
    id:          serial('id').primaryKey(),
    path:        varchar('path',         { length: 500 }).notNull(),
    referrer:    varchar('referrer',     { length: 500 }),
    country:     varchar('country',      { length: 100 }),
    countryCode: varchar('country_code', { length: 10 }),
    city:        varchar('city',         { length: 100 }),
    region:      varchar('region',       { length: 100 }),
    device:      varchar('device',       { length: 20 }),
    browser:     varchar('browser',      { length: 50 }),
    visitorId:   varchar('visitor_id',   { length: 64 }),
    sessionId:   varchar('session_id',   { length: 64 }),
    createdAt:   timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (t) => ({
    pathIdx:        index('idx_pv_path').on(t.path),
    createdIdx:     index('idx_pv_created').on(t.createdAt),
    visitorIdx:     index('idx_pv_visitor').on(t.visitorId),
    sessionIdx:     index('idx_pv_session').on(t.sessionId),
    countryCodeIdx: index('idx_pv_country').on(t.countryCode),
  }),
)

// ─── Social Media — profiles, posts, assets, short-links ───────────────────

export const socialPlatformEnum = pgEnum('social_platform', [
  'instagram',
  'facebook',
  'tiktok',
  'youtube',
  'twitter',
  'linkedin',
  'threads',
  'pinterest',
  'bluesky',
  'strava',
])

export const socialPostStatusEnum = pgEnum('social_post_status', [
  'draft',
  'scheduled',
  'published',
  'failed',
  'archived',
])

export const socialAssetRightsEnum = pgEnum('social_asset_rights', [
  'owned',
  'ugc_pending',
  'ugc_approved',
  'licensed',
  'unknown',
])

export const socialProfiles = pgTable(
  'social_profiles',
  {
    id:              uuid('id').primaryKey().defaultRandom(),
    platform:        socialPlatformEnum('platform').notNull(),
    handle:          varchar('handle', { length: 120 }).notNull(),
    url:             varchar('url', { length: 500 }).notNull(),
    country:         char('country', { length: 2 }).notNull().default('za'),
    displayInFooter: boolean('display_in_footer').notNull().default(true),
    isActive:        boolean('is_active').notNull().default(true),
    sortOrder:       integer('sort_order').notNull().default(0),
    createdAt:       timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt:       timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    platformCountryIdx: uniqueIndex('social_profiles_platform_country_uniq').on(t.platform, t.country),
    countryActiveIdx:   index('social_profiles_country_active_idx').on(t.country, t.isActive),
  }),
)

export const socialAssets = pgTable(
  'social_assets',
  {
    id:            uuid('id').primaryKey().defaultRandom(),
    url:           varchar('url', { length: 500 }).notNull(),
    thumbUrl:      varchar('thumb_url', { length: 500 }),
    mime:          varchar('mime', { length: 50 }),
    width:         integer('width'),
    height:        integer('height'),
    sizeBytes:     integer('size_bytes'),
    title:         varchar('title', { length: 255 }),
    altText:       varchar('alt_text', { length: 500 }),
    tags:          text('tags').array().notNull().default(sql`ARRAY[]::text[]`),
    rightsStatus:  socialAssetRightsEnum('rights_status').notNull().default('owned'),
    rightsNote:    text('rights_note'),
    uploadedBy:    uuid('uploaded_by').references(() => users.id, { onDelete: 'set null' }),
    createdAt:     timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt:     timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    createdIdx:   index('social_assets_created_idx').on(t.createdAt),
    rightsIdx:    index('social_assets_rights_idx').on(t.rightsStatus),
  }),
)

export const socialPosts = pgTable(
  'social_posts',
  {
    id:               uuid('id').primaryKey().defaultRandom(),
    authorId:         uuid('author_id').references(() => users.id, { onDelete: 'set null' }),
    country:          char('country', { length: 2 }).notNull().default('za'),
    status:           socialPostStatusEnum('status').notNull().default('draft'),
    platforms:        text('platforms').array().notNull().default(sql`ARRAY[]::text[]`),
    title:            varchar('title', { length: 255 }),
    body:             text('body').notNull().default(''),
    assetIds:         uuid('asset_ids').array().notNull().default(sql`ARRAY[]::uuid[]`),
    linkedListingId:  uuid('linked_listing_id').references(() => listings.id, { onDelete: 'set null' }),
    linkedEventId:    uuid('linked_event_id').references(() => events.id, { onDelete: 'set null' }),
    linkedRouteId:    uuid('linked_route_id').references(() => routes.id, { onDelete: 'set null' }),
    linkedBusinessId: uuid('linked_business_id').references(() => businesses.id, { onDelete: 'set null' }),
    utmCampaign:      varchar('utm_campaign', { length: 120 }),
    scheduledAt:      timestamp('scheduled_at', { withTimezone: true }),
    publishedAt:      timestamp('published_at', { withTimezone: true }),
    errorLog:         text('error_log'),
    createdAt:        timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt:        timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    statusScheduledIdx: index('social_posts_status_scheduled_idx').on(t.status, t.scheduledAt),
    countryIdx:         index('social_posts_country_idx').on(t.country),
    authorIdx:          index('social_posts_author_idx').on(t.authorId),
  }),
)

export const socialMetrics = pgTable(
  'social_metrics',
  {
    id:            uuid('id').primaryKey().defaultRandom(),
    postId:        uuid('post_id').notNull().references(() => socialPosts.id, { onDelete: 'cascade' }),
    platform:      socialPlatformEnum('platform').notNull(),
    impressions:   integer('impressions').default(0),
    clicks:        integer('clicks').default(0),
    engagements:   integer('engagements').default(0),
    capturedAt:    timestamp('captured_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    postPlatformIdx: index('social_metrics_post_platform_idx').on(t.postId, t.platform),
  }),
)

export const shortLinks = pgTable(
  'short_links',
  {
    id:          uuid('id').primaryKey().defaultRandom(),
    slug:        varchar('slug', { length: 40 }).notNull().unique(),
    destination: varchar('destination', { length: 1000 }).notNull(),
    utmSource:   varchar('utm_source', { length: 60 }),
    utmMedium:   varchar('utm_medium', { length: 60 }),
    utmCampaign: varchar('utm_campaign', { length: 120 }),
    utmContent:  varchar('utm_content', { length: 120 }),
    clicks:      integer('clicks').notNull().default(0),
    postId:      uuid('post_id').references(() => socialPosts.id, { onDelete: 'set null' }),
    createdBy:   uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
    expiresAt:   timestamp('expires_at', { withTimezone: true }),
    createdAt:   timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    slugIdx: uniqueIndex('short_links_slug_uniq').on(t.slug),
  }),
)

export const socialPostsRelations = relations(socialPosts, ({ one, many }) => ({
  author:    one(users,      { fields: [socialPosts.authorId],         references: [users.id] }),
  listing:   one(listings,   { fields: [socialPosts.linkedListingId],  references: [listings.id] }),
  event:     one(events,     { fields: [socialPosts.linkedEventId],    references: [events.id] }),
  route:     one(routes,     { fields: [socialPosts.linkedRouteId],    references: [routes.id] }),
  business:  one(businesses, { fields: [socialPosts.linkedBusinessId], references: [businesses.id] }),
  metrics:   many(socialMetrics),
}))

export const socialMetricsRelations = relations(socialMetrics, ({ one }) => ({
  post: one(socialPosts, { fields: [socialMetrics.postId], references: [socialPosts.id] }),
}))

export const shortLinksRelations = relations(shortLinks, ({ one }) => ({
  post:    one(socialPosts, { fields: [shortLinks.postId],    references: [socialPosts.id] }),
  creator: one(users,       { fields: [shortLinks.createdBy], references: [users.id] }),
}))
