import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';

import { LanguageSwitcher } from '@/components/language-switcher';
import { LOCALE_STORAGE_KEY } from '@/i18n/locale-storage';
import { useLocaleStore } from '@/store/use-locale-store';

describe('LanguageSwitcher', () => {
  beforeEach(() => {
    window.localStorage.removeItem(LOCALE_STORAGE_KEY);
    useLocaleStore.setState({ locale: 'en', hasHydrated: true });
  });

  it('renders English and Korean options', () => {
    render(<LanguageSwitcher variant="full" />);

    expect(screen.getByRole('radio', { name: 'English' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('radio', { name: '한국어' })).toHaveAttribute('aria-checked', 'false');
  });

  it('switches locale when Korean is selected', async () => {
    const user = userEvent.setup();
    render(<LanguageSwitcher variant="full" />);

    await user.click(screen.getByRole('radio', { name: '한국어' }));

    expect(useLocaleStore.getState().locale).toBe('ko');
    expect(screen.getByRole('radio', { name: '한국어' })).toHaveAttribute('aria-checked', 'true');
  });

  it('shows compact short labels', () => {
    render(<LanguageSwitcher variant="compact" />);

    expect(screen.getByRole('radio', { name: 'English' })).toHaveTextContent('EN');
    expect(screen.getByRole('radio', { name: '한국어' })).toHaveTextContent('한');
  });
});
