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