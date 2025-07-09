import React from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { LogOut } from "lucide-react";

interface LogoutButtonProps {
  className?: string;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

const LogoutButton: React.FC<LogoutButtonProps> = ({
  className = "",
  variant = "outline",
  size = "default",
}) => {
  const { signOut, user } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      // The signOut function now handles the page reload
    } catch (error) {
      console.error("Logout error:", error);
      // Fallback: reload page even if signOut fails
      window.location.reload();
    }
  };

  // Don't render if no user is authenticated
  if (!user) {
    return null;
  }

  return (
    <Button
      onClick={handleLogout}
      variant={variant}
      size={size}
      className={`flex items-center space-x-2 ${className}`}
    >
      <LogOut className="h-4 w-4" />
      <span>Se déconnecter</span>
    </Button>
  );
};

export default LogoutButton;
