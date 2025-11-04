/**
 *  Function to get all users data
 * @returns all users data in list format
 */
async function get_all_users() {
    try {
        const response = await fetch(`http://localhost:8000/admin/users`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            }
        })
        return response.json()
    } catch (error) {
        console.log(error)
    }
}

/**
 * Function to get user by id
 * @param {*} userId 
 * @returns 
 */
async function get_user_by_id(userId) {
    try {
        const response = await fetch(`http://localhost:8000/admin/users/${userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            }
        })
        return response.json()
    } catch (error) {
        console.log(error)
    }
}



/**
 * 
 * @returns json response of all dasher applications.
 */
async function get_dasher_applications() {
    try {
        const response = await fetch(`http://localhost:8000/admin/dasher-applications`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            }
        })

        return response.json()
    } catch (error) {
        console.log(error)
    }
}


/**
 *  Function to approve dasher application
 * @param {'*'} applicationId 
 * @returns 
 */
async function approve_dasher_application(applicationId) {
    try {
        const response = await fetch(`http://localhost:8000/admin/dasher_applications/${applicationId}/approve`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            }
        })
        return response.json()
    } catch (error) {
        console.log(error)
    }
}

