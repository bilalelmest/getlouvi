"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Logo from "@/components/Logo";
import { createClient } from "@/lib/supabase/client";
import { useInAppBrowser } from "@/lib/useInAppBrowser";

function SignupForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const supabase = createClient();
  const isInAppBrowser = useInAppBrowser();

  const translateError = (message: string): string => {
    if (message.includes("already registered")) return "Cet email est déjà utilisé.";
    if (message.includes("valid email")) return "Veuillez entrer un email valide.";
    if (message.includes("at least")) return "Le mot de passe doit contenir au moins 6 caractères.";
    if (message.includes("password")) return "Le mot de passe est trop faible.";
    if (message.includes("rate limit")) return "Trop de tentatives. Réessayez dans quelques minutes.";
    return "Une erreur est survenue. Veuillez réessayer.";
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { company_name: companyName },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signUpError) {
        setError(translateError(signUpError.message));
        setLoading(false);
        return;
      }

      // Show email confirmation screen
      setEmailSent(true);
    } catch {
      setError("Une erreur est survenue. Veuillez réessayer.");
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  // Email sent confirmation screen
  if (emailSent) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center px-6">
        <div className="w-full max-w-md text-center">
          <Link href="/" className="inline-block">
            <Logo size={36} />
          </Link>
          <div className="mt-8 bg-white rounded-xl border border-stone-200 p-8 shadow-sm">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-50 mb-5">
              <svg className="w-8 h-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-stone-950 mb-2">Vérifiez votre email</h2>
            <p className="text-sm text-stone-600 mb-4">
              Un email de confirmation a été envoyé à
            </p>
            <p className="text-sm font-semibold text-stone-950 bg-stone-50 rounded-lg py-2 px-4 inline-block mb-4">
              {email}
            </p>
            <p className="text-sm text-stone-600 mb-6">
              Cliquez sur le lien dans l&apos;email pour activer votre compte et accéder à votre tableau de bord.
            </p>
            <div className="border-t border-stone-200 pt-4">
              <p className="text-xs text-stone-400">
                Vous n&apos;avez pas reçu l&apos;email ? Vérifiez vos spams ou{" "}
                <button
                  onClick={() => { setEmailSent(false); setLoading(false); }}
                  className="text-primary-500 hover:underline font-medium"
                >
                  réessayez
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <Logo size={36} />
          </Link>
          <h1 className="mt-6 text-2xl font-bold text-stone-950">
            Créez votre compte
          </h1>
          <p className="mt-2 text-sm text-stone-600">
            Commencez à collecter des témoignages en quelques minutes
          </p>
        </div>

        <div className="bg-white rounded-xl border border-stone-200 p-8 shadow-sm">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 text-danger text-sm">
              {error}
            </div>
          )}

          {/* Google OAuth */}
          {isInAppBrowser ? (
            <div className="text-center p-4 rounded-lg bg-amber-50 border border-amber-200">
              <p className="text-sm font-medium text-amber-800 mb-1">
                Connexion Google indisponible
              </p>
              <p className="text-xs text-amber-700 mb-3">
                TikTok, Instagram et autres apps bloquent Google. Copiez le lien et ouvrez-le dans Safari ou Chrome.
              </p>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(window.location.href);
                  } catch {
                    const ta = document.createElement("textarea");
                    ta.value = window.location.href;
                    ta.style.position = "fixed";
                    ta.style.opacity = "0";
                    document.body.appendChild(ta);
                    ta.select();
                    document.execCommand("copy");
                    document.body.removeChild(ta);
                  }
                  setLinkCopied(true);
                  setTimeout(() => setLinkCopied(false), 4000);
                }}
                className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  linkCopied
                    ? "bg-success text-white"
                    : "bg-amber-600 text-white hover:bg-amber-700"
                }`}
              >
                {linkCopied ? (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    Lien copie ! Collez-le dans votre navigateur
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                    </svg>
                    Copier le lien
                  </>
                )}
              </button>
              <p className="text-xs text-amber-600 mt-2">
                Ou inscrivez-vous par email ci-dessous
              </p>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleGoogleSignup}
              className="w-full flex items-center justify-center gap-3 py-3 rounded-lg border border-stone-300 text-stone-700 text-sm font-medium hover:bg-stone-50 transition-colors duration-200"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continuer avec Google
            </button>
          )}

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-stone-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-4 text-stone-500">ou</span>
            </div>
          </div>

          <form onSubmit={handleSignup}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">
                  Nom de l&apos;entreprise
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                  placeholder="Mon Entreprise"
                  className="w-full px-4 py-2.5 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="vous@exemple.com"
                  className="w-full px-4 py-2.5 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">
                  Mot de passe
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                />
                <p className="mt-1 text-xs text-stone-400">Minimum 6 caractères</p>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full gradient-primary text-white py-3 rounded-lg text-sm font-medium shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 transition-shadow duration-200 disabled:opacity-50"
            >
              {loading ? "Création en cours..." : "Créer mon compte"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-stone-600">
          Déjà un compte ?{" "}
          <Link href="/login" className="text-primary-500 font-medium hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  );
}
