import React, { useState } from 'react';
import { Search, Filter, MapPin, DollarSign, Star, Upload, Printer } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassButton } from '../components/ui/GlassButton';
import { GlassInput } from '../components/ui/GlassInput';
import { Printer as PrinterType } from '../types';

export const PrintersPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedPrinter, setSelectedPrinter] = useState<PrinterType | null>(null);

  const printers: PrinterType[] = [
    {
      id: '1',
      name: 'QuickPrint Pro',
      ownerId: 'owner-1',
      ownerName: 'Campus Print Services',
      type: 'both',
      pricePerPageBW: 0.10,
      pricePerPageColor: 0.25,
      location: {
        university: 'Campus University',
        hall: 'Library',
        room: '2nd Floor',
      },
      specifications: {
        brand: 'HP',
        model: 'LaserJet Pro',
        paperSizes: ['A4', 'Letter', 'Legal'],
        features: ['Duplex', 'Stapling'],
      },
      status: 'online',
      isApproved: true,
      rating: 4.8,
      totalJobs: 1250,
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'Student Center Printer',
      ownerId: 'owner-2',
      ownerName: 'Print Hub LLC',
      type: 'bw',
      pricePerPageBW: 0.08,
      pricePerPageColor: 0,
      location: {
        university: 'Campus University',
        hall: 'Student Union',
        room: 'Ground Floor',
      },
      specifications: {
        brand: 'Canon',
        model: 'ImageRunner',
        paperSizes: ['A4', 'Letter'],
        features: ['Duplex'],
      },
      status: 'online',
      isApproved: true,
      rating: 4.5,
      totalJobs: 890,
      createdAt: new Date().toISOString(),
    },
    {
      id: '3',
      name: 'Engineering Lab Printer',
      ownerId: 'owner-3',
      ownerName: 'TechPrint Solutions',
      type: 'color',
      pricePerPageBW: 0.12,
      pricePerPageColor: 0.30,
      location: {
        university: 'Campus University',
        hall: 'Engineering Building',
        room: 'Room 205',
      },
      specifications: {
        brand: 'Epson',
        model: 'WorkForce Pro',
        paperSizes: ['A4', 'Letter', 'A3'],
        features: ['Color', 'High Resolution'],
      },
      status: 'busy',
      isApproved: true,
      rating: 4.9,
      totalJobs: 650,
      createdAt: new Date().toISOString(),
    },
  ];

  const filteredPrinters = printers.filter(printer => {
    const matchesSearch = printer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         printer.location.hall.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = selectedLocation === 'all' || printer.location.hall.toLowerCase().includes(selectedLocation.toLowerCase());
    const matchesType = selectedType === 'all' || printer.type === selectedType || printer.type === 'both';
    return matchesSearch && matchesLocation && matchesType;
  });

  const handlePrintRequest = (printer: PrinterType) => {
    setSelectedPrinter(printer);
    setShowUploadModal(true);
  };

  return (
    <div className="min-h-screen pt-16 px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold gradient-text mb-2">Available Printers</h1>
          <p className="text-dark-text-secondary">Find and print to printers near you</p>
        </div>

        {/* Search and Filters */}
        <GlassCard className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <GlassInput
                icon={<Search size={20} />}
                placeholder="Search printers or locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="px-4 py-3 bg-glass-bg backdrop-blur-glass border border-glass-border rounded-component text-dark-text focus:outline-none focus:border-campus-green"
            >
              <option value="all">All Locations</option>
              <option value="library">Library</option>
              <option value="student union">Student Union</option>
              <option value="engineering">Engineering</option>
              <option value="residence">Residence Halls</option>
            </select>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-3 bg-glass-bg backdrop-blur-glass border border-glass-border rounded-component text-dark-text focus:outline-none focus:border-campus-green"
            >
              <option value="all">All Types</option>
              <option value="color">Color</option>
              <option value="bw">Black & White</option>
            </select>
          </div>
        </GlassCard>

        {/* Printer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPrinters.map((printer) => (
            <GlassCard key={printer.id} hover className="p-0 overflow-hidden">
              <div className="aspect-video bg-gradient-to-br from-campus-green/20 to-info/20 relative flex items-center justify-center">
                <Printer size={48} className="text-campus-green" />
                <div className="absolute top-3 right-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    printer.status === 'online' 
                      ? 'bg-success/10 text-success' 
                      : printer.status === 'busy'
                      ? 'bg-warning/10 text-warning'
                      : 'bg-danger/10 text-danger'
                  }`}>
                    {printer.status}
                  </span>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-dark-text">{printer.name}</h3>
                    <p className="text-sm text-dark-text-secondary">{printer.specifications.brand} {printer.specifications.model}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center text-sm text-dark-text-secondary">
                      <DollarSign size={14} />
                      <span className="font-medium">{printer.pricePerPageBW}/page</span>
                    </div>
                    {printer.type === 'both' || printer.type === 'color' ? (
                      <div className="flex items-center text-sm text-dark-text-secondary">
                        <span className="text-xs">Color: ${printer.pricePerPageColor}/page</span>
                      </div>
                    ) : null}
                  </div>
                </div>
                
                <div className="flex items-center text-sm text-dark-text-secondary mb-3">
                  <MapPin size={16} className="mr-2" />
                  <span>{printer.location.hall}</span>
                  {printer.location.room && (
                    <>
                      <span className="mx-2">•</span>
                      <span>{printer.location.room}</span>
                    </>
                  )}
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center">
                      <Star size={16} className="text-yellow-400 fill-current mr-1" />
                      <span className="text-sm text-dark-text-secondary">{printer.rating}</span>
                    </div>
                    <span className="text-xs text-dark-text-muted">({printer.totalJobs} jobs)</span>
                  </div>
                  <GlassButton
                    onClick={() => handlePrintRequest(printer)}
                    disabled={printer.status === 'offline'}
                    size="sm"
                    variant="primary"
                  >
                    Print Here
                  </GlassButton>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>

        {filteredPrinters.length === 0 && (
          <GlassCard className="p-12 text-center">
            <Printer size={48} className="mx-auto text-dark-text-muted mb-4" />
            <h3 className="text-lg font-medium text-dark-text mb-2">No printers found</h3>
            <p className="text-dark-text-secondary">
              Try adjusting your search criteria or check back later for new printers.
            </p>
          </GlassCard>
        )}

        {/* Upload Modal */}
        {showUploadModal && selectedPrinter && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <GlassCard className="w-full max-w-lg">
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-4">Print to {selectedPrinter.name}</h3>
                
                <div className="p-4 bg-glass-bg rounded-component mb-6">
                  <h4 className="font-medium text-dark-text mb-2">Printer Details</h4>
                  <div className="space-y-1 text-sm text-dark-text-secondary">
                    <p><strong>Location:</strong> {selectedPrinter.location.hall} {selectedPrinter.location.room}</p>
                    <p><strong>B&W Price:</strong> ${selectedPrinter.pricePerPageBW}/page</p>
                    {selectedPrinter.pricePerPageColor > 0 && (
                      <p><strong>Color Price:</strong> ${selectedPrinter.pricePerPageColor}/page</p>
                    )}
                    <p><strong>Features:</strong> {selectedPrinter.specifications.features.join(', ')}</p>
                  </div>
                </div>
                
                <div className="border-2 border-dashed border-glass-border rounded-component p-8 text-center mb-6">
                  <Upload size={48} className="mx-auto text-dark-text-muted mb-4" />
                  <h4 className="text-lg font-medium text-dark-text mb-2">Upload Document</h4>
                  <p className="text-sm text-dark-text-secondary mb-4">
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
                    <GlassButton variant="secondary" as="span">
                      Browse Files
                    </GlassButton>
                  </label>
                </div>
                
                <div className="flex gap-3">
                  <GlassButton
                    variant="secondary"
                    onClick={() => setShowUploadModal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </GlassButton>
                  <GlassButton
                    variant="primary"
                    onClick={() => {
                      alert('Print job submitted successfully!');
                      setShowUploadModal(false);
                    }}
                    className="flex-1"
                  >
                    Submit Print Job
                  </GlassButton>
                </div>
              </div>
            </GlassCard>
          </div>
        )}
      </div>
    </div>
  );
};