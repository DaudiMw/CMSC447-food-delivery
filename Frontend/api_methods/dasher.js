
/**
 * Function to return the dashers picked up orders.
 * @param {*} dasher_id 
 * @returns 
 */
async function get_picked_orders(dasher_id){
    return await authFetch(`/pickups/${dasher_id}`);
}


async function change_order_status(pickup_id, order_id, status){
    return await authFetch(`/pickups/${pickup_id}/${order_id}/status`,{
        method: POST,
        body: JSON.stringify(status)
    })
}


async function get_pending_orders(){
    return await authFetch(`/pickups/pending`);
}