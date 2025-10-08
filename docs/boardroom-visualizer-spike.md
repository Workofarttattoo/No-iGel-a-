# Boardroom Visualizer Technical Spike

## Objectives
- Verify that the simulator can stream state updates at 1 Hz–5 Hz without blocking.
- Confirm a Three.js scene can sustain 60 FPS while animating advisor resonance from streamed data.
- Measure end-to-end latency target <150 ms between simulator emission and client render update.

## Scope
- Build a minimal Node.js broadcaster that replays mock chamber data over WebSockets.
- Implement a React + react-three-fiber client page that renders a basic chamber ring and animates advisors.
- Record timing metrics (message interval, frame render delta) and log them in console for later analysis.

## Non-Goals
- Production visuals, audio, or full quantum overlay.
- Integration with actual Docker telemetry or Qiskit consensus.
- Cross-browser hardening beyond latest Chrome.

## Success Criteria
- Stable stream at configured frequency with <5% dropped frames over a 10-minute run.
- Renderer maintains ≥55 FPS average on reference hardware (MacBook Pro M1/16GB) with basic advisors.
- Simple dashboard logging indicates median latency below threshold.

## Implementation Snapshot

- `spike/server.mjs`: WebSocket broadcaster serving `client.html` + `client.js`. Emits mock chamber data at 1 Hz with resonance, polarity, and coherence metrics.
- `spike/client.html`: Minimal HUD shell and inline styling for the spike view.
- `spike/client.js`: Three.js scene (via CDN modules) with six advisor orbs, coherence core animation, latency/FPS HUD, and console telemetry.

> Sandbox note: running `node spike/server.mjs` inside the automated environment currently fails with `EPERM` when binding to localhost. Execute the spike locally (outside the sandbox) or set `SPIKE_HOST`/`SPIKE_PORT` in an approved environment to validate networking.

## Usage (local workstation)

```bash
node spike/server.mjs
open http://localhost:4173
```

You can adjust the emission rate by editing the `setInterval` cadence in `server.mjs`.

## Measurement Checklist
- Observe HUD FPS staying ≥55 for 10 minutes with default data payload.
- Monitor console `[trace] latency` logs to confirm median latency <150 ms.
- Capture CPU/GPU stats via Chrome DevTools Performance panel for the reference machine.

## Open Questions / Next Actions
- Evaluate whether the current handcrafted WebSocket implementation needs to be swapped for a battle-tested library (`ws`) once dependency approvals are in place.
- Validate CDN-delivered Three.js versions against corporate firewall rules; if blocked, bundle via Vite in a future iteration.
- Add automated smoke test (Playwright) once the environment can host the spike server during CI.
