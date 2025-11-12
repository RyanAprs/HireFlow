"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Briefcase, User, LogOut, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/lib/store";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

type HeaderProps = {
  user?: { id: string | null } | null;
};

export default function HeaderWithLogout({ user }: HeaderProps) {
  const router = useRouter();
  const setProfile = useAuthStore((state) => state.setProfile);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    const supabase = createClient();

    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setProfile(null);
      localStorage.removeItem("auth-storage");

      setMobileMenuOpen(false);
      router.push("/auth/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <Briefcase className="h-6 w-6 text-blue-600" />
            <span className="font-bold text-xl">HireFlow</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link href="/my-applications">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <User className="h-4 w-4" />
                    <span>My Applications</span>
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
                <Link href="/auth/sign-up">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-blue-600" />
                    HireFlow
                  </SheetTitle>
                </SheetHeader>

                <nav className="flex flex-col gap-4 mt-8">
                  {user ? (
                    <>
                      <Link href="/my-applications" onClick={closeMobileMenu}>
                        <Button
                          variant="ghost"
                          className="w-full justify-start gap-3 h-12 text-base"
                        >
                          <User className="h-5 w-5" />
                          My Applications
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        onClick={handleLogout}
                        className="w-full justify-start gap-3 h-12 text-base"
                      >
                        <LogOut className="h-5 w-5" />
                        Logout
                      </Button>
                    </>
                  ) : (
                    <>
                      <Link href="/auth/login" onClick={closeMobileMenu}>
                        <Button
                          variant="ghost"
                          className="w-full h-12 text-base"
                        >
                          Login
                        </Button>
                      </Link>
                      <Link href="/auth/sign-up" onClick={closeMobileMenu}>
                        <Button className="w-full h-12 text-base">
                          Sign Up
                        </Button>
                      </Link>
                    </>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
