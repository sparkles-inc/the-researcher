# Google Rating Correlation Analysis: 26 Factors

Patterns discovered by running the researcher tool on real cleaning businesses. This analysis combines data from all three business analysis files to identify which factors actually predict Google ratings.

**Last updated:** May 28, 2026
**Businesses analyzed:** 101 unique (after deduplication) across 10 US cities
**Cities:** Portland, Austin, Denver, Charlotte, Nashville, Seattle, Phoenix, Los Angeles, Chicago, Miami
**Sources:** Combined from booking-ratings-research.md, deep-business-analysis.md, and gbp-pricing-density-research.md

---

## Dataset Overview

| Metric | Value |
|--------|-------|
| Total businesses | 101 |
| Rating range | 2.6 - 5.0 |
| Mean rating | 4.758 |
| Median rating | 4.8 |
| Std deviation | ~0.31 |

### Rating Distribution

```
2.6:   1  #
4.0:   1  #
4.2:   1  #
4.4:   2  ##
4.5:   6  ######
4.6:   8  ########
4.7:  15  ###############
4.8:  32  ################################  <-- MODE
4.9:  22  ######################
5.0:  16  ################
```

The dataset clusters tightly between 4.7 and 5.0 (85 of 101 businesses = 84%). This compression means even small deltas (0.05-0.10 stars) represent meaningful separation.

---

## Methodology

For each of the 26 factors:
1. Split the dataset into groups (has factor vs. does not)
2. Calculate average rating for each group
3. Calculate the delta (difference)
4. Note sample size for each group
5. Flag statistical reliability: n < 5 = unreliable, 5-9 = directional, 10+ = meaningful

Where data was coded as "Unknown" (U) for a business, that business was excluded from that specific correlation rather than assumed to be a "No."

---

## The 26 Correlations

### 1. Rating vs. Booking Type

| Booking Type | n | Avg Rating |
|-------------|---|-----------|
| Contact Form (CF) | 28 | **4.786** |
| Quote Form (QF) | 38 | **4.726** |
| Real-Time Booking (RT) | 33 | **4.782** |
| External SaaS (Launch27, Zenmaid) | 2 | **4.600** |

**Key deltas:**
- RT vs QF: +0.056 (RT wins)
- CF vs QF: +0.060 (CF wins)
- RT vs CF: -0.004 (virtually identical)

**Interpretation:** Quote forms are the weakest booking type, trailing both contact forms and real-time booking by ~0.06 stars. Real-time booking and contact forms perform identically on rating. External SaaS tools show the lowest rating but n=2 makes this unreliable.

**Statistical reliability:** Good (n=28, 38, 33 for the three main types). The QF deficit is real.

---

### 2. Rating vs. Pricing Transparency

| Pricing Approach | n | Avg Rating |
|-----------------|---|-----------|
| Hidden (no pricing) | 77 | **4.770** |
| Shown (transparent) | 8 | **4.825** |
| Ranges | 6 | **4.783** |
| Call for quote | 2 | **4.250** |
| Calculator | 5 | **4.620** |
| Starting at | 3 | **4.800** |

**Key deltas:**
- Shown vs Hidden: +0.055
- Calculator vs Hidden: -0.150 (calculators rate LOWER)
- Call for quote vs Hidden: -0.520 (call = worst by far)

**Interpretation:** "Call for quote" is catastrophic for ratings (4.25 avg). Transparent pricing slightly outperforms hidden. The calculator surprise is notable: calculators drive massive review VOLUME (avg 491 reviews per the GBP research) but correlate with slightly lower ratings (4.62). This suggests calculators attract higher volume but possibly less-qualified leads, creating more friction.

**Statistical reliability:** Hidden (n=77) is solid. Shown (n=8) is moderate. Call/calculator/starting have small samples.

---

### 3. Rating vs. Team Photos (Real, Not Stock)

