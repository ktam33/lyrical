'use client';

import { useEffect, useState } from 'react';

interface Entry {
  id: number;
  character: string;
  jyutping: string;
  definition: string;
  source: string | null;
}

interface ListResponse {
  entries: Entry[];
  total: number;
  page: number;
  pageSize: number;
}

const PAGE_SIZE = 50;

export default function EntriesBrowser() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({
    character: '',
    jyutping: '',
    definition: '',
    source: '',
  });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');

    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(PAGE_SIZE),
    });
    if (debouncedSearch) params.set('search', debouncedSearch);

    fetch(`/api/entries?${params.toString()}`)
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Failed to load entries');
        }
        return res.json();
      })
      .then((data: ListResponse) => {
        if (cancelled) return;
        setEntries(data.entries);
        setTotal(data.total);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, page]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const startEditing = (entry: Entry) => {
    setEditingId(entry.id);
    setSaveError('');
    setEditForm({
      character: entry.character,
      jyutping: entry.jyutping,
      definition: entry.definition,
      source: entry.source ?? '',
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setSaveError('');
  };

  const saveEditing = async (id: number) => {
    setSaving(true);
    setSaveError('');
    try {
      const res = await fetch(`/api/entries/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save entry');
      }
      setEntries((prev) => prev.map((e) => (e.id === id ? data.entry : e)));
      setEditingId(null);
    } catch (err: any) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="mb-4 flex items-center gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by character, jyutping, or definition..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <span className="text-sm text-gray-500 whitespace-nowrap">{total} entries</span>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-2 text-sm font-semibold text-gray-600 w-20">Character</th>
              <th className="px-4 py-2 text-sm font-semibold text-gray-600 w-32">Jyutping</th>
              <th className="px-4 py-2 text-sm font-semibold text-gray-600">Definition</th>
              <th className="px-4 py-2 text-sm font-semibold text-gray-600 w-48">Source</th>
              <th className="px-4 py-2 text-sm font-semibold text-gray-600 w-32">Actions</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => {
              const isEditing = editingId === entry.id;
              return (
                <tr key={entry.id} className="border-b border-gray-100 last:border-0">
                  {isEditing ? (
                    <>
                      <td className="px-4 py-2">
                        <input
                          value={editForm.character}
                          onChange={(e) =>
                            setEditForm((f) => ({ ...f, character: e.target.value }))
                          }
                          className="w-full px-2 py-1 border border-gray-300 rounded bg-white text-gray-900"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          value={editForm.jyutping}
                          onChange={(e) =>
                            setEditForm((f) => ({ ...f, jyutping: e.target.value }))
                          }
                          className="w-full px-2 py-1 border border-gray-300 rounded bg-white text-gray-900"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          value={editForm.definition}
                          onChange={(e) =>
                            setEditForm((f) => ({ ...f, definition: e.target.value }))
                          }
                          className="w-full px-2 py-1 border border-gray-300 rounded bg-white text-gray-900"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          value={editForm.source}
                          onChange={(e) => setEditForm((f) => ({ ...f, source: e.target.value }))}
                          className="w-full px-2 py-1 border border-gray-300 rounded bg-white text-gray-900"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex gap-2">
                          <button
                            onClick={() => saveEditing(entry.id)}
                            disabled={saving}
                            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                          >
                            {saving ? 'Saving...' : 'Save'}
                          </button>
                          <button
                            onClick={cancelEditing}
                            disabled={saving}
                            className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                          >
                            Cancel
                          </button>
                        </div>
                        {saveError && <p className="text-xs text-red-600 mt-1">{saveError}</p>}
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-2 text-2xl text-gray-900">{entry.character}</td>
                      <td className="px-4 py-2 text-gray-800">{entry.jyutping}</td>
                      <td className="px-4 py-2 text-gray-800">{entry.definition}</td>
                      <td className="px-4 py-2 text-gray-800 text-sm">{entry.source}</td>
                      <td className="px-4 py-2">
                        <button
                          onClick={() => startEditing(entry)}
                          className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                        >
                          Edit
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
            {!loading && entries.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  No entries found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-center gap-4">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page <= 1 || loading}
          className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50"
        >
          Previous
        </button>
        <span className="text-sm text-gray-600">
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page >= totalPages || loading}
          className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
