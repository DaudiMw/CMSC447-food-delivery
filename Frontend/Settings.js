// Import React Query from CDN
const { useQuery, useMutation, useQueryClient, QueryClient, QueryClientProvider } = window.ReactQuery;

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
    queryFn: get_user_addresses
  });

  const { data: paymentMethods = [], isLoading: paymentsLoading } = useQuery({
    queryKey: ['paymentMethods'],
    queryFn: get_payment_methods
  });

  const { data: settings = {}, isLoading: settingsLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: get_user_settings
  });

  // Mutations for addresses
  const addAddressMutation = useMutation({
    mutationFn: add_user_address,
    onSuccess: (newAddress) => {
      queryClient.setQueryData(['addresses'], (old = []) => [...old, newAddress]);
      setShowAddAddress(false);
      setAddressForm({ label: '', street: '', city: '', state: '', zip: '' });
    }
  });

  const deleteAddressMutation = useMutation({
    mutationFn: delete_user_address,
    onSuccess: (_, deletedId) => {
      queryClient.setQueryData(['addresses'], (old = []) => 
        old.filter(addr => addr.id !== deletedId)
      );
    }
  });

  // Mutations for payment methods
  const addPaymentMutation = useMutation({
    mutationFn: add_user_payment,
    onSuccess: (newMethod) => {
      queryClient.setQueryData(['paymentMethods'], (old = []) => [...old, newMethod]);
      setShowAddPayment(false);
      setPaymentForm({ cardNumber: '', expiry: '', cvv: '' });
    }
  });

  const deletePaymentMutation = useMutation({
    mutationFn: delete_payment_method,
    onSuccess: (_, deletedId) => {
      queryClient.setQueryData(['paymentMethods'], (old = []) => 
        old.filter(pm => pm.id !== deletedId)
      );
    }
  });

  // Mutation for settings
  const updateSettingsMutation = useMutation({
    mutationFn: update_user_settings,
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
    mutationFn: apply_to_dasher,
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
    applyToDasherMutation.mutate({
      id: String(getUserId()),
      content: dasherReasoning
    });
  };


  const toggleSetting = (key, value) => {
    updateSettingsMutation.mutate({ ...settings, [key]: value });
  };

  return (
    <div className="flex min-h-full flex-col p-4 md:p-10 bg-gray-50 pt-20">
      <h1 className="text-4xl font-bold text-gray-800 pt-24">Settings</h1>
      <div className="mt-4 h-px w-full bg-gray-400"></div>
      <div className="mt-5 flex w-full flex-col md:flex-row gap-x-10 rounded-md p-4 border border-gray-300 bg-white">
        <div className="flex h-fit w-full md:w-1/4 flex-col gap-2 rounded-2xl shadow-lg border border-gray-200 p-2 mb-4 md:mb-0">
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
        
        <div className="w-full md:w-3/4 flex flex-col space-y-6">
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
                    <button className="btn btn-action">
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
                    <button className="btn btn-action">
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
                    className="btn btn-action"
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
                    <div className="flex flex-col md:flex-row gap-3">
                      <input
                        type="text"
                        value={addressForm.state}
                        onChange={(e) => setAddressForm({...addressForm, state: e.target.value})}
                        placeholder="State"
                        maxLength="2"
                        className="w-full md:w-1/3 px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fdb515] focus:border-[#fdb515] transition-all"
                      />
                      <input
                        type="text"
                        value={addressForm.zip}
                        onChange={(e) => setAddressForm({...addressForm, zip: e.target.value})}
                        placeholder="ZIP Code"
                        maxLength="5"
                        className="w-full md:w-2/3 px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fdb515] focus:border-[#fdb515] transition-all"
                      />
                    </div>
                    <button 
                      onClick={handleAddAddress}
                      disabled={addAddressMutation.isPending}
                      className="btn btn-success w-full"
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
                      <div key={addr.id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div class="mb-2 md:mb-0">
                          <p className="font-medium text-gray-800">{addr.label}</p>
                          <p className="text-sm text-gray-600">{addr.address}</p>
                        </div>
                        <button 
                          onClick={() => deleteAddress(addr.id)}
                          disabled={deleteAddressMutation.isPending}
                          className="btn btn-delete"
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
                    className="btn btn-action"
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
                      className="btn btn-success"
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
                      <div key={pm.id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div class="mb-2 md:mb-0">
                          <p className="font-medium text-gray-800">{pm.type} •••• {pm.last4}</p>
                          <p className="text-sm text-gray-600">Expires {pm.expiry}</p>
                        </div>
                        <button 
                          onClick={() => deletePayment(pm.id)}
                          disabled={deletePaymentMutation.isPending}
                          className="btn btn-delete"
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
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-3">
                    <div class="mb-2 md:mb-0">
                      <h3 className="font-semibold text-gray-800">Become a Dasher</h3>
                      <p className="text-sm text-gray-600">Earn money by delivering orders on campus</p>
                    </div>
                    <button 
                      onClick={() => setShowDasherForm(!showDasherForm)}
                      className="btn btn-action"
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
                        className="btn btn-success w-full"
                      >
                        {applyToDasherMutation.isPending ? 'Submitting...' : 'Submit Application'}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Delete Account */}
              <div className="p-4 border-2 border-red-300 rounded-lg bg-red-50">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
                  <div class="mb-2 md:mb-0">
                    <h3 className="font-semibold text-red-800">Delete Account</h3>
                    <p className="text-sm text-red-600">Permanently delete your account and all data</p>
                  </div>
                  <button 
                    onClick={deleteAccount}
                    className="btn btn-delete"
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