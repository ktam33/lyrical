export interface CantoneseCharacter {
  character: string;
  pronunciation: string;
  definition: string;
}

export interface Entry {
  id: number;
  character: string;
  jyutping: string;
  definition: string;
  source: string | null;
}

export interface TranslationResult {
  originalLine: string;
  translatedLine: string;
}

export interface CharacterAnalysis {
  newCharacters: CantoneseCharacter[];
  foundCharacters: CantoneseCharacter[];
}

export interface LyricsProcessingResult {
  translation: TranslationResult[];
  characterAnalysis: CharacterAnalysis;
}