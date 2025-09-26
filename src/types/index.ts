export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  profilePicture?: string;
  credits: number;
  roles: UserRole[];
  university: string;
  hall?: string;
  createdAt: string;
}

export type UserRole = 'user' | 'printer_owner' | 'admin';

export interface Printer {
  id: string;
  name: string;
  ownerId: string;
  ownerName: string;
  type: 'color' | 'bw' | 'both';
  pricePerPageBW: number;
  pricePerPageColor: number;
  location: {
    university: string;
    hall: string;
    room?: string;
  };
  specifications: {
    brand: string;
    model: string;
    paperSizes: string[];
    features: string[];
  };
  status: 'online' | 'offline' | 'busy' | 'maintenance' | 'pending' | 'declined';
  isApproved: boolean;
  rating: number;
  totalJobs: number;
  createdAt: string;
}

export interface PrinterFormData {
  name: string;
  type: 'color' | 'bw' | 'both';
  pricePerPageBW: number;
  pricePerPageColor: number;
  location: {
    university: string;
    hall: string;
    room?: string;
  };
  specifications: {
    brand: string;
    model: string;
    paperSizes: string[];
    features: string[];
  };
  colorSupport: boolean;
  duplexSupport: boolean;
  paperSize: string;
}

export interface PrintJob {
  id: string;
  userId: string;
  printerId: string;
  fileName: string;
  fileSize: number;
  pages: number;
  copies: number;
  colorPages: number;
  bwPages: number;
  totalCost: number;
  status: 'pending' | 'accepted' | 'printing' | 'completed' | 'cancelled';
  createdAt: string;
  completedAt?: string;
}

export interface DeliveryRequest {
  id: string;
  userId: string;
  userName: string;
  userProfilePicture?: string;
  items: {
    name: string;
    image?: string;
    quantity: number;
    description?: string;
  }[];
  pickupLocation: {
    university: string;
    hall: string;
    room?: string;
  };
  deliveryLocation: {
    university: string;
    hall: string;
    room?: string;
  };
  payment: number;
  status: 'pending' | 'accepted' | 'in-progress' | 'completed' | 'cancelled';
  acceptedBy?: string;
  createdAt: string;
  requestedDeliveryTime?: string;
  urgency: 'low' | 'medium' | 'high';
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userProfilePicture?: string;
  rating: number;
  comment: string;
  serviceType: 'printing' | 'delivery';
  createdAt: string;
}