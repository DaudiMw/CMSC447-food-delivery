

function Pickup(
  order_id,
  user_id,
  store_id,
  dasher_id,
  address_id,
  updated_at,
  items
) {
  var handleSubmit = async () => {

    const pickupData = {
      dasher_id: dasher_id,
    }

    try {
        const response = await fetch(`localhost:8000/pickups/${order_id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(pickupData),
            credentials: 'same-origin',
            redirect: 'manual',
            mode: 'cors'
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Failed to respond');
        }

        return await response.json();

    } catch (error) {
        console.error('Error while responding:', error);
        throw error;
    }
}

  return (
    <div>
      Order ID: {order_id}
      Store ID: {store_id}
      Address ID: {address_id}
      Order Placed: {updated_at}
      Items:{items.map(item => {item.name + ", "})}
      <form onSubmit={handleSubmit}>
        <button type="submit">
          Pickup Order
        </button>
      </form>
    </div>
  );
};

function PickupsPage() {
  const user_id = localStorage.getItem('userId');

  const { data: orders = {}, isLoading: ordersLoading, error: ordersError, refetch: ordersRefetch } = window.ReactQuery.useQuery({
    queryKey: ['status', 'pending'],
    queryFn: () => get_pickups_by_status('pending')
  });

  if (ordersLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-600">Loading pickups...</div>
      </div>
    );
  }

  if (ordersError) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-600">Error getting pickups.</div>
      </div>
    );
  }

  if (orders == []) {
    return (
    <div className="flex min-h-screen flex-col pt-24 px-4 md:px-10 bg-gray-50">
      <h1 className="text-4xl font-bold text-gray-800 mb-2">Pickups</h1>
      No pickups.
    </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col pt-24 px-4 md:px-10 bg-gray-50">
      <h1 className="text-4xl font-bold text-gray-800 mb-2">Pickups</h1>
      {orders.map(order => {
        <Pickup
          order_id={order.id}
          user_id={order.user_id}
          dasher_id={user_id}
          store_id={order.store_id}
          address_id={order.address_id}
          updated_at={order.updated_at}
          items={order.items}
        />
      })}
    </div>
  );
};