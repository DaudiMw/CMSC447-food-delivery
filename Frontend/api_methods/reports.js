/**
 * 
 * @param {*} store_id
 * @returns 
 */
async function get_reports_by_store_id(store_id) {
    try{
        const response = await authFetch(`/reports/stores/${store_id}`);
        return response;
    } catch (error){
        console.error('Error fetching reports: ', error);
        throw error;
    }
}

/**
 * 
 * @param {*} user_id
 * @returns 
 */
async function get_reports_by_user_id(user_id) {
    try{
        const response = await authFetch(`/reports/users/${user_id}`);
        return response;
    } catch (error){
        console.error('Error fetching reports: ', error);
        throw error;
    }
}

/**
 * 
 * @param {*} reply
 * @returns 
 */
async function update_report(replyData, report_id) {
    try{
        const response = await authFetch(`/reports/${report_id}`, {
            method: 'PATCH',
            body: JSON.stringify(replyData)
        });
        return response;
    } catch (error){
        console.error('Error updating report: ', error);
        throw error;
    }
}

/**
 * 
 * @param {*} reportData
 * @returns 
 */
async function create_report(reportData) {
    try{
        const response = await authFetch(`/reports`, {
            method: 'POST',
            body: JSON.stringify(reportData)
        });
        return response;
    } catch (error){
        console.error('Error creating report: ', error);
        throw error;
    }
}