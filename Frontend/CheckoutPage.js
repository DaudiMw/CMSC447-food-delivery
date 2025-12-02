function CheckoutPage() {
    const [payment, setPayment] = React.useState({
        cardNumber: '',
        expiry: '',
        cvv: ''
    });
    const queryClient = useQueryClient();
    const location = window.ReactRouterDOM.useLocation();
    const address_id = new URLSearchParams(location.search).get('address_id');

    const { data: cart, isLoading: cartLoading } = useQuery({
        queryKey: ['cart'],
        queryFn: get_cart
    });

    const createOrderMutation = useMutation({
        mutationFn: create_order_from_cart,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cart'] });
            window.location.hash = '#/home';
        }
    });

    const handlePaymentChange = (e) => {
        setPayment({ ...payment, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        createOrderMutation.mutate({ address_id: address_id });
    };

    if (cartLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="container mt-5 pt-5">
            <h1>Checkout</h1>
            <form onSubmit={handleSubmit}>
                <div className="card mb-3">
                    <div className="card-header">Order Summary</div>
                    <ul className="list-group list-group-flush">
                        {cart && cart.items.map(item => (
                            <li key={item.id} className="list-group-item d-flex justify-content-between align-items-center">
                                {item.item.name} (x{item.quantity})
                                <span>${(item.item.price * item.quantity).toFixed(2)}</span>
                            </li>
                        ))}
                        <li className="list-group-item d-flex justify-content-between align-items-center fw-bold">
                            Total
                            <span>${cart && cart.items.reduce((acc, item) => acc + item.item.price * item.quantity, 0).toFixed(2)}</span>
                        </li>
                    </ul>
                </div>
                <div className="card mb-3">
                    <div className="card-header">Payment Information</div>
                    <div className="card-body">
                        <div className="mb-3">
                            <label className="form-label">Card Number</label>
                            <input type="text" name="cardNumber" className="form-control" value={payment.cardNumber} onChange={handlePaymentChange} required />
                        </div>
                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label className="form-label">Expiration Date (MM/YY)</label>
                                <input type="text" name="expiry" className="form-control" value={payment.expiry} onChange={handlePaymentChange} required />
                            </div>
                            <div className="col-md-6 mb-3">
                                <label className="form-label">CVV</label>
                                <input type="text" name="cvv" className="form-control" value={payment.cvv} onChange={handlePaymentChange} required />
                            </div>
                        </div>
                    </div>
                </div>

                <button type="submit" className="btn btn-primary" disabled={createOrderMutation.isPending}>
                    {createOrderMutation.isPending ? 'Placing Order...' : 'Place Order'}
                </button>
            </form>
        </div>
    );
}
