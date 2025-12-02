const { useQuery, useQueryClient, useMutation } = window.ReactQuery;
const { useParams, useHistory } = ReactRouterDOM;

function Delivery(
  query_client,
  order_id,
  user_id,
  store_id,
  address,
  created_at,
  accepted_at,
  completed_at,
  items
) {
  const [report, setReport] = React.useEffect(null);
  const [showReportContent, setShowReportContent] = React.useEffect(false);

  const dateCreationObject = new Date(created_at);
  const dateAcceptedObject = new Date(accepted_at);
  const dateCompletionObject = new Date(completed_at);
  const dateCreationString = dateCreationObject.toLocaleString();
  const dateAcceptedString = dateAcceptedObject.toLocaleString();
  const dateCompletionString = dateCompletionObject.toLocaleString();

  const { data: stores = {}, error: storesError, refetch: storeRefetch } = useQuery({
  queryKey: ['store_id', store_id],
  queryFn: () => get_store(store_id)
  });

  const completeOrderMutation = useMutation({
    mutationFn: ({ orderData, order_id }) => update_order(orderData, order_id),
    onSuccess: () => {
        query_client.invalidateQueries({ queryKey: ['dasher_id'] });
        alert("Order completed!");
    },
  });

  var checkCompletion = () => {
    completed_at ? true : false
  }

  var completeOrder = async () => {
    const orderData = {
      status: 'completed',
      dasher_id: user_id, 
      accepted_at: accepted_at,
      completed_at: new Date().toISOString()};

    completeOrderMutation.mutate(orderData, order_id)
  }

  var submitReport = async () => {
    const reportData = {
    user_id,
    order_id,
    store_id,
    comment: report};

    await create_report(reportData);
    alert("Delivery reported!");
    setShowReportContent(false);
  };

  if (stores.length > 0) {
    return (
      <div>
        Order ID: {id}
        Store Name: {stores[0].name}
        Store Address: {`${stores[0].address.street}, ${stores[0].address.city}, ${stores[0].address.state} ${stores[0].address.zip}`}
        Delivery Address: {`${address.street}, ${address.city}, ${address.state} ${address.zip}`}
        Creation Date: {dateCreationString}
        Accept Date: {dateAcceptedString}
        Completion Date: {dateCompletionString}
        Items: {items.map(item => `${item.item.name}: ${item.quantity}, `)}


        ({checkCompletion} && (
        <button onClick={completeOrder}>
          Mark Completed
        </button>))
        
        <button onClick={setShowReportContent(!showReportContent)}>
          {showReportContent ? 'Report' : 'Cancel'}
        </button>

        {showReportContent &&
          (<form onSubmit={submitReport}>
            <label className="form-label">Comment:</label>
            <input 
              type="response" 
              className="form-control" 
              value={report}
              onChange={(e) => setReport(e.target.value)}
            />
            <button type="submit">
              Post
            </button>
          </form>)
        }
      </div>
    );
  }
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
    <div className="flex min-h-screen flex-col pt-24 px-4 md:px-10 bg-gray-50">
      <h1 className="text-4xl font-bold text-gray-800 mb-2">Deliveries</h1>
      No deliveries.
    </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col pt-24 px-4 md:px-10 bg-gray-50">
      <h1 className="text-4xl font-bold text-gray-800 mb-2">Deliveries</h1>
      {orders.map(order => {
        <Delivery
            query_client={queryClient}
            order_id={order.id}
            user_id={user_id}
            store_id={order.store_id}
            address={order.address}
            created_at={order.created_at}
            accepted_at={order.accepted_at}
            completed_at={order.completed_at}
            items={order.items}
        />
      })}
    </div>
  );
};