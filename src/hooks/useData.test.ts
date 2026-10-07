import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useData } from './useData';
import { makeIndexData, makeChapterMeta, makeQuestion } from '../test/factories';

const index = makeIndexData({
  chapters: [makeChapterMeta({ id: 1 }), makeChapterMeta({ id: 2, title: 'Chapter 2' })],
});
const ch1 = [makeQuestion({ id: 'a1', chapter: 1 })];
const ch2 = [makeQuestion({ id: 'b1', chapter: 2 }), makeQuestion({ id: 'b2', chapter: 2 })];

function jsonResponse(body: unknown, ok = true, status = 200) {
  return { ok, status, json: () => Promise.resolve(body) } as Response;
}

function serve(certId: string, chapters: Record<number, unknown> = { 1: ch1, 2: ch2 }) {
  return (url: string) => {
    if (url === `/data/${certId}/index.json`) return Promise.resolve(jsonResponse(index));
    const m = url.match(new RegExp(`^/data/${certId}/chapter-(\\d+)\\.json$`));
    if (m && chapters[Number(m[1])]) return Promise.resolve(jsonResponse(chapters[Number(m[1])]));
    return Promise.resolve(jsonResponse(null, false, 404));
  };
}

// The cache is module-level and not exported, so every test uses a distinct certId.
describe('useData', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('requests the per-cert index and chapter URLs and returns the data', async () => {
    fetchMock.mockImplementation(serve('cert-a'));
    const { result } = renderHook(() => useData('cert-a'));
    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));

    const urls = fetchMock.mock.calls.map(c => c[0]);
    expect(urls).toEqual(expect.arrayContaining([
      '/data/cert-a/index.json', '/data/cert-a/chapter-1.json', '/data/cert-a/chapter-2.json',
    ]));
    expect(urls).toHaveLength(3);
    expect(result.current.error).toBeNull();
    expect(result.current.indexData).toEqual(index);
    expect(result.current.questionsByChapter.get(1)).toEqual(ch1);
    expect(result.current.questionsByChapter.get(2)).toEqual(ch2);
  });

  it('does not refetch on a second mount of the same cert', async () => {
    fetchMock.mockImplementation(serve('cert-b'));
    const first = renderHook(() => useData('cert-b'));
    await waitFor(() => expect(first.result.current.loading).toBe(false));
    const calls = fetchMock.mock.calls.length;

    const second = renderHook(() => useData('cert-b'));
    expect(second.result.current.loading).toBe(false);
    expect(second.result.current.indexData).toEqual(index);
    expect(fetchMock.mock.calls.length).toBe(calls);
  });

  it('fetches and caches different certs separately', async () => {
    const serveC1 = serve('cert-c1');
    const serveC2 = serve('cert-c2', { 1: [], 2: ch1 });
    fetchMock.mockImplementation((url: string) =>
      url.includes('cert-c1') ? serveC1(url) : serveC2(url));
    const c1 = renderHook(() => useData('cert-c1'));
    const c2 = renderHook(() => useData('cert-c2'));
    await waitFor(() => {
      expect(c1.result.current.loading).toBe(false);
      expect(c2.result.current.loading).toBe(false);
    });
    expect(fetchMock.mock.calls.filter(c => String(c[0]).includes('cert-c1'))).toHaveLength(3);
    expect(fetchMock.mock.calls.filter(c => String(c[0]).includes('cert-c2'))).toHaveLength(3);
    expect(c1.result.current.questionsByChapter.get(2)).toEqual(ch2);
    expect(c2.result.current.questionsByChapter.get(2)).toEqual(ch1);

    const calls = fetchMock.mock.calls.length;
    renderHook(() => useData('cert-c1'));
    renderHook(() => useData('cert-c2'));
    expect(fetchMock.mock.calls.length).toBe(calls);
  });

  it('surfaces an error containing the URL and status on a non-ok response', async () => {
    fetchMock.mockImplementation(() => Promise.resolve(jsonResponse(null, false, 404)));
    const { result } = renderHook(() => useData('cert-missing'));
    await waitFor(() => expect(result.current.error).not.toBeNull());
    expect(result.current.error).toContain('/data/cert-missing/index.json');
    expect(result.current.error).toContain('404');
    expect(result.current.loading).toBe(false);
    expect(result.current.indexData).toBeNull();
  });

  it('surfaces an error when a chapter file is missing', async () => {
    fetchMock.mockImplementation(serve('cert-d', { 1: ch1 }));
    const { result } = renderHook(() => useData('cert-d'));
    await waitFor(() => expect(result.current.error).not.toBeNull());
    expect(result.current.error).toContain('/data/cert-d/chapter-2.json');
    expect(result.current.loading).toBe(false);
  });
});
