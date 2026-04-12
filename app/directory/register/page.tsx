"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

const BUSINESS_TYPES = [
  { value: "shop", label: "Bike Shop" },
  { value: "brand", label: "Brand / Importer" },
  { value: "service_center", label: "Workshop / Service Center" },
  { value: "tour_operator", label: "Tour Operator / Bike Hire" },
  { value: "event_organiser", label: "Event Organiser" },
];

const PROVINCES = [
  "Western Cape",
  "Gauteng",
  "KwaZulu-Natal",
  "Eastern Cape",
  "Free State",
  "Limpopo",
  "Mpumalanga",
  "Northern Cape",
  "North West",
];

const SERVICES = [
  "Bike Sales",
  "Repairs",
  "Fitting",
  "Wheel Truing",
  "Custom Builds",
  "Rental",
  "Coaching",
  "Tours",
];

export default function RegisterPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [mode, setMode] = useState<"choose" | "self" | "concierge">("choose");
  const [loading, setLoading] = useState(false);

  if (!session?.user) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f5f5f5",
          padding: "20px",
        }}
      >
        <div style={{ textAlign: "center", maxWidth: "500px" }}>
          <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "16px" }}>Sign In Required</h1>
          <p style={{ color: "#666", marginBottom: "24px" }}>
            Please sign in to create or manage your business listing.
          </p>
          <Link
            href="/login"
            style={{
              display: "inline-block",
              backgroundColor: "#0D1B2A",
              color: "white",
              padding: "12px 24px",
              borderRadius: "2px",
              textDecoration: "none",
              fontWeight: "600",
            }}
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  const handleSelfServeSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      mode: "self",
      name: formData.get("name"),
      business_type: formData.get("business_type"),
      province: formData.get("province"),
      city: formData.get("city"),
      address: formData.get("address"),
      phone: formData.get("phone"),
      description: formData.get("description"),
    };

    try {
      const response = await fetch("/api/directory/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (result.success) {
        alert("Business listing created! Redirecting...");
        router.push(`/directory/${result.data.slug}`);
      } else {
        alert("Error: " + result.error);
      }
    } catch (error) {
      alert("Failed to create listing");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleConciergeSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      mode: "concierge",
      name: formData.get("name"),
      website_url: formData.get("website_url"),
      contact_email: formData.get("contact_email"),
    };

    try {
      const response = await fetch("/api/directory/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (result.success) {
        alert("Concierge request submitted! We'll build your page soon.");
        router.push("/directory");
      } else {
        alert("Error: " + result.error);
      }
    } catch (error) {
      alert("Failed to submit request");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f5f5f5", padding: "40px 20px" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <Link href="/directory" style={{ color: "#0D1B2A", textDecoration: "none", marginBottom: "32px", display: "block" }}>
          ← Back to Directory
        </Link>

        <h1 style={{ fontSize: "32px", fontWeight: "bold", marginBottom: "32px", textAlign: "center" }}>
          Add Your Business to CycleMart
        </h1>

        {mode === "choose" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px", maxWidth: "800px", margin: "0 auto" }}>
            {/* Self-Serve Option */}
            <div
              style={{
                backgroundColor: "white",
                padding: "32px",
                borderRadius: "2px",
                border: "1px solid #e0e0e0",
                cursor: "pointer",
                transition: "all 0.3s",
              }}
              onClick={() => setMode("self")}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 24px rgba(0,0,0,0.1)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
              }}
            >
              <h2 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "16px" }}>Create Your Own Listing</h2>
              <p style={{ color: "#666", marginBottom: "16px", lineHeight: "1.6" }}>
                Fill out your business details yourself and instantly publish your page. Perfect for businesses that want full control.
              </p>
              <ul style={{ fontSize: "14px", color: "#666", paddingLeft: "20px", marginBottom: "16px" }}>
                <li>Complete control over content</li>
                <li>Instant publication</li>
                <li>Edit anytime</li>
              </ul>
              <button
                style={{
                  backgroundColor: "#0D1B2A",
                  color: "white",
                  border: "none",
                  padding: "12px 24px",
                  borderRadius: "2px",
                  cursor: "pointer",
                  fontWeight: "600",
                  width: "100%",
                }}
              >
                Get Started →
              </button>
            </div>

            {/* Concierge Option */}
            <div
              style={{
                backgroundColor: "white",
                padding: "32px",
                borderRadius: "2px",
                border: "2px solid #FFB81C",
                cursor: "pointer",
                transition: "all 0.3s",
                position: "relative",
              }}
              onClick={() => setMode("concierge")}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 24px rgba(255, 184, 28, 0.2)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: "-12px",
                  right: "16px",
                  backgroundColor: "#FFB81C",
                  color: "#1a1a1a",
                  padding: "4px 12px",
                  borderRadius: "2px",
                  fontSize: "12px",
                  fontWeight: "600",
                }}
              >
                ✨ POPULAR
              </div>
              <h2 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "16px" }}>Request a Page (Concierge)</h2>
              <p style={{ color: "#666", marginBottom: "16px", lineHeight: "1.6" }}>
                Give us your business website, and we'll build your professional page for you. Hands-off and beautiful.
              </p>
              <ul style={{ fontSize: "14px", color: "#666", paddingLeft: "20px", marginBottom: "16px" }}>
                <li>We build your page</li>
                <li>Professional content extraction</li>
                <li>Zero effort required</li>
              </ul>
              <button
                style={{
                  backgroundColor: "#FFB81C",
                  color: "#1a1a1a",
                  border: "none",
                  padding: "12px 24px",
                  borderRadius: "2px",
                  cursor: "pointer",
                  fontWeight: "600",
                  width: "100%",
                }}
              >
                Request Page →
              </button>
            </div>
          </div>
        )}

        {mode === "self" && (
          <div style={{ backgroundColor: "white", padding: "32px", borderRadius: "2px", maxWidth: "600px", margin: "0 auto" }}>
            <h2 style={{ fontSize: "24px", fontWeight: "600", marginBottom: "24px" }}>Create Your Business Listing</h2>

            <form onSubmit={handleSelfServeSubmit}>
              <div style={{ marginBottom: "24px" }}>
                <label style={{ display: "block", fontWeight: "600", marginBottom: "8px" }}>
                  Business Name *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #ccc",
                    borderRadius: "2px",
                    fontSize: "14px",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ marginBottom: "24px" }}>
                <label style={{ display: "block", fontWeight: "600", marginBottom: "8px" }}>
                  Business Type *
                </label>
                <select
                  name="business_type"
                  required
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #ccc",
                    borderRadius: "2px",
                    fontSize: "14px",
                    cursor: "pointer",
                  }}
                >
                  <option value="">Select a type</option>
                  {BUSINESS_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
                <div>
                  <label style={{ display: "block", fontWeight: "600", marginBottom: "8px" }}>
                    Province *
                  </label>
                  <select
                    name="province"
                    required
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: "1px solid #ccc",
                      borderRadius: "2px",
                      fontSize: "14px",
                      cursor: "pointer",
                    }}
                  >
                    <option value="">Select province</option>
                    {PROVINCES.map((prov) => (
                      <option key={prov} value={prov}>
                        {prov}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontWeight: "600", marginBottom: "8px" }}>
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    required
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: "1px solid #ccc",
                      borderRadius: "2px",
                      fontSize: "14px",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: "24px" }}>
                <label style={{ display: "block", fontWeight: "600", marginBottom: "8px" }}>
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #ccc",
                    borderRadius: "2px",
                    fontSize: "14px",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ marginBottom: "24px" }}>
                <label style={{ display: "block", fontWeight: "600", marginBottom: "8px" }}>
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #ccc",
                    borderRadius: "2px",
                    fontSize: "14px",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ marginBottom: "24px" }}>
                <label style={{ display: "block", fontWeight: "600", marginBottom: "8px" }}>
                  Description
                </label>
                <textarea
                  name="description"
                  rows={4}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #ccc",
                    borderRadius: "2px",
                    fontSize: "14px",
                    boxSizing: "border-box",
                    fontFamily: "inherit",
                  }}
                />
              </div>

              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  type="button"
                  onClick={() => setMode("choose")}
                  style={{
                    flex: 1,
                    padding: "12px 16px",
                    backgroundColor: "transparent",
                    border: "1px solid #ccc",
                    borderRadius: "2px",
                    cursor: "pointer",
                    fontWeight: "600",
                  }}
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    flex: 1,
                    padding: "12px 16px",
                    backgroundColor: "#0D1B2A",
                    color: "white",
                    border: "none",
                    borderRadius: "2px",
                    cursor: loading ? "not-allowed" : "pointer",
                    fontWeight: "600",
                    opacity: loading ? 0.7 : 1,
                  }}
                >
                  {loading ? "Creating..." : "Create Listing"}
                </button>
              </div>
            </form>
          </div>
        )}

        {mode === "concierge" && (
          <div style={{ backgroundColor: "white", padding: "32px", borderRadius: "2px", maxWidth: "600px", margin: "0 auto" }}>
            <h2 style={{ fontSize: "24px", fontWeight: "600", marginBottom: "24px" }}>Request a Professional Page</h2>

            <form onSubmit={handleConciergeSubmit}>
              <div style={{ marginBottom: "24px" }}>
                <label style={{ display: "block", fontWeight: "600", marginBottom: "8px" }}>
                  Business Name *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #ccc",
                    borderRadius: "2px",
                    fontSize: "14px",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ marginBottom: "24px" }}>
                <label style={{ display: "block", fontWeight: "600", marginBottom: "8px" }}>
                  Website URL *
                </label>
                <input
                  type="url"
                  name="website_url"
                  required
                  placeholder="https://example.com"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #ccc",
                    borderRadius: "2px",
                    fontSize: "14px",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ marginBottom: "24px" }}>
                <label style={{ display: "block", fontWeight: "600", marginBottom: "8px" }}>
                  Your Email *
                </label>
                <input
                  type="email"
                  name="contact_email"
                  required
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #ccc",
                    borderRadius: "2px",
                    fontSize: "14px",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <p style={{ fontSize: "12px", color: "#666", marginBottom: "24px", fontStyle: "italic" }}>
                We'll extract your business info from your website and build a professional directory page. We'll contact you when it's ready!
              </p>

              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  type="button"
                  onClick={() => setMode("choose")}
                  style={{
                    flex: 1,
                    padding: "12px 16px",
                    backgroundColor: "transparent",
                    border: "1px solid #ccc",
                    borderRadius: "2px",
                    cursor: "pointer",
                    fontWeight: "600",
                  }}
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    flex: 1,
                    padding: "12px 16px",
                    backgroundColor: "#FFB81C",
                    color: "#1a1a1a",
                    border: "none",
                    borderRadius: "2px",
                    cursor: loading ? "not-allowed" : "pointer",
                    fontWeight: "600",
                    opacity: loading ? 0.7 : 1,
                  }}
                >
                  {loading ? "Submitting..." : "Submit Request"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
