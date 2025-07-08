import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";

interface AuthFormProps {
  className?: string;
  isReconnect?: boolean;
  rememberedEmail?: string;
  onReconnectSuccess?: () => void;
}

const AuthForm: React.FC<AuthFormProps> = ({
  className,
  isReconnect = false,
  rememberedEmail = "",
  onReconnectSuccess,
}) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState(rememberedEmail);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const { signIn, signUp } = useAuth();

  useEffect(() => {
    if (isReconnect && rememberedEmail) {
      setEmail(rememberedEmail);
    }
    // Always clear password on component mount
    setPassword("");
  }, [isReconnect, rememberedEmail]);

  // Clear password when component unmounts or user signs out
  useEffect(() => {
    return () => {
      setPassword("");
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const { error } = isSignUp
        ? await signUp(email, password)
        : await signIn(email, password);

      if (error) {
        setError(error.message);
      } else if (isSignUp) {
        setMessage("Vérifiez votre email pour confirmer votre compte");
        // Clear password after successful signup
        setPassword("");
      } else if (isReconnect && onReconnectSuccess) {
        onReconnectSuccess();
        // Clear password after successful reconnection
        setPassword("");
      } else {
        // Clear password after successful signin
        setPassword("");
      }
    } catch (err) {
      setError("Une erreur inattendue s'est produite");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={cn(
        "bg-gradient-to-br from-gray-900 via-gray-800 to-black min-h-screen flex items-center justify-center p-4",
        className,
      )}
    >
      <div className="w-full max-w-md space-y-8">
        {/* Header with EPTV branding */}
        <div className="text-center space-y-4 mb-12">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-white tracking-wide">
              EPTV
            </h1>
            <h2 className="text-xl text-gray-300 font-medium">
              DIRECTION DES SERVICES TECHNIQUES
            </h2>
            <h3 className="text-sm text-gray-400 leading-relaxed">
              SOUS-DIRECTION DES MOYENS DE PRODUCTION VIDÉO MOBILE
            </h3>
          </div>

          <div className="mt-8">
            <h4 className="text-2xl font-semibold text-white mb-2">
              {isReconnect
                ? "Session expirée"
                : isSignUp
                  ? "Créer un compte"
                  : "Authentification"}
            </h4>
            <p className="text-gray-400">
              {isReconnect
                ? "Veuillez saisir votre mot de passe pour continuer"
                : isSignUp
                  ? "Rejoignez-nous pour commencer"
                  : "Accédez à votre espace de travail"}
            </p>
          </div>
        </div>

        {/* Authentication Form */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              {/* Email field - hidden in reconnect mode */}
              {!isReconnect && (
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    type="email"
                    placeholder="Adresse email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10 h-12 text-base bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl"
                  />
                </div>
              )}

              {/* Show email in reconnect mode */}
              {isReconnect && (
                <div className="text-center p-3 bg-gray-700/30 rounded-xl border border-gray-600">
                  <p className="text-gray-300 text-sm">Connecté en tant que:</p>
                  <p className="text-white font-medium">{email}</p>
                </div>
              )}

              {/* Password field */}
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  className="pl-10 pr-10 h-12 text-base bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-xl text-sm backdrop-blur-sm">
                {error}
              </div>
            )}

            {/* Success message */}
            {message && (
              <div className="bg-green-900/50 border border-green-700 text-green-300 px-4 py-3 rounded-xl text-sm backdrop-blur-sm">
                {message}
              </div>
            )}

            {/* Submit button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 text-base font-medium bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 border-0 rounded-xl shadow-lg hover:shadow-blue-500/25 transition-all duration-200 transform hover:scale-[1.02]"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Chargement...</span>
                </div>
              ) : isReconnect ? (
                "Déverrouiller la session"
              ) : isSignUp ? (
                "Créer le compte"
              ) : (
                "Se connecter"
              )}
            </Button>
          </form>

          {/* Toggle sign up/sign in - hidden in reconnect mode */}
          {!isReconnect && (
            <div className="text-center mt-6">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError("");
                  setMessage("");
                }}
                className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
              >
                {isSignUp
                  ? "Déjà un compte ? Se connecter"
                  : "Pas de compte ? S'inscrire"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
