class BasePage extends React.Component {
    render() {
        return (
            <div className="basepage">
                <div className="banner">
                    <img className="logo" src="UMBCLogo.png"></img>
                    <button className="restaurantButton">
                        Restaurants
                    </button>
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
        this.data = this.props.GetData()
        return (
            <div className="homepage">
            </div>
        )
    }
}

class MyApp extends React.Component {
    FetchRestaurantData = () => {
        return;
    }
    render() {
        return (
            <div>
                <BasePage />
                <HomePage GetData={this.FetchRestaurantData} />
            </div>
        )
    }
};

const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);
root.render(<MyApp />);