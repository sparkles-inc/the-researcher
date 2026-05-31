# Writeup

## What I built

A residential cleaning business researcher that investigates, not summarizes. It's built on expertise from someone who's done 10,000+ cleaning jobs, hired 60+ cleaners, and seen every angle of the industry. When a business has a 5.0 rating with 8 reviews, it says "friends and family." When pricing is hidden behind "call for quote," it knows from experience that's where businesses bleed clients.

The folder works standalone in any Claude project. The app adds real-time capabilities: live Google Places search, website scraping, constraint diagnosis, and personalized sales page generation with the business's own brand colors.

The reference folder has two layers. The core is expertise: Ruby's opinions on pricing, hiring, operations, and client management. The supporting layer is pattern data the tool has discovered by analyzing real businesses across 10 US cities, which will evolve as we run more markets. The expertise drives the reasoning. The data backs it up.

## One design decision

The researcher asks questions before it investigates. "What are you trying to learn? What's your angle?" If someone says "research cleaning businesses in Denver," the investigation is completely different depending on whether they're selling to those businesses, competing with them, or buying one. Most AI tools skip this and jump straight to output. A real researcher doesn't. This is a coaching mechanic baked into the investigation flow, and it changes the quality of the findings dramatically.

## One thing I'd add

Phone verification. The tool already scrapes websites and pulls Google data, but the single strongest signal in the cleaning industry is response time. The first business to respond gets the job 78% of the time. I'd add a feature that calls or texts the business and measures how long it takes to get a response. That one data point would tell you more about the business than anything on their website.
