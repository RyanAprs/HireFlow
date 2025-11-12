"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import type { JobPosition } from "@/lib/types";
import { MapPin, Briefcase, DollarSign, ArrowRight } from "lucide-react";
import Link from "next/link";
import {
  applyAllFilters,
  extractUniqueValues,
  SortOption,
  useJobFilters,
} from "@/hooks/use-job-filters";
import SearchFilterBar, { AdvancedFiltersSheet } from "./search-filter";

const JOB_SORT_OPTIONS: Array<{ value: SortOption; label: string }> = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "title-asc", label: "Title (A-Z)" },
  { value: "title-desc", label: "Title (Z-A)" },
  { value: "salary-high", label: "Salary (High-Low)" },
  { value: "salary-low", label: "Salary (Low-High)" },
];

export default function JobsList({ userId }: { userId?: string }) {
  const [jobs, setJobs] = useState<JobPosition[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<JobPosition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const {
    filters,
    updateFilter,
    clearFilters,
    getActiveFiltersCount,
    toggleEmploymentType,
  } = useJobFilters();

  const supabase = createClient();

  // Extract unique values for filters
  const locations = extractUniqueValues(jobs, "location");
  const employmentTypes = extractUniqueValues(jobs, "employment_type");

  const fetchJobs = async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from("job_positions")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (data) {
      setJobs(data);
      setFilteredJobs(data);
    }
    setIsLoading(false);
  };

  // Apply filters whenever filters or jobs change
  useEffect(() => {
    const filtered = applyAllFilters(jobs, filters);
    setFilteredJobs(filtered);
  }, [jobs, filters]);

  useEffect(() => {
    fetchJobs();
  }, []);

  if (isLoading) {
    return <div className="text-center py-8">Loading job positions...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <Card>
        <CardContent className="pt-6">
          <SearchFilterBar
            searchQuery={filters.searchQuery}
            onSearchChange={(value) => updateFilter("searchQuery", value)}
            locationFilter={filters.locationFilter}
            onLocationChange={(value) => updateFilter("locationFilter", value)}
            locations={locations}
            sortBy={filters.sortBy}
            onSortChange={(value) => updateFilter("sortBy", value)}
            sortOptions={JOB_SORT_OPTIONS}
            onAdvancedFilterClick={() => setIsFilterOpen(true)}
            activeFiltersCount={getActiveFiltersCount()}
            resultsText={`Showing ${filteredJobs.length} of ${jobs.length} jobs`}
            onClearFilters={clearFilters}
          />
        </CardContent>
      </Card>
      <AdvancedFiltersSheet
        open={isFilterOpen}
        onOpenChange={setIsFilterOpen}
        employmentTypes={employmentTypes}
        selectedEmploymentTypes={filters.employmentTypeFilter}
        onToggleEmploymentType={toggleEmploymentType}
        salaryRange={filters.salaryRange}
        onSalaryRangeChange={(range) => updateFilter("salaryRange", range)}
        onClearFilters={clearFilters}
      />
      {/* Jobs List */}
      {filteredJobs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500 mb-4">
              {jobs.length === 0
                ? "No job positions available at the moment."
                : "No jobs match your search criteria."}
            </p>
            {jobs.length === 0 ? (
              <p className="text-sm text-gray-400">
                Check back later for new opportunities!
              </p>
            ) : (
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {filteredJobs.map((job) => (
            <Card key={job.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl mb-2">{job.title}</CardTitle>
                    <CardDescription className="text-base line-clamp-2">
                      {job.description}
                    </CardDescription>
                  </div>
                  <Badge className="bg-green-100 text-green-800 whitespace-nowrap">
                    Open
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-6">
                  {job.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4 flex-shrink-0" />
                      <span>{job.location}</span>
                    </div>
                  )}
                  {job.employment_type && (
                    <div className="flex items-center gap-1">
                      <Briefcase className="h-4 w-4 flex-shrink-0" />
                      <span>{job.employment_type}</span>
                    </div>
                  )}
                  {job.salary_range && (
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4 flex-shrink-0" />
                      <span>{job.salary_range}</span>
                    </div>
                  )}
                </div>
                <Link href={userId ? `/jobs/${job.id}/apply` : "/auth/login"}>
                  <Button className="gap-2">
                    Apply Now
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
