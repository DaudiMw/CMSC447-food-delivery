/**
 * 
 * @param {*} status 
 * @returns 
 */
async function get_orders_by_status(status) {
    try{
        const response = await authFetch(`/orders/status/${status}`);
        return response;
    } catch (error){
        console.error('Error fetching orders: ', error);
        throw error;
    }
}

/**
 * 
 * @param {*} order_id
 * @returns 
 */
async function update_order_status(order, order_id) {
    try{
        const response = await authFetch(`/${order_id}/status`, {
            method: 'PATCH',
            body: JSON.stringify(order)
        });
        return response;
    } catch (error){
        console.error('Error updating order status: ', error);
        throw error;
    }
}

/**
 * 
 * @param {*} dasher_id
 * @returns 
 */
async function get_orders_by_dasher_id(dasher_id) {
    try{
        const response = await authFetch(`/orders/dashers/${dasher_id}`);
        return response;
    } catch (error){
        console.error('Error fetching orders: ', error);
        throw error;
    }
}

/**
 * 
 * @param {*} item_id 
 * @returns Success message or error
 */
async function add_item_to_cart(item_id){
    try {
        const response = await authFetch(`/users/${getUserId()}/cart`, {
            method: 'POST',
            body: item_id
        });
        return response;
    } catch (error) {
        console.error('Error adding item to cart: ', error);
        throw error;
    }
}

/**
 * 
 * @param {*} order_id
 * @returns 
 */
async function update_order(order, order_id) {
    try{
        const response = await authFetch(`/orders/${order_id}`, {
            method: 'PATCH',
            body: JSON.stringify(order)
        });
        return response;
    } catch (error){
        console.error('Error updating order: ', error);
        throw error;
    }
}


/**
 * 
 * @param {*} user_id 
 * @returns A list of items that are currently in the cart / order that has the status 'initialized'
 */
async function get_cart(user_id){
    try{
        const response = await authFetch(`/users/${user_id}/cart`);
        return response;
    } catch (error){
        console.error('Error fetching cart items: ', error);
        throw error;
    }
}

async function create_order_from_cart(order_data) {
    return authFetch(`/orders/from_cart`, {
        method: 'POST',
        body: JSON.stringify(order_data)
    });
}
