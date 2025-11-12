"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import type { Application, JobPosition } from "@/lib/types";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle,
  ArrowLeft,
  MapPin,
  Briefcase,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import {
  applyAllFilters,
  getStatusColor,
  getStatusLabel,
  SortOption,
  useJobFilters,
} from "@/hooks/use-job-filters";
import SearchFilterBar, { ApplicationStats } from "./search-filter";

type ApplicationWithJob = Application & {
  job_position: JobPosition;
};

const APPLICATION_SORT_OPTIONS: Array<{ value: SortOption; label: string }> = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "title-asc", label: "Title (A-Z)" },
  { value: "title-desc", label: "Title (Z-A)" },
  { value: "status", label: "By Status" },
];

export default function MyApplicationsList({ userId }: { userId: string }) {
  const [applications, setApplications] = useState<ApplicationWithJob[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<
    ApplicationWithJob[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const searchParams = useSearchParams();
  const showSuccess = searchParams.get("success") === "true";

  const { filters, updateFilter } = useJobFilters();

  const supabase = createClient();

  const fetchApplications = async () => {
    setIsLoading(true);

    const { data, error } = await supabase
      .from("applications")
      .select(
        `
        *,
        job_position:job_positions!applications_job_position_id_fkey(*)
      `
      )
      .eq("applicant_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching applications:", error.message);
    }

    if (data) {
      setApplications(data as unknown as ApplicationWithJob[]);
    }
    setIsLoading(false);
  };

  const handleClearFilters = () => {
    updateFilter("searchQuery", "");
    updateFilter("statusFilter", "all");
  };

  // Calculate statistics using memoization pattern
  const calculateStats = () => ({
    total: applications.length,
    submitted: applications.filter((a) => a.status === "submitted").length,
    underReview: applications.filter((a) => a.status === "under_review").length,
    interview: applications.filter((a) => a.status === "interview").length,
    accepted: applications.filter((a) => a.status === "accepted").length,
  });

  // Apply filters whenever filters or applications change
  useEffect(() => {
    const filtered = applyAllFilters(applications, filters);
    setFilteredApplications(filtered);
  }, [applications, filters]);

  useEffect(() => {
    fetchApplications();
  }, []);

  if (isLoading) {
    return <div className="text-center py-8">Loading your applications...</div>;
  }

  const stats = calculateStats();
  const hasApplications = applications.length > 0;
  const hasFilteredResults = filteredApplications.length > 0;
  const activeFiltersCount = filters.statusFilter !== "all" ? 1 : 0;

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link href="/jobs">
        <Button variant="outline" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Job Listings
        </Button>
      </Link>

      {/* Success Message */}
      {showSuccess && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="py-4 flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <p className="text-green-800 font-medium">
              Application submitted successfully!
            </p>
          </CardContent>
        </Card>
      )}

      {/* Search and Filter Section */}
      {hasApplications && (
        <Card>
          <CardContent className="pt-6">
            <SearchFilterBar
              searchQuery={filters.searchQuery}
              onSearchChange={(value) => updateFilter("searchQuery", value)}
              statusFilter={filters.statusFilter}
              onStatusChange={(value) => updateFilter("statusFilter", value)}
              showStatusFilter={true}
              sortBy={filters.sortBy}
              onSortChange={(value) => updateFilter("sortBy", value)}
              sortOptions={APPLICATION_SORT_OPTIONS}
              resultsText={`Showing ${filteredApplications.length} of ${
                applications.length
              } application${applications.length !== 1 ? "s" : ""}`}
              onClearFilters={handleClearFilters}
              activeFiltersCount={activeFiltersCount}
            />
          </CardContent>
        </Card>
      )}

      {/* Empty State - No Applications */}
      {!hasApplications && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500 mb-4">
              You haven&apos;t submitted any applications yet.
            </p>
            <p className="text-sm text-gray-400 mb-6">
              Browse available positions and apply to get started!
            </p>
            <Link href="/jobs">
              <Button>Browse Jobs</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Empty State - No Results */}
      {hasApplications && !hasFilteredResults && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500 mb-4">
              No applications match your search criteria.
            </p>
            <Button variant="outline" onClick={handleClearFilters}>
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Applications List */}
      {hasFilteredResults && (
        <ApplicationsList applications={filteredApplications} />
      )}

      {/* Statistics Card */}
      {hasApplications && (
        <ApplicationStats
          total={stats.total}
          submitted={stats.submitted}
          underReview={stats.underReview}
          interview={stats.interview}
          accepted={stats.accepted}
        />
      )}
    </div>
  );
}

// Extracted Application List Component for better separation
function ApplicationsList({
  applications,
}: {
  applications: ApplicationWithJob[];
}) {
  return (
    <div className="grid gap-4">
      {applications.map((app) => (
        <ApplicationCard key={app.id} application={app} />
      ))}
    </div>
  );
}

// Extracted Application Card Component
function ApplicationCard({ application }: { application: ApplicationWithJob }) {
  const { job_position, status, created_at } = application;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-semibold mb-2">{job_position.title}</h3>
            <ApplicationMetadata
              location={job_position.location}
              employmentType={job_position.employment_type}
              appliedDate={created_at}
            />
          </div>
          <Badge className={`${getStatusColor(status)} whitespace-nowrap`}>
            {getStatusLabel(status)}
          </Badge>
        </div>
        <p className="text-sm text-gray-600 line-clamp-2">
          {job_position.description}
        </p>
      </div>
    </Card>
  );
}

// Extracted Metadata Component
function ApplicationMetadata({
  location,
  employmentType,
  appliedDate,
}: {
  location?: string | null;
  employmentType?: string | null;
  appliedDate: string;
}) {
  return (
    <div className="flex flex-wrap gap-3 text-sm text-gray-600">
      {location && (
        <div className="flex items-center gap-1">
          <MapPin className="h-4 w-4" />
          <span>{location}</span>
        </div>
      )}
      {employmentType && (
        <div className="flex items-center gap-1">
          <Briefcase className="h-4 w-4" />
          <span>{employmentType}</span>
        </div>
      )}
      <div className="flex items-center gap-1">
        <Calendar className="h-4 w-4" />
        <span>Applied on {new Date(appliedDate).toLocaleDateString()}</span>
      </div>
    </div>
  );
}
