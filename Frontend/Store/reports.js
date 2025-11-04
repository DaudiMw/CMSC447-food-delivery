function ReportsPage({store_id}) {
    const [reports, setReports] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchReports = async () => {
            try {
                const response = await fetch(`http://localhost:8000/reports/${store_id}`);
                const data = await response.json();
                setReports(data);
            } catch (error) {
                console.error("Failed to fetch reports:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStoreData();
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
    {reports.map(report => {
        
    })}
  );
}