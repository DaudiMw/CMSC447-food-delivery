function Report({
  report_id,
  user_id,
  dasher_id,
  order_id,
  store_id,
  comment,
}) {
  return (
    <div>
      Report ID: {report_id}
      User ID: {user_id}
      Dasher ID: {dasher_id}
      Order ID: {order_id}
      Store ID: {store_id}
      Comment: {comment}
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
          report_id={report.report_id}
          user_id={report.user_id}
          dasher_id={report.dasher_id}
          order_id={report.order_id}
          store_id={report.store_id}
          comment={report.comment}
        />
      )
    })
  )
}

function ReportsPage({user_id}) {
  const [stores, setStores] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchStores = async () => {
      try {
        const response = await fetch(`http://localhost:8000/stores/${user_id}`);
        const data = await response.json();
        setStores(data);
      } catch (error) {
        console.error("Failed to fetch user's stores", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStores();
  }, [user_id]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-600">Loading user stores...</div>
      </div>
    );
  }

  if (!stores) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-600">No stores found.</div>
      </div>
    );
  }

  return (
    stores.map(store => {
      <ReportList
        store_id={store.store_id}
      />
    })
  );
}