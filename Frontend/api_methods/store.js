
/**
 * 
 * @param {*} store 
 */
async function create_store(store){
    try {
        const response = await authFetch('/stores',{
            method: 'POST',
            body: JSON.stringify(store)
        });
        return response
    } catch (error){
        console.error(`Error creating store ${error}`);
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
    }
}

/**
 * 
 * @param {*} store 
 * @param {*} store_id 
 */
async function edit_store(store, store_id){
    try{
        const response = await authFetch(`/stores/${store_id}`, {
            method: 'PUT',
            body: JSON.stringify(store)
        });

        return response;

    } catch (error) {
        console.error(`Error editing store ${error}`)
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
    }
}
