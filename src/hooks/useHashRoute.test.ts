import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useHashRoute } from './useHashRoute';

describe('useHashRoute', () => {
  beforeEach(() => {
    window.location.hash = '';
  });

  it('returns null certId for an empty hash', () => {
    const { result } = renderHook(() => useHashRoute());
    expect(result.current.certId).toBeNull();
  });

  it.each(['#', '#/'])('returns null certId for hash %s', hash => {
    window.location.hash = hash;
    const { result } = renderHook(() => useHashRoute());
    expect(result.current.certId).toBeNull();
  });

  it('reads an initial #/<id>', () => {
    window.location.hash = '#/istqb-tae';
    const { result } = renderHook(() => useHashRoute());
    expect(result.current.certId).toBe('istqb-tae');
  });

  it('navigate(id) updates the hash and certId', async () => {
    const { result } = renderHook(() => useHashRoute());
    act(() => result.current.navigate('ccdv-f'));
    expect(window.location.hash).toBe('#/ccdv-f');
    await waitFor(() => expect(result.current.certId).toBe('ccdv-f'));
  });

  it('navigate(null) resets the hash and certId', async () => {
    window.location.hash = '#/istqb-tae';
    const { result } = renderHook(() => useHashRoute());
    act(() => result.current.navigate(null));
    expect(window.location.hash).toBe('#/');
    await waitFor(() => expect(result.current.certId).toBeNull());
  });

  it('reacts to an external hash change', async () => {
    const { result } = renderHook(() => useHashRoute());
    act(() => {
      window.location.hash = '#/istqb-genai';
    });
    await waitFor(() => expect(result.current.certId).toBe('istqb-genai'));
  });

  it('removes its hashchange listener on unmount', () => {
    const add = vi.spyOn(window, 'addEventListener');
    const remove = vi.spyOn(window, 'removeEventListener');
    const { unmount } = renderHook(() => useHashRoute());
    const added = add.mock.calls.find(c => c[0] === 'hashchange');
    expect(added).toBeDefined();
    unmount();
    expect(remove).toHaveBeenCalledWith('hashchange', added![1]);
    add.mockRestore();
    remove.mockRestore();
  });
});
