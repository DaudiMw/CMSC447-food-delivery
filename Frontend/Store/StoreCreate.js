const { useState, useEffect } = React;
const { useForm, useFieldArray } = ReactHookForm;
const { useParams, useHistory } = ReactRouterDOM;

function StoreForm({ store: existingStore }) {
    const history = useHistory();
    const defaultValues = {
        name: existingStore?.name || '',
        description: existingStore?.description || '',
        phone: existingStore?.phone || '',
        street: existingStore?.address?.street || '',
        city: existingStore?.address?.city || '',
        state: existingStore?.address?.state || '',
        zip: existingStore?.address?.zip || '',
        building: existingStore?.address?.building || '',
        room_number: existingStore?.address?.room_number || '',
        hours: existingStore?.hours?.length ? existingStore.hours.map(h => ({...h})) : [
            { day: 'Monday', start_time: null, end_time: null },
            { day: 'Tuesday', start_time: null, end_time: null },
            { day: 'Wednesday', start_time: null, end_time: null },
            { day: 'Thursday', start_time: null, end_time: null },
            { day: 'Friday', start_time: null, end_time: null },
            { day: 'Saturday', start_time: null, end_time: null },
            { day: 'Sunday', start_time: null, end_time: null },
        ]
    };

    const { register, handleSubmit, control, formState: { errors, isSubmitting }, watch, reset } = useForm({ defaultValues });

    useEffect(() => {
        if (existingStore) {
            reset(defaultValues);
        }
    }, [existingStore, reset]);

    const { fields } = useFieldArray({ control, name: 'hours' });

    const [logoPreview, setLogoPreview] = useState(existingStore?.logo_id ? `http://localhost:8000/media/${existingStore.logo_id}` : null);
    const [bannerPreview, setBannerPreview] = useState(existingStore?.banner_id ? `http://localhost:8000/media/${existingStore.banner_id}` : null);
    const [serverError, setServerError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    const logoFile = watch('logo');
    const bannerFile = watch('banner');

    useEffect(() => {
        if (logoFile && logoFile[0]) {
            const newPreview = URL.createObjectURL(logoFile[0]);
            setLogoPreview(newPreview);
            return () => URL.revokeObjectURL(newPreview);
        }
    }, [logoFile]);

    useEffect(() => {
        if (bannerFile && bannerFile[0]) {
            const newPreview = URL.createObjectURL(bannerFile[0]);
            setBannerPreview(newPreview);
            return () => URL.revokeObjectURL(newPreview);
        }
    }, [bannerFile]);

    const onSubmit = async (data) => {
        setServerError(null);
        setSuccessMessage(null);
        try {
            const formData = new FormData();
            const storeData = {
                name: data.name,
                description: data.description,
                phone: data.phone,
                hours: data.hours,
            };
            const addressData = {
                street: data.street,
                city: data.city,
                state: data.state,
                zip: data.zip,
                building: data.building,
                room_number: data.room_number,
            };

            formData.append('store', JSON.stringify(storeData));
            formData.append('address', JSON.stringify(addressData));

            if (data.logo && data.logo[0]) formData.append('logo', data.logo[0]);
            if (data.banner && data.banner[0]) formData.append('banner', data.banner[0]);

            if (existingStore) {
                await edit_store(formData, existingStore.id);
                setSuccessMessage('Store updated successfully!');
            } else {
                await create_store(formData);
                setSuccessMessage(<span>Store created successfully! <a href="#/admin">Go to Admin</a></span>);
                reset(); // Clear the form on successful creation
            }
        } catch (error) {
            // console.error('Failed to save store', error);
            // Try multiple paths to find the error detail
            const errorMessage = error?.response?.data?.detail
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
                <h1 className="text-3xl font-bold text-center text-gray-800">{existingStore ? 'Edit Store' : 'Create a New Store'}</h1>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Store Name *</label>
                        <input type="text" id="name" {...register('name', { required: 'Store name is required' })}
                               className={`w-full px-4 py-2 mt-2 border-2 rounded-lg focus:ring-2 focus:ring-[#fdb515] focus:border-[#fdb515] ${errors.name ? 'border-red-500' : 'border-gray-300'}`} />
                        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea id="description" {...register('description')} maxLength="300"
                                  className="w-full px-4 py-2 mt-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fdb515] focus:border-[#fdb515]"></textarea>
                    </div>
                    
                    <div>
                        <label htmlFor="bannerUpload" className="block text-sm font-medium text-gray-700">Upload Banner</label>
                        <input type="file" id="bannerUpload" accept="image/*" {...register('banner')}
                               className="w-full px-4 py-2 mt-2 border-2 border-gray-300 rounded-lg"/>
                        {bannerPreview ? (
                            <div className="mt-4">
                                <p className="text-sm font-medium mb-2">{watch('banner')?.[0] ? "New Preview:" : "Current Banner:"}</p>
                                <img src={bannerPreview} alt="Banner" className="w-full h-48 object-cover rounded-lg border"/>
                            </div>
                        ) : null}
                    </div>
                    
                    <div>
                        <label htmlFor="logoUpload" className="block text-sm font-medium text-gray-700">Upload Logo</label>
                        <input type="file" id="logoUpload" accept="image/*" {...register('logo')}
                               className="w-full px-4 py-2 mt-2 border-2 border-gray-300 rounded-lg"/>
                        {logoPreview ? (
                            <div className="mt-4">
                                <p className="text-sm font-medium mb-2">{watch('logo')?.[0] ? "New Preview:" : "Current Logo:"}</p>
                                <img src={logoPreview} alt="Logo" className="w-32 h-32 object-cover rounded-lg border"/>
                            </div>
                        ) : null}
                    </div>
                    
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number *</label>
                        <input type="text" id="phone" {...register('phone', { required: 'Phone number is required' })}
                               className={`w-full px-4 py-2 mt-2 border-2 rounded-lg focus:ring-2 focus:ring-[#fdb515] focus:border-[#fdb515] ${errors.phone ? 'border-red-500' : 'border-gray-300'}`} />
                        {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
                    </div>
                    <fieldset className="border p-4 rounded-lg">
                        <legend className="text-lg font-medium text-gray-800">Address *</legend>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="building" className="block text-sm font-medium text-gray-700">Building</label>
                                <input type="text" id="building" {...register('building', { required: 'Building is required' })}
                                       className={`w-full px-4 py-2 mt-2 border-2 rounded-lg focus:ring-2 focus:ring-[#fdb515] focus:border-[#fdb515] ${errors.building ? 'border-red-500' : 'border-gray-300'}`} />
                                {errors.building && <p className="text-red-500 text-sm mt-1">{errors.building.message}</p>}
                            </div>
                            <div>
                                <label htmlFor="room_number" className="block text-sm font-medium text-gray-700">Room Number</label>
                                <input type="text" id="room_number" {...register('room_number', { required: 'Room number is required' })}
                                       className={`w-full px-4 py-2 mt-2 border-2 rounded-lg focus:ring-2 focus:ring-[#fdb515] focus:border-[#fdb515] ${errors.room_number ? 'border-red-500' : 'border-gray-300'}`} />
                                {errors.room_number && <p className="text-red-500 text-sm mt-1">{errors.room_number.message}</p>}
                            </div>
                            <div>
                                <label htmlFor="street" className="block text-sm font-medium text-gray-700">Street</label>
                                <input type="text" id="street" {...register('street', { required: 'Street is required' })}
                                       className={`w-full px-4 py-2 mt-2 border-2 rounded-lg focus:ring-2 focus:ring-[#fdb515] focus:border-[#fdb515] ${errors.street ? 'border-red-500' : 'border-gray-300'}`} />
                                {errors.street && <p className="text-red-500 text-sm mt-1">{errors.street.message}</p>}
                            </div>
                            <div>
                                <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
                                <input type="text" id="city" {...register('city', { required: 'City is required' })}
                                       className={`w-full px-4 py-2 mt-2 border-2 rounded-lg focus:ring-2 focus:ring-[#fdb515] focus:border-[#fdb515] ${errors.city ? 'border-red-500' : 'border-gray-300'}`} />
                                {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>}
                            </div>
                            <div>
                                <label htmlFor="state" className="block text-sm font-medium text-gray-700">State</label>
                                <input type="text" id="state" {...register('state', { required: 'State is required' })}
                                       className={`w-full px-4 py-2 mt-2 border-2 rounded-lg focus:ring-2 focus:ring-[#fdb515] focus:border-[#fdb515] ${errors.state ? 'border-red-500' : 'border-gray-300'}`} />
                                {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state.message}</p>}
                            </div>
                            <div>
                                <label htmlFor="zip" className="block text-sm font-medium text-gray-700">Zip Code</label>
                                <input type="text" id="zip" {...register('zip', { required: 'Zip code is required' })}
                                       className={`w-full px-4 py-2 mt-2 border-2 rounded-lg focus:ring-2 focus:ring-[#fdb515] focus:border-[#fdb515] ${errors.zip ? 'border-red-500' : 'border-gray-300'}`} />
                                {errors.zip && <p className="text-red-500 text-sm mt-1">{errors.zip.message}</p>}
                            </div>
                        </div>
                    </fieldset>
                    <fieldset className="border p-4 rounded-lg">
                        <legend className="text-lg font-medium text-gray-800">Store Hours *</legend>
                        {fields.map((field, index) => (
                            <div key={field.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center mb-4">
                                <label className="block text-sm font-medium text-gray-700">{field.day}</label>
                                <div>
                                    <label htmlFor={`hours[${index}].start_time`} className="block text-sm font-medium text-gray-700">Start Time</label>
                                    <input type="time" id={`hours[${index}].start_time`} {...register(`hours.${index}.start_time`)}
                                           className={`w-full px-4 py-2 mt-2 border-2 rounded-lg focus:ring-2 focus:ring-[#fdb515] focus:border-[#fdb515] ${errors.hours?.[index]?.start_time ? 'border-red-500' : 'border-gray-300'}`} />
                                    {errors.hours?.[index]?.start_time && <p className="text-red-500 text-sm mt-1">{errors.hours?.[index]?.start_time.message}</p>}
                                </div>
                                <div>
                                    <label htmlFor={`hours[${index}].end_time`} className="block text-sm font-medium text-gray-700">End Time</label>
                                    <input type="time" id={`hours[${index}].end_time`} {...register(`hours.${index}.end_time`)}
                                           className={`w-full px-4 py-2 mt-2 border-2 rounded-lg focus:ring-2 focus:ring-[#fdb515] focus:border-[#fdb515] ${errors.hours?.[index]?.end_time ? 'border-red-500' : 'border-gray-300'}`} />
                                    {errors.hours?.[index]?.end_time && <p className="text-red-500 text-sm mt-1">{errors.hours?.[index]?.end_time.message}</p>}
                                </div>
                            </div>
                        ))}
                    </fieldset>

                    <button type="submit"
                            disabled={isSubmitting}
                            className="btn btn-action w-full">
                        {isSubmitting ? 'Saving...' : 'Save Store'}
                    </button>
                </form>
            </div>
        </div>
    );
}

function StoreCreatePage() {
    return <StoreForm />;
}

function StoreEditPage() {
    const { store_id } = useParams();
    const { data: store, isLoading, error } = useQuery(['store', store_id], () => get_store(store_id));

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;

    return <StoreForm store={store} />;
}