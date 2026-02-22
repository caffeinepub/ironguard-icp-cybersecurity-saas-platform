// This script runs before React hydration to prevent theme flicker
// It's injected into index.html as an inline script
export const themeScript = `
(function() {
  try {
    const storageKey = 'ironguard-theme';
    const theme = localStorage.getItem(storageKey);
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    
    // Apply theme immediately
    if (theme === 'dark' || (theme === 'system' && systemTheme === 'dark') || (!theme && systemTheme === 'dark')) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  } catch (e) {
    console.error('Theme initialization error:', e);
  }
})();
`;
