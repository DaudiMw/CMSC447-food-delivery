const { useQuery, useMutation } = window.ReactQuery;

// Mock API functions - replace with actual API calls
const get_my_picked_up_orders = async () => { 
    console.log("Fetching picked up orders...");
    // Mock data, replace with API call
    return [
        { id: 1, customer: 'John Doe', store: 'Pizza Palace', status: 'On the way' },
        { id: 2, customer: 'Jane Smith', store: 'Burger Barn', status: 'Picking up' },
    ];
};
const get_available_orders = async () => { 
    console.log("Fetching available orders...");
    // Mock data
    return [
        { id: 3, store: 'Sushi Station', customerLocation: '123 Main St', earnings: 10.50 },
        { id: 4, store: 'Taco Town', customerLocation: '456 Oak Ave', earnings: 8.00 },
    ];
};
const get_my_past_deliveries = async () => { 
    console.log("Fetching past deliveries...");
    // Mock data
    return [
        { id: 101, customer: 'Alice Johnson', store: 'Pizza Palace', date: '2025-11-27', earnings: 9.50 },
        { id: 102, customer: 'Bob Williams', store: 'Burger Barn', date: '2025-11-26', earnings: 7.25 },
    ];
};
const accept_order = async (orderId) => {
    console.log(`Accepting order ${orderId}`);
    // Mock API call
    return { success: true };
};
const complete_delivery = async (orderId) => {
    console.log(`Completing delivery for order ${orderId}`);
    // Mock API call
    return { success: true };
};


