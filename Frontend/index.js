// index.js - Simple hash-based routing (no React Router needed)

function App() {
  const [currentPage, setCurrentPage] = React.useState(window.location.hash || '#/');

  React.useEffect(() => {
    const handleHashChange = () => {
      setCurrentPage(window.location.hash || '#/');
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const renderPage = () => {
    switch(currentPage) {
      case '#/':
      case '#/login':
        return <LoginPage />;
      case '#/signup':
        return <SignupPage />;
      case '#/dashboard':
        return <DashboardPage />;
      default:
        return <LoginPage />;
    }
  };

  return renderPage();
}

// Login Page Component
function LoginPage() {
  return (
    <div style={{
      backgroundImage: "url('images/maryland-flag-black-gray.jpg')", 
      backgroundSize: "cover",
      backgroundPosition: "center",
      height: "100vh",
      position: "relative"
    }}>
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)"
      }}></div>
      <div className="d-flex justify-content-center align-items-center vh-100" style={{position: "relative", zIndex: 1}}>
        <div className="card p-4 shadow" style={{ minWidth: "500px" }}>
          <h1 className="text-center mb-4">Login</h1>
          <LoginForm />
          <p className="text-center mt-3">
            Don't have an account? <a href="#/signup" className="text-primary" style={{textDecoration: 'none'}}>Sign Up</a>
          </p>
        </div>
      </div>
    </div>
  );
}

// Signup Page Component
function SignupPage() {
  return (
    <div style={{
      backgroundImage: "url('images/maryland-flag-black-gray.jpg')", 
      backgroundSize: "cover",
      backgroundPosition: "center",
      height: "100vh",
      position: "relative"
    }}>
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)"
      }}></div>
      <div className="d-flex justify-content-center align-items-center vh-100" style={{position: "relative", zIndex: 1}}>
        <div className="card p-4 shadow" style={{ minWidth: "500px" }}>
          <h1 className="text-center mb-4">Sign Up</h1>
          <SignupForm />
          <p className="text-center mt-3">
            Already have an account? <a href="#/login" className="text-primary" style={{textDecoration: 'none'}}>Login</a>
          </p>
        </div>
      </div>
    </div>
  );
}

// Placeholder Dashboard
function DashboardPage() {
  return (
    <div className="container mt-5">
      <h1>Dashboard</h1>
      <p>Welcome to your dashboard!</p>
      <a href="#/login" className="btn btn-primary">Logout</a>
    </div>
  );
}

// Render the app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);