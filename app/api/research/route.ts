import { NextResponse } from "next/server";
import { SYSTEM_PROMPT } from "@/lib/system-prompt";
import businesses from "../../../cleaning-businesses.json";

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY!;
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY!;

interface Message {
  role: string;
  content: string;
}

// Tool definitions for the researcher
const TOOLS = [
  {
    name: "search_cleaning_businesses",
    description:
      "Search for residential cleaning businesses in a specific city. Returns a list of businesses with their name, rating, review count, website status, and tier.",
    input_schema: {
      type: "object" as const,
      properties: {
        city: {
          type: "string",
          description: "The city to search in, e.g. 'Austin' or 'Denver'",
        },
        state: {
          type: "string",
          description: "The state abbreviation, e.g. 'TX' or 'CO'",
        },
      },
      required: ["city"],
    },
  },
  {
    name: "investigate_business",
    description:
      "Deep investigation of a specific cleaning business. Searches Google Places for detailed info including website, phone, address, rating, reviews, and business status.",
    input_schema: {
      type: "object" as const,
      properties: {
        business_name: {
          type: "string",
          description: "The name of the business to investigate",
        },
        city: {
          type: "string",
          description: "The city the business is in",
        },
        state: {
          type: "string",
          description: "The state abbreviation",
        },
      },
      required: ["business_name"],
    },
  },
  {
    name: "check_website",
    description:
      "Check a business website for quality signals: load time, mobile-friendliness, whether it uses stock photos, has team info, has online booking, has pricing listed, etc.",
    input_schema: {
      type: "object" as const,
      properties: {
        url: {
          type: "string",
          description: "The website URL to check",
        },
      },
      required: ["url"],
    },
  },
  {
    name: "get_market_stats",
    description:
      "Get aggregated statistics about cleaning businesses in a market from our research database. Shows counts, average ratings, common gaps, and top opportunities.",
    input_schema: {
      type: "object" as const,
      properties: {
        city: {
          type: "string",
          description: "City to get stats for, or 'all' for nationwide",
        },
      },
      required: ["city"],
    },
  },
  {
    name: "get_random_opportunity",
    description:
      "Pull a random business from our database that represents a good opportunity (Rescue tier or underserved). Good for demos and exploration.",
    input_schema: {
      type: "object" as const,
      properties: {},
      required: [],
    },
  },
  {
    name: "find_social_profiles",
    description: "Search Google for a business's social media profiles (Instagram, Facebook, Yelp, Nextdoor). Returns verified URLs only. Call this after investigating a business to find their real social links.",
    input_schema: {
      type: "object" as const,
      properties: {
        business_name: { type: "string", description: "The business name" },
        city: { type: "string", description: "City" },
        state: { type: "string", description: "State abbreviation" },
      },
      required: ["business_name", "city"],
    },
  },
  {
    name: "generate_recommendation_card",
    description:
      "ALWAYS call this tool at the end of every business investigation to generate a structured recommendation card. This creates a visual card the user can use to build a client sales page.",
    input_schema: {
      type: "object" as const,
      properties: {
        business_name: { type: "string", description: "The business name" },
        city: { type: "string", description: "City" },
        state: { type: "string", description: "State abbreviation" },
        rating: { type: "number", description: "Google rating" },
        review_count: { type: "number", description: "Number of reviews" },
        website: { type: "string", description: "Business website URL if found, or 'None'" },
        phone: { type: "string", description: "Business phone number if found" },
        address: { type: "string", description: "Business address if found" },
        constraint_type: {
          type: "string",
          enum: ["not_enough_customers", "not_enough_revenue", "losing_clients", "ready_to_scale", "just_starting"],
          description: "The primary constraint diagnosed",
        },
        constraint_label: { type: "string", description: "Human-readable constraint label, e.g. 'Not Enough Customers'" },
        compliment: { type: "string", description: "What they're doing right. Use bullet points (lines starting with '- '). 2-3 bullets max. No paragraphs." },
        constraint_detail: { type: "string", description: "Why this is the constraint. Use bullet points (lines starting with '- '). 2-3 bullets of evidence. No paragraphs." },
        confidence: { type: "number", description: "Confidence percentage (0-100)" },
        star_service: {
          type: "object",
          properties: {
            id: { type: "string", description: "Product ID: website, seo, google-ads, instagram, facebook, brand-guide, ai-ops, calculator, skool, coaching" },
            name: { type: "string", description: "Plain name: Website, SEO, Google Ads, Instagram, Facebook, Brand Guide, AI Automation, Pricing Calculator, Free Courses, Coaching" },
            reason: { type: "string", description: "Why this is the #1 priority (1 sentence)" },
          },
          required: ["id", "name", "reason"],
        },
        supporting_services: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string", description: "Product ID: website, seo, google-ads, instagram, facebook, brand-guide, ai-ops, calculator, skool, coaching" },
              name: { type: "string", description: "Plain name: Website, SEO, Google Ads, Instagram, Facebook, Brand Guide, AI Automation, Pricing Calculator, Free Courses, Coaching" },
              reason: { type: "string", description: "Why this is recommended (1 sentence)" },
            },
            required: ["id", "name", "reason"],
          },
          description: "Up to 3 supporting services",
        },
        unknowns: {
          type: "array",
          items: { type: "string" },
          description: "Things that couldn't be determined and should be verified on a call",
        },
      },
        brand_color: { type: "string", description: "Hex color extracted from their website (e.g. #6B21A8). Pass if found during check_website." },
        logo_url: { type: "string", description: "Logo URL extracted from their website. Pass if found during check_website." },
        social_facebook: { type: "string", description: "Facebook page URL if found on their website." },
        social_instagram: { type: "string", description: "Instagram profile URL if found on their website." },
        social_yelp: { type: "string", description: "Yelp business page URL if found on their website." },
        social_nextdoor: { type: "string", description: "Nextdoor page URL if found on their website." },
      required: ["business_name", "city", "constraint_type", "constraint_label", "compliment", "constraint_detail", "confidence", "star_service", "supporting_services", "unknowns"],
    },
  },
];

