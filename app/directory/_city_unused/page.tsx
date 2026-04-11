import { Metadata } from "next";
import Link from "next/link";
import { db } from "@/db";
import { businesses as businessesTable } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

const CITY_DISPLAY_NAMES: Record<string, string> = {
  "cape-town": "Cape Town",
  "johannesburg": "Johannesburg",
  "durban": "Durban",
  "pretoria": "Pretoria",
  "stellenbosch": "Stellenbosch",
  "port-elizabeth": "Port Elizabeth",
};

const VALID_CITIES = [
  "cape-town",
  "johannesburg",
  "durban",
  "pretoria",
  "stellenbosch",
  "port-elizabeth",
];

type Props = {
  params: Promise<{ city: string }>;
  searchParams: Promise<Record<string, string>>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city } = await params;
  const displayName = CITY_DISPLAY_NAMES[city] || city;

  return {
    title: `Cycling Businesses in ${displayName} | CycleMart Directory`,
    description: `Find bike shops, cycling coaches, event organisers, and bike hire services in ${displayName}. Browse our complete directory of cycling businesses.`,
    openGraph: {
      title: `Cycling Businesses in ${displayName}`,
      description: `Discover cycling businesses in ${displayName} - shops, mechanics, coaches, and more.`,
      url: `https://cyclemart.co.za/directory/${city}`,
      siteName: "CycleMart",
      type: "website",
    },
    alternates: {
      canonical: `https://cyclemart.co.za/directory/${city}`,
    },
  };
}

async function getBusinessesByCity(city: string) {
  const cityName = CITY_DISPLAY_NAMES[city] || city;
  try {
    const results = await db
      .select()
      .from(businessesTable)
      .where(
        sql`LOWER(${businessesTable.city}) = LOWER(${cityName}) AND ${businessesTable.verified} = true`
      )
      .limit(100);
    return results;
  } catch (error) {
    console.error(`Error fetching businesses for city ${city}:`, error);
    return [];
  }
}

export default async function CityPage({ params, searchParams }: Props) {
  const { city } = await params;

  // Only allow valid city slugs
  if (!VALID_CITIES.includes(city)) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold mb-4">City Not Found</h1>
        <p className="text-gray-600 mb-8">
          The city you're looking for is not available yet.
        </p>
        <Link
          href="/directory"
          className="inline-block bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          Browse All Cities
        </Link>
      </div>
    );
  }

  const displayName = CITY_DISPLAY_NAMES[city];
  const businesses = await getBusinessesByCity(city);

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
        item: `https://cyclemart.co.za/directory/${city}`,
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

        <h1 className="text-4xl font-bold mb-4">Cycling Businesses in {displayName}</h1>
        <p className="text-xl text-gray-600">
          Discover bike shops, mechanics, coaches, event organisers, and more in{" "}
          {displayName}.
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
                <span className="inline-block bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full">
                  {business.businessType.replace("_", " ")}
                </span>
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
            No verified cycling businesses found in {displayName} yet.
          </p>
          <Link
            href="/directory"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Browse Other Cities
          </Link>
        </div>
      )}
    </div>
  );
}
