import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, Award, ExternalLink } from 'lucide-react';
import { SectionForm } from '@/components/profile/SectionForm';

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
};

const CertificationsSection = ({ certifications = [], onSave, onDelete }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCert, setEditingCert] = useState(null);

  const handleSave = (data) => {
    onSave?.({
      ...data,
      id: editingCert?.id || `cert-${Date.now()}`,
      issueDate: data.issueDate || new Date().toISOString().split('T')[0],
      expirationDate: data.doesNotExpire ? null : data.expirationDate
    });
    setIsDialogOpen(false);
    setEditingCert(null);
  };

  const handleEdit = (cert) => {
    setEditingCert(cert);
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditingCert(null);
    setIsDialogOpen(true);
  };

  return (
    <div className="w-full p-6 border-t border-gray-200">
      <div className="flex justify-between items-center mb-4 w-full">
        <h2 className="text-xl font-semibold">Certifications</h2>
        <Button
          variant="ghost"
          className="text-blue-600 hover:bg-blue-50"
          onClick={handleAddNew}
        >
          <Plus className="h-4 w-4 mr-1" /> Add Certification
        </Button>
      </div>
      
      {certifications.length === 0 ? (
        <div className="w-full text-center py-8 text-gray-500">
          <div className="h-12 w-12 mx-auto mb-2 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
            <Award className="h-6 w-6" />
          </div>
          <p className="mt-2">No certifications added yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {certifications.map((cert) => (
            <div 
              key={cert.id} 
              className="group relative p-4 border rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-medium">{cert.name}</h3>
                  <p className="text-gray-700">{cert.issuingOrganization}</p>
                  <div className="mt-1 text-sm text-gray-500">
                    <span>Issued {formatDate(cert.issueDate)}</span>
                    {cert.expirationDate && (
                      <span> • Expires {formatDate(cert.expirationDate)}</span>
                    )}
                    {!cert.expirationDate && cert.issueDate && (
                      <span> • No Expiration</span>
                    )}
                  </div>
                  {cert.credentialId && (
                    <p className="text-sm text-gray-600 mt-1">
                      Credential ID: {cert.credentialId}
                    </p>
                  )}
                  {cert.credentialUrl && (
                    <a 
                      href={cert.credentialUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-blue-600 hover:underline text-sm mt-1"
                    >
                      View Credential <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  )}
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => handleEdit(cert)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => onDelete?.(cert.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              {cert.description && (
                <p className="mt-2 text-sm text-gray-600">{cert.description}</p>
              )}
            </div>
          ))}
        </div>
      )}

      <SectionForm
        open={isDialogOpen}
        onOpenChange={(open) => {
          if (!open) setEditingCert(null);
          setIsDialogOpen(open);
        }}
        title={editingCert ? "Edit Certification" : "Add Certification"}
        initialData={editingCert || {
          name: '',
          issuingOrganization: '',
          issueDate: new Date().toISOString().split('T')[0],
          doesNotExpire: false,
          expirationDate: '',
          credentialId: '',
          credentialUrl: '',
          description: ''
        }}
        fields={[
          {
            name: 'name',
            label: 'Certification Name',
            placeholder: 'e.g., AWS Certified Solutions Architect',
            required: true
          },
          {
            name: 'issuingOrganization',
            label: 'Issuing Organization',
            placeholder: 'e.g., Amazon Web Services',
            required: true
          },
          {
            name: 'issueDate',
            label: 'Issue Date',
            type: 'date',
            required: true
          },
          {
            name: 'doesNotExpire',
            label: 'This certification does not expire',
            type: 'checkbox',
            checkboxLabel: 'This certification does not expire'
          },
          {
            name: 'expirationDate',
            label: 'Expiration Date',
            type: 'date',
            required: (data) => !data.doesNotExpire,
            hidden: (data) => data.doesNotExpire
          },
          {
            name: 'credentialId',
            label: 'Credential ID (Optional)',
            placeholder: 'e.g., ABC123456',
            required: false
          },
          {
            name: 'credentialUrl',
            label: 'Credential URL (Optional)',
            placeholder: 'https://example.com/verify/abc123',
            type: 'url',
            required: false
          },
          {
            name: 'description',
            label: 'Description (Optional)',
            type: 'textarea',
            placeholder: 'Brief description of what this certification represents...',
            required: false
          }
        ]}
        onSubmit={handleSave}
      />
    </div>
  );
};

export default CertificationsSection;
