"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Business {
  id: string;
  name: string;
  slug: string;
  type: string;
  province: string;
  city: string;
  address: string;
  location: { lat: number; lng: number };
  logo: string;
  banner: string;
  description: string;
  website: string;
  email: string;
  phone: string;
  whatsapp: string;
  brands: string[];
  services: string[];
  verified: boolean;
  featured: boolean;
  rating: number;
  reviews: number;
  views: number;
  createdAt: string;
}

interface RelatedBusiness {
  id: string;
  name: string;
  slug: string;
  type: string;
  city: string;
  logo: string;
  description: string;
  verified: boolean;
  featured: boolean;
}

interface DetailResponse {
  success: boolean;
  data: Business;
  related: RelatedBusiness[];
}

const BUSINESS_TYPES: Record<string, string> = {
  shop: "Bike Shop",
  brand: "Brand/Importer",
  service_center: "Workshop",
  tour_operator: "Tour Operator",
  event_organiser: "Event Organiser",
};

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export default function BusinessDetailPage({ params }: { params: { slug: string } }) {
  const [business, setBusiness] = useState<Business | null>(null);
  const [related, setRelated] = useState<RelatedBusiness[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        const response = await fetch(`/api/directory/${params.slug}`);
        const data: DetailResponse = await response.json();

        if (data.success) {
          setBusiness(data.data);
          setRelated(data.related);
        }
      } catch (error) {
        console.error("Failed to fetch business:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBusiness();
  }, [params.slug]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (!business) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <h1>Business Not Found</h1>
          <Link href="/directory" style={{ color: "#0D1B2A", textDecoration: "none" }}>
            ← Back to Directory
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
      {/* Banner */}
      <div
        style={{
          height: "300px",
          backgroundColor: business.banner ? "white" : "linear-gradient(135deg, #0D1B2A 0%, #1a1a1a 100%)",
          backgroundImage: business.banner ? `url(${business.banner})` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
          position: "relative",
        }}
      >
        {!business.banner && <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.1)" }} />}
      </div>

      {/* Header */}
      <div style={{ padding: "40px 20px", backgroundColor: "white", borderBottom: "1px solid #e0e0e0" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <div style={{ display: "flex", gap: "24px", alignItems: "flex-start" }}>
            {/* Logo */}
            <div
              style={{
                flex: "0 0 120px",
                height: "120px",
                backgroundColor: "#f0f0f0",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginTop: "-80px",
                border: "4px solid white",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            >
              {business.logo ? (
                <img src={business.logo} alt={business.name} style={{ maxHeight: "100px" }} />
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    backgroundColor: "#0D1B2A",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "40px",
                    fontWeight: "bold",
                    borderRadius: "4px",
                  }}
                >
                  {getInitials(business.name)}
                </div>
              )}
            </div>

            {/* Info */}
            <div style={{ flex: 1, marginTop: "-50px", paddingTop: "0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                <h1 style={{ fontSize: "32px", fontWeight: "bold", margin: 0 }}>{business.name}</h1>
                {business.verified && (
                  <span
                    style={{
                      backgroundColor: "#0D1B2A",
                      color: "white",
                      padding: "6px 12px",
                      borderRadius: "4px",
                      fontSize: "12px",
                      fontWeight: "600",
                    }}
                  >
                    ✓ Verified
                  </span>
                )}
                {business.featured && (
                  <span
                    style={{
                      backgroundColor: "#FFB81C",
                      color: "#1a1a1a",
                      padding: "6px 12px",
                      borderRadius: "4px",
                      fontSize: "12px",
                      fontWeight: "600",
                    }}
                  >
                    ★ Featured
                  </span>
                )}
              </div>

              <p style={{ fontSize: "16px", color: "#666", marginBottom: "8px" }}>
                {BUSINESS_TYPES[business.type]} • {business.city}, {business.province}
              </p>

              {business.rating > 0 && (
                <p style={{ fontSize: "14px", color: "#888" }}>
                  ⭐ {business.rating.toFixed(1)} ({business.reviews} reviews) • 👁️ {business.views} views
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Contact Strip */}
      <div style={{ padding: "20px", backgroundColor: "white", borderBottom: "1px solid #e0e0e0", marginTop: "20px" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto", display: "flex", gap: "24px", flexWrap: "wrap" }}>
          {business.phone && (
            <a
              href={`tel:${business.phone}`}
              style={{
                textDecoration: "none",
                color: "#0D1B2A",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              📞 {business.phone}
            </a>
          )}
          {business.email && (
            <a
              href={`mailto:${business.email}`}
              style={{
                textDecoration: "none",
                color: "#0D1B2A",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              ✉️ {business.email}
            </a>
          )}
          {business.website && (
            <a
              href={business.website}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                textDecoration: "none",
                color: "#0D1B2A",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              🌐 Website
            </a>
          )}
          {business.whatsapp && (
            <a
              href={`https://wa.me/${business.whatsapp.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                textDecoration: "none",
                color: "#0D1B2A",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              💬 WhatsApp
            </a>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div style={{ padding: "40px 20px" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 300px", gap: "40px" }}>
          {/* Left Column */}
          <div>
            {/* About */}
            {business.description && (
              <section style={{ marginBottom: "40px" }}>
                <h2 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "16px" }}>About</h2>
                <p style={{ fontSize: "14px", lineHeight: "1.6", color: "#666" }}>{business.description}</p>
              </section>
            )}

            {/* Services */}
            {business.services && business.services.length > 0 && (
              <section style={{ marginBottom: "40px" }}>
                <h2 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "16px" }}>Services</h2>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {business.services.map((service, idx) => (
                    <span
                      key={idx}
                      style={{
                        backgroundColor: "#f0f0f0",
                        padding: "8px 12px",
                        borderRadius: "6px",
                        fontSize: "14px",
                        fontWeight: "500",
                        color: "#0D1B2A",
                      }}
                    >
                      {service}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Brands Stocked */}
            {business.brands && business.brands.length > 0 && (
              <section style={{ marginBottom: "40px" }}>
                <h2 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "16px" }}>Brands Stocked</h2>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {business.brands.map((brand, idx) => (
                    <span
                      key={idx}
                      style={{
                        backgroundColor: "#0D1B2A",
                        color: "white",
                        padding: "8px 12px",
                        borderRadius: "6px",
                        fontSize: "14px",
                        fontWeight: "500",
                      }}
                    >
                      {brand}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Location */}
            {business.address && (
              <section>
                <h2 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "16px" }}>Location</h2>
                <p style={{ fontSize: "14px", color: "#666", lineHeight: "1.6" }}>
                  {business.address}
                  <br />
                  {business.city}, {business.province}
                </p>
              </section>
            )}
          </div>

          {/* Right Sidebar */}
          <div>
            {/* CTA Buttons */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "32px" }}>
              {business.website && (
                <a
                  href={business.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "block",
                    backgroundColor: "#0D1B2A",
                    color: "white",
                    padding: "12px 16px",
                    borderRadius: "8px",
                    textAlign: "center",
                    textDecoration: "none",
                    fontWeight: "600",
                    fontSize: "14px",
                  }}
                >
                  Visit Website
                </a>
              )}
              {business.email && (
                <a
                  href={`mailto:${business.email}`}
                  style={{
                    display: "block",
                    backgroundColor: "white",
                    color: "#0D1B2A",
                    padding: "12px 16px",
                    borderRadius: "8px",
                    textAlign: "center",
                    textDecoration: "none",
                    fontWeight: "600",
                    fontSize: "14px",
                    border: "2px solid #0D1B2A",
                  }}
                >
                  Send Email
                </a>
              )}
            </div>

            {/* Info Box */}
            <div style={{ backgroundColor: "white", padding: "20px", borderRadius: "8px", border: "1px solid #e0e0e0" }}>
              <p style={{ fontSize: "12px", color: "#999", marginBottom: "12px" }}>
                <strong>Type:</strong> {BUSINESS_TYPES[business.type]}
              </p>
              {business.phone && (
                <p style={{ fontSize: "12px", color: "#999", marginBottom: "12px" }}>
                  <strong>Phone:</strong> {business.phone}
                </p>
              )}
              <p style={{ fontSize: "12px", color: "#999" }}>
                <strong>Listed:</strong> {new Date(business.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Related Businesses */}
      {related.length > 0 && (
        <section style={{ padding: "40px 20px", backgroundColor: "white", marginTop: "40px", borderTop: "1px solid #e0e0e0" }}>
          <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
            <h2 style={{ fontSize: "24px", fontWeight: "600", marginBottom: "24px" }}>Similar Businesses</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "20px" }}>
              {related.map((biz) => (
                <Link key={biz.id} href={`/directory/${biz.slug}`}>
                  <div
                    style={{
                      backgroundColor: "#f5f5f5",
                      borderRadius: "8px",
                      padding: "16px",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      textDecoration: "none",
                      color: "inherit",
                      display: "block",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.backgroundColor = "#f0f0f0";
                      (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.backgroundColor = "#f5f5f5";
                      (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                    }}
                  >
                    <h3 style={{ fontSize: "14px", fontWeight: "600", marginBottom: "8px" }}>{biz.name}</h3>
                    <p style={{ fontSize: "12px", color: "#666", marginBottom: "4px" }}>{biz.city}</p>
                    {biz.verified && <p style={{ fontSize: "11px", color: "#0D1B2A" }}>✓ Verified</p>}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
