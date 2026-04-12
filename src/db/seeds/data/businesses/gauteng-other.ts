import type { RegionFile, BusinessSeed } from '../../types'

export const gautengOtherBusinesses: RegionFile<BusinessSeed> = {
  region: 'gauteng-other',
  rows: [
    {
      name: "Luxliner Route 66",
      slug: "luxliner-route-66",
      businessType: "event_organiser",
      description: "A unique multi-day MTB and gravel experience in the Magaliesberg, Gauteng, based at the stunning Mount Grace Hotel & Spa. Combines premium lodge accommodation with 2 or 3 days of riding through the Magalies mountains. 45–155km options. Luxury meets adventure — a bucket-list Gauteng cycling experience.",
      province: "Gauteng",
      city: "Magaliesburg",
      suburb: null,
      address: null,
      phone: null,
      whatsapp: null,
      email: null,
      website: "https://events.myactive.co.za",
      brandsStocked: [],
      services: ["events"],
      specialisation: ["MTB", "gravel", "adventure"],
      seoTags: [],
      logoUrl: null,
      bannerUrl: null,
      locationLat: null,
      locationLng: null,
      status: "verified",
      verified: true,
      isPremium: false,
      tier: "free",
    },
  ],
}
