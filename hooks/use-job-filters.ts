import { useState, useEffect } from "react";

export type SortOption =
  | "newest"
  | "oldest"
  | "title-asc"
  | "title-desc"
  | "salary-high"
  | "salary-low"
  | "status";

export interface FilterState {
  searchQuery: string;
  statusFilter: string;
  locationFilter: string;
  employmentTypeFilter: string[];
  salaryRange: {
    min: number | null;
    max: number | null;
  };
  sortBy: SortOption;
}

export const useJobFilters = () => {
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: "",
    statusFilter: "all",
    locationFilter: "all",
    employmentTypeFilter: [],
    salaryRange: { min: null, max: null },
    sortBy: "newest",
  });

  const updateFilter = <K extends keyof FilterState>(
    key: K,
    value: FilterState[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      searchQuery: "",
      statusFilter: "all",
      locationFilter: "all",
      employmentTypeFilter: [],
      salaryRange: { min: null, max: null },
      sortBy: "newest",
    });
  };

  const getActiveFiltersCount = () => {
    return [
      filters.locationFilter !== "all" ? 1 : 0,
      filters.statusFilter !== "all" ? 1 : 0,
      filters.employmentTypeFilter.length,
      filters.salaryRange.min !== null || filters.salaryRange.max !== null
        ? 1
        : 0,
    ].reduce((a, b) => a + b, 0);
  };

  const toggleEmploymentType = (type: string) => {
    setFilters((prev) => ({
      ...prev,
      employmentTypeFilter: prev.employmentTypeFilter.includes(type)
        ? prev.employmentTypeFilter.filter((t) => t !== type)
        : [...prev.employmentTypeFilter, type],
    }));
  };

  return {
    filters,
    updateFilter,
    clearFilters,
    getActiveFiltersCount,
    toggleEmploymentType,
  };
};

// utils/filterUtils.ts
export interface JobItem {
  title: string;
  description: string;
  location?: string | null;
  employment_type?: string | null;
  salary_range?: string | null;
  created_at: string;
  status?: string;
}

export interface ApplicationItem extends JobItem {
  job_position: JobItem;
}

export const parseSalaryFromString = (
  salaryStr: string
): { min: number; max: number } | null => {
  if (!salaryStr) return null;

  const cleaned = salaryStr
    .toLowerCase()
    .replace(/\$/g, "")
    .replace(/rp/g, "")
    .replace(/idr/g, "")
    .replace(/juta/g, "000000")
    .replace(/jt/g, "000000")
    .replace(/k/g, "000")
    .replace(/,/g, "")
    .replace(/\./g, "")
    .trim();

  const numbers = cleaned.match(/(\d+)/g);
  if (!numbers || numbers.length < 2) return null;

  return {
    min: parseInt(numbers[0]),
    max: parseInt(numbers[1]),
  };
};

export const filterBySearch = <T extends JobItem | ApplicationItem>(
  items: T[],
  searchQuery: string
): T[] => {
  if (!searchQuery.trim()) return items;

  const query = searchQuery.toLowerCase();
  return items.filter((item) => {
    const jobData = "job_position" in item ? item.job_position : item;
    return (
      jobData.title.toLowerCase().includes(query) ||
      jobData.description.toLowerCase().includes(query) ||
      jobData.location?.toLowerCase().includes(query)
    );
  });
};

export const filterByLocation = <T extends JobItem | ApplicationItem>(
  items: T[],
  locationFilter: string
): T[] => {
  if (locationFilter === "all") return items;

  return items.filter((item) => {
    const jobData = "job_position" in item ? item.job_position : item;
    return jobData.location === locationFilter;
  });
};

export const filterByStatus = <T extends JobItem | ApplicationItem>(
  items: T[],
  statusFilter: string
): T[] => {
  if (statusFilter === "all") return items;

  return items.filter((item) => {
    if ("status" in item) {
      return item.status === statusFilter;
    }
    return true;
  });
};

