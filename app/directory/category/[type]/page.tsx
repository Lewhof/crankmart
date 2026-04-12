import { Metadata } from "next";
import Link from "next/link";
import { db } from "@/db";
import { businesses as businessesTable } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

const CATEGORY_DISPLAY_NAMES: Record<string, string> = {
  "bike-shops": "Bike Shops",
  "online-retailers": "Online Retailers",
  "brands": "Bike Brands & Distributors",
  "mechanics": "Mechanics & Workshops",
  "coaches": "Cycling Coaches",
  "event-organisers": "Event Organisers",
  "bike-hire": "Bike Hire & Tours",
};

const CATEGORY_TYPES: Record<string, string> = {
  "bike-shops": "shop",
  "online-retailers": "shop",
  "brands": "brand",
  "mechanics": "service_center",
  "coaches": "service_center",
  "event-organisers": "event_organiser",
  "bike-hire": "tour_operator",
};

const VALID_CATEGORIES = [
  "bike-shops",
  "online-retailers",
  "brands",
  "mechanics",
  "coaches",
  "event-organisers",
  "bike-hire",
];

type Props = {
  params: Promise<{ type: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { type } = await params;
  const displayName = CATEGORY_DISPLAY_NAMES[type] || type;

  return {
    title: `${displayName} | CycleMart Directory`,
    description: `Browse ${displayName.toLowerCase()} in South Africa. Find verified cycling businesses on CycleMart's directory.`,
    openGraph: {
      title: `${displayName}`,
      description: `Discover ${displayName.toLowerCase()} across South Africa.`,
      url: `https://cyclemart.co.za/directory/category/${type}`,
      siteName: "CycleMart",
      type: "website",
    },
    alternates: {
      canonical: `https://cyclemart.co.za/directory/category/${type}`,
    },
  };
}

async function getBusinessesByCategory(type: string) {
  const businessType = CATEGORY_TYPES[type];
  if (!businessType) return [];

  try {
    const results = await db
      .select()
      .from(businessesTable)
      .where(
        sql`${businessesTable.businessType} = ${businessType} AND ${businessesTable.verified} = true`
      )
      .limit(500);
    return results;
  } catch (error) {
    console.error(`Error fetching businesses for category ${type}:`, error);
    return [];
  }
}

export default async function CategoryPage({ params }: Props) {
  const { type } = await params;

  // Only allow valid category slugs
  if (!VALID_CATEGORIES.includes(type)) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold mb-4">Category Not Found</h1>
        <p className="text-gray-600 mb-8">
          The category you're looking for is not available.
        </p>
        <Link
          href="/directory"
          className="inline-block bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          Browse All Categories
        </Link>
      </div>
    );
  }

  const displayName = CATEGORY_DISPLAY_NAMES[type];
  const businesses = await getBusinessesByCategory(type);

  // JSON-LD Breadcrumb Schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://cyclemart.co.za",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Directory",
        item: "https://cyclemart.co.za/directory",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: displayName,
        item: `https://cyclemart.co.za/directory/category/${type}`,
      },
    ],
  };

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Breadcrumb Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Header */}
      <div className="mb-12">
        <nav className="text-sm text-gray-600 mb-4">
          <Link href="/" className="hover:text-blue-600">
            Home
          </Link>
          {" > "}
          <Link href="/directory" className="hover:text-blue-600">
            Directory
          </Link>
          {" > "}
          <span>{displayName}</span>
        </nav>

        <h1 className="text-4xl font-bold mb-4">{displayName}</h1>
        <p className="text-xl text-gray-600">
          Find verified {displayName.toLowerCase()} across South Africa on CycleMart.
        </p>
      </div>

      {/* Business Grid */}
      {businesses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {businesses.map((business) => (
            <Link
              key={business.id}
              href={`/directory/${business.slug}`}
              className="block p-6 border border-gray-200 rounded-lg hover:shadow-lg hover:border-blue-300 transition-all"
            >
              {business.logoUrl && (
                <img
                  src={business.logoUrl}
                  alt={business.name}
                  className="h-16 w-16 object-cover rounded mb-4"
                />
              )}
              <h3 className="text-lg font-semibold mb-2">{business.name}</h3>
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {business.description}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 text-sm">{business.city}</span>
                {business.verified && (
                  <span className="text-green-600 text-sm font-medium">✓ Verified</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg mb-6">
            No verified {displayName.toLowerCase()} found yet.
          </p>
          <Link
            href="/directory"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Browse All Businesses
          </Link>
        </div>
      )}
    </div>
  );
}
