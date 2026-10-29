// API_URL is baked in at build time from the API_URL environment variable
// (see vite.config.js); it defaults to the local backend.
export const API_URL =
  typeof __API_URL__ !== 'undefined' ? __API_URL__ : 'http://localhost:3000/api';