| Group | n | Avg Rating |
|-------|---|-----------|
| YES - Real team photos | 15 | **4.807** |
| NO - No real team photos | 86 | **4.750** |

**Delta: +0.057**

**Interpretation:** Real team photos correlate with a meaningful rating advantage. Stock photos were coded as "No" -- they perform identically to no photos at all. Authenticity matters. Businesses that show their actual people signal pride and accountability.

**Statistical reliability:** Good (n=15 vs 86).

---

### 4. Rating vs. Owner Name Mentioned

| Group | n | Avg Rating |
|-------|---|-----------|
| YES - Owner named on site | 4 | **4.775** |
| NO - Owner not named | 97 | **4.758** |

**Delta: +0.017**

**Interpretation:** Essentially zero correlation. Owner naming is neither positive nor negative for ratings. The n=4 for "yes" makes this statistically unreliable regardless.

**Statistical reliability:** Poor (n=4). Treat as noise.

---

### 5. Rating vs. Satisfaction Guarantee

| Group | n | Avg Rating |
|-------|---|-----------|
| YES - Has guarantee | 17 | **4.824** |
| NO - No guarantee | 84 | **4.745** |

**Delta: +0.078**

**Interpretation:** One of the strongest correlations in the dataset. Businesses with satisfaction guarantees rate nearly 0.08 stars higher. This likely works both directions: confident businesses offer guarantees AND guarantees reduce negative reviews (unhappy customers get a re-clean instead of leaving 1 star).

**Statistical reliability:** Good (n=17 vs 84). This is a real signal.

---

### 6. Rating vs. Background Checks Mentioned

| Group | n | Avg Rating |
|-------|---|-----------|
| YES - Background checks | 14 | **4.786** |
| NO - Not mentioned | 87 | **4.754** |

**Delta: +0.032**

**Interpretation:** Weak positive correlation. Background checks alone are a modest signal. Their power increases dramatically when combined with a guarantee (see Factor 7).

**Statistical reliability:** Good (n=14 vs 87). Signal is real but small.

---

### 7. Rating vs. Guarantee + Background Checks Combined

| Group | n | Avg Rating |
|-------|---|-----------|
| BOTH guarantee + BG check | 11 | **4.818** |
| ONE of the two | 9 | **4.778** |
| NEITHER | 81 | **4.748** |

**Delta (Both vs Neither): +0.070**

**Interpretation:** The combination is stronger than either alone. Having both creates a trust stack: "We check our people AND we stand behind their work." The gradient is clean -- each additional trust signal adds ~0.035 stars.

**Statistical reliability:** Moderate (n=11, 9, 81). Directional and consistent.

---

### 8. Rating vs. Response Time Guarantee

| Group | n | Avg Rating |
|-------|---|-----------|
| YES - Response guarantee | 5 | **4.840** |
| NO - No response guarantee | 96 | **4.754** |

**Delta: +0.086**

**Businesses with response guarantees:**
- Amanda's Maid (Charlotte): 4.9, 742 reviews, 10-min response
- Sunday Cleaners (Chicago): 4.8, 123 reviews, same/next day
- House Keep Up (Chicago): 4.9, 200 reviews, 24-hr response
- Get It Done (Chicago): 4.8, 292 reviews, same day
- Sarah's Clean Team (Nashville): 4.8, 150 reviews (from File 1 data)

**Interpretation:** The second-strongest single-factor correlation. Every business with a response guarantee rates 4.8+. Zero exceptions. This is the only factor in the dataset with a 100% hit rate at the 4.8 threshold.

**Statistical reliability:** Small sample (n=5), but the 100% hit rate at 4.8+ is notable. Directional and compelling.

---

### 9. Rating vs. Packages Defined

| Group | n | Avg Rating |
|-------|---|-----------|
| YES - Defined packages | 13 | **4.823** |
| NO - No packages | 88 | **4.749** |

**Delta: +0.074**

