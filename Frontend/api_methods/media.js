
/**
 * Upload media file to the server
 * @param {File} file - The file object to upload
 * @returns {Promise<Object>} Response with media_id
 */
async function upload_media(file){
    try {
        // Create FormData - DON'T use JSON.stringify for files!
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await authFetch(`/media`, {
            method: 'POST',
            body: formData  // Send FormData, not JSON
        });

        return response;
    } catch (error){
        console.error(error);
        throw error; // Re-throw so caller knows it failed
    }
}

/**
 * 
 * @param {*} content 
 * @returns 
 */
async function get_media(media_id){
    try {
        const content = await authFetch(`/media/${media_id}`);
        return content
    } catch (error){
        console.error('Error fetching media: ', error);
    }
}