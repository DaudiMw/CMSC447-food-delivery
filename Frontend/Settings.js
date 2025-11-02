// Import React Query from CDN
const { useQuery, useMutation, useQueryClient, QueryClient, QueryClientProvider } = window.ReactQuery;


// Mock API functions (replace with real API calls)
const api = {
  getAddresses: async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return [
      { id: 1, label: 'Home', address: '1000 Hilltop Circle, Baltimore, MD 21250' },
      { id: 2, label: 'Dorm', address: 'Walker Hall Room 302, UMBC Campus' }
    ];
  },
  addAddress: async (address) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return { id: Date.now(), ...address };
  },
  deleteAddress: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return { id };
  },
  getPaymentMethods: async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return [
      { id: 1, type: 'Visa', last4: '4242', expiry: '12/25' },
      { id: 2, type: 'Mastercard', last4: '8888', expiry: '06/26' }
    ];
  },
  addPaymentMethod: async (method) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return { id: Date.now(), ...method };
  },
  deletePaymentMethod: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return { id };
  },
  getSettings: async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return {
      showOnlyOpenStores: true,
      notifications: true
    };
  },
  updateSettings: async (settings) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return settings;
  },
  applyToDasher: async (application) => {
    try {
        console.log('payload:', application);
        
        const response = await fetch(`http://localhost:8000/users/${application.user_id}/dasher-application`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            },
            body: JSON.stringify(application)
        });
        
        return response.json();
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
  }  
};




