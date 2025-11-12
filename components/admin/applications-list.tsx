"use client";

import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import type { Application, JobPosition, Profile } from "@/lib/types";
import {
  Eye,
  User,
  ChevronLeft,
  ChevronRight,
  Search,
  ArrowUpDown,
  GripVertical,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type ApplicationWithDetails = Application & {
  job_position: JobPosition & { form_fields?: any[] };
  applicant: Profile;
};

type ColumnConfig = {
  id: string;
  label: string;
  width: number;
  visible: boolean;
  accessor: (app: ApplicationWithDetails) => any;
};

const ITEMS_PER_PAGE = 10;

export default function ApplicationsList() {
  const supabase = createClient();
  const [applications, setApplications] = useState<ApplicationWithDetails[]>(
    []
  );
  const [filteredApplications, setFilteredApplications] = useState<
    ApplicationWithDetails[]
  >([]);
  const [selectedApp, setSelectedApp] = useState<ApplicationWithDetails | null>(
    null
  );
  const [showDetails, setShowDetails] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Table state
  const [columns, setColumns] = useState<ColumnConfig[]>([
    {
      id: "name",
      label: "Name",
      width: 200,
      visible: true,
      accessor: (app) => app.applicant.full_name,
    },
    {
      id: "email",
      label: "Email",
      width: 220,
      visible: true,
      accessor: (app) => app.applicant.email,
    },
    {
      id: "phone",
      label: "Phone",
      width: 150,
      visible: true,
      accessor: (app) => app.form_data?.phone || "-",
    },
    {
      id: "gender",
      label: "Gender",
      width: 120,
      visible: true,
      accessor: (app) => app.form_data?.gender || "-",
    },
    {
      id: "linkedin",
      label: "LinkedIn",
      width: 180,
      visible: true,
      accessor: (app) => app.form_data?.linkedin || "-",
    },
    {
      id: "domicile",
      label: "Domicile",
      width: 150,
      visible: true,
      accessor: (app) => app.form_data?.domicile || "-",
    },
    {
      id: "applied_date",
      label: "Applied Date",
      width: 150,
      visible: true,
      accessor: (app) => new Date(app.created_at).toLocaleDateString(),
    },
    {
      id: "status",
      label: "Status",
      width: 130,
      visible: true,
      accessor: (app) => app.status,
    },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);

  // Resizing state
  const [resizingColumn, setResizingColumn] = useState<string | null>(null);
  const [startX, setStartX] = useState(0);
  const [startWidth, setStartWidth] = useState(0);

  // Drag and drop state
  const [draggedColumn, setDraggedColumn] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  const fetchUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    setUserId(user.id);

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    setUserRole(profile?.role || "applicant");
  };

  const fetchApplications = async (role: string, uid: string) => {
    setIsLoading(true);

    const query = supabase
      .from("applications")
      .select(
        `
        *,
        job_position:job_positions!applications_job_position_id_fkey(
          *,
          form_fields:form_fields!form_fields_job_position_id_fkey(*)
        ),
        applicant:profiles!applications_applicant_id_fkey(*)
      `
      )
      .order("created_at", { ascending: false });

    if (role !== "admin") {
      query.eq("applicant_id", uid);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching applications:", error.message);
      setIsLoading(false);
      return;
    }

    setApplications(data as unknown as ApplicationWithDetails[]);
    setFilteredApplications(data as unknown as ApplicationWithDetails[]);
    setIsLoading(false);
  };

  const updateStatus = async (appId: string, status: string) => {
    await supabase.from("applications").update({ status }).eq("id", appId);
    if (userRole && userId) fetchApplications(userRole, userId);
    if (selectedApp?.id === appId) {
      setSelectedApp({
        ...selectedApp,
        status: status as Application["status"],
      });
    }
  };

  const getStatusColor = (status: string) => {
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

  // Column resizing handlers
  const handleMouseDown = (e: React.MouseEvent, columnId: string) => {
    e.preventDefault();
    const column = columns.find((c) => c.id === columnId);
    if (!column) return;

    setResizingColumn(columnId);
    setStartX(e.clientX);
    setStartWidth(column.width);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!resizingColumn) return;

    const diff = e.clientX - startX;
    const newWidth = Math.max(100, startWidth + diff);

    setColumns((prev) =>
      prev.map((col) =>
        col.id === resizingColumn ? { ...col, width: newWidth } : col
      )
    );
  };

  const handleMouseUp = () => {
    setResizingColumn(null);
  };

  useEffect(() => {
    if (resizingColumn) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [resizingColumn, startX, startWidth]);

  // Drag and drop handlers
  const handleDragStart = (columnId: string) => {
    setDraggedColumn(columnId);
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    setDragOverColumn(columnId);
  };

  const handleDrop = (e: React.DragEvent, targetColumnId: string) => {
    e.preventDefault();
    if (!draggedColumn || draggedColumn === targetColumnId) return;

    const draggedIndex = columns.findIndex((c) => c.id === draggedColumn);
    const targetIndex = columns.findIndex((c) => c.id === targetColumnId);

    const newColumns = [...columns];
    const [removed] = newColumns.splice(draggedIndex, 1);
    newColumns.splice(targetIndex, 0, removed);

    setColumns(newColumns);
    setDraggedColumn(null);
    setDragOverColumn(null);
  };

  // Sorting handler
  const handleSort = (columnId: string) => {
    if (sortColumn === columnId) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(columnId);
      setSortDirection("asc");
    }
  };

  // Filter and sort logic
  useEffect(() => {
    let filtered = [...applications];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (app) =>
          app.applicant.full_name?.toLowerCase().includes(query) ||
          app.applicant.email?.toLowerCase().includes(query) ||
          String(app.form_data?.phone || "")
            .toLowerCase()
            .includes(query) ||
          String(app.form_data?.linkedin || "")
            .toLowerCase()
            .includes(query) ||
          String(app.form_data?.domicile || "")
            .toLowerCase()
            .includes(query)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((app) => app.status === statusFilter);
    }

    // Sorting
    if (sortColumn) {
      const column = columns.find((c) => c.id === sortColumn);
      if (column) {
        filtered.sort((a, b) => {
          const aVal = column.accessor(a);
          const bVal = column.accessor(b);
          const comparison = String(aVal).localeCompare(String(bVal));
          return sortDirection === "asc" ? comparison : -comparison;
        });
      }
    }

    setFilteredApplications(filtered);
    setCurrentPage(1);
  }, [applications, searchQuery, statusFilter, sortColumn, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredApplications.length / ITEMS_PER_PAGE);
  const paginatedApplications = filteredApplications.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (userRole && userId) fetchApplications(userRole, userId);
  }, [userRole, userId]);

  if (isLoading) {
    return <div className="text-center py-8">Loading applications...</div>;
  }

  if (applications.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-gray-500">
            {userRole === "admin"
              ? "No applications have been submitted yet."
              : "You haven't submitted any applications yet."}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, email, phone, LinkedIn, domicile..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
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
          </div>
          <div className="mt-4 text-sm text-gray-600">
            Showing {paginatedApplications.length} of{" "}
            {filteredApplications.length} applications
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {columns
                    .filter((c) => c.visible)
                    .map((column) => (
                      <th
                        key={column.id}
                        style={{
                          width: `${column.width}px`,
                          minWidth: `${column.width}px`,
                        }}
                        className="relative text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-r last:border-r-0"
                        draggable
                        onDragStart={() => handleDragStart(column.id)}
                        onDragOver={(e) => handleDragOver(e, column.id)}
                        onDrop={(e) => handleDrop(e, column.id)}
                      >
                        <div className="flex items-center justify-between px-4 py-3 cursor-move">
                          <div className="flex items-center gap-2">
                            <GripVertical className="h-3 w-3 text-gray-400" />
                            <span>{column.label}</span>
                            <button
                              onClick={() => handleSort(column.id)}
                              className="hover:text-gray-900"
                            >
                              <ArrowUpDown
                                className={`h-3 w-3 ${
                                  sortColumn === column.id
                                    ? "text-blue-600"
                                    : ""
                                }`}
                              />
                            </button>
                          </div>
                          <div
                            className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-500 transition-colors"
                            onMouseDown={(e) => handleMouseDown(e, column.id)}
                          />
                        </div>
                        {dragOverColumn === column.id &&
                          draggedColumn !== column.id && (
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />
                          )}
                      </th>
                    ))}
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-32">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedApplications.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50">
                    {columns
                      .filter((c) => c.visible)
                      .map((column) => (
                        <td
                          key={column.id}
                          style={{
                            width: `${column.width}px`,
                            minWidth: `${column.width}px`,
                          }}
                          className="px-4 py-3 text-sm text-gray-900 border-r last:border-r-0"
                        >
                          {column.id === "name" ? (
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage
                                  src={
                                    app.applicant?.profile_photo_url ||
                                    undefined
                                  }
                                />
                                <AvatarFallback>
                                  <User className="h-4 w-4" />
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium">
                                {column.accessor(app)}
                              </span>
                            </div>
                          ) : column.id === "status" ? (
                            <Badge className={getStatusColor(app.status)}>
                              {String(column.accessor(app)).replace("_", " ")}
                            </Badge>
                          ) : column.id === "linkedin" ? (
                            <a
                              href={String(column.accessor(app))}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline truncate block max-w-full"
                            >
                              {String(column.accessor(app))}
                            </a>
                          ) : (
                            <span className="truncate block">
                              {String(column.accessor(app))}
                            </span>
                          )}
                        </td>
                      ))}
                    <td className="px-4 py-3 text-sm">
                      <div className="flex gap-2">
                        {userRole === "admin" && (
                          <>
                            <Select
                              value={app.status}
                              onValueChange={(value) =>
                                updateStatus(app.id, value)
                              }
                            >
                              <SelectTrigger className="w-32 h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="submitted">
                                  Submitted
                                </SelectItem>
                                <SelectItem value="under_review">
                                  Review
                                </SelectItem>
                                <SelectItem value="interview">
                                  Interview
                                </SelectItem>
                                <SelectItem value="accepted">
                                  Accepted
                                </SelectItem>
                                <SelectItem value="rejected">
                                  Rejected
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedApp(app);
                                setShowDetails(true);
                              }}
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-6 py-4 border-t">
            <div className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
            <DialogDescription>
              {selectedApp?.applicant.full_name} -{" "}
              {selectedApp?.job_position.title}
            </DialogDescription>
          </DialogHeader>

          {selectedApp && (
            <div className="space-y-6 mt-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage
                    src={selectedApp.applicant?.profile_photo_url || undefined}
                  />
                  <AvatarFallback>
                    <User className="h-10 w-10" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg">
                    {selectedApp.applicant.full_name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {selectedApp.applicant.email}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Application Responses</h3>
                <div className="space-y-2">
                  {selectedApp.form_data &&
                    Object.entries(selectedApp.form_data).map(
                      ([key, value]) => {
                        const field =
                          selectedApp.job_position?.form_fields?.find(
                            (f) => f.field_name === key
                          );
                        const label = field?.field_label || key;

                        return (
                          <div
                            key={key}
                            className="p-3 border rounded-lg bg-gray-50"
                          >
                            <span className="font-medium text-sm text-gray-700 block mb-1">
                              {label}
                            </span>
                            <span className="text-sm text-gray-800">
                              {String(value)}
                            </span>
                          </div>
                        );
                      }
                    )}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Update Status</h3>
                <Select
                  value={selectedApp.status}
                  onValueChange={(value) => updateStatus(selectedApp.id, value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="submitted">Submitted</SelectItem>
                    <SelectItem value="under_review">Under Review</SelectItem>
                    <SelectItem value="interview">Interview</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
