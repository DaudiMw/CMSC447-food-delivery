const { useQuery, useQueryClient, useMutation } = window.ReactQuery;
const { useParams, useHistory } = ReactRouterDOM;

function Delivery(
  { query_client,
  order_id,
  user_id,
  store,
  address,
  created_at,
  accepted_at,
  completed_at,
  items }
) {
  const [report, setReport] = React.useState(null);
  const [showCompleteButton, setShowCompleteButton] = React.useState(false);
  const [showReportContent, setShowReportContent] = React.useState(false);

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
      if (!completed_at) {setShowCompleteButton(true)};
    }
  )

  const completeOrderMutation = useMutation({
    mutationFn: ({ orderData, order_id }) => update_order(orderData, order_id),
    onSuccess: () => {
        query_client.invalidateQueries({ queryKey: ['dasher_id'] });
        alert("Order completed!");
    },
  });

  const reportOrderMutation = useMutation({
    mutationFn: ({ reportData }) => create_report(reportData),
    onSuccess: () => {
        query_client.invalidateQueries({ queryKey: ['dasher_id'] });
        alert("Delivery reported!");
        setShowReportContent(false);
        setReport(null);
    },
  });

  var completeOrder = async () => {
    if (confirm("Finish delivery?")) {
      const orderData = {
        status: 'completed',
        dasher_id: user_id, 
        accepted_at: accepted_at,
        completed_at: new Date().toISOString()};

      completeOrderMutation.mutate({ orderData, order_id })
    }
  }

  var submitReport = async () => {
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
    <tr>
      <td>{order_id}</td>
      <td>{store.name}</td>
      <td>{`${store.address.street}, ${store.address.city}, ${store.address.state} ${store.address.zip}`}</td>
      <td>{`${address.street}, ${address.city}, ${address.state} ${address.zip}`}</td>
      <td>{dateCreationString}</td>
      <td>{dateAcceptedString}</td>
      <td>{dateCompletionString ? dateCompletionString : 'N/A'}</td>
      <td>{items.map((item, index, array) => 
        {if(index == array.length-1) {
          return (`${item.item.name}: ${item.quantity}`)
        }
        else {
          return (`${item.item.name}: ${item.quantity}, `);
        }})}</td>

      <td className="text-right">
        {showCompleteButton && (
        <button className="btn btn-action" onClick={completeOrder}>
          Complete
        </button>)}

        <button className="btn btn-delete justify-self-end" onClick={() => setShowReportContent(!showReportContent)}>
          {showReportContent ? 'Cancel' : 'Report'}
        </button>
      </td>

      <td>
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
      <div className="min-h-screen bg-gray-50 pt-24 px-4 md:px-10">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-800 mb-6">Deliveries</h1>
          <p className="text-xl text-gray-600 mb-4">No deliveries.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-w-screen flex-col pt-24 px-4 md:px-10 bg-gray-50">
      <h1 className="text-4xl font-bold text-gray-800 mb-2">Deliveries</h1>
      <div className="bg-white rounded-lg shadow-md p-8 flex-auto min-w-max items-center gap-4">
        <table className="table-auto w-full border-collapse min-w-[600px]">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Store Name</th>
            <th>Store Address</th>
            <th>Delivery Address</th>
            <th>Order Placed</th>
            <th>Order Accepted</th>
            <th>Order Completed</th>
            <th>Items</th>
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