/**
 * 
 * @param {*} user_id 
 * @param {*} store_id 
 * @returns a boolean value that represents whether the user owns that store or not.
 */
async function checkStoreOwnership(user_id, store_id){
    const owned_stores = await get_users_owned_stores(user_id);
    if (owned_stores && owned_stores.includes(store_id)){
        return true;
    } else {
        return false
    }
}