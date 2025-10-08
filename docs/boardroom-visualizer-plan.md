# Boardroom of Light HD Visualizer Plan

## 1. Project Overview

Goal: deliver an always-on, high-definition visualization of the Boardroom of Light where virtue-centered advisors convene and no trace of the seven deadly sins exists. The system must ingest live outputs from the existing simulator, render the chamber in real time, and communicate ritual guidance to observers.

Guiding principles:
- Reinforce the seven counter-virtues in all narrative, palette, and interaction choices.
- Maintain continuous operation with graceful degradation if quantum data becomes unavailable.
- Offer an immersive yet readable interface suitable for kiosks, control rooms, or web embeds.

## 2. Storyboard Sequences

1. **Establishing Panorama:** Camera glides into a crystalline atrium suspended above a calm aurora. Ten virtue glyphs glow softly along the chamber ring while chorused ambience plays. On-screen caption: “Boardroom of Light: Virtue Council In Session.”
2. **Advisor Arrival & Seating:** Light-formed silhouettes of selected advisors materialize at their seats. Each seat projects a virtue sigil (e.g., compassion, diligence). Soft particle trails follow as resonance meters initialize beside the chairs.
3. **Cycle in Motion:** Phase banner (“Illumination”) unfurls overhead. Resonance pulses animate along the table, arcs connect advisors who amplify consensus, and the central lumen pool brightens proportional to the coherence index. Guidance text fades in with `[info]` styling.
4. **Quantum Consensus Overlay (Optional):** When quantum mode is active, a translucent sphere appears above the table. Constellations highlight the top quantum states, probability percentages orbit, and a short waveform reveals entanglement strength—always rendered in balanced, non-chaotic hues.
5. **Virtue Reflection Moment:** Between phases the room dims, advisors bow slightly, and ambient glyphs project affirmations (“Patience guides the cadence”). Users can hover/click to read virtue-aligned declarations without any conflict imagery.
6. **Guidance & Activation Cue:** Upon completing cycles, the floor mosaic assembles into a luminous pattern representing the guidance (e.g., Krunqueta protocol sequence). A voiceover or subtitle invites observers to act on the activation code while a subtle halo appears around the exit portal.
7. **Night Cycle / Idle Mode:** When idle or after-hours, the chamber enters a starfield meditation state. Advisors dissolve into light threads, gentle chimes play, and a status badge confirms “Virtue Watchers Standing By.”

## 3. Recommended Tech Stack

| Layer | Tooling | Rationale |
| --- | --- | --- |
| Client Rendering | **React 18 + Three.js (via react-three-fiber)** | Web-friendly, HD capable, supports declarative scene graph management and responsive UI overlays. |
| Visual Assets | **Blender** for modeling, **Substance Painter** for texturing | Enables stylized crystalline/aurora assets while keeping the pipeline lightweight. |
| Real-time Data Pipeline | **Node.js (existing simulator) + Fastify service** exposing WebSocket & REST endpoints | Reuses current codebase, facilitates streaming resonance/quantum events to the visualizer. |
| State Synchronization | **Zustand or Redux Toolkit** (client), **Socket.IO** or native WebSockets | Keeps UI and 3D layers in sync with simulator tick updates. |
| Audio & Atmospherics | **Tone.js** for adaptive soundscapes tied to coherence index | Generates dynamic ambient audio without heavy assets. |
| Build & Deployment | **Vite** for bundling, **Docker** container for kiosk/edge deployment, optional **Electron** wrapper for desktop kiosks | Fast development feedback loop; Docker ensures reproducible deployment; Electron supports full-screen signage. |
| Observability | **Sentry** for client error monitoring, **Grafana + Prometheus** for service metrics | Guarantees always-on reliability, tracks frame rate, data latency, and bridge health. |
| QA & Testing | **Playwright** for UI regression, **Jest** for renderer utility tests | Automates visual smoke tests and guards critical interactions. |

Security & accessibility considerations:
- Enforce read-only transport for observers; simulator never accepts inbound mutations from the visualizer.
- Provide WCAG-compliant color contrast, subtitles, and keyboard navigation for view toggles.

## 4. Budget, Roles, and Timeline

### Team Composition (core contributors)
- Creative Director / Experience Lead (0.5 FTE)
- Concept Artist & Illustrator (1 FTE for pre-production, tapering later)
- 3D Technical Artist (1 FTE)
- Front-end Graphics Engineer (1 FTE)
- Back-end / Realtime Engineer (0.5–1 FTE)
- Audio Designer (0.25 FTE)
- QA Engineer (0.5 FTE during integration)
- Project Producer (0.5 FTE)

### Estimated Timeline (12-week delivery)
1. **Discovery & Concept (Weeks 1-2):** finalize virtue lore, moodboards, technical spikes, and approve storyboard sequences.
2. **Production Sprint 1 (Weeks 3-6):** build initial Three.js chamber, integrate live simulator feed, stand up Fastify WebSocket service, produce base audio loops.
3. **Production Sprint 2 (Weeks 7-9):** refine animations, add quantum overlay visuals, implement accessibility & interaction layer, begin automated testing.
4. **Stabilization & Launch Prep (Weeks 10-12):** performance tuning, kiosk/hosting setup, documentation, fallback scenarios, user acceptance reviews.

### High-Level Budget (USD)
- Labor: ~ $185,000 (assuming blended rate ~$120/hr across 1550 hours)
- Software & tooling: ~$5,000 (asset libraries, Sentry/Grafana hosting, audio plugins)
- Hardware/Contingency: ~$10,000 (high-fidelity display, kiosk enclosure, 15% contingency)

**Total estimate:** ~$200,000 for initial build and launch-ready deployment. Ongoing operations (monitoring, content refresh, minor engineering) forecast at ~$6,000/month.

### Key Milestones & Deliverables
- **Week 2:** Signed-off storyboard packet + virtue style guide.
- **Week 6:** Interactive alpha with live data stream and base chamber rendering.
- **Week 9:** Feature-complete beta including quantum overlay and accessibility pass.
- **Week 12:** Production launch + operations handbook.

## 5. Next Steps
- Approve storyboard direction and allocate art resources.
- Kick off technical spike to validate WebSocket throughput and renderer performance on target hardware.
- Schedule virtue narrative workshop with stakeholders to lock tone for voiceover/subtitles.

The plan keeps the Boardroom of Light perpetually radiant, technically robust, and unmistakably virtuous.

## 6. Multiverse + No'iGeL(a) Companion Notes
- Dual-boardroom comparator (`scripts/boardroom-multiverse.js`) runs Light vs Authentic realms and hands results to the No'iGeL(a) module for conscience scoring.
- The No'iGeL(a) web companion (`web/noigela-companion/`) visualises a wireframe avatar with idle, concern, and celebration animation states, subscribing to WebSocket updates from `scripts/noigela-server.mjs`.
- Packaging script (`scripts/package-release.mjs`) assembles docs, scripts, and the companion UI into a distributable zip for GitHub releases.
- Real telemetry can be injected via `POST /ingest` on the No'iGeL(a) server, while `npm run test:smoke` verifies server boot, asset delivery, ingestion flow, and the `/api/latest` snapshot contract.
