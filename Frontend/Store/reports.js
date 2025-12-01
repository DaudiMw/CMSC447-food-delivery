const { HashRouter, Switch, Route, Link } = window.ReactRouterDOM;

function Report({
  report_id,
  user_id,
  store_id,
  order_id,
  comment,
}) {
  const [response, setResponse] = React.useEffect(null);

  var handleSubmit = async () => {
    const responseData = {response: response};

    try {
        const response = await fetch(`localhost:8000/reports/${report_id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(responseData),
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
  };

  return (
    <div>
      Report ID: {report_id}
      Order ID: {order_id}
      User ID: {user_id}
      Store ID: {store_id}
      Comment: {comment}
      <form onSubmit={handleSubmit}>
        <label className="form-label">Response:</label>
        <input 
          type="response" 
          className="form-control" 
          value={response}
          onChange={(e) => setResponse(e.target.value)}
          required
        />
        <button type="submit">
          Post
        </button>
      </form>
    </div>
  );
}

function ReportList(store_id) {
  const [reports, setReports] = React.useState(null);

  React.useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await fetch(`http://localhost:8000/reports/${store_id}`);
        const data = await response.json();
        setReports(data);
      } catch (error) {
        console.error("Failed to fetch user's stores", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, [store_id]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-600">Loading reports...</div>
      </div>
    );
  }

  if (!reports) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-600">No reports found.</div>
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

  if (stores == []) {
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