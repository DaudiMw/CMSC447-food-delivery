const { useQuery, useMutation, QueryClient, QueryClientProvider } = window.ReactQuery;

/**
 * 
 * @param {*} user_id 
 * @returns 
 */
async function get_user_addresses(user_id) {
    try{
        const data = await authFetch(`/users/${user_id}/addresses`, {
            method: 'GET'
        });
        return data;
    } catch(error){
        console.error('Error fetching addresses: ', error);
    }
}


/**
 * 
 * @param {*} user_id: the id of the user to add the address to.
 * @param {*} address: the address body.
 * @returns 
 */
async function add_user_address(user_id, address) {
    try{
        const data = await authFetch(`/users/${user_id}/addresses`, {
            method: 'POST',
            body: JSON.stringify(address)
        });
        return data;

    } catch(error){
        console.error('Error creating new address: ', error);
    }
}

/**
 * 
 * @param {*} user_id: the id of the user to add the address to.
 * @param {*} address_id: the address id.
 * @returns 
 */
async function delete_user_address(user_id, address_id) {
    try{
        const data = await authFetch(`/users/${user_id}/addresses/${address_id}`, {
            method: 'DELETE'
        });
        return data;
    } catch(error){
        console.error('Error deleting address: ', error);
    }
}

/**
 * 
 * @param {*} userId 
 * @param {*} payment 
 * @returns 
 */
async function add_user_payment(user_id, payment){ 
    try {
        const data = await authFetch(`/users/${user_id}/payments`, {
            method: 'POST',
            body: JSON.stringify({user_id, payment})
        })
        return data;
    } catch (error) {
        console.error('Error adding payment details: ', error)
    }
}

/**
 * 
 * @param {*} userId 
 * @returns 
 */
async function get_cart(user_id){
    try {
        const data = await authFetch(`/${user_id}/dasher_application`, {
            method: 'GET'
        })
        return data;
    } catch (error) {
        console.error('Error getting cart information: ', error)
    }
}


// async function add_user_order()

/**
 * 
 * @param {*} user_id 
 * @param {*} content 
 * @returns 
 */
async function apply_to_dasher(user_id, content) {
    try {
        const data = await authFetch(`/users/${user_id}/dasher_application`, {
            method: 'POST',
            body: JSON.stringify({user_id, content})
        })
        return data;
    } catch (error) {
        console.error('Error applying to dasher: ', error)
    }
}

/**
 * 
 * @param {*} user_id 
 * @returns 
 */
async function get_payment_methods(user_id){
    try{
        const data = await authFetch(`/users/${user_id}/payment_methods`, {
            method: 'GET'
        });

        return data;
    } catch(error){
        console.error('Error fetching payment methods: ', error);
    }
}

/**
 * Function to delete a users payment information
 * @param {'*'} user_id 
 * @param {*} payment_method_id 
 * @returns 
 */
async function delete_payment_method(user_id, payment_method_id) {
    try {
        const data = await authfetch(`/users/${user_id}/payment_methods/${payment_method_id}`, {
            method:'DELETE'
        });
        return data;
    } catch (error){
        console.error('Error deleting payment information: ', error);
    }
}

/**
 * Function to get a users' settings
 * @param {*} user_id 
 * @returns 
 */
async function get_user_settings(user_id){
    try {
        const data = await authfetch(`/users/${user_id}/settings`);
        return data;
    } catch (error){
        console.error('Error fetching setting information: ', error);
    }
}


