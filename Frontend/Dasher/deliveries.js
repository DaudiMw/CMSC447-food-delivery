function DeliveriesPage() {
  const user_id = localStorage.getItem('userId');

  const { data: pickups = {}, isLoading: pickupsLoading, error: pickupsError, refetch: pickupsRefetch } = window.ReactQuery.useQuery({
    queryKey: ['status', 'pending'],
    queryFn: () => get_user_deliveries('pending')
  });

  if (pickupsLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-600">Loading deliveries...</div>
      </div>
    );
  }

  if (pickupsError) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-600">Error getting deliveries.</div>
      </div>
    );
  }

  if (pickups == []) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-600">Deliveries not found.</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col pt-24 px-4 md:px-10 bg-gray-50">
      <h1 className="text-4xl font-bold text-gray-800 mb-2">Deliveries</h1>
      {pickups.map(pickup => {
        <Delivery
            id={}
            order_id={}
            dasher_id={}
            store_id={}
            scheduled_at={}
            completed_at={}
            order={}
        />
      })}
    </div>
  );
};