import React, { useEffect, useMemo, useState } from "react";
import { Loader2, FileText, Clock, CheckCircle, XCircle, AlertCircle, Calendar } from "lucide-react";
import { GlassCard } from "../components/ui/GlassCard";
import { Badge } from "../components/ui/Badge";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { getMyPrintJobs } from "../lib/api";

interface PrintOrder {
  id: string;
  userId: string;
  printerId: string;
  fileName: string;
  pages: number;
  color: boolean;
  status: 'pending' | 'accepted' | 'completed' | 'cancelled';
  createdAt: string;
  cost: number;
  printerName?: string;
  printerOwner?: string;
}

function formatDateTime(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso || "";
  return d.toLocaleString();
}

export function OrdersPage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [orders, setOrders] = useState<PrintOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!user?.id) {
        setLoading(false);
        return;
      }
      
      try {
        const token = localStorage.getItem("auth_token");
        const res = await getMyPrintJobs(token || undefined);
        
        if (cancelled) return;
        
        if (res.ok) {
          setOrders(res.data as PrintOrder[]);
          setError(null);
        } else {
          setError(res.error?.message || "Failed to load orders");
          addToast({
            type: 'error',
            title: 'Failed to Load Orders',
            message: res.error?.message || 'Could not load your print orders'
          });
        }
      } catch (err) {
        if (!cancelled) {
          setError("Network error occurred");
          addToast({
            type: 'error',
            title: 'Network Error',
            message: 'Could not connect to the server'
          });
        }
      }
      
      setLoading(false);
    }
    
    load();
    return () => {
      cancelled = true;
    };
  }, [user?.id, addToast]);

  const hasOrders = useMemo(() => orders && orders.length > 0, [orders]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock size={16} className="text-yellow-500" />;
      case 'accepted': return <CheckCircle size={16} className="text-blue-500" />;
      case 'completed': return <CheckCircle size={16} className="text-green-500" />;
      case 'cancelled': return <XCircle size={16} className="text-red-500" />;
      default: return <AlertCircle size={16} className="text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'accepted': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'completed': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'cancelled': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-6">My Orders</h1>
      <GlassCard>
        {loading ? (
          <div className="p-8 flex items-center gap-3">
            <Loader2 className="animate-spin" />
            <span>Loading orders…</span>
          </div>
        ) : error ? (
          <div className="p-8 text-red-500">{error}</div>
        ) : !hasOrders ? (
          <div className="p-8 text-theme-text-muted">No orders yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-white/20 text-gray-400">
                  <th className="pb-3 pr-4 font-medium">File</th>
                  <th className="pb-3 pr-4 font-medium">Status</th>
                  <th className="pb-3 pr-4 font-medium">Printer</th>
                  <th className="pb-3 pr-4 font-medium">Pages</th>
                  <th className="pb-3 pr-4 font-medium">Cost</th>
                  <th className="pb-3 pr-4 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-b border-white/10 hover:bg-white/5">
                    <td className="py-3 pr-4">
                      <div className="flex items-center space-x-2">
                        <FileText size={16} className="text-gray-400" />
                        <span className="text-sm">{o.fileName}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(o.status)}
                        <Badge className={getStatusColor(o.status)}>
                          {o.status.charAt(0).toUpperCase() + o.status.slice(1)}
                        </Badge>
                      </div>
                    </td>
                    <td className="py-3 pr-4">{o.printerName || 'N/A'}</td>
                    <td className="py-3 pr-4">
                      {o.pages} pages{o.color ? ' (Color)' : ' (B&W)'}
                    </td>
                    <td className="py-3 pr-4">৳{o.cost.toFixed(2)}</td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center space-x-1 text-sm text-gray-400">
                        <Calendar size={14} />
                        <span>{formatDateTime(o.createdAt)}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
