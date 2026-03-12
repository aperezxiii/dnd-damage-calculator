// Rolls a dice (e.g., 2d6) using crypto-secure randomness
export function rollDice(sides, rolls) {
  const rollsArray = Array.from({ length: rolls }, () => {
    const rand = new Uint32Array(1);
    window.crypto.getRandomValues(rand);
    return (rand[0] % sides) + 1;
  });

  const total = rollsArray.reduce((sum, r) => sum + r, 0);
  return { total, rollsArray };
}

// Parses dice notation like "2d6+3"
export function parseDiceNotation(notation) {
  const match = notation.match(/(\d*)d(\d+)([+-]\d+)?/i);
  if (match) {
    const count = match[1] ? parseInt(match[1], 10) : 1;
    const sides = parseInt(match[2], 10);
    const modifier = match[3] ? parseInt(match[3], 10) : 0;
    return { count, sides, modifier };
  } else if (notation.match(/^[+-]\d+$/)) {
    return { count: 0, sides: 0, modifier: parseInt(notation, 10) };
  }
  return { count: 0, sides: 0, modifier: 0 };
}

// Capitalize a string
export function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Extract damage type from attack name like "Smite [Radiant]"
export function extractDamageType(name) {
  const match = name.match(/\[(.+?)\]/);
  const validTypes = [
    "slashing", "piercing", "bludgeoning", "fire", "cold", "radiant",
    "necrotic", "force", "acid", "lightning", "thunder", "poison", "psychic"
  ];
  if (match) {
    const type = match[1].trim().toLowerCase();
    if (validTypes.includes(type)) return capitalize(type);
  }
  return "Neutral";
}
