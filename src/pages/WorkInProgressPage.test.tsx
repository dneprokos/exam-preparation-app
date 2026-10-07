import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithUser } from '../test/renderWithUser';
import { WorkInProgressPage } from './WorkInProgressPage';
import { getCertification } from '../certifications/registry';

const cert = getCertification('istqb-genai')!;

describe('WorkInProgressPage', () => {
  it('shows the certification title and the work in progress message', () => {
    renderWithUser(<WorkInProgressPage cert={cert} onBack={vi.fn()} />);
    expect(screen.getByRole('heading', { level: 1, name: cert.title })).toBeInTheDocument();
    expect(screen.getByText('Work in progress')).toBeInTheDocument();
  });

  it('back button calls onBack', async () => {
    const onBack = vi.fn();
    const { user } = renderWithUser(<WorkInProgressPage cert={cert} onBack={onBack} />);
    await user.click(screen.getByRole('button', { name: 'Back to all certifications' }));
    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
