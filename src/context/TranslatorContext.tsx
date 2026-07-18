'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { TranslationResult, CantoneseCharacter } from '@/types';

interface TranslatorContextValue {
  lyrics: string;
  setLyrics: (lyrics: string) => void;
  loading: boolean;
  translation: TranslationResult[];
  newCharacters: string[];
  suggestedDefinitions: CantoneseCharacter[];
  error: string;
  submitLyrics: (lyrics: string) => Promise<void>;
}

const TranslatorContext = createContext<TranslatorContextValue | null>(null);

export function TranslatorProvider({ children }: { children: ReactNode }) {
  const [lyrics, setLyrics] = useState('');
  const [loading, setLoading] = useState(false);
  const [translation, setTranslation] = useState<TranslationResult[]>([]);
  const [newCharacters, setNewCharacters] = useState<string[]>([]);
  const [suggestedDefinitions, setSuggestedDefinitions] = useState<CantoneseCharacter[]>([]);
  const [error, setError] = useState<string>('');

  const submitLyrics = async (submittedLyrics: string) => {
    console.log('🚀 Starting lyrics processing...', { lyricsLength: submittedLyrics.length });
    setLoading(true);
    setError('');
    setTranslation([]);
    setNewCharacters([]);
    setSuggestedDefinitions([]);

    try {
      console.log('📝 Step 1: Calling translation API...');
      const translationStartTime = performance.now();

      const translationResponse = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ lyrics: submittedLyrics }),
      });

      const translationEndTime = performance.now();
      console.log(`⏱️ Translation API call took ${Math.round(translationEndTime - translationStartTime)}ms`);
      console.log('📡 Translation response status:', translationResponse.status);

      if (!translationResponse.ok) {
        const errorData = await translationResponse.json();
        console.error('❌ Translation API error:', errorData);
        throw new Error(errorData.error || 'Translation failed');
      }

      const translationData = await translationResponse.json();
      console.log('✅ Translation received:', {
        translationCount: translationData.translation?.length || 0,
        firstTranslation: translationData.translation?.[0],
      });
      setTranslation(translationData.translation);

      console.log('🔍 Step 2: Calling character analysis API...');
      const analysisStartTime = performance.now();

      const analysisResponse = await fetch('/api/analyze-characters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ lyrics: submittedLyrics, songContext: '' }),
      });

      const analysisEndTime = performance.now();
      console.log(`⏱️ Character analysis API call took ${Math.round(analysisEndTime - analysisStartTime)}ms`);
      console.log('📡 Character analysis response status:', analysisResponse.status);

      if (!analysisResponse.ok) {
        const errorData = await analysisResponse.json();
        console.error('❌ Character analysis API error:', errorData);
        throw new Error(errorData.error || 'Character analysis failed');
      }

      const analysisData = await analysisResponse.json();
      console.log('✅ Character analysis received:', {
        newCharactersCount: analysisData.newCharacters?.length || 0,
        suggestedDefinitionsCount: analysisData.suggestedDefinitions?.length || 0,
        foundCharactersCount: analysisData.foundCharacters?.length || 0,
      });

      setNewCharacters(analysisData.newCharacters || []);
      setSuggestedDefinitions(analysisData.suggestedDefinitions || []);

      console.log('🎉 Processing completed successfully!');
    } catch (err: any) {
      console.error('💥 Processing error:', err);
      setError(err.message || 'An error occurred while processing the lyrics');
    } finally {
      setLoading(false);
      console.log('🏁 Processing finished, loading state cleared');
    }
  };

  return (
    <TranslatorContext.Provider
      value={{
        lyrics,
        setLyrics,
        loading,
        translation,
        newCharacters,
        suggestedDefinitions,
        error,
        submitLyrics,
      }}
    >
      {children}
    </TranslatorContext.Provider>
  );
}

export function useTranslator(): TranslatorContextValue {
  const context = useContext(TranslatorContext);
  if (!context) {
    throw new Error('useTranslator must be used within a TranslatorProvider');
  }
  return context;
}
