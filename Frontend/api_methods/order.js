/**
 * 
 * @param {*} status 
 * @returns 
 */
async function get_pickups_by_status(status) {
    try{
        const response = await authFetch(`/orders/${status}`)
        return response;
    } catch (error){
        console.error('Error fetching pickups: ', error);
        throw error;
    }
}