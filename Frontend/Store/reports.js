const { useQuery, useQueryClient, useMutation } = window.ReactQuery;
const { HashRouter, Switch, Route, Link } = window.ReactRouterDOM;
const { useParams, useHistory } = ReactRouterDOM;

function Report({ 
  report_id,
  user_id,
  store_name,
  order_id,
  comment,
  reply }) {

  return (
    <tr className="p-3 border-b hover:bg-amber-100">
      <td className="p-3">{report_id}</td>
      <td className="p-3">{order_id}</td>
      <td className="p-3">{user_id}</td>
      <td className="p-3">{store_name}</td>
      <td className="p-3">{comment}</td>
      <td className="p-3">{reply ? reply: 'N/A'}</td>
    </tr>
  );
}

function StoreOwnerReport({ 
  query_client,
  report_id,
  user_id,
  store_name,
  order_id,
  comment,
  reply }) {
  const [response, setReply] = React.useState(null);
  const [replyExists, setReplyExists] = React.useState(false);
  const [replyButton, setReplyButton] = React.useState("btn btn-delete");
  const [replyButtonText, setReplyButtonText] = React.useState('Reply');
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

  React.useEffect(
    () => {
      if (!showReplyContent) {
        replyExists ? setReplyButtonText('Edit') : setReplyButtonText('Reply')
        replyExists ? setReplyButton('btn btn-action') : setReplyButton('btn btn-success')
      }
      else {
        setReplyButtonText('Cancel')
        setReplyButton('btn btn-delete')
      }
    }
  )

  var handleSubmit = async () => {
    const replyData = {response: response};

    reportReplyMutation.mutate({ replyData, report_id })
  };

  return (
    <tr className="p-3 border-b hover:bg-amber-100">
      <td className="p-3">{report_id}</td>
      <td className="p-3">{order_id}</td>
      <td className="p-3">{user_id}</td>
      <td className="p-3">{store_name}</td>
      <td className="p-3">{comment}</td>
      <td className="p-3">{reply ? reply: 'N/A'}</td>

      <td className="text-right p-3">
        <button className={replyButton} onClick={() => setShowReplyContent(!showReplyContent)}>
          {replyButtonText}
        </button>
      </td>

      <td className="p-3">
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
    queryKey: ['store_id', 'report', store_id],
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
          store_name={report.store.name}
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

  const [storeIdSelect, setStoreIdSelect] = React.useState(null);

  const handleDropdownInfo = (e) => {
    if (e == "false") {
      setStoreIdSelect(false);
    }
    else {
      setStoreIdSelect(e);
    }
  }

  const { data: userReports, isLoading: userReportsLoading, error: userReportsError, refetch: userReportRefetch } = useQuery({
    queryKey: ['user_id', 'report', user_id],
    queryFn: () => get_reports_by_user_id(user_id)
  });

  const { data: stores, isLoading: storesLoading, error: storesError, refetch: storeRefetch } = useQuery({
    queryKey: ['user_id', user_id],
    queryFn: () => get_user_stores(user_id)
  });

  if (storesLoading || userReportsLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (storesError || userReportsError) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-600">Error fetching data.</div>
      </div>
    );
  }

  if (stores.length === 0 && userReports.length > 0) {
    return (
    <div className="flex min-h-screen flex-col pt-24 px-4 md:px-10 bg-gray-50">
      <h1 className="text-4xl font-bold text-gray-800 mb-2">Reports</h1>
      <h1 className="text-2xl font-bold text-gray-800 mb-2 p-3">My Reports</h1>
      <div className="bg-white rounded-lg border border-gray-300 p-8 flex-basis-auto min-w-max items-center gap-4">
        <table className="table-auto w-full border-collapse min-w-[600px]">
          <thead>
            <tr>
              <th>Report ID</th>
              <th>Order ID</th>
              <th>User ID</th>
              <th>Store Name</th>
              <th>Comment</th>
              <th>Reply</th>
            </tr>
          </thead>
          <tbody>
            {userReports.map(report => (
              <Report
                report_id={report.id}
                user_id={report.user_id}
                store_name={report.store.name}
                order_id={report.order_id}
                comment={report.comment}
                reply={report.response}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
    );
  }

  if (stores.length > 0 && userReports.length === 0) {
    return (
    <div className="flex min-h-screen flex-col pt-24 px-4 md:px-10 bg-gray-50">
      <h1 className="text-4xl font-bold text-gray-800 mb-2">Reports</h1>
        <select value={storeIdSelect} onChange={(e) => handleDropdownInfo(e.target.value)}>
          <option value="false">My Reports</option>
          <optgroup label="Stores">
          {stores.map(store => (<option value={store.id}>{store.name}</option>))}
          </optgroup>
        </select>
        {storeIdSelect ? 
        (<div className="bg-white rounded-lg border border-gray-300 p-8 flex-basis-auto min-w-max items-center gap-4">
          <table className="table-auto w-full border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-3 text-left font-semibold border-b">Report ID</th>
                <th className="p-3 text-left font-semibold border-b">Order ID</th>
                <th className="p-3 text-left font-semibold border-b">User ID</th>
                <th className="p-3 text-left font-semibold border-b">Store Name</th>
                <th className="p-3 text-left font-semibold border-b">Comment</th>
                <th className="p-3 text-left font-semibold border-b">Reply</th>
                <th className="p-3 text-left font-semibold border-b"></th>
                <th className="p-3 text-left font-semibold border-b"></th>
              </tr>
            </thead>
              <StoreReportList
                query_client={queryClient}
                store_id={storeIdSelect}/>
          </table>
        </div>):
        (<div className="bg-white rounded-lg border border-gray-300 p-8 flex-basis-auto min-w-max items-center gap-4">
          <table className="table-auto w-full border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-3 text-left font-semibold border-b">Report ID</th>
                <th className="p-3 text-left font-semibold border-b">Order ID</th>
                <th className="p-3 text-left font-semibold border-b">User ID</th>
                <th className="p-3 text-left font-semibold border-b">Store Name</th>
                <th className="p-3 text-left font-semibold border-b">Comment</th>
                <th className="p-3 text-left font-semibold border-b">Reply</th>
              </tr>
            </thead>
            <tbody>
              {userReports.map(report => (
                <Report
                  report_id={report.id}
                  user_id={report.user_id}
                  store_name={report.store.name}
                  order_id={report.order_id}
                  comment={report.comment}
                  reply={report.response}
                />
              ))}
            </tbody>
          </table>
        </div>)}
    </div>
    );
  }

  if (stores.length === 0 && userReports.length === 0) {
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
        <select value={storeIdSelect} onChange={(e) => handleDropdownInfo(e.target.value)}>
          <option value="false">My Reports</option>
          <optgroup label="Stores">
          {stores.map(store => (<option value={store.id}>{store.name}</option>))}
          </optgroup>
        </select>
        {storeIdSelect ? 
        (<div className="bg-white rounded-lg border border-gray-300 p-8 flex-basis-auto min-w-max items-center gap-4">
          <table className="table-auto w-full border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-3 text-left font-semibold border-b">Report ID</th>
                <th className="p-3 text-left font-semibold border-b">Order ID</th>
                <th className="p-3 text-left font-semibold border-b">User ID</th>
                <th className="p-3 text-left font-semibold border-b">Store Name</th>
                <th className="p-3 text-left font-semibold border-b">Comment</th>
                <th className="p-3 text-left font-semibold border-b">Reply</th>
                <th className="p-3 text-left font-semibold border-b"></th>
                <th className="p-3 text-left font-semibold border-b"></th>
              </tr>
            </thead>
              <StoreReportList
                query_client={queryClient}
                store_id={storeIdSelect}/>
          </table>
        </div>):
        (<div className="bg-white rounded-lg border border-gray-300 p-8 flex-basis-auto min-w-max items-center gap-4">
          <table className="table-auto w-full border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-3 text-left font-semibold border-b">Report ID</th>
                <th className="p-3 text-left font-semibold border-b">Order ID</th>
                <th className="p-3 text-left font-semibold border-b">User ID</th>
                <th className="p-3 text-left font-semibold border-b">Store Name</th>
                <th className="p-3 text-left font-semibold border-b">Comment</th>
                <th className="p-3 text-left font-semibold border-b">Reply</th>
              </tr>
            </thead>
            <tbody>
              {userReports.map(report => (
                <Report
                  report_id={report.id}
                  user_id={report.user_id}
                  store_name={report.store.name}
                  order_id={report.order_id}
                  comment={report.comment}
                  reply={report.response}
                />
              ))}
            </tbody>
          </table>
        </div>)}
    </div>
  );
}