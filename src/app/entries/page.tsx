import Link from 'next/link';
import EntriesBrowser from '@/components/EntriesBrowser';

export default function EntriesPage() {
  return (
    <main className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Cantonese Dictionary</h1>
          <p className="text-gray-600 text-lg">Browse and edit character entries</p>
          <Link href="/" className="inline-block mt-3 text-blue-600 hover:underline">
            &larr; Back to translator
          </Link>
        </div>

        <EntriesBrowser />
      </div>
    </main>
  );
}