// Tool implementations
async function searchCleaningBusinesses(city: string, state?: string) {
  // First check our local database
  const local = (businesses as Record<string, unknown>[]).filter(
    (b) =>
      (b.city as string).toLowerCase() === city.toLowerCase() ||
      (b.city as string).toLowerCase().includes(city.toLowerCase())
  );

  if (local.length > 0) {
    return {
      source: "research_database",
      count: local.length,
      businesses: local
        .sort(
          (a, b) =>
            (b.reviewCount as number) - (a.reviewCount as number)
        )
        .slice(0, 15)
        .map((b) => ({
          name: b.name,
          city: b.city,
          state: b.state,
          rating: b.rating,
          reviewCount: b.reviewCount,
          website: b.website || "None",
          websiteStatus: b.websiteStatus,
          tier: b.tier,
          phone: b.phone,
          address: b.address,
        })),
    };
  }

  // If not in database, search Google Places
  if (!GOOGLE_MAPS_API_KEY) {
    return {
      source: "none",
      error:
        "City not in research database and Google Places API not configured.",
    };
  }

  try {
    const query = `house cleaning service in ${city}${state ? ` ${state}` : ""}`;
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${GOOGLE_MAPS_API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.status !== "OK") {
      return { source: "google_places", error: `API error: ${data.status}` };
    }

    return {
      source: "google_places_live",
      count: data.results?.length || 0,
      businesses: (data.results || []).slice(0, 15).map(
        (r: {
          name: string;
          rating?: number;
          user_ratings_total?: number;
          formatted_address?: string;
          business_status?: string;
        }) => ({
          name: r.name,
          rating: r.rating || "N/A",
          reviewCount: r.user_ratings_total || 0,
          address: r.formatted_address || "",
          status: r.business_status || "OPERATIONAL",
        })
      ),
    };
  } catch {
    return { source: "google_places", error: "Failed to fetch from Google Places API" };
  }
}

