// Frontend/api_methods/items.js

async function create_item(itemData, store_id) {
    return await authFetch(`/items/${store_id}`, {
        method: 'POST',
        body: itemData
    });
}

async function get_store_items(store_id) {
    return await authFetch(`/stores/${store_id}/items`);
}

async function edit_item(itemData, store_id, item_id) {
    return await authFetch(`/items/${store_id}/${item_id}`, {
        method: 'PUT',
        body: itemData
    });
}

async function get_item(item_id) {
    return await authFetch(`/items/${item_id}`);
}