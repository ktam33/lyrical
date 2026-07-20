import { CantoneseCharacter } from '@/types';
import { findEntriesByCharacter, getAllEntries } from '@/utils/db';

let charactersCache: Map<string, CantoneseCharacter> | null = null;

export async function loadCantoneseDatabase(): Promise<Map<string, CantoneseCharacter>> {
  if (charactersCache) {
    console.log('🟢 [DATABASE] Using cached database:', { cacheSize: charactersCache.size });
    return charactersCache;
  }

  console.log('🟢 [DATABASE] Loading database from sqlite...');

  charactersCache = new Map();
  // A later duplicate row for the same character overwrites an earlier one,
  // matching the original flat-file behavior.
  for (const entry of getAllEntries()) {
    charactersCache.set(entry.character, {
      character: entry.character,
      pronunciation: entry.jyutping,
      definition: entry.definition,
    });
  }

  console.log('✅ [DATABASE] Database loaded successfully:', {
    totalCharacters: charactersCache.size,
  });

  return charactersCache;
}

export async function findCharacter(character: string): Promise<CantoneseCharacter | null> {
  const entries = findEntriesByCharacter(character);
  if (entries.length === 0) return null;
  const latest = entries[entries.length - 1];
  return {
    character: latest.character,
    pronunciation: latest.jyutping,
    definition: latest.definition,
  };
}

export async function findNewCharacters(text: string): Promise<{
  newCharacters: string[];
  foundCharacters: CantoneseCharacter[];
}> {
  console.log('🟢 [DATABASE] Analyzing characters in text:', { textLength: text.length });

  const database = await loadCantoneseDatabase();
  const characters = Array.from(new Set(text.split('')));
  console.log('🟢 [DATABASE] Unique characters found:', {
    totalUnique: characters.length,
    sample: characters.slice(0, 20).join(''),
  });

  const newCharacters: string[] = [];
  const foundCharacters: CantoneseCharacter[] = [];
  let skippedCount = 0;

  for (const char of characters) {
    // Skip whitespace, punctuation, numbers, and Latin characters
    if (/[\s\u0000-\u007F\u00A0-\u024F\u2000-\u206F\u20A0-\u20CF\uFE30-\uFE4F\uFE50-\uFE6F\uFF00-\uFFEF]/.test(char)) {
      skippedCount++;
      continue;
    }

    const found = database.get(char);
    if (found) {
      foundCharacters.push(found);
    } else {
      newCharacters.push(char);
    }
  }

  console.log('✅ [DATABASE] Character analysis complete:', {
    newCharacters: newCharacters.length,
    foundCharacters: foundCharacters.length,
    skippedCharacters: skippedCount,
    newCharactersSample: newCharacters.slice(0, 10).join(''),
  });

  return { newCharacters, foundCharacters };
}
