function StoresPage () {
    const [stores, setStores] = React.useState("");
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchStores = async () => {
            try {
                const response = await fetch('http://localhost:8000/stores/');
                const data = await response.json();
                setStores(data);
            } catch (error) {
                console.error('Failed to fetch stores:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStores();
    }, []);

    if (isLoading) return (
        <div className="font-bold text-xl">
            Loading...
        </div>
    )

    if (!stores) return (
        <div className="font-bold text-xl">
            No stores found.
        </div>
    )

    else {
        return (
            <div className="flex flex-grid border rounded-lg">
                {stores.map((store) => (
                    <div className="text-bold font-lg">{store.name}</div>
                ))}
            </div>
        )
    }
}