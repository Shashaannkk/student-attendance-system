// Centralized configuration
// This allows switching between localhost and production backend easily

const getApiUrl = () => {
    // Check if a custom API URL is set
    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL;
    }

    // Use Render Backend for Production (GitHub Pages)
    if (import.meta.env.PROD) {
        return "https://student-attendance-system-u2k7.onrender.com";
    }

    // Default to localhost for local development
    return "http://127.0.0.1:8000";
};

export const API_URL = getApiUrl();
