const { useState } = React;

function StoreEditPage() {
    // Get store_id from URL params
    const { store_id } = ReactRouterDOM.useParams();

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [selectedBanner, setSelectedBanner] = useState(null);
    const [selectedLogo, setSelectedLogo] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);
    const [bannerPreview, setBannerPreview] = useState(null);
    const [phone, setPhone] = useState('');
    const [street, setStreet] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [zip, setZip] = useState('');
    const [error, setError] = useState(null);
    const [hours, setHours] = useState([
        { day: 'Monday', start_time: '', end_time: '' },
        { day: 'Tuesday', start_time: '', end_time: '' },
        { day: 'Wednesday', start_time: '', end_time: '' },
        { day: 'Thursday', start_time: '', end_time: '' },
        { day: 'Friday', start_time: '', end_time: '' },
        { day: 'Saturday', start_time: '', end_time: '' },
        { day: 'Sunday', start_time: '', end_time: '' },
    ]);
    const [isSubmitting, setIsSubmitting] = useState(false);


    if (!checkStoreOwnership(getUserId(), store_id) && getUserRole() != "admin"){
        setError('You do not have permissions to access this.')
    }

    // Fetch store data
    const { data: store, isLoading: storeLoading, error: storeError } = window.ReactQuery.useQuery({
        queryKey: ['store', store_id],
        queryFn: () => get_store_info_with_items(store_id),
        enabled: !!store_id
    });

    // Populate form when store data loads
    React.useEffect(() => {
        if (store) {
            setName(store.name || '');
            setDescription(store.description || '');
            setPhone(store.phone || '');
            
            if (store.address) {
                setStreet(store.address.street || '');
                setCity(store.address.city || '');
                setState(store.address.state || '');
                setZip(store.address.zip || '');
            }
            
            if (store.hours && store.hours.length > 0) {
                setHours(store.hours);
            }
        }
    }, [store]); // Only run when store data changes

    // Cleanup preview URLs on unmount
    React.useEffect(() => {
        return () => {
            if (logoPreview) URL.revokeObjectURL(logoPreview);
            if (bannerPreview) URL.revokeObjectURL(bannerPreview);
        };
    }, [logoPreview, bannerPreview]);

    const handleBannerFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (bannerPreview) {
                URL.revokeObjectURL(bannerPreview);
            }
            console.log('Selected banner:', file.name);
            const previewURL = URL.createObjectURL(file);
            setBannerPreview(previewURL);
            setSelectedBanner(file);
        }
    };

    const handleLogoFileChange = (e) => { 
        const file = e.target.files[0];
        if (file) {
            if (logoPreview) {
                URL.revokeObjectURL(logoPreview);
            }
            console.log('Selected logo:', file.name);
            const previewURL = URL.createObjectURL(file);
            setLogoPreview(previewURL);
            setSelectedLogo(file);
        }
    };

    const handleHoursChange = (index, field, value) => {
        const newHours = [...hours];
        newHours[index][field] = value;
        setHours(newHours);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        
        try {
            const formData = new FormData();
            
            const storeData = {
                name,
                description,
                phone,
                hours
            };
            
            const addressData = {
                street,
                city,
                state,
                zip
            };
            
            formData.append('store', JSON.stringify(storeData));
            formData.append('address', JSON.stringify(addressData));
            
            if (selectedLogo) {
                formData.append('picture', selectedLogo);
            }

            if (selectedBanner){
                formData.append('banner', selectedBanner);
            }
            
            // Use update function instead of create
            const response = await update_store(store_id, formData);
            
            if (response) {
                console.log('Store updated successfully:', response);
                window.location.hash = '#/admin';
            }
            
        } catch (error) {
            console.error('Failed to update store', error);
            if (error.response && error.response.data && error.response.data.detail) {
                setError(error.response.data.detail);
            } else {
                setError(error.message || 'An unexpected error occurred.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    // Loading state
    if (storeLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <div className="text-xl text-gray-600">Loading store data...</div>
            </div>
        );
    }

    // Error state
    if (storeError) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <div className="text-xl text-red-600">Error loading store: {storeError.message}</div>
            </div>
        );
    }

    // Not found state
    if (!store) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <div className="text-xl text-gray-600">Store not found.</div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center pt-24 px-4 md:px-10 bg-gray-50">
            <div className="w-full max-w-2xl p-8 space-y-6 bg-white rounded-lg shadow-md">
                <h1 className="text-3xl font-bold text-center text-gray-800">Edit Store</h1>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Store Name *</label>
                        <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required maxLength="100"
                               className="w-full px-4 py-2 mt-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fdb515] focus:border-[#fdb515]" />
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} maxLength="300"
                                  className="w-full px-4 py-2 mt-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fdb515] focus:border-[#fdb515]"></textarea>
                    </div>
                    
                    {/* Banner Upload */}
                    <div>
                        <label htmlFor="bannerUpload" className="block text-sm font-medium text-gray-700">Upload Banner</label>
                        <input type="file" id="bannerUpload" accept="image/*" onChange={handleBannerFileChange}
                               className="w-full px-4 py-2 mt-2 border-2 border-gray-300 rounded-lg"/>
                        {bannerPreview ? (
                            <div className="mt-4">
                                <p className="text-sm font-medium mb-2">New Preview:</p>
                                <img 
                                    src={bannerPreview} 
                                    alt="Banner preview" 
                                    className="w-full h-48 object-cover rounded-lg border"
                                />
                            </div>
                        ) : store.banner_id && (
                            <div className="mt-4">
                                <p className="text-sm font-medium mb-2">Current Banner:</p>
                                <img 
                                    src={`http://localhost:8000/media/${store.banner_id}`} 
                                    alt="Current banner" 
                                    className="w-full h-48 object-cover rounded-lg border"
                                />
                            </div>
                        )}
                    </div>
                    
                    {/* Logo Upload */}
                    <div>
                        <label htmlFor="logoUpload" className="block text-sm font-medium text-gray-700">Upload Logo</label>
                        <input type="file" id="logoUpload" accept="image/*" onChange={handleLogoFileChange}
                               className="w-full px-4 py-2 mt-2 border-2 border-gray-300 rounded-lg"/>
                        {logoPreview ? (
                            <div className="mt-4">
                                <p className="text-sm font-medium mb-2">New Preview:</p>
                                <img 
                                    src={logoPreview} 
                                    alt="Logo preview" 
                                    className="w-32 h-32 object-cover rounded-lg border"
                                />
                            </div>
                        ) : store.logo_id && (
                            <div className="mt-4">
                                <p className="text-sm font-medium mb-2">Current Logo:</p>
                                <img 
                                    src={`http://localhost:8000/media/${store.logo_id}`} 
                                    alt="Current logo" 
                                    className="w-32 h-32 object-cover rounded-lg border"
                                />
                            </div>
                        )}
                    </div>
                    
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                        <input type="text" id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} 
                               className="w-full px-4 py-2 mt-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fdb515] focus:border-[#fdb515]" />
                    </div>
                    <fieldset className="border p-4 rounded-lg">
                        <legend className="text-lg font-medium text-gray-800">Address *</legend>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="street" className="block text-sm font-medium text-gray-700">Street</label>
                                <input type="text" id="street" value={street} onChange={(e) => setStreet(e.target.value)} required
                                       className="w-full px-4 py-2 mt-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fdb515] focus:border-[#fdb515]" />
                            </div>
                            <div>
                                <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
                                <input type="text" id="city" value={city} onChange={(e) => setCity(e.target.value)} required
                                       className="w-full px-4 py-2 mt-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fdb515] focus:border-[#fdb515]" />
                            </div>
                            <div>
                                <label htmlFor="state" className="block text-sm font-medium text-gray-700">State</label>
                                <input type="text" id="state" value={state} onChange={(e) => setState(e.target.value)} required
                                       className="w-full px-4 py-2 mt-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fdb515] focus:border-[#fdb515]" />
                            </div>
                            <div>
                                <label htmlFor="zip" className="block text-sm font-medium text-gray-700">Zip Code</label>
                                <input type="text" id="zip" value={zip} onChange={(e) => setZip(e.target.value)} required
                                       className="w-full px-4 py-2 mt-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fdb515] focus:border-[#fdb515]" />
                            </div>
                        </div>
                    </fieldset>
                    <fieldset className="border p-4 rounded-lg">
                        <legend className="text-lg font-medium text-gray-800">Store Hours *</legend>
                        {hours.map((hour, index) => (
                            <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center mb-4">
                                <label className="block text-sm font-medium text-gray-700">{hour.day}</label>
                                <div>
                                    <label htmlFor={`startTime-${index}`} className="block text-sm font-medium text-gray-700">Start Time</label>
                                    <input type="time" id={`startTime-${index}`} value={hour.start_time || ''} onChange={(e) => handleHoursChange(index, 'start_time', e.target.value)}
                                           className="w-full px-4 py-2 mt-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fdb515] focus:border-[#fdb515]" />
                                </div>
                                <div>
                                    <label htmlFor={`endTime-${index}`} className="block text-sm font-medium text-gray-700">End Time</label>
                                    <input type="time" id={`endTime-${index}`} value={hour.end_time || ''} onChange={(e) => handleHoursChange(index, 'end_time', e.target.value)}
                                           className="w-full px-4 py-2 mt-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fdb515] focus:border-[#fdb515]" />
                                </div>
                            </div>
                        ))}
                    </fieldset>
                    {error && <div className="text-red-500 text-center">{error}</div>}
                    <button type="submit" 
                            disabled={isSubmitting}
                            className="w-full px-4 py-3 font-semibold text-white bg-gray-800 rounded-lg hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800 disabled:opacity-50 disabled:cursor-not-allowed">
                        {isSubmitting ? 'Updating Store...' : 'Update Store'}
                    </button>
                </form>
            </div>
        </div>
    );
}