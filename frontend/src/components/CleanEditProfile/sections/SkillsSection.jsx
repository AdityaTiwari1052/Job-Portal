import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, Star } from 'lucide-react';
import { SectionForm } from '@/components/profile/SectionForm';

const SkillsSection = ({ skills = [], onSave, onDelete }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);

  const handleSave = (data) => {
    onSave?.({
      ...data,
      id: editingSkill?.id || `skill-${Date.now()}`,
      proficiency: parseInt(data.proficiency, 10) || 1
    });
    setIsDialogOpen(false);
    setEditingSkill(null);
  };

  const handleEdit = (skill) => {
    setEditingSkill(skill);
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditingSkill(null);
    setIsDialogOpen(true);
  };

  const renderProficiency = (level) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${i <= level ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="w-full p-6 border-t border-gray-200">
      <div className="flex justify-between items-center mb-4 w-full">
        <h2 className="text-xl font-semibold">Skills</h2>
        <Button
          variant="ghost"
          className="text-blue-600 hover:bg-blue-50"
          onClick={handleAddNew}
        >
          <Plus className="h-4 w-4 mr-1" /> Add Skill
        </Button>
      </div>
      
      {skills.length === 0 ? (
        <div className="w-full text-center py-8 text-gray-500">
          <div className="h-12 w-12 mx-auto mb-2 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
            <Star className="h-6 w-6" />
          </div>
          <p className="mt-2">No skills added yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {skills.map((skill) => (
            <div 
              key={skill.id} 
              className="group relative p-4 border rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{skill.name}</h3>
                  {skill.proficiency && (
                    <div className="mt-1">
                      {renderProficiency(skill.proficiency)}
                      <span className="text-xs text-gray-500 ml-2">
                        {['Beginner', 'Intermediate', 'Advanced', 'Expert', 'Master'][skill.proficiency - 1] || 'Beginner'}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => handleEdit(skill)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => onDelete?.(skill.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              {skill.description && (
                <p className="mt-2 text-sm text-gray-600">{skill.description}</p>
              )}
            </div>
          ))}
        </div>
      )}

      <SectionForm
        open={isDialogOpen}
        onOpenChange={(open) => {
          if (!open) setEditingSkill(null);
          setIsDialogOpen(open);
        }}
        title={editingSkill ? "Edit Skill" : "Add Skill"}
        initialData={editingSkill || {
          name: '',
          proficiency: 3,
          description: ''
        }}
        fields={[
          {
            name: 'name',
            label: 'Skill Name',
            placeholder: 'e.g., JavaScript, Python, Project Management',
            required: true
          },
          {
            name: 'proficiency',
            label: 'Proficiency Level',
            type: 'select',
            options: [
              { value: 1, label: 'Beginner' },
              { value: 2, label: 'Intermediate' },
              { value: 3, label: 'Advanced' },
              { value: 4, label: 'Expert' },
              { value: 5, label: 'Master' }
            ],
            required: true
          },
          {
            name: 'description',
            label: 'Description (Optional)',
            type: 'textarea',
            placeholder: 'Brief description of your experience with this skill...',
            required: false
          }
        ]}
        onSubmit={handleSave}
      />
    </div>
  );
};

export default SkillsSection;
