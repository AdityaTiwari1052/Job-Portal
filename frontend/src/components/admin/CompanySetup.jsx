import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import apiClient from '@/utils/apiClient';
import { setSingleCompany } from '@/redux/companySlice';
import { useDispatch } from 'react-redux';
import { Building2, ArrowLeft } from 'lucide-react';

const CompanySetup = ({ onComplete, showBackButton = true }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        website: '',
        location: '',
        logo: null
    });
    const [isLoading, setIsLoading] = useState(false);
    const [logoPreview, setLogoPreview] = useState('');
    const [formSubmitted, setFormSubmitted] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({
                ...prev,
                logo: file
            }));
            
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const validateForm = () => {
        if (!formData.name.trim()) {
            toast.error('Company name is required');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormSubmitted(true);
        
        if (!validateForm()) {
            return;
        }

        try {
            setIsLoading(true);
            const formDataToSend = new FormData();
            
            // Debug: Log the form data before sending
            console.log('Form data before sending:', {
                name: formData.name,
                description: formData.description,
                website: formData.website,
                location: formData.location,
                logo: formData.logo ? 'File present' : 'No file'
            });
            
            // Explicitly append each field to ensure they're included
            formDataToSend.append('name', formData.name);
            if (formData.description) formDataToSend.append('description', formData.description);
            if (formData.website) formDataToSend.append('website', formData.website);
            if (formData.location) formDataToSend.append('location', formData.location);
            
            // Handle file upload if present
            if (formData.logo && formData.logo instanceof File) {
                formDataToSend.append('logo', formData.logo);
            }

            // Debug: Log the FormData contents
            console.log('FormData contents:');
            for (let [key, value] of formDataToSend.entries()) {
                console.log(key, value);
            }

            // Send the request to create company with all details
            const res = await apiClient.post('/company/register', formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (res?.data?.success) {
                dispatch(setSingleCompany(res.data.company));
                toast.success(res.data.message);
                if (onComplete) {
                    onComplete(res.data.company._id);
                } else {
                    navigate('/admin/companies');
                }
            }
        } catch (error) {
            console.error('Error saving company:', error);
            toast.error(error.response?.data?.message || 'Failed to save company');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-800">
                    Register Your Company
                </h1>
                {showBackButton && (
                    <Button 
                        variant="ghost"
                        onClick={() => onComplete ? onComplete() : navigate(-1)}
                        disabled={isLoading}
                        className="text-gray-600 hover:bg-gray-100"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>
                )}
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="name">Company Name <span className="text-red-500">*</span></Label>
                    <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="e.g., Google, Microsoft, etc."
                        className={formSubmitted && !formData.name.trim() ? 'border-red-500' : ''}
                    />
                    {formSubmitted && !formData.name.trim() && (
                        <p className="text-sm text-red-500">Company name is required</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Tell us about your company..."
                        rows={4}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="website">Website</Label>
                        <Input
                            id="website"
                            name="website"
                            type="url"
                            value={formData.website}
                            onChange={handleChange}
                            placeholder="https://example.com"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input
                            id="location"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            placeholder="e.g., San Francisco, CA"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="logo">Company Logo</Label>
                    <div className="flex items-center gap-4">
                        {logoPreview ? (
                            <div className="w-16 h-16 rounded-full overflow-hidden border">
                                <img 
                                    src={logoPreview} 
                                    alt="Company Logo Preview" 
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        ) : (
                            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                                <Building2 className="w-8 h-8 text-gray-400" />
                            </div>
                        )}
                        <div className="flex-1">
                            <Input
                                id="logo"
                                name="logo"
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="w-full"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Upload a square logo (recommended: 400x400px, max 2MB)
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <Button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full sm:w-auto"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Registering...
                            </>
                        ) : (
                            'Register Company'
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default CompanySetup;