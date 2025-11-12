"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Briefcase, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/lib/store";

type HeaderProps = {
  user?: { id: string | null } | null;
};

export default function HeaderWithLogout({ user }: HeaderProps) {
  const router = useRouter();
  const setProfile = useAuthStore((state) => state.setProfile);

  const handleLogout = async () => {
    const supabase = createClient();

    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setProfile(null);
      localStorage.removeItem("auth-storage");

      router.push("/auth/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <header className="bg-white border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Briefcase className="h-6 w-6 text-blue-600" />
          <span className="font-bold text-xl">HireFlow</span>
        </Link>

        <nav className="flex items-center gap-4">
          {user ? (
            <>
              <Link href="/my-applications">
                <Button variant="ghost" size="sm">
                  <User className="h-4 w-4 mr-2" />
                  My Applications
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/auth/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link href="/auth/sign-up">
                <Button>Sign Up</Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
