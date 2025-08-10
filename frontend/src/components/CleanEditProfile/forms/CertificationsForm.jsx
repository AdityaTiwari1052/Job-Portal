import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { format } from 'date-fns';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, ChevronDown, Link as LinkIcon } from 'lucide-react';

const commonCertifications = [
  'AWS Certified Solutions Architect',
  'AWS Certified Developer',
  'AWS Certified SysOps Administrator',
  'Google Cloud Professional Cloud Architect',
  'Microsoft Certified: Azure Fundamentals',
  'Certified Kubernetes Administrator',
  'Docker Certified Associate',
  'Certified Scrum Master',
  'PMP - Project Management Professional',
  'CompTIA Security+',
  'CISSP',
  'Certified Ethical Hacker',
  'Oracle Certified Professional',
  'MongoDB Certified Developer',
  'Salesforce Certified Administrator',
  'Tableau Desktop Specialist'
];

const commonOrganizations = [
  'Amazon Web Services (AWS)',
  'Google Cloud',
  'Microsoft',
  'Oracle',
  'Salesforce',
  'MongoDB Inc.',
  'Docker Inc.',
  'Kubernetes',
  'Scrum Alliance',
  'Project Management Institute',
  'CompTIA',
  'ISC2',
  'EC-Council',
  'Tableau',
  'Red Hat',
  'VMware',
  'Cisco',
  'Adobe'
];

