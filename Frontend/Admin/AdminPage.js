const { useQuery, useMutation, useQueryClient, QueryClient, QueryClientProvider } = window.ReactQuery;
const { Suspense } = React;
const { useSuspenseQuery } = window.ReactQuery;


function AdminPage() {
    const [activeTab, setActiveTab] = React.useState('users');
    const [searchQuery, setSearchQuery] = React.useState('');
    const [startDate, setStartDate] = React.useState('');
    const [endDate, setEndDate] = React.useState('');
    const [selectedUser, setSelectedUser] = React.useState(null);
    const [showUserDetails, setShowUserDetails] = React.useState(false);

    // Fetch users with React Query
    const { data: users = [], isLoading: usersLoading, error: usersError, refetch: refetchUsers } = window.ReactQuery.useQuery({
        queryKey: ['users'],
        queryFn: get_all_users
    });

    // Fetch dasher applications
    const { data: dasherApplications = [], isLoading: dasherApplicationsLoading, error: dasherApplicationsError, Pending: dasherApplicationsPending, refetch: refetchApplications} = useQuery({
        queryKey: ['dasherApplications'],
        queryFn: get_dasher_applications
    });

    // Fetch orders
    const { data: orders = [], isLoading: ordersLoading, refetch: refetchOrders } = window.ReactQuery.useQuery({
        queryKey: ['orders'],
        queryFn: get_all_orders
    });

    // Fetch dasher deliveries
    const { data: dasherDeliveries = [], isLoading: deliveriesLoading, refetch: refetchDeliveries } = window.ReactQuery.useQuery({
        queryKey: ['dasher-deliveries'],
        queryFn: get_dasher_deliveries
    });

    // Fetch all stores
    const { data: stores = [], isLoading: storesLoading, refetch: refetchStores } = window.ReactQuery.useQuery({
        queryKey: ['stores'],
        queryFn: get_stores
    })

    // Mutation for deleting a store
    const deleteStoreMutation = window.ReactQuery.useMutation({
        mutationFn: (storeId) => delete_store(storeId),
        onSuccess: () => {
            refetchStores(); // Refresh the stores list
        }
    });

    // Mutation for changing user role
    const changeRoleMutation = window.ReactQuery.useMutation({
        mutationFn: ({ userId, newRole }) => change_user_role(userId, newRole),
        onSuccess: () => {
            refetchUsers(); // Refresh the users list
        }
    });

    // Mutation for banning/unbanning user
    const banUserMutation = window.ReactQuery.useMutation({
        mutationFn: ({ userId, status }) => ban_user(userId, status),
        onSuccess: () => {
            refetchUsers();
        }
    });

    // Mutation for handling dasher applications
    const handleApplicationMutation = window.ReactQuery.useMutation({
        mutationFn: ({ appId, action }) => handle_dasher_application(appId, action),
        onSuccess: () => {
            refetchApplications();
            refetchUsers(); // Refresh users if approved
        }
    });

    // Updated functions to use mutations
    const changeRole = (userId, newRole) => {
        if (confirm(`Change user role to ${newRole}?`)) {
            changeRoleMutation.mutate({ userId, newRole });
        }
    };

    const banUser = (userId) => {
        const user = users.find(u => u.id === userId);
        const newStatus = user.status === 'active' ? 'banned' : 'active';
        if (confirm(`${newStatus === 'banned' ? 'Ban' : 'Unban'} this user?`)) {
            banUserMutation.mutate({ userId, status: newStatus });
        }
    };

    const handleDasherApplication = (appId, action) => {
        if (confirm(`${action === 'approve' ? 'Approve' : 'Reject'} this application?`)) {
            handleApplicationMutation.mutate({ appId, action });
        }
    };

    // Show loading state
    if (usersLoading || dasherApplicationsLoading || dasherApplicationsPending || ordersLoading || deliveriesLoading) {
        return (
            <div className="flex min-h-full items-center justify-center">
                <div className="text-2xl font-semibold text-gray-600">Loading...</div>
            </div>
        );
    }

    // Show error state
    if (usersError) {
        return (
            <div className="flex min-h-full items-center justify-center">
                <div className="text-2xl font-semibold text-red-600">Error loading data: {usersError.message}</div>
            </div>
        );
    }

    const viewUserDetails = (user) => {
        setSelectedUser(user);
        setShowUserDetails(true);
    };

    const filteredUsers = users.filter(user => 
        user.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredOrders = orders.filter(order => {
        const matchesSearch = searchQuery === '' || 
            // order.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.store.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesDate = (!startDate || order.date >= startDate) && 
                           (!endDate || order.date <= endDate);
        
        return matchesSearch && matchesDate;
    });

    const filteredDeliveries = dasherDeliveries.filter(delivery => {
        const matchesSearch = searchQuery === '' || 
            delivery.dasherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            delivery.customer.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesDate = (!startDate || delivery.deliveryDate >= startDate) && 
                           (!endDate || delivery.deliveryDate <= endDate);
        
        return matchesSearch && matchesDate;
    });

    const filteredStores = stores.filter(store => {
        const matchesSearch = searchQuery === '' || 
            store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            store.description.toLowerCase().includes(searchQuery.toLowerCase());
        
        return matchesSearch;
    })

    return (
        <div className="flex min-h-screen flex-col pt-24 px-4 md:px-10 bg-gray-50">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
            <p className="text-gray-600 mb-4">Manage users, orders, and dasher applications</p>
            <div className="mt-4 h-px w-full bg-gray-400"></div>
            
            {/* Search and Date Filters */}
            <div className="mt-5 flex flex-col md:flex-row gap-4 items-end bg-white p-4 rounded-lg border border-gray-300">
                <div className="flex-1 w-full">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                    <input
                        type="text"
                        placeholder="Search by name, email, store..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fdb515] focus:border-[#fdb515] transition-all"
                    />
                </div>
                <div class="w-full md:w-auto">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fdb515] focus:border-[#fdb515] transition-all"
                    />
                </div>
                <div class="w-full md:w-auto">
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fdb515] focus:border-[#fdb515] transition-all"
                    />
                </div>
                <button 
                    onClick={() => { setSearchQuery(''); setStartDate(''); setEndDate(''); }}
                    className="w-full md:w-auto px-4 py-2 bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-600 transition-all"
                >
                    Clear
                </button>
            </div>

            {/* Tabs */}
            <div className="mt-5 flex w-full flex-col md:flex-row gap-x-10 rounded-md p-4 border border-gray-300 bg-white">
                <div className="flex h-fit w-full md:w-1/4 flex-col gap-2 rounded-2xl shadow-lg border border-gray-200 p-2 mb-4 md:mb-0">
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`p-3 font-semibold text-black transition-all duration-200 rounded-lg ${
                            activeTab === 'users' ? 'bg-[#fdb515]' : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                    >
                        Users ({users.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('orders')}
                        className={`p-3 font-semibold text-black transition-all duration-200 rounded-lg ${
                            activeTab === 'orders' ? 'bg-[#fdb515]' : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                    >
                        Orders ({orders.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('applications')}
                        className={`p-3 font-semibold text-black transition-all duration-200 rounded-lg ${
                            activeTab === 'applications' ? 'bg-[#fdb515]' : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                    >
                        Dasher Apps ({dasherApplications.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('deliveries')}
                        className={`p-3 font-semibold text-black transition-all duration-200 rounded-lg ${
                            activeTab === 'deliveries' ? 'bg-[#fdb515]' : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                    >
                        Dasher Deliveries
                    </button>
                    <button
                        onClick={() => setActiveTab('stores')}
                        className={`p-3 font-semibold text-black transition-all duration-200 rounded-lg ${
                            activeTab === 'stores' ? 'bg-[#fdb515]' : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                    >
                        Stores
                    </button>
                </div>
                
                <div className="w-full md:w-3/4 flex flex-col space-y-4">
                    {/* Users Tab */}
                    {activeTab === 'users' && (
                        <>
                            <h2 className="text-3xl font-bold text-gray-800">User Management</h2>
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse min-w-[600px]">
                                    <thead>
                                        <tr className="bg-gray-100">
                                            <th className="p-3 text-left font-semibold border-b">Name</th>
                                            <th className="p-3 text-left font-semibold border-b">Email</th>
                                            <th className="p-3 text-left font-semibold border-b">Role</th>
                                            <th className="p-3 text-left font-semibold border-b">Status</th>
                                            <th className="p-3 text-left font-semibold border-b">Orders</th>
                                            <th className="p-3 text-left font-semibold border-b">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredUsers.map(user => (
                                            <tr key={user.id} className="border-b hover:bg-amber-100 transition-colors duration-200">
                                                <td className="p-3">{user.first_name + ' ' + user.last_name}</td>
                                                <td className="p-3">{user.email}</td>
                                                <td className="p-3">
                                                    <select 
                                                        value={user.role}
                                                        onChange={(e) => changeRole(user.id, e.target.value)}
                                                        className="px-2 py-1 border rounded"
                                                    >
                                                        <option value="user">User</option>
                                                        <option value="dasher">Dasher</option>
                                                        <option value="admin">Admin</option>
                                                    </select>
                                                </td>
                                                <td className="p-3">
                                                    <span className={`px-2 py-1 rounded text-sm ${
                                                        user.status !== 'is_banned' 
                                                            ? 'bg-green-100 text-green-800' 
                                                            : 'bg-red-100 text-red-800'
                                                    }`}>
                                                        {user.is_banned ? 'Banned' : 'Active'}
                                                    </span>
                                                </td>
                                                <td className="p-3">{user.orders}</td>
                                                <td className="p-3 flex gap-2">
                                                    <button 
                                                        onClick={() => viewUserDetails(user)}
                                                        className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                                                    >
                                                        View
                                                    </button>
                                                    <button 
                                                        onClick={() => banUser(user.id)}
                                                        className={`px-3 py-1 text-white text-sm rounded ${
                                                            user.status !== 'is_banned' 
                                                                ? 'bg-red-500 hover:bg-red-600' 
                                                                : 'bg-green-500 hover:bg-green-600'
                                                        }`}
                                                    >
                                                        {user.status === 'is_banned' ? 'Ban' : 'Unban'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}

                    {/* Orders Tab */}
                    {activeTab === 'orders' && (
                        <>
                            <h2 className="text-3xl font-bold text-gray-800">Order Reports</h2>
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse min-w-[600px]">
                                    <thead>
                                        <tr className="bg-gray-100">
                                            <th className="p-3 text-left font-semibold border-b">Order ID</th>
                                            <th className="p-3 text-left font-semibold border-b">Customer</th>
                                            <th className="p-3 text-left font-semibold border-b">Store</th>
                                            <th className="p-3 text-left font-semibold border-b">Total</th>
                                            <th className="p-3 text-left font-semibold border-b">Date</th>
                                            <th className="p-3 text-left font-semibold border-b">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredOrders.map(order => (
                                            <tr key={order.id} className="border-b hover:bg-amber-100 transition-colors duration-200">
                                                <td className="p-3">#{order.id}</td>
                                                <td className="p-3">{order.userName}</td>
                                                <td className="p-3">{order.store}</td>
                                                <td className="p-3">${order.total.toFixed(2)}</td>
                                                <td className="p-3">{order.date}</td>
                                                <td className="p-3">
                                                    <span className={`px-2 py-1 rounded text-sm ${
                                                        order.status === 'completed' 
                                                            ? 'bg-green-100 text-green-800' 
                                                            : 'bg-red-100 text-red-800'
                                                    }`}>
                                                        {order.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                                <h3 className="font-semibold text-gray-800 mb-2">Summary</h3>
                                <p className="text-gray-600">Total Orders: {filteredOrders.length}</p>
                                <p className="text-gray-600">Total Revenue: ${filteredOrders.reduce((sum, o) => sum + o.total, 0).toFixed(2)}</p>
                            </div>
                        </>
                    )}

                    {/* Dasher Applications Tab */}
                    {activeTab === 'applications' && (
                        <>
                            <h2 className="text-3xl font-bold text-gray-800">Dasher Applications</h2>
                            <div className="space-y-4">
                                {dasherApplicationsPending ? (
                                    <div className="flex min-h-full items-center justify-center pt-20">
                                        <div className="text-2xl font-semibold text-gray-600">Loading...</div>
                                    </div>
                                ) : (
                                    dasherApplications.length > 0 &&
                                    dasherApplications.map(app => (
                                    <div key={app.id} className="p-4 border border-gray-300 rounded-lg bg-white">
                                        <div className="flex flex-col md:flex-row justify-between items-start">
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-lg">{app.user.first_name + ' ' + app.user.last_name}</h3>
                                                <p className="text-sm text-gray-600">{app.user.email}</p>
                                                <p className="text-sm text-gray-500 mt-1">Applied: {app.date_applied}</p>
                                                
                                                {/* Application Content */}
                                                <div className="mt-3 p-3 bg-gray-50 rounded border border-gray-200">
                                                    <p className="text-sm font-semibold text-gray-700 mb-1">Application Content:</p>
                                                    <p className="text-sm text-gray-800 whitespace-pre-wrap">{app.content}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2 ml-0 md:ml-4 mt-4 md:mt-0">
                                                <button 
                                                    onClick={() => handleDasherApplication(app.id, 'approve')}
                                                    className="px-4 py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-all"
                                                >
                                                    Approve
                                                </button>
                                                <button 
                                                    onClick={() => handleDasherApplication(app.id, 'reject')}
                                                    className="px-4 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-all"
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )))}
                            </div>
                        </>
                    )}

                    {/* Dasher Deliveries Tab */}
                    {activeTab === 'deliveries' && (
                        <>
                            <h2 className="text-3xl font-bold text-gray-800">Dasher Deliveries</h2>
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse min-w-[600px]">
                                    <thead>
                                        <tr className="bg-gray-100">
                                            <th className="p-3 text-left font-semibold border-b">Dasher</th>
                                            <th className="p-3 text-left font-semibold border-b">Order ID</th>
                                            <th className="p-3 text-left font-semibold border-b">Customer</th>
                                            <th className="p-3 text-left font-semibold border-b">Store</th>
                                            <th className="p-3 text-left font-semibold border-b">Date</th>
                                            <th className="p-3 text-left font-semibold border-b">Earnings</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredDeliveries.map(delivery => (
                                            <tr key={delivery.id} className="border-b hover:bg-amber-100 transition-colors duration-200">
                                                <td className="p-3">{delivery.dasherName}</td>
                                                <td className="p-3">#{delivery.orderId}</td>
                                                <td className="p-3">{delivery.customer}</td>
                                                <td className="p-3">{delivery.store}</td>
                                                <td className="p-3">{delivery.deliveryDate}</td>
                                                <td className="p-3 font-semibold text-green-600">${delivery.earnings.toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                                <h3 className="font-semibold text-gray-800 mb-2">Summary</h3>
                                <p className="text-gray-600">Total Deliveries: {filteredDeliveries.length}</p>
                                <p className="text-gray-600">Total Earnings: ${filteredDeliveries.reduce((sum, d) => sum + d.earnings, 0).toFixed(2)}</p>
                            </div>
                        </>
                    )}

                    {/* Stores Tab */}
                    {activeTab === 'stores' && (
                        <>
                            <div className="flex justify-between items-center">
                                <h2 className="text-3xl font-bold text-gray-800">Store Management</h2>
                                <button
                                    onClick={() => window.location.hash = '#/stores/create'}
                                    className="px-4 py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-all"
                                >
                                    Create Store
                                </button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse min-w-[600px]">
                                    <thead>
                                        <tr className="bg-gray-100">
                                            <th className="p-3 text-left font-semibold border-b">Name</th>
                                            <th className="p-3 text-left font-semibold border-b">Description</th>
                                            <th className="p-3 text-left font-semibold border-b">Created At</th>
                                            <th className="p-3 text-left font-semibold border-b">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredStores.map(store => (
                                            <tr key={store.id} className="border-b hover:bg-amber-100 transition-colors duration-200">
                                                <td className="p-3">{store.name}</td>
                                                <td className="p-3">{store.description}</td>
                                                <td className="p-3">{new Date(store.created_at).toLocaleDateString()}</td>
                                                <td className="p-3 flex gap-2">
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); window.location.hash = `#/store/${store.id}`; }}
                                                        className="px-3 py-1 bg-yellow-500 text-white text-sm rounded hover:bg-yellow-600 transition-all"
                                                    >
                                                        View
                                                    </button>
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); window.location.hash = `#/store/${store.id}/edit`; }}
                                                        className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition-all"
                                                    >
                                                        Update
                                                    </button>
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); if (confirm('Are you sure you want to delete this store?')) deleteStoreMutation.mutate(store.id); }}
                                                        className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-all"
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* User Details Modal */}
            {showUserDetails && selectedUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowUserDetails(false)}>
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-2xl font-bold">{selectedUser.name}</h3>
                            <button onClick={() => setShowUserDetails(false)} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
                        </div>
                        <div className="space-y-3">
                            <p><span className="font-semibold">Email:</span> {selectedUser.email}</p>
                            <p><span className="font-semibold">Role:</span> {selectedUser.role}</p>
                            <p><span className="font-semibold">Status:</span> {selectedUser.status}</p>
                            <p><span className="font-semibold">Join Date:</span> {selectedUser.joinDate}</p>
                            <p><span className="font-semibold">Total Orders:</span> {selectedUser.orders}</p>
                            
                            <h4 className="font-semibold text-lg mt-4 mb-2">Order History</h4>
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                {orders.filter(o => o.userId === selectedUser.id).map(order => (
                                    <div key={order.id} className="p-3 bg-gray-50 rounded border">
                                        <p className="font-medium">{order.store} - ${order.total.toFixed(2)}</p>
                                        <p className="text-sm text-gray-600">{order.date} - {order.status}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}