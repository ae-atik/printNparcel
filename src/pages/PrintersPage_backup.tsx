import React, { useEffect, useMemo, useState } from 'react';
import { Printer as PrinterIcon, MapPin, Search, Upload } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassButton } from '../components/ui/GlassButton';
import { GlassInput } from '../components/ui/GlassInput';
import { Modal } from '../components/ui/Modal';
import { FileUpload } from '../components/ui/FileUpload';
import { listPrinters, createPrintJob } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import type { Printer as PrinterType } from '../types';
import printersData from '../data/printers.json';

export const PrintersPage: React.FC = () => {
  const { isDemo } = useAuth();
  const [printers, setPrinters] = useState<PrinterType[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'bw' | 'color' | 'both'>('all');

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedPrinter, setSelectedPrinter] = useState<PrinterType | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [colorPrint, setColorPrint] = useState(false);

  useEffect(() => {
    let canceled = false;
    async function load() {
      setIsLoading(true);
      setError(null);

      if (isDemo) {
        // Use frontend demo data
        if (!canceled) {
          setPrinters(printersData.printers as PrinterType[]);
        }
        setIsLoading(false);
        return;
      }

      try {
        const res = await listPrinters();
        if (canceled) return;
        if (res.ok && Array.isArray(res.data)) {
          setPrinters(res.data as PrinterType[]);
        } else {
          throw new Error(res.error?.message || 'Failed to load printers');
        }
      } catch (err: any) {
        if (!canceled) {
          setError(err.message || 'Failed to load printers');
        }
      } finally {
        if (!canceled) {
          setIsLoading(false);
        }
      }
    }

    load();
    return () => {
      canceled = true;
    };
  }, [isDemo]);

  const filteredPrinters = useMemo(() => {
    return printers.filter(printer => {
      const matchesSearch = printer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          printer.location.university.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          printer.location.hall.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType = filterType === 'all' || printer.type === filterType;
      
      return matchesSearch && matchesType;
    });
  }, [printers, searchQuery, filterType]);

  const handlePrintRequest = (printer: PrinterType) => {
    setSelectedPrinter(printer);
    setShowUploadModal(true);
    setUploadedFiles([]);
    setColorPrint(false);
  };

  const handleFileUpload = (files: File[]) => {
    setUploadedFiles(files);
  };

  // Submit print job to backend
  const handleSubmitPrintJob = async () => {
    if (!selectedPrinter || uploadedFiles.length === 0) {
      alert('Please select a printer and upload files.');
      return;
    }

    try {
      const orderData = {
        printerId: selectedPrinter.id,
        files: uploadedFiles.map(file => file.name), // In real app, files would be uploaded first
        colorPrint: colorPrint,
        copies: 1, // Could be made configurable
        paperSize: 'A4', // Could be made configurable
        deliveryLocation: 'Pick up at printer', // Could be made configurable
      };

      const token = localStorage.getItem("auth_token");
      const res = await createPrintJob(orderData, token || undefined);
      
      if (!res.ok) {
        alert(`Print job failed: ${res.error?.message || 'Unknown error'}`);
        return;
      }

      setShowUploadModal(false);
      setUploadedFiles([]);
      setSelectedPrinter(null);
      alert('Print job submitted successfully!');
    } catch (error) {
      alert('Print job submission failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen pt-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold gradient-text">Find a Printer</h1>

        {/* Search and Filter */}
        <GlassCard className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <GlassInput
                placeholder="Search by printer name, university, or hall..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={<Search size={18} />}
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as 'all' | 'bw' | 'color' | 'both')}
              className="px-4 py-3 bg-glass-bg backdrop-blur-glass border border-glass-border rounded-component text-theme-text focus:outline-none focus:border-campus-green"
            >
              <option value="all">All Types</option>
              <option value="color">Color</option>
              <option value="bw">Black & White</option>
              <option value="both">Both</option>
            </select>
          </div>
        </GlassCard>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-campus-green mx-auto"></div>
            <p className="mt-4 text-theme-text-secondary">Loading printers...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <GlassCard className="p-6 text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <GlassButton onClick={() => window.location.reload()}>
              Try Again
            </GlassButton>
          </GlassCard>
        )}

        {/* Printer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPrinters.map((printer) => (
            <GlassCard key={printer.id} className="p-6 hover:scale-105 transition-transform">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <PrinterIcon size={20} />
                  <div>
                    <h3 className="font-semibold text-theme-text">{printer.name}</h3>
                    <p className="text-sm text-theme-text-secondary">{printer.ownerName}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  printer.status === 'online' ? 'bg-green-500/20 text-green-400' :
                  printer.status === 'offline' ? 'bg-red-500/20 text-red-400' :
                  'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {printer.status}
                </span>
              </div>

              <div className="flex items-center space-x-2 text-sm text-theme-text-secondary mb-3">
                <MapPin size={14} />
                <span>{printer.location.university || 'University'} - {printer.location.hall || 'Hall'}</span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-sm">Type:</span>
                  <span className="text-sm font-medium">{printer.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">B&W:</span>
                  <span className="text-sm font-medium">৳{printer.pricePerPageBW}/page</span>
                </div>
                {printer.type !== 'bw' && (
                  <div className="flex justify-between">
                    <span className="text-sm">Color:</span>
                    <span className="text-sm font-medium">৳{printer.pricePerPageColor}/page</span>
                  </div>
                )}
              </div>

              <GlassButton
                onClick={() => handlePrintRequest(printer)}
                disabled={printer.status !== 'online'}
                className="w-full"
              >
                <Upload size={16} className="mr-2" />
                Print Here
              </GlassButton>
            </GlassCard>
          ))}
        </div>

        {/* Empty State */}
        {!isLoading && !error && filteredPrinters.length === 0 && (
          <GlassCard className="p-8 text-center">
            <PrinterIcon size={48} className="mx-auto mb-4 text-theme-text-secondary" />
            <h3 className="text-lg font-semibold mb-2">No printers found</h3>
            <p className="text-theme-text-secondary">
              Try adjusting your search criteria or check back later.
            </p>
          </GlassCard>
        )}
      </div>

      {/* Upload Modal */}
      <Modal
        isOpen={showUploadModal}
        onClose={() => {
          setShowUploadModal(false);
          setSelectedPrinter(null);
          setUploadedFiles([]);
        }}
        title={`Print with ${selectedPrinter?.name}`}
      >
        <div className="space-y-6">
          <div>
            <h4 className="font-medium mb-2">Printer Details</h4>
            <div className="bg-glass-bg/50 rounded-component p-4">
              <p><strong>Owner:</strong> {selectedPrinter?.ownerName}</p>
              <p><strong>Type:</strong> {selectedPrinter?.type}</p>
              <p><strong>Location:</strong> {selectedPrinter?.location.university} - {selectedPrinter?.location.hall}</p>
              <div className="mt-2">
                <p><strong>Pricing:</strong></p>
                <ul className="ml-4">
                  <li>B&W: ৳{selectedPrinter?.pricePerPageBW}/page</li>
                  {selectedPrinter?.type !== 'bw' && (
                    <li>Color: ৳{selectedPrinter?.pricePerPageColor}/page</li>
                  )}
                </ul>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">Upload Files</h4>
            <FileUpload onFilesSelected={handleFileUpload} />
            {uploadedFiles.length > 0 && (
              <div className="mt-2">
                <p className="text-sm text-theme-text-secondary">
                  {uploadedFiles.length} file(s) selected
                </p>
                <ul className="text-xs text-theme-text-muted">
                  {uploadedFiles.map((file, index) => (
                    <li key={index}>• {file.name}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {selectedPrinter?.type !== 'bw' && (
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={colorPrint}
                  onChange={(e) => setColorPrint(e.target.checked)}
                  className="rounded border-glass-border"
                />
                <span>Print in color (additional cost applies)</span>
              </label>
            </div>
          )}

          <div className="flex space-x-3">
            <GlassButton
              onClick={() => {
                setShowUploadModal(false);
                setSelectedPrinter(null);
                setUploadedFiles([]);
              }}
              variant="ghost"
              className="flex-1"
            >
              Cancel
            </GlassButton>
            <GlassButton
              onClick={handleSubmitPrintJob}
              disabled={uploadedFiles.length === 0}
              className="flex-1"
            >
              Submit Print Job
            </GlassButton>
          </div>
        </div>
      </Modal>
    </div>
  );
};