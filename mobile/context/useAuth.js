import { useSession } from './ctx';
import { jwtDecode } from 'jwt-decode';

const useAuth = () => {
    const { session } = useSession();
    
    if (session) {
        try {
        const decoded = jwtDecode(session);
        const { userId, profiles } = decoded.UserInfo;

        return { userId, profiles, token:session };
        } catch (error) {
            console.error("JWT Decode Error:", error);
        }
    }

    return { userId: '', profiles: [], token: null };
};

export default useAuth;