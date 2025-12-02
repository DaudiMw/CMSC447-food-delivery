const { useQuery, useQueryClient, useMutation } = window.ReactQuery;
const { useParams, useHistory } = ReactRouterDOM;

function Pickup(
  query_client,
  order_id,
  store_id,
  dasher_id,
  address,
  created_at,
  items
) {
  const dateObject = new Date(created_at);
  const dateString = dateObject.toLocaleString();

  const { data: stores = {}, error: storesError, refetch: storeRefetch } = useQuery({
  queryKey: ['store_id', store_id],
  queryFn: () => get_store(store_id)
  });

  const acceptOrderMutation = useMutation({
    mutationFn: ({ orderData, order_id }) => update_order(orderData, order_id),
    onSuccess: () => {
        query_client.invalidateQueries({ queryKey: ['status'] });
        alert("Pickup accepted!")
    },
  });

  var acceptOrder = async () => {
    const orderData = {
      status: 'accepted',
      dasher_id: dasher_id,
      accepted_at: new Date().toISOString(),
      completed_at: null
    }

    acceptOrderMutation.mutate(orderData, order_id)
  };

  if (stores.length > 0) {
    return (
      <div>
        Order ID: {order_id}
        Store Name: {stores[0].name}
        Store Address: {`${stores[0].address.street}, ${stores[0].address.city}, ${stores[0].address.state} ${stores[0].address.zip}`}
        Delivery Address: {`${address.street}, ${address.city}, ${address.state} ${address.zip}`}
        Order Placed: {dateString}
        Items: {items.map(item => {`${item.item.name}: ${item.quantity}, `})}
        <button onClick={acceptOrder}>
          Pickup Order
        </button>
      </div>
    );
  }
};

function PickupsPage() {
  const user_id = localStorage.getItem('userId');
  const queryClient = useQueryClient();

  const { data: orders = {}, isLoading: ordersLoading, error: ordersError, refetch: ordersRefetch } = useQuery({
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

  if (orders.length === 0) {
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
          query_client={queryClient}
          order_id={order.id}
          dasher_id={user_id}
          store_id={order.store_id}
          address={order.address}
          created_at={order.created_at}
          items={order.items}
        />
      })}
    </div>
  );
};