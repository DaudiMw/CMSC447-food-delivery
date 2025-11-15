# API Fetch Wrapper Guide

Native fetch requires repeating the same configuration for every API call:

```javascript
const response = await fetch(`http://localhost:8000/${userId}/payment_methods`, {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
    }
});
if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
const data = await response.json();
```

We repeat: base URL, headers, error checking, and JSON parsing everywhere.

## The authFetch Wrapper

```javascript
// utils/authFetch.js
async function authFetch(endpoint, options = {}) {
    const config = {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAuthToken()}`,
            ...options.headers,
        },
    };

    const response = await fetch(`http://localhost:8000${endpoint}`, config);
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
}

export default authFetch;
```

**What it does:**
- Adds base URL automatically
- Includes auth token and Content-Type header
- Handles error checking
- Parses JSON response

## Usage Examples

```javascript
import authFetch from './utils/authFetch';

// GET request
const data = await authFetch(`/${userId}/payment_methods`, { method: 'GET' });

// POST request
const newPayment = await authFetch(`/${userId}/payment_methods`, {
    method: 'POST',
    body: JSON.stringify({ type: 'credit_card', number: '1234' })
});

// PUT request
const updated = await authFetch(`/${userId}/profile`, {
    method: 'PUT',
    body: JSON.stringify({ name: 'John' })
});

// DELETE request
await authFetch(`/${userId}/payment_methods/${methodId}`, { method: 'DELETE' });

// Override headers if needed
const data = await authFetch(`/${userId}/avatar`, {
    method: 'POST',
    headers: { 'Content-Type': 'multipart/form-data' },
    body: formData
});
```
