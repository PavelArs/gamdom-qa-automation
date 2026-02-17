# Complex Scenario — Live Sports Betting with Real-Time Odds Changes

## Scenario Description

A user navigates to the Sports section, selects a live football match, adds a selection to the bet slip with displayed odds of 2.10, but by the time they confirm the bet, the odds have shifted to 1.95 due to an in-game event (e.g., a goal). The system must handle this race condition: reject the bet, notify the user of the odds change, and allow them to accept the new odds or cancel.

## Why It's Challenging to Automate

### 1. Real-Time Data via WebSockets

Odds updates arrive through WebSocket connections, not traditional HTTP requests. Playwright's `page.route()` intercepts HTTP but not WebSocket frames by default. The test needs to either:

- Intercept and control the WebSocket feed to simulate odds changes at precise moments
- Or work with the live data stream and handle inherent timing variability

### 2. Race Condition Between UI State and Server State

The core scenario is a race condition: the user sees odds X, clicks "Place Bet", but the server has already moved to odds Y. Reproducing this deterministically in a test requires precise timing control over:

- When the odds update reaches the client
- When the user action (bet placement) is triggered
- The server's validation window

### 3. Non-Deterministic Timing

Live events produce odds changes at unpredictable intervals. A test relying on real live data would be flaky by nature — the odds might or might not change during the test execution window.

### 4. Complex UI State Machine

The bet slip has multiple states: empty -> selection added -> odds changed (needs confirmation) -> bet placed / bet rejected. Testing all transitions requires careful orchestration, especially the "odds changed" intermediate state that may only appear for seconds.

### 5. Authentication & Balance Requirements

Placing a bet requires an authenticated user with sufficient balance, adding setup complexity and potential side effects (actual balance changes).

## Proposed Solution Approach

### Strategy: WebSocket Interception + Controlled Mock Feed

1. **Intercept WebSocket connection** using Playwright's `page.evaluate()` to monkey-patch the native WebSocket constructor before the page loads. Wrap the real WebSocket to inject controlled messages.

2. **Phase 1 — Setup:** Navigate to live sports, select an event. Capture the current odds from the UI. Add selection to bet slip.

3. **Phase 2 — Trigger odds change:** Through the intercepted WebSocket, inject a crafted odds update message with new odds while the bet slip is open. This simulates a real-time odds shift.

4. **Phase 3 — Assert UI response:** Verify the bet slip reflects the odds change — either:
   - A notification/banner indicating "Odds have changed"
   - Updated odds in the bet slip with an "Accept new odds" button
   - The "Place Bet" button being disabled until user acknowledges

5. **Phase 4 — Complete flow:** Click "Accept new odds" and place the bet. Verify the bet confirmation shows the new odds value.

### Alternative Approach: API-Level Testing

Instead of full E2E through the UI, test the bet placement API directly:

- Call the bet placement endpoint with `requestedOdds: 2.10`
- Ensure the server has already moved odds to `1.95`
- Assert the API returns an appropriate error code (e.g., `ODDS_CHANGED`)
- Send a follow-up request with `acceptOddsChange: true`

This is more reliable but doesn't test the UI state machine.

## What Would Need Further Investigation

1. **WebSocket message format** — Inspect the actual WebSocket frames in DevTools to understand the message structure for odds updates. Need the exact JSON schema to craft realistic mock messages.

2. **Odds update frequency** — Monitor how frequently odds change during a live match to understand timing constraints for the test.

3. **Bet placement API contract** — Understand the exact request/response format, especially how odds validation works (is there an `acceptOddsChange` flag? A tolerance threshold? An `oddsVersion` identifier?).

4. **WebSocket reconnection behavior** — If the WebSocket drops during the test, does the client reconnect? Does it fetch a fresh snapshot? This affects test stability.

5. **Bet slip state persistence** — Does the bet slip survive page refresh? Is state stored in localStorage or only in memory? This determines available recovery patterns.

6. **Rate limiting and anti-fraud** — Automated bet placement might trigger fraud detection. Need to understand thresholds and how to work within them during testing.
