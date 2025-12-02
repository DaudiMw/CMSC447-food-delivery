const { HashRouter, Switch, Route, Link } = window.ReactRouterDOM;
const { QueryClient, QueryClientProvider } = window.ReactQuery;
const { ReactQueryDevtools } = window.ReactQueryDevtools;

const queryClient = new QueryClient()

function MyApp() {
    return (
        <QueryClientProvider client={queryClient}>
            <HashRouter>
                <Switch>
                    {/* Public routes */}
                    <Route path="/login" component={LoginPage} />
                    <Route path="/signup" component={SignupPage} />
                    <Route path="/unauthorized" component={UnauthorizedPage} />
                    
                    {/* Protected routes */}
                    <ProtectedRoute exact path="/" component={HomePage} />
                    <ProtectedRoute path="/home" component={HomePage} />
                    <ProtectedRoute path="/settings" component={SettingsPage} />
                    <ProtectedRoute path="/user/:user_id" component={UserPage} />
                    <ProtectedRoute path="/:user_id/orders" component={OrdersPage} />
                    <ProtectedRoute path="/stores/create" component={StoreCreatePage} allowed_roles={['admin']} />
                    <ProtectedRoute path="/store/:store_id/edit" component={StoreEditPage} allowed_roles={['admin', 'store_owner']} />
                    <ProtectedRoute path="/store/:store_id/add-item" component={AddItemPage} allowed_roles={['admin', 'store_owner']} />
                    <ProtectedRoute path="/store/:store_id/item/:item_id/edit" component={EditItemPage} allowed_roles={['admin', 'store_owner']} />
                    <ProtectedRoute path="/reports" component={ReportsPage} allowed_roles={['admin', 'store_owner']}/>
                    <ProtectedRoute path="/pickups" component={PickupsPage} allowed_roles={['admin', 'store_owner', 'dasher']}/>
                    <ProtectedRoute path="/deliveries" component={DeliveriesPage} allowed_roles={['admin', 'store_owner', 'dasher']}/>
                    <ProtectedRoute path="/stores" component={StoresPage} />
                    <ProtectedRoute path="/store/:store_id" component={StorePage} />
                    <ProtectedRoute path="/cart" component={CartPage} />
                    <ProtectedRoute path="/admin" component={AdminPage} allowed_roles={['admin']} />

                </Switch>
            </HashRouter>
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    );
}

