const baseUrl = 'http://localhost:8000'

async function authFetch(endpoint, options = {}) {
    const headers = {
        'Authorization': `Bearer ${getAuthToken()}`,
        ...options.headers,
    };

    // Only add Content-Type: application/json if body is NOT FormData
    if (!options.body || !(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    const config = {
        ...options,
        headers,
    };

    const response = await fetch(`${baseUrl}${endpoint}`, config);

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
}