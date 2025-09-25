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

// Common UI terms to ignore in search queries
const UI_TERMS_TO_IGNORE = new Set([
  'component',
  'components',
  'section',
  'sections',
  'element',
  'elements',
  'ui',
  'part',
  'parts',
  'piece',
  'pieces',
  'block',
  'blocks',
  'module',
  'modules',
  'item',
  'items',
]);

// Fuzzy search function
export function searchComponents(
  data: ComponentData,
  query: string,
  minScore = 0.35,
): Component[] {
  if (!query.trim()) return [];

  // Filter out common UI terms from the search query
  const cleanedQuery = query
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .filter((word) => !UI_TERMS_TO_IGNORE.has(word))
    .join(' ');

  // If all words were filtered out, use original query
  const searchTerm = cleanedQuery || query.toLowerCase().trim();
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

  // Create a cleaned version of search term for exact matching
  const cleanedSearchTerm = searchTerm
    .split(/\s+/)
    .filter((word) => !UI_TERMS_TO_IGNORE.has(word))
    .join(' ');

  const termToMatch = cleanedSearchTerm || searchTerm;

  // Industry standard: Prioritize exact and prefix matches
  if (name === termToMatch) return 1.0; // Perfect match
  if (name.startsWith(termToMatch)) return 0.95; // Prefix match
  if (name.includes(termToMatch)) return 0.85; // Contains match

  // Check individual word matches for multi-word searches
  const meaningfulWords = termToMatch.split(/\s+/);
  for (const word of meaningfulWords) {
    if (word.length > 2) {
      if (name.startsWith(word)) return 0.8; // Word prefix match
      if (name.includes(word)) return 0.7; // Word contains match
    }
  }

  // Calculate similarity scores with improved typo tolerance - only use name
  const nameScore = getStringSimilarity(searchTerm, name);

  return nameScore;
}

function getStringSimilarity(search: string, target: string): number {
  // Industry standard: Allow reasonable typo tolerance for UI search
  const maxAllowedDistance = Math.max(2, Math.floor(search.length * 0.25)); // 25% error rate max
  const distance = levenshteinDistance(search, target);

  // Reject if too many errors
  if (distance > maxAllowedDistance) {
    return 0;
  }

  // 1. Enhanced partial word matching with UI term filtering
  const searchWords = search
    .split(/\s+/)
    .filter((word) => !UI_TERMS_TO_IGNORE.has(word.toLowerCase()));
  const targetWords = target.split(/\s+/);

  let wordMatches = 0;
  let totalSearchWords = searchWords.length;

  // If no meaningful search words remain, fall back to original search
  if (totalSearchWords === 0) {
    const originalSearchWords = search.split(/\s+/);
    searchWords.push(...originalSearchWords);
    totalSearchWords = originalSearchWords.length;
  }

  searchWords.forEach((searchWord) => {
    targetWords.forEach((targetWord) => {
      if (targetWord.includes(searchWord) || searchWord.includes(targetWord)) {
        wordMatches++;
      }
    });
  });

  // Use only meaningful search words for scoring
  const wordScore = totalSearchWords > 0 ? wordMatches / totalSearchWords : 0;

  // 2. Controlled Levenshtein distance scoring with better tolerance
  const maxLength = Math.max(search.length, target.length);
  const levenScore =
    distance === 0 ? 1.0 : Math.max(0, 1 - distance / maxLength);

  // 3. Character overlap for additional similarity
  const overlapScore = getCharacterOverlap(search, target);

  // Balanced weights for better typo tolerance
  return wordScore * 0.4 + levenScore * 0.4 + overlapScore * 0.2;
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
