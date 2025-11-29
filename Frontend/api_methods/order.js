
/**
 * 
 * @returns 
 */
async function get_pending_orders(){
    return await authFetch('/orders/pending');
}