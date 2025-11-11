import { ArrowLeft, Briefcase, Link } from "lucide-react";
import { Button } from "../ui/button";

const header = () => {
  return (
    <header className="bg-white border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Briefcase className="h-6 w-6 text-blue-600" />
          <span className="font-bold text-xl">HireFlow</span>
        </div>
        <Link href="/jobs">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Browse Jobs
          </Button>
        </Link>
      </div>
    </header>
  );
};

export default header;
