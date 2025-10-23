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
    render() {
        return (
            <div className="homepage">

            </div>
        )
    }
}

class MyApp extends React.Component {
    render() {
        return (
            <div>
                <BasePage />
                <HomePage />
            </div>
        )
    }
};

const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);
root.render(<MyApp />);