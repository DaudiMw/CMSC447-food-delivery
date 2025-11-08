class SignupPage extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="bg-cover bg-center h-screen" style={{
        backgroundImage: "url('images/maryland-flag-black-gray.jpg')", 
      }}>
        <div className="bg-black bg-opacity-50 h-full">
          <div className="d-flex justify-content-center align-items-center vh-100">
            <div className="card p-4 shadow w-100 mx-3" style={{ maxWidth: "500px" }}>
              <h1 className="text-center mb-4">Sign Up</h1>
              <SignupForm setPage={this.props.setPage}/>
              <p className="text-center mt-3">
                Already have an account? <Link to="/login" className="text-primary" style={{textDecoration: 'none'}}>
                    Login
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }
}