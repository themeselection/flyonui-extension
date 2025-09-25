import { searchComponents } from '@/hooks/use-component-search';
import { useCallback, useEffect, useState } from 'react';

export interface BlockItem {
  path: string;
  title: string;
  description: string;
  category: 'popular' | 'recent';
  name?: string;
}

// API Types
interface APIBlockMetadata {
  name: string;
  description: string;
  path: string;
}

interface APIBlockResponse {
  blocks?: Array<{
    path: string;
    title?: string;
    blockDescription?: string;
  }>;
}

interface BlockWithScore {
  block: BlockItem;
  score: number;
}

interface UseBlockSearchOptions {
  licenseKey?: string;
  debounceMs?: number;
  minScore?: number;
  maxResults?: number;
}

interface UseBlockSearchResult {
  searchResults: BlockItem[];
  isSearching: boolean;
  searchError: string | null;
  performLocalSearch: (blocks: BlockItem[], query: string) => BlockItem[];
  fuzzySearchBlocks: (
    blocks: BlockItem[],
    query: string,
    minScore?: number,
  ) => BlockItem[];
}

// Helper functions for API calls
const buildAPIHeaders = (licenseKey?: string): Record<string, string> => {
  const headers: Record<string, string> = {
    Accept: '*/*',
    'Content-Type': 'application/json',
  };

  if (licenseKey) {
    headers['x-license-key'] = licenseKey;
  }

  return headers;
};

const fetchBlockMetadata = async (licenseKey?: string): Promise<any> => {
  const headers = buildAPIHeaders(licenseKey);

  const response = await fetch(
    'https://flyonui.com/api/mcp/instructions?path=block_metadata.json',
    {
      headers,
      signal: AbortSignal.timeout(5000), // 5 second timeout
    },
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch metadata: ${response.status} ${response.statusText}`,
    );
  }

  const data = await response.json();

  return data;
};

const fetchBlockDetails = async (
  path: string,
  licenseKey?: string,
): Promise<APIBlockResponse | null> => {
  try {
    const headers = buildAPIHeaders(licenseKey);

    const url = `https://flyonui.com/api/mcp${path}?type=mcp`;
    console.log(`Fetching block details from: ${url}`);

    const response = await fetch(url, { headers });

    if (!response.ok) {
      console.warn(
        `Failed to fetch block details for ${path}: ${response.status} ${response.statusText}`,
      );
      return null;
    }

    const data = await response.json();
    console.log(`Block details for ${path}:`, data);

    return data;
  } catch (error) {
    console.warn(`Error fetching block details for ${path}:`, error);
    return null;
  }
};

