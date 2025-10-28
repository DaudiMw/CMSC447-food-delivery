// index.js - Simple hash-based routing (no React Router needed)

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



function AppWithProvider () {

  
  return (
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
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
//           <LoginForm />
//           <p className="text-center mt-3">
//             Don't have an account? <a href="#/signup" className="text-primary" style={{textDecoration: 'none'}}>Sign Up</a>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }

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
                </div>
            </div>
        )
    }
}

class HomePage extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        let data = this.props.GetRestaurants();
        const restaurants = document.getElementById("restaurants");
        if (restaurants != null) {
            data.forEach(element => {
                const newDiv = document.createElement('div');
                newDiv.textContent = element;
                restaurants.appendChild(newDiv);
            });
        }
        return (
            <div className="homepage">
                <div className="restaurants"></div>
            </div>
        )
    }
}

class MyApp extends React.Component {

    FetchRestaurantData = () => {
        return ["Chick-Fil-A", "Starbucks"];
    }
    render() {
        return (
            <div>
                <BasePage />
                <HomePage GetRestaurants={this.FetchRestaurantData} />
            </div>
        )
    }
};

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
root.render(<MyApp/>);