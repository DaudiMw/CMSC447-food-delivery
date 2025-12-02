const { useParams, useHistory } = ReactRouterDOM;

function Delivery(
  order_id,
  user_id,
  store_id,
  address,
  scheduled_at,
  accepted_at,
  completed_at,
  items
) {
  const [report, setReport] = React.useEffect(null);
  const [showReportContent, setShowReportContent] = React.useEffect(false);
  const history = useHistory();

  var completeOrder = async () => {
    const orderData = {
      status: 'completed',
      dasher_id: user_id, 
      accepted_at: accepted_at,
      completed_at: new Date()};

    await update_order(orderData, order_id)
    alert("Order completed!");
    history.push('/deliveries')
  }

  var handleSubmit = async () => {
    const reportData = {
    user_id,
    order_id,
    store_id,
    comment: report};

    await create_report(reportData);
    alert("Delivery reported!");
    setShowReportContent(false);
  };

  return (
    <div>
      Order ID: {id}
      Store ID: {store_id}
      Address: {`${address.street}, ${address.city}, ${address.state} ${address.zip}`}
      Schedule Date: {scheduled_at}
      Accept Date: {accepted_at}
      Completion Date: {completed_at}
      Items: {items.map(item => `${item.name}, `)}

      <button onClick={completeOrder}>
        Mark Completed
      </button>

      <button onClick={setShowReportContent(!showReportContent)}>
        {showReportContent ? 'Report' : 'Cancel'}
      </button>

      {showReportContent &&
        (<form onSubmit={handleSubmit}>
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

function DeliveriesPage() {
  const user_id = localStorage.getItem('userId');

  const { data: orders = {}, isLoading: ordersLoading, error: ordersError, refetch: ordersRefetch } = window.ReactQuery.useQuery({
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

  if (orders == []) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-600">Deliveries not found.</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col pt-24 px-4 md:px-10 bg-gray-50">
      <h1 className="text-4xl font-bold text-gray-800 mb-2">Deliveries</h1>
      {orders.map(order => {
        <Delivery
            order_id={order.id}
            user_id={user_id}
            store_id={order.store_id}
            address={order.address}
            scheduled_at={order.scheduled_at}
            accepted_at={order.accepted_at}
            completed_at={order.completed_at}
            items={order.items}
        />
      })}
    </div>
  );
};