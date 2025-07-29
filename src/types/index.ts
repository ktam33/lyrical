export interface CantoneseCharacter {
  character: string;
  pronunciation: string;
  definition: string;
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