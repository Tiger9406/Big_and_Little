// See https://docs.expo.dev/router/reference/authentication/

import { useEffect, useContext, createContext } from 'react';
import { useStorageState } from './useStorageState';
import { jwtDecode, InvalidTokenError } from 'jwt-decode';

import Constants from "expo-constants";

const AuthContext = createContext({
  signIn: () => null,
  signOut: () => null,
  session: null,
  isLoading: false,
});

// This hook can be used to access the user info.
export function useSession() {
  const value = useContext(AuthContext);
  if (process.env.NODE_ENV !== 'production') {
    if (!value) {
      throw new Error('useSession must be wrapped in a <SessionProvider />');
    }
  }

  return value;
}

export function SessionProvider({ children }) {
  const [[isLoading, session], setSession] = useStorageState('session');
  
  useEffect(() => {
    if (session !== null) {
      try {
        // Check if JWT is expired
        const decoded = jwtDecode(session);
        if (Date.now() >= decoded.exp * 1000) {
          setSession(null);
        }
      } catch (e) {
        // JWT is in invalid format
        if (e instanceof InvalidTokenError) {
          setSession(null);
        } else {
          throw e;
        }
      }
    }
  }, [session]);

  return (
    <AuthContext.Provider
      value={{
        signIn: async (payload) => {
          if(payload.newToken) {
            setSession(payload.newToken);
            return {
              success: true,
            };
          }
          // TODO: Probably not ideal
          // Get IP that Expo server is using to host app, allows to connect with the backend
          const URI = Constants.expoConfig.hostUri.split(':').shift();

          // POST to /login with payload
          const response = await fetch(`http://${URI}:${process.env.EXPO_PUBLIC_PORT}/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
          });

          if (response.ok) {
            setSession(await response.text());
            return {
              success: true,
            }
          } else {
            return {
              success: false,
              message: await response.text()
            }
          }
        },
        signOut: () => {
          setSession(null);
        },
        session,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
