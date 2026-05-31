# The Researcher

A residential cleaning business intelligence analyst. Part of the Sparkles Inc AI operations layer.

Drop this folder into a Claude project. You get a research partner that investigates cleaning businesses, reasons about what it finds, and helps you make better decisions about the industry.

## What makes this different

This isn't a summarizer. It's a researcher with opinions.

It has analyzed 125+ real cleaning businesses across 10 US cities and discovered patterns like:

- "Call for quote" pricing costs businesses 0.52 stars on average
- Pricing calculators generate 3x more reviews but actually hurt ratings
- The top 5 predictors of a 4.8+ rating have nothing to do with cleaning quality
- Dense markets have HIGHER average ratings, not lower
- The combination of team photos + personalized copy predicts 4.8+ rating with 100% accuracy in the dataset

These patterns were discovered by running the tool on real businesses, cross-referencing Google ratings, website features, booking systems, trust signals, and market density data. This dataset will grow as we analyze more markets.

The researcher uses these findings to investigate new businesses and markets. It compares what it finds against what the data says should be true. When something doesn't match, it flags it and asks why.

## Quick start

1. Create a new Claude project
2. Upload this entire folder to the project's knowledge
3. Start a conversation:

**To investigate a market:**
> "What does the cleaning market look like in Austin?"

**To investigate a business:**
> "Research Sparkly Maid Austin. I'm thinking about approaching them about a website."

**To explore a pattern:**
> "What do the best cleaning businesses have in common?"

**To challenge an assumption:**
> "I think businesses with more services get more clients. Is that true?"

The researcher will ask what angle you're working before it starts. Answer that, and it goes to work. It will come back with findings and follow-up questions, not a final report.

## What's in this folder

```
researcher/
  identity.md          — Who the researcher is and its role at Sparkles Inc
  rules.md             — How it thinks, investigates, and reasons
  examples.md          — Real conversations showing the researcher in action
  reference/
    # Frameworks (from lived experience)
    constraint-framework.md          — The three growth levers every business maps to
    source-credibility.md            — How to weigh different data sources
    signal-checklist.md              — Every signal with specific thresholds
    must-have-checklist.md           — 27-point operational scoring rubric

    # Expertise (Ruby's opinions from 10,000+ jobs)
    pricing-expertise.md             — How cleaning pricing actually works
    hiring-expertise.md              — What to look for in cleaners
    operations-and-growth-expertise.md — Scaling, systems, bottlenecks
    client-management-expertise.md   — Retention, communication, upsells

    # Patterns (discovered by running the tool on real businesses)
    booking-ratings-research.md      — Booking type vs rating patterns (50 businesses)
    deep-business-analysis.md        — Website feature scoring (35 businesses)
    gbp-pricing-density-research.md  — GBP, pricing, market density (40 businesses)
    rating-correlation-analysis.md   — What actually predicts ratings (101 businesses)
  README.md            — You're reading it
```

## The three things it does

### 1. Find businesses to help
Search a city. The researcher finds independent cleaning businesses (skips franchises), evaluates their digital footprint, and identifies which ones have gaps you can fill.

### 2. Study market patterns
Cross-reference data across businesses and cities. What separates 4.8+ from the rest? How does market density affect competition? What pricing strategies work? The researcher draws on its reference database to find patterns.

### 3. Recommend next steps
Based on findings, the researcher diagnoses the primary growth constraint and recommends what to do about it, with specific reasoning tied to the evidence.

## How it reasons

The researcher doesn't just report signals. It interprets them through frameworks built from lived experience running a cleaning company:

- A 5.0 with 8 reviews means nothing. Friends and family.
- A $75 flat rate with 300 reviews means busy but broke.
- Hiring 4 cleaners on Indeed means growing fast. Hiring 1 means replacing.
- "We do everything" means spread thin, probably not great at any of it.
- Beautiful website with no booking means all show, no conversion.

When the data says one thing and the business presents another, the researcher flags it. That's where the real intelligence lives.

## Part of Sparkles Inc

Sparkles Inc helps cleaning businesses with three things:
1. **Gorgeous Website** — a site that converts
2. **Done For You Marketing** — SEO, ads, social
3. **AI Your Operations** — automation and AI agents

The Researcher is the intelligence layer. Before any other service is recommended, the Researcher investigates. It's the first step in every engagement.

## Built by

**Ruby Sparks** — founder of Tidy Up Portland, builder of the Shine platform, and someone who's been on both sides of the cleaning business equation. The opinions in this researcher come from lived experience, not theory.
