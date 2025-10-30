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

class SettingsPage extends React.Component {
    render() {
        return (
            <div className="settingsPage">
                Settings
            </div>
        )
    }
}

class BasePage extends React.Component {
    render() {
        return (
            <div className="basepage">
                {this.props.page}
                <div className="banner">
                    <input type="image" className="logo" src="images/UMBCLogo.png" onClick={() => this.props.setPage("Home")}></input>
                    <button className="bannerButton restaurantButton" onClick={() => this.props.setPage("Home")}>
                        Restaurants
                    </button>
                    <button className="bannerButton ordersButton" onClick={() => this.props.setPage("Orders")}>
                        View Orders
                    </button>
                    <input type="image" className="settings" src="settings.png" onClick={() => this.props.setPage("Settings")}></input>
                    <input type="image" className="search" src="search.png"></input>
                </div>
            </div>
        )
    }
}

class HomePage extends React.Component {
    constructor(props) {
        super(props);
    }

    // This is what gets called after the render() function has been called, so the elements in that function
    // have been added to the webpage and can be altered.
    componentDidMount() {
        // This function, props.GetRestaurants(), is what was given to us when constructing the object.
        // See farther below to see how to pass props into a constructor.
        let data = this.props.GetRestaurants();

        // Gets the div called restaurants, you can see where it is in this class's render() function.
        const restaurants = document.getElementsByClassName("restaurants")[0];
        // For every restaurant in the database, do this.
        data.forEach(element => {
            // Create a new div
            const restaurantDiv = document.createElement('div');
            // Give it a className, which home.css has parameters to modify.
            restaurantDiv.className = "restaurant";
            
            const restaurantTitle = document.createElement('div');
            restaurantTitle.className = "restaurantTitle";
            // This is the title, which in the case is the name of the restaurant.
            restaurantTitle.textContent = element;
            // Add the title to the other previously created div.
            restaurantDiv.appendChild(restaurantTitle);

            // Popular items, same logic as above
            for (let i = 0; i < 4; i++) {
                const popularItem = document.createElement('div');
                popularItem.className = "popularItem";
                restaurantDiv.appendChild(popularItem);
            }

            // Add the first div we created to the restaurants div, so it will now be rendered as well.
            restaurants.appendChild(restaurantDiv);
        });
    }

    render() {
        return (
            <div className="homepage">
                <div className="restaurants">
                    <header className="restaurantGridTitle">Restaurants</header>
                </div>
            </div>
        )
    }
}

// STARTING HERE!!!
// The class must extend React.Component so that React is able to call the render() function
class MyApp extends React.Component {
    // First, this gets called. It's just a normal constructor, it has to get called before render
    constructor() {
        super();
        // Here the initial state is set. The state is just something else that React.Component gives us,
        // it's not defined here. It also cannot be set directly outside of the constructor....
        this.state = {page: "Home"};
    }

    // ....That's what this function is for. It accepts an ID (which in this case should be a string),
    // and then calls setState (another React thing), setting this object's state.page variable to the
    // ID that was passed in.
    setPage = (id) => {
        // Also, calling this forces React to reload the page, which is relevant for reasons below.
        this.setState({
            page: id
        });
        console.log(`MyApp.setPage(name: ${id})`);
    }

    // This is used in MyApp's render function below. It just checks the current object's state.page
    // variable, and returns a page based on that.
    // Also, if you're wondering why we don't need to make these fields, idk why but it's just
    // JavaScript being able to do that and being cursed.
    getPage() {
        // This is the home "landing" page, currently what it is initialized to show up first.
        if (this.state.page == "Home") {
            return (
                // All this needs to do is return an object.
                // However, here is where we get to set the props.
                // I think it's similar to how passing a function's arguments works, kinda.
                // For every variable in props you want to set (props.setPage and props.page in this case),
                // you just declare it here by setting a name equal to something and it works.
                // Also it must be enclosed in {} because reasons.
                // props.page in this case is set to another page to render inside the BasePage render() function,
                // and that also gets its own props, which is GetRestaurant.
                <BasePage setPage={this.setPage} page={<HomePage GetRestaurants={this.FetchRestaurantData}></HomePage>}></BasePage>
            );
        }
        // A similar process for all below.
        else if (this.state.page == "Orders") {
            return (
                <BasePage setPage={this.setPage} page={<OrdersPage GetOrders={this.FetchOrders}></OrdersPage>}></BasePage>
            );
        }
        else if (this.state.page == "Settings") {
            return (
                <BasePage setPage={this.setPage} page={<SettingsPage></SettingsPage>}></BasePage>
            );
        }
        else if (this.state.page == "Signup") {
            return (
                <SignupPage setPage={this.setPage}></SignupPage>
            );
        }
    }

    // These are defined here so that they're easy to find and change, and so they can be given to multiple
    // pages and not have to be copied.
    // Need to be filled with actual requests to the database
    FetchRestaurantData = () => {
        return ["Chick-Fil-A", "Starbucks", "Taco Bell"];
    }

    FetchOrders = () => {
        return ["Order 1", "Order 2", "Order 3"];
    }

    // Finally, this is the render function for MyApp. It is what gets called to display the page.
    render() {
        // Get the page...
        const pageNode = this.getPage();
        return (
            // ...render it inside of a div (it has to be inside a <div> or it won't work/render anything).
            <div>
                {pageNode}
            </div>
        );
    }
};

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
              Already have an account? <a href="#/login" className="text-primary" style={{textDecoration: 'none'}}>Login</a>
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
// Construct an object out of MyApp and render it.
root.render(<MyApp/>);