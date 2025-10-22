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

class MyApp extends React.Component {
    render() {
        return (
            <BasePage />
        )
    }
};

const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);
root.render(<MyApp />);