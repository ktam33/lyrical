'use client';

import { useState } from 'react';

interface LyricsInputProps {
  onSubmit: (lyrics: string) => void;
  loading: boolean;
}

export default function LyricsInput({ onSubmit, loading }: LyricsInputProps) {
  const [lyrics, setLyrics] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (lyrics.trim()) {
      onSubmit(lyrics.trim());
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        Cantonese Lyrics Translator
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="lyrics" className="block text-sm font-medium text-gray-700 mb-2">
            Enter Cantonese Song Lyrics:
          </label>
          <textarea
            id="lyrics"
            value={lyrics}
            onChange={(e) => setLyrics(e.target.value)}
            placeholder="Paste your Cantonese lyrics here..."
            className="w-full h-64 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-gray-900"
            disabled={loading}
          />
        </div>
        <button
          type="submit"
          disabled={loading || !lyrics.trim()}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Processing...' : 'Translate Lyrics'}
        </button>
      </form>
    </div>
  );
}