import React, { useState, useEffect } from "react";
import {
  Users,
  Printer,
  BarChart3,
  CheckCircle,
  Eye,
  Trash2,
  Edit,
} from "lucide-react";
import { GlassCard } from "../components/ui/GlassCard";
import { GlassButton } from "../components/ui/GlassButton";
import { GlassInput } from "../components/ui/GlassInput";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import { toMediaUrl } from "../lib/api";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";
import {
  listUsers,
  listAllPrintersForAdmin,
  approvePrinter,
  updatePrinter,
  removePrinter,
} from "../lib/api";
import { User, Printer as PrinterType } from "../types";
import usersData from "../data/users.json";
import printersData from "../data/printers.json";

type EditablePrinterStatus =
  | PrinterType["status"]
  | "pending"
  | "declined"
  | "rejected";

export const AdminPage: React.FC = () => {
  const { isDemo } = useAuth();
  const [activeTab, setActiveTab] = useState<
    "users" | "printers" | "analytics"
  >("users");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedPrinter, setSelectedPrinter] = useState<PrinterType | null>(
    null
  );
  const [users, setUsers] = useState<User[]>([]);
  const [printers, setPrinters] = useState<PrinterType[]>([]);
  const [editPrinterModal, setEditPrinterModal] = useState<PrinterType | null>(
    null
  );
  const [editPrinterForm, setEditPrinterForm] = useState({
    name: "",
    type: "both" as PrinterType["type"],
    pricePerPageBW: "",
    pricePerPageColor: "",
    brand: "",
    model: "",
    paperSizes: "A4,Letter",
    features: "",
    university: "",
    hall: "",
    room: "",
    status: "pending" as EditablePrinterStatus,
    isApproved: false,
  });
  const [isSavingPrinter, setIsSavingPrinter] = useState(false);
  const [deletePrinterTarget, setDeletePrinterTarget] = useState<PrinterType | null>(
    null
  );
  const [isDeletingPrinter, setIsDeletingPrinter] = useState(false);
  const statusOptions: EditablePrinterStatus[] = [
    "pending",
    "online",
    "offline",
    "busy",
    "maintenance",
    "declined",
    "rejected",
  ];
  const { addToast } = useToast();

  // Set active tab based on URL hash or default to users
  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash && ["users", "printers", "analytics"].includes(hash)) {
      setActiveTab(hash as "users" | "printers" | "analytics");
    }
  }, []);

  // Load from demo JSON or backend depending on isDemo
  useEffect(() => {
    let canceled = false;

    async function load() {
      if (isDemo) {
        // Use frontend demo data
        if (!canceled) {
          setUsers(usersData.users as User[]);
          setPrinters(printersData.printers as PrinterType[]);
        }
        return;
      }

      // Use real backend data
      const token = localStorage.getItem("auth_token");
      const [uRes, pRes] = await Promise.all([
        listUsers(token || undefined), 
        listAllPrintersForAdmin(token || undefined) // Use admin function to see all printers
      ]);
      if (canceled) return;

      if (uRes.ok && Array.isArray(uRes.data)) {
        setUsers(uRes.data as User[]);
      }
      if (pRes.ok && Array.isArray(pRes.data)) {
        // For admin, show all printers but highlight pending ones
        setPrinters(pRes.data as PrinterType[]);
      }
    }

    load();
    return () => {
      canceled = true;
    };
  }, [isDemo]);

  // When the logged-in user's profile is updated, patch our local list so avatars refresh instantly
  useEffect(() => {
    function onUserUpdated(e: Event) {
      const detail = (e as CustomEvent<User>).detail;
      if (!detail?.id) return;

      setUsers(prev =>
        prev.map(u => (u.id === detail.id ? { ...u, profilePicture: detail.profilePicture } : u))
      );
      setSelectedUser(prev =>
        prev && prev.id === detail.id ? { ...prev, profilePicture: detail.profilePicture } : prev
      );
    }

    window.addEventListener("auth:user-updated", onUserUpdated as EventListener);
    return () => window.removeEventListener("auth:user-updated", onUserUpdated as EventListener);
  }, []);