async function investigateBusiness(
  businessName: string,
  city?: string,
  state?: string
) {
  // Check local database first
  const local = (businesses as Record<string, unknown>[]).find(
    (b) =>
      (b.name as string).toLowerCase().includes(businessName.toLowerCase()) &&
      (!city ||
        (b.city as string).toLowerCase() === city.toLowerCase())
  );

  if (local) {
    return {
      source: "research_database",
      name: local.name,
      city: local.city,
      state: local.state,
      phone: local.phone,
      address: local.address,
      website: local.website || "None",
      websiteStatus: local.websiteStatus,
      rating: local.rating,
      reviewCount: local.reviewCount,
      tier: local.tier,
      loadTime: local.loadTime,
    };
  }

  // Try Google Places
  if (!GOOGLE_MAPS_API_KEY) {
    return { source: "none", error: "Business not in database and API not configured." };
  }

  try {
    const query = `${businessName}${city ? ` ${city}` : ""}${state ? ` ${state}` : ""}`;
    const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${GOOGLE_MAPS_API_KEY}`;
    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();

    if (
      searchData.status !== "OK" ||
      !searchData.results ||
      searchData.results.length === 0
    ) {
      return { source: "google_places", error: "Business not found" };
    }

    const placeId = searchData.results[0].place_id;
    const detailUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_phone_number,formatted_address,website,rating,user_ratings_total,business_status,opening_hours&key=${GOOGLE_MAPS_API_KEY}`;
    const detailRes = await fetch(detailUrl);
    const detailData = await detailRes.json();
    const d = detailData.result || {};

    return {
      source: "google_places_live",
      name: d.name || businessName,
      phone: d.formatted_phone_number || "Not found",
      address: d.formatted_address || "Not found",
      website: d.website || "None",
      rating: d.rating || "N/A",
      reviewCount: d.user_ratings_total || 0,
      businessStatus: d.business_status || "Unknown",
      hours: d.opening_hours?.weekday_text || "Not available",
    };
  } catch {
    return { source: "google_places", error: "Failed to investigate business" };
  }
}

