"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Search, Sparkles, MapPin, Shuffle, ExternalLink, ArrowRight, Zap, Shield, TrendingUp, Star, AlertTriangle, CheckCircle, Eye, Target, Globe, Phone, Package, BookOpen, Megaphone, ChevronDown, Play, Download, Link2 } from "lucide-react";

/* ─── Types ─── */

interface RecommendationData {
  business_name: string;
  city: string;
  state?: string;
  rating?: number;
  review_count?: number;
  website?: string;
  phone?: string;
  address?: string;
  constraint_type: string;
  constraint_label: string;
  compliment: string;
  constraint_detail: string;
  confidence: number;
  star_service: { id: string; name: string; reason: string };
  supporting_services: { id: string; name: string; reason: string }[];
  unknowns: string[];
}

interface ChatMessage {
  id: string;
  role: "user" | "agent";
  text: string;
  recommendation?: RecommendationData | null;
}

/* ─── Product Catalog ─── */

const PRODUCT_CATEGORIES = [
  {
    label: "Marketing",
    icon: <Megaphone size={18} />,
    products: [
      { id: "website", name: "Website", desc: "A site that converts visitors into clients.", buildable: true },
      { id: "seo", name: "SEO", desc: "Show up when people search for cleaning in your area.", buildable: true },
      { id: "google-ads", name: "Google Ads", desc: "Paid search that fills your calendar with ready-to-book clients.", buildable: true },
      { id: "instagram", name: "Instagram", desc: "Content strategy and profile optimization.", buildable: true },
      { id: "facebook", name: "Facebook", desc: "Business page, local groups, and community presence.", buildable: true },
    ],
  },
  {
    label: "Branding",
    icon: <Sparkles size={18} />,
    products: [
      { id: "brand-guide", name: "Brand Guide", desc: "Colors, fonts, tone, and visual identity locked in.", buildable: true },
    ],
  },
  {
    label: "Operations",
    icon: <Zap size={18} />,
    products: [
      { id: "ai-ops", name: "AI Automation", desc: "Automate texts, booking, follow-ups, and scheduling.", comingSoon: true, buildable: true },
      { id: "calculator", name: "Pricing Calculator", desc: "Clients price out their own clean. You wake up to leads.", buildable: true },
    ],
  },
  {
    label: "Education",
    icon: <BookOpen size={18} />,
    products: [
      { id: "skool", name: "Free Courses", desc: "Learn the fundamentals of running a cleaning business.", comingSoon: true, buildable: true },
      { id: "coaching", name: "Coaching", desc: "One-on-one with someone who's done it.", buildable: true },
    ],
  },
];

const ALL_PRODUCTS = PRODUCT_CATEGORIES.flatMap((c) => c.products);

/* ─── Constraint Styles ─── */

const CONSTRAINT_STYLES: Record<string, { color: string; bg: string; border: string; icon: React.ReactNode; label: string }> = {
  not_enough_customers: { color: "text-green", bg: "bg-green/10", border: "border-green/20", icon: <TrendingUp size={16} />, label: "Not Enough Customers" },
  not_enough_revenue: { color: "text-orange", bg: "bg-orange/10", border: "border-orange/20", icon: <Sparkles size={16} />, label: "Not Enough Revenue" },
  losing_clients: { color: "text-red", bg: "bg-red/10", border: "border-red/20", icon: <Shield size={16} />, label: "Losing Clients" },
  ready_to_scale: { color: "text-accent", bg: "bg-accent/10", border: "border-accent/20", icon: <Zap size={16} />, label: "Ready to Scale" },
  just_starting: { color: "text-muted", bg: "bg-muted/10", border: "border-muted/20", icon: <Star size={16} />, label: "Just Starting" },
  scale: { color: "text-accent", bg: "bg-accent/10", border: "border-accent/20", icon: <Zap size={16} />, label: "Ready to Scale" },
  revenue: { color: "text-orange", bg: "bg-orange/10", border: "border-orange/20", icon: <Sparkles size={16} />, label: "Not Enough Revenue" },
  customers: { color: "text-green", bg: "bg-green/10", border: "border-green/20", icon: <TrendingUp size={16} />, label: "Not Enough Customers" },
  retention: { color: "text-red", bg: "bg-red/10", border: "border-red/20", icon: <Shield size={16} />, label: "Losing Clients" },
};

/** Strip ugly suffixes Google Places leaves on business names */
function cleanBusinessName(raw: string): string {
  return raw
    .replace(/\s*[-–—]\s*([\w\s]+ division|[\w\s]+ branch|[\w\s]+ location|[\w\s]+ office)/gi, "")
    .replace(/\s*,?\s*(LLC|Inc\.?|L\.?L\.?C\.?|Corp\.?|Co\.?)$/i, "")
    .trim();
}

/* ─── Markdown renderer ─── */

function renderMarkdown(text: string) {
  function parseInline(line: string): string {
    let parsed = line.replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-accent hover:text-accent-light underline underline-offset-2 transition-colors">$1</a>');
    parsed = parsed.replace(/\*\*(.+?)\*\*/g, '<strong class="text-foreground font-semibold">$1</strong>');
    return parsed;
  }
  return text.split("\n").map((line, i) => {
    if (line.startsWith("### ")) return <h3 key={i} className="text-lg font-semibold text-accent-light mt-5 mb-2">{line.slice(4)}</h3>;
    if (line.startsWith("## ")) return <h2 key={i} className="text-xl font-bold text-foreground mt-6 mb-2.5 tracking-tight">{line.slice(3)}</h2>;
    if (line.startsWith("# ")) return <h1 key={i} className="text-2xl font-bold text-foreground mt-6 mb-3 tracking-tight">{line.slice(2)}</h1>;
    if (line.startsWith("---")) return <hr key={i} className="border-border/50 my-5" />;
    if (line.trim() === "") return <div key={i} className="h-1.5" />;
    const parsed = parseInline(line);
    if (/^\d+\.\s/.test(line)) return <li key={i} className="ml-4 mb-1.5 list-decimal" dangerouslySetInnerHTML={{ __html: parseInline(line.replace(/^\d+\.\s/, '')) }} />;
    if (line.startsWith("- ") || line.startsWith("* ")) return <li key={i} className="relative pl-4 mb-1.5 list-none before:absolute before:left-0 before:top-[0.55em] before:w-1.5 before:h-1.5 before:rounded-full before:bg-accent/40" dangerouslySetInnerHTML={{ __html: parseInline(line.slice(2)) }} />;
    return <p key={i} className="mb-2 leading-relaxed" dangerouslySetInnerHTML={{ __html: parsed }} />;
  });
}

