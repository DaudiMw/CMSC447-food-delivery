const { useQuery, useQueryClient, useMutation } = window.ReactQuery;
const { useParams, useHistory } = ReactRouterDOM;

function Delivery(
  { query_client,
  order_id,
  user_id,
  store,
  address,
  order_status,
  created_at,
  accepted_at,
  completed_at,
  items }
) {
  const [report, setReport] = React.useState(null);
  const [showStatusButtons, setShowStatusButtons] = React.useState(false);
  const [showReportContent, setShowReportContent] = React.useState(false);
  const [toast, setToast] = React.useState({ show: false, message: '', type: '' });


  const dateCreationObject = new Date(created_at);
  const dateAcceptedObject = new Date(accepted_at);
  var dateCompletionObject;
  const dateCreationString = dateCreationObject.toLocaleString();
  const dateAcceptedString = dateAcceptedObject.toLocaleString();
  var dateCompletionString;

  if (completed_at) {
    dateCompletionObject = new Date(completed_at);
    dateCompletionString = dateCompletionObject.toLocaleString();
  }

  React.useEffect(
    () => {
      if (order_status == "accepted") {setShowStatusButtons(true)};
    }
  )

  const updateOrderMutation = useMutation({
    mutationFn: ({ orderData, order_id }) => update_order(orderData, order_id),
    onSuccess: () => {
        query_client.invalidateQueries({ queryKey: ['dasher_id'] });
        setToast({ show: true, message: `Order ${orderData.status}!`, type: 'success' });
    },
    onError: (error) => {
        setToast({ show: true, message: error?.response?.data?.detail || 'Failed to complete order.', type: 'danger' });
    }
  });

  const reportOrderMutation = useMutation({
    mutationFn: ({ reportData }) => create_report(reportData),
    onSuccess: () => {
        query_client.invalidateQueries({ queryKey: ['dasher_id'] });
        setToast({ show: true, message: 'Delivery reported!', type: 'success' });
        setShowReportContent(false);
        setReport(null);
    },
    onError: (error) => {
        setToast({ show: true, message: error?.response?.data?.detail || 'Failed to report delivery.', type: 'danger' });
    }
  });

  var completeOrder = async () => {
    if (confirm("Finish delivery?")) {
      const orderData = {
        status: 'completed',
        dasher_id: user_id, 
        accepted_at: accepted_at,
        completed_at: new Date().toISOString()};

      updateOrderMutation.mutate({ orderData, order_id })
    }
  }

  var dropOrder = async () => {
    if (confirm("Are you sure you want to cancel this delivery?")) {
      const orderData = {
        status: 'dropped',
        dasher_id: user_id, 
        accepted_at: accepted_at,
        completed_at: null};

      updateOrderMutation.mutate({ orderData, order_id })
    }
  }

  var submitReport = async (e) => {
    e.preventDefault();
    if (confirm("Are you sure you want to report this delivery?")) {
      const reportData = {
        user_id,
        order_id,
        store_id: store.id,
        comment: report};

      reportOrderMutation.mutate({ reportData });
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
      <td className="p-3">{dateCreationString}</td>
      <td className="p-3">{dateAcceptedString}</td>
      <td className="p-3">{dateCompletionString ? dateCompletionString : 'N/A'}</td>
      <td className="p-3">{items.map((item, index, array) => 
        {if(index == array.length-1) {
          return (`${item.item.name}: ${item.quantity}`)
        }
        else {
          return (`${item.item.name}: ${item.quantity}, `);
        }})}</td>
      <td className="p-3">{order_status}</td>

      <td className="p-3 text-right">
        {showStatusButtons && (
        <button className="btn btn-success" onClick={completeOrder}>
          Complete
        </button>)}

        {showStatusButtons && (
        <button className="btn btn-action" onClick={dropOrder}>
          Drop
        </button>)}

        <button className="btn btn-delete" onClick={() => setShowReportContent(!showReportContent)}>
          {showReportContent ? 'Cancel' : 'Report'}
        </button>
      </td>

      <td className="p-3">
        {showReportContent &&
          (<form onSubmit={submitReport}>
            <label className="form-label">Comment:</label>
            <input 
              type="response" 
              className="form-control" 
              value={report}
              onChange={(e) => setReport(e.target.value)}
            />
            <button className="btn btn-action" type="submit">
              Post
            </button>
          </form>)
        }
      </td>
    </tr>
    </>
  );
}

function DeliveriesPage() {
  const user_id = localStorage.getItem('userId');
  const queryClient = useQueryClient();

  const { data: orders = {}, isLoading: ordersLoading, error: ordersError, refetch: ordersRefetch } = useQuery({
    queryKey: ['dasher_id', user_id],
    queryFn: () => get_orders_by_dasher_id(user_id)
  });

  if (ordersLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-600">Loading deliveries...</div>
      </div>
    );
  }

  if (ordersError) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-600">Error getting deliveries.</div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex min-w-screen flex-col pt-24 px-4 md:px-10 bg-gray-50">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Deliveries</h1>
            <p className="text-xl text-gray-600 mb-2">No deliveries.</p>
      </div>
    );
  }

  return (
    <div className="flex min-w-screen flex-col pt-24 px-4 md:px-10 bg-gray-50">
      <h1 className="text-4xl font-bold text-gray-800 mb-2">Deliveries</h1>
      <div className="bg-white rounded-lg border border-gray-300 p-8 flex-basis-auto min-w-max items-center gap-4">
        <table className="table-auto w-full border-collapse min-w-[600px]">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-3 text-left font-semibold border-b">Order ID</th>
            <th className="p-3 text-left font-semibold border-b">Store Name</th>
            <th className="p-3 text-left font-semibold border-b">Store Address</th>
            <th className="p-3 text-left font-semibold border-b">Delivery Address</th>
            <th className="p-3 text-left font-semibold border-b">Order Placed</th>
            <th className="p-3 text-left font-semibold border-b">Order Accepted</th>
            <th className="p-3 text-left font-semibold border-b">Order Completed</th>
            <th className="p-3 text-left font-semibold border-b">Items</th>
            <th className="p-3 text-left font-semibold border-b">Status</th>
            <th className="p-3 text-left font-semibold border-b"></th>
            <th className="p-3 text-left font-semibold border-b"></th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <Delivery
              query_client={queryClient}
              order_id={order.id}
              user_id={user_id}
              address={order.address}
              created_at={order.created_at}
              accepted_at={order.accepted_at}
              completed_at={order.completed_at}
              order_status={order.status}
              store={order.store}
              items={order.items}
            />
          ))}
        </tbody>
        </table>
      </div>
    </div>
  );
};