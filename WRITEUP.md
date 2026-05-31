# Writeup

## What I built

A residential cleaning business researcher that investigates, not summarizes. It pulls real Google Places data, scrapes websites, cross-references what it finds against frameworks built from running an actual cleaning company. When a business has a 5.0 rating with 8 reviews, it says "friends and family." When pricing is hidden behind "call for quote," it flags it as the single biggest predictor of low ratings in the data.

The folder works standalone in any Claude project. The app adds real-time capabilities: live Google Places search, website scraping, constraint diagnosis, and personalized sales page generation with the business's own brand colors.

The reference folder has two layers. The first is expertise: Ruby's opinions on pricing, hiring, operations, and client management from 10,000+ cleaning jobs. The second is patterns discovered by running the tool itself on 125+ real businesses across 10 US cities. Together, they give the researcher both judgment and evidence.

## One design decision

The researcher asks questions before it investigates. "What are you trying to learn? What's your angle?" If someone says "research cleaning businesses in Denver," the investigation is completely different depending on whether they're selling to those businesses, competing with them, or buying one. Most AI tools skip this and jump straight to output. A real researcher doesn't. This is a coaching mechanic baked into the investigation flow, and it changes the quality of the findings dramatically.

## One thing I'd add

Phone verification. The tool already scrapes websites and pulls Google data, but the single strongest signal in the cleaning industry is response time. The first business to respond gets the job 78% of the time. I'd add a feature that calls or texts the business and measures how long it takes to get a response. That one data point would tell you more about the business than anything on their website.