/* ─── Typing Indicator ─── */

function TypingIndicator({ toolStatus }: { toolStatus: string | null }) {
  const statusMessages: Record<string, string> = {
    search_cleaning_businesses: "Searching businesses",
    investigate_business: "Investigating business",
    check_website: "Checking website",
    get_market_stats: "Pulling market stats",
    get_random_opportunity: "Finding opportunity",
    generate_recommendation_card: "Building diagnosis",
  };
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 py-5">
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center border border-accent/10">
        <Search size={14} className="text-accent" />
      </div>
      <span className="text-muted font-medium">{toolStatus ? statusMessages[toolStatus] || "Investigating" : "Investigating"}</span>
      <div className="flex gap-1">
        {[0, 0.2, 0.4].map((delay) => (
          <span key={delay} className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse-dot" style={{ animationDelay: `${delay}s` }} />
        ))}
      </div>
    </motion.div>
  );
}

/* ─── Diagnosis Panel ─── */

function DiagnosisPanel({ data, onBuildSalesPage }: { data: RecommendationData; onBuildSalesPage: () => void }) {
  const style = CONSTRAINT_STYLES[data.constraint_type] || CONSTRAINT_STYLES.ready_to_scale;
  const [builtItems, setBuiltItems] = useState<Record<string, string>>({});

  // Interactive selections — AI pre-populates, user can adjust
  const [selectedStar, setSelectedStar] = useState<string>(data.star_service.id);
  const aiRecommendedIds = data.supporting_services.map((s) => s.id);
  const [selectedFixes, setSelectedFixes] = useState<string[]>(aiRecommendedIds.slice(0, 3));

  // Build the full list of 6 fixable items (star + supporting + fill from catalog)
  const allFixIds = [data.star_service.id, ...aiRecommendedIds];
  const remainingProducts = ALL_PRODUCTS.filter((p) => !allFixIds.includes(p.id) && !('comingSoon' in p && p.comingSoon));
  const sixFixes = [
    { id: data.star_service.id, name: data.star_service.name, reason: data.star_service.reason },
    ...data.supporting_services,
    ...remainingProducts.slice(0, Math.max(0, 6 - 1 - data.supporting_services.length)).map((p) => ({
      id: p.id, name: p.name, reason: p.desc,
    })),
  ].slice(0, 6);

  function toggleFix(id: string) {
    if (id === selectedStar) return; // Can't deselect the star
    setSelectedFixes((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  }

  function makeStar(id: string) {
    setSelectedStar(id);
    // Ensure the new star is in the selected fixes
    if (!selectedFixes.includes(id)) {
      setSelectedFixes((prev) => [id, ...prev].slice(0, 5));
    }
  }

  function handleBuild(productId: string) {
    // For now, all builds show "coming soon" except future wired-up ones
    setBuiltItems((prev) => ({ ...prev, [productId]: "coming-soon" }));
  }

  // Get the current star product info
  const currentStarFix = sixFixes.find((f) => f.id === selectedStar);
  const currentStarProduct = ALL_PRODUCTS.find((p) => p.id === selectedStar);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
      className="mt-8 space-y-6">

      {/* Business Header */}
      <div className="bg-surface border border-border rounded-2xl p-8">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <span className={`font-semibold px-4 py-1.5 rounded-full border flex items-center gap-2 ${style.bg} ${style.color} ${style.border}`}>
            {style.icon} {data.constraint_label}
          </span>
          {data.confidence > 0 && (
            <span className="font-semibold px-3 py-1 rounded-full bg-green/10 text-green border border-green/20">
              {data.confidence}% confidence
            </span>
          )}
          {data.rating && data.rating > 0 && (
            <div className="flex items-center gap-1.5">
              {[...Array(Math.min(5, Math.round(data.rating)))].map((_, i) => <Star key={i} size={18} className="fill-orange text-orange" />)}
              <span className="text-muted ml-1">{data.rating} ({data.review_count}+ reviews)</span>
            </div>
          )}
        </div>
        <h2 className="text-4xl font-bold text-foreground tracking-tight mb-2">{cleanBusinessName(data.business_name)}</h2>
        <p className="text-lg text-muted">{data.city}{data.state ? `, ${data.state}` : ""}</p>

      </div>

      {/* ─── Links & Socials ─── */}
      {/* Links */}
      <div className="flex flex-wrap gap-2.5">
        {data.website && data.website !== "None" && (
          <a href={data.website} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-accent/[0.06] border border-accent/15 px-5 py-3 rounded-full hover:bg-accent/10 transition-colors text-accent font-medium">
            <Globe size={16} /> Website <ExternalLink size={12} className="opacity-40" />
          </a>
        )}
        <a href={`https://www.google.com/maps/search/${encodeURIComponent(data.business_name + " " + data.city + " " + (data.state || ""))}`}
          target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-surface-light border border-border px-5 py-3 rounded-full hover:border-border-light transition-colors text-foreground font-medium">
          <MapPin size={16} /> Google <ExternalLink size={12} className="opacity-40" />
        </a>
        {data.phone && (
          <a href={`tel:${data.phone}`}
            className="inline-flex items-center gap-2 bg-surface-light border border-border px-5 py-3 rounded-full hover:border-border-light transition-colors text-foreground font-medium">
            <Phone size={16} /> {data.phone}
          </a>
        )}
        {/* Social links from website scrape */}
        {(data as RecommendationData & { social_facebook?: string }).social_facebook && (
          <a href={(data as RecommendationData & { social_facebook: string }).social_facebook} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-blue/10 border border-blue/20 px-5 py-3 rounded-full hover:bg-blue/20 transition-colors text-blue font-medium">
            Facebook <ExternalLink size={12} className="opacity-40" />
          </a>
        )}
        {(data as RecommendationData & { social_instagram?: string }).social_instagram && (
          <a href={(data as RecommendationData & { social_instagram: string }).social_instagram} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-pink/10 border border-pink/20 px-5 py-3 rounded-full hover:bg-pink/20 transition-colors text-pink font-medium">
            Instagram <ExternalLink size={12} className="opacity-40" />
          </a>
        )}
        {(data as RecommendationData & { social_yelp?: string }).social_yelp && (
          <a href={(data as RecommendationData & { social_yelp: string }).social_yelp} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-red/10 border border-red/20 px-5 py-3 rounded-full hover:bg-red/20 transition-colors text-red font-medium">
            Yelp <ExternalLink size={12} className="opacity-40" />
          </a>
        )}
        {(data as RecommendationData & { social_nextdoor?: string }).social_nextdoor && (
          <a href={(data as RecommendationData & { social_nextdoor: string }).social_nextdoor} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-green/10 border border-green/20 px-5 py-3 rounded-full hover:bg-green/20 transition-colors text-green font-medium">
            Nextdoor <ExternalLink size={12} className="opacity-40" />
          </a>
        )}
      </div>

      {/* What they're doing right */}
      <div className="bg-green/[0.04] border border-green/10 rounded-2xl p-6">
        <div className="flex items-start gap-3">
          <CheckCircle size={20} className="text-green mt-1 shrink-0" />
          <div>
            <p className="font-semibold text-green uppercase tracking-widest mb-2">What they're doing right</p>
            <div className="text-foreground/70 leading-relaxed">{renderMarkdown(data.compliment)}</div>
          </div>
        </div>
      </div>

      {/* What we found */}
      <div className="bg-surface border border-border rounded-2xl p-6">
        <div className="flex items-start gap-3">
          <AlertTriangle size={20} className={`${style.color} mt-1 shrink-0`} />
          <div>
            <p className={`font-semibold uppercase tracking-widest mb-2 ${style.color}`}>What we found</p>
            <div className="text-foreground/70 leading-relaxed">{renderMarkdown(data.constraint_detail)}</div>
          </div>
        </div>
      </div>

      {/* ─── Interactive Product Selection ─── */}
      <div className="space-y-4">
        <div className="flex items-baseline justify-between">
          <p className="text-2xl text-accent font-semibold uppercase tracking-widest">What to sell them</p>
          <p className="text-lg text-muted/30">Click to adjust</p>
        </div>

        {/* Star product — hero card */}
        {currentStarFix && (
          <div className="rounded-2xl p-8 bg-gradient-to-br from-accent/[0.12] to-accent/[0.04] border-2 border-accent/30">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                <Sparkles size={16} className="text-white" />
              </div>
              <span className="text-accent font-bold uppercase tracking-wider text-sm">Lead offer</span>
            </div>
            <h3 className="text-3xl font-bold text-foreground mb-2">{currentStarFix.name}</h3>
            <p className="text-xl text-muted/60 leading-relaxed">{currentStarFix.reason}</p>
            {currentStarProduct?.buildable && !builtItems[currentStarFix.id] && (
              <button onClick={() => handleBuild(currentStarFix.id)}
                className="mt-4 inline-flex items-center gap-2 bg-accent hover:shadow-lg hover:shadow-accent/20 text-white px-6 py-3 rounded-xl font-semibold transition-all">
                <Zap size={16} /> Build this
              </button>
            )}
            {builtItems[currentStarFix.id] && (
              <span className="mt-4 inline-flex items-center gap-2 bg-accent/10 border border-accent/20 text-accent px-6 py-3 rounded-xl font-semibold">
                <Sparkles size={16} /> Coming soon
              </span>
            )}
          </div>
        )}

        {/* Supporting services — compact grid */}
        <div className="grid grid-cols-2 gap-3">
          {sixFixes.filter((f) => f.id !== selectedStar).map((fix) => {
            const isSelected = selectedFixes.includes(fix.id);
            return (
              <div key={fix.id}
                className={`rounded-xl p-5 border transition-all cursor-pointer ${
                  isSelected
                    ? "bg-surface-light border-accent/20"
                    : "bg-surface border-border/50 opacity-40 hover:opacity-70"
                }`}
                onClick={() => toggleFix(fix.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-lg font-bold text-foreground">{fix.name}</h4>
                  <div className="flex items-center gap-2">
                    <button onClick={(e) => { e.stopPropagation(); makeStar(fix.id); }}
                      className="text-muted/30 hover:text-accent hover:scale-110 transition-all p-1.5"
                      title="Make lead offer">
                      <Star size={20} />
                    </button>
                    {isSelected ? (
                      <CheckCircle size={18} className="text-accent shrink-0" />
                    ) : (
                      <div className="w-[18px] h-[18px] rounded-full border border-border shrink-0" />
                    )}
                  </div>
                </div>
                <p className="text-muted/50 text-base leading-relaxed">{fix.reason}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Unknowns */}
      {data.unknowns.length > 0 && (
        <div className="text-muted/50">
          <p className="font-semibold mb-2">Verify on the call:</p>
          <div className="flex flex-wrap gap-2">
            {data.unknowns.map((u) => (
              <span key={u} className="bg-surface-light px-3 py-1 rounded-full">{u}</span>
            ))}
          </div>
        </div>
      )}

      {/* Generate Sales Page */}
      <div className="bg-gradient-to-br from-accent/[0.08] to-accent/[0.02] border border-accent/15 rounded-2xl p-8 text-center">
        <h3 className="text-2xl font-bold text-foreground mb-2">Ready to reach out?</h3>
        <p className="text-muted mb-6">
          Generate a sales page with {currentStarFix?.name || "your star pick"} as the headline
          and {selectedFixes.filter((f) => f !== selectedStar).length} supporting recommendations.
        </p>
        <button onClick={onBuildSalesPage}
          className="group inline-flex items-center gap-3 bg-gradient-to-br from-accent to-accent-light hover:shadow-lg hover:shadow-accent/20 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all">
          <Link2 size={20} />
          Generate Sales Page
          <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </motion.div>
  );
}

/* ─── Batch Results (Dozen view) ─── */

interface BatchBusiness {
  name: string;
  summary: string;
}

function BatchTabs({ businesses, activeIdx, onSelect }: { businesses: BatchBusiness[]; activeIdx: number | null; onSelect: (idx: number) => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-20 bg-background/95 backdrop-blur-xl border-b border-border/30 -mx-4 px-4 py-5 mb-8">
      <p className="text-muted/40 font-medium mb-3">{businesses.length} businesses found. Select one to diagnose.</p>
      <div className="relative">
        <div className="flex gap-2.5 overflow-x-auto pb-2" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(59,130,246,0.3) transparent' }}>
          {businesses.map((b, i) => (
            <button key={i} onClick={() => onSelect(i)}
              className={`shrink-0 px-6 py-3 rounded-full font-semibold transition-all ${activeIdx === i
                ? "bg-accent text-white shadow-lg shadow-accent/20"
                : "bg-surface border border-border text-foreground hover:border-accent/30"
              }`}>
              {b.name}
            </button>
          ))}
        </div>
        {/* Scroll fade hint on right */}
        <div className="absolute right-0 top-0 bottom-2 w-16 bg-gradient-to-l from-background/95 to-transparent pointer-events-none" />
      </div>
    </motion.div>
  );
}

/* ─── Parse batch response ─── */

function parseBatchResponse(text: string): BatchBusiness[] | null {
  const results: BatchBusiness[] = [];

  // Try numbered list format: "1. Business Name | City | ..."
  const numberedLines = text.split("\n").filter((l) => /^\|?\s*\d+[\.\)|\s]/.test(l.trim()));

  // Try pipe-table format: "| 1 | Business Name | City | ..."
  const tableLines = text.split("\n").filter((l) => {
    const trimmed = l.trim();
    return trimmed.startsWith("|") && !trimmed.startsWith("|--") && !trimmed.startsWith("| #");
  });

  const lines = numberedLines.length >= 4 ? numberedLines : tableLines.length >= 4 ? tableLines : [];
  if (lines.length < 4) return null;

  for (const line of lines) {
    const cleaned = line.replace(/\*\*/g, "").replace(/—/g, "-").trim();

    // Pipe table: | 1 | Business Name | City | State | summary |
    if (cleaned.startsWith("|")) {
      const cells = cleaned.split("|").map((c) => c.trim()).filter(Boolean);
      if (cells.length >= 3) {
        // Skip if first cell is a header like "#" or "---"
        if (cells[0] === "#" || cells[0].startsWith("--")) continue;
        const nameIdx = /^\d+$/.test(cells[0]) ? 1 : 0;
        const name = cells[nameIdx] || "";
        const rest = cells.slice(nameIdx + 1).join(" - ");
        if (name) results.push({ name, summary: rest });
      }
      continue;
    }

    // Numbered list: "1. Business Name - City, State - summary"
    const withoutNum = cleaned.replace(/^\d+[\.\)]\s*/, "").trim();
    const separators = [" | ", " - ", " – ", ": "];
    let found = false;
    for (const sep of separators) {
      const idx = withoutNum.indexOf(sep);
      if (idx > 0 && idx < 60) {
        results.push({ name: withoutNum.slice(0, idx).trim(), summary: withoutNum.slice(idx + sep.length).trim() });
        found = true;
        break;
      }
    }
    if (!found && withoutNum) {
      results.push({ name: withoutNum.trim(), summary: "" });
    }
  }

  // Filter out known franchises
  const FRANCHISES = /molly maid|merry maids|the maids|maid brigade|two maids|maidpro|jan-pro|servicemaster|stanley steemer/i;
  const filtered = results.filter((r) => !FRANCHISES.test(r.name));

  return filtered.length >= 4 ? filtered : null;
}

/* ─── Main Page ─── */

export default function Home() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [toolStatus, setToolStatus] = useState<string | null>(null);
  const [diagnosis, setDiagnosis] = useState<RecommendationData | null>(null);
  const [batchResults, setBatchResults] = useState<BatchBusiness[] | null>(null);
  const [batchActiveIdx, setBatchActiveIdx] = useState<number | null>(null);
  const [batchDiagnoses, setBatchDiagnoses] = useState<Record<number, RecommendationData>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const diagnosisRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, isLoading, scrollToBottom]);

  async function sendMessageWithDisplay(displayText: string, apiText: string) {
    if (!apiText.trim() || isLoading) return;
    const userMessage: ChatMessage = { id: Date.now().toString(), role: "user", text: displayText.trim() };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);
    setToolStatus(null);
    setDiagnosis(null);
    setBatchResults(null);

    try {
      // Send the API text, not the display text
      const apiMessages = updatedMessages.map((m, i) =>
        i === updatedMessages.length - 1
          ? { role: "user", content: apiText }
          : { role: m.role === "user" ? "user" : "assistant", content: m.text }
      );
      const response = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });
      const data = await response.json();
      const agentMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "agent",
        text: data.content || "Something went wrong. Try again.",
        recommendation: data.recommendation || null,
      };
      setMessages((prev) => [...prev, agentMsg]);
      if (data.recommendation) {
        setDiagnosis(data.recommendation);
        setTimeout(() => diagnosisRef.current?.scrollIntoView({ behavior: "smooth" }), 300);
      } else if (data.content) {
        const batch = parseBatchResponse(data.content);
        if (batch && batch.length >= 4) {
          setBatchResults(batch);
          setBatchDiagnoses({});
          // Don't set isLoading false yet — diagnoseAll will do it
          diagnoseAll(batch);
          return;
        }
      }
    } catch {
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "agent",
        text: "Something went wrong. Try again.",
      }]);
    } finally {
      setIsLoading(false);
      setToolStatus(null);
    }
  }

  async function sendMessage(text: string) {
    if (!text.trim() || isLoading) return;
    const userMessage: ChatMessage = { id: Date.now().toString(), role: "user", text: text.trim() };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);
    setToolStatus(null);
    setDiagnosis(null);
    setBatchResults(null);

    try {
      const apiMessages = updatedMessages.map((m) => ({ role: m.role === "user" ? "user" : "assistant", content: m.text }));
      const response = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });
      const data = await response.json();
      const agentMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "agent",
        text: data.content || "Something went wrong. Try again.",
        recommendation: data.recommendation || null,
      };
      setMessages((prev) => [...prev, agentMsg]);
      // Open-ended mode: don't show diagnosis panels or batch results
      // Just show the chat response
    } catch {
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "agent",
        text: "Something went wrong. Try again.",
      }]);
    } finally {
      setIsLoading(false);
      setToolStatus(null);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  }

  function handleBuildSalesPage() {
    if (!diagnosis) return;
    const slug = diagnosis.business_name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    // Use the user's interactive selections, not just AI defaults
    const recData = diagnosis as RecommendationData & { brand_color?: string; logo_url?: string };

    // Find the star and supporting from the diagnosis panel's state
    // We need to read from the DiagnosisPanel, so we store selections in parent state
    localStorage.setItem("clean-sweep-client-page", JSON.stringify({
      name: diagnosis.business_name,
      city: diagnosis.city,
      state: diagnosis.state || "",
      rating: diagnosis.rating || 0,
      reviewCount: diagnosis.review_count || 0,
      compliment: diagnosis.compliment,
      constraint: diagnosis.constraint_label,
      constraintType: diagnosis.constraint_type,
      constraintDetail: diagnosis.constraint_detail,
      confidence: diagnosis.confidence,
      star: diagnosis.star_service,
      supporting: diagnosis.supporting_services,
      unknowns: diagnosis.unknowns,
      brandColor: recData.brand_color || null,
      logoUrl: recData.logo_url || null,
    }));
    window.open(`/client/${slug}?generated=true`, "_blank");
  }

  function handleBatchSelect(idx: number) {
    if (!batchResults) return;
    setBatchActiveIdx(idx);
  }

  // Sync diagnosis with active batch tab
  useEffect(() => {
    if (batchActiveIdx !== null && batchDiagnoses[batchActiveIdx]) {
      setDiagnosis(batchDiagnoses[batchActiveIdx]);
    } else if (batchActiveIdx !== null) {
      setDiagnosis(null);
    }
  }, [batchActiveIdx, batchDiagnoses]);

  // Fire all diagnoses in parallel when batch results arrive
  async function diagnoseAll(businesses: BatchBusiness[]) {
    let firstDone = false;
    // Run in batches of 3 to avoid overwhelming the API
    for (let i = 0; i < businesses.length; i += 3) {
      const batch = businesses.slice(i, i + 3);
      const promises = batch.map(async (b, batchIdx) => {
        const idx = i + batchIdx;
        try {
          const response = await fetch("/api/research", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              messages: [{ role: "user", content: `Investigate "${b.name}". The business name is exactly "${b.name}". Use this exact name in the recommendation card, NOT whatever Google Places returns. Give me the full diagnosis with the recommendation card. Do not ask follow-up questions. Be concise.` }],
            }),
            signal: AbortSignal.timeout(90000),
          });
          const data = await response.json();
          if (data.recommendation) {
            // Always use the original name, never whatever Google returned
            data.recommendation.business_name = b.name;
            setBatchDiagnoses((prev) => ({ ...prev, [idx]: data.recommendation }));
            if (!firstDone) {
              firstDone = true;
              setBatchActiveIdx(idx);
              setDiagnosis(data.recommendation);
            }
          } else {
            // API returned but no recommendation card
            setBatchDiagnoses((prev) => ({ ...prev, [idx]: makeFailed(businesses[idx].name) }));
          }
        } catch {
          setBatchDiagnoses((prev) => ({ ...prev, [idx]: makeFailed(businesses[idx].name) }));
        }
      });
      // Use allSettled so one failure doesn't block the rest
      await Promise.allSettled(promises);
    }
    setIsLoading(false);
  }

  function makeFailed(name: string): RecommendationData {
    return {
      business_name: name, city: "", constraint_type: "just_starting",
      constraint_label: "Could not diagnose",
      compliment: "We couldn't complete the diagnosis for this business.",
      constraint_detail: "The research timed out or failed. Try searching for this business individually.",
      confidence: 0,
      star_service: { id: "website", name: "Gorgeous Website", reason: "Start here." },
      supporting_services: [], unknowns: ["Everything. Research timed out."],
    };
  }

  function startOver() {
    setMessages([]);
    setDiagnosis(null);
    setBatchResults(null);
    setBatchActiveIdx(null);
    setBatchDiagnoses({});
    setToolStatus(null);
    setSelectedNeeds([]);
    setIntakeCity("");
    setIntakeEstablishment("");
    setIntakeReviews("");
    setIntakeCount(12);
    setShowIntake(false);
    setShowResearch(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  }

  const [selectedNeeds, setSelectedNeeds] = useState<string[]>([]);
  const [intakeCity, setIntakeCity] = useState("");
  const [intakeEstablishment, setIntakeEstablishment] = useState<string>("");
  const [intakeReviews, setIntakeReviews] = useState<string>("");
  const [intakeCount, setIntakeCount] = useState<number>(12);
  const [showIntake, setShowIntake] = useState(false);
  const [showResearch, setShowResearch] = useState(false);
  const intakeCityRef = useRef<HTMLInputElement>(null);

  function toggleNeed(need: string) {
    setSelectedNeeds((prev) => prev.includes(need) ? prev.filter((n) => n !== need) : [...prev, need]);
  }

  function handleFindBusinesses() {
    // Enter intake mode
    setShowIntake(true);
    setTimeout(() => intakeCityRef.current?.focus(), 300);
  }

  function handleIntakeSubmit() {
    if (!intakeCity.trim()) {
      intakeCityRef.current?.focus();
      return;
    }
    const needsText = selectedNeeds.length > 0 ? `that likely need help with: ${selectedNeeds.join(", ")}` : "";
    const cityText = intakeCity.trim();
    const ageText = intakeEstablishment ? `Prefer businesses around ${intakeEstablishment} old.` : "";
    const reviewText = intakeReviews ? `Prefer businesses with ${intakeReviews} Google reviews.` : "";
    const estText = [ageText, reviewText].filter(Boolean).join(" ");
    const displayText = `Finding cleaning businesses in ${cityText}...`;
    const apiText = `Use the search_cleaning_businesses tool to find cleaning businesses in ${cityText}. ${needsText} ${estText} After getting the search results, return ONLY a numbered list from those results. Do NOT investigate individual businesses. Do NOT use any other tools. Do NOT ask follow-up questions. Format:\n1. Business Name | City, State | One-line observation from the search data\nNo intro. No summary. No commentary. Just the list.`;
    setShowIntake(false);
    sendMessageWithDisplay(displayText, apiText);
  }

  const hasMessages = messages.length > 0 || showIntake || showResearch;

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[15%] left-[10%] w-[500px] h-[500px] bg-accent/[0.06] rounded-full blur-[150px]" />
        <div className="absolute bottom-[20%] right-[15%] w-[400px] h-[400px] bg-sage/[0.05] rounded-full blur-[130px]" />
      </div>

      {/* Nav */}
      <nav className="shrink-0 relative z-20 border-b border-border/50 bg-surface">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={startOver}>
            <div className="flex items-center gap-2.5 bg-[#131A2E] px-3.5 py-1.5 rounded-xl">
              <span className="text-lg">🔍</span>
              <span className="font-bold text-[#F5F2EB] tracking-tight text-lg" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>The Researcher</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {hasMessages && (
              <button onClick={startOver} className="text-muted hover:text-accent transition-colors font-medium text-sm">
                New research
              </button>
            )}
            <a href="https://sparkles-inc-site.vercel.app" target="_blank" rel="noopener noreferrer" className="text-muted text-sm hover:text-accent transition-colors">by Sparkles Inc</a>
          </div>
        </div>
      </nav>

      {/* Main */}
      <div className="flex-1 flex flex-col relative z-10">
        <AnimatePresence mode="wait">
          {!hasMessages ? (
            /* ─── Landing ─── */
            <motion.div key="hero" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center px-6">
              <div className="max-w-3xl w-full text-center">
                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
                  className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent/15 to-accent/5 border border-accent/10 flex items-center justify-center mb-8 mx-auto shadow-lg shadow-accent/5">
                  <Search size={28} className="text-accent" />
                </motion.div>

                <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
                  className="text-4xl md:text-5xl font-bold text-foreground tracking-tight leading-[1.15] mb-4">
                  Cleaning Industry<br />
                  <span className="gradient-text">Research Assistant.</span>
                </motion.h1>

                <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.35 }}
                  className="text-muted text-lg mb-10 max-w-2xl mx-auto">
                  Weighs sources, flags uncertainty, and synthesizes patterns to surface what you'd miss on your own.
                </motion.p>

                {/* Step 1: Choose your direction */}
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.45 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-2xl mx-auto">

                  {/* Open Ended */}
                  <button onClick={() => { setShowResearch(true); setTimeout(() => inputRef.current?.focus(), 300); }}
                    className="group text-left p-8 rounded-2xl bg-surface border-2 border-border hover:border-accent/40 hover:shadow-lg hover:shadow-accent/5 transition-all">
                    <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-5">
                      <Search size={22} className="text-accent" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground mb-2" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>Open Ended</h3>
                    <p className="text-muted text-base leading-relaxed">Ask questions, test strategies, and get coached through decisions with real data behind it.</p>
                  </button>

                  {/* Business Reach Out */}
                  <button onClick={handleFindBusinesses}
                    className="group text-left p-8 rounded-2xl bg-surface border-2 border-border hover:border-accent/40 hover:shadow-lg hover:shadow-accent/5 transition-all">
                    <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-5">
                      <Target size={22} className="text-accent" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground mb-2" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>Business Reach Out</h3>
                    <p className="text-muted text-base leading-relaxed">Search a city, diagnose businesses, and build a personalized pitch for what they need.</p>
                  </button>
                </motion.div>

              </div>
            </motion.div>
          ) : (
            /* ─── Research + Diagnosis ─── */
            <motion.div key="research" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 overflow-y-auto px-4 py-8">
              <div className="max-w-3xl mx-auto">

                {/* ─── RESEARCH MODE: examples + open input ─── */}
                {showResearch && !showIntake && !messages.length && (
                  <div className="max-w-xl mx-auto flex flex-col items-center pt-12">
                    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
                      className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent/15 to-accent/5 border border-accent/10 flex items-center justify-center mb-6 shadow-lg shadow-accent/5">
                      <Search size={24} className="text-accent" />
                    </motion.div>

                    <motion.h2 initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
                      className="text-3xl font-bold text-foreground tracking-tight text-center mb-2"
                      style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                      What do you want to know?
                    </motion.h2>
                    <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
                      className="text-muted text-base mb-10 text-center max-w-xl">
                      Ask anything. I'll push back, ask questions, and use real data to back it up.
                    </motion.p>

                    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
                      className="w-full flex flex-col gap-3">
                      {[
                        "I'm thinking about lowering my prices to get more clients.",
                        "My competitor has way more reviews but a lower rating. Are they actually better?",
                        "I have 200 reviews but my revenue is flat. What's wrong?",
                        "What separates a 4.8-star business from a 4.5?",
                        "I just started. What should I focus on first?",
                        "How do I know when to raise my prices?",
                      ].map((prompt, i) => (
                        <motion.button key={prompt} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: 0.35 + i * 0.05 }}
                          onClick={() => { setShowResearch(false); sendMessage(prompt); }}
                          className="text-left px-5 py-4 rounded-xl bg-surface border border-border/50 text-muted hover:text-foreground hover:border-accent/30 hover:bg-surface/80 transition-all text-base">
                          {prompt}
                        </motion.button>
                      ))}
                    </motion.div>
                  </div>
                )}

                {/* ─── INTAKE QUESTIONNAIRE ─── */}
                {showIntake && !messages.length && (
                  <div className="max-w-xl mx-auto flex flex-col items-center pt-8">

                    {/* Header */}
                    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
                      className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent/15 to-accent/5 border border-accent/10 flex items-center justify-center mb-6 shadow-lg shadow-accent/5">
                      <Search size={24} className="text-accent" />
                    </motion.div>

                    <motion.h2 initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
                      className="text-3xl md:text-4xl font-bold text-foreground tracking-tight text-center mb-2">
                      Let's narrow it down.
                    </motion.h2>
                    <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
                      className="text-muted/50 text-lg text-center mb-12">
                      A couple questions so I find the right ones.
                    </motion.p>

                    {/* Gap selection */}
                    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
                      className="w-full mb-10">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="w-7 h-7 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent font-bold text-sm">1</span>
                        <span className="text-muted font-medium uppercase tracking-wider text-sm">Looking for gaps in</span>
                      </div>
                      <div className="flex flex-wrap gap-2.5 pl-10">
                        {["Website", "SEO", "Google Ads", "Pricing", "Booking System", "Trust Signals", "Social Media", "Operations"].map((need) => (
                          <button key={need} onClick={() => toggleNeed(need)}
                            className={`px-5 py-2.5 rounded-full font-semibold text-base transition-all ${
                              selectedNeeds.includes(need)
                                ? "bg-accent text-white shadow-lg shadow-accent/20"
                                : "bg-surface border border-border text-foreground hover:border-accent/30"
                            }`}>
                            {need}
                          </button>
                        ))}
                      </div>
                      <p className="text-muted/60 text-sm mt-3 pl-10">Select any that apply, or skip to search broadly.</p>
                    </motion.div>

                    {/* City */}
                    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}
                      className="w-full mb-10">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="w-7 h-7 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent font-bold text-sm">2</span>
                        <label className="text-foreground text-xl font-semibold">What city or region?</label>
                      </div>
                      <div className="pl-10">
                        <div className="relative">
                          <MapPin size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted/30" />
                          <input ref={intakeCityRef} type="text" value={intakeCity} onChange={(e) => setIntakeCity(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter") handleIntakeSubmit(); }}
                            placeholder="e.g. Nashville, TN"
                            className="w-full bg-surface border border-border rounded-xl pl-12 pr-5 py-4 text-foreground text-lg placeholder:text-muted/25 focus:outline-none focus:border-accent/40 focus:shadow-lg focus:shadow-accent/5 transition-all" />
                        </div>
                        <p className="text-muted/25 text-sm mt-2 ml-1">City, state, or region to search in</p>
                      </div>
                    </motion.div>

                    {/* Age + Reviews side by side */}
                    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }}
                      className="w-full mb-12">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="w-7 h-7 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent font-bold text-sm">3</span>
                        <label className="text-foreground text-xl font-semibold">Narrow it down</label>
                      </div>
                      <div className="grid grid-cols-2 gap-6 pl-10">
                        {/* Age */}
                        <div>
                          <p className="text-muted/40 text-sm font-medium uppercase tracking-wider mb-3">Age</p>
                          <div className="flex flex-col gap-2">
                            {[
                              { label: "< 1 year", value: "< 1 year" },
                              { label: "1-3 years", value: "1-3 years" },
                              { label: "3+ years", value: "3+ years" },
                              { label: "Any age", value: "" },
                            ].map((opt) => (
                              <button key={opt.label} onClick={() => setIntakeEstablishment(opt.value)}
                                className={`px-4 py-2.5 rounded-lg font-medium transition-all text-left ${
                                  intakeEstablishment === opt.value
                                    ? "bg-accent text-white shadow-lg shadow-accent/20"
                                    : "bg-surface border border-border text-foreground hover:border-accent/30"
                                }`}>
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        </div>
                        {/* Reviews */}
                        <div>
                          <p className="text-muted/40 text-sm font-medium uppercase tracking-wider mb-3">Google Reviews</p>
                          <div className="flex flex-col gap-2">
                            {[
                              { label: "Few (under 20)", value: "under 20" },
                              { label: "Some (20-100)", value: "20-100" },
                              { label: "Lots (100+)", value: "100+" },
                              { label: "Any amount", value: "" },
                            ].map((opt) => (
                              <button key={opt.label} onClick={() => setIntakeReviews(opt.value)}
                                className={`px-4 py-2.5 rounded-lg font-medium transition-all text-left ${
                                  intakeReviews === opt.value
                                    ? "bg-accent text-white shadow-lg shadow-accent/20"
                                    : "bg-surface border border-border text-foreground hover:border-accent/30"
                                }`}>
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    {/* Go button */}
                    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.6 }}
                      className="w-full pl-10">
                      <button onClick={handleIntakeSubmit}
                        className="group w-full inline-flex items-center justify-center gap-3 bg-gradient-to-br from-accent to-accent-light hover:shadow-xl hover:shadow-accent/25 hover:scale-[1.01] text-white px-8 py-5 rounded-xl text-xl font-semibold transition-all">
                        <Search size={22} />
                        Find cleaning businesses
                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                      </button>
                    </motion.div>
                  </div>
                )}

                {batchResults ? (
                  /* ─── BATCH MODE: Tabs at top, diagnosis below ─── */
                  <div>
                    {/* Folder Tabs — 2 rows of 6 */}
                    <div className="folder-tabs">
                      {batchResults.slice(0, 6).map((b, i) => {
                        const isActive = batchActiveIdx === i;
                        const hue = b.name.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
                        const tabColor = `hsl(${hue}, 60%, 50%)`;
                        return (
                          <button key={i} onClick={() => handleBatchSelect(i)}
                            className={`folder-tab ${isActive ? "active" : ""}`}>
                            <span className="tab-color" style={{ background: tabColor, opacity: batchDiagnoses[i] ? 1 : 0.3 }} />
                            {cleanBusinessName(b.name)}
                            {!batchDiagnoses[i] && <span className="animate-pulse" style={{ fontSize: '14px', marginLeft: 4 }}>...</span>}
                          </button>
                        );
                      })}
                    </div>
                    {batchResults.length > 6 && (
                      <div className="folder-tabs" style={{ marginTop: '-1px' }}>
                        {batchResults.slice(6, 12).map((b, i) => {
                          const idx = i + 6;
                          const isActive = batchActiveIdx === idx;
                          const hue = b.name.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
                          const tabColor = `hsl(${hue}, 60%, 50%)`;
                          return (
                            <button key={idx} onClick={() => handleBatchSelect(idx)}
                              className={`folder-tab ${isActive ? "active" : ""}`}>
                              <span className="tab-color" style={{ background: tabColor, opacity: batchDiagnoses[idx] ? 1 : 0.3 }} />
                              {cleanBusinessName(b.name)}
                              {!batchDiagnoses[idx] && <span className="animate-pulse" style={{ fontSize: '14px', marginLeft: 4 }}>...</span>}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Folder content area */}
                    <div className="folder-content">
                      {isLoading && <div className="p-8"><TypingIndicator toolStatus={toolStatus} /></div>}
                      {diagnosis && (
                        <div className="p-8" ref={diagnosisRef}>
                          <DiagnosisPanel data={diagnosis} onBuildSalesPage={handleBuildSalesPage} />
                        </div>
                      )}
                      {!diagnosis && batchActiveIdx !== null && (
                        <div className="text-center py-20 text-muted/50">
                          <div className="w-10 h-10 border-2 border-accent/30 border-t-accent rounded-full animate-spin mx-auto mb-4" />
                          <p className="mb-2">Diagnosing {batchResults[batchActiveIdx]?.name}...</p>
                          <p className="text-muted/30">{Object.keys(batchDiagnoses).length} of {batchResults.length} diagnosed</p>
                        </div>
                      )}
                      {!diagnosis && batchActiveIdx === null && (
                        <div className="text-center py-20 text-muted/40">
                          <Search size={32} className="mx-auto mb-4 opacity-30" />
                          <p>Select a cleaning business to diagnose.</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* ─── SINGLE MODE: Chat + Diagnosis ─── */
                  <div>
                    <div className="space-y-4 mb-8">
                      {messages.map((msg) => (
                        <motion.div key={msg.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
                          className={msg.role === "user" ? "flex justify-end" : ""}>
                          {msg.role === "user" ? (
                            <div className="max-w-[85%] bg-accent/8 border border-accent/15 rounded-2xl rounded-br-sm px-6 py-4">
                              <p className="text-foreground/90">{msg.text}</p>
                            </div>
                          ) : (
                            <div className="max-w-full">
                              <div className="flex items-center gap-2.5 mb-3">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center border border-accent/10">
                                  <Search size={14} className="text-accent" />
                                </div>
                                <span className="text-muted/50 font-medium">The Researcher</span>
                                <div className="h-px flex-1 bg-border/20" />
                              </div>
                              <div className="bg-surface/50 border border-border/40 rounded-2xl rounded-bl-sm px-6 py-5 leading-relaxed text-muted/70">
                                {renderMarkdown(msg.text)}
                              </div>
                            </div>
                          )}
                        </motion.div>
                      ))}
                      {isLoading && <TypingIndicator toolStatus={toolStatus} />}
                    </div>
                    {diagnosis && (
                      <div ref={diagnosisRef}>
                        <DiagnosisPanel data={diagnosis} onBuildSalesPage={handleBuildSalesPage} />
                      </div>
                    )}
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input — hidden during intake only */}
        <div className={`shrink-0 relative z-20 border-t border-border/30 ${(showIntake && !messages.length) || !hasMessages ? "hidden" : ""}`}>
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/95 to-transparent pointer-events-none -top-8" />
          <div className="relative max-w-3xl mx-auto px-4 py-4">
            <div className="relative">
              <textarea ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
                placeholder={hasMessages ? "Ask a follow-up or research another business..." : "Type a business name or city to research..."}
                disabled={isLoading}
                rows={2}
                className="w-full bg-surface border border-border rounded-xl px-5 py-4 text-foreground text-lg placeholder:text-muted/25 focus:outline-none disabled:opacity-40 transition-all resize-none leading-relaxed" />
              <button onClick={() => sendMessage(input)} disabled={isLoading || !input.trim()}
                className="absolute -right-1 top-1/2 -translate-y-1/2 translate-x-1/2 w-10 h-10 bg-gradient-to-br from-accent to-accent-light hover:shadow-lg hover:shadow-accent/20 rounded-full flex items-center justify-center text-white transition-all disabled:opacity-20">
                <Send size={14} />
              </button>
            </div>
            <p className="text-center text-muted mt-3">Built by <strong className="text-accent font-semibold">Sparkles Inc</strong></p>
          </div>
        </div>
      </div>
    </div>
  );
}
