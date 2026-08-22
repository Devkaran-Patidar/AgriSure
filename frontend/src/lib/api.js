const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

export async function apiRequest(path, options = {}) {
  const token = localStorage.getItem("access_token");
  const isForm = options.body instanceof FormData;
  const headers = { ...(isForm ? {} : {"Content-Type":"application/json"}), ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;

  let response = await fetch(`${API_BASE_URL}${path}`, {...options, headers});

  if (response.status === 401 && localStorage.getItem("refresh_token") && !path.includes("/auth/token/")) {
    const refreshResponse = await fetch(`${API_BASE_URL}/auth/token/refresh/`, {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({refresh:localStorage.getItem("refresh_token")})
    });
    if (refreshResponse.ok) {
      const refreshData = await refreshResponse.json();
      localStorage.setItem("access_token", refreshData.access);
      headers.Authorization = `Bearer ${refreshData.access}`;
      response = await fetch(`${API_BASE_URL}${path}`, {...options, headers});
    }
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.detail || data.message || Object.values(data).flat().join(" ") || "Request failed");
    error.data = data; error.status = response.status; throw error;
  }
  return data;
}

export async function login(email,password) {
  const data = await apiRequest("/accounts/auth/login/", {
    method:"POST", body:JSON.stringify({email,password})
  });
  localStorage.setItem("access_token",data.access);
  localStorage.setItem("refresh_token",data.refresh);
  localStorage.setItem("user",JSON.stringify(data.user));
  return data;
}
export function logout(){ ["access_token","refresh_token","user"].forEach(k=>localStorage.removeItem(k)); }
export function getStoredUser(){ try{return JSON.parse(localStorage.getItem("user"))}catch{return null} }
