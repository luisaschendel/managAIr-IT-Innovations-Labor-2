import { useState } from "react";
import type { UserData } from "../types";

export function useAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);

  const handleLogin = (employeeNumber: string, password: string) => {
    setUserData({ employeeNumber, password });
    setIsLoggedIn(true);
  };

  return { isLoggedIn, userData, handleLogin };
}
