import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

import { getBoardroomByRealm, boardroomRealms } from "./boardroom-personas.js";

const MODULE_DIR = dirname(fileURLToPath(import.meta.url));
const QISKIT_PLUGIN = join(MODULE_DIR, "boardroom_plugins", "qiskit_consensus.py");

const PHASES = ["illumination", "refraction", "coherence"];

const THEMES = [
  "Temporal Ethics",
  "Resource Allocation",
  "Containment Protocols",
  "Signal Harmonization",
  "Witness Safeguards",
  "Mythic Compliance",
];

class QuantumConsensusBridge {
  constructor(scriptPath = QISKIT_PLUGIN) {
    this.scriptPath = scriptPath;
  }

  async evaluate(payload) {
    return new Promise((resolve, reject) => {
      const child = spawn("python3", [this.scriptPath], {
        cwd: MODULE_DIR,
        stdio: ["pipe", "pipe", "pipe"],
      });

      let stdout = "";
      let stderr = "";

      child.stdout.on("data", (chunk) => {
        stdout += chunk.toString("utf8");
      });

      child.stderr.on("data", (chunk) => {
        stderr += chunk.toString("utf8");
      });

      child.on("error", (error) => {
        reject(new Error(`Failed to spawn Qiskit bridge: ${error.message}`));
      });

      child.on("close", (code) => {
        if (!stdout.trim()) {
          const details = stderr.trim() || `exit code ${code}`;
          reject(new Error(`Qiskit bridge produced no output (${details}).`));
          return;
        }

        try {
          const parsed = JSON.parse(stdout);
          if (parsed.status === "ok") {
            resolve(parsed.data);
            return;
          }
          const reason = parsed.error || "Unknown plugin error";
          reject(new Error(reason));
        } catch (error) {
          reject(new Error(`Unable to parse Qiskit bridge response: ${error.message}`));
        }
      });

      child.stdin.write(JSON.stringify(payload));
      child.stdin.end();
    });
  }
}

export class BoardroomOfLightSimulator {
  constructor(options = {}) {
    this.seats = Math.max(2, Number.parseInt(options.seats ?? 5, 10));
    this.rounds = Math.max(1, Number.parseInt(options.rounds ?? 3, 10));
    this.enableQuantum = Boolean(options.quantum ?? false);
    this.quantumConfig = options.quantumConfig ?? {};
    this.realm = options.realm === "authentic" ? "authentic" : "light";
    this.boardroomMeta = boardroomRealms[this.realm];
    this.advisors = options.advisors ?? getBoardroomByRealm(this.realm);
    this.phases = options.phases ?? PHASES;
    this.themes = options.themes ?? THEMES;
    this.bridge = new QuantumConsensusBridge();
  }

  buildChamber() {
    const roster = this.advisors.slice(0, this.seats);
    return {
      realm: this.realm,
      name: this.boardroomMeta?.name ?? "Boardroom",
      description: this.boardroomMeta?.description,
      roster,
      topic: this._selectTheme(),
    };
  }

  async run() {
    const chamber = this.buildChamber();
    const ledger = [];

    for (let roundIndex = 0; roundIndex < this.rounds; roundIndex += 1) {
      const phase = this.phases[roundIndex % this.phases.length];
      ledger.push(this._simulatePhase({ phase, roster: chamber.roster }));
    }

    const summary = this._summarizeLedger(ledger);
    const insights = this._aggregateInsights(ledger, chamber.roster);
    const result = {
      chamber,
      ledger,
      summary,
      insights,
    };

    if (this.enableQuantum) {
      try {
        const payload = {
          participants: chamber.roster.length,
          entanglement: this.quantumConfig.entanglement ?? 0.65,
          phaseBias: summary.coherenceIndex,
        };
        const quantum = await this.bridge.evaluate(payload);
        result.quantum = quantum;
      } catch (error) {
        result.quantumError = error.message;
      }
    }

    return result;
  }

  _simulatePhase({ phase, roster }) {
    const exchanges = roster.map((advisor, idx) => {
      const resonance = this._resonanceScore(idx, phase);
      const polarity = resonance > 0.6 ? "amplify" : resonance < 0.35 ? "attenuate" : "mediate";
      return {
        seat: advisor.seat ?? idx + 1,
        advisor: advisor.name ?? advisor,
        title: advisor.title,
        division: advisor.division,
        hat: advisor.hat,
        archetype: advisor.archetype,
        virtue: advisor.virtue,
        resonance,
        polarity,
        declaration: this._declarationFor(advisor, polarity, phase),
        innerThought: this._innerThoughtFor(advisor, polarity, resonance),
      };
    });

    return {
      phase,
      exchanges,
      dominantVector: this._dominantVector(exchanges),
    };
  }

  _dominantVector(exchanges) {
    const maxExchange = exchanges.reduce((best, current) => {
      if (!best || current.resonance > best.resonance) {
        return current;
      }
      return best;
    }, null);

    return {
      advisor: maxExchange?.advisor,
      resonance: maxExchange?.resonance ?? 0,
      polarity: maxExchange?.polarity ?? "mediate",
    };
  }

  _summarizeLedger(ledger) {
    const resonanceSum = ledger
      .flatMap((phase) => phase.exchanges)
      .reduce((acc, exchange) => acc + exchange.resonance, 0);

    const totalExchanges = ledger.length * this.seats;
    const averageResonance = totalExchanges ? resonanceSum / totalExchanges : 0;
    const coherenceIndex = Number.parseFloat(averageResonance.toFixed(3));

    return {
      cycles: ledger.length,
      coherenceIndex,
      guidance: this._guidanceFor(coherenceIndex),
    };
  }