// Login Page Component
function LoginPage() {
  return (
    <div className="bg-cover bg-center h-screen" style={{
      backgroundImage: "url('images/maryland-flag-black-gray.jpg')", 
    }}>
      <div className="bg-black bg-opacity-50 h-full">
        <div className="d-flex justify-content-center align-items-center vh-100">
          <div className="card p-4 shadow w-100 mx-3" style={{ maxWidth: "500px" }}>
            <h1 className="text-center mb-4">Login</h1>
            <LoginForm />
            <p className="text-center mt-3">
              Don't have an account? <a href="#/signup" className="text-primary" style={{textDecoration: 'none'}}>Sign Up</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// // Login Page Component
// function LoginPage() {
//   return (
//     <div style={{
//       backgroundImage: "url('images/maryland-flag-black-gray.jpg')", 
//       backgroundSize: "cover",
//       backgroundPosition: "center",
//       height: "100vh",
//       position: "relative"
//     }}>
//       <div style={{
//         position: "absolute",
//         top: 0,
//         left: 0,
//         right: 0,
//         bottom: 0,
//         backgroundColor: "rgba(0, 0, 0, 0.5)"
//       }}></div>
//       <div className="d-flex justify-content-center align-items-center vh-100" style={{position: "relative", zIndex: 1}}>
//         <div className="card p-4 shadow" style={{ minWidth: "500px" }}>
//           <h1 className="text-center mb-4">Login</h1>
//           <LoginForm setPage={props.setPage}/>
//           <p className="text-center mt-3">
//             Don't have an account? <a href="#/signup" className="text-primary" style={{textDecoration: 'none'}}>Sign Up</a>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }

class OrdersPage extends React.Component {
    componentDidMount() {
        let data = this.props.GetOrders();
        const orderList = document.getElementsByClassName("ordersList")[0];
        data.forEach(element => {
            const orderDiv = document.createElement('div');
            orderDiv.className = "order";

            const right = document.createElement('div');
            right.className = "orderRight";
            orderDiv.appendChild(right);
            const checkbox = document.createElement('input');
            checkbox.className = "ordersCheckbox";
            checkbox.type = "checkbox"
            right.appendChild(checkbox);

            const middle = document.createElement('div');
            middle.className = "orderMiddle";
            middle.textContent = "Description";
            orderDiv.appendChild(middle);
            const info = document.createElement('div');
            info.className = "orderInfo";
            const status = document.createElement('div');
            status.textContent = "Status: Pending";
            info.appendChild(status);
            const total = document.createElement('div');
            total.textContent = "Total: $XX.XX";
            info.appendChild(total);
            const arrivalTime = document.createElement('div');
            arrivalTime.textContent = "Estimated Arrival: XX:XXam/pm";
            info.appendChild(arrivalTime);
            middle.appendChild(info);

            const image = document.createElement('img');
            image.className = "orderImage";
            orderDiv.appendChild(image);

            orderList.appendChild(orderDiv);
        })
    }

    render() {
        return (
            <div className="ordersPage">
                <div className="orders">
                    <header className="ordersGridTitle">
                        Your Orders
                    </header>
                    <div className="ordersList">
                    </div>
                    <div className="orderButtons"></div>
                </div>
            </div>
        )
    }
}

// class SettingsPage extends React.Component {
//     render() {
//         return (
//             <div className="settingsPage">
//                 Settings
//             </div>
//         )
//     }
// }

// class BasePage extends React.Component {
//     render() {
//         return (
//             <div className="basepage">
//                 {this.props.page}
//                 <div className="banner">
//                     <input type="image" className="logo" src="images/UMBCLogo.png" onClick={() => this.props.setPage("Home")}></input>
//                     <button className="bannerButton restaurantButton" onClick={() => this.props.setPage("Home")}>
//                         Restaurants
//                     </button>
//                     <button className="bannerButton ordersButton" onClick={() => this.props.setPage("Orders")}>
//                         View Orders
//                     </button>
//                     <input type="image" className="settings" src="settings.png" onClick={() => this.props.setPage("Settings")}></input>
//                     <input type="image" className="search" src="search.png"></input>
function Banner() {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);

    const { data: cart } = window.ReactQuery.useQuery({
        queryKey: ['cart'],
        queryFn: get_cart,
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: false,
    });

    const itemCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

    const menuItems = (
        <>
            <button 
                className="bannerButton" 
                onClick={() => {
                    window.location.hash = '#/stores';
                    setIsMenuOpen(false);
                }}
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="size-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z" />
                </svg>

                <span>Stores</span>
            </button>

            {(getUserRole() === "dasher" || getUserRole() === "store_owner" || getUserRole() === "admin") && (
              <button 
                  className="bannerButton" 
                  onClick={() => {
                      window.location.hash = '#/pickups';
                      setIsMenuOpen(false);
                  }}
              >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="size-6">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                  </svg>

                  <span>Pickups</span>
              </button>
            )}

            {(getUserRole() === "dasher" || getUserRole() === "store_owner" || getUserRole() === "admin") && (
              <button 
                  className="bannerButton" 
                  onClick={() => {
                      window.location.hash = '#/deliveries';
                      setIsMenuOpen(false);
                  }}
              >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                  </svg>

                  <span>Deliveries</span>
              </button>
            )}

            {(getUserRole() === "store_owner" || getUserRole() === "admin") && (
              <button 
                  className="bannerButton" 
                  onClick={() => {
                      window.location.hash = '#/reports';
                      setIsMenuOpen(false);
                  }}
              >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="size-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
                  </svg>

                  <span>Reports</span>
              </button>
            )}

            {getUserRole() === 'admin' && (
                <button 
                    className="bannerButton adminButton" 
                    onClick={() => {
                        window.location.hash = '#/admin';
                        setIsMenuOpen(false);
                    }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="size-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                    </svg>

                    <span>Admin</span>
                </button>
            )}

            <button 
                className="bannerButton" 
                onClick={() => {
                    window.location.hash = '#/cart';
                    setIsMenuOpen(false);
                }}
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c.51 0 .962-.343 1.087-.835l1.823-6.44a1.125 1.125 0 0 0-.142-1.295A1.125 1.125 0 0 0 16.5 3H5.25" />
                </svg>
                <span>Cart {itemCount > 0 && `(${itemCount})`}</span>
            </button>

            <button 
                className="bannerButton" 
                onClick={() => {
                    window.location.hash = '#/settings';
                    setIsMenuOpen(false);
                }}
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Settings</span>
            </button>
            
            <button 
                className="bannerButton logoutButton" 
                onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                }}
            >
                Logout
            </button>
        </>
    );

    return (
        <div className="banner">
            <img 
                className="logo" 
                src="images/UMBCLogo.png" 
                alt="UMBC Logo"
                onClick={() => window.location.hash = '#/home'}
            />
            
            <div className="md:hidden">
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-white focus:outline-none p-2">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"} />
                    </svg>
                </button>
            </div>
            
            <div className="hidden md:flex banner-controls">
                {menuItems}
            </div>

            {isMenuOpen && (
                <div className="absolute top-[67px] left-0 w-full bg-black md:hidden">
                    <div className="flex flex-col items-center py-2">
                        {menuItems}
                    </div>
                </div>
            )}
        </div>
    );
}

// STARTING HERE!!!
// The class must extend React.Component so that React is able to call the render() function
// class MyApp extends React.Component {
//     // First, this gets called. It's just a normal constructor, it has to get called before render
//     constructor() {
//         super();
//         // Here the initial state is set. The state is just something else that React.Component gives us,
//         // it's not defined here. It also cannot be set directly outside of the constructor....
//         this.state = {page: "Signup"};
//     }

