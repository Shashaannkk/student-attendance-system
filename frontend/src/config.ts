// Centralized configuration
// This allows switching between localhost and production backend easily

export const getApiUrl = () => {
    // Check for environment variable first (Vite exposes these with VITE_ prefix)
    let apiUrl = import.meta.env.VITE_API_URL;

    if (!apiUrl) {
        // Fallback to localhost for local development
        apiUrl = "http://localhost:8000";
    }

    // Remove trailing slash to prevent double slashes in URLs
    return apiUrl.replace(/\/+$/, '');
};

export const API_URL = getApiUrl();
