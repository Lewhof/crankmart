"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";

interface Business {
  id: string;
  name: string;
  slug: string;
  type: string;
  city: string;
  province: string;
  logo: string;
  description: string;
  brands?: string[];
  verified: boolean;
  featured: boolean;
  views: number;
}

interface DirectoryResponse {
  success: boolean;
  data: Business[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

const BUSINESS_TYPES = [
  { value: "shop", label: "Bike Shops" },
  { value: "brand", label: "Brands & Importers" },
  { value: "service_center", label: "Workshops" },
  { value: "tour_operator", label: "Tours & Rentals" },
  { value: "event_organiser", label: "Events" },
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

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export default function DirectoryPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchBusinesses = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (selectedType) params.append("type", selectedType);
      if (selectedProvince) params.append("province", selectedProvince);
      params.append("page", page.toString());
      params.append("limit", "20");

      const response = await fetch(`/api/directory?${params.toString()}`);
      const data: DirectoryResponse = await response.json();

      if (data.success) {
        setBusinesses(data.data);
        setTotalPages(data.pagination.pages);
      }
    } catch (error) {
      console.error("Failed to fetch businesses:", error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedType, selectedProvince, page]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, selectedType, selectedProvince]);

  useEffect(() => {
    fetchBusinesses();
  }, [fetchBusinesses]);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
      {/* Hero Section */}
      <section
        style={{
          backgroundColor: "#0D1B2A",
          color: "white",
          padding: "60px 20px",
          textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: "36px", fontWeight: "bold", marginBottom: "16px" }}>
          Find SA Cycling Businesses
        </h1>
        <p style={{ fontSize: "16px", marginBottom: "32px", opacity: 0.9 }}>
          Discover bike shops, mechanics, brands, coaches, and more across South Africa
        </p>

