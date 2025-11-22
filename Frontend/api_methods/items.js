// Frontend/api_methods/items.js

async function create_item(itemData, store_id) {
    // We are assuming the endpoint will be updated to handle FormData with nested JSON
    return await authFetch(`/items/${store_id}`, {
        method: 'POST',
        body: itemData
    });
}

async function get_store_items(store_id) {
    return await authFetch(`/stores/${store_id}/items`);
}
