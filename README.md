# The Researcher

A residential cleaning business intelligence analyst. Part of the Sparkles Inc AI operations layer.

Drop the `researcher/` folder into a Claude project. You get a research partner that investigates cleaning businesses, reasons about what it finds, and helps you make better decisions about the industry.

**Live app:** [app-sparkles-inc.vercel.app](https://app-sparkles-inc.vercel.app)
**Sparkles Inc:** [sparkles-inc-site.vercel.app](https://sparkles-inc-site.vercel.app)

## What makes this different

This isn't a summarizer. It's a researcher with opinions.

It has a reference database of 125+ real cleaning businesses across 10 US cities, with original findings like:

- "Call for quote" pricing costs businesses 0.52 stars on average
- Pricing calculators generate 3x more reviews but actually hurt ratings
- The top 5 predictors of a 4.8+ rating have nothing to do with cleaning quality
- Dense markets have HIGHER average ratings, not lower
- The combination of team photos + personalized copy predicts 4.8+ rating with 100% accuracy in the dataset

These aren't opinions pulled from a blog. They're findings from cross-referencing Google ratings, website features, booking systems, trust signals, and market density data.

The researcher uses these findings to investigate new businesses and markets. It compares what it finds against what the data says should be true. When something doesn't match, it flags it and asks why.

## Quick start

### Option 1: Use the folder

1. Create a new Claude project
2. Upload the `researcher/` folder to the project's knowledge
3. Start a conversation

### Option 2: Use the live app

Visit [app-sparkles-inc.vercel.app](https://app-sparkles-inc.vercel.app) to use the researcher with real-time Google Places integration, website scraping, and business diagnosis.

## Example prompts

**Investigate a market:**
> "What does the cleaning market look like in Austin?"

**Investigate a business:**
> "Research Sparkly Maid Austin. I'm thinking about approaching them about a website."

**Explore a pattern:**
> "What do the best cleaning businesses have in common?"

**Challenge an assumption:**
> "I think businesses with more services get more clients. Is that true?"

The researcher will ask what angle you're working before it starts. It comes back with findings and follow-up questions, not a final report.

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

The researcher doesn't just report signals. It interprets them through frameworks built from lived experience running a cleaning company:

- A 5.0 with 8 reviews means nothing. Friends and family.
- A $75 flat rate with 300 reviews means busy but broke.
- "We do everything" means spread thin, probably not great at any of it.
- Beautiful website with no booking means all show, no conversion.

When the data says one thing and the business presents another, the researcher flags it. That's where the real intelligence lives.

## The app

The Next.js app adds real-time capabilities on top of the folder:

- **Google Places API** for live business search
- **Website scraping** for booking, pricing, and trust signal detection
- **Claude Sonnet** for investigative reasoning
- **Diagnosis cards** with constraint analysis and recommendations
- **Sales page generation** for business outreach

## Built by

**Ruby Sparks** -- founder of Tidy Up Portland, builder of the Shine platform, and someone who's been on both sides of the cleaning business equation. The opinions in this researcher come from lived experience, not theory.
