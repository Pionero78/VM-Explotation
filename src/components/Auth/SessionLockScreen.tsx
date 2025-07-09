import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { Lock, Shield } from "lucide-react";

const SessionLockScreen: React.FC = () => {
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { unlockSession, rememberedEmail, signOut } = useAuth();

  // Always clear password on component mount
  useEffect(() => {
    setPassword("");
    return () => {
      setPassword("");
    };
  }, []);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { error } = await unlockSession(password);

      if (error) {
        setError(error.message);
      }
    } catch (err) {
      setError("Une erreur inattendue s'est produite");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black min-h-screen flex items-center justify-center p-4">
      {/* Blur overlay effect */}
      <div className="absolute inset-0 backdrop-blur-sm bg-black/20"></div>

      <div className="relative z-10 w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-2xl">
            <Shield className="h-10 w-10 text-white" />
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-white">
              Session verrouillée
            </h1>
            <p className="text-gray-400">
              Votre session a expiré après 3 heures d'inactivité
            </p>
          </div>
        </div>

        {/* Lock Screen Form */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 shadow-2xl">
          {/* User info */}
          <div className="text-center mb-6 p-4 bg-gray-700/30 rounded-xl border border-gray-600">
            <p className="text-gray-300 text-sm mb-1">Connecté en tant que:</p>
            <p className="text-white font-medium text-lg">{rememberedEmail}</p>
          </div>

          <form onSubmit={handleUnlock} className="space-y-6">
            {/* Password field */}
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="password"
                placeholder="Saisissez votre mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoFocus
                autoComplete="new-password"
                className="pl-10 h-12 text-base bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-yellow-500 focus:ring-yellow-500/20 rounded-xl"
              />
            </div>

            {/* Error message */}
            {error && (
              <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-xl text-sm backdrop-blur-sm">
                {error}
              </div>
            )}

            {/* Unlock button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 text-base font-medium bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 border-0 rounded-xl shadow-lg hover:shadow-yellow-500/25 transition-all duration-200 transform hover:scale-[1.02]"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Déverrouillage...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <Shield className="h-4 w-4" />
                  <span>Déverrouiller la session</span>
                </div>
              )}
            </Button>
          </form>

          {/* Sign out option */}
          <div className="text-center mt-6 pt-6 border-t border-gray-700">
            <button
              type="button"
              onClick={handleSignOut}
              className="text-gray-400 hover:text-gray-300 font-medium transition-colors text-sm"
            >
              Se déconnecter complètement
            </button>
          </div>
        </div>

        {/* Security info */}
        <div className="text-center text-xs text-gray-500">
          <p>
            🔒 Sécurité renforcée - Session automatiquement verrouillée après 3h
          </p>
        </div>
      </div>
    </div>
  );
};

export default SessionLockScreen;