        {/* Search Input */}
        <div style={{ maxWidth: "500px", margin: "0 auto" }}>
          <input
            type="text"
            placeholder="Search by name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              padding: "14px 16px",
              borderRadius: "8px",
              border: "none",
              fontSize: "16px",
              boxSizing: "border-box",
            }}
          />
        </div>
      </section>

      {/* Filters */}
      <section style={{ padding: "24px 20px", backgroundColor: "white", borderBottom: "1px solid #e0e0e0" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "14px", fontWeight: "600", marginBottom: "8px" }}>
              Business Type
            </label>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <button
                onClick={() => setSelectedType("")}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  border: "1px solid #0D1B2A",
                  backgroundColor: selectedType === "" ? "#0D1B2A" : "white",
                  color: selectedType === "" ? "white" : "#0D1B2A",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                All
              </button>
              {BUSINESS_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setSelectedType(type.value)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "8px",
                    border: "1px solid #0D1B2A",
                    backgroundColor: selectedType === type.value ? "#0D1B2A" : "white",
                    color: selectedType === type.value ? "white" : "#0D1B2A",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "500",
                  }}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: "600", marginBottom: "8px" }}>
              Province
            </label>
            <select
              value={selectedProvince}
              onChange={(e) => setSelectedProvince(e.target.value)}
              style={{
                padding: "10px 12px",
                borderRadius: "8px",
                border: "1px solid #ccc",
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              <option value="">All Provinces</option>
              {PROVINCES.map((prov) => (
                <option key={prov} value={prov}>
                  {prov}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Businesses Grid */}
      <section style={{ padding: "40px 20px" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "60px 20px" }}>
              <p>Loading businesses...</p>
            </div>
          ) : businesses.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px" }}>
              <p style={{ fontSize: "16px", color: "#666" }}>
                No businesses found. Try adjusting your filters.
              </p>
            </div>
          ) : (
            <>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                  gap: "24px",
                  marginBottom: "40px",
                }}
              >
                {businesses.map((business) => (
                  <Link key={business.id} href={`/directory/${business.slug}`}>
                    <div
                      style={{
                        backgroundColor: "white",
                        borderRadius: "8px",
                        overflow: "hidden",
                        border: "1px solid #e0e0e0",
                        cursor: "pointer",
                        transition: "transform 0.2s, box-shadow 0.2s",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)";
                        (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 16px rgba(0,0,0,0.1)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                        (e.currentTarget as HTMLElement).style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
                      }}
                    >
                      {/* Logo */}
                      <div
                        style={{
                          height: "120px",
                          backgroundColor: "#f0f0f0",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderBottom: "1px solid #e0e0e0",
                          position: "relative",
                        }}
                      >
                        {business.logo ? (
                          <img
                            src={business.logo}
                            alt={business.name}
                            style={{ maxHeight: "100px", maxWidth: "100px" }}
                          />
                        ) : (
                          <div
                            style={{
                              width: "80px",
                              height: "80px",
                              backgroundColor: "#0D1B2A",
                              color: "white",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              borderRadius: "8px",
                              fontSize: "32px",
                              fontWeight: "bold",
                            }}
                          >
                            {getInitials(business.name)}
                          </div>
                        )}
                        {business.verified && (
                          <div
                            style={{
                              position: "absolute",
                              top: "8px",
                              right: "8px",
                              backgroundColor: "#0D1B2A",
                              color: "white",
                              padding: "4px 8px",
                              borderRadius: "4px",
                              fontSize: "12px",
                              fontWeight: "600",
                            }}
                          >
                            ✓ Verified
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div style={{ padding: "16px", flex: 1, display: "flex", flexDirection: "column" }}>
                        <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "8px", margin: 0 }}>
                          {business.name}
                        </h3>

                        <div style={{ display: "flex", gap: "8px", marginBottom: "12px", flexWrap: "wrap" }}>
                          <span
                            style={{
                              backgroundColor: "#f0f0f0",
                              padding: "4px 8px",
                              borderRadius: "4px",
                              fontSize: "12px",
                              fontWeight: "500",
                              color: "#0D1B2A",
                            }}
                          >
                            {BUSINESS_TYPES.find((t) => t.value === business.type)?.label || business.type}
                          </span>
                        </div>

                        <p style={{ fontSize: "14px", color: "#666", marginBottom: "12px", margin: 0 }}>
                          {business.city}, {business.province}
                        </p>

                        {business.description && (
                          <p
                            style={{
                              fontSize: "13px",
                              color: "#888",
                              marginBottom: "12px",
                              lineHeight: "1.4",
                              flexGrow: 1,
                            }}
                          >
                            {business.description.slice(0, 100)}...
                          </p>
                        )}

                        {business.brands && business.brands.length > 0 && (
                          <p style={{ fontSize: "12px", color: "#999", marginBottom: "12px", margin: 0 }}>
                            <strong>Brands:</strong> {business.brands.slice(0, 3).join(", ")}
                            {business.brands.length > 3 && ` +${business.brands.length - 3}`}
                          </p>
                        )}

                        <button
                          style={{
                            backgroundColor: "#0D1B2A",
                            color: "white",
                            border: "none",
                            padding: "10px 16px",
                            borderRadius: "8px",
                            cursor: "pointer",
                            fontSize: "14px",
                            fontWeight: "600",
                            marginTop: "auto",
                          }}
                          onClick={(e) => {
                            e.preventDefault();
                          }}
                        >
                          View Profile →
                        </button>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "32px" }}>
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    style={{
                      padding: "8px 12px",
                      borderRadius: "8px",
                      border: "1px solid #ccc",
                      backgroundColor: page === 1 ? "#f5f5f5" : "white",
                      cursor: page === 1 ? "not-allowed" : "pointer",
                      opacity: page === 1 ? 0.5 : 1,
                    }}
                  >
                    ← Previous
                  </button>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        style={{
                          padding: "8px 12px",
                          borderRadius: "8px",
                          border: "1px solid #ccc",
                          backgroundColor: page === pageNum ? "#0D1B2A" : "white",
                          color: page === pageNum ? "white" : "black",
                          cursor: "pointer",
                        }}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}
                    style={{
                      padding: "8px 12px",
                      borderRadius: "8px",
                      border: "1px solid #ccc",
                      backgroundColor: page === totalPages ? "#f5f5f5" : "white",
                      cursor: page === totalPages ? "not-allowed" : "pointer",
                      opacity: page === totalPages ? 0.5 : 1,
                    }}
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
