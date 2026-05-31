"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Check, Star as StarIcon, Eye } from "lucide-react";

const ALL_SERVICES = [
  // Marketing
  { id: "website", name: "Gorgeous Website", desc: "A beautiful site that converts visitors into clients." },
  { id: "brand-guide", name: "Brand Guide", desc: "Colors, fonts, tone, and visual identity locked in." },
  { id: "seo", name: "AI Friendly SEO", desc: "Show up when people search for cleaning in your area." },
  { id: "google-ads", name: "Essential Google Ads", desc: "Targeted ads that bring in clients who are ready to book." },
  // Operations
  { id: "ai-ops", name: "AI Your Business Operations", desc: "Automate texts, booking, follow-ups, and scheduling. (Coming soon)" },
  { id: "calculator", name: "Luxury Residential Calculator", desc: "Clients price out their own clean. You wake up to leads." },
  // Education
  { id: "skool", name: "Free Skool Courses", desc: "Learn the fundamentals of running a cleaning business. (Coming soon)" },
  { id: "coaching", name: "Work with Ruby", desc: "One-on-one coaching from someone who's done it." },
];

function BuildPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const businessName = searchParams.get("name") || "";
  const businessCity = searchParams.get("city") || "";
  const businessState = searchParams.get("state") || "";
  const preselectedStar = searchParams.get("star") || "";
  const preselectedSupporting = searchParams.get("supporting")?.split(",").filter(Boolean) || [];

  const [starService, setStarService] = useState<string | null>(preselectedStar || null);
  const [supporting, setSupporting] = useState<string[]>(preselectedSupporting);
  const [previewing, setPreviewing] = useState(false);

  function toggleSupporting(id: string) {
    if (id === starService) return;
    if (supporting.includes(id)) {
      setSupporting(supporting.filter((s) => s !== id));
    } else if (supporting.length < 3) {
      setSupporting([...supporting, id]);
    }
  }

  function setStar(id: string) {
    setStarService(id);
    setSupporting(supporting.filter((s) => s !== id));
  }

  const canGenerate = starService && supporting.length > 0;

  function generateClientPage() {
    // Store in localStorage for the client page to read
    const pageData = {
      name: businessName,
      city: businessCity,
      state: businessState,
      star: ALL_SERVICES.find(s => s.id === starService),
      supporting: supporting.map(id => ALL_SERVICES.find(s => s.id === id)).filter(Boolean),
      generatedAt: new Date().toISOString(),
    };
    localStorage.setItem("clean-sweep-client-page", JSON.stringify(pageData));

    const slug = businessName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    router.push(`/client/${slug}?generated=true`);
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[15%] left-[10%] w-[500px] h-[500px] bg-accent/[0.02] rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          {/* Header with business name */}
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
              <Sparkles size={18} className="text-accent" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Build Client Page</h1>
              {businessName && (
                <p className="text-xs text-accent">for {businessName}{businessCity ? `, ${businessCity}` : ""}{businessState ? ` ${businessState}` : ""}</p>
              )}
            </div>
          </div>
          <p className="text-xs text-muted/50 mb-8 ml-[52px]">Select the star service and up to 3 supporting services for this client&apos;s sales page</p>

          {/* Star service */}
          <div className="mb-8">
            <label className="text-[11px] text-muted/50 uppercase tracking-widest font-semibold mb-3 block">
              Star service <span className="text-accent">(the main thing they need)</span>
            </label>
            <div className="grid gap-2">
              {ALL_SERVICES.map((service) => (
                <button
                  key={service.id}
                  onClick={() => setStar(service.id)}
                  className={`flex items-center gap-3 text-left px-4 py-3 rounded-xl border transition-all ${
                    starService === service.id
                      ? "bg-accent/10 border-accent/30"
                      : "bg-surface border-border hover:border-border-light"
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                    starService === service.id ? "border-accent bg-accent" : "border-muted/20"
                  }`}>
                    {starService === service.id && <StarIcon size={10} className="text-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${starService === service.id ? "text-foreground" : "text-foreground/70"}`}>{service.name}</p>
                    <p className="text-[11px] text-muted/50 truncate">{service.desc}</p>
                  </div>
                  {starService === service.id && (
                    <span className="text-[9px] text-accent bg-accent/10 px-2 py-0.5 rounded-full font-semibold shrink-0">STAR</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Supporting services */}
          <div className="mb-10">
            <label className="text-[11px] text-muted/50 uppercase tracking-widest font-semibold mb-3 block">
              Supporting services <span className="text-muted/30">(pick up to 3)</span>
            </label>
            <div className="grid gap-2">
              {ALL_SERVICES.filter((s) => s.id !== starService).map((service) => {
                const isSelected = supporting.includes(service.id);
                const isDisabled = !isSelected && supporting.length >= 3;
                return (
                  <button
                    key={service.id}
                    onClick={() => toggleSupporting(service.id)}
                    disabled={isDisabled}
                    className={`flex items-center gap-3 text-left px-4 py-3 rounded-xl border transition-all ${
                      isSelected
                        ? "bg-surface-light border-border-light"
                        : isDisabled
                          ? "bg-surface border-border opacity-30 cursor-not-allowed"
                          : "bg-surface border-border hover:border-border-light"
                    }`}
                  >
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                      isSelected ? "border-green bg-green" : "border-muted/20"
                    }`}>
                      {isSelected && <Check size={10} className="text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${isSelected ? "text-foreground" : "text-foreground/70"}`}>{service.name}</p>
                      <p className="text-[11px] text-muted/50 truncate">{service.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Summary + Generate */}
          {canGenerate && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-surface border border-border rounded-xl p-5 mb-6"
            >
              <p className="text-xs text-muted/50 uppercase tracking-widest mb-3">Your selections</p>
              <div className="flex items-center gap-2 mb-2">
                <StarIcon size={14} className="text-accent" />
                <span className="text-sm font-semibold text-foreground">
                  {ALL_SERVICES.find((s) => s.id === starService)?.name}
                </span>
                <span className="text-[9px] text-accent bg-accent/10 px-1.5 py-0.5 rounded-full">STAR</span>
              </div>
              {supporting.map((id) => {
                const service = ALL_SERVICES.find((s) => s.id === id);
                return (
                  <div key={id} className="flex items-center gap-2 mb-1">
                    <span className="w-1 h-1 rounded-full bg-muted/30" />
                    <span className="text-sm text-muted">{service?.name}</span>
                  </div>
                );
              })}
            </motion.div>
          )}

          <button
            onClick={generateClientPage}
            disabled={!canGenerate}
            className="w-full group flex items-center justify-center gap-2.5 bg-gradient-to-br from-accent to-accent-light hover:shadow-lg hover:shadow-accent/20 text-white px-8 py-4 rounded-xl text-base font-semibold transition-all disabled:opacity-30 disabled:hover:shadow-none"
          >
            <Sparkles size={18} />
            Generate Client Page
            <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
          </button>

          {!canGenerate && (
            <p className="text-center text-xs text-muted/30 mt-3">
              Pick a star service and at least one supporting service
            </p>
          )}

          {/* Back to research */}
          <div className="mt-6 text-center">
            <a href="/" className="text-xs text-muted/40 hover:text-muted transition-colors">
              ← Back to research
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function BuildPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted">Loading...</p></div>}>
      <BuildPageInner />
    </Suspense>
  );
}
