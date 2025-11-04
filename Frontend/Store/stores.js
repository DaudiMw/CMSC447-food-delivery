function StoresPage ({ setPage }) {
    // const [stores, setStores] = React.useState("");
    // const [isLoading, setIsLoading] = React.useState(true);

    // React.useEffect(() => {
    //     const fetchStores = async () => {
    //         try {
    //             const response = await fetch('http://localhost:8000/stores/');
    //             const data = await response.json();
    //             setStores(data);
    //         } catch (error) {
    //             console.error('Failed to fetch stores:', error);
    //         } finally {
    //             setIsLoading(false);
    //         }
    //     };

    //     fetchStores();
    // }, []);

    // if (isLoading) return (
    //     <div classNameNameName="font-bold text-xl">
    //         Loading...
    //     </div>
    // )

    // if (!stores) return (
    //     <div classNameNameName="font-bold text-xl">
    //         No stores found.
    //     </div>
    // )

    // else {
        return (
            <div className="flex min-h-screen w-full flex-col gap-4 p-4 md:p-10 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
                <h1 className="text-5xl font-semibold">Stores</h1>
                <div className="mt-2 h-1 w-full border bg-black"></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div onClick={() => setPage("Store", { store_id: '49f378ca-5509-4abd-bcfc-ab2ece923817' })} className="flex h-60 w-full flex-col overflow-hidden rounded-2xl shadow-lg transition duration-200 hover:scale-105 hover:shadow-xl cursor-pointer">
                    {/* Image Container */}
                    <div className="h-3/4 w-full">
                        <img 
                        src="images/image.png" 
                        alt="Exterior of a Chick-fil-a store" 
                        className="h-full w-full object-cover" 
                        />
                    </div>

                    {/* Store Name */}
                    <div className="flex h-1/4 w-full items-center justify-center bg-black text-3xl text-white">
                        Chick-fil-a
                    </div>
                    </div>
                    <div className="flex h-60 w-full flex-col overflow-hidden rounded-2xl shadow-lg transition duration-200 hover:shadow-xl hover:scale-105">
                        <div className="flex h-3/4 w-full items-center justify-center bg-amber-300 text-3xl font-semibold text-gray-400 ">Image</div>
                        <div className="flex h-1/4 w-full justify-center items-center bg-black text-3xl text-white">Store 2</div>
                    </div>
                    <div className="flex h-60 w-full flex-col overflow-hidden rounded-2xl shadow-lg transition duration-200 hover:shadow-xl hover:scale-105">
                        <div className="flex h-3/4 w-full items-center justify-center bg-amber-300 text-3xl font-semibold text-gray-400 ">Image</div>
                        <div className="flex h-1/4 w-full justify-center items-center bg-black text-3xl text-white">Store 3</div>
                    </div>
                </div>
            </div>
        )
    }