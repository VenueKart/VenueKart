// Utility function to scroll to top when navigating to new pages
export const scrollToTop = () => {
  // Use requestAnimationFrame to ensure the scroll happens after React Router navigation
  requestAnimationFrame(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
};

// Enhanced navigation function that handles both routing and scroll
export const navigateToPage = (path) => {
  window.location.href = path;
  // Scroll to top after a brief delay to ensure navigation completes
  setTimeout(() => {
    scrollToTop();
  }, 100);
};
