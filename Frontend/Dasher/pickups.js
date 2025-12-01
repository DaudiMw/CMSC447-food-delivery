const { useParams, useHistory } = ReactRouterDOM;

function Pickup(
  order_id,
  store_id,
  dasher_id,
  address_id,
  created_at,
  items
) {
  var handleSubmit = async () => {
    const history = useHistory();

    const orderData = {
      status: 'accepted',
      dasher_id: dasher_id,
      accepted_at: new Date(),
      completed_at: null
    }

    await update_order(orderData, order_id)
    alert("Pickup accepted!")
    history.push('/pickups')
  };

  return (
    <div>
      Order ID: {order_id}
      Store ID: {store_id}
      Address ID: {address_id}
      Order Placed: {created_at}
      Items: {items.map(item => {`${item.name}, `})}
      <button onClick={handleSubmit}>
        Pickup Order
      </button>
    </div>
  );
};

function PickupsPage() {
  const user_id = localStorage.getItem('userId');

  const { data: orders = {}, isLoading: ordersLoading, error: ordersError, refetch: ordersRefetch } = window.ReactQuery.useQuery({
    queryKey: ['status', 'pending'],
    queryFn: () => get_orders_by_status('pending')
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
          dasher_id={user_id}
          store_id={order.store_id}
          address_id={order.address_id}
          created_at={order.created_at}
          items={order.items}
        />
      })}
    </div>
  );
};