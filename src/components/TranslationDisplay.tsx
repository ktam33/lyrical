'use client';

import { TranslationResult } from '@/types';

interface TranslationDisplayProps {
  translation: TranslationResult[];
}

export default function TranslationDisplay({ translation }: TranslationDisplayProps) {
  if (!translation || translation.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-xl font-bold mb-4 text-gray-800">Translation</h3>
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