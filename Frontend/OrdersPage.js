class OrdersPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = { selectedOrders: [] }
    }
    async componentDidMount() {
        const user_id = this.props.match.params.user_id
        
        let data = await get_user_order_history(user_id);
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
            checkbox.style.height = "20px"
            checkbox.style.width = "20px"
            right.appendChild(checkbox);

            const middle = document.createElement('div');
            middle.className = "orderMiddle";
            middle.textContent = "Description";
            middle.style.color = "black";
            orderDiv.appendChild(middle);
            const info = document.createElement('div');
            info.className = "orderInfo";
            const status = document.createElement('div');
            status.textContent = "Status: " + element.status;
            status.style.color = getStatusColor(element.status);
            info.appendChild(status);
            const total = document.createElement('div');
            total.textContent = "Total: $" + element.items.reduce((acc, orderItem) => acc + orderItem.item.price * orderItem.quantity, 0).toFixed(2);
            total.style.color = "white"
            info.appendChild(total);
            const arrivalTime = document.createElement('div');
            arrivalTime.textContent = "Estimated Arrival: " + (element.completed_at ? new Date(element.completed_at).toLocaleTimeString() : 'N/A');
            arrivalTime.style.color = "white"
            info.appendChild(arrivalTime);
            middle.appendChild(info);

            const image = document.createElement('img');
            image.className = "orderImage";
            image.src = element.store.logo_id ? `http://localhost:8000/media/${element.store.logo_id}` : '';
            image.alt = element.store.name;
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
                        <button className="cancelOrder hover:scale-105 transition duration:2s" onClick={() => cancel_orders()}>
                            Cancel Orders
                        </button>
                        <button className="cancelOrder hover:scale-105 transition duration:2s" onClick={() => report_order()}>
                            Report Order
                        </button>
                    </div>
                </div>
            </div>
        )
    }
}

function getStatusColor(status) {
    switch (status) {
        case 'completed':
            return 'green';
        case 'pending':
            return 'orange';
        case 'accepted':
            return 'blue';
        case 'dropped':
            return 'red';
        default:
            return 'black';
    }
}

async function get_user_order_history(userId) {
    try {
        const response = await authFetch(`/users/${userId}/order-history`, { method: 'GET' });
        return response;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

async function report_order() {

}

async function cancel_orders() {
    let checkBoxes = document.getElementsByClassName("ordersCheckbox");
    let orders = await get_user_order_history(getUserId());
    if (checkBoxes.length >= 1) {
        for (let i = 0; i < checkBoxes.length; i++) {
            if (checkBoxes[i].checked) {
                delete_order(orders[i].id)
            }
        }
        window.location.reload();
    }
}

async function delete_order(orderID) {
    try {
        const response = await authFetch(`/orders/${getUserId()}/${orderID}`, { method: 'DELETE' });
        return response;
    } catch (error) {
        console.log(error);
        throw error;
    }
}