# The Researcher

Residential cleaning intelligence by Sparkles Inc.

Backed by industry insights from a business owner who's done over 10,000 jobs in the luxury house cleaning space. Stop making decisions on vibes. See real businesses, real data, in real time.

**Live app:** [app-sparkles-inc.vercel.app](https://app-sparkles-inc.vercel.app)
**Sparkles Inc:** [sparkles-inc-site.vercel.app](https://sparkles-inc-site.vercel.app)
**IG Content Mockups:** [app-sparkles-inc.vercel.app/ig-mockups.html](https://app-sparkles-inc.vercel.app/ig-mockups.html)

## What it does

- **Finds and assesses** cleaning businesses and markets in any US city
- **Cross-examines** competitor and industry data against what businesses actually offer
- **Weighs findings** against internal frameworks and opinions built from lived experience
- **Coaches on strategy** and direction, asking questions before diagnosing
- **Recommends services and products** to sell based on each business's primary constraint
- **Creates a sales page** for cleaning businesses in their brand colors, with specific, researched recommendations

## What makes this different

This isn't a summarizer. It's a researcher with opinions.

It cross-examines real businesses and surfaces findings you wouldn't catch on your own. Things like:

- "Call for quote" pricing correlates with a 0.52 star rating drop
- Pricing calculators generate 3x more reviews but actually hurt ratings
- The top 5 predictors of a 4.8+ rating have nothing to do with cleaning quality

The frameworks behind these insights come from running a real cleaning company. The tool applies them to any market, any business, in real time. When the data says one thing and the business presents another, the researcher flags it. Contradictions are where the real intelligence lives.

## Quick start

### Option 1: Use the folder

1. Create a new Claude project
2. Upload the `researcher/` folder to the project's knowledge
3. Start a conversation

### Option 2: Use the live app

Visit [app-sparkles-inc.vercel.app](https://app-sparkles-inc.vercel.app) to use the researcher with real-time Google Places integration, website scraping, and business diagnosis.

**See an example output:** [Superb Maids Portland -- Diagnose & Offer Services](https://app-sparkles-inc.vercel.app/client/superb-maids-portland?generated=true)

## Example prompts

**Investigate a market:**
> "What does the cleaning market look like in Austin?"

**Investigate a business:**
> "Research Sparkly Maid Austin. I'm thinking about approaching them about a website."

**Explore a pattern:**
> "What do the best cleaning businesses have in common?"

**Challenge an assumption:**
> "I think businesses with more services get more clients. Is that true?"

The researcher asks what angle you're working before it starts. It comes back with findings and follow-up questions, not a final report.

## What's in the researcher folder

```
researcher/
  identity.md          -- Who the researcher is and its role
  rules.md             -- How it thinks, investigates, and reasons
  examples.md          -- Real conversations showing the researcher in action
  reference/
    booking-ratings-research.md      -- 50 businesses: booking type vs ratings
    deep-business-analysis.md        -- 35 businesses: 98-point scoring model
    gbp-pricing-density-research.md  -- 40 businesses: GBP, pricing, market density
    rating-correlation-analysis.md   -- 101 businesses: what predicts rating
    constraint-framework.md          -- Three growth levers + special cases
    signal-checklist.md              -- Every signal with specific thresholds
    source-credibility.md            -- How to weigh different data sources
    must-have-checklist.md           -- 27-point operational scoring rubric
  README.md            -- Folder-specific readme
```

## How it reasons

The researcher doesn't just report signals. It interprets them through frameworks built from running a real cleaning company:

- A 5.0 with 8 reviews means nothing. Friends and family.
- A $75 flat rate with 300 reviews means busy but broke.
- "We do everything" means spread thin, probably not great at any of it.
- Beautiful website with no booking means all show, no conversion.

Make progress faster, create a unicorn business, supercharge your strategies.

## The app

The Next.js app adds real-time capabilities on top of the folder:

- **Google Places API** for live business search in any US city
- **Website scraping** for booking, pricing, and trust signal detection
- **Claude Sonnet** for investigative reasoning
- **Diagnosis cards** with constraint analysis and recommendations
- **Sales page generation** with brand colors and personalized outreach

## Built by

**Ruby Sparks** -- founder of Tidy Up Portland, builder of the Shine platform, and someone who's been on both sides of the cleaning business equation. The opinions in this researcher come from lived experience, not theory.
