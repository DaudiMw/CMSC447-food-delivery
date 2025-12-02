/**
 * 
 * @param {*} user_id 
 * @param {*} store_id 
 * @returns a boolean value that represents whether the user owns that store or not.
 */
async function checkStoreOwnership(user_id, store_id){
    const owned_stores = await get_users_owned_stores(user_id);
    console.log(owned_stores)
    if (owned_stores != null && owned_stores.includes(store_id)){
        return true;
    } else {
        return false
    }
}