**Interpretation:** Defined service packages (standard/deep/move-out tiers) correlate strongly with higher ratings. Packages reduce ambiguity for both the customer and the cleaner. When expectations are clear, satisfaction follows.

**Statistical reliability:** Good (n=13 vs 88). Real signal.

---

### 10. Rating vs. Recurring Discounts

| Group | n | Avg Rating |
|-------|---|-----------|
| YES - Recurring discounts | 20 | **4.785** |
| NO - No recurring discounts | 81 | **4.752** |

**Delta: +0.033**

**Interpretation:** Weak positive correlation with rating. The bigger impact of recurring discounts is on review COUNT (from GBP research: 298 avg reviews with discounts vs 167 without). Recurring clients are more likely to leave reviews, but the rating bump is modest.

**Statistical reliability:** Good (n=20 vs 81).

---

### 11. Rating vs. Number of Services (Specialist vs. Generalist)

| Group | n | Avg Rating |
|-------|---|-----------|
| Specialist (1-3 services) | 12 | **4.742** |
| Mid-range (4-6 services) | 72 | **4.756** |
| Generalist (7+ services) | 17 | **4.782** |

**Delta (Specialist vs Generalist): -0.041**

**Interpretation:** This is a REVERSAL from the File 2 analysis which showed specialists rating higher (4.87 vs 4.73). With the full 101-business dataset, the trend flips: generalists slightly outperform specialists. The difference is small enough to be noise. The truth is that service count has near-zero correlation with rating.

**Statistical reliability:** Good across all groups. Conclusion: service count does not predict rating.

---

### 12. Rating vs. Insurance Mentioned

| Group | n | Avg Rating |
|-------|---|-----------|
| YES - Insurance mentioned | 22 | **4.764** |
| NO - Not mentioned | 79 | **4.757** |

**Delta: +0.007**

**Interpretation:** Essentially zero. Insurance is table stakes in the cleaning industry. Mentioning it neither helps nor hurts. Customers expect it; it does not differentiate.

**Statistical reliability:** Good (n=22 vs 79). The near-zero delta IS the finding.

---

### 13. Rating vs. Blog Present

| Group | n | Avg Rating |
|-------|---|-----------|
| YES - Has blog | 13 | **4.800** |
| NO - No blog | 88 | **4.752** |

**Delta: +0.048**

**Interpretation:** Moderate positive correlation. Blogs may indicate overall business sophistication (businesses that blog also tend to do other things well) rather than directly causing higher ratings. No customer reads a blog before leaving a Google review.

**Statistical reliability:** Good (n=13 vs 88). Real but modest signal.

---

### 14. Rating vs. Website Platform

| Platform | n | Avg Rating |
|----------|---|-----------|
| WordPress | 42 | **4.781** |
| Squarespace | 3 | **4.933** |
| Wix | 4 | **4.775** |
| Webflow | 5 | **4.820** |
| Custom | 12 | **4.575** |
| Unknown/Other | 30 | **4.783** |

**Key deltas:**
- Squarespace vs WordPress: +0.152 (but n=3)
- Custom vs WordPress: -0.206

**Interpretation:** Custom-built sites correlate with notably lower ratings (4.575). This may reflect businesses that built sites cheaply/poorly rather than using established platforms with better UX templates. Squarespace shows the highest rating but with only 3 businesses, this is unreliable. WordPress is the industry standard and performs at average.

**Statistical reliability:** WordPress (n=42) and Custom (n=12) are reliable. Others are too small.

---

### 15. Rating vs. Social Media Link Count

| Group | n | Avg Rating |
|-------|---|-----------|
| 4+ social links | 12 | **4.783** |
| 2-3 social links | 6 | **4.800** |
| 1 social link | 3 | **4.700** |
| 0 social links | 5 | **4.800** |

**Delta (4+ vs 0): -0.017**

**Interpretation:** No meaningful correlation. Businesses with zero social links rate identically to those with 2-3 or 4+. Social presence is a marketing signal, not a quality signal.

