// File: app/services/api.tsx
// Functionality: modular component to provide base URL that connects to Django REST endpoints
// Author: Nguyen Le


// REST endpoint base URL
export const API_BASE_URL = 'https://cs-webapps.bu.edu/nguyenle/project/'

// error user model
export interface ApiError {
  message: string;
  status: number;
}

// handle error
export const handleApiError = (error: any): ApiError => {
  if (error.response) {
    return {
      message: error.response.data?.error || 'An error occurred',
      status: error.response.status,
    };
  }
  return {
    message: error.message || 'Network error',
    status: 0,
  };
};