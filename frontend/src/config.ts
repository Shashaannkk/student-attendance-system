// Centralized configuration
// This allows switching between localhost and production backend easily

export const getApiUrl = () => {
    // Check for environment variable first (Vite exposes these with VITE_ prefix)
    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL;
    }

    // Fallback to localhost for local development
    return "http://localhost:8000";
};

export const API_URL = getApiUrl();
