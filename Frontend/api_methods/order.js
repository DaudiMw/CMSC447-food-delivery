async function create_order_from_cart(order_data) {
    return authFetch(`/orders/from_cart`, {
        method: 'POST',
        body: JSON.stringify(order_data)
    });
}
