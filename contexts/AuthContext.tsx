import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { dbService } from '../services/dbService';

declare global {
  interface Window {
    google: any;
  }
}

// 실제 사용을 위해서는 Google Cloud Console에서 발급받은 클라이언트 ID를 아래에 입력해야 합니다.
// 예: '123456789-abcdefg.apps.googleusercontent.com'
const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID_HERE.apps.googleusercontent.com';

interface AuthContextType {
  user: User | null;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [tokenClient, setTokenClient] = useState<any>(null);

  useEffect(() => {
    // 1. Load local user
    const storedUser = localStorage.getItem('kim_current_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);

    // 2. Initialize Google Token Client
    const intervalId = setInterval(() => {
        if (window.google && window.google.accounts) {
            const client = window.google.accounts.oauth2.initTokenClient({
                client_id: GOOGLE_CLIENT_ID,
                scope: 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
                callback: async (tokenResponse: any) => {
                    if (tokenResponse && tokenResponse.access_token) {
                        try {
                            // Fetch actual user info from Google
                            const userInfo = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                                headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                            }).then(res => res.json());

                            const newUser: User = {
                                uid: userInfo.sub,
                                email: userInfo.email,
                                displayName: userInfo.name,
                                photoURL: userInfo.picture,
                                provider: 'google',
                                createdAt: new Date().toISOString()
                            };

                            setUser(newUser);
                            localStorage.setItem('kim_current_user', JSON.stringify(newUser));
                            
                            // Save to DB for Admin
                            await dbService.saveUser(newUser);
                        } catch (error) {
                            console.error("Failed to fetch user info", error);
                            alert("회원 정보를 가져오는데 실패했습니다.");
                        }
                    }
                },
            });
            setTokenClient(client);
            clearInterval(intervalId);
        }
    }, 500);

    return () => clearInterval(intervalId);
  }, []);

  const loginWithGoogle = async () => {
    if (GOOGLE_CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID_HERE.apps.googleusercontent.com') {
        alert("Google Client ID가 설정되지 않았습니다. AuthContext.tsx 파일에서 GOOGLE_CLIENT_ID를 설정해주세요.");
        
        // --- Fallback for Demo purposes (remove this in production) ---
        // 클라이언트 ID가 없을 때 테스트용으로 가짜 로그인 실행
        console.warn("Using simulation mode due to missing Client ID");
        const mockUser: User = {
            uid: `google-sim-${Date.now()}`,
            email: `simulation${Math.floor(Math.random() * 100)}@gmail.com`,
            displayName: 'Simulation User',
            photoURL: 'https://lh3.googleusercontent.com/a/default-user=s96-c',
            provider: 'google',
            createdAt: new Date().toISOString()
        };
        setUser(mockUser);
        localStorage.setItem('kim_current_user', JSON.stringify(mockUser));
        await dbService.saveUser(mockUser);
        // -------------------------------------------------------------
        return;
    }

    if (tokenClient) {
        tokenClient.requestAccessToken();
    } else {
        alert("Google 로그인이 아직 초기화되지 않았거나 로드 중입니다. 잠시 후 다시 시도해주세요.");
    }
  };

  const logout = () => {
    // Revoke token if needed, but for now just clear local state
    if (user && window.google) {
        window.google.accounts.id.disableAutoSelect();
    }
    setUser(null);
    localStorage.removeItem('kim_current_user');
  };

  return (
    <AuthContext.Provider value={{ user, loginWithGoogle, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};