const { useState, useEffect } = React;
const { useForm } = ReactHookForm;
const { useParams, useHistory } = ReactRouterDOM;


function ItemForm({ store_id, item: existingItem }) {
    const defaultValues = {
        name: existingItem?.name || '',
        description: existingItem?.description || '',
        price: existingItem?.price || '',
        item_type: existingItem?.item_type || 'entree',
        nutrition_info: {
            serving_size: existingItem?.item_info?.serving_size || '',
            calories: existingItem?.item_info?.calories || '',
            total_fat: existingItem?.item_info?.total_fat || '',
            cholesterol: existingItem?.item_info?.cholesterol || '',
            sodium: existingItem?.item_info?.sodium || '',
            carbs: existingItem?.item_info?.carbs || '',
            dietary_fiber: existingItem?.item_info?.dietary_fiber || '',
            total_sugars: existingItem?.item_info?.total_sugars || '',
            added_sugars: existingItem?.item_info?.added_sugars || '',
            protein: existingItem?.item_info?.protein || '',
            ingredients: existingItem?.item_info?.ingredients || '',
        }
    };

    const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({ defaultValues });
    const history = useHistory();

    const [picturePreview, setPicturePreview] = useState(existingItem?.picture_id ? `http://localhost:8000/media/${existingItem.picture_id}` : null);
    const [serverError, setServerError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    const showNutritionalInfo = watch('showNutritionalInfo', existingItem?.item_info);
    const pictureFile = watch('picture');

    useEffect(() => {
        if (pictureFile && pictureFile[0]) {
            const newPreview = URL.createObjectURL(pictureFile[0]);
            setPicturePreview(newPreview);
            return () => URL.revokeObjectURL(newPreview);
        }
    }, [pictureFile]);

    const onSubmit = async (data) => {
        setServerError(null);
        setSuccessMessage(null);
        try {
            const formData = new FormData();
            const itemData = {
                name: data.name,
                description: data.description,
                price: parseFloat(data.price),
                item_type: data.item_type,
            };

            if (showNutritionalInfo) {
                itemData.nutrition_info = {
                    serving_size: data.nutrition_info.serving_size,
                    calories: parseFloat(data.nutrition_info.calories) || null,
                    total_fat: parseFloat(data.nutrition_info.total_fat) || null,
                    cholesterol: parseFloat(data.nutrition_info.cholesterol) || null,
                    sodium: parseFloat(data.nutrition_info.sodium) || null,
                    carbs: data.nutrition_info.carbs,
                    dietary_fiber: data.nutrition_info.dietary_fiber,
                    total_sugars: parseFloat(data.nutrition_info.total_sugars) || null,
                    added_sugars: data.nutrition_info.added_sugars,
                    protein: parseFloat(data.nutrition_info.protein) || null,
                    ingredients: data.nutrition_info.ingredients,
                };
            }

            formData.append('item', JSON.stringify(itemData));

            if (data.picture && data.picture[0]) {
                formData.append('picture', data.picture[0]);
            }

            if (existingItem) {
            console.log('Updating item...');
            await edit_item(formData, store_id, existingItem.id);
            console.log('Item updated successfully');
            window.location.hash = `#/store/${store_id}`;  // Navigate immediately
        } else {
            console.log('Creating item...');
            await create_item(formData, store_id);
            console.log('Item created successfully');
            window.location.hash = `#/store/${store_id}`;  // Navigate immediately
        }

        } catch (error) {
            console.error('Failed to save item', error);
            console.error('Error details:', error.response);
            const errorMessage = error?.response?.data?.detail || error.message || 'An unexpected error occurred.';
            setServerError(errorMessage);
        }
    };
        
    return (
        <div className="flex min-h-screen flex-col items-center justify-center pt-24 px-4 md:px-10 bg-gray-50">
            <Toast
                message={successMessage}
                type="success"
                show={!!successMessage}
                onClose={() => setSuccessMessage(null)}
            />
            <Toast
                message={serverError}
                type="danger"
                show={!!serverError}
                onClose={() => setServerError(null)}
            />
            <div className="w-full max-w-2xl p-8 space-y-6 bg-white rounded-lg shadow-md">
                <h1 className="text-3xl font-bold text-center text-gray-800">{existingItem ? 'Edit Item' : 'Create a New Item'}</h1>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Item Name *</label>
                        <input type="text" id="name" {...register('name', { required: 'Item name is required' })}
                               className={`w-full px-4 py-2 mt-2 border-2 rounded-lg focus:ring-2 focus:ring-[#fdb515] focus:border-[#fdb515] ${errors.name ? 'border-red-500' : 'border-gray-300'}`} />
                        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea id="description" {...register('description')}
                                  className="w-full px-4 py-2 mt-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fdb515] focus:border-[#fdb515]"></textarea>
                    </div>
                    <div>
                        <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price *</label>
                        <input type="number" id="price" {...register('price', { required: 'Price is required', min: { value: 0, message: 'Price must be positive' } })} step="0.01"
                               className={`w-full px-4 py-2 mt-2 border-2 rounded-lg focus:ring-2 focus:ring-[#fdb515] focus:border-[#fdb515] ${errors.price ? 'border-red-500' : 'border-gray-300'}`} />
                        {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>}
                    </div>
                    <div>
                        <label htmlFor="itemType" className="block text-sm font-medium text-gray-700">Item Type *</label>
                        <select id="itemType" {...register('item_type', { required: 'Item type is required' })}
                                className={`w-full px-4 py-2 mt-2 border-2 rounded-lg focus:ring-2 focus:ring-[#fdb515] focus:border-[#fdb515] ${errors.item_type ? 'border-red-500' : 'border-gray-300'}`}>
                            <option value="entree">Entree</option>
                            <option value="side">Side</option>
                            <option value="drink">Drink</option>
                            <option value="dessert">Dessert</option>
                            <option value="other">Other</option>
                        </select>
                        {errors.item_type && <p className="text-red-500 text-sm mt-1">{errors.item_type.message}</p>}
                    </div>
                    
                    <div>
                        <label htmlFor="pictureUpload" className="block text-sm font-medium text-gray-700">Upload Picture</label>
                        <input type="file" id="pictureUpload" accept="image/*" {...register('picture')}
                               className="w-full px-4 py-2 mt-2 border-2 border-gray-300 rounded-lg"/>
                        {picturePreview && (
                            <div className="mt-4">
                                <p className="text-sm font-medium mb-2">{watch('picture')?.[0] ? "New Preview:" : "Current Picture:"}</p>
                                <img src={picturePreview} alt="Item preview" className="w-32 h-32 object-cover rounded-lg border"/>
                            </div>
                        )}
                    </div>

                    <div className="form-check">
                        <input type="checkbox" className="form-check-input" id="showNutritionalInfo" {...register('showNutritionalInfo')} />
                        <label className="form-check-label" htmlFor="showNutritionalInfo">Add/Edit Nutritional Information</label>
                    </div>

                    {showNutritionalInfo && (
                        <fieldset className="border p-4 rounded-lg">
                            <legend className="text-lg font-medium text-gray-800">Nutritional Information</legend>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="servingSize" className="block text-sm font-medium text-gray-700">Serving Size</label>
                                    <input type="text" id="servingSize" {...register('nutrition_info.serving_size')}
                                           className="w-full px-4 py-2 mt-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fdb515] focus:border-[#fdb515]" />
                                </div>
                                <div>
                                    <label htmlFor="calories" className="block text-sm font-medium text-gray-700">Calories</label>
                                    <input type="number" id="calories" {...register('nutrition_info.calories')} min="0"
                                           className="w-full px-4 py-2 mt-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fdb515] focus:border-[#fdb515]" />
                                </div>
                                <div>
                                    <label htmlFor="totalFat" className="block text-sm font-medium text-gray-700">Total Fat (g)</label>
                                    <input type="number" id="totalFat" {...register('nutrition_info.total_fat')} min="0"
                                           className="w-full px-4 py-2 mt-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fdb515] focus:border-[#fdb515]" />
                                </div>
                                <div>
                                    <label htmlFor="cholesterol" className="block text-sm font-medium text-gray-700">Cholesterol (mg)</label>
                                    <input type="number" id="cholesterol" {...register('nutrition_info.cholesterol')}
                                           className="w-full px-4 py-2 mt-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fdb515] focus:border-[#fdb515]" />
                                </div>
                                <div>
                                    <label htmlFor="sodium" className="block text-sm font-medium text-gray-700">Sodium (mg)</label>
                                    <input type="number" id="sodium" {...register('nutrition_info.sodium')} min="0"
                                           className="w-full px-4 py-2 mt-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fdb515] focus:border-[#fdb515]" />
                                </div>
                                <div>
                                    <label htmlFor="carbs" className="block text-sm font-medium text-gray-700">Total Carbs (g)</label>
                                    <input type="text" id="carbs" {...register('nutrition_info.carbs')}
                                           className="w-full px-4 py-2 mt-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fdb515] focus:border-[#fdb515]" />
                                </div>
                                <div>
                                    <label htmlFor="dietaryFiber" className="block text-sm font-medium text-gray-700">Dietary Fiber (g)</label>
                                    <input type="text" id="dietaryFiber" {...register('nutrition_info.dietary_fiber')}
                                           className="w-full px-4 py-2 mt-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fdb515] focus:border-[#fdb515]" />
                                </div>
                                <div>
                                    <label htmlFor="totalSugars" className="block text-sm font-medium text-gray-700">Total Sugars (g)</label>
                                    <input type="number" id="totalSugars" {...register('nutrition_info.total_sugars')} min="0"
                                           className="w-full px-4 py-2 mt-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fdb515] focus:border-[#fdb515]" />
                                </div>
                                <div>
                                    <label htmlFor="addedSugars" className="block text-sm font-medium text-gray-700">Added Sugars (g)</label>
                                    <input type="text" id="addedSugars" {...register('nutrition_info.added_sugars')}
                                           className="w-full px-4 py-2 mt-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fdb515] focus:border-[#fdb515]" />
                                </div>
                                <div>
                                    <label htmlFor="protein" className="block text-sm font-medium text-gray-700">Protein (g)</label>
                                    <input type="number" id="protein" {...register('nutrition_info.protein')} min="0"
                                           className="w-full px-4 py-2 mt-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fdb515] focus:border-[#fdb515]" />
                                </div>
                                <div className="md:col-span-2">
                                    <label htmlFor="ingredients" className="block text-sm font-medium text-gray-700">Ingredients</label>
                                    <textarea id="ingredients" {...register('nutrition_info.ingredients')}
                                              className="w-full px-4 py-2 mt-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fdb515] focus:border-[#fdb515]"></textarea>
                                </div>
                            </div>
                        </fieldset>
                    )}

                    <button type="submit"
                            disabled={isSubmitting}
                            className="btn btn-action w-full">
                        {isSubmitting ? 'Saving...' : 'Save Item'}
                    </button>
                </form>
            </div>
        </div>
    );
}

function AddItemPage() {
    const { store_id } = useParams();
    return <ItemForm store_id={store_id} />;
}

function EditItemPage() {
    const { store_id, item_id } = useParams();
    const { data: item, isLoading, error } = useQuery(['item', item_id], () => get_item(item_id));

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error loading item: {error.message}</div>;

    return <ItemForm store_id={store_id} item={item} />;
}