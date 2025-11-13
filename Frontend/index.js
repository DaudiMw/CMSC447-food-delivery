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
                    <ProtectedRoute path="/:user_id/orders" component={OrdersPage} />
                    <ProtectedRoute path="/stores/create" component={StoreCreatePage} allowed_roles={['admin']} />
                    <ProtectedRoute path="/store/:store_id/edit" component={StoreEditPage} allowed_roles={['admin', 'store_owner']} />
                    <ProtectedRoute path="/reports" component={ReportsPage} />
                    <ProtectedRoute path="/stores" component={StoresPage} />
                    <ProtectedRoute path="/store/:store_id" component={StorePage} />
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
//         }
//     }

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