export const filterByEmploymentType = <T extends JobItem | ApplicationItem>(
  items: T[],
  employmentTypeFilter: string[]
): T[] => {
  if (employmentTypeFilter.length === 0) return items;

  return items.filter((item) => {
    const jobData = "job_position" in item ? item.job_position : item;
    return (
      jobData.employment_type &&
      employmentTypeFilter.includes(jobData.employment_type)
    );
  });
};

export const filterBySalaryRange = <T extends JobItem | ApplicationItem>(
  items: T[],
  salaryRange: { min: number | null; max: number | null }
): T[] => {
  if (salaryRange.min === null && salaryRange.max === null) return items;

  return items.filter((item) => {
    const jobData = "job_position" in item ? item.job_position : item;
    if (!jobData.salary_range) return false;

    const jobSalary = parseSalaryFromString(jobData.salary_range);
    if (!jobSalary) return false;

    const minMatch =
      salaryRange.min === null || jobSalary.max >= salaryRange.min;
    const maxMatch =
      salaryRange.max === null || jobSalary.min <= salaryRange.max;

    return minMatch && maxMatch;
  });
};

export const sortItems = <T extends JobItem | ApplicationItem>(
  items: T[],
  sortBy: SortOption
): T[] => {
  return [...items].sort((a, b) => {
    const jobDataA = "job_position" in a ? a.job_position : a;
    const jobDataB = "job_position" in b ? b.job_position : b;

    switch (sortBy) {
      case "newest":
        return (
          new Date(jobDataB.created_at).getTime() -
          new Date(jobDataA.created_at).getTime()
        );
      case "oldest":
        return (
          new Date(jobDataA.created_at).getTime() -
          new Date(jobDataB.created_at).getTime()
        );
      case "title-asc":
        return jobDataA.title.localeCompare(jobDataB.title);
      case "title-desc":
        return jobDataB.title.localeCompare(jobDataA.title);
      case "salary-high": {
        const salaryA = parseSalaryFromString(jobDataA.salary_range || "");
        const salaryB = parseSalaryFromString(jobDataB.salary_range || "");
        if (!salaryA && !salaryB) return 0;
        if (!salaryA) return 1;
        if (!salaryB) return -1;
        return salaryB.max - salaryA.max;
      }
      case "salary-low": {
        const salaryA = parseSalaryFromString(jobDataA.salary_range || "");
        const salaryB = parseSalaryFromString(jobDataB.salary_range || "");
        if (!salaryA && !salaryB) return 0;
        if (!salaryA) return 1;
        if (!salaryB) return -1;
        return salaryA.min - salaryB.min;
      }
      case "status": {
        if ("status" in a && "status" in b) {
          return a.status.localeCompare(b.status);
        }
        return 0;
      }
      default:
        return 0;
    }
  });
};

export const applyAllFilters = <T extends JobItem | ApplicationItem>(
  items: T[],
  filters: FilterState
): T[] => {
  let filtered = items;

  filtered = filterBySearch(filtered, filters.searchQuery);
  filtered = filterByLocation(filtered, filters.locationFilter);
  filtered = filterByStatus(filtered, filters.statusFilter);
  filtered = filterByEmploymentType(filtered, filters.employmentTypeFilter);
  filtered = filterBySalaryRange(filtered, filters.salaryRange);
  filtered = sortItems(filtered, filters.sortBy);

  return filtered;
};

// utils/statusUtils.ts
export const getStatusColor = (status: string): string => {
  switch (status) {
    case "submitted":
      return "bg-blue-100 text-blue-800";
    case "under_review":
      return "bg-yellow-100 text-yellow-800";
    case "interview":
      return "bg-purple-100 text-purple-800";
    case "accepted":
      return "bg-green-100 text-green-800";
    case "rejected":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export const getStatusLabel = (status: string): string => {
  return (
    status.replace("_", " ").charAt(0).toUpperCase() +
    status.replace("_", " ").slice(1)
  );
};

// utils/extractUtils.ts
export const extractUniqueValues = <T extends JobItem | ApplicationItem>(
  items: T[],
  field: "location" | "employment_type"
): string[] => {
  const values = items
    .map((item) => {
      const jobData = "job_position" in item ? item.job_position : item;
      return jobData[field];
    })
    .filter(Boolean) as string[];

  return [...new Set(values)];
};
