class HomePage extends React.Component {
    constructor(props) {
        super(props);
    }

    // This is what gets called after the render() function has been called, so the elements in that function
    // have been added to the webpage and can be altered.
    componentDidMount() {
        // This function, props.GetRestaurants(), is what was given to us when constructing the object.
        // See farther below to see how to pass props into a constructor.
        let data = ["Chick-Fil-A", "Starbucks", "Taco Bell"];

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
export default HomePage