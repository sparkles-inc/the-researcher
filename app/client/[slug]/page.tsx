"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense, CSSProperties } from "react";
import { motion } from "framer-motion";
import { Phone, Star, CheckCircle, ArrowRight, Calendar, Sparkles, Play } from "lucide-react";

/* ─── Default Sparkles Inc. brand (fallback) ─── */
const DEFAULT_BRAND = {
  color: "#6B21A8",
  colorLight: "#A855F7",
  colorPale: "#F3EAFF",
  name: "Sparkles Inc.",
};

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : null;
}

/** Strip ugly suffixes Google Places leaves on business names */
function cleanBusinessName(raw: string): string {
  return raw
    .replace(/\s*[-–—]\s*([\w\s]+ division|[\w\s]+ branch|[\w\s]+ location|[\w\s]+ office)/gi, "")
    .replace(/\s*,?\s*(LLC|Inc\.?|L\.?L\.?C\.?|Corp\.?|Co\.?)$/i, "")
    .trim();
}

/** Convert third-person researcher voice to second-person sales voice */
function toYou(text: string): string {
  return text
    .replace(/\bThey've\b/g, "You've")
    .replace(/\bthey've\b/g, "you've")
    .replace(/\bThey're\b/g, "You're")
    .replace(/\bthey're\b/g, "you're")
    .replace(/\bThey are\b/g, "You are")
    .replace(/\bthey are\b/g, "you are")
    .replace(/\bThey\b/g, "You")
    .replace(/\bthey\b/g, "you")
    .replace(/\bTheir\b/g, "Your")
    .replace(/\btheir\b/g, "your")
    .replace(/\bThem\b/g, "You")
    .replace(/\bthem\b/g, "you")
    .replace(/\bthe business\b/gi, "your business")
    .replace(/\bthe company\b/gi, "your company")
    .replace(/\bthe owner\b/gi, "you")
    .replace(/\bThis business\b/g, "Your business")
    .replace(/\bthis business\b/g, "your business");
}

/** Render bullet-pointed text (lines starting with "- ") as a proper list */
function renderBullets(text: string) {
  const lines = text.split(/(?:^|\n)\s*-\s+/).filter(Boolean);
  if (lines.length <= 1) return <p className="text-xl text-gray-700 leading-relaxed">{text}</p>;
  return (
    <ul className="space-y-3">
      {lines.map((line, i) => (
        <li key={i} className="flex items-start gap-3 text-lg text-gray-700 leading-relaxed">
          <span className="w-2 h-2 rounded-full bg-current opacity-30 mt-2.5 shrink-0" />
          {line.trim()}
        </li>
      ))}
    </ul>
  );
}

function lighten(hex: string, amount: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const r = Math.min(255, rgb.r + Math.round((255 - rgb.r) * amount));
  const g = Math.min(255, rgb.g + Math.round((255 - rgb.g) * amount));
  const b = Math.min(255, rgb.b + Math.round((255 - rgb.b) * amount));
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

/* ─── Types ─── */
interface StoredPageData {
  name: string;
  city: string;
  state?: string;
  rating?: number;
  reviewCount?: number;
  compliment?: string;
  constraint?: string;
  constraintType?: string;
  constraintDetail?: string;
  confidence?: number;
  star?: { id?: string; name: string; reason?: string };
  supporting?: { id?: string; name: string; reason?: string }[];
  unknowns?: string[];
  brandColor?: string | null;
  logoUrl?: string | null;
}

/* ─── Demo data ─── */
const DEMO_CLIENTS: Record<string, StoredPageData> = {
  "tex-mex-cleaning": {
    name: "Tex-Mex Cleaning",
    city: "Austin",
    state: "TX",
    rating: 4.9,
    reviewCount: 150,
    compliment: "Your gift packages are the most creative thing we've seen across 200+ cleaning businesses researched. Mother's Day cleaning + massage for $275? That's not cleaning. That's gifting.",
    constraint: "Ready to Scale",
    constraintType: "ready_to_scale",
    constraintDetail: "You've solved customers, revenue, and retention. The constraint is that you ARE the system. We called at 12:32pm on a Tuesday. Text back at 12:33. One minute. Impressive, but it's still you doing it.",
    confidence: 92,
    star: { name: "AI Your Business Operations", reason: "You're already winning. This keeps it going when you're not watching the phone." },
    supporting: [
      { name: "Luxury Residential Calculator", reason: "Clients price it out themselves online. You wake up to new leads." },
      { name: "Gorgeous Website", reason: "Your online presence should match the quality of your work." },
      { name: "Work with Ruby", reason: "Scale without burning out. One-on-one coaching from someone who's done it." },
    ],
    unknowns: ["Current pricing structure", "Revenue per month", "Team size"],
    brandColor: "#D4451A",
  },
  "mh-cleaning-service": {
    name: "MH Cleaning Service",
    city: "Charlotte",
    state: "NC",
    rating: 4.9,
    reviewCount: 153,
    compliment: "153 reviews at 4.9 stars is exceptional. That's real client trust earned through consistent, quality work.",
    constraint: "Not Enough Revenue Per Customer",
    constraintType: "not_enough_revenue",
    constraintDetail: "Your website is outdated despite 153 reviews. No online booking. No quote form. No team info. With that review count, you should be running 3-4 cleaning teams.",
    confidence: 85,
    star: { name: "Gorgeous Website", reason: "People already love you. Your website should show that." },
    supporting: [
      { name: "Luxury Residential Calculator", reason: "Let clients price out their own clean. You wake up to new leads." },
      { name: "AI Friendly SEO", reason: "Show up when people search for cleaning in Charlotte." },
      { name: "Essential Google Ads", reason: "Targeted ads that bring in clients ready to book." },
    ],
    unknowns: ["Current pricing structure", "Revenue per month or team count"],
  },
};

/* ─── Inner component ─── */

function ClientPageInner() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params.slug as string;
  const isGenerated = searchParams.get("generated") === "true";

  const [data, setData] = useState<StoredPageData | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (isGenerated) {
      try {
        const stored = localStorage.getItem("clean-sweep-client-page");
        if (stored) setData(JSON.parse(stored));
      } catch { /* ignore */ }
    }
    if (!isGenerated || !data) {
      const demo = DEMO_CLIENTS[slug];
      if (demo) setData(demo);
    }
    setLoaded(true);
  }, [isGenerated, slug]);

  if (!loaded) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-400 text-lg">Loading...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-lg mb-4">Page not found.</p>
          <a href="/" className="text-blue-600 hover:underline">&larr; Back</a>
        </div>
      </div>
    );
  }

  // Brand theming
  const brandColor = data.brandColor || DEFAULT_BRAND.color;
  const brandLight = lighten(brandColor, 0.4);
  const brandPale = lighten(brandColor, 0.9);
  const brandRgb = hexToRgb(brandColor);
  const brandAlpha = brandRgb ? `rgba(${brandRgb.r}, ${brandRgb.g}, ${brandRgb.b}, 0.08)` : brandPale;
  const brandAlphaStrong = brandRgb ? `rgba(${brandRgb.r}, ${brandRgb.g}, ${brandRgb.b}, 0.15)` : brandPale;

  const displayName = cleanBusinessName(data.name);
  const stars = data.rating ? Math.min(5, Math.round(data.rating)) : 5;

  const brandVars = {
    "--brand": brandColor,
    "--brand-light": brandLight,
    "--brand-pale": brandPale,
    "--brand-alpha": brandAlpha,
    "--brand-alpha-strong": brandAlphaStrong,
  } as CSSProperties;

  return (
    <div className="min-h-screen bg-[#FAFAF8]" style={{ ...brandVars, fontFamily: "'DM Sans', system-ui, sans-serif" }}>

      {/* Nav */}
      <nav className="border-b border-gray-100 bg-white">
        <div className="max-w-3xl mx-auto px-6 py-6 flex items-center justify-between gap-6">
          <span className="text-xl font-bold text-gray-900 tracking-tight leading-tight">{displayName}</span>
          <span className="text-base text-gray-400 shrink-0 whitespace-nowrap">{data.city}{data.state ? `, ${data.state}` : ""}</span>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-16">

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          className="text-center mb-12">
          {data.rating && data.rating > 0 && (
            <div className="flex items-center justify-center gap-2 mb-4">
              {[...Array(stars)].map((_, i) => <Star key={i} size={18} className="fill-amber-400 text-amber-400" />)}
              <span className="text-base text-gray-400 ml-1">{data.rating} ({data.reviewCount}+ reviews)</span>
            </div>
          )}
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight leading-[1.2]"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            Here's what we found.
          </h1>
        </motion.div>

        {/* What you're doing right */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
          className="rounded-2xl p-8 mb-8" style={{ background: brandAlpha, border: `1px solid ${brandAlphaStrong}` }}>
          <div className="flex items-start gap-4">
            <CheckCircle size={24} className="mt-1 shrink-0" style={{ color: brandColor }} />
            <div>
              <p className="text-lg font-semibold uppercase tracking-widest mb-3" style={{ color: brandColor }}>
                What you're doing well
              </p>
              {renderBullets(toYou(data.compliment || ""))}
            </div>
          </div>
        </motion.div>

        {/* What we found */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white rounded-2xl border border-gray-100 p-8 mb-12 shadow-sm">
          <p className="text-lg font-semibold text-amber-600 uppercase tracking-widest mb-3">Where we see opportunity</p>
          {renderBullets(toYou(data.constraintDetail || ""))}
        </motion.div>

        {/* Star recommendation */}
        {data.star && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-12">
            <p className="text-lg font-semibold uppercase tracking-widest mb-6" style={{ color: brandColor }}>
              Our #1 recommendation
            </p>
            <div className="rounded-2xl p-10" style={{ background: `linear-gradient(135deg, ${brandColor}, ${brandLight})` }}>
              <Sparkles size={28} className="text-white/60 mb-4" />
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                {data.star.name}
              </h2>
              <p className="text-xl text-white/80 leading-relaxed max-w-lg">{toYou(data.star.reason || "")}</p>
            </div>
          </motion.div>
        )}

        {/* Supporting recommendations */}
        {data.supporting && data.supporting.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.5 }}
            className="mb-12">
            <p className="text-lg font-semibold text-gray-400 uppercase tracking-widest mb-6">Also recommended</p>
            <div className="grid gap-4">
              {data.supporting.map((s, i) => (
                <motion.div key={s.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                  className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{s.name}</h3>
                  <p className="text-lg text-gray-500 leading-relaxed">{toYou(s.reason || "")}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Video placeholder */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.7 }}
          className="mb-12">
          <p className="text-lg font-semibold text-gray-400 uppercase tracking-widest mb-6">A message for you</p>
          <div className="aspect-video rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: brandAlphaStrong }}>
                <Play size={28} style={{ color: brandColor }} />
              </div>
              <p className="text-xl text-gray-500">A quick video from Ruby</p>
              <p className="text-lg text-gray-400 mt-1">Specifically about your business</p>
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center rounded-2xl p-12 mb-12" style={{ background: brandPale }}>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            Want to talk about it?
          </h2>
          <p className="text-xl text-gray-500 mb-8">15 minutes. No sales pitch. Just a real conversation about your business.</p>
          <a href="#" className="group inline-flex items-center gap-3 text-white px-8 py-4 rounded-full text-xl font-semibold transition-all hover:shadow-lg"
            style={{ background: brandColor }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#7A9A7E")}
            onMouseLeave={(e) => (e.currentTarget.style.background = brandColor)}>
            <Calendar size={22} />
            Book a Discovery Call
            <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
          </a>
        </motion.div>

        <div className="py-8" />
      </div>
    </div>
  );
}

export default function ClientPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center"><p className="text-gray-400">Loading...</p></div>}>
      <ClientPageInner />
    </Suspense>
  );
}
