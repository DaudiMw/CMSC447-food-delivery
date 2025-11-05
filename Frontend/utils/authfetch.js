async function authFethc(endpoint, options = {}){
    const defaultoptions = {
        headers: {
            'Content-Type':'application/json',
            'Authorization':`Bearer ${getAuthToken()}`,
            ...options.headers,
        },
    };

    const config = {
        ...defaultoptions,
        ...options,
        headers: {
            ...defaultoptions.headers,
            ...options.headers,
        },
    };

    const response = await fetch(`${baseUrl}${endpoint}`, config);

    if (!response.ok){
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
}