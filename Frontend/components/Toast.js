// components/Toast.js

function Toast({ message, type, show, onClose }) {
    const [visible, setVisible] = React.useState(show);

    React.useEffect(() => {
        setVisible(show);
        if (show) {
            const timer = setTimeout(() => {
                handleClose();
            }, 5000); // Auto-hide after 5 seconds
            return () => clearTimeout(timer);
        }
    }, [show]);

    const handleClose = () => {
        setVisible(false);
        if (onClose) {
            onClose();
        }
    };

    if (!visible) {
        return null;
    }

    const toastClass = `toast align-items-center text-white bg-${type} border-0`;

    return (
        <div 
            className="toast-container position-fixed top-0 end-0 p-3" 
            style={{ zIndex: 1100 }}
        >
            <div 
                className={toastClass}
                role="alert" 
                aria-live="assertive" 
                aria-atomic="true"
                style={{ display: 'block' }} // Directly control visibility
            >
                <div className="d-flex">
                    <div className="toast-body">
                        {message}
                    </div>
                    <button 
                        type="button" 
                        className="btn-close btn-close-white me-2 m-auto" 
                        onClick={handleClose} 
                        aria-label="Close"
                    ></button>
                </div>
            </div>
        </div>
    );
}
