const { useQuery, useMutation, useQueryClient } = window.ReactQuery;
const { useState, useEffect } = React;


function CartPage() {
    const queryClient = useQueryClient();
    const [selectedAddress, setSelectedAddress] = useState('');

    const { data: cart, isLoading: isCartLoading, error: cartError } = useQuery({
        queryKey: ['cart'],
        queryFn: () => get_cart(getUserId())
    });

    const { data: addresses, isLoading: isAddressesLoading, error: addressesError } = useQuery({
        queryKey: ['addresses'],
        queryFn: () => get_user_addresses(getUserId()),
        enabled: !!getUserId(), // Only fetch addresses if user ID is available
    });

    useEffect(() => {
        if (addresses && addresses.length > 0) {
            setSelectedAddress(addresses[0].id);
        }
    }, [addresses]);

    const updateItemMutation = useMutation({
        mutationFn: ({ item_id, quantity }) => update_cart_item(item_id, quantity),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cart'] });
        },
    });

    const removeItemMutation = useMutation({
        mutationFn: (item_id) => remove_from_cart(item_id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cart'] });
        },
    });

    const createOrderMutation = useMutation({
        mutationFn: create_order_from_cart,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['cart'] });
            alert(`Order created successfully! Order ID: ${data.id}`);
            // Optionally, navigate to an order confirmation page
        },
        onError: (error) => {
            alert(`Error creating order: ${error.message}`);
        },
    });

    const handleQuantityChange = (item_id, quantity) => {
        const q = parseInt(quantity, 10);
        if (isNaN(q) || q < 1) return;
        updateItemMutation.mutate({ item_id, quantity: q });
    };
    
    const handleCheckout = () => {
        if (!selectedAddress) {
            alert("Please select a delivery address.");
            return;
        }
        createOrderMutation.mutate(selectedAddress);
    };

    if (isCartLoading || isAddressesLoading) return <div>Loading...</div>;
    if (cartError) return <div>Error loading cart: {cartError.message}</div>;
    if (addressesError) return <div>Error loading addresses: {addressesError.message}</div>;

    const cartIsEmpty = !cart || !cart.items || cart.items.length === 0;

    const totalPrice = cart?.items.reduce((total, cartItem) => total + cartItem.item.price * cartItem.quantity, 0) || 0;

    return (
        <div className="container mx-auto mt-10 p-4 mt-20">
            <h1 className="text-3xl font-bold mb-6">Your Shopping Cart</h1>
            {cartIsEmpty ? (
                <p>Your cart is empty.</p>
            ) : (
                <div>
                    <div className="border-b mb-4">
                        {cart.items.map(cartItem => (
                            <div key={cartItem.id} className="flex items-center justify-between py-4">
                                <div className="flex items-center">
                                    <img src={cartItem.item.picture_id ? `http://127.0.0.1:8000/media/${cartItem.item.picture_id}` : 'https://via.placeholder.com/100'} alt={cartItem.item.name} className="w-20 h-20 object-cover rounded mr-4" />
                                    <div>
                                        <h2 className="text-xl font-semibold">{cartItem.item.name}</h2>
                                        <p className="text-gray-600">${cartItem.item.price}</p>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <input
                                        type="number"
                                        min="1"
                                        value={cartItem.quantity}
                                        onChange={(e) => handleQuantityChange(cartItem.item.id, e.target.value)}
                                        className="w-20 text-center border rounded mx-4"
                                    />
                                    <button onClick={() => removeItemMutation.mutate(cartItem.item.id)} className="text-red-500 hover:text-red-700">
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-6 text-right">
                        <div className="mb-4">
                            <label htmlFor="address-select" className="mr-2 font-semibold">Delivery Address:</label>
                            <select
                                id="address-select"
                                value={selectedAddress}
                                onChange={(e) => setSelectedAddress(e.target.value)}
                                className="border rounded p-2"
                            >
                                {addresses && addresses.map(address => (
                                    <option key={address.id} value={address.id}>
                                        {address.street}, {address.city}, {address.state} {address.zip}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <h2 className="text-2xl font-bold">Total: ${totalPrice.toFixed(2)}</h2>
                        <button 
                            onClick={handleCheckout} 
                            className="btn btn-action mt-4"
                            disabled={createOrderMutation.isLoading}
                        >
                            {createOrderMutation.isLoading ? 'Placing Order...' : 'Proceed to Checkout'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
