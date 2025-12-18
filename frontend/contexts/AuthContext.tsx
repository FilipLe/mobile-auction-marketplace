// File: app/contexts/AuthContext.tsx
// Functionality: context to handle user authentication
// Author: Nguyen Le


import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { API_BASE_URL } from '../services/api';

// user interface
interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

// profile interface
interface Profile {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  profile_image: string;
  bio_text: string;
  user: User;
}

// auth context interface
interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  token: string | null;
  loading: boolean;
  
  // attempt login with Django API, returns true/false
  login: (username: string, password: string) => Promise<boolean>;
  
  // attempt registration through Django API
  register: (username: string, email: string, password: string, profileData: any) => Promise<boolean>;
  
  // clear auth and local storage
  logout: () => Promise<void>;

  // refresh user profile from backend
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // variables to store states
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // on reload, load saved auth
  useEffect(() => {
    loadStoredAuth();
  }, []);

  // handle loading stored auth 
  const loadStoredAuth = async () => {
    try {
      // read token, user, profile from async storage
      const storedToken = await AsyncStorage.getItem('auth_token');
      const storedUser = await AsyncStorage.getItem('auth_user');
      const storedProfile = await AsyncStorage.getItem('auth_profile');
      
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        if (storedProfile) {
          // if profile stored, set it
          setProfile(JSON.parse(storedProfile));
        } else {
          // if not stored, fetch profile from API
          await fetchProfile(JSON.parse(storedUser).id, storedToken);
        }
      }
    } catch (error) {
      console.error('Error loading stored auth:', error);
    } finally {
      setLoading(false);
    }
  };

  // fetch profile 
  const fetchProfile = async (userId: number, authToken: string) => {
    try {
      // fetch profile from Django endpoint
      const response = await fetch(`${API_BASE_URL}/api/profiles/`, {
        headers: {
          'Authorization': `Token ${authToken}`,
        },
      });
      
      // fetch successful
      if (response.ok) {
        // retrieve json representation
        const data = await response.json();

        // retrieve profiles, and handle pagination
        const profiles = data.results || data; 

        // find profile that matches the user
        const userProfile = Array.isArray(profiles) 
          ? profiles.find((p: Profile) => p.user?.id === userId)
          : null;
        if (userProfile) {
          setProfile(userProfile);
          await AsyncStorage.setItem('auth_profile', JSON.stringify(userProfile));
        }
      }
    } catch (error) {
      // error fetching
      console.error('Error fetching profile:', error);
    }
  };

  // send username + password to django login endpoint
  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      // POST response, which requires method, header, body
      const response = await fetch(`${API_BASE_URL}/api/auth/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      // response received 
      if (response.ok) {
        // retrieve json representation
        const data = await response.json();
        
        // the login endpoint returns {token, user, profile}
        const authToken = data.token;
        const userData = data.user;
        const profileData = data.profile;
        
        // login successful
        if (authToken && userData) {
          // update context state 
          setToken(authToken);
          setUser(userData);
          setProfile(profileData || null);
          
          // persist to async storage
          await AsyncStorage.setItem('auth_token', authToken);
          await AsyncStorage.setItem('auth_user', JSON.stringify(userData));
          
          if (profileData) {
            await AsyncStorage.setItem('auth_profile', JSON.stringify(profileData));
          }
          
          return true;
        }
      } else {
        // login error 
        const errorData = await response.json().catch(() => ({}));
        console.error('Login failed:', response.status, errorData);
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  // send registration form data to Django endpoint
  const register = async (
    username: string,
    email: string,
    password: string,
    profileData: any
  ): Promise<boolean> => {
    try {
      // POST response, which requires method, header, body
      const response = await fetch(`${API_BASE_URL}/api/auth/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          email,
          password,
          first_name: profileData.first_name || '',
          last_name: profileData.last_name || '',
          profile_username: profileData.username || username,
          bio_text: profileData.bio_text || '',
        }),
      });

      // response received
      if (response.ok) {
        // retrieve json representation
        const data = await response.json();

        // endpoint returns {token, user, profile}
        const authToken = data.token;
        const userData = data.user;
        const profileInfo = data.profile;
        
        // successful registration
        if (authToken && userData) {

          // if profile image was provided, update the profile with image
          if (profileData.profile_image && profileInfo) {
            try {
              const formData = new FormData();
              const filename = profileData.profile_image.split('/').pop();
              const match = /\.(\w+)$/.exec(filename || '');
              const type = match ? `image/${match[1]}` : `image/jpeg`;
              
              formData.append('profile_image', {
                uri: profileData.profile_image,
                name: filename || 'image.jpg',
                type,
              } as any);
              
              // update profile with image
              const imageResponse = await fetch(`${API_BASE_URL}/api/profile/${profileInfo.id}/`, {
                method: 'PATCH',
                body: formData,
                headers: {
                  'Authorization': `Token ${authToken}`,
                },
              });
              
              if (imageResponse.ok) {
                const updatedProfile = await imageResponse.json();
                setProfile(updatedProfile);
                await AsyncStorage.setItem('auth_profile', JSON.stringify(updatedProfile));
              }
            } catch (imageError) {
              console.error('Error uploading profile image:', imageError);
            }
          }

          // update context state
          setToken(authToken);
          setUser(userData);
          setProfile(profileInfo || null);
          
          // persist to async storage
          await AsyncStorage.setItem('auth_token', authToken);
          await AsyncStorage.setItem('auth_user', JSON.stringify(userData));
          
          if (profileInfo) {
            await AsyncStorage.setItem('auth_profile', JSON.stringify(profileInfo));
          }
          
          return true;
        }
      } else {
        // register error
        const errorData = await response.json().catch(() => ({}));
        console.error('Registration failed:', response.status, errorData);
      }
      
      return false;
    } catch (error) {
      console.error('Register error:', error);
      return false;
    }
  };

  // handle log out
  const logout = async () => {
    // clear all auth states
    setUser(null);
    setProfile(null);
    setToken(null);

    // remove stored items
    await AsyncStorage.removeItem('auth_token');
    await AsyncStorage.removeItem('auth_user');
    await AsyncStorage.removeItem('auth_profile');
  };

  // handle when profile is updated across app
  const refreshProfile = async () => {
    if (user && token) {
      await fetchProfile(user.id, token);
    }
  };

  // provide auth context
  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        token,
        loading,
        login,
        register,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// hook to access auth state in any component
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}