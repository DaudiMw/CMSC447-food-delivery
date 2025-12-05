const { HashRouter, Switch, Route, Link } = window.ReactRouterDOM;

function ItemDisplay({
  item_id,
  name,
  item_type,
  description,
  price,
  picture,
  store_id,
  item_info,
  showToast,
}) {
  const [showNutrition, setShowNutrition] = React.useState(false);
  const { useMutation, useQueryClient } = window.ReactQuery;
  const queryClient = useQueryClient();

  const addToCartMutation = useMutation({
    mutationFn: () => add_to_cart(item_id, 1), // Add 1 item by default
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      showToast('success', 'Item added to cart!');
    },
    onError: (error) => {
      console.error(`Error adding item to cart: ${error.message}`);
      showToast('danger', `Error: ${error.message}`);
    }
  });

  const deleteItemMutation = useMutation({
    mutationFn: () => delete_item(item_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store', store_id] });
      showToast('success', 'Item deleted successfully!');
    },
    onError: (error) => {
      console.error(`Error deleting item: ${error.message}`);
      showToast('danger', `Error: ${error.message}`);
    }
  });

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
            <button 
              className="btn btn-action"
              onClick={(e) => { e.preventDefault(); addToCartMutation.mutate() }}
              disabled={addToCartMutation.isLoading}
            >
              {addToCartMutation.isLoading ? 'Adding...' : 'Add to Cart'}
            </button>
            
            <button
              onClick={() => setShowNutrition(true)}
              className="btn btn-secondary"
            >
              Details
            </button>
            {(getUserRole() === "admin" || checkStoreOwnership(getUserId(), store_id) === true) && (
                <>
                    <button
                        onClick={(e) => { e.stopPropagation(); window.location.hash = `#/store/${store_id}/item/${item_id}/edit`; }}
                        className="btn btn-edit"
                    >
                        Edit
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm('Are you sure you want to delete this item?')) {
                                deleteItemMutation.mutate();
                            }
                        }}
                        className="btn btn-danger"
                        disabled={deleteItemMutation.isLoading}
                    >
                        {deleteItemMutation.isLoading ? 'Deleting...' : 'Delete'}
                    </button>
                </>
            )}
          </div>
        </div>
      </div>

      {showNutrition && (
        <NutritionModal 
          onClose={() => setShowNutrition(false)} 
          item_info={item_info}
          itemName={name || description}
        />
      )}
    </>
  );
}

function NutritionModal({ onClose, item_info, itemName }) {  // Change param name
  const modalContent = (
    <div onClick={onClose} className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div onClick={(e) => e.stopPropagation()} className="relative w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl mx-4">
        <button onClick={onClose} className="absolute top-3 right-3 h-8 w-8 rounded-full text-2xl text-gray-500 transition hover:bg-gray-200 hover:text-gray-800">
          &times;
        </button>
        
        <h3 className="text-2xl font-bold text-gray-900 mb-4">{itemName}</h3>
        <ItemInfoDisplay item_info={item_info} />  {/* Change prop name */}
      </div>
    </div>
  );

  // Use the portal to render the modal content into the 'modal-root' div
  return ReactDOM.createPortal(
    modalContent,
    document.getElementById('modal-root')
  );
}

