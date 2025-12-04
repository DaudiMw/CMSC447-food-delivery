const { useQuery, useQueryClient, useMutation } = window.ReactQuery;
const { useParams, useHistory } = ReactRouterDOM;

function Pickup(
  { query_client,
  order_id,
  store,
  dasher_id,
  address,
  created_at,
  items }
) {
  const dateObject = new Date(created_at);
  const dateString = dateObject.toLocaleString();
  const [toast, setToast] = React.useState({ show: false, message: '', type: '' });

  const acceptOrderMutation = useMutation({
    mutationFn: ({ orderData, order_id }) => update_order(orderData, order_id),
    onSuccess: () => {
        query_client.invalidateQueries({ queryKey: ['status'] });
        setToast({ show: true, message: 'Pickup accepted!', type: 'success' });
    },
    onError: (error) => {
        setToast({ show: true, message: error?.response?.data?.detail || 'Failed to accept pickup.', type: 'danger' });
    }
  });

  var acceptOrder = async () => {
    if (confirm("Accept this pickup?")) {
      const orderData = {
        status: 'accepted',
        dasher_id: dasher_id,
        accepted_at: new Date().toISOString(),
        completed_at: null
      }

      acceptOrderMutation.mutate({ orderData, order_id })
    }
  };

  return (
    <>
      <Toast
        message={toast.message}
        type={toast.type}
        show={toast.show}
        onClose={() => setToast({ ...toast, show: false })}
      />
    <tr className="p-3 border-b hover:bg-amber-100">
      <td className="p-3">{order_id}</td>
      <td className="p-3">{store.name}</td>
      <td className="p-3">{`${store.address.street}, ${store.address.city}, ${store.address.state} ${store.address.zip}`}</td>
      <td className="p-3">{`${address.street}, ${address.city}, ${address.state} ${address.zip}`}</td>
      <td className="p-3">{dateString}</td>
      <td className="p-3">{items.map((item, index, array) => 
        {if(index == array.length-1) {
          return (`${item.item.name}: ${item.quantity}`)
        }
        else {
          return (`${item.item.name}: ${item.quantity}, `);
        }})}</td>
      <td className="text-right p-3">
        <button className="btn btn-success" onClick={acceptOrder}>
          Accept Pickup
        </button>
      </td>
    </tr>
    </>
  );
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
    <div className="flex min-w-screen flex-col pt-24 px-4 md:px-10 bg-gray-50">
      <h1 className="text-4xl font-bold text-gray-800 mb-2">Pickups</h1>
          <p className="text-xl text-gray-600 mb-2">No pickups.</p>
    </div>
    );
  }

  return (
    <div className="flex min-w-screen flex-col pt-24 px-4 md:px-10 bg-gray-50">
      <h1 className="text-4xl font-bold text-gray-800 mb-2">Pickups</h1>
      <div className="bg-white rounded-lg border border-gray-300 p-8 flex-basis-auto min-w-max items-center gap-4">
        <table className="table-auto w-full border-collapse min-w-[600px]">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-3 text-left font-semibold border-b">Order ID</th>
            <th className="p-3 text-left font-semibold border-b">Store Name</th>
            <th className="p-3 text-left font-semibold border-b">Store Address</th>
            <th className="p-3 text-left font-semibold border-b">Delivery Address</th>
            <th className="p-3 text-left font-semibold border-b">Order Placed</th>
            <th className="p-3 text-left font-semibold border-b">Items</th>
            <th className="p-3 text-left font-semibold border-b"></th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <Pickup
              query_client={queryClient}
              order_id={order.id}
              dasher_id={user_id}
              store={order.store}
              address={order.address}
              created_at={order.created_at}
              items={order.items}
            />
          ))}
        </tbody>
        </table>
      </div>
    </div>
  );
};