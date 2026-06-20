const TECH_SYNONYMS: Record<string, string[]> = {
  react: ["reactjs", "react.js"],
  nodejs: ["node", "node.js"],
  typescript: ["ts"],
  javascript: ["js", "es6", "es2015"],
  postgresql: ["postgres", "psql"],
  "next.js": ["nextjs", "next"],
  python: ["py"],
  kubernetes: ["k8s"],
};

const synonymMap = new Map<string, string>();

for (const [canonical, synonyms] of Object.entries(
  TECH_SYNONYMS,
)) {
  synonymMap.set(
    canonical.toLowerCase(),
    canonical,
  );

  for (const synonym of synonyms) {
    synonymMap.set(
      synonym.toLowerCase(),
      canonical,
    );
  }
}

export function canonicalizeSkill(
  skill: string,
): string {
  const normalized =
    skill.trim().toLowerCase();

  return (
    synonymMap.get(normalized) ??
    normalized
  );
}