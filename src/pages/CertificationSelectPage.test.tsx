import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithUser } from '../test/renderWithUser';
import { CertificationSelectPage } from './CertificationSelectPage';
import { CERTIFICATIONS } from '../certifications/registry';

const RESUME = /Exam in progress — resume/;

function card(title: string) {
  return screen.getByRole('button', { name: new RegExp(title.replace(/[()]/g, '\\$&')) });
}

describe('CertificationSelectPage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders the heading and one card per registry entry', () => {
    renderWithUser(<CertificationSelectPage onSelect={vi.fn()} />);
    expect(screen.getByRole('heading', { level: 1, name: 'Choose a certification' })).toBeInTheDocument();
    expect(screen.getAllByRole('button')).toHaveLength(CERTIFICATIONS.length);
    for (const cert of CERTIFICATIONS) {
      expect(card(cert.title)).toBeInTheDocument();
    }
  });

  it('shows the Work in progress badge only on wip cards', () => {
    renderWithUser(<CertificationSelectPage onSelect={vi.fn()} />);
    for (const cert of CERTIFICATIONS) {
      const el = card(cert.title);
      if (cert.status === 'wip') expect(el).toHaveTextContent('Work in progress');
      else expect(el).not.toHaveTextContent('Work in progress');
    }
  });

  it.each(CERTIFICATIONS.map(c => [c.id, c.title] as const))(
    'clicking the %s card calls onSelect with its id',
    async (id, title) => {
      const onSelect = vi.fn();
      const { user } = renderWithUser(<CertificationSelectPage onSelect={onSelect} />);
      await user.click(card(title));
      expect(onSelect).toHaveBeenCalledWith(id);
    }
  );

  it('shows no resume badge without a saved exam', () => {
    renderWithUser(<CertificationSelectPage onSelect={vi.fn()} />);
    expect(screen.queryByText(RESUME)).not.toBeInTheDocument();
  });

  it('shows the resume badge on the TAE card when tae_in_progress is set', () => {
    localStorage.setItem('tae_in_progress', JSON.stringify({
      mode: 'full', questionIds: ['q1'], answers: [], flagged: [], remainingSeconds: 100, startedAt: '2024-01-01T00:00:00.000Z',
    }));
    renderWithUser(<CertificationSelectPage onSelect={vi.fn()} />);
    expect(screen.getAllByText(RESUME)).toHaveLength(1);
    expect(card('ISTQB CTAL-TAE Preparation')).toHaveTextContent(RESUME);
  });
});
