import { redirect } from "next/navigation";
import Link from "next/link";
import { getAdminSession, authenticateAdmin, destroyAdminSession } from "@/lib/auth";
import { listProjectBriefs } from "@/db";
import AdminDashboard from "@/components/admin-dashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield, Lock, ArrowLeft, LogOut } from "@/components/ui/icons";

export const dynamic = "force-dynamic";

interface AdminPageProps {
  searchParams: Promise<{ error?: string }>;
}

async function handleLogin(formData: FormData) {
  "use server";
  const password = (formData.get("password") as string) || "";
  const result = await authenticateAdmin(password);

  if (result.success) {
    redirect("/admin");
  } else {
    redirect(`/admin?error=${encodeURIComponent(result.error || "Login failed")}`);
  }
}

async function handleLogout() {
  "use server";
  await destroyAdminSession();
  redirect("/admin");
}

export default async function AdminPage(props: AdminPageProps) {
  const searchParams = await props.searchParams;
  const session = await getAdminSession();

  // If unauthenticated, show secure login form
  if (!session) {
    const errorMsg = searchParams.error;

    return (
      <div className="min-h-screen bg-[#fbfbf8] flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-md bg-white border border-[#181816]/10 rounded-2xl p-8 shadow-sm">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#effa82] mb-3 text-2xl">
              👻
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[#181816]">Ghost Studio Admin</h1>
            <p className="text-sm text-neutral-500 mt-1">
              Enter your admin credentials to manage client briefs.
            </p>
          </div>

          {errorMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2 leading-relaxed">
              <span className="shrink-0 font-bold">⚠️</span>
              <span>{errorMsg}</span>
            </div>
          )}

          <form action={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                Admin Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="Enter studio password"
                  autoComplete="current-password"
                  className="studio-input pr-10"
                />
                <Lock size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              </div>
            </div>

            <Button type="submit" className="w-full button button-dark h-11 text-sm font-semibold">
              Log in to Studio
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
            <Link href="/" className="inline-flex items-center gap-1 hover:text-neutral-900 transition-colors">
              <ArrowLeft size={13} /> Back to website
            </Link>
            <span className="flex items-center gap-1 text-[11px] text-neutral-400">
              <Shield size={12} /> Server-validated session
            </span>
          </div>
        </div>

        <p className="text-center text-xs text-neutral-400 mt-6 max-w-sm">
          Password must be configured in environment variables (<code className="font-mono text-neutral-600">ADMIN_PASSWORD</code>). No hardcoded fallback exists.
        </p>
      </div>
    );
  }

  // Authenticated view: load briefs through the server-only Firestore data layer.
  const leads = await listProjectBriefs();

  return (
    <div className="min-h-screen bg-[#fbfbf8] text-[#181816]">
      {/* Admin Header */}
      <header className="border-b border-[#181816]/10 bg-white/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="text-2xl group-hover:scale-110 transition-transform">👻</span>
              <span className="font-bold text-lg tracking-tight text-[#181816]">Ghost Studio</span>
            </Link>
            <span className="hidden sm:inline-block text-xs font-semibold px-2 py-0.5 rounded-full bg-[#effa82] text-[#181816]">
              Admin Portal
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/" target="_blank" className="text-xs font-medium text-neutral-600 hover:text-neutral-900 hidden sm:inline-flex items-center gap-1">
              View Website ↗
            </Link>

            <form action={handleLogout}>
              <Button type="submit" variant="outline" size="sm" className="text-xs gap-1.5 h-8">
                <LogOut size={13} /> Log out
              </Button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Admin Dashboard */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Project Enquiries & Briefs</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Manage submitted project requirements, track email notifications, and review client briefs.
          </p>
        </div>

        <AdminDashboard initialLeads={leads} />
      </main>
    </div>
  );
}
