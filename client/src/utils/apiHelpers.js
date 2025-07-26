/**
 * A helper to safely extract data from axios responses or fetch responses.
 * Supports axios response objects and fetch responses.
 *
 * @param {Object} response - The HTTP response object.
 * @returns {Object|null} The actual data or null if invalid.
 */
export function getResponseData(response) {
  if (!response) return null;

  if (response.data !== undefined) {
    // axios response
    return response.data;
  }

  if (response.json) {
    // fetch response - must await outside this helper
    return response.json();
  }

  return null;
}

/**
 * Handle API errors uniformly.
 * Logs error and extracts message if present.
 * @param {Error|Object} error
 * @returns {string} User-friendly error message
 */
export function getApiErrorMessage(error) {
  if (!error) return "Unknown error occurred";

  if (error.response && error.response.data && error.response.data.message) {
    // axios error with message
    return error.response.data.message;
  }

  if (error.message) {
    return error.message;
  }

  return "An error occurred. Please try again.";
}

/**
 * Add an auth token to headers for API requests.
 * @param {string} token - Bearer token string
 * @returns {Object} Headers object with Authorization added
 */
export function getAuthHeaders(token) {
  return {
    Authorization: token ? `Bearer ${token}` : "",
    "Content-Type": "application/json",
  };
}
