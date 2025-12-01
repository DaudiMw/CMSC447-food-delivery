async function get_cart() {
    return await authFetch(`/cart`);
}

async function add_to_cart(item_id, quantity) {
    const response = await authFetch(`/cart/items`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ item_id, quantity })
    });
    return response;
}

async function update_cart_item(item_id, quantity) {
    const response = await authFetch(`/cart/items/${item_id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ quantity })
    });
    return response;
}

async function remove_from_cart(item_id) {
    const response = await authFetch(`/cart/items/${item_id}`, {
        method: 'DELETE'
    });
    return response;
}

async function clear_cart() {
    const response = await authFetch(`/cart`, {
        method: 'DELETE'
    });
    return response;
}
