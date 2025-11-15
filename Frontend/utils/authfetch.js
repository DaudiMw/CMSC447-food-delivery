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
        const error = new Error(`HTTP error! status: ${response.status}`);
        try {
            error.response = {
                data: await response.json()
            };
        } catch (e) {
            // Ignore if response is not JSON
        }
        throw error;
    }
    return response.json();
}