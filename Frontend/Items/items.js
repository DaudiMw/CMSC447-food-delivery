const { useState, useEffect } = React;

function ItemForm({ store_id }) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [itemType, setItemType] = useState('entree');
    const [picture, setPicture] = useState(null);
    const [picturePreview, setPicturePreview] = useState(null);

    const [showNutritionalInfo, setShowNutritionalInfo] = useState(false);

    const [servingSize, setServingSize] = useState('');
    const [calories, setCalories] = useState('');
    const [totalFat, setTotalFat] = useState('');
    const [cholesterol, setCholesterol] = useState('');
    const [sodium, setSodium] = useState('');
    const [carbs, setCarbs] = useState('');
    const [dietaryFiber, setDietaryFiber] = useState('');
    const [totalSugars, setTotalSugars] = useState('');
    const [addedSugars, setAddedSugars] = useState('');
    const [protein, setProtein] = useState('');
    const [ingredients, setIngredients] = useState('');

    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        return () => {
            if (picturePreview) URL.revokeObjectURL(picturePreview);
        };
    }, [picturePreview]);

    const handlePictureChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (picturePreview) {
                URL.revokeObjectURL(picturePreview);
            }
            const previewURL = URL.createObjectURL(file);
            setPicturePreview(previewURL);
            setPicture(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const formData = new FormData();
            
            const itemData = {
                name,
                description,
                price: parseFloat(price),
                item_type: itemType,
            };

            if (showNutritionalInfo) {
                itemData.nutrition_info = {
                    serving_size: servingSize,
                    calories: parseFloat(calories) || null,
                    total_fat: parseFloat(totalFat) || null,
                    cholesterol: parseFloat(cholesterol) || null,
                    sodium: parseFloat(sodium) || null,
                    carbs,
                    dietary_fiber: dietaryFiber,
                    total_sugars: parseFloat(totalSugars) || null,
                    added_sugars: addedSugars,
                    protein: parseFloat(protein) || null,
                    ingredients,
                };
            }
            
            formData.append('item', JSON.stringify(itemData));
            
            if (picture) {
                formData.append('picture', picture);
            }
            
            await create_item(formData, store_id);
            
            alert('Item created successfully!');
            // Reset form fields
            setName('');
            setDescription('');
            setPrice('');
            setItemType('entree');
            setPicture(null);
            setPicturePreview(null);
            setShowNutritionalInfo(false);
            setServingSize('');
            setCalories('');
            setTotalFat('');
            setCholesterol('');
            setSodium('');
            setCarbs('');
            setDietaryFiber('');
            setTotalSugars('');
            setAddedSugars('');
            setProtein('');
            setIngredients('');

        } catch (error) {
            console.error('Failed to create item', error);
            if (error.response && error.response.data && error.response.data.detail) {
                setError(error.response.data.detail);
            } else {
                setError(error.message || 'An unexpected error occurred.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center pt-24 px-4 md:px-10 bg-gray-50">
            <div className="w-full max-w-2xl p-8 space-y-6 bg-white rounded-lg shadow-md">
                <h1 className="text-3xl font-bold text-center text-gray-800">Create a New Item</h1>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Item Name *</label>
                        <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required
                               className="w-full px-4 py-2 mt-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fdb515] focus:border-[#fdb515]" />
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)}
                                  className="w-full px-4 py-2 mt-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fdb515] focus:border-[#fdb515]"></textarea>
                    </div>
                    <div>
                        <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price *</label>
                        <input type="number" id="price" value={price} onChange={(e) => setPrice(e.target.value)} required step="1.00" min="0"
                               className="w-full px-4 py-2 mt-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fdb515] focus:border-[#fdb515]" />
                    </div>
                    <div>
                        <label htmlFor="itemType" className="block text-sm font-medium text-gray-700">Item Type *</label>
                        <select id="itemType" value={itemType} onChange={(e) => setItemType(e.target.value)} required
                                className="w-full px-4 py-2 mt-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fdb515] focus:border-[#fdb515]">
                            <option value="entree">Entree</option>
                            <option value="side">Side</option>
                            <option value="drink">Drink</option>
                            <option value="dessert">Dessert</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    
                    <div>
                        <label htmlFor="pictureUpload" className="block text-sm font-medium text-gray-700">Upload Picture</label>
                        <input type="file" id="pictureUpload" accept="image/*" onChange={handlePictureChange}
                               className="w-full px-4 py-2 mt-2 border-2 border-gray-300 rounded-lg"/>
                        {picturePreview && (
                            <div className="mt-4">
                                <p className="text-sm font-medium mb-2">Preview:</p>
                                <img src={picturePreview} alt="Item preview" className="w-32 h-32 object-cover rounded-lg border"/>
                            </div>
                        )}
                    </div>

                    <div className="form-check">
                        <input type="checkbox" className="form-check-input" id="showNutritionalInfo"
                               checked={showNutritionalInfo} onChange={(e) => setShowNutritionalInfo(e.target.checked)} />
                        <label className="form-check-label" htmlFor="showNutritionalInfo">Add Nutritional Information</label>
                    </div>

                    {showNutritionalInfo && (
                        <fieldset className="border p-4 rounded-lg">
                            <legend className="text-lg font-medium text-gray-800">Nutritional Information</legend>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="servingSize" className="block text-sm font-medium text-gray-700">Serving Size</label>
                                    <input type="text" id="servingSize" value={servingSize} onChange={(e) => setServingSize(e.target.value)}
                                           className="w-full px-4 py-2 mt-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fdb515] focus:border-[#fdb515]" />
                                </div>
                                <div>
                                    <label htmlFor="calories" className="block text-sm font-medium text-gray-700">Calories</label>
                                    <input type="number" id="calories" value={calories} onChange={(e) => setCalories(e.target.value)} min="0"
                                           className="w-full px-4 py-2 mt-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fdb515] focus:border-[#fdb515]" />
                                </div>
                                <div>
                                    <label htmlFor="totalFat" className="block text-sm font-medium text-gray-700">Total Fat (g)</label>
                                    <input type="number" id="totalFat" value={totalFat} onChange={(e) => setTotalFat(e.target.value)} min="0"
                                           className="w-full px-4 py-2 mt-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fdb515] focus:border-[#fdb515]" />
                                </div>
                                <div>
                                    <label htmlFor="cholesterol" className="block text-sm font-medium text-gray-700">Cholesterol (mg)</label>
                                    <input type="number" id="cholesterol" value={cholesterol} onChange={(e) => setCholesterol(e.target.value)}
                                           className="w-full px-4 py-2 mt-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fdb515] focus:border-[#fdb515]" />
                                </div>
                                <div>
                                    <label htmlFor="sodium" className="block text-sm font-medium text-gray-700">Sodium (mg)</label>
                                    <input type="number" id="sodium" value={sodium} onChange={(e) => setSodium(e.target.value)} min="0"
                                           className="w-full px-4 py-2 mt-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fdb515] focus:border-[#fdb515]" />
                                </div>
                                <div>
                                    <label htmlFor="carbs" className="block text-sm font-medium text-gray-700">Total Carbs (g)</label>
                                    <input type="text" id="carbs" value={carbs} onChange={(e) => setCarbs(e.target.value)}
                                           className="w-full px-4 py-2 mt-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fdb515] focus:border-[#fdb515]" />
                                </div>
                                <div>
                                    <label htmlFor="dietaryFiber" className="block text-sm font-medium text-gray-700">Dietary Fiber (g)</label>
                                    <input type="text" id="dietaryFiber" value={dietaryFiber} onChange={(e) => setDietaryFiber(e.target.value)}
                                           className="w-full px-4 py-2 mt-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fdb515] focus:border-[#fdb515]" />
                                </div>
                                <div>
                                    <label htmlFor="totalSugars" className="block text-sm font-medium text-gray-700">Total Sugars (g)</label>
                                    <input type="number" id="totalSugars" value={totalSugars} onChange={(e) => setTotalSugars(e.target.value)} min="0"
                                           className="w-full px-4 py-2 mt-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fdb515] focus:border-[#fdb515]" />
                                </div>
                                <div>
                                    <label htmlFor="addedSugars" className="block text-sm font-medium text-gray-700">Added Sugars (g)</label>
                                    <input type="text" id="addedSugars" value={addedSugars} onChange={(e) => setAddedSugars(e.target.value)}
                                           className="w-full px-4 py-2 mt-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fdb515] focus:border-[#fdb515]" />
                                </div>
                                <div>
                                    <label htmlFor="protein" className="block text-sm font-medium text-gray-700">Protein (g)</label>
                                    <input type="number" id="protein" value={protein} onChange={(e) => setProtein(e.target.value)} min="0"
                                           className="w-full px-4 py-2 mt-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fdb515] focus:border-[#fdb515]" />
                                </div>
                                <div className="md:col-span-2">
                                    <label htmlFor="ingredients" className="block text-sm font-medium text-gray-700">Ingredients</label>
                                    <textarea id="ingredients" value={ingredients} onChange={(e) => setIngredients(e.target.value)}
                                              className="w-full px-4 py-2 mt-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fdb515] focus:border-[#fdb515]"></textarea>
                                </div>
                            </div>
                        </fieldset>
                    )}

                    {error && <div className="text-red-500 text-center">{error}</div>}

                    <button type="submit"
                            disabled={isSubmitting}
                            className="w-full px-4 py-3 font-semibold text-white bg-gray-800 rounded-lg hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800 disabled:opacity-50 disabled:cursor-not-allowed">
                        {isSubmitting ? 'Creating Item...' : 'Create Item'}
                    </button>
                </form>
            </div>
        </div>
    );
}

function AddItemPage() {
    const { store_id } = ReactRouterDOM.useParams();
    return <ItemForm store_id={store_id} />;
}
