// Add at the top of index.js, before MyApp

const { Redirect } = window.ReactRouterDOM;

// Auth helper functions
async function checkAuth() {
    const token = localStorage.getItem('authToken');
    if (!token) return false;
    
    // Optional: Check if token is expired
    try {
        const tokenParts = token.split('.');
        const payload = JSON.parse(atob(tokenParts[1]));
        const exp = payload.exp * 1000; // Convert to milliseconds
        
        if (Date.now() >= exp) {
            // Token expired, clear storage
            logout();
            return false;
        }
        
        const user = await get_user(payload.id);
        if (user.is_banned) {
            logout();
            return false;
        }
        
        return true;
    } catch (e) {
        return false;
    }
}

function getUserRole() {
    return localStorage.getItem('userRole');
}

function getUserId() {
    return localStorage.getItem('userId');
}

function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    window.location.href = '#/login';
}

function getAuthToken() {
    return localStorage.getItem('authToken');
}

function ProtectedRoute({ component: Component, allowedRoles, ...rest }) {
    const [isAuthenticated, setIsAuthenticated] = React.useState(null);
    const userRole = getUserRole();

    React.useEffect(() => {
        const verifyAuth = async () => {
            const auth = await checkAuth();
            setIsAuthenticated(auth);
        };
        verifyAuth();
    }, []);

    if (isAuthenticated === null) {
        return <div className="flex min-h-full items-center justify-center">
            <div className="text-2xl font-semibold text-gray-600">Loading...</div>
        </div>
    }

    return (
        <Route
            {...rest}
            render={(props) => {
                if (!isAuthenticated) {
                    return <Redirect to="/login" />;
                }
                
                if (allowedRoles && !allowedRoles.includes(userRole)) {
                    return <Redirect to="/unauthorized" />;
                }
                
                return (
                    <div className="flex flex-col min-h-screen">  {/* Changed to min-h-screen */}
                        <div className="flex-shrink-0">  {/* Banner won't shrink */}
                            <Banner />
                        </div>
                        <div className="flex-1 overflow-auto bg-gray-50">  {/* Added bg-gray-50 */}
                            <Component {...props} />
                        </div>
                    </div>
                );
            }}
        />
    );
}

// Unauthorized Page
function UnauthorizedPage() {
    const history = window.ReactRouterDOM.useHistory();
    return (
        <div className="container mt-5 text-center">
            <h1>403 - Unauthorized</h1>
            <p>You don't have permission to access this page.</p>
            <button 
                onClick={() => history.push('/home')} 
                className="btn btn-primary"
            >
                Go Home
            </button>
            <button 
                onClick={() => {
                    logout();
                    history.push('/login');
                }} 
                className="btn btn-secondary ms-2"
            >
                Logout
            </button>
        </div>
    );
}
