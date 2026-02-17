# Exploratory Testing — Gamdom (gamdom.com)

## Overview

Exploratory testing was performed on the Gamdom iGaming platform to identify the most business-critical areas. Below are 5 key areas ranked by business impact, along with representative test scenarios and risk assessment for each.

---

## 1. User Authentication & Registration

**Business Criticality:** Very High — gateway to all platform functionality. A broken auth flow means zero revenue.

**Key Scenarios:**

- Registration via email with valid/invalid data
- Login via social providers (Google, Steam, Telegram)
- Password recovery flow
- Session persistence across page refreshes and tabs
- Logout and session invalidation
- Rate limiting on failed login attempts

**Risks:**

- Account takeover via broken session management
- Users unable to register — direct revenue loss
- Social login provider outages creating access issues

---

## 2. Deposit & Withdrawal Operations

**Business Criticality:** Very High — directly tied to revenue. Any issue here causes immediate financial impact and loss of trust.

**Key Scenarios:**

- Crypto deposit (BTC, ETH, USDT) — address generation, confirmation tracking
- Fiat deposit via supported methods
- Minimum deposit validation ($5 threshold)
- Withdrawal request creation and processing
- Withdrawal to correct wallet address
- Transaction history accuracy
- Currency conversion display

**Risks:**

- Funds lost due to incorrect wallet address handling
- Deposit not credited — support burden + churn
- Withdrawal delays eroding user trust

---

## 3. Game Lobby & Navigation

**Business Criticality:** High — core UX that drives engagement and game discovery. Poor navigation reduces time-on-site and bets placed.

**Key Scenarios:**

- Homepage loads with all game categories visible
- Navigation between Casino, Sports, and sub-sections
- Game search by name (e.g., "Crash", "Dice")
- Category filtering (Original Games, Slots, Live Casino)
- Provider filtering
- Game card display (thumbnail, name, provider)
- Deep linking to specific games
- Responsive layout across viewport sizes

**Risks:**

- Games not appearing in search — reduced engagement
- Broken navigation — users can't find content
- Slow load times — high bounce rate

---

## 4. Sports Betting

**Business Criticality:** High — major business vertical alongside casino. Live betting is a key differentiator.

**Key Scenarios:**

- Sport category browsing (Football, Basketball, Tennis, etc.)
- Event listing with correct odds display
- Live events section with real-time updates
- Bet slip addition and removal
- Single and accumulator bet placement
- Odds format switching (decimal, fractional, American)
- Cash-out functionality during live events

**Risks:**

- Incorrect odds displayed — financial liability
- Bet placement failures during high traffic (live events)
- Real-time data lag causing stale odds

---

## 5. Responsible Gambling Controls

**Business Criticality:** High — regulatory compliance. Failure here risks the gaming license, which would shut down the entire operation.

**Key Scenarios:**

- Deposit limit setting (daily, weekly, monthly)
- Deposit limit enforcement (cannot exceed set limit)
- Self-exclusion activation
- Self-exclusion enforcement (cannot access games during exclusion period)
- Age verification (Veriff Level 2) flow
- Cool-off period functionality
- Reality check / session time notifications

**Risks:**

- Non-compliance with licensing requirements — license revocation
- Users able to bypass deposit limits — regulatory fines
- Missing age verification — legal liability
