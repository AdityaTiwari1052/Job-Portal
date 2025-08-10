import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { format } from 'date-fns';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, ChevronDown } from 'lucide-react';
import { cn } from "@/lib/utils";

const EducationForm = ({
  initialData = {},
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  // Common degree types
  const degreeTypes = [
    'High School',
    'Associate',
    'Bachelor\'s',
    'Master\'s',
    'MBA',
    'JD',
    'MD',
    'PhD',
    'Other'
  ];

  // Common fields of study
  const commonFields = [
    'Computer Science',
    'Business Administration',
    'Engineering',
    'Mathematics',
    'Physics',
    'Chemistry',
    'Biology',
    'Psychology',
    'Economics',
    'English',
    'History',
    'Political Science',
    'Other'
  ];

  // Initialize form with react-hook-form
  const { 
    register, 
    handleSubmit, 
    setValue, 
    watch, 
    formState: { errors } 
  } = useForm({
    defaultValues: {
      school: initialData?.school || '',
      degree: initialData?.degree || 'Bachelor\'s',
      field: initialData?.field || '',
      startDate: initialData?.startDate || null,
      endDate: initialData?.current ? null : (initialData?.endDate || null),
      current: initialData?.current || false,
      grade: initialData?.grade || '',
      activities: initialData?.activities || '',
      description: initialData?.description || ''
    }
  });

  // Watch form values
  const formValues = watch();
  
  // Local state for UI
  const [isCurrent, setIsCurrent] = useState(initialData?.current || false);
  const [startDate, setStartDate] = useState(initialData?.startDate ? new Date(initialData.startDate) : null);
  const [endDate, setEndDate] = useState(initialData?.endDate ? new Date(initialData.endDate) : null);

  // Handle date selection
  const handleDateSelect = (date, field) => {
    if (!date) return;
    
    if (field === 'start') {
      setStartDate(date);
      setValue('startDate', date.toISOString().split('T')[0], { shouldValidate: true });
      
      // If new start date is after end date, update end date
      if (endDate && date > endDate) {
        setEndDate(date);
        setValue('endDate', date.toISOString().split('T')[0], { shouldValidate: true });
      }
    } else {
      setEndDate(date);
      setValue('endDate', date.toISOString().split('T')[0], { shouldValidate: true });
    }
  };

  // Handle current study checkbox
  const handleCurrentChange = (e) => {
    const checked = e.target.checked;
    setIsCurrent(checked);
    setValue('current', checked, { shouldValidate: true });
    
    if (checked) {
      // If marking as current, clear the end date
      setEndDate(null);
      setValue('endDate', '', { shouldValidate: true });
    } else if (startDate) {
      // If unchecking and we have a start date, set end date to today
      const today = new Date();
      setEndDate(today);
      setValue('endDate', today.toISOString().split('T')[0], { shouldValidate: true });
    }
  };

  // Handle form submission
  const handleFormSubmit = (data) => {
    const formattedData = {
      ...data,
      startDate: startDate ? startDate.toISOString() : '',
      endDate: isCurrent ? '' : (endDate ? endDate.toISOString() : ''),
      current: isCurrent
    };
    onSubmit(formattedData);
  };

  // Format date for display
  const formatDate = (date) => {
    return date ? format(new Date(date), 'MMMM d, yyyy') : '';
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="space-y-4 max-h-[calc(80vh-200px)] overflow-y-auto pr-2 -mr-4 py-2">
        {/* School Name */}
        <div className="space-y-2">
          <Label htmlFor="school">School <span className="text-destructive">*</span></Label>
          <Input
            id="school"
            placeholder="School/University"
            {...register('school', { required: 'School name is required' })}
            error={errors.school?.message}
          />
        </div>

        {/* Degree and Field of Study */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="degree">Degree <span className="text-destructive">*</span></Label>
            <select
              id="degree"
              className={cn(
                "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
                "file:border-0 file:bg-transparent file:text-sm file:font-medium",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                "disabled:cursor-not-allowed disabled:opacity-50"
              )}
              {...register('degree', { required: 'Degree is required' })}
            >
              {degreeTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            {errors.degree && (
              <p className="text-sm font-medium text-destructive">
                {errors.degree.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="field">Field of Study <span className="text-destructive">*</span></Label>
            <div className="relative">
              <Input
                id="field"
                list="fields"
                placeholder="e.g., Computer Science"
                {...register('field', { required: 'Field of study is required' })}
                error={errors.field?.message}
              />
              <datalist id="fields">
                {commonFields.map((field) => (
                  <option key={field} value={field} />
                ))}
              </datalist>
            </div>
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Start Date <span className="text-destructive">*</span></Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={(date) => handleDateSelect(date, 'start')}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>End Date {!isCurrent && <span className="text-destructive">*</span>}</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !endDate && !isCurrent && "text-muted-foreground"
                  )}
                  disabled={isCurrent}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {isCurrent ? 'Present' : (endDate ? format(endDate, 'PPP') : <span>Pick a date</span>)}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={(date) => handleDateSelect(date, 'end')}
                  initialFocus
                  disabled={isCurrent}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Current Study Checkbox */}
        <div className="flex items-center space-x-2 pt-2">
          <input
            type="checkbox"
            id="current"
            checked={isCurrent}
            onChange={(e) => {
              const checked = e.target.checked;
              setIsCurrent(checked);
              setValue('current', checked);
              if (checked) {
                setValue('endDate', null);
              }
            }}
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <Label htmlFor="current" className="text-sm font-normal">
            I currently study here
          </Label>
        </div>

        {/* Grade */}
        <div className="space-y-2">
          <Label htmlFor="grade">Grade</Label>
          <Input
            id="grade"
            placeholder="e.g., 3.8/4.0, A+"
            {...register('grade')}
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Activities, achievements, or additional information"
            className="min-h-[100px]"
            {...register('description')}
          />
        </div>
      </div>

      {/* Form Actions - Sticky to bottom */}
      <div className="sticky bottom-0 bg-background border-t pt-4 -mx-6 px-6 -mb-6">
        <div className="flex justify-end space-x-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Education'}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default EducationForm;
