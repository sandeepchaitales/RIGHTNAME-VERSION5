import React, { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AuthCallback = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { processSessionId } = useAuth();
    const hasProcessed = useRef(false);

    useEffect(() => {
        // Prevent double processing in StrictMode
        if (hasProcessed.current) return;
        hasProcessed.current = true;

        const processAuth = async () => {
            // Extract session_id from URL fragment
            const hash = location.hash;
            const params = new URLSearchParams(hash.replace('#', ''));
            const sessionId = params.get('session_id');

            if (sessionId) {
                const user = await processSessionId(sessionId);
                if (user) {
                    // Navigate to home page with user data
                    navigate('/', { state: { user }, replace: true });
                } else {
                    // Auth failed, go to landing
                    navigate('/', { replace: true });
                }
            } else {
                // No session_id, go to landing
                navigate('/', { replace: true });
            }
        };

        processAuth();
    }, [location.hash, navigate, processSessionId]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto mb-4"></div>
                <p className="text-slate-600">Signing you in...</p>
            </div>
        </div>
    );
};

export default AuthCallback;
