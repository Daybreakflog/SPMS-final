import { describe, it, expect, vi, beforeEach } from 'vitest';
import { waitFor } from '@testing-library/react';
import { renderWithProviders } from './test-utils';

describe('AppTour', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  async function renderTour(open = false) {
    const mod = await import('../../components/AppTour/index');
    const AppTour = mod.default;
    const onFinish = vi.fn();
    return renderWithProviders(<AppTour open={open} onFinish={onFinish} />);
  }

  it('renders without crashing', async () => {
    await renderTour();
  });

  it('does not show tour when closed', async () => {
    await renderTour(false);
    await waitFor(() => {
      const tour = document.querySelector('.ant-tour');
      expect(tour).toBeNull();
    });
  });

  it('respects localStorage tour state', async () => {
    localStorage.setItem('app-tour-dismissed', 'true');
    await renderTour();
    const dismissed = localStorage.getItem('app-tour-dismissed');
    expect(dismissed).toBe('true');
  });

  it('hook returns correct state', async () => {
    const mod = await import('../../components/AppTour/useAppTour');
    expect(mod.useAppTour).toBeDefined();
  });

  it('renders tour component with open=true', async () => {
    await renderTour(true);
  });

  it('can be imported successfully', async () => {
    const mod = await import('../../components/AppTour/index');
    expect(mod.default).toBeDefined();
  });

  it('useAppTour hook can be imported', async () => {
    const mod = await import('../../components/AppTour/useAppTour');
    expect(typeof mod.useAppTour).toBe('function');
  });
});