async function checkWebsite(url: string) {
  try {
    const start = Date.now();
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      redirect: "follow",
      signal: AbortSignal.timeout(8000),
    });
    const loadTime = Date.now() - start;
    const finalUrl = res.url;
    const html = await res.text();

    // Check if we got a meaningful page or a JS shell
    const textContent = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    const contentLength = textContent.length;
    const isJSRendered = contentLength < 500 && (html.includes("__NEXT_DATA__") || html.includes("react-root") || html.includes("app-root") || html.includes("id=\"root\""));
    const redirected = finalUrl !== url && new URL(finalUrl).hostname !== new URL(url).hostname;

    if (isJSRendered) {
      return {
        warning: "Limited view. This site is JavaScript-rendered. Our static scrape may miss content that loads dynamically in a browser. Findings below may be incomplete. Do NOT make definitive claims about missing features.",
        finalUrl,
        redirected: redirected ? `Redirected to ${finalUrl}` : false,
        loadTime: `${loadTime}ms`,
      };
    }

    const lowerHtml = html.toLowerCase();
    const hasViewport = lowerHtml.includes('name="viewport"') || lowerHtml.includes("name='viewport'");
    const hasResponsiveCSS = lowerHtml.includes("@media") && lowerHtml.includes("max-width");
    const isMobileFriendly = hasViewport || hasResponsiveCSS;

    // Check for actual booking widgets/forms, not just the word "book"
    const hasBookingWidget = /book[\s-]?(now|online|today|cleaning|service|appointment)|schedule[\s-]?(now|online|today|cleaning|a\s)/i.test(html);
    const hasBookingForm = /<form[\s\S]*?(book|schedule|appointment)[\s\S]*?<\/form>/i.test(html);
    const hasBookingLink = /href=["'][^"']*\b(book|booking|schedule|appointment)\b[^"']*["']/i.test(html);
    const hasOnlineBooking = hasBookingWidget || hasBookingForm || hasBookingLink;

    // Check for actual quote/estimate forms
    const hasQuoteForm = /(?:get|request|free)\s*(?:a\s*)?(?:quote|estimate)|instant\s*(?:quote|estimate)|pricing\s*calculator/i.test(html);

    // Check for real team/about content (not just any mention of "team")
    const hasAboutPage = /href=["'][^"']*(?:about|our-team|meet-the-team|our-story)[^"']*["']/i.test(html);
    const hasTeamPhotos = /(?:our\s+team|meet\s+(?:the\s+)?team|about\s+us|our\s+story|our\s+cleaners)/i.test(html) && /<img/i.test(html);
    const hasOwnerName = /(?:owner|founder|ceo|started\s+by|created\s+by|run\s+by)/i.test(html);

    const usesJobber = lowerHtml.includes("jobber") || lowerHtml.includes("getjobber");
    const usesLaunch27 = lowerHtml.includes("launch27");
    const usesHousecallPro = lowerHtml.includes("housecallpro");
    const isWix = lowerHtml.includes("wix.com");
    const isGodaddy = lowerHtml.includes("godaddy");
    const isWeebly = lowerHtml.includes("weebly");
    const isSquarespace = lowerHtml.includes("squarespace");
    const isWebnode = lowerHtml.includes("webnode");
    const isWordpress = lowerHtml.includes("wp-content") || lowerHtml.includes("wordpress");

    // Data-backed quality signals (broad patterns to reduce false negatives)
    const hasGuarantee = /guarantee|guaranteed|re-?clean|we['']ll\s*come\s*back|money\s*back|100%\s*satisfaction|satisfaction|risk[\s-]?free|happiness\s*guarantee/i.test(html);
    const hasBackgroundChecks = /background\s*check|background[\s-]screened|vetted|screened|bonded\s*(and|&)\s*insured|insured\s*(and|&)\s*bonded|fully\s*insured|criminal\s*check|trusted\s*(and|&)\s*verified/i.test(html);
    const hasPackages = (/deep\s*clean|move[\s-]?(?:in|out)|spring\s*clean|one[\s-]?time\s*clean|recurring|maintenance\s*clean/i.test(html) && /(?:standard|regular|basic|routine|weekly|bi[\s-]?weekly|monthly)\s*clean/i.test(html)) || /(?:our|cleaning)\s*(?:services|packages)/i.test(html) && /deep/i.test(html);
    const hasRecurringDiscounts = /(?:weekly|bi[\s-]?weekly|monthly)\s*(?:discount|save|savings)|frequency\s*discount|recurring\s*(?:discount|save)/i.test(html);
    const hasResponseGuarantee = /respond\s*(?:within|in)\s*\d|(?:same|next)\s*(?:day|hour)\s*(?:response|reply|quote)|(?:\d+)\s*(?:minute|hour)\s*(?:response|reply)/i.test(html);
    const hasPricingShown = /\$\s*\d{2,4}(?:\s*[-–]\s*\$?\s*\d{2,4})?/i.test(html);
    const hasGiftCards = /gift\s*(?:card|certificate|package)|give\s*the\s*gift/i.test(html);
    const hasBlog = /\/blog\b|\/articles\b|\/posts\b|class=["'][^"']*blog/i.test(html);
    const hasBeforeAfter = /before\s*(?:&|and)\s*after|before\/after/i.test(html);
    const hasVideo = /<video|youtube\.com\/embed|vimeo\.com\/|wistia/i.test(html);

    // SEO signals
    const hasMetaDescription = /<meta[^>]*name=["']description["'][^>]*content=["'][^"']{20,}/i.test(html);
    const hasH1 = /<h1[\s>]/i.test(html);
    const titleTag = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] || "";
    const hasLocalSEO = new RegExp(titleTag.length > 10 ? "clean" : "NOMATCH", "i").test(titleTag);

    // Extract brand color
    let brandColor: string | null = null;
    // 1. meta theme-color
    const themeColorMatch = html.match(/<meta[^>]*name=["']theme-color["'][^>]*content=["']([^"']+)["']/i);
    if (themeColorMatch) brandColor = themeColorMatch[1];
    // 2. Most common hex color in inline styles/CSS (rough heuristic)
    if (!brandColor) {
      const hexColors = html.match(/#[0-9a-fA-F]{6}/g) || [];
      const colorCounts: Record<string, number> = {};
      for (const c of hexColors) {
        const lower = c.toLowerCase();
        if (lower === "#ffffff" || lower === "#000000" || lower === "#f8f8f8" || lower === "#333333" || lower === "#e5e7eb") continue;
        colorCounts[lower] = (colorCounts[lower] || 0) + 1;
      }
      const sorted = Object.entries(colorCounts).sort((a, b) => b[1] - a[1]);
      if (sorted.length > 0) brandColor = sorted[0][0];
    }

    // Extract logo URL
    let logoUrl: string | null = null;
    // 1. og:image
    const ogMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
    if (ogMatch) logoUrl = ogMatch[1];
    // 2. First img in header/nav area (rough heuristic)
    if (!logoUrl) {
      const headerImgMatch = html.match(/<(?:header|nav)[^>]*>[\s\S]*?<img[^>]*src=["']([^"']+)["']/i);
      if (headerImgMatch) {
        logoUrl = headerImgMatch[1];
        if (logoUrl.startsWith("/")) {
          const urlObj = new URL(url);
          logoUrl = urlObj.origin + logoUrl;
        }
      }
    }
    // Extract social media links
    const socialLinks: Record<string, string> = {};
    const socialPatterns = [
      { name: "facebook", pattern: /href=["'](https?:\/\/(?:www\.)?facebook\.com\/[^"'\s]+)["']/gi },
      { name: "instagram", pattern: /href=["'](https?:\/\/(?:www\.)?instagram\.com\/[^"'\s]+)["']/gi },
      { name: "yelp", pattern: /href=["'](https?:\/\/(?:www\.)?yelp\.com\/biz\/[^"'\s]+)["']/gi },
      { name: "nextdoor", pattern: /href=["'](https?:\/\/(?:www\.)?nextdoor\.com\/[^"'\s]+)["']/gi },
      { name: "twitter", pattern: /href=["'](https?:\/\/(?:www\.)?(?:twitter|x)\.com\/[^"'\s]+)["']/gi },
      { name: "tiktok", pattern: /href=["'](https?:\/\/(?:www\.)?tiktok\.com\/@[^"'\s]+)["']/gi },
      { name: "youtube", pattern: /href=["'](https?:\/\/(?:www\.)?youtube\.com\/[^"'\s]+)["']/gi },
      { name: "linkedin", pattern: /href=["'](https?:\/\/(?:www\.)?linkedin\.com\/[^"'\s]+)["']/gi },
    ];
    for (const { name, pattern } of socialPatterns) {
      const match = pattern.exec(html);
      if (match) socialLinks[name] = match[1];
    }

    // Verify social links actually exist (parallel HEAD checks, 3s timeout each)
    const socialCheckResults = await Promise.allSettled(
      Object.entries(socialLinks).map(async ([name, socialUrl]) => {
        try {
          const check = await fetch(socialUrl, {
            method: "HEAD",
            headers: { "User-Agent": "Mozilla/5.0" },
            redirect: "follow",
            signal: AbortSignal.timeout(3000),
          });
          if (check.status === 404 || check.status === 410) {
            return { name, valid: false };
          }
          return { name, valid: true };
        } catch {
          return { name, valid: false };
        }
      })
    );
    for (const result of socialCheckResults) {
      if (result.status === "fulfilled" && !result.value.valid) {
        delete socialLinks[result.value.name];
      } else if (result.status === "rejected") {
        // If the promise itself rejected, remove the link
      }
    }

    // 3. Favicon as fallback
    if (!logoUrl) {
      const faviconMatch = html.match(/<link[^>]*rel=["'](?:icon|shortcut icon|apple-touch-icon)["'][^>]*href=["']([^"']+)["']/i);
      if (faviconMatch) {
        logoUrl = faviconMatch[1];
        if (logoUrl.startsWith("/")) {
          const urlObj = new URL(url);
          logoUrl = urlObj.origin + logoUrl;
        }
      }
    }

    return {
      scrapeConfidence: contentLength > 2000 ? "High - full HTML content scraped" : contentLength > 500 ? "Medium - partial content, some features may not be detected" : "Low - very little content found, site may be JS-rendered. Do NOT claim features are missing. Say 'not detected' instead.",
      contentLength,
      finalUrl,
      redirected: redirected ? `Redirected to ${finalUrl}` : false,
      loadTime: `${loadTime}ms`,
      mobileReady: isMobileFriendly,
      mobileDetails: hasViewport ? "Has viewport meta tag" : hasResponsiveCSS ? "Has responsive CSS but no viewport tag" : "No responsive indicators found",
      hasOnlineBooking,
      bookingDetails: hasBookingWidget ? "Booking button/CTA found" : hasBookingForm ? "Booking form found" : hasBookingLink ? "Booking link found" : "No booking system detected",
      hasQuoteForm,
      hasTeamInfo: hasTeamPhotos || hasOwnerName,
      teamDetails: hasOwnerName ? "Owner/founder mentioned" : hasTeamPhotos ? "Team section with images found" : hasAboutPage ? "About page link exists but no team content on homepage" : "No team or owner info found",
      brandColor,
      logoUrl,
      socialLinks: Object.keys(socialLinks).length > 0 ? socialLinks : "None found on website (they may still have profiles)",
      platform: isWix ? "Wix" : isGodaddy ? "GoDaddy" : isWeebly ? "Weebly" : isSquarespace ? "Squarespace" : isWebnode ? "Webnode" : isWordpress ? "WordPress" : "Custom/Other",
      software: usesJobber
        ? "Jobber"
        : usesLaunch27
          ? "Launch27"
          : usesHousecallPro
            ? "Housecall Pro"
            : "None detected",
      loadTimeAssessment:
        loadTime < 2000
          ? "Fast"
          : loadTime < 4000
            ? "Acceptable"
            : "Slow - losing visitors",
      // Data-backed quality signals
      hasGuarantee,
      hasBackgroundChecks,
      hasPackages,
      hasRecurringDiscounts,
      hasResponseGuarantee,
      hasPricingShown,
      pricingNote: !hasPricingShown ? "LIMITATION: We can only detect pricing shown as plain text on the page. We cannot read booking forms, quote forms, or pricing calculators yet. If this site has a booking or quote form, pricing may be inside it. Tell the user: 'I can't read booking forms or quote forms yet. That's coming soon. If your pricing is inside your booking widget, I wouldn't have seen it.'" : "Pricing visible on page",
      hasGiftCards,
      hasBlog,
      hasBeforeAfter,
      hasVideo,
      // SEO signals
      seo: {
        hasMetaDescription,
        hasH1,
        titleTag: titleTag || "None",
        hasLocalKeywordsInTitle: hasLocalSEO,
      },
    };
  } catch {
    return { error: "Website unreachable or timed out. Could not analyze. Do NOT guess about their website features." };
  }
}

function getMarketStats(city: string) {
  const data = businesses as Record<string, unknown>[];
  const filtered =
    city.toLowerCase() === "all"
      ? data
      : data.filter(
          (b) =>
            (b.city as string).toLowerCase() === city.toLowerCase()
        );

  if (filtered.length === 0) {
    return { error: `No data for ${city}. Available cities: ${[...new Set(data.map((b) => b.city))].join(", ")}` };
  }

  const rescue = filtered.filter((b) => b.tier === "Rescue");
  const noWebsite = filtered.filter((b) => b.websiteStatus === "No website");
  const outdated = filtered.filter((b) => b.websiteStatus === "Outdated");
  const ratings = filtered.map((b) => b.rating as number).filter((r) => r > 0);
  const reviews = filtered.map((b) => b.reviewCount as number);

  return {
    city: city === "all" ? "All markets" : city,
    totalBusinesses: filtered.length,
    rescueTier: rescue.length,
    elevationTier: filtered.length - rescue.length,
    noWebsite: noWebsite.length,
    outdatedWebsite: outdated.length,
    averageRating: ratings.length > 0 ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : "N/A",
    averageReviews: reviews.length > 0 ? Math.round(reviews.reduce((a, b) => a + b, 0) / reviews.length) : 0,
    topOpportunities: rescue
      .sort((a, b) => (b.reviewCount as number) - (a.reviewCount as number))
      .slice(0, 5)
      .map((b) => ({
        name: b.name,
        city: b.city,
        reviewCount: b.reviewCount,
        rating: b.rating,
        websiteStatus: b.websiteStatus,
      })),
    availableCities: [...new Set(data.map((b) => b.city))],
  };
}

function getRandomOpportunity() {
  const data = businesses as Record<string, unknown>[];
  const opportunities = data.filter(
    (b) => b.tier === "Rescue" && (b.reviewCount as number) > 5
  );
  if (opportunities.length === 0) {
    return { error: "No opportunities found" };
  }
  const random = opportunities[Math.floor(Math.random() * opportunities.length)];
  return {
    name: random.name,
    city: random.city,
    state: random.state,
    phone: random.phone,
    address: random.address,
    website: random.website || "None",
    websiteStatus: random.websiteStatus,
    rating: random.rating,
    reviewCount: random.reviewCount,
    tier: random.tier,
  };
}

async function findSocialProfiles(businessName: string, city: string, state?: string) {
  const profiles: Record<string, string> = {};
  const slug = businessName.toLowerCase().replace(/[^a-z0-9]/g, "");

  const checks = [
    { platform: "instagram", url: `https://www.instagram.com/${slug}/` },
    { platform: "facebook", url: `https://www.facebook.com/${slug}/` },
  ];

  // Run all HEAD checks in parallel with short timeout
  const results = await Promise.allSettled(
    checks.map(async ({ platform, url }) => {
      const res = await fetch(url, {
        method: "HEAD",
        headers: { "User-Agent": "Mozilla/5.0" },
        redirect: "follow",
        signal: AbortSignal.timeout(3000),
      });
      return { platform, url, status: res.status };
    })
  );

  for (const result of results) {
    if (result.status === "fulfilled" && result.value.status !== 404 && result.value.status !== 410) {
      profiles[result.value.platform] = result.value.url;
    }
  }

  return {
    profiles: Object.keys(profiles).length > 0 ? profiles : "No verified profiles found",
    note: "Only profiles that responded with a valid page are included.",
  };
}

async function executeTool(
  name: string,
  input: Record<string, string>
): Promise<string> {
  switch (name) {
    case "search_cleaning_businesses":
      return JSON.stringify(
        await searchCleaningBusinesses(input.city, input.state)
      );
    case "investigate_business":
      return JSON.stringify(
        await investigateBusiness(
          input.business_name,
          input.city,
          input.state
        )
      );
    case "check_website":
      return JSON.stringify(await checkWebsite(input.url));
    case "get_market_stats":
      return JSON.stringify(getMarketStats(input.city));
    case "get_random_opportunity":
      return JSON.stringify(getRandomOpportunity());
    case "find_social_profiles":
      return JSON.stringify(
        await findSocialProfiles(input.business_name, input.city, input.state)
      );
    case "generate_recommendation_card":
      // This tool just passes the structured data back. The frontend renders it.
      return JSON.stringify({ status: "recommendation_card_generated", data: input });
    default:
      return JSON.stringify({ error: `Unknown tool: ${name}` });
  }
}

// Allow up to 120 seconds for complex multi-tool investigations
export const maxDuration = 120;

export async function POST(request: Request) {
  const { messages } = (await request.json()) as { messages: Message[] };

  const apiMessages = messages.map((m) => ({
    role: m.role === "user" ? "user" : "assistant",
    content: m.content,
  }));

  // Track recommendation card data across tool calls
  let recommendationCard: Record<string, unknown> | null = null;
  const startTime = Date.now();
  const MAX_TIME = 110000; // 110 second server-side cap (maxDuration is 120)

  // Tool use loop (up to 8 iterations)
  let currentMessages = apiMessages;
  for (let i = 0; i < 8; i++) {
    // Bail if we're running too long
    if (Date.now() - startTime > MAX_TIME) {
      break;
    }
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4096,
        system: SYSTEM_PROMPT + "\n\nIMPORTANT: After completing any individual business investigation, ALWAYS call the generate_recommendation_card tool with your structured findings. This is required for every investigation.",
        tools: TOOLS,
        messages: currentMessages,
      }),
    });

    const data = await response.json();

    if (data.stop_reason === "tool_use" || (data.content && data.content.some((b: { type: string }) => b.type === "tool_use"))) {
      const toolBlocks = data.content.filter(
        (b: { type: string }) => b.type === "tool_use"
      );

      currentMessages = [
        ...currentMessages,
        { role: "assistant", content: data.content },
      ];

      for (const tool of toolBlocks) {
        // Capture recommendation card data before executing
        if (tool.name === "generate_recommendation_card") {
          recommendationCard = tool.input;
        }

        const result = await executeTool(tool.name, tool.input);
        currentMessages = [
          ...currentMessages,
          {
            role: "user",
            content: [
              {
                type: "tool_result",
                tool_use_id: tool.id,
                content: result,
              },
            ],
          },
        ] as typeof currentMessages;
      }

      continue;
    }

    // Extract text response
    const text =
      data.content
        ?.filter((b: { type: string }) => b.type === "text")
        .map((b: { text: string }) => b.text)
        .join("") || "Something went wrong. Try again.";

    return NextResponse.json({ content: text, recommendation: recommendationCard });
  }

  return NextResponse.json({
    content: "Investigation is taking longer than expected. Try a more specific query.",
    recommendation: recommendationCard,
  });
}