function ItemInfoDisplay({ item_info }) {  // Change param name
  if (!item_info) {
    return (
      <div className="text-center text-gray-500 py-4">
        No nutrition information available
      </div>
    );
  }
  
  const excludeFields = ['item_info_id', 'is_deleted', 'id'];  // Add 'id' to exclude
  
  return (
    <div className="space-y-2 text-sm">
      <h4 className="font-semibold text-lg mb-4">Nutrition Facts</h4>
      <div className="space-y-2">
        {Object.entries(item_info)
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

function ItemList({ data, showToast }) {
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
                    item_info={item.item_info}  // Change from nutrition_info to item_info
                    showToast={showToast}
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

// Helper to format time to AM/PM
function formatTime(timeString) {
  if (!timeString) return '';
  const [hours, minutes] = timeString.split(':').map(Number);
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours % 12 || 12; // Convert 24hr to 12hr format
  return `${formattedHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
}

function getOpenCloseTime(hours) {
  const now = new Date();
  const dayMap = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const currentDay = dayMap[now.getDay()];

  console.log('Current time:', now);
  console.log('Current day:', currentDay);

  for (const dayObj of hours) {
    if (dayObj.day === currentDay) {
      
      if (!dayObj.start_time || !dayObj.end_time) {
        return {
          start_time: null,
          end_time: null,
          is_open: false
        };
      }

      const [startHour, startMinute] = dayObj.start_time.split(':').map(Number);
      const [endHour, endMinute] = dayObj.end_time.split(':').map(Number);

      const startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), startHour, startMinute);
      const endTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), endHour, endMinute);

      console.log('Start time:', startTime);
      console.log('End time:', endTime);
      console.log('Is open?', now >= startTime && now <= endTime);

      return {
        start_time: dayObj.start_time,
        end_time: dayObj.end_time,
        is_open: now >= startTime && now <= endTime,
      };
    }
  }

  return null;
}

function StorePage() {
  const { store_id } = ReactRouterDOM.useParams();
  const [toastInfo, setToastInfo] = React.useState({ show: false, message: '', type: '' });
  const history = ReactRouterDOM.useHistory();

  const { data: store = {}, isLoading: storeLoading, error: storeError, refetch: storeRefetch } = window.ReactQuery.useQuery({
    queryKey: ['store', store_id],
    queryFn: () => get_store_info_with_items(store_id)
  });

  const showToast = (type, message) => {
    setToastInfo({ show: true, message, type });
  };

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
  
  const addressString = store.address 
    ? `${store.address.building ? store.address.building + (store.address.room_number ? ' - Room ' + store.address.room_number : '') + ', ' : ''}${store.address.street}, ${store.address.city}, ${store.address.state} ${store.address.zip}`
    : 'Address not available';

  const hours = getOpenCloseTime(store.hours);

  return (
    <div className="min-h-screen bg-gradient-to-br mt-18 from-amber-50 via-orange-50 to-yellow-50">
      <Toast 
        message={toastInfo.message}
        type={toastInfo.type}
        show={toastInfo.show}
        onClose={() => setToastInfo({ show: false, message: '', type: '' })}
      />
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
                {hours.start_time && hours.end_time ? (
                  <>
                    <p className={hours.is_open ? "text-green-600 text-xl" : "text-red-600 text-xl"}>
                      {formatTime(hours.start_time)} - {formatTime(hours.end_time)}
                    </p>
                    <span className={hours.is_open ? "text-green-600 text-xl" : "text-red-600 text-xl"}>
                      {hours.is_open ? "Open" : "Closed"}
                    </span>
                  </>
                ) : (
                  <p className="text-red-600 text-xl">Closed Today</p>
                )}
              </div>
            )}
            <p className="text-base md:text-xl text-gray-800">
              {addressString}
            </p>
          </div>
          {(getUserRole() === "admin" || checkStoreOwnership(getUserId(), store_id) === true) && (
            <button className="btn btn-edit mt-5" onClick={() => window.location.hash = `#/store/${store_id}/edit?returnTo=store`}>Edit Store Info</button>
          )}
        </div>
      </div>

      {/* Menu Items Section */}
      <div className="bg-white">
        {(getUserRole() === "admin" || checkStoreOwnership(getUserId(), store_id) === true) && (
          <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 flex justify-end">
            <button 
              className="btn btn-action" 
              onClick={() => window.location.hash = `#/store/${store_id}/add-item`}
            >
              Add Item
            </button>
          </div>
        )}
        <ItemList data={store.items || []} showToast={showToast} />
      </div>
    </div>
  );
}