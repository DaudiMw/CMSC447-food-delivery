const { useQuery, useMutation, useQueryClient } = window.ReactQuery;
const { useState } = React;

function CartPage() {
    const queryClient = useQueryClient();
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const { data: cart, isLoading: isCartLoading, error: cartError } = useQuery({
        queryKey: ['cart'],
        queryFn: () => get_cart()
    });

    const updateItemMutation = useMutation({
        mutationFn: ({ item_id, quantity }) => update_cart_item(item_id, quantity),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cart'] });
            setSuccessMessage('Cart updated successfully.');
        },
        onError: (error) => {
            setErrorMessage(error?.response?.data?.detail || 'Failed to update cart.');
        }
    });

    const removeItemMutation = useMutation({
        mutationFn: (item_id) => remove_from_cart(item_id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cart'] });
            setSuccessMessage('Item removed from cart.');
        },
        onError: (error) => {
            setErrorMessage(error?.response?.data?.detail || 'Failed to remove item.');
        }
    });

    const handleQuantityChange = (item_id, quantity) => {
        const q = parseInt(quantity, 10);
        if (isNaN(q) || q < 1) return;
        updateItemMutation.mutate({ item_id, quantity: q });
    };

    const handleProceedToCheckout = () => {
        window.location.hash = '#/checkout';
    };

    if (isCartLoading) return <div className="flex justify-center items-center min-h-screen"><div className="text-xl">Loading...</div></div>;
    if (cartError) return <div className="flex justify-center items-center min-h-screen"><div className="text-xl text-red-600">Error loading cart: {cartError.message}</div></div>;

    const cartIsEmpty = !cart || !cart.items || cart.items.length === 0;
    const totalPrice = cart?.items.reduce((total, cartItem) => total + cartItem.item.price * cartItem.quantity, 0) || 0;

    return (
        <div className="min-h-screen bg-gray-50 pt-24 px-4 md:px-10">
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
                <h1 className="text-4xl font-bold text-gray-800 mb-6">Your Shopping Cart</h1>
                
                {cartIsEmpty ? (
                    <div className="bg-white rounded-lg shadow-md p-8 text-center">
                        <p className="text-xl text-gray-600 mb-4">Your cart is empty.</p>
                        <button 
                            onClick={() => window.location.hash = '#/home'}
                            className="btn btn-action"
                        >
                            Continue Shopping
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Cart Items */}
                        <div className="lg:col-span-2 space-y-4">
                            {cart.items.map(cartItem => (
                                <div key={cartItem.id} className="bg-white rounded-lg shadow-md p-4 flex items-center gap-4">
                                    <img 
                                        src={cartItem.item.picture_id ? `http://127.0.0.1:8000/media/${cartItem.item.picture_id}` : 'https://via.placeholder.com/100'} 
                                        alt={cartItem.item.name} 
                                        className="w-24 h-24 object-cover rounded-lg" 
                                    />
                                    <div className="flex-1">
                                        <h2 className="text-xl font-semibold text-gray-800">{cartItem.item.name}</h2>
                                        <p className="text-gray-600 mt-1">${cartItem.item.price.toFixed(2)} each</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center">
                                            <label className="text-sm text-gray-600 mr-2">Qty:</label>
                                            <input
                                                type="number"
                                                min="1"
                                                value={cartItem.quantity}
                                                onChange={(e) => handleQuantityChange(cartItem.item.id, e.target.value)}
                                                className="w-20 text-center border-2 border-gray-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-[#fdb515] focus:border-[#fdb515]"
                                            />
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-bold text-gray-800">
                                                ${(cartItem.item.price * cartItem.quantity).toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => removeItemMutation.mutate(cartItem.item.id)} 
                                        className="btn btn-delete ml-2"
                                        disabled={removeItemMutation.isLoading}
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
                                <h2 className="text-2xl font-bold text-gray-800 mb-4">Order Summary</h2>
                                <div className="space-y-3 mb-4">
                                    <div className="flex justify-between text-gray-600">
                                        <span>Items ({cart.items.length})</span>
                                        <span>${totalPrice.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                        <span>Shipping</span>
                                        <span>Calculated at checkout</span>
                                    </div>
                                    <div className="h-px bg-gray-300"></div>
                                    <div className="flex justify-between text-xl font-bold text-gray-800">
                                        <span>Subtotal</span>
                                        <span>${totalPrice.toFixed(2)}</span>
                                    </div>
                                </div>
                                <button 
                                    onClick={handleProceedToCheckout}
                                    className="btn btn-action w-full"
                                >
                                    Proceed to Checkout
                                </button>
                                <button 
                                    onClick={() => window.location.hash = '#/home'}
                                    className="btn btn-secondary w-full mt-3"
                                >
                                    Continue Shopping
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}