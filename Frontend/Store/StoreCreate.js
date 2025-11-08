const { useState } = React;

function StoreCreatePage() {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [picture, setPicture] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);  // Store file in state
    const [phone, setPhone] = useState('');
    const [street, setStreet] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [zip, setZip] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);  // Loading state

    const handleFileChange = (e) => {  // No longer async!
        const file = e.target.files[0];
        if (file) {
            console.log('Selected file:', file.name);
            setSelectedFile(file);  // Just store the file, don't upload yet
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        try {
            let mediaId = '';
            
            // Upload the file first if one was selected
            if (selectedFile) {
                console.log('Uploading file:', selectedFile.name);
                const data = await upload_media(selectedFile);
                mediaId = data.media_id;
                console.log('Upload successful, media_id:', mediaId);
            }
            
            // Create store data as JSON (using Pydantic model on backend)
            const storeData = {
                name,
                description,
                picture: mediaId,  // Use the media_id from the uploaded image
                phone,
                address: {
                    street,
                    city,
                    state,
                    zip
                }
            };
            
            const response = await create_store(storeData);
            
            if (response) {
                console.log('Store created successfully:', response);
                window.location.hash = '#/admin';
            }
            
        } catch (error) {
            console.error('Failed to create store', error);
            // Optionally show error message to user
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center pt-24 px-4 md:px-10 bg-gray-50">
            <div className="w-full max-w-2xl p-8 space-y-6 bg-white rounded-lg shadow-md">
                <h1 className="text-3xl font-bold text-center text-gray-800">Create a New Store</h1>
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
                    <div>
                        <label htmlFor="bannerUpload" className="block text-sm font-medium text-gray-700">Upload Banner</label>
                        <input type="file" id="bannerUpload" accept="image/*" onChange={handleFileChange}
                               className="w-full px-4 py-2 mt-2 border-2 border-gray-300 rounded-lg"/>
                        {selectedFile && (
                            <p className="mt-2 text-sm text-gray-600">
                                Selected: {selectedFile.name}
                            </p>
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
                    <button type="submit" 
                            disabled={isSubmitting}
                            className="w-full px-4 py-3 font-semibold text-white bg-gray-800 rounded-lg hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800 disabled:opacity-50 disabled:cursor-not-allowed">
                        {isSubmitting ? 'Creating Store...' : 'Create Store'}
                    </button>
                </form>
            </div>
        </div>
    );
}