// Types for the API response structure
interface Component {
  name: string;
  description: string;
  path: string;
}

interface ComponentCategory {
  category: string;
  components: Component[];
}

interface ComponentData {
  components: (Component | ComponentCategory)[];
}

// Search result with similarity score
interface SearchResult {
  component: Component;
  score: number; // Higher score = better match
}

// Fuzzy search function
export function searchComponents(
  data: ComponentData,
  query: string,
  minScore = 0.3,
): Component[] {
  if (!query.trim()) return [];

  const searchTerm = query.toLowerCase().trim();
  const results: SearchResult[] = [];

  const jsonData = JSON.parse(data as any);

  jsonData.components.forEach((item) => {
    if ('category' in item) {
      // It's a category with nested components
      item.components.forEach((component) => {
        const score = calculateFuzzyScore(component, searchTerm);
        if (score >= minScore) {
          results.push({ component, score });
        }
      });
    } else {
      // It's a direct component
      const score = calculateFuzzyScore(item, searchTerm);
      if (score >= minScore) {
        results.push({ component: item, score });
      }
    }
  });

  // Sort by score (highest first) and return components
  return results
    .sort((a, b) => b.score - a.score)
    .map((result) => result.component);
}

// Calculate fuzzy match score (0-1, higher = better match)
function calculateFuzzyScore(component: Component, searchTerm: string): number {
  const name = component.name.toLowerCase();
  const description = component.description.toLowerCase();

  // Check for exact substring matches first (highest score)
  if (name.includes(searchTerm)) return 1.0;
  if (description.includes(searchTerm)) return 0.8;

  // Calculate similarity scores
  const nameScore = getStringSimilarity(searchTerm, name) * 0.9; // Name is more important
  const descScore = getStringSimilarity(searchTerm, description) * 0.6;

  return Math.max(nameScore, descScore);
}

function getStringSimilarity(search: string, target: string): number {
  // 1. Partial word matching
  const searchWords = search.split(/\s+/);
  const targetWords = target.split(/\s+/);

  let wordMatches = 0;
  searchWords.forEach((searchWord) => {
    targetWords.forEach((targetWord) => {
      if (targetWord.includes(searchWord) || searchWord.includes(targetWord)) {
        wordMatches++;
      }
    });
  });
  const wordScore =
    wordMatches / Math.max(searchWords.length, targetWords.length);

  // 2. Levenshtein distance for typo tolerance
  const levenScore =
    1 -
    levenshteinDistance(search, target) /
      Math.max(search.length, target.length);

  // 3. Character overlap
  const overlapScore = getCharacterOverlap(search, target);

  // Combine scores (weighted average)
  return wordScore * 0.5 + levenScore * 0.3 + overlapScore * 0.2;
}

// Calculate Levenshtein distance (edit distance)
function levenshteinDistance(str1: string, str2: string): number {
  const matrix = Array(str2.length + 1)
    .fill(null)
    .map(() => Array(str1.length + 1).fill(null));

  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const substitutionCost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, // deletion
        matrix[j - 1][i] + 1, // insertion
        matrix[j - 1][i - 1] + substitutionCost, // substitution
      );
    }
  }

  return matrix[str2.length][str1.length];
}

// Calculate character overlap percentage
function getCharacterOverlap(str1: string, str2: string): number {
  const chars1 = new Set(str1.toLowerCase());
  const chars2 = new Set(str2.toLowerCase());

  const intersection = new Set([...chars1].filter((x) => chars2.has(x)));
  const union = new Set([...chars1, ...chars2]);

  return intersection.size / union.size;
}
