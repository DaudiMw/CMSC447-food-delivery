const API_BASE_URL = 'http://127.0.0.1:8000';

function LoginForm(props) {
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [error, setError] = React.useState('');
    const [loading, setLoading] = React.useState(false);

    const history = window.ReactRouterDOM.useHistory();

    const Login = async (username, password) => {
        try {
            // Create form data the correct way
            const formData = new FormData();
            formData.append('username', username);
            formData.append('password', password);

            const response = await fetch(`${API_BASE_URL}/token`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Login failed');
            }

            // Parse and return the JSON data
            return await response.json();

        } catch (error) {
            console.error('Error during login:', error);
            throw error;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Login already returns parsed JSON
            const data = await Login(email, password);

            // Store the token
            localStorage.setItem('authToken', data.access_token);
            
            // Decode the JWT to get the role (simple base64 decode)
            const tokenParts = data.access_token.split('.');
            const payload = JSON.parse(atob(tokenParts[1]));
            
            // Store role and user_id
            localStorage.setItem('userRole', payload.role);
            localStorage.setItem('userId', payload.user_id);

            history.push('/home');
            
        } catch (error) {
            setError(error.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="mb-3">
                <label className="form-label">Email</label>
                <input 
                    type="email" 
                    className="form-control" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                />
            </div>
            <div className="mb-3">
                <label className="form-label">Password</label>
                <input 
                    type="password" 
                    className="form-control"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                />
            </div>
            
            {error && (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            )}
            
            <button 
                type="submit" 
                className="btn btn-lg w-100" 
                style={{backgroundColor: "orange", color: "black"}}
                disabled={loading}
            >
                {loading ? 'Logging in...' : 'Login'}
            </button>
        </form>
    );
}