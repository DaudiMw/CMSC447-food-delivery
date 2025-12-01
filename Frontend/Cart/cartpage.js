const { useQuery, useMutation, useQueryClient } = window.ReactQuery;


{/* <div class="h-screen w-screen bg-amber-400 p-15">
  <!--- This is the inner white bg that will surround the content --->
  <div class="h-full w-full rounded-lg bg-white flex flex-col p-8 gap-4">
    <h1 class="font-bold text-6xl">Your Cart</h1>
    <div class="border"></div>
    <!--- This is the item part --->
    <div class="w-full h-32 flex flex-row bg-amber-100 rounded-md shadow gap-4 items-center">
      <div class="w-1/4 h-full bg-amber-300"></div>
      <p class="w-max h-max text-lg font-semibold">Item Name</p>
      <p class="w-max h-max text-lg font-semibold">Item Description</p>
      <p class="w-max h-max text-lg font-semibold">Price</p>
      <p class="w-max h-max text-lg font-semibold">Qty</p>
    </div>
  </div>
</div> */}


function CartPage() {
    const queryClient = useQueryClient();

    const { data: cart, isLoading, error } = useQuery({
        queryKey: ['cart'],
        queryFn: get_cart
    });

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

    const handleQuantityChange = (item_id, quantity) => {
        const q = parseInt(quantity, 10);
        // Do not update if quantity is not a number or less than 1, let the user use the remove button
        if (isNaN(q) || q < 1) return;
        updateItemMutation.mutate({ item_id, quantity: q });
    };
    
    const handleCheckout = () => {
        // To be implemented: navigate to checkout page or trigger order creation
        alert("Checkout functionality to be implemented!");
    };

    if (isLoading) return <div>Loading cart...</div>;
    if (error) return <div>Error loading cart: {error.message}</div>;

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
                        <h2 className="text-2xl font-bold">Total: ${totalPrice.toFixed(2)}</h2>
                        <button onClick={handleCheckout} className="btn btn-action mt-4">
                            Proceed to Checkout
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