  _aggregateInsights(ledger, roster) {
    const advisorMap = new Map();

    ledger.forEach((phase) => {
      phase.exchanges.forEach((exchange) => {
        const key = exchange.advisor;
        if (!advisorMap.has(key)) {
          advisorMap.set(key, {
            advisor: exchange.advisor,
            seat: exchange.seat,
            title: exchange.title,
            hat: exchange.hat,
            division: exchange.division,
            archetype: exchange.archetype,
            virtue: exchange.virtue,
            totalResonance: 0,
            samples: 0,
            polarities: new Map(),
            innerThoughts: [],
          });
        }

        const entry = advisorMap.get(key);
        entry.totalResonance += exchange.resonance;
        entry.samples += 1;
        entry.innerThoughts.push(exchange.innerThought);
        entry.polarities.set(
          exchange.polarity,
          (entry.polarities.get(exchange.polarity) ?? 0) + 1,
        );
      });
    });

    const rosterLookup = new Map((roster ?? []).map((persona) => [persona.name ?? persona, persona]));

    return Array.from(advisorMap.values()).map((entry) => {
      const persona = rosterLookup.get(entry.advisor) ?? {};
      const dominantPolarity = Array.from(entry.polarities.entries()).sort((a, b) => b[1] - a[1])[0]?.[0];
      return {
        advisor: entry.advisor,
        seat: entry.seat,
        title: entry.title ?? persona.title,
        hat: entry.hat ?? persona.hat,
        division: entry.division ?? persona.division,
        archetype: entry.archetype ?? persona.archetype,
        virtue: entry.virtue ?? persona.virtue,
        averageResonance: Number.parseFloat((entry.totalResonance / entry.samples).toFixed(3)),
        dominantPolarity,
        innerThoughts: entry.innerThoughts,
        persona,
      };
    });
  }

  _resonanceScore(idx, phase) {
    const base = (idx + 1) / (this.seats + 1);
    const phaseIdx = this.phases.indexOf(phase) + 1;
    const jitter = Math.sin((idx + 1) * phaseIdx * Math.PI * 0.35);
    return Number.parseFloat(Math.min(1, Math.max(0, base + jitter * 0.15 + Math.random() * 0.1)).toFixed(3));
  }

  _declarationFor(advisor, polarity, phase) {
    const fragments = {
      amplify: "elevates the chamber's accord",
      attenuate: "tempers volatility in the chamber",
      mediate: "braids discordant threads into harmony",
    };

    const name = advisor.name ?? advisor;
    const hat = advisor.hat ? ` (${advisor.hat})` : "";
    const division = advisor.division ? ` of ${advisor.division}` : "";

    return `${name}${hat}${division} ${fragments[polarity]} during ${phase} phase.`;
  }

  _innerThoughtFor(advisor, polarity, resonance) {
    if (this.realm === "light") {
      const base = advisor.innerAffirmation ?? "Hold the light steady.";
      const polarityNote = {
        amplify: "Let the clarity reach every seat.",
        attenuate: "Soften the dissonance without dimming truth.",
        mediate: "Guide the cadence toward equilibrium.",
      };
      return `${base} ${polarityNote[polarity]}`.trim();
    }

    const whisper = advisor.shadowWhisper ?? "Keep it pragmatic.";
    const pressure = advisor.pressurePoint ? `Pressure: ${advisor.pressurePoint}.` : "";
    const resonanceNote = resonance > 0.7
      ? "Confidence surges—remember optics."
      : resonance < 0.35
        ? "Risk of losing the room; spin if needed."
        : "Stay flexible; see where momentum lands.";

    return `${whisper} ${pressure} ${resonanceNote}`.trim();
  }

  _guidanceFor(index) {
    if (index > 0.7) {
      return "Collective lucidity achieved. Proceed with Krunqueta protocol.";
    }
    if (index < 0.4) {
      return "Dissonance detected. Invoke assemble-boardroom ritual.";
    }
    return "Maintain reflective cadence. Activation code on standby.";
  }

  _selectTheme() {
    const offset = Math.floor(Math.random() * this.themes.length);
    return this.themes[offset];
  }
}

function parseArgs(argv) {
  const options = {};
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--seats" && argv[i + 1]) {
      options.seats = Number.parseInt(argv[i + 1], 10);
      i += 1;
    } else if (arg === "--rounds" && argv[i + 1]) {
      options.rounds = Number.parseInt(argv[i + 1], 10);
      i += 1;
    } else if (arg === "--quantum") {
      options.quantum = true;
    } else if (arg === "--entanglement" && argv[i + 1]) {
      options.quantumConfig = options.quantumConfig ?? {};
      options.quantumConfig.entanglement = Number.parseFloat(argv[i + 1]);
      i += 1;
    } else if (arg === "--phase-bias" && argv[i + 1]) {
      options.quantumConfig = options.quantumConfig ?? {};
      options.quantumConfig.phaseBias = Number.parseFloat(argv[i + 1]);
      i += 1;
    }
  }
  return options;
}

async function runCli() {
  const options = parseArgs(process.argv);
  const simulator = new BoardroomOfLightSimulator(options);
  console.log(`[info] Bootstrapping Boardroom of Light with ${simulator.seats} seats.`);

  try {
    const result = await simulator.run();
    console.log(`[result] ${JSON.stringify(result, null, 2)}`);
  } catch (error) {
    console.error(`[error] Simulation failed: ${error.message}`);
    process.exitCode = 1;
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runCli();
}
