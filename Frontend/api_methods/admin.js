/**
 *  Function to get all users data
 * @returns all users data in list format
 */
async function get_all_users() {
    try {
        const response = await authFetch(`/admin/users`);
        return response
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
        const response = await authFetch(`/admin/users/${userId}`);
        return response
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
        const response = await authFetch(`/admin/dasher-applications`);

        return response
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
        const response = await authFetch(`/admin/dasher_applications/${applicationId}/approve`, {
            method: 'POST'
        })
        return response
    } catch (error) {
        console.log(error)
    }
}

async function get_all_orders() {
    return authFetch(`/admin/orders`);
}

async function get_dasher_deliveries() {
    return authFetch(`/admin/dasher-deliveries`);
}

async function change_user_role(userId, newRole) {
    return authFetch(`/admin/users/${userId}/role`, {
        method: 'PATCH',
        body: JSON.stringify(newRole)
    });
}

async function ban_user(userId, status) {
    const endpoint = status === 'banned' ? 'ban' : 'unban';
    return authFetch(`/admin/users/${userId}/${endpoint}`, {
        method: 'PATCH'
    });
}

async function handle_dasher_application(appId, action) {
    return authFetch(`/admin/dasher-applications/${appId}/${action}`, {
        method: 'POST'
    });
}

