import React, { useState } from 'react';
import { Search, Filter, MapPin, DollarSign, Star, Upload, Printer } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassButton } from '../components/ui/GlassButton';
import { GlassInput } from '../components/ui/GlassInput';
import { FileUpload } from '../components/ui/FileUpload';
import { Modal } from '../components/ui/Modal';
import { Printer as PrinterType } from '../types';
import printersData from '../data/printers.json';

export const PrintersPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedPrinter, setSelectedPrinter] = useState<PrinterType | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [colorPrint, setColorPrint] = useState(false);

  const printers: PrinterType[] = printersData.printers.filter(printer => printer.isApproved);

  const filteredPrinters = printers.filter(printer => {
    const matchesSearch = printer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         printer.location.hall.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = selectedLocation === 'all' || printer.location.hall.toLowerCase().includes(selectedLocation.toLowerCase());
    const matchesType = selectedType === 'all' || printer.type === selectedType || printer.type === 'both';
    return matchesSearch && matchesLocation && matchesType;
  });

  const handlePrintRequest = (printer: PrinterType) => {
    setSelectedPrinter(printer);
    setUploadedFiles([]);
    setColorPrint(false);
    setShowUploadModal(true);
  };

  const handleSubmitPrintJob = () => {
    if (uploadedFiles.length === 0) {
      alert('Please upload at least one file');
      return;
    }
    
    const totalCost = uploadedFiles.length * (colorPrint ? selectedPrinter?.pricePerPageColor || 0 : selectedPrinter?.pricePerPageBW || 0);
    alert(`Print job submitted! Total cost: $${totalCost.toFixed(2)}`);
    setShowUploadModal(false);
    setSelectedPrinter(null);
    setUploadedFiles([]);
    setColorPrint(false);
  };

  return (
    <div className="min-h-screen pt-16 px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold gradient-text mb-2">Available Printers</h1>
          <p className="text-theme-text-secondary">Find and print to printers near you</p>
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
              className="px-4 py-3 bg-glass-bg backdrop-blur-glass border border-glass-border rounded-component text-theme-text focus:outline-none focus:border-campus-green"
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
              className="px-4 py-3 bg-glass-bg backdrop-blur-glass border border-glass-border rounded-component text-theme-text focus:outline-none focus:border-campus-green"
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
                    <h3 className="font-semibold text-theme-text">{printer.name}</h3>
                    <p className="text-sm text-theme-text-secondary">{printer.specifications.brand} {printer.specifications.model}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center text-sm text-theme-text-secondary">
                      <DollarSign size={14} />
                      <span className="font-medium">{printer.pricePerPageBW}/page</span>
                    </div>
                    {printer.type === 'both' || printer.type === 'color' ? (
                      <div className="flex items-center text-sm text-theme-text-secondary">
                        <span className="text-xs">Color: ${printer.pricePerPageColor}/page</span>
                      </div>
                    ) : null}
                  </div>
                </div>
                
                <div className="flex items-center text-sm text-theme-text-secondary mb-3">
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
                      <span className="text-sm text-theme-text-secondary">{printer.rating}</span>
                    </div>
                    <span className="text-xs text-theme-text-muted">({printer.totalJobs} jobs)</span>
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
            <Printer size={48} className="mx-auto text-theme-text-muted mb-4" />
            <h3 className="text-lg font-medium text-theme-text mb-2">No printers found</h3>
            <p className="text-theme-text-secondary">
              Try adjusting your search criteria or check back later for new printers.
            </p>
          </GlassCard>
        )}

        {/* Upload Modal */}
        <Modal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          title={`Print to ${selectedPrinter?.name}`}
          size="lg"
        >
          <div className="space-y-6">
            <div className="p-4 bg-glass-bg rounded-component">
              <h4 className="font-medium text-theme-text mb-2">Printer Details</h4>
              <div className="space-y-1 text-sm text-theme-text-secondary">
                <p><strong>Location:</strong> {selectedPrinter?.location.hall} {selectedPrinter?.location.room}</p>
                <p><strong>B&W Price:</strong> ${selectedPrinter?.pricePerPageBW}/page</p>
                {selectedPrinter?.pricePerPageColor && selectedPrinter.pricePerPageColor > 0 && (
                  <p><strong>Color Price:</strong> ${selectedPrinter.pricePerPageColor}/page</p>
                )}
                <p><strong>Features:</strong> {selectedPrinter?.specifications.features.join(', ')}</p>
              </div>
            </div>
            
            <FileUpload
              onFilesChange={setUploadedFiles}
              acceptedTypes=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              multiple={true}
            />
            
            {selectedPrinter?.type !== 'bw' && selectedPrinter?.pricePerPageColor && selectedPrinter.pricePerPageColor > 0 && (
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="color-print"
                  checked={colorPrint}
                  onChange={(e) => setColorPrint(e.target.checked)}
                  className="w-4 h-4 text-campus-green bg-glass-bg border-glass-border rounded focus:ring-campus-green"
                />
                <label htmlFor="color-print" className="text-sm font-medium text-theme-text">
                  Color Print (+${((selectedPrinter?.pricePerPageColor || 0) - (selectedPrinter?.pricePerPageBW || 0)).toFixed(2)}/page)
                </label>
              </div>
            )}
            
            {uploadedFiles.length > 0 && (
              <div className="p-4 bg-glass-bg rounded-component">
                <h4 className="font-medium text-theme-text mb-2">Print Summary</h4>
                <div className="space-y-1 text-sm text-theme-text-secondary">
                  <p><strong>Files:</strong> {uploadedFiles.length}</p>
                  <p><strong>Print Type:</strong> {colorPrint ? 'Color' : 'Black & White'}</p>
                  <p><strong>Estimated Cost:</strong> ${(uploadedFiles.length * (colorPrint ? selectedPrinter?.pricePerPageColor || 0 : selectedPrinter?.pricePerPageBW || 0)).toFixed(2)}</p>
                </div>
              </div>
            )}
            
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
                onClick={handleSubmitPrintJob}
                className="flex-1"
                disabled={uploadedFiles.length === 0}
              >
                Submit Print Job
              </GlassButton>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};