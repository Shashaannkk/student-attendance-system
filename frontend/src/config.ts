// Centralized configuration
// This allows switching between localhost and production backend easily

const getApiUrl = () => {
    // Check if a custom API URL is set in environment variables (e.g., during build)
    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL;
    }
    // Default to localhost for development
    return "http://127.0.0.1:8000";
};

export const API_URL = getApiUrl();
