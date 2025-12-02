/**
 * 
 * @param {*} status 
 * @returns 
 */
async function get_pickups_by_status(status) {
    try{
        const response = await authFetch(`/orders/${status}`);
        return response;
    } catch (error){
        console.error('Error fetching pickups: ', error);
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

async function create_order_from_cart(address_id) {
    return authFetch(`/api/orders/from_cart`, {
        method: 'POST',
        body: JSON.stringify({ address_id }),
    });
}