**Statistical reliability:** Small samples in most groups. Only the 4+ group (n=12) is reliable. Note: 75 businesses had unknown social counts.

---

### 16. Rating vs. Gift Cards Offered

| Group | n | Avg Rating |
|-------|---|-----------|
| YES - Gift cards | 10 | **4.760** |
| NO - No gift cards | 91 | **4.758** |

**Delta: +0.002**

**Interpretation:** Zero correlation. Gift cards are a revenue tactic, not a quality signal. They correlate with marketing sophistication but have no relationship to customer satisfaction.

**Statistical reliability:** Good (n=10 vs 91). The zero delta IS the finding.

---

### 17. Rating vs. Years in Business

| Group | n | Avg Rating |
|-------|---|-----------|
| 15+ years | 7 | **4.771** |
| 7-14 years | 5 | **4.820** |
| <7 years | 1 | **4.900** |
| Unknown | 88 | **4.752** |

**Interpretation:** The 7-14 year businesses rate highest among known-age businesses, but 88 of 101 businesses have unknown age. There is not enough data to draw conclusions. The one <7 year business (Roochii at 4.9) is a single data point.

**Statistical reliability:** Poor. 87% of businesses lack age data. Cannot draw conclusions.

---

### 18. Rating vs. Google Photos Uploaded

| Photo Count | n | Avg Rating |
|-------------|---|-----------|
| 100+ photos | 5 | **4.800** |
| 50-99 photos | 2 | **4.850** |
| <50 photos | (not systematically measured) | -- |

**Interpretation:** From the GBP research file, the broader pattern (across 40 businesses) showed:
- 200+ photos: 4.77 avg rating
- 100-199: 4.82
- 50-99: 4.85
- <50: 4.78

Photos do NOT predict rating. The sweet spot (50-99) slightly outperforms both higher and lower counts. However, photos dramatically predict review COUNT (200+ photos = 459 avg reviews vs <50 photos = 95 avg reviews, a 4.8x multiplier).

**Statistical reliability:** Small sample in the master dataset. The GBP file's 40-business analysis is more reliable here.

---

### 19. Rating vs. Owner Responds to Reviews

| Group | n | Avg Rating |
|-------|---|-----------|
| YES - Responds to reviews | 8 | **4.750** |
| NO/Unknown | 93 | **4.759** |

**Delta: -0.009**

**Interpretation:** No correlation with rating in the master dataset. However, the GBP research file (different methodology, verified response behavior) found +0.07 rating advantage for responders. The discrepancy likely reflects coding differences: the master dataset has very few businesses where response behavior was verified. The GBP file's finding (+0.07 rating, 2.5x more reviews for responders) is more reliable on this specific factor.

**Statistical reliability:** Poor in master dataset (only 8 confirmed responders). Trust the GBP file's dedicated analysis.

---

### 20. Rating vs. City / Market Density

| Market Tier | Cities | n | Avg Rating |
|------------|--------|---|-----------|
| Dense (500+ cleaners) | Chicago, Miami, LA, Denver | 37 | **4.711** |
| Medium (400-499) | Austin, Charlotte, Seattle, Phoenix | 40 | **4.795** |
| Low (<400) | Portland, Nashville | 24 | **4.771** |

**Delta (Dense vs Medium): -0.084**

