import { promises as fs } from 'fs';
import path from 'path';
import { CantoneseCharacter } from '@/types';

let charactersCache: Map<string, CantoneseCharacter> | null = null;

export async function loadCantoneseDatabase(): Promise<Map<string, CantoneseCharacter>> {
  if (charactersCache) {
    console.log('🟢 [DATABASE] Using cached database:', { cacheSize: charactersCache.size });
    return charactersCache;
  }

  console.log('🟢 [DATABASE] Loading database from file...');
  const filePath = path.join(process.cwd(), 'data', 'Cantonese.txt');
  console.log('🟢 [DATABASE] File path:', filePath);
  
  try {
    const fileContent = await fs.readFile(filePath, 'utf-8');
    console.log('🟢 [DATABASE] File loaded:', { 
      contentLength: fileContent.length,
      lineCount: fileContent.split('\n').length 
    });
    
    const lines = fileContent.split('\n');
    
    // Skip the first two header lines
    const dataLines = lines.slice(2);
    console.log('🟢 [DATABASE] Processing data lines:', dataLines.length);
    
    charactersCache = new Map();
    let processedCount = 0;
    
    for (const line of dataLines) {
      if (line.trim()) {
        const parts = line.split('\t');
        if (parts.length >= 2) {
          const character = parts[0];
          const rest = parts.slice(1).join('\t');
          
          // Parse pronunciation and definition
          // Format: "pronunciation definition"
          const spaceIndex = rest.indexOf(' ');
          const pronunciation = spaceIndex > 0 ? rest.substring(0, spaceIndex) : '';
          const definition = spaceIndex > 0 ? rest.substring(spaceIndex + 1) : rest;
          
          charactersCache.set(character, {
            character,
            pronunciation,
            definition
          });
          processedCount++;
        }
      }
    }
    
    console.log('✅ [DATABASE] Database loaded successfully:', { 
      totalCharacters: charactersCache.size,
      processedLines: processedCount 
    });
    
    return charactersCache;
  } catch (error: any) {
    console.error('❌ [DATABASE] Failed to load database:', {
      error: error.message,
      filePath
    });
    throw error;
  }
}

export async function findCharacter(character: string): Promise<CantoneseCharacter | null> {
  const database = await loadCantoneseDatabase();
  return database.get(character) || null;
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
    sample: characters.slice(0, 20).join('') 
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
    newCharactersSample: newCharacters.slice(0, 10).join('')
  });
  
  return { newCharacters, foundCharacters };
}