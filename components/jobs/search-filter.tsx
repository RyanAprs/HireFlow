import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SlidersHorizontal } from "lucide-react";

interface SearchFilterBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  locationFilter?: string;
  onLocationChange?: (value: string) => void;
  locations?: string[];
  statusFilter?: string;
  onStatusChange?: (value: string) => void;
  showStatusFilter?: boolean;
  sortBy: SortOption;
  onSortChange: (value: SortOption) => void;
  sortOptions?: Array<{ value: SortOption; label: string }>;
  onAdvancedFilterClick?: () => void;
  activeFiltersCount?: number;
  resultsText?: string;
  onClearFilters?: () => void;
}

export default function SearchFilterBar({
  searchQuery,
  onSearchChange,
  locationFilter,
  onLocationChange,
  locations = [],
  statusFilter,
  onStatusChange,
  showStatusFilter = false,
  sortBy,
  onSortChange,
  sortOptions = [
    { value: "newest" as SortOption, label: "Newest First" },
    { value: "oldest" as SortOption, label: "Oldest First" },
    { value: "title-asc" as SortOption, label: "Title (A-Z)" },
    { value: "title-desc" as SortOption, label: "Title (Z-A)" },
  ],
  onAdvancedFilterClick,
  activeFiltersCount = 0,
  resultsText,
  onClearFilters,
}: SearchFilterBarProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by job title, description, or location..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Location Filter */}
        {locationFilter !== undefined &&
          onLocationChange &&
          locations.length > 0 && (
            <Select value={locationFilter} onValueChange={onLocationChange}>
              <SelectTrigger className="w-full lg:w-[200px]">
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {locations.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

        {/* Status Filter */}
        {showStatusFilter && statusFilter !== undefined && onStatusChange && (
          <Select value={statusFilter} onValueChange={onStatusChange}>
            <SelectTrigger className="w-full lg:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="under_review">Under Review</SelectItem>
              <SelectItem value="interview">Interview</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        )}

        {/* Sort */}
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="w-full lg:w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Advanced Filters Button */}
        {onAdvancedFilterClick && (
          <Button
            variant="outline"
            onClick={onAdvancedFilterClick}
            className="relative"
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-blue-600">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        )}
      </div>

      {/* Results Info */}
      {resultsText && (
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div>{resultsText}</div>
          {activeFiltersCount > 0 && onClearFilters && (
            <Button
              variant="link"
              size="sm"
              onClick={onClearFilters}
              className="text-blue-600 p-0 h-auto"
            >
              Clear all filters
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

// components/filters/AdvancedFiltersSheet.tsx
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { X } from "lucide-react";

interface AdvancedFiltersSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employmentTypes: string[];
  selectedEmploymentTypes: string[];
  onToggleEmploymentType: (type: string) => void;
  salaryRange: { min: number | null; max: number | null };
  onSalaryRangeChange: (range: {
    min: number | null;
    max: number | null;
  }) => void;
  onClearFilters: () => void;
}

export function AdvancedFiltersSheet({
  open,
  onOpenChange,
  employmentTypes,
  selectedEmploymentTypes,
  onToggleEmploymentType,
  salaryRange,
  onSalaryRangeChange,
  onClearFilters,
}: AdvancedFiltersSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Advanced Filters</SheetTitle>
          <SheetDescription>
            Refine your job search with detailed filters
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Employment Type */}
          {employmentTypes.length > 0 && (
            <div>
              <Label className="text-base font-semibold mb-3 block">
                Employment Type
              </Label>
              <div className="space-y-3">
                {employmentTypes.map((type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox
                      id={`type-${type}`}
                      checked={selectedEmploymentTypes.includes(type)}
                      onCheckedChange={() => onToggleEmploymentType(type)}
                    />
                    <label
                      htmlFor={`type-${type}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {type}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Salary Range */}
          <div>
            <Label className="text-base font-semibold mb-3 block">
              Salary Range (per year)
            </Label>
            <div className="space-y-3">
              <div>
                <Label htmlFor="min-salary" className="text-sm text-gray-600">
                  Minimum
                </Label>
                <Input
                  id="min-salary"
                  type="number"
                  placeholder="e.g., 50000000"
                  value={salaryRange.min || ""}
                  onChange={(e) =>
                    onSalaryRangeChange({
                      ...salaryRange,
                      min: e.target.value ? parseInt(e.target.value) : null,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="max-salary" className="text-sm text-gray-600">
                  Maximum
                </Label>
                <Input
                  id="max-salary"
                  type="number"
                  placeholder="e.g., 100000000"
                  value={salaryRange.max || ""}
                  onChange={(e) =>
                    onSalaryRangeChange({
                      ...salaryRange,
                      max: e.target.value ? parseInt(e.target.value) : null,
                    })
                  }
                />
              </div>
            </div>
          </div>

          {/* Quick Salary Presets */}
          <div>
            <Label className="text-sm text-gray-600 mb-2 block">
              Quick Select (IDR)
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSalaryRangeChange({ min: 0, max: 5000000 })}
              >
                &lt; 5 Juta
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  onSalaryRangeChange({ min: 5000000, max: 10000000 })
                }
              >
                5-10 Juta
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  onSalaryRangeChange({ min: 10000000, max: 20000000 })
                }
              >
                10-20 Juta
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  onSalaryRangeChange({ min: 20000000, max: null })
                }
              >
                &gt; 20 Juta
              </Button>
            </div>
          </div>

          {/* Clear Filters */}
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => {
              onClearFilters();
              onOpenChange(false);
            }}
          >
            <X className="h-4 w-4 mr-2" />
            Clear All Filters
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// components/stats/ApplicationStats.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SortOption } from "@/hooks/use-job-filters";

interface ApplicationStatsProps {
  total: number;
  submitted: number;
  underReview: number;
  interview: number;
  accepted: number;
}

export function ApplicationStats({
  total,
  submitted,
  underReview,
  interview,
  accepted,
}: ApplicationStatsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Application Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{total}</div>
            <div className="text-xs text-gray-600">Total</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{submitted}</div>
            <div className="text-xs text-gray-600">Submitted</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {underReview}
            </div>
            <div className="text-xs text-gray-600">Under Review</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {interview}
            </div>
            <div className="text-xs text-gray-600">Interview</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{accepted}</div>
            <div className="text-xs text-gray-600">Accepted</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
