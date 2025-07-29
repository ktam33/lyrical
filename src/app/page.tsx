'use client';

import { useState } from 'react';
import LyricsInput from '@/components/LyricsInput';
import TranslationDisplay from '@/components/TranslationDisplay';
import CharacterAnalysis from '@/components/CharacterAnalysis';
import LoadingSpinner from '@/components/LoadingSpinner';
import { TranslationResult, CantoneseCharacter } from '@/types';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [translation, setTranslation] = useState<TranslationResult[]>([]);
  const [newCharacters, setNewCharacters] = useState<string[]>([]);
  const [suggestedDefinitions, setSuggestedDefinitions] = useState<CantoneseCharacter[]>([]);
  const [error, setError] = useState<string>('');

  const handleLyricsSubmit = async (lyrics: string) => {
    console.log('🚀 Starting lyrics processing...', { lyricsLength: lyrics.length });
    setLoading(true);
    setError('');
    setTranslation([]);
    setNewCharacters([]);
    setSuggestedDefinitions([]);

    try {
      // Step 1: Get translation
      console.log('📝 Step 1: Calling translation API...');
      const translationStartTime = performance.now();
      
      const translationResponse = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ lyrics }),
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
        firstTranslation: translationData.translation?.[0]
      });
      setTranslation(translationData.translation);

      // Step 2: Analyze characters
      console.log('🔍 Step 2: Calling character analysis API...');
      const analysisStartTime = performance.now();
      
      const analysisResponse = await fetch('/api/analyze-characters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ lyrics, songContext: '' }),
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
        foundCharactersCount: analysisData.foundCharacters?.length || 0
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
    <main className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Cantonese Lyrics Translator
          </h1>
          <p className="text-gray-600 text-lg">
            Translate Cantonese song lyrics and discover new characters
          </p>
        </div>

        <div className="space-y-6">
          <LyricsInput onSubmit={handleLyricsSubmit} loading={loading} />
          
          {error && (
            <div className="w-full max-w-4xl mx-auto p-6 bg-red-50 rounded-lg border border-red-200">
              <h3 className="text-lg font-bold text-red-800 mb-2">Error</h3>
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {loading && <LoadingSpinner />}

          {translation.length > 0 && (
            <TranslationDisplay translation={translation} />
          )}

          {!loading && (newCharacters.length > 0 || suggestedDefinitions.length === 0) && (
            <CharacterAnalysis 
              newCharacters={newCharacters}
              suggestedDefinitions={suggestedDefinitions}
            />
          )}
        </div>

        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>
            This application uses OpenAI GPT-4 to provide contextual translations and character definitions.
          </p>
        </div>
      </div>
    </main>
  );
}