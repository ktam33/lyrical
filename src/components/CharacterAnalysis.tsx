'use client';

import { CantoneseCharacter } from '@/types';

interface CharacterAnalysisProps {
  newCharacters: string[];
  suggestedDefinitions: CantoneseCharacter[];
}

export default function CharacterAnalysis({ 
  newCharacters, 
  suggestedDefinitions 
}: CharacterAnalysisProps) {
  if (!newCharacters || newCharacters.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6 bg-green-50 rounded-lg border border-green-200">
        <h3 className="text-xl font-bold mb-2 text-green-800">Character Analysis</h3>
        <p className="text-green-700">
          ✅ All characters in the lyrics are already in the database!
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-yellow-50 rounded-lg border border-yellow-200">
      <h3 className="text-xl font-bold mb-4 text-yellow-800">
        New Characters Found ({newCharacters.length})
      </h3>
      <p className="text-yellow-700 mb-4">
        The following characters were not found in the database. Here are suggested definitions based on the song context:
      </p>
      
      <div className="space-y-3">
        {suggestedDefinitions.map((char, index) => (
          <div key={index} className="bg-white p-4 rounded-md border border-yellow-300">
            <div className="flex items-start space-x-4">
              <div className="text-3xl font-bold text-gray-900 flex-shrink-0">
                {char.character}
              </div>
              <div className="flex-1">
                <div className="text-sm text-gray-600 mb-1">
                  Pronunciation: <span className="font-mono">{char.pronunciation}</span>
                </div>
                <div className="text-gray-800">
                  {char.definition}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 p-3 bg-blue-50 rounded-md border border-blue-200">
        <p className="text-blue-800 text-sm">
          💡 <strong>Note:</strong> These definitions are contextually generated for this song. 
          You can copy the lines below to add to your character database:
        </p>
      </div>
      
      <div className="mt-3 bg-gray-900 text-green-400 p-4 rounded-md font-mono text-sm">
        {suggestedDefinitions.map((char) => (
          <div key={char.character}>
            {char.character}	{char.pronunciation} {char.definition}
          </div>
        ))}
      </div>
    </div>
  );
}