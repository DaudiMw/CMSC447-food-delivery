const { HashRouter, Switch, Route, Link } = window.ReactRouterDOM;

function ItemDisplay({
  item_id,
  name,
  item_type,
  description,
  price,
  picture,
  store_id,
  nutrition_info,
}) {
  const [showNutrition, setShowNutrition] = React.useState(false);

  return (
    <>
    <div className="flex flex-col sm:flex-row overflow-hidden rounded-xl bg-white shadow-md hover:shadow-lg transition-shadow">
        {/* Image */}
        <div className="flex h-48 sm:h-auto w-full sm:w-40 flex-shrink-0 items-center justify-center bg-gray-200 text-gray-500">
          {picture ? ( // 'picture' prop is actually 'picture_id'
            <img src={`http://localhost:8000/media/${picture}`} alt={name} className="h-full w-full object-cover rounded-xl" style={{ imageRendering: 'auto' }} />
          ) : (
            <p className="text-sm font-medium">No Image</p>
          )}
        </div>
        
        {/* Content section */}
        <div className="flex flex-col sm:flex-row flex-grow">
          {/* Text content */}
          <div className="flex flex-col justify-center p-4 flex-grow">
            <h4 className="text-lg font-bold text-gray-900 mb-1">{name}</h4>
            <p className="text-sm text-gray-600 mb-2 line-clamp-2">{description}</p>
            <p className="text-xl font-bold text-gray-900">${price}</p>
          </div>

          {/* Buttons - stack on mobile, vertical on desktop */}
          <div className="flex sm:flex-col justify-stretch sm:justify-center gap-2 p-4 sm:w-32 flex-shrink-0">
            <button className="btn btn-action">
              Add to Cart
            </button>
            
            <button
              onClick={() => setShowNutrition(true)}
              className="btn btn-secondary"
            >
              Details
            </button>
            {(getUserRole() === "admin" || checkStoreOwnership(getUserId(), store_id)) && (
                <button
                    onClick={(e) => { e.stopPropagation(); window.location.hash = `#/store/${store_id}/item/${item_id}/edit`; }}
                    className="btn btn-edit"
                >
                    Edit
                </button>
            )}
          </div>
        </div>
      </div>

      {showNutrition && (
        <NutritionModal 
          onClose={() => setShowNutrition(false)} 
          nutrition_info={nutrition_info}
          itemName={name || description}
        />
      )}
    </>
  );
}

function NutritionModal({ onClose, nutrition_info, itemName }) {
  // The JSX for your modal remains the same
  const modalContent = (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl mx-4"
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 h-8 w-8 rounded-full text-2xl text-gray-500 transition hover:bg-gray-200 hover:text-gray-800"
        >
          &times;
        </button>
        
        <h3 className="text-2xl font-bold text-gray-900 mb-4">{itemName}</h3>
        <ItemInfoDisplay nutrition_info={nutrition_info} />
      </div>
    </div>
  );

  // Use the portal to render the modal content into the 'modal-root' div
  return ReactDOM.createPortal(
    modalContent,
    document.getElementById('modal-root')
  );
}