const CertificationsForm = ({
  initialData = {},
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const [issueDate, setIssueDate] = useState(initialData.issueDate ? new Date(initialData.issueDate) : new Date());
  const [expirationDate, setExpirationDate] = useState(initialData.expirationDate ? new Date(initialData.expirationDate) : null);
  const [doesNotExpire, setDoesNotExpire] = useState(initialData.doesNotExpire || false);
  const [selectedCertification, setSelectedCertification] = useState(initialData.name || '');
  const [selectedOrganization, setSelectedOrganization] = useState(initialData.issuingOrganization || '');
  const [showCertSuggestions, setShowCertSuggestions] = useState(false);
  const [showOrgSuggestions, setShowOrgSuggestions] = useState(false);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      name: initialData.name || '',
      issuingOrganization: initialData.issuingOrganization || '',
      issueDate: initialData.issueDate || new Date().toISOString(),
      expirationDate: initialData.expirationDate || '',
      doesNotExpire: initialData.doesNotExpire || false,
      credentialId: initialData.credentialId || '',
      credentialUrl: initialData.credentialUrl || ''
    }
  });

  // Update form values when initialData changes
  useEffect(() => {
    setValue('name', initialData.name || '');
    setValue('issuingOrganization', initialData.issuingOrganization || '');
    setValue('issueDate', initialData.issueDate || new Date().toISOString());
    setValue('expirationDate', initialData.expirationDate || '');
    setValue('doesNotExpire', initialData.doesNotExpire || false);
    setValue('credentialId', initialData.credentialId || '');
    setValue('credentialUrl', initialData.credentialUrl || '');
    
    setSelectedCertification(initialData.name || '');
    setSelectedOrganization(initialData.issuingOrganization || '');
    setIssueDate(initialData.issueDate ? new Date(initialData.issueDate) : new Date());
    setExpirationDate(initialData.expirationDate ? new Date(initialData.expirationDate) : null);
    setDoesNotExpire(initialData.doesNotExpire || false);
  }, [initialData, setValue]);

  const handleCertificationChange = (e) => {
    const value = e.target.value;
    setSelectedCertification(value);
    setValue('name', value);
    
    if (value.length > 1) {
      setShowCertSuggestions(true);
    } else {
      setShowCertSuggestions(false);
    }
  };

  const handleOrganizationChange = (e) => {
    const value = e.target.value;
    setSelectedOrganization(value);
    setValue('issuingOrganization', value);
    
    if (value.length > 1) {
      setShowOrgSuggestions(true);
    } else {
      setShowOrgSuggestions(false);
    }
  };

  const selectCertificationSuggestion = (suggestion) => {
    setSelectedCertification(suggestion);
    setValue('name', suggestion);
    setShowCertSuggestions(false);
  };

  const selectOrganizationSuggestion = (suggestion) => {
    setSelectedOrganization(suggestion);
    setValue('issuingOrganization', suggestion);
    setShowOrgSuggestions(false);
  };

  const handleIssueDateSelect = (date) => {
    setIssueDate(date);
    setValue('issueDate', date.toISOString());
  };

  const handleExpirationDateSelect = (date) => {
    setExpirationDate(date);
    setValue('expirationDate', date.toISOString());
  };

  const handleDoesNotExpireChange = (checked) => {
    setDoesNotExpire(checked);
    setValue('doesNotExpire', checked);
    if (checked) {
      setExpirationDate(null);
      setValue('expirationDate', '');
    }
  };

  const handleFormSubmit = (data) => {
    const formattedData = {
      ...data,
      issueDate: issueDate.toISOString(),
      expirationDate: doesNotExpire ? null : (expirationDate ? expirationDate.toISOString() : null),
      doesNotExpire,
      issuingOrganization: selectedOrganization
    };
    onSubmit(formattedData);
  };

  const filteredCertifications = commonCertifications.filter(cert =>
    cert.toLowerCase().includes(selectedCertification.toLowerCase())
  );

  const filteredOrganizations = commonOrganizations.filter(org =>
    org.toLowerCase().includes(selectedOrganization.toLowerCase())
  );

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Certification Name *</Label>
          <div className="relative">
            <Input
              id="name"
              value={selectedCertification}
              onChange={handleCertificationChange}
              placeholder="e.g., AWS Certified Solutions Architect"
              className="w-full"
              required
            />
            {showCertSuggestions && filteredCertifications.length > 0 && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                {filteredCertifications.map((cert, index) => (
                  <div
                    key={index}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => selectCertificationSuggestion(cert)}
                  >
                    {cert}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="issuingOrganization">Issuing Organization *</Label>
          <div className="relative">
            <Input
              id="issuingOrganization"
              value={selectedOrganization}
              onChange={handleOrganizationChange}
              placeholder="e.g., Amazon Web Services (AWS)"
              className="w-full"
              required
            />
            {showOrgSuggestions && filteredOrganizations.length > 0 && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                {filteredOrganizations.map((org, index) => (
                  <div
                    key={index}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => selectOrganizationSuggestion(org)}
                  >
                    {org}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Issue Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {issueDate ? format(issueDate, 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={issueDate}
                  onSelect={handleIssueDateSelect}
                  initialFocus
                  disabled={(date) => date > new Date() || date < new Date('1950-01-01')}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="doesNotExpire"
                checked={doesNotExpire}
                onCheckedChange={handleDoesNotExpireChange}
              />
              <Label htmlFor="doesNotExpire" className="text-sm font-normal">
                This credential does not expire
              </Label>
            </div>
            
            {!doesNotExpire && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                    disabled={doesNotExpire}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {expirationDate ? format(expirationDate, 'PPP') : <span>Expiration date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={expirationDate}
                    onSelect={handleExpirationDateSelect}
                    initialFocus
                    disabled={(date) => date < issueDate || date < new Date('1950-01-01')}
                  />
                </PopoverContent>
              </Popover>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="credentialId">Credential ID</Label>
            <Input
              id="credentialId"
              {...register('credentialId')}
              placeholder="e.g., ABC123456"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="credentialUrl">Credential URL</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LinkIcon className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                id="credentialUrl"
                {...register('credentialUrl')}
                type="url"
                placeholder="https://"
                className="pl-10"
              />
            </div>
          </div>
        </div>
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
          {isLoading ? 'Saving...' : 'Save Certification'}
        </Button>
      </div>
    </form>
  );
};

export default CertificationsForm;
