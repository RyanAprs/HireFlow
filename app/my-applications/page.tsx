import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import MyApplicationsList from "@/components/jobs/my-applications-list";
import Header from "@/components/jobs/header";

export default async function MyApplicationsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Applications</h1>
          <p className="text-gray-600">
            Track the status of your job applications
          </p>
        </div>

        <MyApplicationsList userId={user.id} />
      </main>
    </div>
  );
}