//     // ....That's what this function is for. It accepts an ID (which in this case should be a string),
//     // and then calls setState (another React thing), setting this object's state.page variable to the
//     // ID that was passed in.
//     setPage = (id) => {
//         // Also, calling this forces React to reload the page, which is relevant for reasons below.
//         this.setState({
//             page: id
//         });
//         console.log(`MyApp.setPage(name: ${id})`);
//     }

//     // This is used in MyApp's render function below. It just checks the current object's state.page
//     // variable, and returns a page based on that.
//     // Also, if you're wondering why we don't need to make these fields, idk why but it's just
//     // JavaScript being able to do that and being cursed.
//     getPage() {
//         // This is the home "landing" page, currently what it is initialized to show up first.
//         if (this.state.page == "Home") {
//             return (
//                 // All this needs to do is return an object.
//                 // However, here is where we get to set the props.
//                 // I think it's similar to how passing a function's arguments works, kinda.
//                 // For every variable in props you want to set (props.setPage and props.page in this case),
//                 // you just declare it here by setting a name equal to something and it works.
//                 // Also it must be enclosed in {} because reasons.
//                 // props.page in this case is set to another page to render inside the BasePage render() function,
//                 // and that also gets its own props, which is GetRestaurant.
//                 <BasePage setPage={this.setPage} page={<HomePage GetRestaurants={this.FetchRestaurantData}></HomePage>}></BasePage>
//             );
//         }
//         // A similar process for all below.
//         else if (this.state.page == "Orders") {
//             return (
//                 <BasePage setPage={this.setPage} page={<OrdersPage GetOrders={this.FetchOrders}></OrdersPage>}></BasePage>
//             );
//         }
//         else if (this.state.page == "Settings") {
//             return (
//                 <BasePage setPage={this.setPage} page={<SettingsPage></SettingsPage>}></BasePage>
//             );
//         }
//         else if (this.state.page == "Signup") {
//             return (
//                 <SignupPage setPage={this.setPage}></SignupPage>
//             );

//     // These are defined here so that they're easy to find and change, and so they can be given to multiple
//     // pages and not have to be copied.
//     // Need to be filled with actual requests to the database
//     FetchRestaurantData = () => {
//         return ["Chick-Fil-A", "Starbucks", "Taco Bell"];
//     }

//     FetchOrders = () => {
//         return ["Order 1", "Order 2", "Order 3"];
//     }

//     // Finally, this is the render function for MyApp. It is what gets called to display the page.
//     render() {
//         // Get the page...
//         const pageNode = this.getPage();
//         return (
//             // ...render it inside of a div (it has to be inside a <div> or it won't work/render anything).
//             <div>
//                 {pageNode}
//             </div>
//         );
//     }
// };
    // componentDidMount() {
    //     let data = this.props.GetRestaurants();
    //     const restaurants = document.getElementsByClassName("restaurants")[0];
    //     data.forEach(element => {
    //         const newDiv = document.createElement('div');
    //         newDiv.textContent = element;
    //         restaurants.appendChild(newDiv);
    //     });
    // }

//     render() {
//         // return (
          
//         // )
//     }
// }

// class MyApp extends React.Component {
//     constructor(props) {
//         super(props);
//         this.state = {page: "Stores", store_id: null};
//     }

//     setPage = (id, params) => {
//         console.log('=== setPage CALLED ===');
//         console.log('Called with id:', id);
//         console.log('Current state.page:', this.state.page);
//         console.trace('Call stack:'); // This shows WHERE setPage was called from
//         // this.setState({
//         //     page: id,
//         //     ...params
//         // }, () => {
//         //     console.log('State updated. New page:', this.state.page);
//         // });
//     }

//     // getPage() {
//     //     if (this.state.page == "Home") {
//     //         return (
//     //             <div>
//     //                 <HomePage GetRestaurants={this.FetchRestaurantData}></HomePage>
//     //                 <BasePage setPage={this.setPage} />
//     //             </div>);
//     //     }
//     //     else if (this.state.page == "Signup") {
//     //         return (
//     //             <div>
//     //                 <SignupPage setPage={this.setPage}></SignupPage>
//     //             </div>);
//     //     }
//     //     else if (this.state.page == "Stores"){
//     //       return (
//     //         <div>
//     //           <StoresPage setPage={this.setPage} />
//     //         </div>
//     //       )
//     //     } else if (this.state.page == "Store") {
//     //         return (
//     //             <div>
//     //                 <StorePage store_id={this.state.store_id} />
//     //             </div>
//     //         )
//     //     }
//     // }

  // FetchRestaurantData = () => {
  //     return ["Chick-Fil-A", "Starbucks"];
  // }

  // render() {
  //     const pageNode = this.getPage();
  //     return (
  //         <div>
  //             {pageNode}
  //         </div>
  //     );
  // };

// Signup Page Component

// // Placeholder Dashboard
// function DashboardPage() {
//   return (
//     <div className="container mt-5">
//       <h1>Dashboard</h1>
//       <p>Welcome to your dashboard!</p>
//       <a href="#/login" className="btn btn-primary">Logout</a>
//     </div>
//   );
// }

// Render the app
const root = ReactDOM.createRoot(document.getElementById('root'));
// Construct an object out of MyApp and render it.
root.render(<MyApp/>);
