import { Briefcase, Link, LogOut, User } from "lucide-react";
import { Button } from "../ui/button";

const headerwithlogout = ({ user }) => {
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
              <form action="/auth/logout" method="post">
                <Button variant="outline" size="sm" type="submit">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </form>
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
};

export default headerwithlogout;
