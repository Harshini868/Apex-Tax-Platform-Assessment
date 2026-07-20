import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { AppProvider } from '../../context/AppContext';
import { AppRoutes } from '../../app/routes';

describe('NotFoundPage Component', () => {
  it('renders 404 page when hitting unknown route', () => {
    render(
      <AppProvider>
        <MemoryRouter initialEntries={['/unknown-route-path']}>
          <AppRoutes />
        </MemoryRouter>
      </AppProvider>
    );

    expect(screen.getByText('404 - Page Not Found')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /return to dashboard/i })).toBeInTheDocument();
  });
});
