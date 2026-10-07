import { useState, useEffect } from 'react';
import type { IndexData, Question } from '../types';

interface CacheEntry {
  indexData: IndexData | null;
  questionsByChapter: Map<number, Question[]>;
  loaded: boolean;
  loading: boolean;
  error: string | null;
  listeners: Array<() => void>;
}

const cache = new Map<string, CacheEntry>();

function getEntry(certId: string): CacheEntry {
  let entry = cache.get(certId);
  if (!entry) {
    entry = {
      indexData: null,
      questionsByChapter: new Map(),
      loaded: false,
      loading: false,
      error: null,
      listeners: [],
    };
    cache.set(certId, entry);
  }
  return entry;
}

async function fetchJson<T>(url: string): Promise<T> {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`Failed to load ${url} (HTTP ${r.status})`);
  return await r.json() as T;
}

async function loadData(certId: string) {
  const entry = getEntry(certId);
  if (entry.loaded || entry.loading) return;
  entry.loading = true;
  entry.error = null;
  try {
    const base = `${import.meta.env.BASE_URL}data/${certId}`;
    const idx = await fetchJson<IndexData>(`${base}/index.json`);
    const entries = await Promise.all(
      idx.chapters.map(ch =>
        fetchJson<Question[]>(`${base}/chapter-${ch.id}.json`)
          .then(qs => [ch.id, qs] as [number, Question[]])
      )
    );
    entry.indexData = idx;
    entry.questionsByChapter = new Map(entries);
    entry.loaded = true;
  } catch (e) {
    entry.error = e instanceof Error ? e.message : String(e);
  } finally {
    entry.loading = false;
    entry.listeners.slice().forEach(fn => fn());
  }
}

export function useData(certId: string) {
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const entry = getEntry(certId);
    const notify = () => forceUpdate(n => n + 1);
    entry.listeners.push(notify);
    void loadData(certId);
    return () => {
      const i = entry.listeners.indexOf(notify);
      if (i >= 0) entry.listeners.splice(i, 1);
    };
  }, [certId]);

  const entry = getEntry(certId);
  return {
    indexData: entry.indexData,
    questionsByChapter: entry.questionsByChapter,
    loading: !entry.loaded && !entry.error,
    error: entry.error,
  };
}
