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
  const [successMessage, setSuccessMessage] = React.useState('');
  const [errorMessage, setErrorMessage] = React.useState('');

  const [newEmail, setNewEmail] = React.useState('');
  const [currentPasswordEmail, setCurrentPasswordEmail] = React.useState('');
  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmNewPassword, setConfirmNewPassword] = React.useState('');
  
  // Form state
  const [addressForm, setAddressForm] = React.useState({
    street: '', city: '', state: '', zip: '', building: '', room_number: ''
  });
  const [paymentForm, setPaymentForm] = React.useState({
    cardNumber: '', expiry: '', cvv: ''
  });

  // Queries
  const { data: addresses = [], isLoading: addressesLoading } = useQuery({
    queryKey: ['addresses'],
    queryFn: () => get_user_addresses(getUserId())
  });

  const { data: paymentMethods = [], isLoading: paymentsLoading } = useQuery({
    queryKey: ['paymentMethods'],
    queryFn: () => get_payment_methods(getUserId())
  });

  const { data: currentUser, isLoading: userLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => get_user(getUserId())
  });

  const { data: settings = {}, isLoading: settingsLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: () => get_user_settings(getUserId())
  });

  // Mutations for addresses
  const addAddressMutation = useMutation({
    mutationFn: (addressData) => add_user_address(getUserId(), addressData),
    onSuccess: (newAddress) => {
      // Check if the response is valid before adding it
      if (newAddress && newAddress.id) {
        queryClient.setQueryData(['addresses'], (old = []) => [...old, newAddress]);
        setShowAddAddress(false);
        // Clear form ONLY on success
        setAddressForm({ 
          street: '', 
          city: '', 
          state: '', 
          zip: '', 
          building: '', 
          room_number: '' 
        });
        setSuccessMessage('Address added successfully.');
      } else {
        // If response is invalid, refetch to get the updated list
        queryClient.invalidateQueries({ queryKey: ['addresses'] });
        setShowAddAddress(false);
        setAddressForm({ 
          street: '', 
          city: '', 
          state: '', 
          zip: '', 
          building: '', 
          room_number: '' 
        });
        setSuccessMessage('Address added successfully.');
      }
    },
    onError: (error) => {
      setErrorMessage(error.message || 'Failed to add address.');
      // Form stays populated so user can fix errors
    }
  });

  const deleteAddressMutation = useMutation({
    mutationFn: (address_id) => delete_user_address(getUserId(), address_id),
    onSuccess: (_, deletedId) => {
      queryClient.setQueryData(['addresses'], (old = []) => 
        old.filter(addr => addr.id !== deletedId)
      );
      setSuccessMessage('Address deleted successfully.');
    },
    onError: (error) => {
        setErrorMessage(error.message || 'Failed to delete address.');
    }
  });

  // Mutations for payment methods
  const addPaymentMutation = useMutation({
    mutationFn: (paymentData) => add_user_payment(getUserId(), paymentData),
    onSuccess: (newMethod) => {
      queryClient.setQueryData(['paymentMethods'], (old = []) => [...old, newMethod]);
      setShowAddPayment(false);
      setPaymentForm({ cardNumber: '', expiry: '', cvv: '' });
      setSuccessMessage('Payment method added successfully.');
    },
    onError: (error) => {
        setErrorMessage(error.message || 'Failed to add payment method.');
    }
  });

  const deletePaymentMutation = useMutation({
    mutationFn: (payment_method_id) => delete_payment_method(getUserId(), payment_method_id),
    onSuccess: (_, deletedId) => {
      queryClient.setQueryData(['paymentMethods'], (old = []) => 
        old.filter(pm => pm.id !== deletedId)
      );
      setSuccessMessage('Payment method deleted successfully.');
    },
    onError: (error) => {
        setErrorMessage(error.message || 'Failed to delete payment method.');
    }
  });

  // Mutation for settings
  const updateSettingsMutation = useMutation({
    mutationFn: (settingsData) => update_user_settings(getUserId(), settingsData),
    onSuccess: (updatedSettings) => {
      queryClient.setQueryData(['settings'], updatedSettings);
      setSuccessMessage('Settings updated.');
    },
    onError: (error) => {
        setErrorMessage(error.message || 'Failed to update settings.');
    }
  });

    // Mutations for email and password changes
  const updateEmailMutation = useMutation({
    mutationFn: (emailData) => update_user(getUserId(), emailData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      setSuccessMessage('Email updated successfully!');
      setShowChangeEmail(false);
      setNewEmail('');
      setCurrentPasswordEmail('');
    },
    onError: (error) => {
      setErrorMessage(error.message || 'Failed to update email.');
    }
  });

  const updatePasswordMutation = useMutation({
    mutationFn: (passwordData) => update_user(getUserId(), passwordData),
    onSuccess: () => {
      setSuccessMessage('Password updated successfully!');
      setShowChangePassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    },
    onError: (error) => {
      setErrorMessage(error.message || 'Failed to update password.');
    }
  });
  
  const applyToDasherMutation = useMutation({
    mutationFn: apply_to_dasher,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dasherApplications'] });
      setSuccessMessage('Your application has been submitted!');
      setDasherReasoning('');
      setShowDasherForm(false);
    },
    onError: (error) => {
      setErrorMessage(error.message || 'Failed to submit application.');
      console.error('Application error:', error);
    }
  });

  const deleteAddress = (id) => {
      deleteAddressMutation.mutate(id);
  };

  const deletePayment = (id) => {
      deletePaymentMutation.mutate(id);
  };

  const deleteAccount = () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
        // Replace with actual delete account mutation when available
        setErrorMessage('Account deletion is not yet implemented.');
    }
  };


  const handleAddAddress = () => {
    // Validate required fields - ADD building to the check
    if (!addressForm.building || !addressForm.street || !addressForm.city || !addressForm.state || !addressForm.zip) {
      setErrorMessage('Please fill in all required address fields (Building, Street, City, State, Zip).');
      return;
    }

    addAddressMutation.mutate({
      building: addressForm.building,  // No longer null
      street: addressForm.street,
      city: addressForm.city,
      state: addressForm.state,
      zip: addressForm.zip,
      room_number: addressForm.room_number || null,
    });
  };

  const handleToggleAddAddress = () => {
    if (showAddAddress) {
      // If closing, clear the form
      handleCancelAddAddress();
    } else {
      // If opening, just show it
      setShowAddAddress(true);
    }
  };

  const handleCancelAddAddress = () => {
    setShowAddAddress(false);
    // Reset form to initial state
    setAddressForm({ 
      street: '', 
      city: '', 
      state: '', 
      zip: '', 
      building: '', 
      room_number: '' 
    });
  };

  const handleAddPayment = () => {
    if (paymentForm.cardNumber && paymentForm.expiry && paymentForm.cvv) {
      const [month, year] = paymentForm.expiry.split('/');
      addPaymentMutation.mutate({
        type: paymentForm.cardNumber.startsWith('4') ? 'Visa' : 'Mastercard',
        last4: paymentForm.cardNumber.slice(-4),
        expiry: `${month}/${year}`
      });
    } else {
        setErrorMessage('Please fill all payment fields.');
    }
  };

  const handleDasherApplication = () => {
    if (!dasherReasoning.trim()) {
      setErrorMessage('Please provide your reasoning for wanting to become a Dasher.');
      return;
    }
    applyToDasherMutation.mutate({
      id: String(getUserId()),
      content: dasherReasoning
    });
  };

  const handleChangeEmail = () => {
    if (!newEmail || !currentPasswordEmail) {
      setErrorMessage('Please fill in both new email and current password.');
      return;
    }
    updateEmailMutation.mutate({ email: newEmail, current_password: currentPasswordEmail });
  };

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setErrorMessage('Please fill in all password fields.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setErrorMessage('New password and confirmation do not match.');
      return;
    }
    if (newPassword === currentPassword) {
      setErrorMessage('New password cannot be the same as the current password.');
      return;
    }
    updatePasswordMutation.mutate({ current_password: currentPassword, password: newPassword });
  };


  const toggleSetting = (key, value) => {
    updateSettingsMutation.mutate({ ...settings, [key]: value });
  };

  return (
    <div className="flex min-h-full flex-col p-4 md:p-10 bg-gray-50 pt-20">
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
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fdb515] focus:border-[#fdb515] transition-all"
                    />
                    <input
                      type="password"
                      placeholder="Current password"
                      value={currentPasswordEmail}
                      onChange={(e) => setCurrentPasswordEmail(e.target.value)}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fdb515] focus:border-[#fdb515] transition-all"
                    />
                    <button 
                      onClick={handleChangeEmail}
                      disabled={updateEmailMutation.isPending}
                      className="btn btn-action"
                    >
                      {updateEmailMutation.isPending ? 'Updating...' : 'Update Email'}
                    </button>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">{currentUser?.email || 'N/A'}</p>
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
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fdb515] focus:border-[#fdb515] transition-all"
                    />
                    <input
                      type="password"
                      placeholder="New password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fdb515] focus:focus:border-[#fdb515] transition-all"
                    />
                    <input
                      type="password"
                      placeholder="Confirm new password"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fdb515] focus:border-[#fdb515] transition-all"
                    />
                    <button 
                      onClick={handleChangePassword}
                      disabled={updatePasswordMutation.isPending}
                      className="btn btn-action"
                    >
                      {updatePasswordMutation.isPending ? 'Updating...' : 'Update Password'}
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
                    onClick={handleToggleAddAddress}
                    className="btn btn-action"
                  >
                    {showAddAddress ? 'Cancel' : '+ Add Address'}
                  </button>
                </div>
                
                {showAddAddress && (
                  <div className="mb-4 p-4 bg-gray-50 rounded-lg space-y-3">

                    <input
                      type="text"
                      value={addressForm.building}
                      onChange={(e) => setAddressForm({...addressForm, building: e.target.value})}
                      placeholder="Building"
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fdb515] focus:border-[#fdb515] transition-all"
                    />
                    <input
                      type="text"
                      value={addressForm.room_number}
                      onChange={(e) => setAddressForm({...addressForm, room_number: e.target.value})}
                      placeholder="Room Number"
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
                        <div className="mb-2 md:mb-0">
                          <p className="font-medium text-gray-800">{addr.label}</p>
                          <p className="text-sm text-gray-600">
                            {`${addr.building || ''}${addr.room_number ? ' Room ' + addr.room_number : ''}${addr.building || addr.room_number ? ', ' : ''}${addr.street}, ${addr.city}, ${addr.state} ${addr.zip}`}
                          </p>
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
                        <div className="mb-2 md:mb-0">
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
                    <div className="mb-2 md:mb-0">
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
                  <div className="mb-2 md:mb-0">
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