function DasherPage() {
    const [activeTab, setActiveTab] = React.useState('picked-up-orders');
    const [searchQuery, setSearchQuery] = React.useState('');
    const [startDate, setStartDate] = React.useState('');
    const [endDate, setEndDate] = React.useState('');

    // Fetch picked-up orders
    const { data: pickedUpOrders = [], isLoading: pickedUpLoading, refetch: refetchPickedUp } = useQuery({
        queryKey: ['pickedUpOrders'],
        queryFn: () => get_picked_orders(getUserId())
    });

    // Fetch available orders
    const { data: availableOrders = [], isLoading: availableLoading, refetch: refetchAvailable } = useQuery({
        queryKey: ['availableOrders'],
        queryFn: get_pending_orders
    });

    // Fetch past deliveries
    const { data: pastDeliveries = [], isLoading: pastDeliveriesLoading, refetch: refetchPastDeliveries } = useQuery({
        queryKey: ['pastDeliveries'],
        queryFn: get_my_past_deliveries
    });
    
    // Mutation for accepting an order
    const acceptOrderMutation = useMutation({
        mutationFn: (orderId) => accept_order(orderId),
        onSuccess: () => {
            refetchAvailable();
            refetchPickedUp();
        }
    });

    // Mutation for completing a delivery
    const completeDeliveryMutation = useMutation({
        mutationFn: (orderId) => complete_delivery(orderId),
        onSuccess: () => {
            refetchPickedUp();
            refetchPastDeliveries();
        }
    });

    const handleAcceptOrder = (orderId) => {
        if (confirm('Are you sure you want to accept this order?')) {
            acceptOrderMutation.mutate(orderId);
        }
    };
    
    const handleCompleteDelivery = (orderId) => {
        if (confirm('Are you sure you want to mark this delivery as complete?')) {
            completeDeliveryMutation.mutate(orderId);
        }
    };

    if (pickedUpLoading || availableLoading || pastDeliveriesLoading) {
        return (
            <div className="flex min-h-full items-center justify-center">
                <div className="text-2xl font-semibold text-gray-600">Loading...</div>
            </div>
        );
    }
    const themeColor = '#007176';

    return (
        <div className="flex min-h-screen flex-col pt-24 px-4 md:px-10 bg-gray-50">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Dasher Dashboard</h1>
            <p className="text-gray-600 mb-4">Manage your deliveries efficiently.</p>
            <div className="mt-4 h-px w-full bg-gray-400"></div>
            
            <div className="mt-5 flex flex-col md:flex-row gap-4 items-end bg-white p-4 rounded-lg border border-gray-300">
                <div className="flex-1 w-full">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                    <input
                        type="text"
                        placeholder="Search by store, customer..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={`w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[${themeColor}] focus:border-[${themeColor}] transition-all`}
                    />
                </div>
                <div className="w-full md:w-auto">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className={`w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[${themeColor}] focus:border-[${themeColor}] transition-all`}
                    />
                </div>
                <div className="w-full md:w-auto">
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className={`w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[${themeColor}] focus:border-[${themeColor}] transition-all`}
                    />
                </div>
                <button 
                    onClick={() => { setSearchQuery(''); setStartDate(''); setEndDate(''); }}
                    className="btn btn-secondary"
                >
                    Clear
                </button>
            </div>

            <div className="mt-5 flex w-full flex-col md:flex-row gap-x-10 rounded-md p-4 border border-gray-300 bg-white">
                <div className="flex h-fit w-full md:w-1/4 flex-col gap-2 rounded-2xl shadow-lg border border-gray-200 p-2 mb-4 md:mb-0">
                    <button
                        onClick={() => setActiveTab('picked-up-orders')}
                        className={`p-3 font-semibold text-white transition-all duration-200 rounded-lg ${
                            activeTab === 'picked-up-orders' ? 'bg-[#007176]' : 'bg-gray-500 hover:bg-gray-600'
                        }`}
                    >
                        Your Picked-up Orders ({pickedUpOrders.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('available-orders')}
                        className={`p-3 font-semibold text-white transition-all duration-200 rounded-lg ${
                            activeTab === 'available-orders' ? 'bg-[#007176]' : 'bg-gray-500 hover:bg-gray-600'
                        }`}
                    >
                        Available Orders ({availableOrders.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('past-deliveries')}
                        className={`p-3 font-semibold text-white transition-all duration-200 rounded-lg ${
                            activeTab === 'past-deliveries' ? 'bg-[#007176]' : 'bg-gray-500 hover:bg-gray-600'
                        }`}
                    >
                        Past Deliveries ({pastDeliveries.length})
                    </button>
                </div>
                
                <div className="w-full md:w-3/4 flex flex-col space-y-4">
                    {activeTab === 'picked-up-orders' && (
                        <>
                            <h2 className="text-3xl font-bold text-gray-800">Your Picked-up Orders</h2>
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse min-w-[600px]">
                                    <thead>
                                        <tr className="bg-gray-100">
                                            <th className="p-3 text-left font-semibold border-b">Order ID</th>
                                            <th className="p-3 text-left font-semibold border-b">Customer</th>
                                            <th className="p-3 text-left font-semibold border-b">Status</th>
                                            <th className="p-3 text-left font-semibold border-b">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pickedUpOrders.map(order => (
                                            <tr key={order.id} className="border-b hover:bg-teal-100 transition-colors duration-200">
                                                <td className="p-3">#{order.id}</td>
                                                <td className="p-3">{order.customer}</td>
                                                <td className="p-3">{order.status}</td>
                                                <td className="p-3">
                                                    <button onClick={() => handleCompleteDelivery(order.id)} className="btn btn-success">Complete</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}

                    {activeTab === 'available-orders' && (
                        <>
                            <h2 className="text-3xl font-bold text-gray-800">Available Orders</h2>
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse min-w-[600px]">
                                    <thead>
                                        <tr className="bg-gray-100">
                                            <th className="p-3 text-left font-semibold border-b">Order ID</th>
                                            <th className="p-3 text-left font-semibold border-b">Store</th>
                                            <th className="p-3 text-left font-semibold border-b">Destination</th>
                                            <th className="p-3 text-left font-semibold border-b">Earnings</th>
                                            <th className="p-3 text-left font-semibold border-b">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {availableOrders.map(order => (
                                            <tr key={order.id} className="border-b hover:bg-teal-100 transition-colors duration-200">
                                                <td className="p-3">#{order.id}</td>
                                                <td className="p-3">{order.store}</td>
                                                <td className="p-3">{order.customerLocation}</td>
                                                <td className="p-3 font-semibold text-green-600">${order.earnings.toFixed(2)}</td>
                                                <td className="p-3">
                                                    <button onClick={() => handleAcceptOrder(order.id)} className="btn btn-action">Accept</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}

                    {activeTab === 'past-deliveries' && (
                        <>
                            <h2 className="text-3xl font-bold text-gray-800">Past Deliveries</h2>
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse min-w-[600px]">
                                    <thead>
                                        <tr className="bg-gray-100">
                                            <th className="p-3 text-left font-semibold border-b">Order ID</th>
                                            <th className="p-3 text-left font-semibold border-b">Customer</th>
                                            <th className="p-3 text-left font-semibold border-b">Store</th>
                                            <th className="p-3 text-left font-semibold border-b">Date</th>
                                            <th className="p-3 text-left font-semibold border-b">Earnings</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pastDeliveries.map(delivery => (
                                            <tr key={delivery.id} className="border-b hover:bg-teal-100 transition-colors duration-200">
                                                <td className="p-3">#{delivery.id}</td>
                                                <td className="p-3">{delivery.customer}</td>
                                                <td className="p-3">{delivery.store}</td>
                                                <td className="p-3">{delivery.date}</td>
                                                <td className="p-3 font-semibold text-green-600">${delivery.earnings.toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
