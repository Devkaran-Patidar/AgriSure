import { createContext,useContext,useEffect,useState } from "react";
import { apiRequest,getStoredUser,login as loginRequest,logout as logoutRequest } from "../lib/api";

const AuthContext=createContext(null);

export function AuthProvider({children}){
  const [user,setUser]=useState(getStoredUser());
  const [loading,setLoading]=useState(true);

  useEffect(()=>{
    if(!localStorage.getItem("access_token")){setLoading(false);return;}
    apiRequest("/auth/me/").then(data=>{setUser(data);localStorage.setItem("user",JSON.stringify(data));})
      .catch(()=>{logoutRequest();setUser(null);}).finally(()=>setLoading(false));
  },[]);

  const login=async(email,password)=>{const data=await loginRequest(email,password);setUser(data.user);return data;};
  const logout=()=>{logoutRequest();setUser(null);};

  return <AuthContext.Provider value={{user,loading,login,logout,isAuthenticated:!!user}}>{children}</AuthContext.Provider>;
}
export const useAuth=()=>useContext(AuthContext);
