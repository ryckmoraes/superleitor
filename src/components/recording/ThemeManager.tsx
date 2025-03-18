
import { useState, useEffect } from 'react';

const ThemeManager = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Retrieve theme from localStorage or default to false (light mode)
    const savedTheme = localStorage.getItem("dark-mode");
    return savedTheme === "true";
  });

  // Handle dark mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("dark-mode", isDarkMode.toString());
  }, [isDarkMode]);

  // Toggle dark mode
  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  return { isDarkMode, toggleTheme };
};

export default ThemeManager;
