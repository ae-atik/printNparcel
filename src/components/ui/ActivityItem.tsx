import React from 'react';
import { Clock, CheckCircle, XCircle, AlertCircle, FileText, Printer } from 'lucide-react';

interface ActivityItemProps {
  activity: {
    id?: number | string;
    actionType?: string;
    description: string;
    status: string;
    time: string;
    createdAt?: string;
    fileName?: string;
    printerLocation?: string;
    userName?: string;
    targetUserName?: string;
  };
}

export const ActivityItem: React.FC<ActivityItemProps> = ({ activity }) => {
  // Determine actual status from notification message content
  const getActualStatus = (description: string) => {
    if (description.includes('has been completed')) {
      return 'completed';
    } else if (description.includes('has been accepted')) {
      return 'accepted';
    } else if (description.includes('cancelled') || description.includes('canceled')) {
      return 'cancelled';
    } else if (description.includes('submitted') || description.includes('requested')) {
      return 'pending';
    }
    return 'pending'; // default
  };

  const actualStatus = getActualStatus(activity.description);

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'accepted':
        return <CheckCircle size={16} className="text-blue-500" />;
      case 'pending':
        return <Clock size={16} className="text-yellow-500" />;
      case 'cancelled':
        return <XCircle size={16} className="text-red-500" />;
      default:
        return <AlertCircle size={16} className="text-gray-500" />;
    }
  };

  const getActionIcon = (actionType?: string) => {
    if (!actionType) return null;
    
    if (actionType.includes('print_request')) {
      return <FileText size={16} className="text-blue-500" />;
    }
    if (actionType.includes('printer')) {
      return <Printer size={16} className="text-orange-500" />;
    }
    return null;
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-500/10 text-green-400';
      case 'accepted':
        return 'bg-blue-500/10 text-blue-400';
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-400';
      case 'cancelled':
        return 'bg-red-500/10 text-red-400';
      default:
        return 'bg-gray-500/10 text-gray-400';
    }
  };

  // Transform notification message based on status
  const getDisplayMessage = (description: string) => {
    return description;
  };

  return (
    <div className="flex items-center justify-between py-3 border-b border-white/10 last:border-b-0">
      <div className="flex items-start space-x-3">
        {getActionIcon(activity.actionType)}
        <div>
          <p className="text-sm font-medium text-theme-text">
            {getDisplayMessage(activity.description)}
          </p>
          <div className="flex items-center space-x-2 text-xs text-theme-text-secondary">
            <span>{activity.time}</span>
            {activity.fileName && (
              <>
                <span>•</span>
                <span>File: {activity.fileName}</span>
              </>
            )}
            {activity.printerLocation && (
              <>
                <span>•</span>
                <span>Printer: {activity.printerLocation}</span>
              </>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        {getStatusIcon(actualStatus)}
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(actualStatus)}`}>
          {actualStatus.charAt(0).toUpperCase() + actualStatus.slice(1)}
        </span>
      </div>
    </div>
  );
};