class OrdersPage extends React.Component {
    async componentDidMount() {
        const user_id = this.props.match.params.user_id
        
        let data = await get_user_orders_by_id(user_id);
        const orderList = document.getElementsByClassName("ordersList")[0];
        if (data.length == 0) {
            const noOrders = document.createElement('div');
            noOrders.textContent = "You have no past or current orders";
            noOrders.style.textAlign = "center";
            noOrders.style.alignContent = "center";
            noOrders.style.fontSize = "xx-large"
            orderList.append(noOrders);
            return;
        }
        console.log(data);
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
                    <div className="orderButtons">
                        <button className="cancelOrder hover:scale-105 transition duration:2s">
                            Cancel Orders
                        </button>
                        <button className="cancelOrder hover:scale-105 transition duration:2s">
                            Report Order
                        </button>
                    </div>
                </div>
            </div>
        )
    }
}

/**
 * Function to get user's orders by user ID
 * @param {*} userId 
 * @returns 
 */
async function get_user_orders_by_id(userId) {
    try {
        const response = await authFetch(`/users/${userId}/orders`, { method: 'GET' });
        return response;
    } catch (error) {
        console.log(error)
    }
}