function CheckoutPage() {
    const { useQuery, useMutation, useQueryClient } = window.ReactQuery;
    const { useState } = React;
    const queryClient = useQueryClient();
    const [selectedAddress, setSelectedAddress] = useState('');
    const [showAddAddressForm, setShowAddAddressForm] = useState(false);
    const [newAddressForm, setNewAddressForm] = useState({
        building: '', room: '', street: '', city: '', state: '', zip: ''
    });
    const [paymentForm, setPaymentForm] = useState({
        cardNumber: '',
        cardName: '',
        expiryDate: '',
        cvv: ''
    });
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const { data: cart, isLoading: isCartLoading, error: cartError } = useQuery({
        queryKey: ['cart'],
        queryFn: () => get_cart()
    });

    const { data: addresses = [], isLoading: addressesLoading } = useQuery({
        queryKey: ['addresses'],
        queryFn: () => get_user_addresses(getUserId())
    });

    const addAddressMutation = useMutation({
        mutationFn: (addressData) => add_user_address(getUserId(), addressData),
        onSuccess: (newAddress) => {
            queryClient.invalidateQueries({ queryKey: ['addresses'] });
            
            // Only set selected address if we got a valid response
            if (newAddress && newAddress.id) {
                setSelectedAddress(String(newAddress.id));
            }
            
            setShowAddAddressForm(false);
            setNewAddressForm({ building: '', room: '', street: '', city: '', state: '', zip: '' });
            setSuccessMessage('Address added successfully.');
        },
        onError: (error) => {
            setErrorMessage(`Error adding address: ${error?.response?.data?.detail || error.message || 'Unknown error'}`);
        }
    });

    const createOrderMutation = useMutation({
        mutationFn: (address_id) => create_order_from_cart(address_id),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['cart'] });
            setSuccessMessage(`Order placed successfully! Order ID: ${data.id}`);
            setTimeout(() => {
                window.location.hash = '#/orders';
            }, 2000);
        },
        onError: (error) => {
            setErrorMessage(`Error creating order: ${error?.response?.data?.detail}`);
        },
    });

    const handleAddAddress = () => {
        if (!newAddressForm.street || !newAddressForm.city || !newAddressForm.state || !newAddressForm.zip) {
            setErrorMessage('Please fill in all address fields.');
            return;
        }
        
        addAddressMutation.mutate({ 
            building: newAddressForm.building,
            room_number: newAddressForm.room,
            street: newAddressForm.street, 
            city: newAddressForm.city, 
            state: newAddressForm.state, 
            zip: newAddressForm.zip 
        });
    };

    const handlePlaceOrder = () => {
        if (!selectedAddress) {
            setErrorMessage('Please select a shipping address.');
            return;
        }
        if (!paymentForm.cardNumber || !paymentForm.cardName || !paymentForm.expiryDate || !paymentForm.cvv) {
            setErrorMessage('Please fill in all payment information.');
            return;
        }
        createOrderMutation.mutate({ address_id: parseInt(selectedAddress) });
    };

    if (isCartLoading || addressesLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-xl">Loading...</div>
            </div>
        );
    }

    if (cartError) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-xl text-red-600">Error loading cart: {cartError.message}</div>
            </div>
        );
    }

    const cartIsEmpty = !cart || !cart.items || cart.items.length === 0;
    
    if (cartIsEmpty) {
        return (
            <div className="min-h-screen bg-gray-50 pt-24 px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-lg shadow-md p-8 text-center">
                        <h1 className="text-3xl font-bold text-gray-800 mb-4">Your cart is empty</h1>
                        <p className="text-gray-600 mb-6">Add items to your cart before checking out.</p>
                        <button 
                            onClick={() => window.location.hash = '#/stores'}
                            className="btn btn-action"
                        >
                            Browse Stores
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const subtotal = cart.items.reduce((total, cartItem) => total + cartItem.item.price * cartItem.quantity, 0);
    const deliveryFee = 5.99;
    const tax = subtotal * 0.08;
    const total = subtotal + deliveryFee + tax;

    return (
        <div className="min-h-screen bg-gray-50 pt-24 px-4 md:px-10 pb-10">
            <Toast 
                message={successMessage}
                type="success"
                show={!!successMessage}
                onClose={() => setSuccessMessage('')}
            />
            <Toast 
                message={errorMessage}
                type="danger"
                show={!!errorMessage}
                onClose={() => setErrorMessage('')}
            />
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center mb-6">
                    <button 
                        onClick={() => window.location.hash = '#/cart'}
                        className="btn btn-secondary mr-4"
                    >
                        ← Back to Cart
                    </button>
                    <h1 className="text-4xl font-bold text-gray-800">Checkout</h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Shipping Address Section */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Shipping Address</h2>
                            
                            {addresses.length === 0 ? (
                                <p className="text-gray-600 mb-4">No saved addresses. Please add a new address.</p>
                            ) : (
                                <div className="space-y-3 mb-4">
                                    {addresses.map(address => (
                                        <label 
                                            key={address.id} 
                                            className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                                selectedAddress === String(address.id) 
                                                    ? 'border-[#fdb515] bg-amber-50' 
                                                    : 'border-gray-300 hover:border-gray-400'
                                            }`}
                                        >
                                            <input 
                                                type="radio" 
                                                name="address" 
                                                value={address.id} 
                                                checked={selectedAddress === String(address.id)}
                                                onChange={(e) => setSelectedAddress(e.target.value)}
                                                className="mt-1 mr-3"
                                            />
                                            <div>
                                                <p className="font-semibold text-gray-800">{address.building} {address.room_number ? '- Room' : ''} {address.room_number}</p>
                                                <p className="text-gray-600">{address.street}</p>
                                                <p className="text-gray-600">{address.city}, {address.state} {address.zip}</p>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            )}

                            <button 
                                onClick={() => setShowAddAddressForm(!showAddAddressForm)} 
                                className="btn btn-secondary"
                            >
                                {showAddAddressForm ? 'Cancel' : '+ Add New Address'}
                            </button>

                            {showAddAddressForm && (
                                <div className="mt-4 p-4 border-2 border-gray-300 rounded-lg bg-gray-50">
                                    <h3 className="font-semibold text-lg text-gray-800 mb-3">New Address</h3>
                                    <div className="space-y-3">
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Building</label>
                                                <input 
                                                    type="text" 
                                                    placeholder="Building name/number" 
                                                    value={newAddressForm.building} 
                                                    onChange={(e) => setNewAddressForm({...newAddressForm, building: e.target.value})}
                                                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fdb515] focus:border-[#fdb515]"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Room Number</label>
                                                <input 
                                                    type="text" 
                                                    placeholder="Room/Unit #" 
                                                    value={newAddressForm.room} 
                                                    onChange={(e) => setNewAddressForm({...newAddressForm, room: e.target.value})}
                                                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fdb515] focus:border-[#fdb515]"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                                            <input 
                                                type="text" 
                                                placeholder="123 Main St" 
                                                value={newAddressForm.street} 
                                                onChange={(e) => setNewAddressForm({...newAddressForm, street: e.target.value})}
                                                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fdb515] focus:border-[#fdb515]"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                            <input 
                                                type="text" 
                                                placeholder="San Francisco" 
                                                value={newAddressForm.city} 
                                                onChange={(e) => setNewAddressForm({...newAddressForm, city: e.target.value})}
                                                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fdb515] focus:border-[#fdb515]"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                                                <input 
                                                    type="text" 
                                                    placeholder="CA" 
                                                    value={newAddressForm.state} 
                                                    onChange={(e) => setNewAddressForm({...newAddressForm, state: e.target.value})}
                                                    maxLength="2"
                                                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fdb515] focus:border-[#fdb515]"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                                                <input 
                                                    type="text" 
                                                    placeholder="94102" 
                                                    value={newAddressForm.zip} 
                                                    onChange={(e) => setNewAddressForm({...newAddressForm, zip: e.target.value})}
                                                    maxLength="5"
                                                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fdb515] focus:border-[#fdb515]"
                                                />
                                            </div>
                                        </div>
                                        <button 
                                            onClick={handleAddAddress} 
                                            className="btn btn-action w-full"
                                            disabled={addAddressMutation.isLoading}
                                        >
                                            {addAddressMutation.isLoading ? 'Saving...' : 'Save Address'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Order Items Review */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Order Items</h2>
                            <div className="space-y-3">
                                {cart.items.map(cartItem => (
                                    <div key={cartItem.id} className="flex items-center gap-4 pb-3 border-b border-gray-200 last:border-0">
                                        <img 
                                            src={cartItem.item.picture_id ? `http://127.0.0.1:8000/media/${cartItem.item.picture_id}` : 'https://via.placeholder.com/80'} 
                                            alt={cartItem.item.name} 
                                            className="w-16 h-16 object-cover rounded-lg" 
                                        />
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-800">{cartItem.item.name}</h3>
                                            <p className="text-sm text-gray-600">Qty: {cartItem.quantity}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold text-gray-800">
                                                ${(cartItem.item.price * cartItem.quantity).toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Payment Information Section */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Payment Information</h2>
                            <p className="text-sm text-gray-500 mb-4">This is a demo - enter any payment details</p>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                                    <input 
                                        type="text" 
                                        placeholder="1234 5678 9012 3456" 
                                        value={paymentForm.cardNumber}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/\D/g, '').slice(0, 16);
                                            const formatted = value.match(/.{1,4}/g)?.join(' ') || value;
                                            setPaymentForm({...paymentForm, cardNumber: formatted});
                                        }}
                                        maxLength="19"
                                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fdb515] focus:border-[#fdb515]"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Cardholder Name</label>
                                    <input 
                                        type="text" 
                                        placeholder="John Doe" 
                                        value={paymentForm.cardName}
                                        onChange={(e) => setPaymentForm({...paymentForm, cardName: e.target.value})}
                                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fdb515] focus:border-[#fdb515]"
                                    />
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                                        <input 
                                            type="text" 
                                            placeholder="MM/YY" 
                                            value={paymentForm.expiryDate}
                                            onChange={(e) => {
                                                let value = e.target.value.replace(/\D/g, '');
                                                if (value.length >= 2) {
                                                    value = value.slice(0, 2) + '/' + value.slice(2, 4);
                                                }
                                                setPaymentForm({...paymentForm, expiryDate: value});
                                            }}
                                            maxLength="5"
                                            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fdb515] focus:border-[#fdb515]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                                        <input 
                                            type="text" 
                                            placeholder="123" 
                                            value={paymentForm.cvv}
                                            onChange={(e) => {
                                                const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                                                setPaymentForm({...paymentForm, cvv: value});
                                            }}
                                            maxLength="4"
                                            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fdb515] focus:border-[#fdb515]"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                    <p className="text-sm text-blue-800">Your payment information is secure</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Order Summary</h2>
                            <div className="space-y-3 mb-4">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal</span>
                                    <span>${subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Delivery Fee</span>
                                    <span>${deliveryFee.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Tax (8%)</span>
                                    <span>${tax.toFixed(2)}</span>
                                </div>
                                <div className="h-px bg-gray-300"></div>
                                <div className="flex justify-between text-xl font-bold text-gray-800">
                                    <span>Total</span>
                                    <span>${total.toFixed(2)}</span>
                                </div>
                            </div>
                            
                            <button 
                                onClick={handlePlaceOrder}
                                className="btn btn-action w-full"
                                disabled={createOrderMutation.isLoading || !selectedAddress || !paymentForm.cardNumber || !paymentForm.cardName || !paymentForm.expiryDate || !paymentForm.cvv}
                            >
                                {createOrderMutation.isLoading ? 'Placing Order...' : 'Place Order'}
                            </button>
                            
                            {!selectedAddress && (
                                <p className="text-sm text-red-600 mt-2 text-center">
                                    Please select a shipping address
                                </p>
                            )}
                            
                            {selectedAddress && (!paymentForm.cardNumber || !paymentForm.cardName || !paymentForm.expiryDate || !paymentForm.cvv) && (
                                <p className="text-sm text-red-600 mt-2 text-center">
                                    Please fill in payment information
                                </p>
                            )}

                            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                <p className="text-xs text-gray-600 text-center">
                                    By placing your order, you agree to our terms and conditions
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CheckoutPage;