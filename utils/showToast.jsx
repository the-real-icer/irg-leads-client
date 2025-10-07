import { toast } from 'react-toastify';

const showToast = (type, message, heading, position = 'top-left') => {
    if (!['success', 'error', 'info', 'warn', 'warning'].includes(type)) {
        console.error(`Invalid toast type: ${type}`); // eslint-disable-line
        return;
    }

    // Map cogo-toast positions to react-toastify positions
    const positionMap = {
        'top-left': 'top-left',
        'top-center': 'top-center',
        'top-right': 'top-right',
        'bottom-left': 'bottom-left',
        'bottom-center': 'bottom-center',
        'bottom-right': 'bottom-right',
    };

    const toastOptions = {
        position: positionMap[position] || 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
    };

    // Render toast with heading and message
    toast[type](
        heading ? (
            <div>
                <strong>{heading}</strong>
                <div>{message}</div>
            </div>
        ) : (
            message
        ),
        toastOptions,
    );
};

export default showToast;
