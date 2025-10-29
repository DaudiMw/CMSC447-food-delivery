// index.js - Simple hash-based routing (no React Router needed)

const { HashRouter, Switch, Route, Link } = window.ReactRouterDOM;
const { QueryClient, QueryClientProvider, useQuery } = window.ReactQuery;


console.log('ReactRouterDOM:', window.ReactRouterDOM);
console.log('ReactQuery:', window.ReactQuery);

// function App() {
//   // const [currentPage, setCurrentPage] = React.useState(window.location.hash || '#/');

//   // React.useEffect(() => {
//   //   const handleHashChange = () => {
//   //     setCurrentPage(window.location.hash || '#/');
//   //   };

//   //   window.addEventListener('hashchange', handleHashChange);
//   //   return () => window.removeEventListener('hashchange', handleHashChange);
//   // }, []);

//   // const renderPage = () => {
//   //   switch(currentPage) {
//   //     case '#/':
//   //     case '#/login':
//   //       return <LoginPage />;
//   //     case '#/signup':
//   //       return <SignupPage />;
//   //     case '#/dashboard':
//   //       return <DashboardPage />;
//   //     default:
//   //       return <LoginPage />;
//   //   }
//   // };

//   // return renderPage();
//   return <StorePage store_id={'5426ff85-e5ae-42f3-8dc7-bead81ecac08'} />
// }

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
                    
                    {/* Protected routes - any authenticated user */}
                    <ProtectedRoute path="/" component={BasePage} />"
                    <ProtectedRoute path="/home" component={HomePage} />
                    
                    {/* Admin only routes */}
                    {/* <ProtectedRoute 
                        path="/admin" 
                        component={AdminPage} 
                        allowedRoles={['admin']}
                    /> */}
                    
                    {/* Driver routes */}
                    {/* <ProtectedRoute 
                        path="/driver" 
                        component={DriverPage} 
                        allowedRoles={['driver', 'admin']}
                    /> */}
                </Switch>
            </HashRouter>
        </QueryClientProvider>
    );
}

// // Login Page Component
function LoginPage() {
  return (
    <div style={{
      backgroundImage: "url('images/maryland-flag-black-gray.jpg')", 
      backgroundSize: "cover",
      backgroundPosition: "center",
      height: "100vh",
      position: "relative"
    }}>
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)"
      }}></div>
      <div className="d-flex justify-content-center align-items-center vh-100" style={{position: "relative", zIndex: 1}}>
        <div className="card p-4 shadow" style={{ minWidth: "500px" }}>
          <h1 className="text-center mb-4">Login</h1>
          <LoginForm />
          <p className="text-center mt-3">
            Don't have an account? <a href="#/signup" className="text-primary" style={{textDecoration: 'none'}}>Sign Up</a>
          </p>
        </div>
      </div>
    </div>
  );
}

class BasePage extends React.Component {
  render() {
      return (
          <div className="basepage">
              <div className="banner">
                  <img className="logo" src="images/UMBCLogo.png"></img>
                  <button className="bannerButton restaurantButton">
                      Restaurants
                  </button>
                  <button className="bannerButton ordersButton">
                      View Orders
                  </button>
                  <button className="rounded-md bg-color">
                      Settings
                  </button>
                  {/* <button class="mx-5 my-5 flex h-12 w-24 items-center justify-center rounded-md border border-2 border-black bg-red-600 p-4 font-semibold text-white shadow-md transition duration-200 hover:scale-110 hover:shadow-xl"
                      onClick={() =>
                        logout()
                        window.ReactRouterDOM.history.push('/login')}
                  >Logout</button> */}
                  <input type="image" className="settings" src="settings.png" onClick={() => this.props.setPage("Signup")}></input>
                  <input type="image" className="search" src="search.png"></input>
              </div>
          </div>
      )
  }
};

class BasePage extends React.Component {
  render() {
      return (
          <div className="basepage">
              <div className="banner">
                  <img className="logo" src="UMBCLogo.png"></img>
                  <button className="bannerButton restaurantButton">
                      Restaurants
                  </button>
                  <button className="bannerButton ordersButton">
                      View Orders
                  </button>
                  <input type="image" className="settings" src="settings.png"></input>
                  <input type="image" className="search" src="search.png"></input>
              </div>
          </div>
      )
  }
};

// Login Page Component
function LoginPage() {
  return (
    <div style={{
      backgroundImage: "url('images/maryland-flag-black-gray.jpg')", 
      backgroundSize: "cover",
      backgroundPosition: "center",
      height: "100vh",
      position: "relative"
    }}>
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)"
      }}></div>
      <div className="d-flex justify-content-center align-items-center vh-100" style={{position: "relative", zIndex: 1}}>
        <div className="card p-4 shadow" style={{ minWidth: "500px" }}>
          <h1 className="text-center mb-4">Login</h1>
          <LoginForm />
          <p className="text-center mt-3">
            Don't have an account? <a href="#/signup" className="text-primary" style={{textDecoration: 'none'}}>Sign Up</a>
          </p>
        </div>
      </div>
    </div>
  );
}

// Signup Page Component
function SignupPage() {
  return (
    <div style={{
      backgroundImage: "url('images/maryland-flag-black-gray.jpg')", 
      backgroundSize: "cover",
      backgroundPosition: "center",
      height: "100vh",
      position: "relative"
    }}>
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)"
      }}></div>
      <div className="d-flex justify-content-center align-items-center vh-100" style={{position: "relative", zIndex: 1}}>
        <div className="card p-4 shadow" style={{ minWidth: "500px" }}>
          <h1 className="text-center mb-4">Sign Up</h1>
          <SignupForm />
          <p className="text-center mt-3">
            Already have an account? <a href="#/login" className="text-primary" style={{textDecoration: 'none'}}>Login</a>
          </p>
        </div>
      </div>
    </div>
  );
}

class HomePage extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        let data = this.props.GetRestaurants();
        const restaurants = document.getElementsByClassName("restaurants")[0];
        data.forEach(element => {
            const newDiv = document.createElement('div');
            newDiv.textContent = element;
            restaurants.appendChild(newDiv);
        });
    }

    render() {
        return (
            <div className="homepage">
                <div className="restaurants"></div>
            </div>
        )
    }
}

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
class SignupPage extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div style={{
        backgroundImage: "url('images/maryland-flag-black-gray.jpg')", 
        backgroundSize: "cover",
        backgroundPosition: "center",
        height: "100vh",
        position: "relative"
      }}>
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)"
        }}></div>
        <div className="d-flex justify-content-center align-items-center vh-100" style={{position: "relative", zIndex: 1}}>
          <div className="card p-4 shadow" style={{ minWidth: "500px" }}>
            <h1 className="text-center mb-4">Sign Up</h1>
            <SignupForm setPage={this.props.setPage}/>
            <p className="text-center mt-3">
              Already have an account? <Link to="/login" className="text-primary" style={{textDecoration: 'none'}}>
                 Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }
}

// Placeholder Dashboard
function DashboardPage() {
  return (
    <div className="container mt-5">
      <h1>Dashboard</h1>
      <p>Welcome to your dashboard!</p>
      <a href="#/login" className="btn btn-primary">Logout</a>
    </div>
  );
}

// Render the app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<LoginPage />);
