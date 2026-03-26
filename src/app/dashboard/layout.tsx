"use client";

import { useState, useEffect, createContext, useContext } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Profile, PLAN_LIMITS } from "@/lib/types";

// Context to share profile across dashboard pages
const ProfileContext = createContext<{ profile: Profile | null; trialDaysLeft: number; isExpired: boolean }>({
  profile: null,
  trialDaysLeft: 0,
  isExpired: false,
});

export function useProfile() {
  return useContext(ProfileContext);
}

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
      </svg>
    ),
  },
  {
    label: "Wall of Love",
    href: "/dashboard/wall",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
      </svg>
    ),
  },
  {
    label: "Widgets",
    href: "/dashboard/widgets",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 01-.657.643 48.39 48.39 0 01-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 01-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 00-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.532.57a48.039 48.039 0 01-.642 5.056c1.518.19 3.058.309 4.616.354a.64.64 0 00.657-.643v0c0-.355-.186-.676-.401-.959a1.647 1.647 0 01-.349-1.003c0-1.035 1.008-1.875 2.25-1.875 1.243 0 2.25.84 2.25 1.875 0 .369-.128.713-.349 1.003-.215.283-.4.604-.4.959v0c0 .333.277.599.61.58a48.1 48.1 0 005.427-.63 48.05 48.05 0 00.582-4.717.532.532 0 00-.533-.57v0c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.035 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.37 0 .713.128 1.003.349.283.215.604.401.96.401v0a.656.656 0 00.658-.663 48.422 48.422 0 00-.37-5.36c-1.886.342-3.81.574-5.766.689a.578.578 0 01-.61-.58v0z" />
      </svg>
    ),
  },
  {
    label: "Tarifs",
    href: "/dashboard/upgrade",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
      </svg>
    ),
  },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingName, setOnboardingName] = useState("");
  const [onboardingSaving, setOnboardingSaving] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const getProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
        if (data) {
          setProfile(data);
          // Show onboarding if company_name is empty (Google OAuth users)
          if (!data.company_name || data.company_name.trim() === "" || data.company_name === "EMPTY") {
            setShowOnboarding(true);
          }
        }
      }
      setLoading(false);
    };
    getProfile();
  }, [supabase]);

  const handleOnboardingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onboardingName.trim() || !profile) return;
    setOnboardingSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ company_name: onboardingName.trim() })
      .eq("id", profile.id);
    if (!error) {
      setProfile({ ...profile, company_name: onboardingName.trim() });
      setShowOnboarding(false);
    }
    setOnboardingSaving(false);
  };

  const trialDaysLeft = profile?.trial_ends_at
    ? Math.max(0, Math.ceil((new Date(profile.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;
  const isExpired = profile?.plan === "trial" && trialDaysLeft <= 0;

  // Redirect to upgrade if trial expired
  useEffect(() => {
    if (!profile || loading) return;
    if (isExpired && pathname !== "/dashboard/upgrade") {
      router.push("/dashboard/upgrade");
    }
  }, [profile, loading, pathname, router, isExpired]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const planLabel = profile ? (PLAN_LIMITS[profile.plan]?.label || profile.plan) : "";

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <ProfileContext.Provider value={{ profile, trialDaysLeft, isExpired }}>
      {/* Onboarding modal for Google OAuth users with no company name */}
      {showOnboarding && (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center px-6">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-50 text-primary-500 mb-4">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-stone-950">Bienvenue sur Louvi !</h2>
              <p className="text-sm text-stone-600 mt-2">
                Pour commencer, indiquez le nom de votre entreprise. Il sera affiché sur votre formulaire de collecte.
              </p>
            </div>
            <form onSubmit={handleOnboardingSubmit}>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">
                Nom de l&apos;entreprise
              </label>
              <input
                type="text"
                value={onboardingName}
                onChange={(e) => setOnboardingName(e.target.value)}
                required
                autoFocus
                placeholder="Mon Entreprise"
                className="w-full px-4 py-2.5 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
              />
              <button
                type="submit"
                disabled={onboardingSaving || !onboardingName.trim()}
                className="mt-4 w-full gradient-primary text-white py-3 rounded-lg text-sm font-medium shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 transition-shadow duration-200 disabled:opacity-50"
              >
                {onboardingSaving ? "Enregistrement..." : "Continuer"}
              </button>
            </form>
          </div>
        </div>
      )}
      <div className="min-h-screen bg-stone-50 flex">
        {/* Sidebar */}
        <aside className={`${collapsed ? "w-16" : "w-64"} bg-white border-r border-stone-200 flex flex-col transition-all duration-200 shrink-0 sticky top-0 h-screen`}>
          {/* Logo */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-stone-200">
            {!collapsed && (
              <Link href="/dashboard" className="text-xl font-bold text-primary-500 font-serif">Louvi</Link>
            )}
            <button onClick={() => setCollapsed(!collapsed)} className="p-1.5 rounded-lg hover:bg-stone-100 transition-colors duration-200 text-stone-500">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
          </div>

          {/* Trial banner */}
          {!collapsed && profile?.plan === "trial" && (
            <div className={`mx-3 mt-3 p-3 rounded-lg border ${trialDaysLeft <= 2 ? "bg-red-50 border-red-200" : "bg-primary-50 border-primary-100"}`}>
              <div className="flex items-center gap-2 mb-1">
                {trialDaysLeft <= 2 ? (
                  <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                <p className={`text-xs font-semibold ${trialDaysLeft <= 2 ? "text-red-700" : "text-primary-700"}`}>
                  Essai gratuit
                </p>
              </div>
              <p className={`text-xs ${trialDaysLeft <= 2 ? "text-red-600" : "text-primary-600"}`}>
                {trialDaysLeft > 0
                  ? `${trialDaysLeft} jour${trialDaysLeft > 1 ? "s" : ""} restant${trialDaysLeft > 1 ? "s" : ""}`
                  : "Expiré"}
              </p>
              {/* Progress bar */}
              <div className="mt-2 h-1.5 bg-white/50 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${trialDaysLeft <= 2 ? "bg-red-500" : "bg-primary-500"}`}
                  style={{ width: `${Math.max(0, (trialDaysLeft / 7) * 100)}%` }}
                />
              </div>
              <Link
                href="/dashboard/upgrade"
                className={`mt-2.5 block text-center text-xs py-1.5 rounded-md font-medium transition-colors ${
                  trialDaysLeft <= 2
                    ? "bg-red-500 text-white hover:bg-red-600"
                    : "gradient-primary text-white"
                }`}
              >
                Choisir un plan
              </Link>
            </div>
          )}

          {/* Nav */}
          <nav className="flex-1 p-3 space-y-1 mt-1">
            {navItems.map((item) => {
              const isActive = item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors duration-200 ${
                    isActive ? "bg-primary-50 text-primary-600 font-medium" : "text-stone-600 hover:bg-stone-100"
                  } ${collapsed ? "justify-center" : ""}`}
                  title={collapsed ? item.label : undefined}
                >
                  {item.icon}
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
            {/* Formulaire external link */}
            {profile && (
              <a
                href={`/collect/${profile.collect_link_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-stone-600 hover:bg-stone-100 transition-colors duration-200 ${collapsed ? "justify-center" : ""}`}
                title={collapsed ? "Formulaire" : undefined}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                </svg>
                {!collapsed && <span>Formulaire</span>}
              </a>
            )}
          </nav>

          {/* Bottom */}
          <div className="p-3 border-t border-stone-200">
            {!collapsed && profile && (
              <div className="px-3 mb-3">
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    profile.plan === "trial" ? "bg-yellow-100 text-yellow-700"
                    : profile.plan === "starter" ? "bg-blue-100 text-blue-700"
                    : profile.plan === "pro" ? "bg-primary-100 text-primary-700"
                    : profile.plan === "business" ? "bg-stone-800 text-white"
                    : "bg-stone-100 text-stone-600"
                  }`}>
                    {planLabel}
                  </span>
                </div>
                <p className="text-xs text-stone-400 mt-1.5 truncate">{profile.company_name}</p>
              </div>
            )}
            <button
              onClick={handleLogout}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-stone-600 hover:bg-red-50 hover:text-red-600 transition-colors duration-200 w-full ${collapsed ? "justify-center" : ""}`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
              </svg>
              {!collapsed && <span>Déconnexion</span>}
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 overflow-auto">
          {/* Top trial warning banner */}
          {profile?.plan === "trial" && trialDaysLeft <= 3 && trialDaysLeft > 0 && pathname !== "/dashboard/upgrade" && (
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-2.5 text-sm flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>
                  Votre essai gratuit expire dans <strong>{trialDaysLeft} jour{trialDaysLeft > 1 ? "s" : ""}</strong>
                </span>
              </div>
              <Link href="/dashboard/upgrade" className="bg-white text-orange-600 px-4 py-1 rounded-md text-xs font-semibold hover:bg-orange-50 transition-colors">
                Passer à un plan
              </Link>
            </div>
          )}
          <div className="p-8">{children}</div>
        </main>
      </div>
    </ProfileContext.Provider>
  );
}
