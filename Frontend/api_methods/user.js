const { useQuery, useMutation, QueryClient, QueryClientProvider } = window.ReactQuery;

/**
 * 
 * @param {*} userId 
 * @returns 
 */
async function get_user_address(userId) {
    try {
        const addresses = await fetch(`http://localhost:8000/users/${userId}/addresses`)
        return addresses.json()
    } catch (error) {
        console.log(error)
    }
}


/**
 * 
 * @param {*} userId: the id of the user to add the address to.
 * @param {*} address: the address body.
 * @returns 
 */
async function add_user_address(userId, address) {
    try {
        const response = await fetch(`http://localhost:8000/users/${userId}/addresses`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(address)
        })
        return response.json()
    } catch (error) {
        console.log(error)
    }
}

/**
 * 
 * @param {*} userId 
 * @returns 
 */
async function get_user_payments(userId) {
    try{
        const payments = await fetch(`http://localhost:8000/users/${userId}/payments`)
        return payments.json()
    } catch (error) {
        console.log(error)
    }
}

/**
 * 
 * @param {*} userId 
 * @param {*} payment 
 * @returns 
 */
async function add_user_payment(userId, payment){ 
    try {
        const response = await fetch(`http://localhost:8000/users/${userId}/payments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payment)
        })
        return response.json()
    } catch (error) {
        console.log(error)  
    }
}

/**
 * 
 * @param {*} userId 
 * @returns 
 */
async function get_cart(userId){
    try {
        const cart = await fetch(`http://localhost:8000/users/${userId}/cart`)
        return cart.json()
    } catch (error) {
        console.log(error)
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
        const response = await fetch(`http://localhost:8000/${user_id}/dasher_application`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ user_id, content })
        })
        return response.json()
    } catch (error) {
        console.log(error)
    }
}


