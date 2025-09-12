// Redux & Connect
import { PersistGate } from 'redux-persist/integration/react';
import { Provider } from 'react-redux';
import { wrapper } from '../store';

// Prop-Types
import PropTypes from 'prop-types';

// React-Toastify
import { ToastContainer } from 'react-toastify';

// Google Login
import { GoogleOAuthProvider } from '@react-oauth/google';

// Component Style
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import '../sass/main.scss';

const MyApp = ({ Component, ...rest }) => {
    // _________________________________Constants________________________\\
    // Redux STORE
    const { store, props } = wrapper.useWrappedStore(rest);
    const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

    return (
        <Provider store={store}>
            <PersistGate persistor={store.__persistor}>
                <GoogleOAuthProvider clientId={CLIENT_ID}>
                    <ToastContainer
                        position="top-right" // Default position
                        autoClose={3000} // Close after 3 seconds
                        hideProgressBar={false}
                        newestOnTop={false}
                        closeOnClick
                        rtl={false}
                        pauseOnFocusLoss
                        draggable
                        pauseOnHover
                    />
                    <Component {...props.pageProps} />
                </GoogleOAuthProvider>
            </PersistGate>
        </Provider>
    );
};

MyApp.propTypes = {
    Component: PropTypes.elementType.isRequired,
    pageProps: PropTypes.object, // Optional, as pages may not pass props
};

export default wrapper.withRedux(MyApp);