const extractTitleFromPath = (path: string): string => {
  const segments = path.split('/');
  const lastSegment = segments[segments.length - 1] || 'Unknown';
  // Convert kebab-case to Title Case (e.g., 'hero-22' -> 'Hero 22')
  return lastSegment
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const convertAPIBlockToBlockItems = (
  apiBlock: APIBlockMetadata,
  blockResponse?: APIBlockResponse,
): BlockItem[] => {
  // If we have block response with multiple blocks, convert all of them
  if (blockResponse?.blocks && blockResponse.blocks.length > 0) {
    return blockResponse.blocks.map((block, index) => {
      const blockPath = block.path || `${apiBlock.path}/${index + 1}`;
      const blockTitle =
        block.title || `${apiBlock.name || 'Block'} ${index + 1}`;

      return {
        path: blockPath,
        title: blockTitle,
        description: block.blockDescription || `${blockTitle} component`,
        category: 'popular' as const,
        name: blockTitle,
      };
    });
  }

  // Fallback to single block from metadata if no detailed blocks found
  return [
    {
      path: apiBlock.path,
      title: apiBlock.name || extractTitleFromPath(apiBlock.path),
      description: apiBlock.description || `Component at ${apiBlock.path}`,
      category: 'popular' as const,
      name: apiBlock.name || extractTitleFromPath(apiBlock.path),
    },
  ];
};

const calculateBlockFuzzyScore = (
  block: BlockItem,
  searchTerm: string,
): number => {
  const title = (block.title || '').toLowerCase();
  const name = (block.name || '').toLowerCase();

  // Industry standard: Prioritize exact and prefix matches
  if (title === searchTerm) return 1.0; // Perfect title match
  if (name === searchTerm) return 0.98; // Perfect name match
  if (title.startsWith(searchTerm)) return 0.95; // Title prefix match
  if (name.startsWith(searchTerm)) return 0.92; // Name prefix match
  if (title.includes(searchTerm)) return 0.85; // Title contains match
  if (name.includes(searchTerm)) return 0.8; // Name contains match

  // Check individual word matches for multi-word searches
  const searchWords = searchTerm.split(/\s+/);
  for (const word of searchWords) {
    if (word.length > 2) {
      if (title.startsWith(word)) return 0.75;
      if (name.startsWith(word)) return 0.72;
      if (title.includes(word)) return 0.65;
      if (name.includes(word)) return 0.62;
    }
  }

  // Calculate similarity scores with improved typo tolerance
  const titleScore = getBlockStringSimilarity(searchTerm, title) * 1.0; // Title is most important
  const nameScore = getBlockStringSimilarity(searchTerm, name) * 0.9;

  return Math.max(titleScore, nameScore);
};

const getBlockStringSimilarity = (search: string, target: string): number => {
  // 1. Enhanced word-based matching for block titles like "Checkout 1", "Hero 2"
  const searchWords = search.split(/\s+/);
  const targetWords = target.split(/\s+/);

  let bestWordScore = 0;

  // Check each search word against each target word with typo tolerance
  searchWords.forEach((searchWord) => {
    targetWords.forEach((targetWord) => {
      // Direct word matches
      if (targetWord.includes(searchWord) || searchWord.includes(targetWord)) {
        bestWordScore = Math.max(bestWordScore, 1.0);
        return;
      }

      // Typo-tolerant word matching
      const wordDistance = levenshteinDistance(searchWord, targetWord);
      const maxWordDistance = Math.max(1, Math.floor(searchWord.length * 0.3)); // 30% tolerance for words

      if (wordDistance <= maxWordDistance) {
        const wordSimilarity =
          1 - wordDistance / Math.max(searchWord.length, targetWord.length);
        bestWordScore = Math.max(bestWordScore, wordSimilarity * 0.9); // High score for word matches
      }
    });
  });

  // If we found good word matches, return that score
  if (bestWordScore > 0.5) {
    return bestWordScore;
  }

  // Fall back to full string comparison for exact typos
  const maxAllowedDistance = Math.max(2, Math.floor(search.length * 0.25)); // 25% error rate max
  const distance = levenshteinDistance(search, target);

  // Reject if too many errors
  if (distance > maxAllowedDistance) {
    return 0;
  }

  // 2. Full string Levenshtein distance scoring
  const maxLength = Math.max(search.length, target.length);
  const levenScore =
    distance === 0 ? 1.0 : Math.max(0, 1 - distance / maxLength);

  // 3. Character overlap for additional similarity
  const overlapScore = getCharacterOverlap(search, target);

  // Combine full string scores
  return levenScore * 0.6 + overlapScore * 0.4;
};

const levenshteinDistance = (str1: string, str2: string): number => {
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
};

const getCharacterOverlap = (str1: string, str2: string): number => {
  const chars1 = new Set(str1.toLowerCase());
  const chars2 = new Set(str2.toLowerCase());

  const intersection = new Set([...chars1].filter((x) => chars2.has(x)));
  const union = new Set([...chars1, ...chars2]);

  return intersection.size / union.size;
};

// Natural sorting for numeric sequences (Hero 1, Hero 2, Hero 11)
const naturalSort = (a: string, b: string): number => {
  const collator = new Intl.Collator(undefined, {
    numeric: true,
    sensitivity: 'base',
  });
  return collator.compare(a, b);
};

// Fuzzy search and sort blocks by relevance
const fuzzySearchBlocks = (
  blocks: BlockItem[],
  query: string,
  minScore = 0.35,
): BlockItem[] => {
  if (!query.trim() || blocks.length === 0) {
    return blocks;
  }

  const searchTerm = query.toLowerCase().trim();
  const results: BlockWithScore[] = [];

  // Calculate fuzzy scores for all blocks
  blocks.forEach((block) => {
    const score = calculateBlockFuzzyScore(block, searchTerm);
    console.log(`Block: ${block.title}, Score: ${score.toFixed(3)}`);
    if (score >= minScore) {
      results.push({ block, score });
    }
  });

  // Sort by score (highest first), then by natural order for same scores
  const sortedResults = results.sort((a, b) => {
    // First sort by relevance score
    if (Math.abs(a.score - b.score) > 0.01) {
      return b.score - a.score;
    }

    // For items with similar scores, use natural sorting (handles Hero 1, Hero 2, Hero 11 correctly)
    return naturalSort(a.block.title || '', b.block.title || '');
  });

  console.log(
    `Fuzzy search for "${query}": ${sortedResults.length}/${blocks.length} blocks matched (min score: ${minScore})`,
  );

  return sortedResults.map((result) => result.block);
};

const performLocalSearch = (
  blocks: BlockItem[],
  query: string,
): BlockItem[] => {
  // Use fuzzy search for local blocks too for consistency
  return fuzzySearchBlocks(blocks, query, 0.3); // Slightly lower threshold for local search
};

const fetchAndSearchBlocks = async (
  query: string,
  licenseKey?: string,
  maxResults = 20,
): Promise<BlockItem[]> => {
  try {
    // Step 1: Get metadata and filter by search query using existing fuzzy search
    const metadata = await fetchBlockMetadata(licenseKey);
    const searchResults = searchComponents(metadata, query);

    console.log(
      `Search query: "${query}", Found ${searchResults.length} matching categories/paths`,
    );

    if (searchResults.length === 0) {
      return [];
    }

    // Step 2: Fetch details for the most relevant results
    const limitedResults = searchResults.slice(0, maxResults);

    const blockDetailsPromises = limitedResults.map(async (result, index) => {
      console.log(
        `Fetching blocks for path ${index + 1}/${limitedResults.length}: ${result.path}`,
      );
      const blockResponse = await fetchBlockDetails(result.path, licenseKey);
      const blocks = convertAPIBlockToBlockItems(
        result,
        blockResponse || undefined,
      );
      console.log(`Path ${result.path} returned ${blocks.length} blocks`);
      return blocks;
    });

    const blockArrays = await Promise.all(blockDetailsPromises);

    // Flatten the array of arrays into a single array of blocks
    const allBlocks = blockArrays.flat().filter((block) => block !== null);

    console.log(`Total blocks before fuzzy search: ${allBlocks.length}`);

    // Step 3: Apply fuzzy search to the final block results for better relevance
    const fuzzySearchedBlocks = fuzzySearchBlocks(allBlocks, query);

    console.log(
      `Total blocks after fuzzy search: ${fuzzySearchedBlocks.length}`,
    );
    return fuzzySearchedBlocks;
  } catch (error) {
    console.warn('FlyonUI API search failed, using local results only:', error);
    return [];
  }
};

const removeDuplicateBlocks = (blocks: BlockItem[]): BlockItem[] => {
  const seen = new Set<string>();
  return blocks.filter((block) => {
    if (seen.has(block.path)) {
      return false;
    }
    seen.add(block.path);
    return true;
  });
};

export const useBlockSearch = (
  searchQuery: string,
  localBlocks: BlockItem[],
  options: UseBlockSearchOptions = {},
): UseBlockSearchResult => {
  const {
    licenseKey,
    debounceMs = 300,
    minScore = 0.35,
    maxResults = 20,
  } = options;

  const [searchResults, setSearchResults] = useState<BlockItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Search for blocks using the API
  useEffect(() => {
    if (!searchQuery?.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      setSearchError(null);
      return;
    }

    const searchTimeout = setTimeout(async () => {
      setIsSearching(true);
      setSearchError(null);

      try {
        const query = searchQuery.trim().toLowerCase();

        // Step 1: Quick local search first
        const localResults = performLocalSearch(localBlocks, query);

        // Show local results immediately
        setSearchResults(localResults);

        // Step 2: Fetch from FlyonUI API (includes fuzzy search)
        const apiResults = await fetchAndSearchBlocks(
          query,
          licenseKey,
          maxResults,
        );

        if (apiResults.length > 0) {
          // Combine local and API results, remove duplicates

          const combinedResults = [...apiResults, ...localResults];
          const uniqueResults = removeDuplicateBlocks(combinedResults);

          // Apply fuzzy search to the combined results for final ranking
          const finalResults = fuzzySearchBlocks(
            uniqueResults,
            query,
            minScore,
          );

          setSearchResults(finalResults);
        } else {
          console.log('No API results found, keeping local results only');
        }
      } catch (error) {
        console.error('Search error:', error);
        setSearchError('Search failed');
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, debounceMs);

    return () => clearTimeout(searchTimeout);
  }, [searchQuery, localBlocks, licenseKey, debounceMs, minScore, maxResults]);

  // Expose utility functions for external use
  const performLocalSearchCallback = useCallback(
    (blocks: BlockItem[], query: string) => performLocalSearch(blocks, query),
    [],
  );

  const fuzzySearchBlocksCallback = useCallback(
    (blocks: BlockItem[], query: string, customMinScore?: number) =>
      fuzzySearchBlocks(blocks, query, customMinScore ?? minScore),
    [minScore],
  );

  return {
    searchResults,
    isSearching,
    searchError,
    performLocalSearch: performLocalSearchCallback,
    fuzzySearchBlocks: fuzzySearchBlocksCallback,
  };
};
