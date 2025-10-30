function SettingsPage() {
    const [activeTab, setActiveTab] = React.useState('profile');
    const [addresses, setAddresses] = React.useState([
        { id: 1, label: 'Home', address: '1000 Hilltop Circle, Baltimore, MD 21250' },
        { id: 2, label: 'Dorm', address: 'Walker Hall Room 302, UMBC Campus' }
    ]);
    const [paymentMethods, setPaymentMethods] = React.useState([
        { id: 1, type: 'Visa', last4: '4242', expiry: '12/25' },
        { id: 2, type: 'Mastercard', last4: '8888', expiry: '06/26' }
    ]);
    const [showOnlyOpenStores, setShowOnlyOpenStores] = React.useState(true);
    const [showAddAddress, setShowAddAddress] = React.useState(false);
    const [showAddPayment, setShowAddPayment] = React.useState(false);
    const [showChangeEmail, setShowChangeEmail] = React.useState(false);
    const [showChangePassword, setShowChangePassword] = React.useState(false);

    const deleteAddress = (id) => {
        if (confirm('Are you sure you want to delete this address?')) {
            setAddresses(addresses.filter(addr => addr.id !== id));
        }
    };

    const deletePayment = (id) => {
        if (confirm('Are you sure you want to delete this payment method?')) {
            setPaymentMethods(paymentMethods.filter(pm => pm.id !== id));
        }
    };

    const deleteAccount = () => {
        if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            // Handle account deletion
            alert('Account deletion functionality would go here');
        }
    };

    const applyToDasher = () => {
        alert('Dasher application functionality would go here');
    };

    return (
        <div className="flex min-h-full flex-col p-10 bg-gray-50 pt-20">
            <h1 className="text-4xl font-bold text-gray-800">Settings</h1>
            <div className="mt-4 h-px w-full bg-gray-400"></div>
            <div className="mt-5 flex w-full flex-row gap-x-10 rounded-md p-4 border border-gray-300 bg-white">
                <div className="flex h-fit w-1/4 flex-col gap-2 rounded-2xl shadow-lg border border-gray-200 p-2">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`p-3 font-semibold text-black transition-all duration-200 rounded-lg ${
                            activeTab === 'profile' 
                                ? 'bg-[#fdb515]' 
                                : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                    >
                        Profile
                    </button>
                    <button
                        onClick={() => setActiveTab('general')}
                        className={`p-3 font-semibold text-black transition-all duration-200 rounded-lg ${
                            activeTab === 'general' 
                                ? 'bg-[#fdb515]' 
                                : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                    >
                        General
                    </button>
                </div>
                
                <div className="w-3/4 flex flex-col space-y-6">
                    {activeTab === 'profile' && (
                        <>
                            <h2 className="text-3xl font-bold text-gray-800">Profile Settings</h2>
                            
                            {/* Change Email Section */}
                            <div className="p-4 border border-gray-300 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-semibold text-gray-800">Email Address</h3>
                                    <button 
                                        onClick={() => setShowChangeEmail(!showChangeEmail)}
                                        className="text-sm text-[#fdb515] hover:underline"
                                    >
                                        {showChangeEmail ? 'Cancel' : 'Change Email'}
                                    </button>
                                </div>
                                {showChangeEmail ? (
                                    <div className="space-y-3 mt-3">
                                        <input
                                            type="email"
                                            placeholder="New email address"
                                            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fdb515] focus:border-[#fdb515] transition-all"
                                        />
                                        <input
                                            type="password"
                                            placeholder="Current password"
                                            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fdb515] focus:border-[#fdb515] transition-all"
                                        />
                                        <button className="px-4 py-2 bg-[#fdb515] text-black font-semibold rounded-lg hover:bg-[#e5a313] transition-all">
                                            Update Email
                                        </button>
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-600">user@umbc.edu</p>
                                )}
                            </div>

                            {/* Change Password Section */}
                            <div className="p-4 border border-gray-300 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-semibold text-gray-800">Password</h3>
                                    <button 
                                        onClick={() => setShowChangePassword(!showChangePassword)}
                                        className="text-sm text-[#fdb515] hover:underline"
                                    >
                                        {showChangePassword ? 'Cancel' : 'Change Password'}
                                    </button>
                                </div>
                                {showChangePassword ? (
                                    <div className="space-y-3 mt-3">
                                        <input
                                            type="password"
                                            placeholder="Current password"
                                            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fdb515] focus:border-[#fdb515] transition-all"
                                        />
                                        <input
                                            type="password"
                                            placeholder="New password"
                                            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fdb515] focus:border-[#fdb515] transition-all"
                                        />
                                        <input
                                            type="password"
                                            placeholder="Confirm new password"
                                            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fdb515] focus:border-[#fdb515] transition-all"
                                        />
                                        <button className="px-4 py-2 bg-[#fdb515] text-black font-semibold rounded-lg hover:bg-[#e5a313] transition-all">
                                            Update Password
                                        </button>
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-600">••••••••</p>
                                )}
                            </div>

                            {/* Addresses Section */}
                            <div className="p-4 border border-gray-300 rounded-lg">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-semibold text-gray-800">Delivery Addresses</h3>
                                    <button 
                                        onClick={() => setShowAddAddress(!showAddAddress)}
                                        className="px-3 py-1 bg-[#fdb515] text-black text-sm font-semibold rounded-lg hover:bg-[#e5a313] transition-all"
                                    >
                                        {showAddAddress ? 'Cancel' : '+ Add Address'}
                                    </button>
                                </div>
                                
                                {showAddAddress && (
                                    <div className="mb-4 p-3 bg-gray-50 rounded-lg space-y-2">
                                        <input
                                            type="text"
                                            placeholder="Label (e.g., Home, Dorm)"
                                            className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fdb515] focus:border-[#fdb515] transition-all"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Full address"
                                            className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fdb515] focus:border-[#fdb515] transition-all"
                                        />
                                        <button className="px-3 py-1 bg-green-500 text-white text-sm font-semibold rounded-lg hover:bg-green-600 transition-all">
                                            Save Address
                                        </button>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    {addresses.map(addr => (
                                        <div key={addr.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div>
                                                <p className="font-medium text-gray-800">{addr.label}</p>
                                                <p className="text-sm text-gray-600">{addr.address}</p>
                                            </div>
                                            <button 
                                                onClick={() => deleteAddress(addr.id)}
                                                className="px-3 py-1 bg-red-500 text-white text-sm font-semibold rounded-lg hover:bg-red-600 transition-all"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Payment Methods Section */}
                            <div className="p-4 border border-gray-300 rounded-lg">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-semibold text-gray-800">Payment Methods</h3>
                                    <button 
                                        onClick={() => setShowAddPayment(!showAddPayment)}
                                        className="px-3 py-1 bg-[#fdb515] text-black text-sm font-semibold rounded-lg hover:bg-[#e5a313] transition-all"
                                    >
                                        {showAddPayment ? 'Cancel' : '+ Add Payment'}
                                    </button>
                                </div>
                                
                                {showAddPayment && (
                                    <div className="mb-4 p-3 bg-gray-50 rounded-lg space-y-2">
                                        <input
                                            type="text"
                                            placeholder="Card number"
                                            maxLength="16"
                                            className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fdb515] focus:border-[#fdb515] transition-all"
                                        />
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                placeholder="MM/YY"
                                                maxLength="5"
                                                className="w-1/2 px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fdb515] focus:border-[#fdb515] transition-all"
                                            />
                                            <input
                                                type="text"
                                                placeholder="CVV"
                                                maxLength="3"
                                                className="w-1/2 px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fdb515] focus:border-[#fdb515] transition-all"
                                            />
                                        </div>
                                        <button className="px-3 py-1 bg-green-500 text-white text-sm font-semibold rounded-lg hover:bg-green-600 transition-all">
                                            Save Card
                                        </button>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    {paymentMethods.map(pm => (
                                        <div key={pm.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div>
                                                <p className="font-medium text-gray-800">{pm.type} •••• {pm.last4}</p>
                                                <p className="text-sm text-gray-600">Expires {pm.expiry}</p>
                                            </div>
                                            <button 
                                                onClick={() => deletePayment(pm.id)}
                                                className="px-3 py-1 bg-red-500 text-white text-sm font-semibold rounded-lg hover:bg-red-600 transition-all"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Apply to be a Dasher */}
                            <div className="p-4 border-2 border-[#fdb515] rounded-lg bg-orange-50">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-semibold text-gray-800">Become a Dasher</h3>
                                        <p className="text-sm text-gray-600">Earn money by delivering orders on campus</p>
                                    </div>
                                    <button 
                                        onClick={applyToDasher}
                                        className="px-4 py-2 bg-[#fdb515] text-black font-semibold rounded-lg hover:bg-[#e5a313] transition-all"
                                    >
                                        Apply Now
                                    </button>
                                </div>
                            </div>

                            {/* Delete Account */}
                            <div className="p-4 border-2 border-red-300 rounded-lg bg-red-50">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-semibold text-red-800">Delete Account</h3>
                                        <p className="text-sm text-red-600">Permanently delete your account and all data</p>
                                    </div>
                                    <button 
                                        onClick={deleteAccount}
                                        className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-all"
                                    >
                                        Delete Account
                                    </button>
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'general' && (
                        <>
                            <h2 className="text-3xl font-bold text-gray-800">General Settings</h2>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 border border-gray-300 rounded-lg">
                                    <div>
                                        <h3 className="font-semibold text-gray-800">Show Only Open Stores</h3>
                                        <p className="text-sm text-gray-600">Hide stores that are currently closed</p>
                                    </div>
                                    <label className="relative inline-block w-12 h-6 cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            className="sr-only peer" 
                                            checked={showOnlyOpenStores}
                                            onChange={(e) => setShowOnlyOpenStores(e.target.checked)}
                                        />
                                        <div className="w-12 h-6 bg-gray-300 rounded-full peer-checked:bg-[#fdb515] transition-colors"></div>
                                        <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-6"></div>
                                    </label>
                                </div>

                                <div className="flex items-center justify-between p-4 border border-gray-300 rounded-lg">
                                    <div>
                                        <h3 className="font-semibold text-gray-800">Notifications</h3>
                                        <p className="text-sm text-gray-600">Receive order status updates</p>
                                    </div>
                                    <label className="relative inline-block w-12 h-6 cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" defaultChecked />
                                        <div className="w-12 h-6 bg-gray-300 rounded-full peer-checked:bg-[#fdb515] transition-colors"></div>
                                        <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-6"></div>
                                    </label>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
  }