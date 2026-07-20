'use client';

import { useState } from 'react';
import { TranslationResult } from '@/types';

interface TranslationDisplayProps {
  translation: TranslationResult[];
}

export default function TranslationDisplay({ translation }: TranslationDisplayProps) {
  const [copied, setCopied] = useState(false);

  if (!translation || translation.length === 0) {
    return null;
  }

  const handleCopy = async () => {
    const text = translation
      .map((line) => `${line.originalLine}\n${line.translatedLine}`)
      .join('\n\n');
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-800">Translation</h3>
        <button
          onClick={handleCopy}
          className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <div className="space-y-4">
        {translation.map((line, index) => (
          <div key={index} className="border-l-4 border-blue-500 pl-4">
            <div className="text-lg font-medium text-gray-900 mb-1">
              {line.originalLine}
            </div>
            <div className="text-gray-700 italic">
              {line.translatedLine}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}