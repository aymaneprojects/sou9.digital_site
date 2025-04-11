import { useContext } from "react";
import { LocalAuthContext } from "@/context/LocalAuthContext";

export const useLocalAuth = () => {
  const context = useContext(LocalAuthContext);
  
  if (context === undefined) {
    throw new Error("useLocalAuth must be used within a LocalAuthProvider");
  }
  
  return context;
};