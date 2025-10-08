import { fileURLToPath } from "url";

import { BoardroomOfLightSimulator } from "./boardroom-simulator.js";
import { getBoardroomByRealm, boardroomRealms } from "./boardroom-personas.js";
import { NoigelaModule } from "@gavl/noigela";

export function structureResult(result) {
  return {
    realm: result.chamber.realm,
    name: result.chamber.name,
    description: result.chamber.description,
    coherence: result.summary.coherenceIndex,
    guidance: result.summary.guidance,
    ledger: result.ledger,
    insights: result.insights,
  };
}

export function compareBoardrooms(light, authentic) {
  const deltaCoherence = Number.parseFloat((light.coherence - authentic.coherence).toFixed(3));

  const hatMap = new Map();
  light.insights.forEach((insight) => {
    hatMap.set(insight.hat, { light: insight, authentic: null });
  });
  authentic.insights.forEach((insight) => {
    const existing = hatMap.get(insight.hat) ?? { light: null, authentic: null };
    existing.authentic = insight;
    hatMap.set(insight.hat, existing);
  });

  const hatContrasts = Array.from(hatMap.entries()).map(([hat, set]) => {
    const lightAvg = set.light?.averageResonance ?? 0;
    const authenticAvg = set.authentic?.averageResonance ?? 0;
    return {
      hat,
      light: set.light,
      authentic: set.authentic,
      delta: Number.parseFloat((lightAvg - authenticAvg).toFixed(3)),
    };
  }).sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));

  const evidence = hatContrasts
    .filter((contrast) => Math.abs(contrast.delta) >= 0.1)
    .map((contrast) => {
      const slant = contrast.delta > 0 ? "Virtuous lead" : "Shadow drift";
      return {
        headline: `${slant}: ${contrast.hat}`,
        detail: `${contrast.hat} resonance delta ${contrast.delta >= 0 ? "+" : ""}${contrast.delta}.`,
        virtuousInner: contrast.light?.innerThoughts?.[0],
        authenticWhisper: contrast.authentic?.innerThoughts?.[0],
      };
    });

  const accusations = evidence
    .filter((item) => item.detail.includes("-") || item.headline.includes("Shadow"))
    .map((item) => ({
      target: item.headline,
      charge: item.authenticWhisper ?? "Opaque behavior detected.",
    }));

  const headlines = [
    `${boardroomRealms.light.name} coherence ${light.coherence}`,
    `${boardroomRealms.authentic.name} coherence ${authentic.coherence}`,
    `Delta coherence: ${deltaCoherence >= 0 ? "+" : ""}${deltaCoherence}`,
  ];

  return {
    deltaCoherence,
    hatContrasts,
    evidence,
    accusations,
    headlines,
  };
}

export function buildMultiverseFromBoardrooms(lightBoardroom, authenticBoardroom, options = {}) {
  if (!lightBoardroom || !authenticBoardroom) {
    throw new Error("Both light and authentic boardrooms are required.");
  }

  const comparison = compareBoardrooms(lightBoardroom, authenticBoardroom);
  const advisor = options.advisor ?? options.noigela ?? options.cricket ?? new NoigelaModule({ mode: "analysis" });
  const noigela = advisor.evaluate({
    light: lightBoardroom,
    authentic: authenticBoardroom,
    comparison,
  });

  return {
    boardrooms: {
      light: lightBoardroom,
      authentic: authenticBoardroom,
    },
    comparison,
    noigela,
  };
}

export async function runMultiverse(options = {}) {
  const seats = options.seats ?? 7;
  const rounds = options.rounds ?? 3;
  const advisor = options.advisor ?? options.noigela ?? options.cricket ?? new NoigelaModule({ mode: "analysis" });

  const [lightResult, authenticResult] = await Promise.all([
    new BoardroomOfLightSimulator({
      seats,
      rounds,
      realm: "light",
      advisors: getBoardroomByRealm("light"),
      quantum: options.quantum,
      quantumConfig: options.quantumConfig,
    }).run(),
    new BoardroomOfLightSimulator({
      seats,
      rounds,
      realm: "authentic",
      advisors: getBoardroomByRealm("authentic"),
      quantum: options.quantum,
      quantumConfig: options.quantumConfig,
    }).run(),
  ]);

  const structuredLight = structureResult(lightResult);
  const structuredAuthentic = structureResult(authenticResult);
  return buildMultiverseFromBoardrooms(structuredLight, structuredAuthentic, { advisor });
}

function parseArgs(argv) {
  const options = {};
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--rounds" && argv[i + 1]) {
      options.rounds = Number.parseInt(argv[i + 1], 10);
      i += 1;
    } else if (arg === "--seats" && argv[i + 1]) {
      options.seats = Number.parseInt(argv[i + 1], 10);
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
  console.log(`[info] Initiating multiverse comparison with ${options.seats ?? 7} seats.`);
  try {
    const multiverse = await runMultiverse(options);
    console.log(`[comparison] ${JSON.stringify(multiverse, null, 2)}`);
  } catch (error) {
    console.error(`[error] Multiverse simulation failed: ${error.message}`);
    process.exitCode = 1;
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runCli();
}
