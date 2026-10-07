// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { existsSync } from 'fs';
import { join } from 'path';
import { CERTIFICATIONS, getCertification } from './registry';

describe('certification registry', () => {
  it('has unique ids', () => {
    const ids = CERTIFICATIONS.map(c => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('has unique storage prefixes', () => {
    const prefixes = CERTIFICATIONS.map(c => c.storagePrefix);
    expect(new Set(prefixes).size).toBe(prefixes.length);
  });

  it('keeps the legacy "tae" prefix for istqb-tae', () => {
    expect(getCertification('istqb-tae')?.storagePrefix).toBe('tae');
  });

  it('getCertification returns the matching entry', () => {
    expect(getCertification('ccdv-f')).toBe(CERTIFICATIONS.find(c => c.id === 'ccdv-f'));
  });

  it('getCertification returns undefined for an unknown id', () => {
    expect(getCertification('nope')).toBeUndefined();
  });

  it('every available certification has public/data/<id>/index.json', () => {
    const available = CERTIFICATIONS.filter(c => c.status === 'available');
    expect(available.length).toBeGreaterThan(0);
    for (const c of available) {
      expect(existsSync(join(process.cwd(), 'public', 'data', c.id, 'index.json'))).toBe(true);
    }
  });
});
