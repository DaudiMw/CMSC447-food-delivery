class MyApp extends React.Component {
    render() {
        return (
            <div className="content">
                <div className="header">
                    <button className="button">
                        Restaurants
                    </button>
                </div>
            </div>
        )
    }
};

const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);
root.render(<MyApp />);