// Settings Page Component
function SettingsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = React.useState('profile');
  const [showAddAddress, setShowAddAddress] = React.useState(false);
  const [showAddPayment, setShowAddPayment] = React.useState(false);
  const [showChangeEmail, setShowChangeEmail] = React.useState(false);
  const [showChangePassword, setShowChangePassword] = React.useState(false);
  const [dasherReasoning, setDasherReasoning] = React.useState('');
  const [showDasherForm, setShowDasherForm] = React.useState(false);
  
  // Form state
  const [addressForm, setAddressForm] = React.useState({
    label: '', street: '', city: '', state: '', zip: ''
  });
  const [paymentForm, setPaymentForm] = React.useState({
    cardNumber: '', expiry: '', cvv: ''
  });

  // Queries
  const { data: addresses = [], isLoading: addressesLoading } = useQuery({
    queryKey: ['addresses'],
    queryFn: api.getAddresses
  });

  const { data: paymentMethods = [], isLoading: paymentsLoading } = useQuery({
    queryKey: ['paymentMethods'],
    queryFn: api.getPaymentMethods
  });

  const { data: settings = {}, isLoading: settingsLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: api.getSettings
  });

  // Mutations for addresses
  const addAddressMutation = useMutation({
    mutationFn: api.addAddress,
    onSuccess: (newAddress) => {
      queryClient.setQueryData(['addresses'], (old = []) => [...old, newAddress]);
      setShowAddAddress(false);
      setAddressForm({ label: '', street: '', city: '', state: '', zip: '' });
    }
  });

  const deleteAddressMutation = useMutation({
    mutationFn: api.deleteAddress,
    onSuccess: (_, deletedId) => {
      queryClient.setQueryData(['addresses'], (old = []) => 
        old.filter(addr => addr.id !== deletedId)
      );
    }
  });

  // Mutations for payment methods
  const addPaymentMutation = useMutation({
    mutationFn: api.addPaymentMethod,
    onSuccess: (newMethod) => {
      queryClient.setQueryData(['paymentMethods'], (old = []) => [...old, newMethod]);
      setShowAddPayment(false);
      setPaymentForm({ cardNumber: '', expiry: '', cvv: '' });
    }
  });

  const deletePaymentMutation = useMutation({
    mutationFn: api.deletePaymentMethod,
    onSuccess: (_, deletedId) => {
      queryClient.setQueryData(['paymentMethods'], (old = []) => 
        old.filter(pm => pm.id !== deletedId)
      );
    }
  });

  // Mutation for settings
  const updateSettingsMutation = useMutation({
    mutationFn: api.updateSettings,
    onSuccess: (updatedSettings) => {
      queryClient.setQueryData(['settings'], updatedSettings);
    }
  });

  const deleteAddress = (id) => {
    if (confirm('Are you sure you want to delete this address?')) {
      deleteAddressMutation.mutate(id);
    }
  };

  const deletePayment = (id) => {
    if (confirm('Are you sure you want to delete this payment method?')) {
      deletePaymentMutation.mutate(id);
    }
  };

  const deleteAccount = () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      alert('Account deletion functionality would go here');
    }
  };


  const handleAddAddress = () => {
    if (addressForm.label && addressForm.street && addressForm.city && addressForm.state && addressForm.zip) {
      addAddressMutation.mutate({
        label: addressForm.label,
        address: `${addressForm.street}, ${addressForm.city}, ${addressForm.state} ${addressForm.zip}`
      });
    }
  };

  const handleAddPayment = () => {
    if (paymentForm.cardNumber && paymentForm.expiry && paymentForm.cvv) {
      const [month, year] = paymentForm.expiry.split('/');
      addPaymentMutation.mutate({
        type: paymentForm.cardNumber.startsWith('4') ? 'Visa' : 'Mastercard',
        last4: paymentForm.cardNumber.slice(-4),
        expiry: `${month}/${year}`
      });
    }
  };

  // Add this mutation with your other mutations:
  const applyToDasherMutation = useMutation({
    mutationFn: api.applyToDasher,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dasherApplications'] });
      alert('Your application has been submitted!');
      setDasherReasoning('');
      setShowDasherForm(false);
    },
    onError: (error) => {
      alert('Failed to submit application. Please try again.');
      console.error('Application error:', error);
    }
  });

  // Add this handler function:
  const handleDasherApplication = () => {
    if (!dasherReasoning.trim()) {
      alert('Please provide your reasoning for wanting to become a Dasher');
      return;
    }
    
    // Replace 'user123' with actual user ID from your auth context/state
    applyToDasherMutation.mutate({
      user_id: String(getUserId()), // TODO: Get from auth context
      content: dasherReasoning
    });
  };


  const toggleSetting = (key, value) => {
    updateSettingsMutation.mutate({ ...settings, [key]: value });
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
                  <div className="mb-4 p-4 bg-gray-50 rounded-lg space-y-3">
                    <input
                      type="text"
                      value={addressForm.label}
                      onChange={(e) => setAddressForm({...addressForm, label: e.target.value})}
                      placeholder="Label (e.g., Home, Dorm)"
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fdb515] focus:border-[#fdb515] transition-all"
                    />
                    <input
                      type="text"
                      value={addressForm.street}
                      onChange={(e) => setAddressForm({...addressForm, street: e.target.value})}
                      placeholder="Street Address"
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fdb515] focus:border-[#fdb515] transition-all"
                    />
                    <input
                      type="text"
                      value={addressForm.city}
                      onChange={(e) => setAddressForm({...addressForm, city: e.target.value})}
                      placeholder="City"
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fdb515] focus:border-[#fdb515] transition-all"
                    />
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={addressForm.state}
                        onChange={(e) => setAddressForm({...addressForm, state: e.target.value})}
                        placeholder="State"
                        maxLength="2"
                        className="w-1/3 px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fdb515] focus:border-[#fdb515] transition-all"
                      />
                      <input
                        type="text"
                        value={addressForm.zip}
                        onChange={(e) => setAddressForm({...addressForm, zip: e.target.value})}
                        placeholder="ZIP Code"
                        maxLength="5"
                        className="w-2/3 px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fdb515] focus:border-[#fdb515] transition-all"
                      />
                    </div>
                    <button 
                      onClick={handleAddAddress}
                      disabled={addAddressMutation.isPending}
                      className="w-full px-3 py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-all disabled:opacity-50"
                    >
                      {addAddressMutation.isPending ? 'Saving...' : 'Save Address'}
                    </button>
                  </div>
                )}

                {addressesLoading ? (
                  <div className="text-center py-4 text-gray-600">Loading addresses...</div>
                ) : (
                  <div className="space-y-2">
                    {addresses.map(addr => (
                      <div key={addr.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-800">{addr.label}</p>
                          <p className="text-sm text-gray-600">{addr.address}</p>
                        </div>
                        <button 
                          onClick={() => deleteAddress(addr.id)}
                          disabled={deleteAddressMutation.isPending}
                          className="px-3 py-1 bg-red-500 text-white text-sm font-semibold rounded-lg hover:bg-red-600 transition-all disabled:opacity-50"
                        >
                          {deleteAddressMutation.isPending ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
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
                      value={paymentForm.cardNumber}
                      onChange={(e) => setPaymentForm({...paymentForm, cardNumber: e.target.value})}
                      placeholder="Card number"
                      maxLength="16"
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fdb515] focus:border-[#fdb515] transition-all"
                    />
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={paymentForm.expiry}
                        onChange={(e) => setPaymentForm({...paymentForm, expiry: e.target.value})}
                        placeholder="MM/YY"
                        maxLength="5"
                        className="w-1/2 px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fdb515] focus:border-[#fdb515] transition-all"
                      />
                      <input
                        type="text"
                        value={paymentForm.cvv}
                        onChange={(e) => setPaymentForm({...paymentForm, cvv: e.target.value})}
                        placeholder="CVV"
                        maxLength="3"
                        className="w-1/2 px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fdb515] focus:border-[#fdb515] transition-all"
                      />
                    </div>
                    <button 
                      onClick={handleAddPayment}
                      disabled={addPaymentMutation.isPending}
                      className="px-3 py-1 bg-green-500 text-white text-sm font-semibold rounded-lg hover:bg-green-600 transition-all disabled:opacity-50"
                    >
                      {addPaymentMutation.isPending ? 'Saving...' : 'Save Card'}
                    </button>
                  </div>
                )}

                {paymentsLoading ? (
                  <div className="text-center py-4 text-gray-600">Loading payment methods...</div>
                ) : (
                  <div className="space-y-2">
                    {paymentMethods.map(pm => (
                      <div key={pm.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-800">{pm.type} •••• {pm.last4}</p>
                          <p className="text-sm text-gray-600">Expires {pm.expiry}</p>
                        </div>
                        <button 
                          onClick={() => deletePayment(pm.id)}
                          disabled={deletePaymentMutation.isPending}
                          className="px-3 py-1 bg-red-500 text-white text-sm font-semibold rounded-lg hover:bg-red-600 transition-all disabled:opacity-50"
                        >
                          {deletePaymentMutation.isPending ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Apply to be a Dasher */}
              <div className="p-4 border-2 border-[#fdb515] rounded-lg bg-orange-50">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-800">Become a Dasher</h3>
                      <p className="text-sm text-gray-600">Earn money by delivering orders on campus</p>
                    </div>
                    <button 
                      onClick={() => setShowDasherForm(!showDasherForm)}
                      className="px-4 py-2 bg-[#fdb515] text-black font-semibold rounded-lg hover:bg-[#e5a313] transition-all"
                    >
                      {showDasherForm ? 'Cancel' : 'Apply Now'}
                    </button>
                  </div>
                  
                  {showDasherForm && (
                    <div className="mt-4 space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Why do you want to become a Dasher? <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={dasherReasoning}
                          onChange={(e) => setDasherReasoning(e.target.value)}
                          placeholder="Tell us why you'd like to deliver orders on campus..."
                          rows="4"
                          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fdb515] focus:border-[#fdb515] transition-all resize-none"
                          required
                        />
                      </div>
                      <button 
                        onClick={handleDasherApplication}
                        disabled={applyToDasherMutation.isPending || !dasherReasoning.trim()}
                        className="w-full px-4 py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {applyToDasherMutation.isPending ? 'Submitting...' : 'Submit Application'}
                      </button>
                    </div>
                  )}
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
              {settingsLoading ? (
                <div className="text-center py-4 text-gray-600">Loading settings...</div>
              ) : (
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
                        checked={settings.showOnlyOpenStores}
                        onChange={(e) => toggleSetting('showOnlyOpenStores', e.target.checked)}
                        disabled={updateSettingsMutation.isPending}
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
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={settings.notifications}
                        onChange={(e) => toggleSetting('notifications', e.target.checked)}
                        disabled={updateSettingsMutation.isPending}
                      />
                      <div className="w-12 h-6 bg-gray-300 rounded-full peer-checked:bg-[#fdb515] transition-colors"></div>
                      <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-6"></div>
                    </label>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}