**Interpretation:** Medium-density markets produce the highest-rated businesses (4.795), not dense or sparse markets. Dense markets (4.711) have more competition and more mediocre players dragging the average down. This is a sampling artifact: dense markets have more businesses total, including more average ones. The GBP file found the opposite pattern when looking at only TOP businesses per market (dense markets' best businesses rate higher). Both findings are valid -- it depends on whether you're measuring the average business or the best business.

**Statistical reliability:** Good (n=37, 40, 24). The pattern is real for average businesses.

---

### 21. Rating vs. Review Count

| Review Tier | n | Avg Rating |
|-------------|---|-----------|
| 300+ reviews | 23 | **4.791** |
| 100-299 reviews | 47 | **4.806** |
| <100 reviews | 31 | **4.661** |

**Delta (100-299 vs <100): +0.145**
**Pearson correlation (Rating vs Review Count): r = 0.133**

**Interpretation:** Weak positive correlation. Businesses with <100 reviews rate significantly lower (4.661) than those with 100+ (4.80). But within the 100+ range, more reviews do NOT mean higher ratings. In fact, 100-299 reviews slightly outperforms 300+. The biggest cliff is at the 100-review threshold: below it, you're more likely to have rating volatility (a few bad reviews tank a small total).

**Statistical reliability:** Good across all groups. The <100 review deficit is real.

---

### 22. Rating vs. Copy Quality

| Copy Type | n | Avg Rating |
|-----------|---|-----------|
| Personalized | 10 | **4.860** |
| Mixed | 4 | **4.700** |
| Generic | 13 | **4.754** |
| Not assessed | 74 | **4.749** |

**Delta (Personalized vs Generic): +0.106**

**Interpretation:** The STRONGEST correlation in the entire dataset among assessed businesses. Personalized copy (founder stories, local references, authentic voice) correlates with a full 0.106-star advantage over generic template copy. This likely reflects a proxy effect: businesses that invest in personalized copy also invest in personalized service.

**Statistical reliability:** Moderate (n=10 vs 13). The delta is large enough to be meaningful despite smaller samples. However, 74 businesses were not assessed for copy quality, limiting the finding's generalizability.

---

### 23. Rating vs. Mobile Responsive

**Result: Not measurable.** 100% of businesses in the dataset are mobile responsive. No variation means no correlation. Mobile responsiveness is universal table stakes in 2026.

---

### 24. Rating vs. Load Time

**Result: Not measured.** Load time was not systematically recorded across the dataset. Insufficient data for analysis.

---

### 25. Rating vs. Video Content

| Group | n | Avg Rating |
|-------|---|-----------|
| YES - Has video | 3 | **4.800** |
| NO - No video | 98 | **4.757** |

**Delta: +0.043**

**Interpretation:** Slight positive signal but with only 3 businesses having video, this is unreliable. Video content is extremely rare in cleaning business websites (3% adoption rate).

**Statistical reliability:** Poor (n=3). Treat as noise.

---

### 26. Rating vs. Before/After Photos

| Group | n | Avg Rating |
|-------|---|-----------|
| YES - Has B/A photos | 1 | **4.700** |
| NO - No B/A photos | 100 | **4.759** |

**Delta: -0.059**

**Interpretation:** Only ONE business in the entire dataset has before/after photos on their website (Queen City Cleaners, Charlotte). Cannot draw any conclusion.

**Statistical reliability:** None (n=1). Complete noise.

---

## Master Ranking: All 26 Factors by Rating Correlation Strength

Ranked by absolute delta, including only factors with adequate sample sizes (n >= 5 in both groups):

| Rank | Factor | Delta | WITH avg | WITHOUT avg | n(Y) | n(N) | Reliable? |
|------|--------|-------|----------|-------------|------|------|-----------|
| 1 | **Personalized Copy** | **+0.106** | 4.860 | 4.754 | 10 | 13 | Moderate |
| 2 | **Response Time Guarantee** | **+0.086** | 4.840 | 4.754 | 5 | 96 | Directional |
| 3 | **Satisfaction Guarantee** | **+0.078** | 4.824 | 4.745 | 17 | 84 | Strong |
| 4 | **Packages Defined** | **+0.074** | 4.823 | 4.749 | 13 | 88 | Strong |
| 5 | **Guarantee + BG Checks** | **+0.070** | 4.818 | 4.748 | 11 | 81 | Strong |
| 6 | Team Photos (Real) | +0.057 | 4.807 | 4.750 | 15 | 86 | Strong |
| 7 | RT Booking vs QF | +0.056 | 4.782 | 4.726 | 33 | 38 | Strong |
| 8 | Blog Present | +0.048 | 4.800 | 4.752 | 13 | 88 | Strong |
| 9 | Recurring Discounts | +0.033 | 4.785 | 4.752 | 20 | 81 | Strong |
| 10 | Background Checks | +0.032 | 4.786 | 4.754 | 14 | 87 | Strong |
| 11 | Insurance Mentioned | +0.007 | 4.764 | 4.757 | 22 | 79 | Strong |
| 12 | Gift Cards | +0.002 | 4.760 | 4.758 | 10 | 91 | Strong |
| 13 | Owner Named | +0.017 | 4.775 | 4.758 | 4 | 97 | Unreliable |
| 14 | Social Links (4+ vs 0) | -0.017 | 4.783 | 4.800 | 12 | 5 | Weak |
| 15 | Service Count | -0.041 | 4.742 | 4.782 | 12 | 17 | Moderate |
| 16 | Mobile Responsive | N/A | -- | -- | 101 | 0 | No variance |
| 17 | Load Time | N/A | -- | -- | -- | -- | Not measured |
| 18 | Video Content | +0.043 | 4.800 | 4.757 | 3 | 98 | Unreliable |
| 19 | Before/After Photos | -0.059 | 4.700 | 4.759 | 1 | 100 | Unreliable |
| 20 | Owner Responds | -0.009 | 4.750 | 4.759 | 8 | 93 | Weak* |
| 21 | Website Platform | varies | -- | -- | -- | -- | Only WP reliable |
| 22 | Years in Business | varies | -- | -- | -- | -- | 87% unknown |
| 23 | GBP Photos | varies | -- | -- | -- | -- | Small sample |
| 24 | City Density | -0.084 | 4.711 | 4.795 | 37 | 40 | Strong |
| 25 | Review Count (100+ vs <100) | +0.145 | 4.800 | 4.661 | 70 | 31 | Strong |
| 26 | Pricing (Shown vs Hidden) | +0.055 | 4.825 | 4.770 | 8 | 77 | Moderate |

*Owner response data more reliable in GBP file (+0.07, dedicated analysis)

---

## Top 5 Factors That PREDICT HIGH Ratings

| Rank | Factor | Delta | Why It Works |
|------|--------|-------|-------------|
| 1 | **Personalized copy** | +0.106 | Proxy for care. Businesses that write authentically about their community deliver authentically too. |
| 2 | **Response time guarantee** | +0.086 | Signals operational excellence. 100% of these businesses are 4.8+. Promising fast response means having systems to deliver it. |
| 3 | **Satisfaction guarantee** | +0.078 | Deflects negative reviews. Unhappy customers get a re-clean instead of rage-reviewing. Also signals confidence. |
| 4 | **Defined packages** | +0.074 | Reduces expectation mismatch. When customers know exactly what they're getting (standard vs deep vs move-out), disappointment drops. |
| 5 | **Guarantee + BG checks** | +0.070 | The trust stack. "We check our people AND stand behind their work" addresses the two biggest customer fears at once. |

---

## Top 5 Factors That PREDICT LOW Ratings (or Have Negative Correlation)

| Rank | Factor | Delta | Why It Hurts |
|------|--------|-------|-------------|
| 1 | **"Call for quote" pricing** | -0.520 | Creates friction, attracts mismatched expectations, signals old-school operation. Only 2 businesses but both rated terribly (4.0 and 4.5). |
| 2 | **Custom-built website** | -0.206 | Custom sites often = cheap/amateur build. Established platforms have better UX defaults. |
| 3 | **Calculator pricing** | -0.150 | Drives massive volume but attracts price-shoppers. Higher friction in the booking process creates more expectation gaps. |
| 4 | **Dense market** | -0.084 | More competition = more mediocre businesses pulling the average down. Not causal -- being in a dense market doesn't make you worse. |
| 5 | **<100 reviews** | -0.145 | Rating volatility. With few reviews, one or two bad ones have outsized impact. The "100-review threshold" is where ratings stabilize. |

---

## Factors with ZERO Correlation

These factors have essentially no relationship with Google rating (delta < 0.01):

| Factor | Delta | Interpretation |
|--------|-------|---------------|
| Insurance mentioned | +0.007 | Table stakes. Everyone expects it. Not a differentiator. |
| Gift cards offered | +0.002 | Revenue tactic, not quality signal. |
| Owner responds to reviews* | -0.009 | *Master dataset shows zero, but GBP file shows +0.07. Trust the GBP file's dedicated analysis. |
| Social media links | -0.017 | Marketing signal, not quality signal. |

---

## Rating Threshold Analysis: Where Is the Cliff?

| Threshold | Businesses Above | % of Dataset | Avg Reviews (Above) | Avg Reviews (Below) |
|-----------|-----------------|-------------|--------------------|--------------------|
| >= 4.5 | 95 | 94.1% | 235 | 170 |
| >= 4.6 | 90 | 89.1% | 244 | 124 |
| >= 4.7 | 83 | 82.2% | 251 | 142 |
| **>= 4.8** | **69** | **68.3%** | **256** | **178** |
| >= 4.9 | 36 | 35.6% | 249 | 221 |
| >= 5.0 | 14 | 13.9% | 169 | 241 |

### The Cliff Is at 4.8

**4.8 is the line between "good" and "great."**

- 68% of cleaning businesses rate 4.8+. Being below 4.8 puts you in the bottom third.
- The average review count jumps at 4.8 (256 vs 178 below), meaning 4.8+ businesses also tend to have more social proof.
- At 4.9+, you're in the top 36%. This is "excellent" territory.
- 5.0 is a paradox: perfect-rated businesses actually have FEWER reviews (169 avg) than 4.8-4.9 businesses (256-249 avg). Perfect ratings correlate with smaller, simpler operations.

**For a new cleaning business, the target is clear: get to 4.8 and 100+ reviews. That combination puts you in the competitive set.**

---

## The Golden Profile: What Combination Guarantees 4.8+?

Tested multiple 3-4 factor combinations across the dataset:

| Combination | n | Avg Rating | Min Rating | ALL 4.8+? |
|-------------|---|-----------|-----------|-----------|
| **Team Photos + Guarantee + Personalized Copy** | 4 | **4.850** | 4.8 | **YES** |
| **Team Photos + Personalized Copy** | 4 | **4.850** | 4.8 | **YES** |
| **Guarantee + BG Check + Response Guarantee** | 2 | **4.850** | 4.8 | **YES** |
| Guarantee + BG Check + Packages | 5 | 4.840 | 4.7 | No |
| Guarantee + Packages + RT Booking | 4 | 4.850 | 4.7 | No |
| RT Booking + Guarantee + Insurance | 4 | 4.825 | 4.7 | No |
| Packages + Recurring + Guarantee | 5 | 4.840 | 4.7 | No |
| BG Check + Guarantee + Blog | 6 | 4.783 | 4.7 | No |
| Specialist + Guarantee | 4 | 4.800 | 4.5 | No |

### The Golden Profile

**Team Photos + Personalized Copy = 100% chance of 4.8+** (n=4)

These are the only two factors where the combination produces a floor of 4.8 with no exceptions. Adding a satisfaction guarantee to this pair maintains the 4.8 floor and lifts the average to 4.85.

The businesses matching this profile:
- All have real team photos (not stock)
- All write in an authentic voice with local references
- All demonstrate genuine personal investment in their brand

**This makes intuitive sense.** The two factors share a common root: authenticity. Real photos + real voice = real business that cares. And caring businesses deliver good service, which generates good reviews.

**However:** n=4 is a small sample. The finding is directional, not definitive. More data would strengthen or weaken this.

---

## Surprising Findings

### 1. Calculators HURT Ratings but SUPERCHARGE Volume

Calculator-based pricing averages 4.62 rating (below the dataset mean of 4.76) but generates 491 average reviews -- nearly 3x the average. This creates a strategic choice:

- **If you want the highest possible rating:** Show transparent prices or hide them. Don't use a calculator.
- **If you want the most reviews/visibility:** Build a calculator. Accept a slightly lower rating as the cost of volume.

The Neat N Tidy Charlotte exception (4.9 rating, 1,200 reviews, calculator) proves it's possible to have both, but it's the outlier.

### 2. Contact Forms Perform as Well as Real-Time Booking on Rating

The industry narrative is "you need online booking." The data says otherwise for RATING specifically. Contact forms (4.786) perform identically to real-time booking (4.782). The advantage of real-time booking is in review VOLUME and conversion, not in customer satisfaction.

### 3. Insurance Is Invisible

Zero correlation. Every business should be insured, but mentioning it on your website does nothing for your rating. It's expected, not appreciated.

### 4. More Services Does Not Dilute Quality (Anymore)

The earlier File 2 analysis (29 businesses) showed specialists rating higher. The full dataset (101 businesses) reverses this. At scale, service breadth has essentially zero relationship with rating. Customers don't punish generalists.

### 5. 5.0 Businesses Are the Smallest

Perfect ratings correlate with FEWER reviews (169 avg vs 241 for <5.0). The three perfect-rated businesses with 100+ reviews (Sparkly Maid Austin 1050, We Clean Nashville 152, Lone Star 145) are exceptions. Most 5.0 businesses are small operations where every review is personal. Scale introduces rating entropy.

---

## Statistical Limitations

1. **Tight clustering:** 84% of businesses rate between 4.7 and 5.0, compressing the range. A 0.05-star delta that would be noise in a wider distribution is actually meaningful here.

2. **Missing data:** Many fields (copy quality, social links, years in business, GBP photos, owner response) were only assessed for a subset of businesses. Correlations involving these factors have lower confidence.

3. **Survivorship bias:** This dataset contains businesses that appear in Google search results. Failed businesses with terrible ratings are less likely to appear. The true full distribution would have a longer left tail.

4. **Correlation, not causation:** A satisfaction guarantee correlating with higher ratings does not prove the guarantee CAUSES higher ratings. Confident businesses both offer guarantees AND deliver good service.

5. **Cross-contamination:** Some businesses appear in multiple source files with slightly different data (different snapshots in time, different rating/review counts). After deduplication, 101 unique businesses remained, but some may have subtle data inconsistencies.

6. **City sample bias:** Some cities have more businesses in the dataset than others. Nashville has the most entries (12), which could disproportionately influence findings.

---

## Actionable Summary

### What to do if you want the highest possible Google rating:

1. **Write personalized copy** (biggest single-factor impact: +0.106)
2. **Offer a satisfaction guarantee** (reliable signal: +0.078, n=17)
3. **Define clear packages** (standard/deep/move-out: +0.074, n=13)
4. **Use real team photos** (authenticity signal: +0.057, n=15)
5. **Promise a response time** (100% hit rate at 4.8+: +0.086, n=5)
6. **Mention background checks** (especially combined with guarantee: +0.070)
7. **Get past 100 reviews** (below 100, ratings are volatile: -0.145)

### What NOT to waste time on:

1. Mentioning insurance (zero impact)
2. Offering gift cards (zero impact)
3. Adding more social media links (zero impact)
4. Choosing a specific website platform (WordPress is fine)
5. Adding more services (no impact on rating)

### What to be careful about:

1. **"Call for quote" is poison** (4.25 avg rating -- the worst strategy by far)
2. **Calculators are a volume play, not a quality play** (lower rating, higher reviews)
3. **Custom websites underperform** (use an established platform instead)

---

*Analysis conducted May 28, 2026. 101 businesses across 10 US cities. All math shown above. Raw data sourced from three research files in the same reference directory.*
