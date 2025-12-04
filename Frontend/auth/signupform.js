// auth/signup.js

const API_BASE_URL = 'http://127.0.0.1:8000'; // Update with your actual API URL

function SignupForm(props) {
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [confirmPassword, setConfirmPassword] = React.useState('');
    const [firstName, setFirstName] = React.useState('');
    const [lastName, setLastName] = React.useState('');
    const [campusId, setCampusId] = React.useState('');
    const [error, setError] = React.useState('');
    const [success, setSuccess] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    
    const history = window.ReactRouterDOM.useHistory();

    const Signup = async (userData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
                credentials: 'same-origin',
                redirect: 'manual',
                mode: 'cors'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Signup failed');
            }

            return await response.json();

        } catch (error) {
            console.error('Error during signup:', error);
            throw error;
        }
    };

    const handleSubmit = async () => {
        setError('');
        setSuccess(false);

        // Validate passwords match
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            const userData = {
                email,
                password,
                first_name: firstName,
                last_name: lastName,
                campus_id: campusId,
            };

            const data = await Signup(userData);
            
            console.log('Signup successful:', data);
            
            window.location.hash = '#/login';
            
        } catch (error) {
            setError(error.message || 'Signup failed. Please try again.');
        } finally {
            setLoading(false);
        }
        return false;
    };

    return (
        <div>
            <div className="mb-3">
                <label className="form-label">First Name</label>
                <input 
                    type="text" 
                    className="form-control" 
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    disabled={loading}
                />
            </div>
            
            <div className="mb-3">
                <label className="form-label">Last Name</label>
                <input 
                    type="text" 
                    className="form-control" 
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    disabled={loading}
                />
            </div>

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

            <div className="mb-3">
                <label className="form-label">Confirm Password</label>
                <input 
                    type="password" 
                    className="form-control"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={loading}
                />
            </div>

            <div className="mb-3">
                <label className="form-label">Campus Id</label>
                <input 
                    type="text" 
                    className="form-control" 
                    value={campusId}
                    onChange={(e) => setCampusId(e.target.value)}
                    required
                    disabled={loading}
                />
            </div>
            
            {error && (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            )}

            <Toast 
                message="Signup successful! You can now log in."
                type="success"
                show={success}
                onClose={() => setSuccess(false)}
            />
            
            <button 
                type="button" 
                className="btn btn-lg w-100 btn-action"
                disabled={loading}
                onClick={handleSubmit}
            >
                {loading ? 'Signing up...' : 'Sign Up'}
            </button>
        </div>
    );
}