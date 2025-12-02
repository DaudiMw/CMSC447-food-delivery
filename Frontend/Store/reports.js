const { HashRouter, Switch, Route, Link } = window.ReactRouterDOM;
const { useParams, useHistory } = ReactRouterDOM;

function Report({
  report_id,
  user_id,
  store_id,
  order_id,
  comment,
}) {
  const [reply, setReply] = React.useEffect(null);
  const [showReplyContent, setShowReplyContent] = React.useEffect(false);

  var handleSubmit = async () => {
    const history = useHistory();
    const replyData = {response: response};

    await update_report(replyData);
    history.push('/reports');
  };

  return (
    <div>
      Report ID: {report_id}
      Order ID: {order_id}
      User ID: {user_id}
      Store ID: {store_id}
      Comment: {comment}

      <button onClick={setShowReplyContent(!showReplyContent)}>
        {showReportContent ? 'Reply' : 'Cancel'}
      </button>

      {showReplyContent &&
        (<form onSubmit={handleSubmit}>
          <label className="form-label">Reply:</label>
          <input 
            type="response" 
            className="form-control" 
            value={reply}
            onChange={(e) => setReply(e.target.value)}
          />
          <button type="submit">
            Post
          </button>
        </form>)
      }
    </div>
  );
}

function ReportList(store_id) {
  const { data: reports = {}, isLoading: reportsLoading, error: reportsError, refetch: reportsRefetch } = window.ReactQuery.useQuery({
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

  if (reports == []) {
    return (
    <div className="flex min-h-screen flex-col pt-24 px-4 md:px-10 bg-gray-50">
      <h1 className="text-4xl font-bold text-gray-800 mb-2">Reports</h1>
      No reports.
    </div>
    );
  }

  return (
    reports.map(report => {
      if (!reports || reports === 0) {return null;}
      return (
        <Report 
          report_id={report.id}
          user_id={report.user_id}
          store_id={report.store_id}
          order_id={report.order_id}
          comment={report.comment}
        />
      )
    })
  )
}

function ReportsPage() {
  const user_id = localStorage.getItem('userId');

  const { data: stores = {}, isLoading: storesLoading, error: storesError, refetch: storeRefetch } = window.ReactQuery.useQuery({
    queryKey: ['user_id', user_id],
    queryFn: () => get_user_stores(user_id)
  });

  if (storesLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-600">Loading stores...</div>
      </div>
    );
  }

  if (storesError) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-600">Error getting store.</div>
      </div>
    );
  }

  if (stores.length === 0) {
    return (
    <div className="flex min-h-screen flex-col pt-24 px-4 md:px-10 bg-gray-50">
      <h1 className="text-4xl font-bold text-gray-800 mb-2">Reports</h1>
      No reports.
    </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col pt-24 px-4 md:px-10 bg-gray-50">
      <h1 className="text-4xl font-bold text-gray-800 mb-2">Reports</h1>
      {stores.map(store => {
        <ReportList
          store_id={store.id}
        />
      })}
    </div>
  );
}