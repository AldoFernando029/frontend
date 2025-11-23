// utils/auth.ts
export interface User {
  email: string;
  name: string;
}

const storageKeyUser = "rasamanado_user";
const storageKeyToken = "rasamanado_token";

// SAFE localStorage wrapper
const safe = {
  get(key: string) {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(key);
  },
  set(key: string, value: string) {
    if (typeof window === "undefined") return;
    localStorage.setItem(key, value);
  },
  remove(key: string) {
    if (typeof window === "undefined") return;
    localStorage.removeItem(key);
  }
};

export function loginUser(email: string, password: string): boolean {
  const validUsers = [
    { email: "admin@rasamanado.com", password: "admin123", name: "Administrator" },
    { email: "user@example.com", password: "user123", name: "Regular User" }
  ];

  const user = validUsers.find(u => u.email === email && u.password === password);
  if (!user) return false;

  safe.set(storageKeyUser, JSON.stringify(user));
  safe.set(storageKeyToken, "token-" + Date.now());
  return true;
}

export function logoutUser() {
  safe.remove(storageKeyUser);
  safe.remove(storageKeyToken);
}

export function isLoggedIn(): boolean {
  return safe.get(storageKeyToken) !== null;
}

export function getCurrentUser(): User | null {
  const data = safe.get(storageKeyUser);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}
