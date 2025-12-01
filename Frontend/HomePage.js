class HomePage extends React.Component {
    constructor(props) {
        super(props);
    }

    // This is what gets called after the render() function has been called, so the elements in that function
    // have been added to the webpage and can be altered.
    async componentDidMount() {
        // This function, props.GetRestaurants(), is what was given to us when constructing the object.
        // See farther below to see how to pass props into a constructor.
        let data = await get_stores();
        console.log(data);

        // Gets the div called restaurants, you can see where it is in this class's render() function.
        const restaurants = document.getElementsByClassName("restaurants")[0];
        // For every restaurant in the database, do this.
        data.filter(e => !e.deleted).forEach(element => {
            // Create a new div
            const restaurantDiv = document.createElement('div');
            // Give it a className, which home.css has parameters to modify.
            restaurantDiv.className = "restaurant hover:scale-105 transition duration:2s";
            restaurantDiv.style.backgroundImage = `linear-gradient(to top, rgba(255, 255, 255, 0.75), rgba(0, 0, 0, 0)), url('${"http://localhost:8000/media/" + element.banner_id}')`;
            restaurantDiv.style.backgroundSize = "cover";
            restaurantDiv.style.backgroundPosition = "center";
            restaurantDiv.style.backgroundRepeat = "no-repeat";
            
            const restaurantTitle = document.createElement('div');
            restaurantTitle.className = "restaurantTitle";
            // This is the title, which in the case is the name of the restaurant.
            restaurantTitle.textContent = element.name;
            // Add the title to the other previously created div.
            restaurantDiv.appendChild(restaurantTitle);

            // Popular items, same logic as above
            for (let i = 0; i < 4; i++) {
                const popularItem = document.createElement('div');
                popularItem.className = "popularItem hover:scale-105 transition duration:2s";
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
                    {/* <img src="http://localhost:8000/media/2"></img> */}
                    <header className="restaurantGridTitle">Restaurants</header>
                </div>
            </div>
        )
    }
}

/**
 * Function to get stores
 * @returns 
 */
async function get_stores() {
    try {
        const response = await authFetch(`/stores`, { method: 'GET' });
        return response;
    } catch (error) {
        console.log(error)
    }
}