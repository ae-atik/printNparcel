import React, { useState } from 'react';
import { MapPin, DollarSign, Printer, Upload, Filter, Search } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { useToast } from '../../context/ToastContext';

interface PrinterData {
  id: string;
  name: string;
  location: string;
  distance: string;
  price: number;
  status: 'online' | 'offline' | 'busy';
  owner: string;
  type: string;
  rating: number;
  image: string;
}

export const Printers: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedPrinter, setSelectedPrinter] = useState<PrinterData | null>(null);
  const { addToast } = useToast();

  const printers: PrinterData[] = [
    {
      id: '1',
      name: 'QuickPrint Pro',
      location: 'Library - 2nd Floor',
      distance: '0.2 miles',
      price: 0.10,
      status: 'online',
      owner: 'Campus Print Services',
      type: 'Color Laser',
      rating: 4.8,
      image: 'https://images.pexels.com/photos/4439901/pexels-photo-4439901.jpeg?auto=compress&cs=tinysrgb&w=400',
    },
    {
      id: '2',
      name: 'Student Center Printer',
      location: 'Student Union Building',
      distance: '0.4 miles',
      price: 0.08,
      status: 'online',
      owner: 'Print Hub LLC',
      type: 'Black & White',
      rating: 4.5,
      image: 'https://images.pexels.com/photos/4439901/pexels-photo-4439901.jpeg?auto=compress&cs=tinysrgb&w=400',
    },
    {
      id: '3',
      name: 'Engineering Lab Printer',
      location: 'Engineering Building',
      distance: '0.6 miles',
      price: 0.12,
      status: 'busy',
      owner: 'TechPrint Solutions',
      type: 'Color Laser',
      rating: 4.9,
      image: 'https://images.pexels.com/photos/4439901/pexels-photo-4439901.jpeg?auto=compress&cs=tinysrgb&w=400',
    },
    {
      id: '4',
      name: 'Dorm Common Room',
      location: 'Residence Hall A',
      distance: '0.1 miles',
      price: 0.09,
      status: 'offline',
      owner: 'Campus Living',
      type: 'All-in-One',
      rating: 4.2,
      image: 'https://images.pexels.com/photos/4439901/pexels-photo-4439901.jpeg?auto=compress&cs=tinysrgb&w=400',
    },
  ];

  const filteredPrinters = printers.filter(printer => {
    const matchesSearch = printer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         printer.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = selectedLocation === 'all' || printer.location.includes(selectedLocation);
    return matchesSearch && matchesLocation;
  });

  const handlePrintRequest = (printer: PrinterData) => {
    setSelectedPrinter(printer);
    setIsUploadModalOpen(true);
  };

  const handleUpload = () => {
    addToast({
      type: 'success',
      title: 'Print job submitted!',
      message: `Your document has been sent to ${selectedPrinter?.name}`,
    });
    setIsUploadModalOpen(false);
    setSelectedPrinter(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-charcoal mb-2">Available Printers</h1>
        <p className="text-gray-600">Find and print to printers near you</p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Input
            icon={<Search size={20} />}
            placeholder="Search printers or locations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          value={selectedLocation}
          onChange={(e) => setSelectedLocation(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-component bg-white focus:outline-none focus:ring-2 focus:ring-campus-green"
        >
          <option value="all">All Locations</option>
          <option value="Library">Library</option>
          <option value="Student Union">Student Union</option>
          <option value="Engineering">Engineering</option>
          <option value="Residence">Residence Halls</option>
        </select>
      </div>

      {/* Printer Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPrinters.map((printer) => (
          <Card key={printer.id} hover className="p-0 overflow-hidden">
            <div className="aspect-video bg-gray-100 relative">
              <img
                src={printer.image}
                alt={printer.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 right-3">
                <Badge
                  variant={
                    printer.status === 'online' ? 'success' :
                    printer.status === 'busy' ? 'warning' : 'danger'
                  }
                >
                  {printer.status}
                </Badge>
              </div>
            </div>
            
            <div className="p-6">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-charcoal">{printer.name}</h3>
                  <p className="text-sm text-gray-600">{printer.type}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center text-sm text-gray-600">
                    <DollarSign size={14} />
                    <span className="font-medium">{printer.price}/page</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center text-sm text-gray-600 mb-3">
                <MapPin size={16} className="mr-2" />
                <span>{printer.location}</span>
                <span className="mx-2">•</span>
                <span>{printer.distance}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-sm text-gray-600">★ {printer.rating}</span>
                </div>
                <Button
                  onClick={() => handlePrintRequest(printer)}
                  disabled={printer.status === 'offline'}
                  size="sm"
                >
                  Print Here
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Upload Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title={`Print to ${selectedPrinter?.name}`}
      >
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-component">
            <h3 className="font-medium text-gray-900 mb-2">Printer Details</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <p><strong>Location:</strong> {selectedPrinter?.location}</p>
              <p><strong>Price:</strong> ${selectedPrinter?.price}/page</p>
              <p><strong>Type:</strong> {selectedPrinter?.type}</p>
            </div>
          </div>
          
          <div className="border-2 border-dashed border-gray-300 rounded-component p-8 text-center">
            <Upload size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Document</h3>
            <p className="text-sm text-gray-600 mb-4">
              Drag and drop your files here, or click to browse
            </p>
            <input
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.txt"
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload">
              <Button as="span" variant="secondary">
                Browse Files
              </Button>
            </label>
          </div>
          
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => setIsUploadModalOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button onClick={handleUpload} className="flex-1">
              Submit Print Job
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};