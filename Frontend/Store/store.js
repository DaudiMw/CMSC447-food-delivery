import { useQuery } from '@tanstack/react-query';


const ItemList = () => {
    const { data, error, isLoading } = useStoreItems(storeId);

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error loading items</div>;
    return (
        <ul>
            {data.map(item => (
                <li key={item.id}>{item.name}</li>
            ))}
        </ul>
    );
};

const StoreDetails = () => {
    const { data, error, isLoading } = useStoreDetails(storeId);
    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error loading store details</div>;
    return (
        <div>
            <h1>{data.name}</h1>
            <p>{data.description}</p>
            <p>{data.address}</p>
            <p>{data.phone}</p>
        </div>
    );
}




class StorePage extends React.Component {
    render() {
        return (
            <div>
                
            </div>
        )
    }
}

class StoreItems extends React.Component {
    render() {
        return (
            <div>
                
            </div>
        )
    }
}