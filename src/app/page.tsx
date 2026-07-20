'use client';

import Link from 'next/link';
import LyricsInput from '@/components/LyricsInput';
import TranslationDisplay from '@/components/TranslationDisplay';
import CharacterAnalysis from '@/components/CharacterAnalysis';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useTranslator } from '@/context/TranslatorContext';

export default function Home() {
  const {
    lyrics,
    setLyrics,
    loading,
    translation,
    newCharacters,
    suggestedDefinitions,
    error,
    submitLyrics,
  } = useTranslator();

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
          <Link href="/entries" className="inline-block mt-3 text-blue-600 hover:underline">
            Browse dictionary entries &rarr;
          </Link>
        </div>

        <div className="space-y-6">
          <LyricsInput
            lyrics={lyrics}
            onLyricsChange={setLyrics}
            onSubmit={submitLyrics}
            loading={loading}
          />

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