function ItemInfoDisplay({ nutrition_info }) {
  if (!nutrition_info) {
    return (
      <div className="text-center text-gray-500 py-4">
        No nutrition information available
      </div>
    );
  }
  
  const excludeFields = ['item_info_id', 'is_deleted'];
  
  return (
    <div className="space-y-2 text-sm">
      <h4 className="font-semibold text-lg mb-4">Nutrition Facts</h4>
      <div className="space-y-2">
        {Object.entries(nutrition_info)
          .filter(([key]) => !excludeFields.includes(key))
          .map(([key, value]) => {
            const label = key.split('_').map(word => 
              word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ');
            
            return (
              <div key={key} className="flex justify-between border-b pb-2">
                <span className="text-gray-600">{label}:</span>
                <span className="font-medium">{value}</span>
              </div>
            );
          })}
      </div>
    </div>
  );
}

function ItemList({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white py-8 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-gray-500 text-center">No items available</p>
        </div>
      </div>
    );
  }

  const groupedItems = data.reduce((acc, item) => {
    const type = item.item_type || 'other';
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(item);
    return acc;
  }, {});

  const itemTypeOrder = ['entree', 'side', 'drink', 'dessert', 'other'];
  const itemTypeLabels = {
    entree: 'Entrees',
    side: 'Sides',
    drink: 'Drinks',
    dessert: 'Desserts',
    other: 'Other Items'
  };

  return (
    <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 py-8 px-4 md:px-6">
      <div className="max-w-5xl mx-auto">
        {itemTypeOrder.map(type => {
          const items = groupedItems[type];
          if (!items || items.length === 0) return null;
          
          return (
            <div key={type} className="mb-12">
              <h3 className="text-3xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-amber-400">
                {itemTypeLabels[type]}
              </h3>
              <div className="space-y-4">
                {items.map(item => (
                  <ItemDisplay
                    key={item.id}
                    item_id={item.id}
                    name={item.name}
                    item_type={item.item_type}
                    description={item.description}
                    price={item.price}
                    picture={item.picture_id}
                    store_id={item.store_id}
                    nutrition_info={item.nutrition_info}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function getOpenCloseTime(hours){
    const now = new Date();
    const currentDay = now.getDay();

    for (const dayObj of hours){
      if (dayObj.day === currentDay){
        if (dayObj.start_time && dayObj.end_time){
          return {'start_time': dayObj.start_time,
                  'end_time':dayObj.end_time,
                  'is_open': dayObj.start_time <= now && dayObj.end_time >= now
          }
        }
      }
    }

    return null
}

function StorePage() {

  const { store_id } = ReactRouterDOM.useParams();

  const { data: store = {}, isLoading: storeLoading, error: storeError, refetch: storeRefetch } = window.ReactQuery.useQuery({
    queryKey: ['store', store_id],
    queryFn: () => get_store_info_with_items(store_id)
  });

  if (storeLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-600">Loading store...</div>
      </div>
    );
  }

  if (storeError){
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-600">Error getting store.</div>
      </div>
    )
  }

  if (!store) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-600">Store not found.</div>
      </div>
    );
  }

  const imageUrl = store.banner_id ? `http://localhost:8000/media/${store.banner_id}` : '/placeholder.jpg';

  // const 
  
  // Format the address as a string
  const addressString = store.address 
    ? `${store.address.street}, ${store.address.city}, ${store.address.state} ${store.address.zip}`
    : 'Address not available';


  const hours = getOpenCloseTime(store.hours);

  return (
    <div className="min-h-screen bg-gradient-to-br mt-18 from-amber-50 via-orange-50 to-yellow-50">
      {/* Hero Section - Company Image */}
      <div className="relative w-full h-60 md:h-[420px] bg-cover bg-center" style={{ backgroundImage: `url(${imageUrl})` }}>
        <div className="absolute inset-0 bg-black opacity-25"></div>
      </div>

      {/* Store Info Section */}
      <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 px-4 md:px-6 py-8 mb-5">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
            {store.name || 'Store'}
          </h1>
          <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-2 md:gap-4">
            {hours && (
              <div>
                <p className={`text-lg md:text-2xl ${hours.is_open ? 'text-green-600' : 'text-red-600'}`}>
                  {hours.start_time}-{hours.end_time}
                </p>
                <span className={hours.is_open ? 'text-green-600' : 'text-red-600'}>
                  {hours.is_open ? 'Open' : 'Closed'}
                </span>
              </div>
            )}
            <p className="text-base md:text-xl text-gray-800">
              {addressString}
            </p>
          </div>
          {(getUserRole() === "admin" || checkStoreOwnership(getUserId(), store_id)) && (
            <button className="btn btn-edit mt-5" onClick ={() => window.location.hash = `#/store/${store_id}/edit`}>Edit Store Info</button>
          )}
        </div>
      </div>

      {/* Menu Items Section */}
      <div className="bg-white">
        {(getUserRole() === "admin" || checkStoreOwnership(getUserId(), store_id)) && (
          <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 flex justify-end">
            <button 
              className="btn btn-action" 
              onClick={() => window.location.hash = `#/store/${store_id}/add-item`}
            >
              Add Item
            </button>
          </div>
        )}
        <ItemList data={store.items || []} />
      </div>
    </div>
  );
}