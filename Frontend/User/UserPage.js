function UserPage() {
    const { user_id } = ReactRouterDOM.useParams();
    const { useQuery } = window.ReactQuery;
    const [activeTab, setActiveTab] = React.useState('orders');

    const { data: profile, isLoading: profileLoading, error: profileError } = useQuery(['userProfile', user_id], () => get_user_profile(user_id));
    const { data: orders, isLoading: ordersLoading, error: ordersError } = useQuery(['userOrders', user_id], () => get_user_orders(user_id));
    const { data: deliveries, isLoading: deliveriesLoading, error: deliveriesError } = useQuery(['userDeliveries', user_id], () => get_user_deliveries(user_id));
    const { data: reports, isLoading: reportsLoading, error: reportsError } = useQuery(['userReports', user_id], () => get_user_reports(user_id));
    const { data: stores, isLoading: storesLoading, error: storesError } = useQuery(['userStores', user_id], () => get_user_stores(user_id));

    if (profileLoading) return <div>Loading profile...</div>;
    if (profileError) return <div>Error loading profile: {profileError.message}</div>;

    const renderContent = () => {
        switch (activeTab) {
            case 'orders':
                return (
                    <div>
                        <h2 className="text-2xl font-bold mb-4">Orders</h2>
                        {ordersLoading && <div>Loading orders...</div>}
                        {ordersError && <div>Error loading orders: {ordersError.message}</div>}
                        {orders && orders.length > 0 ? (
                            <ul>
                                {orders.map(order => (
                                    <li key={order.id}>{order.status} - {order.created_at}</li>
                                ))}
                            </ul>
                        ) : (
                            <p>No orders found.</p>
                        )}
                    </div>
                );
            case 'deliveries':
                return (
                    <div>
                        <h2 className="text-2xl font-bold mb-4">Deliveries</h2>
                        {deliveriesLoading && <div>Loading deliveries...</div>}
                        {deliveriesError && <div>Error loading deliveries: {deliveriesError.message}</div>}
                        {deliveries && deliveries.length > 0 ? (
                            <ul>
                                {deliveries.map(delivery => (
                                    <li key={delivery.id}>{delivery.status} - {delivery.created_at}</li>
                                ))}
                            </ul>
                        ) : (
                            <p>No deliveries found.</p>
                        )}
                    </div>
                );
            case 'reports':
                return (
                    <div>
                        <h2 className="text-2xl font-bold mb-4">Reports</h2>
                        {reportsLoading && <div>Loading reports...</div>}
                        {reportsError && <div>Error loading reports: {reportsError.message}</div>}
                        {reports && reports.length > 0 ? (
                            <ul>
                                {reports.map(report => (
                                    <li key={report.id}>{report.reason}</li>
                                ))}
                            </ul>
                        ) : (
                            <p>No reports found.</p>
                        )}
                    </div>
                );
            case 'stores':
                return (
                    <div>
                        <h2 className="text-2xl font-bold mb-4">Owned Stores</h2>
                        {storesLoading && <div>Loading stores...</div>}
                        {storesError && <div>Error loading stores: {storesError.message}</div>}
                        {stores && stores.length > 0 ? (
                            <ul>
                                {stores.map(store => (
                                    <li key={store.id}>{store.name}</li>
                                ))}
                            </ul>
                        ) : (
                            <p>No stores found.</p>
                        )}
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="container mx-auto mt-10 p-4 mt-20">
            <h1 className="text-3xl font-bold mb-6">{profile?.first_name}'s Profile</h1>

            <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Details</h2>
                <p>Email: {profile?.email}</p>
                <p>Role: {profile?.role}</p>
            </div>

            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button onClick={() => setActiveTab('orders')} className={`${activeTab === 'orders' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                        Orders
                    </button>
                    <button onClick={() => setActiveTab('deliveries')} className={`${activeTab === 'deliveries' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                        Deliveries
                    </button>
                    <button onClick={() => setActiveTab('reports')} className={`${activeTab === 'reports' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                        Reports
                    </button>
                    <button onClick={() => setActiveTab('stores')} className={`${activeTab === 'stores' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                        Owned Stores
                    </button>
                </nav>
            </div>

            <div className="mt-8">
                {renderContent()}
            </div>
        </div>
    );
}
