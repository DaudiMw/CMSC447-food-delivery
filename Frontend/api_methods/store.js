
/**
 * 
 * @param {*} store 
 */
async function create_store(storeFormData){
    try {
        const response = await authFetch('/stores',{
            method: 'POST',
            body: storeFormData
        });
        return response
    } catch (error){
        console.error(`Error creating store ${error}`);
        throw error;
    }
}

/**
 * 
 * @returns A list of all stores
 */
async function get_stores(){
    try{
        const response = await authFetch('/stores');
        return response;
    } catch (error){
        console.error('Error fetching stores ', error);
        throw error;
    }
}


/**
 * 
 * @param {*} store_id 
 * @returns 
 */
async function get_store(store_id){
    try{
        const response = await authFetch(`/stores/${store_id}/info`)
        return response;
    } catch (error){
        console.error('Error fetching store', error);
        throw error;
    }
}

/**
 * 
 * @param {*} user_id 
 * @returns 
 */
async function get_user_stores(user_id) {
    try{
        const response = await authFetch(`/stores/${user_id}`)
        return response;
    } catch (error){
        console.error('Error fetching store', error);
        throw error;
    }
}

/**
 * 
 * @param {*} store 
 * @param {*} store_id 
 */
async function edit_store(storeFormData, store_id){
    try{
        const response = await authFetch(`/stores/${store_id}`, {
            method: 'PUT',
            body: storeFormData
        });

        return response;

    } catch (error) {
        console.error(`Error editing store ${error}`)
        throw error;
    }
}

/**
 * 
 * @param {string} store_id 
 */
async function delete_store(store_id){
    try {
        const response = await authFetch(`/stores/${store_id}`, {
            method: 'DELETE'
        });
        return response;
    } catch (error) {
        console.error(`Error deleting store ${error}`);
        throw error;
    }
}


/**
 * 
 * @param {*} address 
 * @param {*} store_id 
 * @returns 
 */
async function add_store_address(address){
    try {
        const response = await authFetch(`/stores/address`, {
            method: 'POST',
            body: JSON.stringify(address)
        });

        return response;
    } catch (error) {
        console.error(`Error adding the store address: ${error}`)
        throw error;
    }
}

/**
 * 
 * @param {*} store_id 
 * @returns The stores information alongside all of its items and nutritional info.
 */
async function get_store_info_with_items(store_id){
    try{
        const response = await authFetch(`/stores/${store_id}/items-full`);
        return response;
    } catch (error){
        console.error(`Error fetching items with their info: ${error}`);
        throw error;
    }
}


/**
 * 
 * @param {*} user_id 
 * @returns 
 */
async function get_users_owned_stores(user_id){
    try{
        const response = await authFetch(`/stores/${user_id}`)
        return response;
    } catch(error){
        console.error('Error fetching the users owned stores: ', error);
        return null
    }

}
