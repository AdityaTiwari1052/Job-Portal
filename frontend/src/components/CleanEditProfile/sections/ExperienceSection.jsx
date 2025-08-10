import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Briefcase, Trash2 } from 'lucide-react';
import { SectionForm } from '@/components/profile/SectionForm';

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
};

const ExperienceSection = ({ experiences = [], onSave, onDelete }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExp, setEditingExp] = useState(null);

  const handleSave = (data) => {
    onSave?.({
      ...data,
      id: editingExp?.id || `exp-${Date.now()}`,
      startDate: data.startDate || new Date().toISOString().split('T')[0],
      endDate: data.current ? null : data.endDate
    });
    setIsDialogOpen(false);
    setEditingExp(null);
  };

  const handleEdit = (exp) => {
    setEditingExp(exp);
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditingExp(null);
    setIsDialogOpen(true);
  };

  return (
    <div className="w-full p-6 border-t border-gray-200">
      <div className="flex justify-between items-center mb-4 w-full">
        <h2 className="text-xl font-semibold">Experience</h2>
        <Button
          variant="ghost"
          className="text-blue-600 hover:bg-blue-50"
          onClick={handleAddNew}
        >
          <Plus className="h-4 w-4 mr-1" /> Add Experience
        </Button>
      </div>
      
      {experiences.length === 0 ? (
        <div className="w-full text-center py-8 text-gray-500">
          <Briefcase className="h-12 w-12 mx-auto text-gray-300" />
          <p className="mt-2">No experience added yet</p>
        </div>
      ) : (
        <div className="w-full space-y-6">
          {experiences.map((exp) => (
            <div key={exp.id} className="w-full group relative p-4 hover:bg-gray-50 rounded-lg transition-colors">
              <div className="flex gap-4 w-full">
                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 flex-shrink-0">
                  <Briefcase className="h-6 w-6" />
                </div>
                <div className="flex-1 w-full">
                  <h3 className="font-medium">{exp.title || "Untitled Position"}</h3>
                  <p className="text-gray-700">{exp.company} • {exp.employmentType}</p>
                  <p className="text-sm text-gray-500">
                    {formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}
                  </p>
                  {exp.location && (
                    <p className="text-sm text-gray-500">{exp.location}</p>
                  )}
                  {exp.description && (
                    <p className="mt-2 text-gray-700">{exp.description}</p>
                  )}
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(exp)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => onDelete?.(exp.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <SectionForm
        open={isDialogOpen}
        onOpenChange={(open) => {
          if (!open) setEditingExp(null);
          setIsDialogOpen(open);
        }}
        title={editingExp ? "Edit Experience" : "Add Experience"}
        initialData={editingExp || {
          title: '',
          company: '',
          employmentType: 'Full-time',
          location: '',
          startDate: new Date().toISOString().split('T')[0],
          current: false,
          description: ''
        }}
        fields={[
          {
            name: 'title',
            label: 'Title',
            placeholder: 'e.g., Software Engineer',
            required: true
          },
          {
            name: 'company',
            label: 'Company',
            placeholder: 'Company name',
            required: true
          },
          {
            name: 'employmentType',
            label: 'Employment Type',
            type: 'select',
            options: [
              'Full-time',
              'Part-time',
              'Self-employed',
              'Freelance',
              'Contract',
              'Internship',
              'Apprenticeship'
            ],
            required: true
          },
          {
            name: 'location',
            label: 'Location',
            placeholder: 'e.g., New York, NY',
            required: false
          },
          {
            name: 'startDate',
            label: 'Start Date',
            type: 'date',
            required: true
          },
          {
            name: 'current',
            label: 'I currently work here',
            type: 'checkbox',
            checkboxLabel: 'I currently work here'
          },
          {
            name: 'endDate',
            label: 'End Date',
            type: 'date',
            required: (data) => !data.current,
            hidden: (data) => data.current
          },
          {
            name: 'description',
            label: 'Description',
            type: 'textarea',
            placeholder: 'Describe your role and achievements...',
            required: false
          }
        ]}
        onSubmit={handleSave}
      />
    </div>
  );
};

export default ExperienceSection;
