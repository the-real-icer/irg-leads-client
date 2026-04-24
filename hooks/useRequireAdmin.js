import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';

const useRequireAdmin = () => {
    const router = useRouter();
    const agent = useSelector((state) => state.agent);
    const isLoggedIn = useSelector((state) => state.isLoggedIn);
    const authChecked = useSelector((state) => state.authChecked);

    const authResolved = authChecked;
    const isAdmin = agent?.role === 'admin';
    const allowed = authResolved && Boolean(isLoggedIn) && isAdmin;

    useEffect(() => {
        if (!router.isReady || !authResolved) return;

        if (!isLoggedIn) {
            router.replace('/');
            return;
        }

        if (!isAdmin) {
            router.replace('/dashboard');
        }
    }, [authResolved, isAdmin, isLoggedIn, router]);

    return { isAdmin, authResolved, allowed, isLoggedIn };
};

export default useRequireAdmin;
