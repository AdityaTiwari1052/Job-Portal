import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const SectionForm = ({
  open,
  onOpenChange,
  title,
  initialData = {},
  fields = [],
  onSubmit,
  isSubmitting = false,
  children,
}) => {
  const [formData, setFormData] = React.useState(initialData);

  React.useEffect(() => {
    setFormData(initialData);
  }, [initialData, open]); // Reset form when initialData or open state changes

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted with data:', formData); // Debug log
    if (onSubmit) {
      Promise.resolve(onSubmit(formData))
        .then(() => {
          onOpenChange?.(false); // Close the dialog on successful submission
        })
        .catch(error => {
          console.error('Error submitting form:', error);
        });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="overflow-y-auto flex-1 -mx-6 px-6 py-4">
            {fields.filter(field => !field.hidden || !field.hidden(formData)).map((field) => (
              <div key={field.name} className="space-y-2 mb-4">
                <Label htmlFor={field.name}>
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </Label>
                {field.type === 'textarea' ? (
                  <Textarea
                    id={field.name}
                    name={field.name}
                    value={formData[field.name] || ''}
                    onChange={handleChange}
                    required={field.required}
                    placeholder={field.placeholder}
                    className="min-h-[100px]"
                  />
                ) : field.type === 'checkbox' ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={field.name}
                      name={field.name}
                      checked={!!formData[field.name]}
                      onChange={handleChange}
                      className="h-4 w-4"
                    />
                    <label htmlFor={field.name} className="text-sm">
                      {field.checkboxLabel}
                    </label>
                  </div>
                ) : field.type === 'select' ? (
                  <select
                    id={field.name}
                    name={field.name}
                    value={formData[field.name] || ''}
                    onChange={handleChange}
                    required={field.required}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {field.options?.map((option) => {
                      const optionValue = typeof option === 'object' ? option.value : option;
                      const optionLabel = typeof option === 'object' ? option.label : option;
                      return (
                        <option key={optionValue} value={optionValue}>
                          {optionLabel}
                        </option>
                      );
                    })}
                  </select>
                ) : field.type === 'date' ? (
                  <Input
                    id={field.name}
                    name={field.name}
                    type="date"
                    value={formData[field.name] || ''}
                    onChange={handleChange}
                    required={field.required}
                  />
                ) : field.type === 'url' ? (
                  <Input
                    id={field.name}
                    name={field.name}
                    type="url"
                    value={formData[field.name] || ''}
                    onChange={handleChange}
                    placeholder={field.placeholder}
                    required={field.required}
                  />
                ) : (
                  <Input
                    id={field.name}
                    name={field.name}
                    type={field.type || 'text'}
                    value={formData[field.name] || ''}
                    onChange={handleChange}
                    required={field.required}
                    placeholder={field.placeholder}
                  />
                )}
              </div>
            ))}
            {children}
          </div>
          
          <div className="flex justify-end space-x-2 pt-4 border-t mt-4 flex-shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange?.(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
