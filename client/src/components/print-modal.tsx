import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FileText, Download, Printer, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import type { Lead } from "@shared/schema";
// Using the same logo as dashboard header
const dashboardLogo = "https://raw.githubusercontent.com/iftikhar1986/image/eef9d1dbfef3ace5092c3dd259b075b66311ac39/logo.png";

interface PrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead | null;
}

export function PrintModal({ isOpen, onClose, lead }: PrintModalProps) {
  if (!lead) return null;

  const handlePrint = () => {
    const printContent = document.getElementById('print-content');
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Lead Report - ${lead.fullName}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            @page { 
              margin: 20mm; 
              size: A4; 
            }
            body { 
              font-family: 'Arial', 'Helvetica', sans-serif; 
              line-height: 1.4; 
              color: #2c3e50; 
              background: white;
              font-size: 12px;
              max-width: 100%;
              margin: 0;
            }
            .container {
              max-width: 100%;
              height: 100vh;
              display: flex;
              flex-direction: column;
            }
            .header { 
              display: flex; 
              align-items: center; 
              justify-content: space-between; 
              margin-bottom: 20px; 
              padding-bottom: 15px; 
              border-bottom: 3px solid #34495e;
              background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
              padding: 20px;
              border-radius: 8px;
            }
            .logo { height: 60px; width: auto; }
            .company-info { text-align: right; }
            .company-info h1 { 
              font-size: 22px; 
              font-weight: bold; 
              margin-bottom: 3px; 
              color: #2c3e50;
            }
            .company-info p { 
              color: #7f8c8d; 
              font-size: 11px; 
              margin: 2px 0;
            }
            .report-title { 
              text-align: center; 
              margin: 15px 0; 
              font-size: 18px; 
              font-weight: bold; 
              color: #2c3e50;
              background: #34495e;
              color: white;
              padding: 10px;
              border-radius: 6px;
              letter-spacing: 1px;
            }
            .lead-info { 
              background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%); 
              padding: 20px; 
              border-radius: 8px; 
              border: 2px solid #e9ecef;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
              flex-grow: 1;
            }
            .info-sections {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 25px;
              margin-bottom: 15px;
            }
            .info-section {
              background: white;
              padding: 15px;
              border-radius: 6px;
              border-left: 4px solid #3498db;
              box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            .section-header {
              font-size: 14px;
              font-weight: bold;
              color: #2c3e50;
              margin-bottom: 12px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              border-bottom: 1px solid #ecf0f1;
              padding-bottom: 5px;
            }
            .info-item { 
              margin-bottom: 8px; 
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .info-label { 
              font-weight: 600; 
              color: #7f8c8d; 
              font-size: 11px;
              text-transform: uppercase;
              letter-spacing: 0.3px;
              min-width: 100px;
            }
            .info-value { 
              font-size: 12px; 
              color: #2c3e50; 
              font-weight: 500;
              text-align: right;
              flex: 1;
            }
            .status-badge { 
              display: inline-block; 
              padding: 4px 8px; 
              border-radius: 12px; 
              font-size: 10px; 
              font-weight: bold; 
              text-transform: uppercase; 
              letter-spacing: 0.3px;
              border: 1px solid;
            }
            .status-new { 
              background: #e3f2fd; 
              color: #1565c0; 
              border-color: #1565c0;
            }
            .status-contacted { 
              background: #fff8e1; 
              color: #ef6c00; 
              border-color: #ef6c00;
            }
            .status-converted { 
              background: #e8f5e8; 
              color: #2e7d32; 
              border-color: #2e7d32;
            }
            .status-declined { 
              background: #ffebee; 
              color: #c62828; 
              border-color: #c62828;
            }
            .requirements-section {
              grid-column: 1 / -1;
              background: white;
              padding: 15px;
              border-radius: 6px;
              border-left: 4px solid #e74c3c;
              box-shadow: 0 1px 3px rgba(0,0,0,0.1);
              margin-top: 10px;
            }
            .requirements-content {
              background: #fafafa;
              padding: 10px;
              border-radius: 4px;
              font-style: italic;
              color: #5d6d7e;
              border: 1px dashed #bdc3c7;
            }
            .footer { 
              margin-top: 15px; 
              padding-top: 10px; 
              border-top: 2px solid #ecf0f1; 
              text-align: center; 
              color: #95a5a6; 
              font-size: 10px;
              background: #f8f9fa;
              padding: 15px;
              border-radius: 6px;
            }
            .footer-row {
              margin: 3px 0;
            }
            .report-id {
              font-weight: bold;
              color: #7f8c8d;
            }
            @media print {
              body { 
                padding: 0; 
                margin: 0;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              .container {
                height: auto;
                page-break-inside: avoid;
              }
              .no-print { display: none !important; }
              .header { margin-bottom: 15px; }
              .report-title { margin: 10px 0; }
              .info-sections { gap: 20px; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            ${printContent.innerHTML}
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  const handleDownloadPDF = () => {
    // For now, we'll use the browser's print to PDF functionality
    handlePrint();
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'new': return 'status-new';
      case 'contacted': return 'status-contacted';
      case 'converted': return 'status-converted';
      case 'declined': return 'status-declined';
      default: return 'status-new';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'new': return 'New Lead';
      case 'contacted': return 'Contacted';
      case 'converted': return 'Converted';
      case 'declined': return 'Declined';
      default: return 'New Lead';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Print Lead Report - {lead.fullName}
          </DialogTitle>
        </DialogHeader>

        {/* Print Preview */}
        <div className="space-y-6">
          <div className="bg-white border-2 border-gray-300 rounded-lg shadow-xl overflow-hidden" style={{
            fontFamily: 'Arial, Helvetica, sans-serif',
            fontSize: '12px',
            lineHeight: '1.4',
            color: '#2c3e50'
          }} id="print-content">
            {/* Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px',
              paddingBottom: '15px',
              borderBottom: '3px solid #34495e',
              background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
              padding: '20px',
              borderRadius: '8px'
            }}>
              <img src={dashboardLogo} alt="Q-Mobility Logo" style={{ height: '60px', width: 'auto' }} />
              <div style={{ textAlign: 'right' }}>
                <h1 style={{
                  fontSize: '22px',
                  fontWeight: 'bold',
                  marginBottom: '3px',
                  color: '#2c3e50'
                }}>Lead Management System</h1>
                <p style={{ color: '#7f8c8d', fontSize: '11px', margin: '2px 0' }}>Internal Report Document</p>
                <p style={{ color: '#7f8c8d', fontSize: '11px', margin: '2px 0' }}>Generated: {format(new Date(), "MMM dd, yyyy 'at' h:mm a")}</p>
                <p style={{ color: '#7f8c8d', fontSize: '11px', margin: '2px 0' }}>Document Type: Lead Information Report</p>
              </div>
            </div>

            {/* Report Title */}
            <div style={{
              textAlign: 'center',
              margin: '15px 0',
              fontSize: '18px',
              fontWeight: 'bold',
              color: 'white',
              background: '#34495e',
              padding: '10px',
              borderRadius: '6px',
              letterSpacing: '1px'
            }}>
              LEAD INFORMATION REPORT
            </div>

            {/* Lead Information */}
            <div style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
              padding: '20px',
              borderRadius: '8px',
              border: '2px solid #e9ecef',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              flexGrow: 1
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '25px',
                marginBottom: '15px'
              }}>
                {/* Contact Information Section */}
                <div style={{
                  background: 'white',
                  padding: '15px',
                  borderRadius: '6px',
                  borderLeft: '4px solid #3498db',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: 'bold',
                    color: '#2c3e50',
                    marginBottom: '12px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    borderBottom: '1px solid #ecf0f1',
                    paddingBottom: '5px'
                  }}>Contact Information</div>
                  <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: '600', color: '#7f8c8d', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.3px', minWidth: '100px' }}>Full Name</span>
                    <span style={{ fontSize: '12px', color: '#2c3e50', fontWeight: '500', textAlign: 'right', flex: 1 }}>{lead.fullName}</span>
                  </div>
                  <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: '600', color: '#7f8c8d', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.3px', minWidth: '100px' }}>Email</span>
                    <span style={{ fontSize: '12px', color: '#2c3e50', fontWeight: '500', textAlign: 'right', flex: 1 }}>{lead.email}</span>
                  </div>
                  <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: '600', color: '#7f8c8d', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.3px', minWidth: '100px' }}>Phone</span>
                    <span style={{ fontSize: '12px', color: '#2c3e50', fontWeight: '500', textAlign: 'right', flex: 1 }}>{lead.phone}</span>
                  </div>
                  <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: '600', color: '#7f8c8d', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.3px', minWidth: '100px' }}>Location</span>
                    <span style={{ fontSize: '12px', color: '#2c3e50', fontWeight: '500', textAlign: 'right', flex: 1 }}>{lead.location}</span>
                  </div>
                </div>

                {/* Vehicle Information Section */}
                <div style={{
                  background: 'white',
                  padding: '15px',
                  borderRadius: '6px',
                  borderLeft: '4px solid #3498db',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: 'bold',
                    color: '#2c3e50',
                    marginBottom: '12px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    borderBottom: '1px solid #ecf0f1',
                    paddingBottom: '5px'
                  }}>Vehicle Information</div>
                  <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: '600', color: '#7f8c8d', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.3px', minWidth: '100px' }}>Vehicle Type</span>
                    <span style={{ fontSize: '12px', color: '#2c3e50', fontWeight: '500', textAlign: 'right', flex: 1 }}>{lead.vehicleType}</span>
                  </div>
                  <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: '600', color: '#7f8c8d', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.3px', minWidth: '100px' }}>Vehicle Model</span>
                    <span style={{ fontSize: '12px', color: '#2c3e50', fontWeight: '500', textAlign: 'right', flex: 1 }}>{lead.vehicleModel || 'Not specified'}</span>
                  </div>
                  <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: '600', color: '#7f8c8d', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.3px', minWidth: '100px' }}>Source</span>
                    <span style={{ fontSize: '12px', color: '#2c3e50', fontWeight: '500', textAlign: 'right', flex: 1 }}>{lead.sourceType || 'Website'}</span>
                  </div>
                  <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: '600', color: '#7f8c8d', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.3px', minWidth: '100px' }}>Lead Status</span>
                    <span style={{ fontSize: '12px', color: '#2c3e50', fontWeight: '500', textAlign: 'right', flex: 1 }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '10px',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        letterSpacing: '0.3px',
                        border: '1px solid',
                        background: lead.status === 'new' ? '#e3f2fd' : lead.status === 'contacted' ? '#fff8e1' : lead.status === 'converted' ? '#e8f5e8' : '#ffebee',
                        color: lead.status === 'new' ? '#1565c0' : lead.status === 'contacted' ? '#ef6c00' : lead.status === 'converted' ? '#2e7d32' : '#c62828',
                        borderColor: lead.status === 'new' ? '#1565c0' : lead.status === 'contacted' ? '#ef6c00' : lead.status === 'converted' ? '#2e7d32' : '#c62828'
                      }}>
                        {getStatusText(lead.status)}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Rental Information Section */}
                <div style={{
                  background: 'white',
                  padding: '15px',
                  borderRadius: '6px',
                  borderLeft: '4px solid #3498db',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: 'bold',
                    color: '#2c3e50',
                    marginBottom: '12px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    borderBottom: '1px solid #ecf0f1',
                    paddingBottom: '5px'
                  }}>Rental Information</div>
                  <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: '600', color: '#7f8c8d', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.3px', minWidth: '100px' }}>Start Date</span>
                    <span style={{ fontSize: '12px', color: '#2c3e50', fontWeight: '500', textAlign: 'right', flex: 1 }}>{format(new Date(lead.rentalStartDate), "MMM dd, yyyy")}</span>
                  </div>
                  <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: '600', color: '#7f8c8d', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.3px', minWidth: '100px' }}>End Date</span>
                    <span style={{ fontSize: '12px', color: '#2c3e50', fontWeight: '500', textAlign: 'right', flex: 1 }}>{format(new Date(lead.rentalEndDate), "MMM dd, yyyy")}</span>
                  </div>
                  <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: '600', color: '#7f8c8d', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.3px', minWidth: '100px' }}>Duration</span>
                    <span style={{ fontSize: '12px', color: '#2c3e50', fontWeight: '500', textAlign: 'right', flex: 1 }}>{lead.rentalPeriodDays} days</span>
                  </div>
                  <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: '600', color: '#7f8c8d', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.3px', minWidth: '100px' }}>Created</span>
                    <span style={{ fontSize: '12px', color: '#2c3e50', fontWeight: '500', textAlign: 'right', flex: 1 }}>{format(new Date(lead.createdAt || new Date()), "MMM dd, yyyy")}</span>
                  </div>
                </div>

                {/* System Information Section */}
                <div style={{
                  background: 'white',
                  padding: '15px',
                  borderRadius: '6px',
                  borderLeft: '4px solid #3498db',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: 'bold',
                    color: '#2c3e50',
                    marginBottom: '12px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    borderBottom: '1px solid #ecf0f1',
                    paddingBottom: '5px'
                  }}>System Information</div>
                  <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: '600', color: '#7f8c8d', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.3px', minWidth: '100px' }}>Lead ID</span>
                    <span style={{ fontSize: '12px', color: '#2c3e50', fontWeight: '500', textAlign: 'right', flex: 1 }}>#{lead.id.slice(0, 8).toUpperCase()}</span>
                  </div>
                  <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: '600', color: '#7f8c8d', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.3px', minWidth: '100px' }}>Report Date</span>
                    <span style={{ fontSize: '12px', color: '#2c3e50', fontWeight: '500', textAlign: 'right', flex: 1 }}>{format(new Date(), "MMM dd, yyyy")}</span>
                  </div>
                  <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: '600', color: '#7f8c8d', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.3px', minWidth: '100px' }}>Report Time</span>
                    <span style={{ fontSize: '12px', color: '#2c3e50', fontWeight: '500', textAlign: 'right', flex: 1 }}>{format(new Date(), "h:mm a")}</span>
                  </div>
                  <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: '600', color: '#7f8c8d', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.3px', minWidth: '100px' }}>Document</span>
                    <span style={{ fontSize: '12px', color: '#2c3e50', fontWeight: '500', textAlign: 'right', flex: 1 }}>Official Report</span>
                  </div>
                </div>
                
                {/* Special Requirements Section */}
                {lead.specialRequirements && (
                  <div style={{
                    gridColumn: '1 / -1',
                    background: 'white',
                    padding: '15px',
                    borderRadius: '6px',
                    borderLeft: '4px solid #e74c3c',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    marginTop: '10px'
                  }}>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: 'bold',
                      color: '#2c3e50',
                      marginBottom: '12px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      borderBottom: '1px solid #ecf0f1',
                      paddingBottom: '5px'
                    }}>Special Requirements</div>
                    <div style={{
                      background: '#fafafa',
                      padding: '10px',
                      borderRadius: '4px',
                      fontStyle: 'italic',
                      color: '#5d6d7e',
                      border: '1px dashed #bdc3c7'
                    }}>
                      {lead.specialRequirements}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div style={{
              marginTop: '15px',
              paddingTop: '10px',
              borderTop: '2px solid #ecf0f1',
              textAlign: 'center',
              color: '#95a5a6',
              fontSize: '10px',
              background: '#f8f9fa',
              padding: '15px',
              borderRadius: '6px'
            }}>
              <div style={{ margin: '3px 0' }}>
                <strong>CONFIDENTIAL DOCUMENT</strong> - Lead Management System
              </div>
              <div style={{ margin: '3px 0' }}>
                <span style={{ fontWeight: 'bold', color: '#7f8c8d' }}>Report ID: LEAD-{lead.id.slice(0, 8).toUpperCase()}</span> | Generated by: Internal System
              </div>
              <div style={{ margin: '3px 0' }}>
                This document contains sensitive customer information and should be handled according to company privacy policies.
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-4 border-t no-print">
            <Button variant="outline" onClick={onClose}>
              <X className="mr-2 h-4 w-4" />
              Close
            </Button>
            <Button variant="outline" onClick={handleDownloadPDF}>
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
            <Button onClick={handlePrint} className="bg-black hover:bg-gray-800">
              <Printer className="mr-2 h-4 w-4" />
              Print Report
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}