const handleApprovePrinter = async (printerId: string) => {
  if (isDemo) {
    // Demo mode - just update local state
    setPrinters(prev => prev.map(p => 
      p.id === printerId 
        ? { ...p, status: 'online' as const, isApproved: true }
        : p
    ));
    addToast({ 
      type: "success", 
      title: "Printer approved", 
      message: "Printer is now online (demo mode)" 
    });
    return;
  }

  const res = await approvePrinter(printerId, localStorage.getItem("auth_token") || undefined);
  if (!res.ok) {
    addToast({
      type: "error",
      title: "Approve failed",
      message: "error" in res ? res.error.message : `Printer ${printerId} could not be approved`,
    });
    return;
  }
  const updated = res.data as PrinterType;
  setPrinters(prev => prev.map(p => (p.id === printerId ? (updated as any) : p)));
  addToast({ type: "success", title: "Printer approved", message: `${updated.name} is now online` });
};

  const openEditPrinter = (printer: PrinterType) => {
    setEditPrinterModal(printer);
    setEditPrinterForm({
      name: printer.name,
      type: printer.type,
      pricePerPageBW: printer.pricePerPageBW.toString(),
      pricePerPageColor: printer.pricePerPageColor.toString(),
      brand: printer.specifications.brand,
      model: printer.specifications.model,
      paperSizes: printer.specifications.paperSizes.join(","),
      features: printer.specifications.features.join(","),
      university: printer.location.university,
      hall: printer.location.hall,
      room: printer.location.room || "",
      status: (printer.status as EditablePrinterStatus) || "pending",
      isApproved: Boolean(printer.isApproved),
    });
  };

  const handleEditPrinterInput = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;

    if (name === "isApproved") {
      setEditPrinterForm((prev) => ({
        ...prev,
        isApproved: (event.target as HTMLInputElement).checked,
      }));
      return;
    }

    if (name === "type") {
      setEditPrinterForm((prev) => ({ ...prev, type: value as PrinterType["type"] }));
      return;
    }

    if (name === "status") {
      setEditPrinterForm((prev) => ({ ...prev, status: value as EditablePrinterStatus }));
      return;
    }

    // Validate price fields to ensure they don't go below 0
    if (name === "pricePerPageBW" || name === "pricePerPageColor") {
      const numValue = Math.max(0, Number(value) || 0);
      setEditPrinterForm((prev) => ({ ...prev, [name]: numValue.toString() }));
      return;
    }

    setEditPrinterForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSavePrinter = async () => {
    if (!editPrinterModal) return;
    setIsSavingPrinter(true);

    try {
      const paperSizes = editPrinterForm.paperSizes
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const features = editPrinterForm.features
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        name: editPrinterForm.name,
        type: editPrinterForm.type,
        pricePerPageBW: Number(editPrinterForm.pricePerPageBW || 0),
        pricePerPageColor: Number(editPrinterForm.pricePerPageColor || 0),
        location: {
          university: editPrinterForm.university || "",
          hall: editPrinterForm.hall || "",
          room: editPrinterForm.room || "",
        },
        specifications: {
          brand: editPrinterForm.brand || "",
          model: editPrinterForm.model || "",
          paperSizes,
          features,
        },
        status: editPrinterForm.status,
        isApproved: editPrinterForm.isApproved,
      };

      const res = await updatePrinter(editPrinterModal.id, payload, localStorage.getItem("auth_token") || undefined);
      if (!res.ok) {
        throw new Error("error" in res ? res.error.message : "Update failed");
      }

      const updated = res.data as PrinterType;
      setPrinters((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      setSelectedPrinter((prev) => (prev && prev.id === updated.id ? updated : prev));

      addToast({
        type: "success",
        title: "Printer updated",
        message: `${updated.name} has been updated successfully.`,
      });
      setEditPrinterModal(null);
    } catch (error: any) {
      addToast({
        type: "error",
        title: "Update failed",
        message: error?.message || "Unable to update printer.",
      });
    } finally {
      setIsSavingPrinter(false);
    }
  };

  const requestRemovePrinter = (printer: PrinterType) => {
    setDeletePrinterTarget(printer);
  };

    const confirmRemovePrinter = async () => {
    if (!deletePrinterTarget) return;
    setIsDeletingPrinter(true);
    try {
      const res = await removePrinter(deletePrinterTarget.id, localStorage.getItem("auth_token") || undefined);
      if (!res.ok) {
        throw new Error(res.error?.message || "Remove failed");
      }

      // Update the printer status to 'declined' instead of removing it
      const updated = res.data as PrinterType;
      setPrinters(prev => prev.map(p => (p.id === deletePrinterTarget.id ? updated : p)));
      setSelectedPrinter((prev) =>
        prev && prev.id === deletePrinterTarget.id ? null : prev
      );
      setEditPrinterModal((prev) =>
        prev && prev.id === deletePrinterTarget.id ? null : prev
      );

      addToast({
        type: "success",
        title: "Printer Removed",
        message: `"${deletePrinterTarget.name}" has been declined.`,
      });
      setDeletePrinterTarget(null);
    } catch (error: any) {
      addToast({
        type: "error",
        title: "Remove Failed",
        message: error?.message || "Unable to remove printer.",
      });
    } finally {
      setIsDeletingPrinter(false);
    }
  };

  const cancelRemovePrinter = () => {
    if (isDeletingPrinter) return;
    setDeletePrinterTarget(null);
  };

  const handleRemoveUser = (userId: string, userName: string) => {
    if (
      window.confirm(
        `Are you sure you want to remove user "${userName}"? This action cannot be undone.`
      )
    ) {
      // In real app, this would delete via API
      addToast({
        type: "success",
        title: "User Removed",
        message: `User "${userName}" has been removed successfully.`,
      });
      setSelectedUser(null);
    }
  };

  const renderUsersTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {users.map((user) => (
          <GlassCard key={user.id} className="p-6">
            <div className="flex items-start gap-4">
              <img
                src={toMediaUrl(user.profilePicture)}
                alt={user.username}
                className="w-16 h-16 rounded-full object-cover"
              />

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-theme-text">
                    {user.firstName} {user.lastName}
                  </h3>
                  <div className="flex gap-1">
                    {user.roles.map((role) => (
                      <span
                        key={role}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-campus-green-light text-campus-green"
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
                <p className="text-sm text-theme-text-secondary mb-1">
                  @{user.username}
                </p>
                <p className="text-sm text-theme-text-secondary mb-1">
                  {user.email}
                </p>
                <p className="text-sm text-theme-text-secondary mb-3">
                  {user.university} - {user.hall}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-campus-green">
                    Credits: ৳{Number(user?.credits ?? 0).toFixed(2)}
                  </span>
                  <GlassButton
                    variant="secondary"
                    size="sm"
                    onClick={() => setSelectedUser(user)}
                  >
                    <Eye size={16} className="mr-1" />
                    View Details
                  </GlassButton>
                </div>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );

  const renderPrintersTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {printers.map((printer) => (
          <GlassCard key={printer.id} className="p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-campus-green/20 to-info/20 rounded-lg flex items-center justify-center">
                <Printer size={24} className="text-campus-green" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-theme-text">
                    {printer.name}
                  </h3>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      printer.status === 'declined'
                        ? "bg-danger/20 text-danger"
                        : printer.isApproved
                        ? "bg-success/10 text-success"
                        : "bg-warning/10 text-warning"
                    }`}
                  >
                    {printer.status === 'declined' 
                      ? "Declined" 
                      : printer.isApproved 
                      ? "Approved" 
                      : "Pending"}
                  </span>
                </div>
                <p className="text-sm text-theme-text-secondary mb-1">
                  {printer.specifications.brand} {printer.specifications.model}
                </p>
                <p className="text-sm text-theme-text-secondary mb-1">
                  Owner: {printer.ownerName}
                </p>
                <p className="text-sm text-theme-text-secondary mb-3">
                  {printer.location.hall} - {printer.location.room}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm text-theme-text-secondary">
                <span className="font-medium">
                  B&W: ৳{printer.pricePerPageBW.toFixed(2)}
                </span>
                {printer.pricePerPageColor > 0 && (
                  <span className="ml-3 font-medium">
                    Color: ৳{printer.pricePerPageColor.toFixed(2)}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2 justify-end">
                <GlassButton
                  variant="secondary"
                  size="sm"
                  onClick={() => setSelectedPrinter(printer)}
                >
                  <Eye size={16} className="mr-1" />
                  View
                </GlassButton>
                <GlassButton
                  variant="secondary"
                  size="sm"
                  onClick={() => openEditPrinter(printer)}
                >
                  <Edit size={16} className="mr-1" />
                  Edit
                </GlassButton>
                <GlassButton
                  variant="danger"
                  size="sm"
                  onClick={() => requestRemovePrinter(printer)}
                >
                  <Trash2 size={16} className="mr-1" />
                  Remove
                </GlassButton>
                {!printer.isApproved && printer.status !== 'declined' && (
                  <GlassButton
                    variant="success"
                    size="sm"
                    onClick={() => handleApprovePrinter(printer.id)}
                  >
                    <CheckCircle size={16} className="mr-1" />
                    Approve
                  </GlassButton>
                )}
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );

  const renderAnalyticsTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="p-6 text-center">
          <Users size={32} className="mx-auto text-info mb-4" />
          <h3 className="text-2xl font-bold text-theme-text">1,234</h3>
          <p className="text-theme-text-secondary">Total Users</p>
        </GlassCard>
        <GlassCard className="p-6 text-center">
          <Printer size={32} className="mx-auto text-success mb-4" />
          <h3 className="text-2xl font-bold text-theme-text">45</h3>
          <p className="text-theme-text-secondary">Active Printers</p>
        </GlassCard>
        <GlassCard className="p-6 text-center">
          <BarChart3 size={32} className="mx-auto text-campus-green mb-4" />
          <h3 className="text-2xl font-bold text-theme-text">৳12,450</h3>
          <p className="text-theme-text-secondary">Monthly Revenue</p>
        </GlassCard>
      </div>

      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold text-theme-text mb-4">
          Recent Activity
        </h3>
        <div className="space-y-3">
          {[
            {
              action: "New user registered",
              time: "5 minutes ago",
              type: "user",
            },
            { action: "Printer approved", time: "1 hour ago", type: "printer" },
            { action: "Print job completed", time: "2 hours ago", type: "job" },
            {
              action: "Delivery request fulfilled",
              time: "3 hours ago",
              type: "delivery",
            },
          ].map((activity, index) => (
            <div
              key={index}
              className="flex items-center justify-between py-2 border-b border-glass-border last:border-b-0"
            >
              <span className="text-sm text-theme-text">{activity.action}</span>
              <span className="text-xs text-theme-text-secondary">
                {activity.time}
              </span>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );

  return (
    <div className="min-h-screen pt-16 px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold gradient-text mb-2">
            Admin Dashboard
          </h1>
          <p className="text-theme-text-secondary">
            Manage users, printers, and platform analytics
          </p>
        </div>

        {/* Navigation Tabs */}
        <GlassCard className="p-2">
          <div className="flex space-x-1">
            {[
              { id: "users", label: "Users", icon: Users },
              { id: "printers", label: "Printers", icon: Printer },
              { id: "analytics", label: "Analytics", icon: BarChart3 },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    window.location.hash = tab.id;
                  }}
                  className={`flex items-center px-4 py-2 rounded-component text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? "bg-campus-green text-white"
                      : "text-theme-text-secondary hover:text-theme-text hover:bg-glass-hover"
                  }`}
                >
                  <Icon size={16} className="mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </GlassCard>

        {/* Tab Content */}
        {activeTab === "users" && renderUsersTab()}
        {activeTab === "printers" && renderPrintersTab()}
        {activeTab === "analytics" && renderAnalyticsTab()}

        {/* User Detail Modal */}
        {selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <GlassCard className="w-full max-w-lg">
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-4">User Details</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={toMediaUrl(selectedUser.profilePicture)}
                      alt={selectedUser.username}
                      className="w-20 h-20 rounded-full object-cover"
                    />

                    <div>
                      <h4 className="font-semibold text-theme-text">
                        {selectedUser.firstName} {selectedUser.lastName}
                      </h4>
                      <p className="text-theme-text-secondary">
                        @{selectedUser.username}
                      </p>
                      <p className="text-theme-text-secondary">
                        {selectedUser.email}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-theme-text-secondary">University</p>
                      <p className="text-theme-text font-medium">
                        {selectedUser.university}
                      </p>
                    </div>
                    <div>
                      <p className="text-theme-text-secondary">Hall</p>
                      <p className="text-theme-text font-medium">
                        {selectedUser.hall}
                      </p>
                    </div>
                    <div>
                      <p className="text-theme-text-secondary">Credits</p>
                      <p className="text-theme-text font-medium">
                        ৳{Number(selectedUser?.credits ?? 0).toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-theme-text-secondary">Roles</p>
                      <div className="flex gap-1 mt-1">
                        {selectedUser.roles.map((role) => (
                          <span
                            key={role}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-campus-green-light text-campus-green"
                          >
                            {role}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <GlassButton
                      variant="secondary"
                      onClick={() => setSelectedUser(null)}
                      className="flex-1"
                    >
                      Close
                    </GlassButton>
                    <GlassButton
                      variant="danger"
                      onClick={() =>
                        handleRemoveUser(
                          selectedUser.id,
                          `${selectedUser.firstName} ${selectedUser.lastName}`
                        )
                      }
                      className="flex-1"
                    >
                      <Trash2 size={16} className="mr-1" />
                      Remove User
                    </GlassButton>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        )}

        {/* Printer Detail Modal */}
        {selectedPrinter && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <GlassCard className="w-full max-w-lg">
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-4">Printer Details</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-campus-green/20 to-info/20 rounded-lg flex items-center justify-center">
                      <Printer size={24} className="text-campus-green" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-theme-text">
                        {selectedPrinter.name}
                      </h4>
                      <p className="text-theme-text-secondary">
                        {selectedPrinter.specifications.brand}{" "}
                        {selectedPrinter.specifications.model}
                      </p>
                      <p className="text-theme-text-secondary">
                        Owner: {selectedPrinter.ownerName}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-theme-text-secondary">Location</p>
                      <p className="text-theme-text font-medium">
                        {selectedPrinter.location.hall} -{" "}
                        {selectedPrinter.location.room}
                      </p>
                    </div>
                    <div>
                      <p className="text-theme-text-secondary">Type</p>
                      <p className="text-theme-text font-medium">
                        {selectedPrinter.type}
                      </p>
                    </div>
                    <div>
                      <p className="text-theme-text-secondary">B&W Price</p>
                      <p className="text-theme-text font-medium">
                        ৳{selectedPrinter.pricePerPageBW.toFixed(2)}/page
                      </p>
                    </div>
                    <div>
                      <p className="text-theme-text-secondary">Color Price</p>
                      <p className="text-theme-text font-medium">
                        {selectedPrinter.pricePerPageColor > 0
                          ? `৳${selectedPrinter.pricePerPageColor.toFixed(2)}/page`
                          : "N/A"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-theme-text-secondary text-sm">
                      Features
                    </p>
                    <p className="text-theme-text font-medium">
                      {selectedPrinter.specifications.features.join(", ")}
                    </p>
                  </div>

                  <div className="flex gap-3 pt-4">
                <GlassButton
                  variant="secondary"
                  onClick={() => setSelectedPrinter(null)}
                  className="flex-1"
                >
                  Close
                </GlassButton>
                <GlassButton
                  variant="secondary"
                  onClick={() => {
                    openEditPrinter(selectedPrinter);
                    setSelectedPrinter(null);
                  }}
                  className="flex-1"
                >
                  <Edit size={16} className="mr-1" />
                  Edit
                </GlassButton>
                <GlassButton
                  variant="danger"
                  onClick={() => requestRemovePrinter(selectedPrinter)}
                  className="flex-1"
                >
                      <Trash2 size={16} className="mr-1" />
                      Remove Printer
                    </GlassButton>
                    {!selectedPrinter.isApproved && selectedPrinter.status !== 'declined' && (
                      <GlassButton
                        variant="success"
                        onClick={() => {
                          handleApprovePrinter(selectedPrinter.id);
                          setSelectedPrinter(null);
                        }}
                        className="flex-1"
                      >
                        <CheckCircle size={16} className="mr-1" />
                        Approve
                      </GlassButton>
                    )}
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        )}

        {editPrinterModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <GlassCard className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 space-y-6">
                <h3 className="text-xl font-semibold text-theme-text">
                  Edit Printer: {editPrinterModal.name}
                </h3>

                <div className="space-y-4">
                  <GlassInput
                    label="Printer Name"
                    name="name"
                    value={editPrinterForm.name}
                    onChange={handleEditPrinterInput}
                    required
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-theme-text mb-2">
                        Printer Type
                      </label>
                      <select
                        name="type"
                        value={editPrinterForm.type}
                        onChange={handleEditPrinterInput}
                        className="w-full px-4 py-3 bg-glass-bg backdrop-blur-glass border border-glass-border rounded-component text-theme-text focus:outline-none focus:border-campus-green"
                      >
                        <option value="color">Color Only</option>
                        <option value="bw">Black &amp; White Only</option>
                        <option value="both">Both Color &amp; B&amp;W</option>
                      </select>
                    </div>
                    <GlassInput
                      label="B&amp;W Price per Page (৳)"
                      name="pricePerPageBW"
                      type="number"
                      min="0"
                      step="1"
                      value={editPrinterForm.pricePerPageBW}
                      onChange={handleEditPrinterInput}
                      required
                    />
                  </div>

                  {editPrinterForm.type !== "bw" && (
                    <GlassInput
                      label="Color Price per Page (৳)"
                      name="pricePerPageColor"
                      type="number"
                      min="0"
                      step="1"
                      value={editPrinterForm.pricePerPageColor}
                      onChange={handleEditPrinterInput}
                      required
                    />
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <GlassInput
                      label="Brand"
                      name="brand"
                      value={editPrinterForm.brand}
                      onChange={handleEditPrinterInput}
                      required
                    />
                    <GlassInput
                      label="Model"
                      name="model"
                      value={editPrinterForm.model}
                      onChange={handleEditPrinterInput}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <GlassInput
                      label="University"
                      name="university"
                      value={editPrinterForm.university}
                      onChange={handleEditPrinterInput}
                    />
                    <GlassInput
                      label="Hall"
                      name="hall"
                      value={editPrinterForm.hall}
                      onChange={handleEditPrinterInput}
                      required
                    />
                    <GlassInput
                      label="Room"
                      name="room"
                      value={editPrinterForm.room}
                      onChange={handleEditPrinterInput}
                    />
                  </div>

                  <GlassInput
                    label="Paper Sizes (comma separated)"
                    name="paperSizes"
                    value={editPrinterForm.paperSizes}
                    onChange={handleEditPrinterInput}
                    helperText="e.g., A4, Letter, Legal"
                  />

                  <GlassInput
                    label="Features (comma separated)"
                    name="features"
                    value={editPrinterForm.features}
                    onChange={handleEditPrinterInput}
                    helperText="e.g., Duplex, Stapling, Hole Punch"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-theme-text mb-2">
                        Status
                      </label>
                      <select
                        name="status"
                        value={editPrinterForm.status}
                        onChange={handleEditPrinterInput}
                        className="w-full px-4 py-3 bg-glass-bg backdrop-blur-glass border border-glass-border rounded-component text-theme-text focus:outline-none focus:border-campus-green"
                      >
                        {statusOptions.map((status) => (
                          <option key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <label className="flex items-center gap-2 text-sm text-theme-text">
                      <input
                        type="checkbox"
                        name="isApproved"
                        checked={editPrinterForm.isApproved}
                        onChange={handleEditPrinterInput}
                        className="h-4 w-4 rounded border-glass-border text-campus-green focus:ring-campus-green"
                      />
                      Mark as approved
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <GlassButton
                    variant="secondary"
                    onClick={() => setEditPrinterModal(null)}
                    className="flex-1"
                    disabled={isSavingPrinter}
                  >
                    Cancel
                  </GlassButton>
                  <GlassButton
                    variant="primary"
                    onClick={handleSavePrinter}
                    loading={isSavingPrinter}
                    className="flex-1"
                  >
                    Save Changes
                  </GlassButton>
                </div>
              </div>
            </GlassCard>
          </div>
        )}

        <ConfirmDialog
          open={!!deletePrinterTarget}
          title="Remove printer?"
          message={
            <span>
              This will decline{' '}
              <span className="font-semibold text-theme-text">
                {deletePrinterTarget?.name}
              </span>{' '}
              and mark it as declined in the system. It will be removed from the owner's dashboard.
            </span>
          }
          confirmLabel="Remove"
          confirmVariant="danger"
          loading={isDeletingPrinter}
          onConfirm={confirmRemovePrinter}
          onCancel={cancelRemovePrinter}
        />
      </div>
    </div>
  );
};
