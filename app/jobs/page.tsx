import { createClient } from "@/lib/supabase/server";
import JobsList from "@/components/jobs/jobs-list";
import HeaderWithLogout from "@/components/jobs/headerwithlogout";
import { redirect } from "next/navigation";

export default async function JobsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    profile = data;

    if (profile?.role === "admin") {
      redirect("/admin");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderWithLogout user={user} />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Browse Job Opportunities</h1>
          <p className="text-gray-600">Find your next career move</p>
        </div>

        <JobsList userId={user?.id} />
      </main>
    </div>
  );
}
