import api from '../api/main';


async function fetchProtectedData() {
    try {
        const response = await api.get('/users/me');
        return response.data;
    } catch (error) {
        console.error('Error fetching protected data:', error);
        throw error;
    }
}

class ProtectedRoute extends React.Component {
    // The constructor will take in which role is allowed to access the route
    constructor(role, props) {
        super(props);
        this.role = role;
        this.state = {
            isAuthorized: false,
            isLoading: true,
        };
    }
    async checkAuthorization() {
        userData = await fetchProtectedData();
        if (userData.role === this.role) {
            this.setState({ isAuthorized: true, isLoading: false });
        } else {
            this.setState({ isAuthorized: false, isLoading: false });
        }
    }
    componentDidMount() {
        this.checkAuthorization();
    }
}