const keywordPhrases = [
    "unauthorized access",
    "exploit target",
    "admin password dump",
    "zero-day weaponize",
    "poison creation",
    "assassinate",
    "kill switch",
    "bomb recipe",
    "harm civilians",
    "ddos attack",
    "credit card skimming",
    "infect payload",
    "fentanyl synthesis"
];
const patternExpressions = [
    /\bmalware\b/i,
    /\bransomware\b/i,
    /\bbackdoor\b/i,
    /\bdetonator\b/i,
    /\btoxin\b/i,
    /\btric[kc]\b.*\bbiometric\b/i,
    /\bweapon/i,
    /\bmake\s+.*?explosive/i,
    /\bend\s*someone\b/i,
    /\boverdose\b/i
];
export const analyzeMessage = (input) => {
    const lower = input.toLowerCase();
    const matches = new Set();
    for (const phrase of keywordPhrases) {
        if (lower.includes(phrase)) {
            matches.add(phrase);
        }
    }
    for (const expression of patternExpressions) {
        if (expression.test(input)) {
            matches.add(expression.source);
        }
    }
    return {
        blocked: matches.size > 0,
        matches: Array.from(matches)
    };
};
export const hasSafetyViolation = (input) => analyzeMessage(input).blocked;
