import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { format } from 'date-fns';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from 'lucide-react';

const ExperienceForm = ({
  initialData = {},
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const [isCurrent, setIsCurrent] = useState(initialData.current || false);
  const [startDate, setStartDate] = useState(initialData.startDate ? new Date(initialData.startDate) : null);
  const [endDate, setEndDate] = useState(initialData.endDate ? new Date(initialData.endDate) : null);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    defaultValues: {
      title: initialData.title || '',
      company: initialData.company || '',
      location: initialData.location || '',
      employmentType: initialData.employmentType || 'Full-time',
      description: initialData.description || '',
      current: initialData.current || false
    }
  });

  // Update form values when initialData changes
  useEffect(() => {
    setValue('title', initialData.title || '');
    setValue('company', initialData.company || '');
    setValue('location', initialData.location || '');
    setValue('employmentType', initialData.employmentType || 'Full-time');
    setValue('description', initialData.description || '');
    setValue('current', initialData.current || false);
    setIsCurrent(initialData.current || false);
    setStartDate(initialData.startDate ? new Date(initialData.startDate) : null);
    setEndDate(initialData.endDate ? new Date(initialData.endDate) : null);
  }, [initialData, setValue]);

  const handleDateSelect = (date, field) => {
    if (field === 'start') {
      setStartDate(date);
      setValue('startDate', date);
    } else {
      setEndDate(date);
      setValue('endDate', date);
    }
  };

  const handleCurrentChange = (checked) => {
    setIsCurrent(checked);
    setValue('current', checked);
    if (checked) {
      setEndDate(null);
      setValue('endDate', '');
    }
  };

  const handleFormSubmit = (data) => {
    const formattedData = {
      ...data,
      startDate: startDate ? startDate.toISOString() : '',
      endDate: isCurrent ? '' : (endDate ? endDate.toISOString() : ''),
      current: isCurrent
    };
    onSubmit(formattedData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            placeholder="e.g. Software Engineer"
            {...register('title', { required: 'Title is required' })}
          />
          {errors.title && (
            <p className="text-sm text-red-500">{errors.title.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="company">Company *</Label>
          <Input
            id="company"
            placeholder="e.g. Google"
            {...register('company', { required: 'Company name is required' })}
          />
          {errors.company && (
            <p className="text-sm text-red-500">{errors.company.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            placeholder="e.g. San Francisco, CA"
            {...register('location')}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="employmentType">Employment Type</Label>
          <select
            id="employmentType"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            {...register('employmentType')}
          >
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Self-employed">Self-employed</option>
            <option value="Freelance">Freelance</option>
            <option value="Contract">Contract</option>
            <option value="Internship">Internship</option>
            <option value="Apprenticeship">Apprenticeship</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label>Start Date *</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
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
                disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
              />
            </PopoverContent>
          </Popover>
          {errors.startDate && (
            <p className="text-sm text-red-500">{errors.startDate.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="current" 
              checked={isCurrent}
              onCheckedChange={handleCurrentChange}
            />
            <Label htmlFor="current">I am currently working in this role</Label>
          </div>
          
          {!isCurrent && (
            <div className="mt-2">
              <Label>End Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal mt-1"
                    disabled={isCurrent}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={(date) => handleDateSelect(date, 'end')}
                    initialFocus
                    disabled={(date) => date > new Date() || (startDate && date < startDate)}
                  />
                </PopoverContent>
              </Popover>
              {errors.endDate && (
                <p className="text-sm text-red-500">{errors.endDate.message}</p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Describe your role and responsibilities"
          className="min-h-[100px]"
          {...register('description')}
        />
        <p className="text-xs text-gray-500 mt-1">
          Include key achievements and responsibilities (max 1000 characters)
        </p>
      </div>
      
      <div className="flex justify-end gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Experience'}
        </Button>
      </div>
    </form>
  );
};

export default ExperienceForm;
