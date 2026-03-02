import { toast } from 'react-toastify';

const showToast = (type, message, heading, position) => {
    if (!['success', 'error', 'info', 'warn', 'warning'].includes(type)) {
        console.error(`Invalid toast type: ${type}`); // eslint-disable-line
        return;
    }

    const toastType = type === 'warning' ? 'warn' : type;
    const options = position ? { position } : {};

    toast[toastType](
        heading ? (
            <div>
                <strong>{heading}</strong>
                <div>{message}</div>
            </div>
        ) : (
            message
        ),
        options,
    );
};

export default showToast;
