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

const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);
root.render(<MyApp />);