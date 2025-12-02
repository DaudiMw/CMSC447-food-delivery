const { useQuery, useQueryClient, useMutation } = window.ReactQuery;
const { HashRouter, Switch, Route, Link } = window.ReactRouterDOM;
const { useParams, useHistory } = ReactRouterDOM;

function Report({ 
  report_id,
  user_id,
  store_id,
  order_id,
  comment,
  reply }) {

  return (
    <tr>
      <td>{report_id}</td>
      <td>{order_id}</td>
      <td>{user_id}</td>
      <td>{store_id}</td>
      <td>{comment}</td>
      <td>{reply}</td>
    </tr>
  );
}

function StoreOwnerReport({ 
  query_client,
  report_id,
  user_id,
  store_id,
  order_id,
  comment,
  reply }) {
  const [response, setReply] = React.useState(null);
  const [replyExists, setReplyExists] = React.useState(false);
  const [showReplyContent, setShowReplyContent] = React.useState(false);

  const reportReplyMutation = useMutation({
    mutationFn: ({ replyData, report_id }) => update_report(replyData, report_id),
    onSuccess: () => {
        query_client.invalidateQueries({ queryKey: ['report'] });
        alert("Reply posted!");
    },
  });

  React.useEffect(
    () => {
      if (reply) {
        setReplyExists(true);
      }
    }
  )

  var handleSubmit = async () => {
    const replyData = {response: response};

    reportReplyMutation.mutate({ replyData, report_id })
  };

  return (
    <tr>
      <td>{report_id}</td>
      <td>{order_id}</td>
      <td>{user_id}</td>
      <td>{store_id}</td>
      <td>{comment}</td>
      <td>{reply}</td>

      <td>
        <button className="btn btn-action" onClick={() => setShowReplyContent(!showReplyContent)}>
          {replyExists ? 'Edit' : 'Reply'}
        </button>
      </td>

      <td>
        {showReplyContent &&
          (<form onSubmit={handleSubmit}>
            <label className="form-label">Reply:</label>
            <input 
              type="response" 
              className="form-control" 
              value={response}
              onChange={(e) => setReply(e.target.value)}
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

function StoreReportList({ query_client, store_id }) {
  const { data: reports = {}, isLoading: reportsLoading, error: reportsError, refetch: reportsRefetch } = useQuery({
    queryKey: ['store_id', store_id],
    queryFn: () => get_reports_by_store_id(store_id)
  });

  if (reportsLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-600">Loading reports...</div>
      </div>
    );
  }

  if (reportsError) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-600">Error getting reports.</div>
      </div>
    );
  }

  return (
    <tbody>
      {reports.map(report => (
        <StoreOwnerReport 
          query_client={query_client}
          report_id={report.id}
          user_id={report.user_id}
          store_id={report.store_id}
          order_id={report.order_id}
          comment={report.comment}
          reply={report.response}
        />
      ))}
    </tbody>
  );
}

function ReportsPage() {
  const user_id = localStorage.getItem('userId');
  const queryClient = useQueryClient();

  const { data: reports, isLoading: reportsLoading, error: reportsError, refetch: reportRefetch } = useQuery({
    queryKey: ['user_id', user_id],
    queryFn: () => get_reports_by_user_id(user_id)
  });

  const { data: stores, isLoading: storesLoading, error: storesError, refetch: storeRefetch } = useQuery({
    queryKey: ['user_id', user_id],
    queryFn: () => get_user_stores(user_id)
  });

  if (storesLoading || reportsLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (storesError || reportsError) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-600">Error fetching data.</div>
      </div>
    );
  }

  if (stores.length === 0 && reports.length > 0) {
    return (
    <div className="flex min-h-screen flex-col pt-24 px-4 md:px-10 bg-gray-50">
      <h1 className="text-4xl font-bold text-gray-800 mb-2">Reports</h1>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">My Reports</h1>
      <div className="bg-white rounded-lg shadow-md p-8 flex-auto min-w-max items-center gap-4">
        <table className="table-auto w-full border-collapse min-w-[600px]">
          <thead>
            <tr>
              <th>Report ID</th>
              <th>User ID</th>
              <th>Store ID</th>
              <th>Order ID</th>
              <th>Comment</th>
              <th>Reply</th>
            </tr>
          </thead>
          <tbody>
            {reports.map(report => (
              <Report
                report_id={report.id}
                user_id={report.user_id}
                store_id={report.store_id}
                order_id={report.order_id}
                comment={report.comment}
                reply={report.response}
              />
            ))}
          </tbody>
        </table>
      </div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Reports from My Stores</h1>
      <p className="text-xl text-gray-600 mb-4">No reports.</p>
    </div>
    );
  }

  if (stores.length > 0 && reports.length === 0) {
    return (
    <div className="flex min-h-screen flex-col pt-24 px-4 md:px-10 bg-gray-50">
      <h1 className="text-4xl font-bold text-gray-800 mb-2">Reports</h1>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">My Reports</h1>
      <p className="text-xl text-gray-600 mb-4">No reports.</p>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Reports from My Stores</h1>
      <div className="bg-white rounded-lg shadow-md p-8 flex-auto min-w-max items-center gap-4">
        <table className="table-auto w-full border-collapse min-w-[600px]">
          <thead>
            <tr>
              <th>Report ID</th>
              <th>User ID</th>
              <th>Store ID</th>
              <th>Order ID</th>
              <th>Comment</th>
              <th>Reply</th>
            </tr>
          </thead>
          <tbody>
            {stores.map(store => (
              <StoreReportList
                query_client={queryClient}
                store_id={store.id}
              />))}
          </tbody>
        </table>
      </div>
    </div>
    );
  }

  if (stores.length === 0 && reports.length === 0) {
    return (
    <div className="flex min-h-screen flex-col pt-24 px-4 md:px-10 bg-gray-50">
      <h1 className="text-4xl font-bold text-gray-800 mb-2">Reports</h1>
      <p className="text-xl text-gray-600 mb-4">No reports.</p>
    </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col pt-24 px-4 md:px-10 bg-gray-50">
      <h1 className="text-4xl font-bold text-gray-800 mb-2">Reports</h1>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">My Reports</h1>
        <div className="bg-white rounded-lg shadow-md p-8 flex-auto min-w-max items-center gap-4">
          <table className="table-auto w-full border-collapse min-w-[600px]">
            <thead>
              <tr>
                <th>Report ID</th>
                <th>User ID</th>
                <th>Store ID</th>
                <th>Order ID</th>
                <th>Comment</th>
                <th>Reply</th>
              </tr>
            </thead>
            <tbody>
              {reports.map(report => (
                <Report
                  report_id={report.id}
                  user_id={report.user_id}
                  store_id={report.store_id}
                  order_id={report.order_id}
                  comment={report.comment}
                  reply={report.response}
                />
              ))}
            </tbody>
          </table>
      </div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Reports from My Stores</h1>
      <div className="bg-white rounded-lg shadow-md p-8 flex-auto min-w-max items-center gap-4">
        <table className="table-auto w-full border-collapse min-w-[600px]">
          <thead>
            <tr>
              <th>Report ID</th>
              <th>User ID</th>
              <th>Store ID</th>
              <th>Order ID</th>
              <th>Comment</th>
              <th>Reply</th>
            </tr>
          </thead>
            {stores.map(store => (
              <StoreReportList
                query_client={queryClient}
                store_id={store.id}
              />))}
        </table>
      </div>
    </div>
  );
}