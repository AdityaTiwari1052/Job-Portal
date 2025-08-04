import React, { useState, useEffect, useCallback } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Camera, Edit, Calendar, MapPin, Mail, Phone, Globe, Plus, Briefcase, GraduationCap, Award, X, Pencil, Loader2 } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import userService from "../services/userService";
import { toast } from "sonner";
import _ from 'lodash';

const EditProfile = ({ user, onUpdate }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  
  // Log initial user data
  useEffect(() => {
    console.log('Initial user data in EditProfile:', user);
    
    // If we already have user data, initialize the profile state
    if (user?.profile && !initialLoadComplete) {
      setProfile({
        fullname: user.fullname || '',
        pronouns: user.pronouns || '',
        headline: user.headline || user.profile?.headline || '',
        about: user.about || user.profile?.about || '',
        location: user.location || user.profile?.location || '',
        contact: user.contact || user.profile?.contact || {
          email: user.email || '',
          phone: user.phoneNumber || '',
          website: user.profile?.website || ''
        },
        experience: user.experience || user.profile?.experience || [],
        education: user.education || user.profile?.education || [],
        skills: user.skills || user.profile?.skills || [],
        certifications: user.certifications || user.profile?.certifications || []
      });
      setInitialLoadComplete(true);
      setIsLoading(false);
    }
  }, [user, initialLoadComplete]);
  
  // Fetch user profile data if not provided
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user?._id || initialLoadComplete) return;
      
      try {
        setIsLoading(true);
        console.log('💾 DATABASE FETCH - Fetching user profile data for user ID:', user._id);
        const response = await userService.getProfile(user._id);
        console.log('💾 DATABASE FETCH - Raw response:', JSON.stringify(response, null, 2));
        
        // Handle the response based on the API structure
        const userData = response.user || response; // Handle both response formats
        console.log('💾 DATABASE FETCH - Extracted user data:', JSON.stringify(userData, null, 2));
        
        if (userData) {
          // Extract skills from various possible locations
          const skillsFromRoot = userData.skills || [];
          const skillsFromProfile = userData.profile?.skills || [];
          const finalSkills = skillsFromRoot.length > 0 ? skillsFromRoot : skillsFromProfile;
          
          console.log('💾 DATABASE FETCH - Skills analysis:');
          console.log('  - Skills from root:', skillsFromRoot);
          console.log('  - Skills from profile:', skillsFromProfile);
          console.log('  - Final skills to use:', finalSkills);
          
          const profileData = {
            fullname: userData.fullname || '',
            pronouns: userData.pronouns || '',
            headline: userData.headline || userData.profile?.headline || '',
            about: userData.about || userData.profile?.about || '',
            location: userData.location || userData.profile?.location || '',
            industry: userData.industry || userData.profile?.industry || '',
            country: userData.country || userData.profile?.country || '',
            postalCode: userData.postalCode || userData.profile?.postalCode || '',
            profilePhoto: userData.profile?.profilePhoto || '',
            bannerPhoto: userData.profile?.bannerPhoto || '',
            contact: {
              email: userData.email || '',
              phone: userData.phoneNumber || '',
              website: userData.profile?.website || ''
            },
            experience: userData.experience || userData.profile?.experience || [],
            education: userData.education || userData.profile?.education || [],
            skills: finalSkills,
            certifications: userData.certifications || userData.profile?.certifications || [],
            profile: {
              ...userData.profile,
              skills: finalSkills
            }
          };
          
          console.log('💾 DATABASE FETCH - Setting profile state:', JSON.stringify(profileData, null, 2));
          setProfile(profileData);
          setInitialLoadComplete(true);
        }
      } catch (error) {
        console.error('💾 DATABASE FETCH - Error fetching user profile:', error);
        toast.error('Failed to load profile data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserProfile();
  }, [user?._id, initialLoadComplete]);
  // State for dialog management
  const [editDialog, setEditDialog] = useState({
    isOpen: false,
    type: null,
    data: null,
    index: null,
    isNew: false,
    error: null
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState({
    fullname: '',
    pronouns: '',
    headline: '',
    about: '',
    location: '',
    contact: {
      email: '',
      phone: '',
      website: ''
    },
    experience: [],
    education: [],
    skills: [],
    certifications: []
  });

  // Validation functions for different form types
  const validateFormData = (type, data) => {
    const errors = {};
    
    switch(type) {
      case 'experience':
        if (!data.title?.trim()) errors.title = 'Job title is required';
        if (!data.company?.trim()) errors.company = 'Company name is required';
        if (!data.startDate) errors.startDate = 'Start date is required';
        break;
        
      case 'education':
        console.log('📝 VALIDATION - Education data being validated:', data);
        if (!data.school?.trim()) errors.school = 'School name is required';
        if (!data.degree?.trim()) errors.degree = 'Degree is required';
        if (!data.field?.trim()) errors.field = 'Field of study is required';
        if (!data.startDate) errors.startDate = 'Start date is required';
        console.log('📝 VALIDATION - Education validation errors:', errors);
        break;
        
      case 'certification':
        if (!data.name?.trim()) errors.name = 'Certification name is required';
        if (!data.issuingOrganization?.trim()) errors.issuingOrganization = 'Issuing organization is required';
        if (!data.issueDate) errors.issueDate = 'Issue date is required';
        break;
        
      case 'profile':
        if (!data.fullname?.trim()) errors.fullname = 'Full name is required';
        break;
        
      case 'about':
        if (!data.about?.trim()) errors.about = 'About section cannot be empty';
        break;
    }
    
    // Convert errors to array of { field, message } objects
    const errorList = Object.entries(errors).map(([field, message]) => ({
      field,
      message
    }));
    
    return {
      isValid: errorList.length === 0,
      errors: errorList
    };
  };

  // Open edit dialog with proper data population
  const openEditDialog = (type, index = null, itemData = null) => {
    console.log('🔵 OPEN DIALOG - Type:', type, 'Index:', index, 'ItemData:', itemData);
    
    let dialogData = getDefaultData(type);
    console.log('🔵 OPEN DIALOG - Default data:', dialogData);
    
    // If editing an existing item, merge its data with default values
    if (index !== null && itemData) {
      dialogData = { ...dialogData, ...itemData };
    } 
    // If no specific item data but we're in edit mode, get data from profile
    else if (index !== null) {
      const profileData = profile[`${type}s`]?.[index];
      if (profileData) {
        dialogData = { ...dialogData, ...profileData };
      }
    }
    // Special case for about section which is part of the main profile
    else if (type === 'about') {
      dialogData = { about: profile.about || '' };
    }
    // Special case for profile section
    else if (type === 'profile') {
      dialogData = {
        fullname: profile.fullname || '',
        headline: profile.headline || '',
        location: profile.location || '',
        pronouns: profile.pronouns || ''
      };
    }

    const newDialogState = {
      isOpen: true,
      type,
      data: dialogData,
      index,
      isNew: index === null && !itemData,
      error: null
    };
    
    console.log('🔵 OPEN DIALOG - New dialog state:', newDialogState);
    setEditDialog(newDialogState);
  };

  // Get default empty data for each type with proper fallbacks
  const getDefaultData = (type) => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.toLocaleString('default', { month: 'short' });
    
    switch(type) {
      case 'about':
        return { about: '' };
        
      case 'education':
        return {
          school: '',
          degree: '',
          fieldOfStudy: '',
          startDate: '',
          endDate: '',
          current: false,
          description: '',
          activities: ''
        };
        
      case 'experience':
        return {
          title: '',
          company: '',
          employmentType: 'Full-time',
          location: '',
          startDate: '',
          endDate: '',
          current: false,
          description: '',
          skills: []
        };
        
      case 'certification':
        return {
          name: '',
          issuingOrganization: '',
          issueDate: `${currentMonth} ${currentYear}`,
          credentialId: '',
          credentialUrl: '',
          doesNotExpire: false,
          expirationDate: ''
        };
        
      case 'skill':
        return { 
          name: '',
          level: 'Intermediate',
          experience: '',
          description: ''
        };
        
      case 'profile':
        return {
          fullname: '',
          headline: '',
          location: '',
          pronouns: '',
          industry: '',
          country: '',
          postalCode: ''
        };
        
      default:
        return {};
    }
  };



  // Save profile to backend
  const saveProfileToBackend = async (profileData) => {
    try {
      // Prepare the data to match the backend's expected format
      console.log('🚀 BACKEND SAVE - Profile data received for saving:', JSON.stringify(profileData, null, 2));
      
      // Extract skills as an array (not a string) to match other arrays
      let skillsArray = [];
      
      if (profileData.profile?.skills && Array.isArray(profileData.profile.skills)) {
        console.log('🚀 BACKEND SAVE - Found skills in profile.profile.skills:', profileData.profile.skills);
        skillsArray = profileData.profile.skills.map(skill => {
          // Handle both string skills and object skills
          return typeof skill === 'string' ? skill : skill.name || skill;
        });
      } else if (profileData.skills && Array.isArray(profileData.skills)) {
        console.log('🚀 BACKEND SAVE - Found skills in profile.skills:', profileData.skills);
        skillsArray = profileData.skills.map(skill => {
          return typeof skill === 'string' ? skill : skill.name || skill;
        });
      }
      
      console.log('🚀 BACKEND SAVE - Skills array extracted:', skillsArray);
      
      // Prepare the complete profile update including arrays
      const profileUpdate = {
        fullname: profileData.fullname || '',
        email: profileData.contact?.email || user?.email || '',
        phoneNumber: profileData.contact?.phone || '',
        bio: profileData.about || '',
        about: profileData.about || '',
        headline: profileData.headline || '',
        location: profileData.location || '',
        // Send skills as an array, not a string - this is the key fix!
        skills: skillsArray,
        // Include the arrays that were previously missing!
        education: profileData.education || [],
        experience: profileData.experience || [],
        certifications: profileData.certifications || []
      };
      
      console.log('🚀 BACKEND SAVE - Sending complete profile update to backend:', JSON.stringify(profileUpdate, null, 2));
      
      const response = await userService.updateProfile(profileUpdate);
      console.log('🚀 BACKEND SAVE - Backend response:', JSON.stringify(response, null, 2));
      
      if (response.success) {
        console.log('🚀 BACKEND SAVE - SUCCESS! Profile updated successfully');
        toast.success('Profile updated successfully!');
      } else {
        console.log('🚀 BACKEND SAVE - ERROR! Backend returned failure:', response.message);
        toast.error(response.message || 'Failed to update profile');
      }
      
      return response;
      
    } catch (error) {
      console.error('Error in saveProfileToBackend:', {
        error,
        response: error.response?.data,
        status: error.response?.status,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          data: error.config?.data
        }
      });
      
      const errorMessage = error.response?.data?.message || 
                         error.message || 
                         'Failed to update profile. Please try again.';
      
      toast.error(errorMessage);
      throw error; // Re-throw to be caught by the caller
    }
  };

  // Validate required fields for experience
  const validateExperience = (expData) => {
    if (!expData.title?.trim()) {
      setError('Job title is required');
      return false;
    }
    if (!expData.company?.trim()) {
      setError('Company name is required');
      return false;
    }
    if (!expData.startDate) {
      setError('Start date is required');
      return false;
    }
    if (!expData.employmentType) {
      // Set a default employment type if not provided
      expData.employmentType = 'Full-time';
    }
    return true;
  };

  // Validate required fields for education
  const validateEducation = (eduData) => {
    if (!eduData.school?.trim()) {
      setError('School name is required');
      return false;
    }
    if (!eduData.degree?.trim()) {
      setError('Degree is required');
      return false;
    }
    if (!eduData.field?.trim()) {
      setError('Field of study is required');
      return false;
    }
    if (!eduData.startDate) {
      setError('Start date is required');
      return false;
    }
    return true;
  };

  // Handle save from dialog
  const handleSave = async () => {
    console.log('🚨🚨🚨 HANDLE SAVE - VERY FIRST LINE REACHED!');
    console.log('🚨 HANDLE SAVE CALLED - Function entry point reached!');
    console.log('🚨 HANDLE SAVE - isSaving:', isSaving);
    console.log('🚨 HANDLE SAVE - editDialog:', JSON.stringify(editDialog, null, 2));
    
    if (isSaving) {
      console.log('🚨 HANDLE SAVE - EARLY RETURN: isSaving is true, exiting function');
      return;
    }
    
    console.log('🚨 HANDLE SAVE - PASSED isSaving check, continuing...');
    console.log('=== DEBUG: Starting profile save ===');
    console.log('Dialog type:', editDialog.type);
    console.log('Current dialog data:', editDialog.data);
    
    // Validate form data before saving
    const { isValid, errors } = validateFormData(editDialog.type, editDialog.data);
    
    if (!isValid && errors.length > 0) {
      console.log('Validation failed:', errors);
      // Get the first error
      const firstError = errors[0];
      setEditDialog(prev => ({
        ...prev,
        error: firstError // Store the first error
      }));
      return;
    }
    
    setIsSaving(true);
    const { type, index, data, isNew } = editDialog;
    
    try {
      // Create a deep copy of the current profile
      const updatedProfile = JSON.parse(JSON.stringify(profile));
      let shouldUpdateParent = false;
      
      console.log('💾 SAVE - Processing dialog type:', type);
      
      switch(type) {
        case 'about':
          console.log('💾 SAVE - Processing ABOUT case');
          updatedProfile.about = data.about;
          shouldUpdateParent = true;
          break;
          
        case 'profile':
          console.log('💾 SAVE - Processing PROFILE case');
          updatedProfile.fullname = data.fullname || updatedProfile.fullname;
          updatedProfile.headline = data.headline || updatedProfile.headline;
          updatedProfile.location = data.location || updatedProfile.location;
          updatedProfile.pronouns = data.pronouns || updatedProfile.pronouns;
          shouldUpdateParent = true;
          break;
          
        case 'education':
          console.log('💾 SAVE - Processing EDUCATION case');
          // Validate education data before saving
          if (!validateEducation(data)) {
            setIsSaving(false);
            return;
          }
          
          if (!updatedProfile.education) updatedProfile.education = [];
          const educationData = {
            ...data,
            school: data.school?.trim(),
            degree: data.degree?.trim(),
            field: data.field?.trim() || data.fieldOfStudy?.trim(), // Handle both field names
            startDate: data.startDate || new Date(),
            endDate: data.current ? null : (data.endDate || null),
            current: !!data.current,
            grade: data.grade?.trim() || '',
            activities: data.activities?.trim() || '',
            description: data.description?.trim() || ''
          };
          
          if (isNew) {
            updatedProfile.education.push({ ...educationData, id: Date.now() });
          } else if (index !== undefined && index >= 0) {
            updatedProfile.education[index] = { 
              ...updatedProfile.education[index], 
              ...educationData 
            };
          }
          console.log('Updated education array:', updatedProfile.education);
          break;
          
        case 'experience':
          // Validate experience data before saving
          if (!validateExperience(data)) {
            setIsSaving(false);
            return;
          }
          
          if (!updatedProfile.experience) updatedProfile.experience = [];
          const experienceData = {
            ...data,
            title: data.title?.trim(),
            company: data.company?.trim(),
            location: data.location?.trim() || '',
            description: data.description?.trim() || '',
            current: !!data.current,
            startDate: data.startDate || new Date(),
            endDate: data.current ? null : (data.endDate || null),
            employmentType: data.employmentType || 'Full-time'
          };
          
          if (isNew) {
            updatedProfile.experience.push({ ...experienceData, id: Date.now() });
          } else if (index !== undefined && index >= 0) {
            updatedProfile.experience[index] = { 
              ...updatedProfile.experience[index], 
              ...experienceData 
            };
          }
          console.log('Updated experience array:', updatedProfile.experience);
          break;
          
        case 'certification':
          console.log('Saving certification data:', { data, isNew, index, currentProfile: updatedProfile });
          
          // Ensure we have a profile object
          if (!updatedProfile.profile) {
            updatedProfile.profile = {};
          }
          
          // Initialize certifications array if it doesn't exist
          if (!Array.isArray(updatedProfile.profile.certifications)) {
            console.log('Initializing certifications array in profile');
            updatedProfile.profile.certifications = [];
          }
          
          // Prepare certification data with proper structure
          const certData = {
            name: data.name?.trim() || 'Untitled Certification',
            issuingOrganization: data.issuingOrganization || data.issuer || '',
            issueDate: data.issueDate || new Date(),
            expirationDate: data.expirationDate || null,
            credentialId: data.credentialId || '',
            credentialUrl: data.credentialUrl || ''
          };
          
          if (isNew) {
            console.log('Adding new certification:', certData);
            updatedProfile.profile.certifications.push(certData);
          } else if (index !== undefined && index >= 0 && index < updatedProfile.profile.certifications.length) {
            console.log('Updating certification at index', index, 'to:', certData);
            updatedProfile.profile.certifications[index] = {
              ...updatedProfile.profile.certifications[index],
              ...certData
            };
          }
          break;
          
        case 'skills':
        case 'skill':
          console.log('🎯 SKILLS SAVE - Dialog type:', editDialog.type);
          console.log('🎯 SKILLS SAVE - Data received:', data);
          console.log('🎯 SKILLS SAVE - isNew:', isNew, 'index:', index);
          console.log('🎯 SKILLS SAVE - Current profile before:', JSON.stringify(updatedProfile, null, 2));
          
          if (data.name?.trim()) {
            // Ensure we have a profile object
            if (!updatedProfile.profile) {
              updatedProfile.profile = {};
            }
            // Initialize skills array if it doesn't exist
            if (!Array.isArray(updatedProfile.profile.skills)) {
              console.log('🎯 SKILLS SAVE - Initializing skills array in profile');
              updatedProfile.profile.skills = [];
            }
            
            const skillName = data.name.trim();
            console.log('🎯 SKILLS SAVE - Processing skill:', skillName);
            
            if (isNew) {
              // Add new skill if it doesn't already exist (case insensitive check)
              const skillExists = updatedProfile.profile.skills.some(
                skill => {
                  const existingSkill = typeof skill === 'string' ? skill : skill.name || '';
                  return existingSkill.toLowerCase() === skillName.toLowerCase();
                }
              );
              
              if (!skillExists) {
                console.log('🎯 SKILLS SAVE - Adding new skill:', skillName);
                updatedProfile.profile.skills.push({
                  name: skillName,
                  level: data.level || 'Intermediate',
                  experience: data.experience || '',
                  description: data.description || ''
                });
              } else {
                console.log('🎯 SKILLS SAVE - Skill already exists, not adding:', skillName);
              }
            } else if (index !== undefined && index >= 0 && index < updatedProfile.profile.skills.length) {
              // Update existing skill
              console.log('🎯 SKILLS SAVE - Updating skill at index', index, 'to:', skillName);
              updatedProfile.profile.skills[index] = {
                name: skillName,
                level: data.level || 'Intermediate',
                experience: data.experience || '',
                description: data.description || ''
              };
            }
            console.log('🎯 SKILLS SAVE - Updated profile.skills array:', JSON.stringify(updatedProfile.profile.skills, null, 2));
          } else {
            console.log('🎯 SKILLS SAVE - ERROR: No skill name provided or empty string');
          }
          break;
      }
      
      // Update local state first for immediate UI feedback
      console.log('=== UPDATING LOCAL PROFILE STATE ===');
      console.log('Profile data to save:', JSON.stringify(updatedProfile, null, 2));
      console.log('Education array length:', updatedProfile.education?.length || 0);
      console.log('Experience array length:', updatedProfile.experience?.length || 0);
      console.log('Skills array length:', updatedProfile.skills?.length || 0);
      setProfile(updatedProfile);
      
      try {
        // Save to backend
        console.log('=== SAVING TO BACKEND ===');
        console.log('About to call saveProfileToBackend with data:', {
          education: updatedProfile.education,
          experience: updatedProfile.experience,
          skills: updatedProfile.skills,
          certifications: updatedProfile.certifications
        });
        const savedProfile = await saveProfileToBackend(updatedProfile);
        console.log('Backend save successful, response:', savedProfile);
        
        // If backend returns updated user data, use it
        if (savedProfile?.user) {
          console.log('Using server-returned profile data:', savedProfile.user);
          
          // Extract user data and profile data from response
          const updatedUserData = savedProfile.user;
          const updatedProfileData = updatedUserData.profile || {};
          
          // Determine the correct skills array to use (could be in root or profile object)
          const skillsFromResponse = updatedUserData.skills || updatedProfileData.skills || [];
          console.log('Skills from response:', skillsFromResponse);
          
          setProfile(prev => {
            // Create new state with merged data
            const newState = {
              ...prev,
              // Spread all user data first
              ...updatedUserData,
              // Ensure skills is always an array
              skills: Array.isArray(skillsFromResponse) ? [...skillsFromResponse] : [],
              // Handle profile object
              profile: {
                ...prev.profile,
                ...updatedProfileData,
                // Ensure skills in profile is also updated
                skills: Array.isArray(skillsFromResponse) ? [...skillsFromResponse] : []
              }
            };
            
            console.log('Updated profile state after save:', newState);
            return newState;
          });
        }
        
        // Notify parent component if needed
        if (shouldUpdateParent) {
          console.log('Notifying parent component of profile update');
          onProfileUpdate?.({
            fullname: updatedProfile.fullname,
            headline: updatedProfile.headline,
            location: updatedProfile.location,
            about: updatedProfile.about,
            pronouns: updatedProfile.pronouns
          });
        }
      } catch (error) {
        console.error('Error saving to backend:', error);
        // Revert local state on error
        console.log('Reverting to previous profile state due to error');
        setProfile(prev => ({ ...prev })); // Trigger re-render
        throw error; // Re-throw to be caught by the outer try-catch
      }
      
      setEditDialog(prev => ({ ...prev, isOpen: false }));
    } catch (error) {
      console.error('Error saving data:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Update dialog data with error clearing
  const updateDialogData = (updates) => {
    setEditDialog(prev => ({
      ...prev,
      data: { ...prev.data, ...updates },
      error: null // Clear any existing errors when data changes
    }));
  };

  // Render the appropriate form based on the dialog type
  const renderEditForm = () => {
    const { data } = editDialog;
    if (!data) return null;

    const commonInput = (label, field, placeholder = '', type = 'text', isTextarea = false, required = false) => {
      const error = editDialog.error?.field === field ? editDialog.error.message : null;
      const inputId = `${editDialog.type}-${field}`;
      
      return (
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <Label htmlFor={inputId} className={error ? 'text-destructive' : ''}>
              {label}
              {required && <span className="text-destructive ml-1">*</span>}
            </Label>
          </div>
          {isTextarea ? (
            <Textarea
              id={inputId}
              defaultValue={data[field] || ''}
              onBlur={(e) => updateDialogData({ ...data, [field]: e.target.value })}
              placeholder={placeholder}
              rows={4}
              className={error ? 'border-destructive' : ''}
              style={{ resize: 'vertical', minHeight: '100px' }}
            />
          ) : (
            <Input
              id={inputId}
              type={type}
              value={data[field] || ''}
              onChange={(e) => updateDialogData({ ...data, [field]: e.target.value })}
              placeholder={placeholder}
              className={error ? 'border-destructive' : ''}
            />
          )}
          {error && (
            <p className="text-xs text-red-600 mt-1">{error}</p>
          )}
        </div>
      );
    };

    const commonSelect = (label, field, options, required = false, allowCustom = false) => {
      const error = editDialog.error?.field === field ? editDialog.error.message : null;
      const selectId = `${editDialog.type}-${field}`;
      const isCustomValue = allowCustom && data[field] && !options.includes(data[field]);
      
      return (
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <Label htmlFor={selectId} className={error ? 'text-red-600' : ''}>
              {label}
              {required && <span className="text-red-600 ml-1">*</span>}
            </Label>
          </div>
          {!isCustomValue ? (
            <div className="flex gap-2">
              <select
                id={selectId}
                value={data[field] || ''}
                onChange={(e) => {
                  if (e.target.value === 'custom' && allowCustom) {
                    updateDialogData({ ...data, [field]: '__CUSTOM__' }); // Use special marker to trigger custom input
                  } else {
                    updateDialogData({ ...data, [field]: e.target.value });
                  }
                }}
                className={`flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${error ? 'border-red-500' : 'border-gray-300'}`}
              >
                <option value="">Select {label}</option>
                {options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
                {allowCustom && <option value="custom">Other (Enter manually)</option>}
              </select>
            </div>
          ) : (
            <div className="flex gap-2">
              <Input
                value={data[field] === '__CUSTOM__' ? '' : data[field] || ''}
                onChange={(e) => updateDialogData({ ...data, [field]: e.target.value })}
                placeholder={`Enter ${label.toLowerCase()}`}
                className={`flex-1 ${error ? 'border-red-500' : ''}`}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => updateDialogData({ ...data, [field]: '' })}
                className="px-3"
              >
                Select
              </Button>
            </div>
          )}
          {error && (
            <p className="text-xs text-red-600 mt-1">{error}</p>
          )}
        </div>
      );
    };

    // Common options for dropdowns
    const commonSchools = [
      'Harvard University', 'Stanford University', 'MIT', 'University of California, Berkeley',
      'University of Oxford', 'University of Cambridge', 'Yale University', 'Princeton University',
      'Columbia University', 'University of Chicago', 'University of Pennsylvania', 'Cornell University',
      'New York University', 'University of Michigan', 'University of Toronto', 'University of Washington'
    ];

    const commonCompanies = [
      'Google', 'Microsoft', 'Apple', 'Amazon', 'Meta', 'Netflix', 'Tesla', 'Uber',
      'Airbnb', 'Spotify', 'Adobe', 'Salesforce', 'Oracle', 'IBM', 'Intel', 'NVIDIA',
      'Twitter', 'LinkedIn', 'Dropbox', 'Slack', 'Zoom', 'PayPal', 'Square', 'Stripe'
    ];

    const commonSkills = [
      'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'TypeScript', 'HTML/CSS',
      'SQL', 'Git', 'Docker', 'AWS', 'MongoDB', 'PostgreSQL', 'Express.js', 'Next.js',
      'Vue.js', 'Angular', 'Spring Boot', 'Django', 'Flask', 'Kubernetes', 'GraphQL',
      'Redis', 'Elasticsearch', 'Jenkins', 'Terraform', 'Linux', 'Bash', 'C++', 'C#',
      'Go', 'Rust', 'Swift', 'Kotlin', 'PHP', 'Ruby', 'Scala', 'R', 'MATLAB'
    ];

    const commonCertifications = [
      'AWS Certified Solutions Architect', 'AWS Certified Developer', 'AWS Certified SysOps Administrator',
      'Google Cloud Professional Cloud Architect', 'Microsoft Azure Fundamentals', 'Certified Kubernetes Administrator',
      'Docker Certified Associate', 'Certified Scrum Master', 'PMP - Project Management Professional',
      'CompTIA Security+', 'CISSP', 'Certified Ethical Hacker', 'Oracle Certified Professional',
      'MongoDB Certified Developer', 'Salesforce Certified Administrator', 'Tableau Desktop Specialist'
    ];

    const commonOrganizations = [
      'Amazon Web Services (AWS)', 'Google Cloud', 'Microsoft', 'Oracle', 'Salesforce',
      'MongoDB Inc.', 'Docker Inc.', 'Kubernetes', 'Scrum Alliance', 'Project Management Institute',
      'CompTIA', 'ISC2', 'EC-Council', 'Tableau', 'Red Hat', 'VMware', 'Cisco', 'Adobe'
    ];

    switch(editDialog.type) {
      case 'about':
        return (
          <div className="space-y-4">
            {commonInput('About', 'about', 'Tell us about yourself...', 'text', true)}
          </div>
        );
        
      case 'profile':
        return (
          <div className="space-y-4">
            {commonInput('Full Name', 'fullname', 'Enter your full name', 'text', false, true)}
            {commonInput('Headline', 'headline', 'e.g., Software Developer at Company')}
            {commonInput('Location', 'location', 'e.g., City, Country')}
            {commonInput('Pronouns', 'pronouns', 'e.g., He/Him, She/Her, They/Them')}
          </div>
        );
        
      case 'education':
        return (
          <div className="space-y-4">
            {commonSelect('School', 'school', commonSchools, true, true)}
            {commonInput('Degree', 'degree', 'e.g., Bachelor of Science', 'text', false, true)}
            {commonInput('Field of Study', 'field', 'e.g., Computer Science', 'text', false, true)}
            <div className="grid grid-cols-2 gap-4">
              <div>
                {commonInput('Start Date', 'startDate', '', 'date', false, true)}
              </div>
              <div>
                {commonInput('End Date', 'endDate', 'Leave empty if current', 'date')}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="current-education"
                checked={data.current || false}
                onChange={(e) => updateDialogData({ ...data, current: e.target.checked })}
                className="h-4 w-4"
              />
              <Label htmlFor="current-education" className="text-sm font-normal">
                I am currently studying here
              </Label>
            </div>
            {commonInput('Grade', 'grade', 'e.g., 3.8/4.0 or First Class')}
            {commonInput('Activities', 'activities', 'Clubs, sports, volunteer work, etc.', 'text', true)}
            {commonInput('Description', 'description', 'Describe your education and achievements', 'text', true)}
          </div>
        );
        
      case 'experience':
        const employmentTypes = [
          'Full-time', 'Part-time', 'Self-employed', 'Freelance', 
          'Contract', 'Internship', 'Apprenticeship', 'Seasonal'
        ];
        
        return (
          <div className="space-y-4">
            {commonInput('Title', 'title', 'e.g., Software Engineer', 'text', false, true)}
            {commonSelect('Company', 'company', commonCompanies, true, true)}
            {commonSelect('Employment Type', 'employmentType', employmentTypes, true)}
            {commonInput('Location', 'location', 'e.g., Remote, New York, NY')}
            <div className="grid grid-cols-2 gap-4">
              <div>
                {commonInput('Start Date', 'startDate', '', 'date', false, true)}
              </div>
              <div>
                {commonInput('End Date', 'endDate', 'Leave empty if current', 'date')}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="current-experience"
                checked={data.current || false}
                onChange={(e) => updateDialogData({ ...data, current: e.target.checked })}
                className="h-4 w-4"
              />
              <Label htmlFor="current-experience" className="text-sm font-normal">
                I am currently working here
              </Label>
            </div>
            {commonInput('Description', 'description', 'Describe your role and responsibilities', 'text', true)}
            <div className="space-y-2">
              <Label>Skills Used (Optional)</Label>
              <Input
                placeholder="e.g., JavaScript, React, Node.js (comma-separated)"
                value={data.skills ? data.skills.join(', ') : ''}
                onChange={(e) => {
                  const skillsArray = e.target.value.split(',').map(skill => skill.trim()).filter(skill => skill);
                  updateDialogData({ ...data, skills: skillsArray });
                }}
              />
            </div>
          </div>
        );

      case 'skills':
        return (
          <div className="space-y-4">
            {commonSelect('Skill Name', 'name', commonSkills, true, true)}
            <div className="text-sm text-gray-600">
              <p>Note: Skills are stored as simple text values. You can add multiple skills by creating separate entries.</p>
            </div>
          </div>
        );

      case 'certification':
        return (
          <div className="space-y-4">
            {commonSelect('Certification Name', 'name', commonCertifications, true, true)}
            {commonSelect('Issuing Organization', 'issuingOrganization', commonOrganizations, true, true)}
            {commonInput('Issue Date', 'issueDate', '', 'date', false, true)}
            {commonInput('Expiration Date', 'expirationDate', 'Leave empty if no expiration', 'date')}
            {commonInput('Credential ID', 'credentialId', 'e.g., ABC123456')}
            {commonInput('Credential URL', 'credentialUrl', 'e.g., https://www.credly.com/badges/...')}
          </div>
        );

      case 'language':
        const proficiencyLevels = [
          'Elementary', 'Limited Working', 'Professional', 'Full Professional', 'Native/Bilingual'
        ];
        
        return (
          <div className="space-y-4">
            {commonInput('Language', 'name', 'e.g., English, Spanish, French', 'text', false, true)}
            {commonSelect('Proficiency Level', 'proficiency', proficiencyLevels, true)}
          </div>
        );
        
      default:
        return <div>Unknown form type</div>;
    }
  };

  // Render about section
  const renderAboutSection = () => (
    <div className="p-6 border-t border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">About</h2>
        <Button
          variant="ghost"
          className="text-blue-600 hover:bg-blue-50"
          onClick={() => openEditDialog('about')}
        >
          <Pencil className="h-4 w-4 mr-1" /> Edit
        </Button>
      </div>
      <p className="text-gray-700 whitespace-pre-line">
        {profile.about || "No about information provided."}
      </p>
    </div>
  );

  // Helper function to format dates
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  };

  // Helper function to normalize text for comparison
  const normalizeText = (text) => {
    if (!text) return '';
    return String(text).toLowerCase().trim().replace(/\s+/g, ' ');
  };

  // Check if two education entries are similar enough to be considered duplicates
  const isSimilarEducation = (edu1, edu2) => {
    if (!edu1 || !edu2) return false;
    
    const normSchool1 = normalizeText(edu1.school);
    const normSchool2 = normalizeText(edu2.school);
    const normDegree1 = normalizeText(edu1.degree);
    const normDegree2 = normalizeText(edu2.degree);
    const normField1 = normalizeText(edu1.field);
    const normField2 = normalizeText(edu2.field);
    
    // If schools are different, they're not the same education
    if (normSchool1 !== normSchool2) return false;
    
    // If degrees are the same and fields are similar or one is a substring of the other
    if (normDegree1 === normDegree2) {
      if (!normField1 || !normField2) return true;
      return normField1.includes(normField2) || 
             normField2.includes(normField1) ||
             normField1 === normField2;
    }
    
    return false;
  };

  // Get unique education entries, preferring the most complete one
  const getUniqueEducations = (educations) => {
    if (!Array.isArray(educations) || educations.length === 0) return [];
    
    // First, remove any completely empty or invalid entries
    const validEducations = educations.filter(edu => 
      edu && (edu.school || '').trim() && (edu.degree || '').trim()
    );
    
    // Then deduplicate
    const unique = [];
    
    validEducations.forEach(edu => {
      // Check if we already have a similar education
      const existingIndex = unique.findIndex(existing => isSimilarEducation(existing, edu));
      
      if (existingIndex === -1) {
        // If not found, add it
        unique.push({
          ...edu,
          school: edu.school?.trim(),
          degree: edu.degree?.trim(),
          field: edu.field?.trim() || null,
          grade: edu.grade?.trim() || null,
          activities: edu.activities?.trim() || null,
          description: edu.description?.trim() || null
        });
      } else {
        // If found, merge with the existing one, keeping the most complete data
        const existing = unique[existingIndex];
        unique[existingIndex] = {
          ...existing,
          school: edu.school?.trim() || existing.school,
          degree: edu.degree?.trim() || existing.degree,
          field: (edu.field?.trim() && !existing.field) ? edu.field.trim() : existing.field,
          grade: (edu.grade?.trim() && !existing.grade) ? edu.grade.trim() : existing.grade,
          activities: (edu.activities?.trim() && !existing.activities) ? edu.activities.trim() : existing.activities,
          description: (edu.description?.trim() && !existing.description) ? edu.description.trim() : existing.description,
          // Keep the earliest start date
          startDate: (new Date(edu.startDate) < new Date(existing.startDate)) ? edu.startDate : existing.startDate,
          // Keep the latest end date (or null if either is current)
          endDate: (edu.current || existing.current) ? null : 
                  (new Date(edu.endDate) > new Date(existing.endDate) ? edu.endDate : existing.endDate),
          current: edu.current || existing.current
        };
      }
    });
    
    // Sort by start date (newest first)
    return unique.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
  };

  // Render education section
  const renderEducationSection = () => {
    const uniqueEducations = getUniqueEducations(profile.education || []);
    
    return (
      <div className="p-6 border-t border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Education</h2>
          <Button
            variant="ghost"
            className="text-blue-600 hover:bg-blue-50"
            onClick={() => openEditDialog('education')}
          >
            <Plus className="h-4 w-4 mr-1" /> Add Education
          </Button>
        </div>
        
        {uniqueEducations.length > 0 ? (
          <div className="space-y-6">
            {uniqueEducations.map((edu, index) => (
              <div key={`${edu.id || ''}-${index}`} className="relative group border-l-2 border-blue-100 pl-4 py-2">
                <div className="flex justify-between items-start">
                  <div className="w-full">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium text-gray-900">{edu.school || 'No school name'}</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => openEditDialog('education', index, { ...edu })}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-gray-700 font-medium">{edu.degree} {edu.field ? `in ${edu.field}` : ''}</p>
                    <p className="text-sm text-gray-600">
                      {formatDate(edu.startDate)} - {edu.current ? 'Present' : formatDate(edu.endDate)}
                      {edu.grade && ` • ${edu.grade}`}
                    </p>
                    {edu.activities && (
                      <p className="mt-1 text-sm text-gray-600">{edu.activities}</p>
                    )}
                    {edu.description && (
                      <p className="mt-2 text-gray-700">{edu.description}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No education information added yet.</p>
        )}
      </div>
    );
  };

  // Render experience section
  const renderExperienceSection = () => (
    <div className="p-6 border-t border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Experience</h2>
        <Button
          variant="ghost"
          className="text-blue-600 hover:bg-blue-50"
          onClick={() => openEditDialog('experience')}
        >
          <Plus className="h-4 w-4 mr-1" /> Add experience
        </Button>
      </div>
      
      {profile.experience.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Briefcase className="h-12 w-12 mx-auto text-gray-300" />
          <p className="mt-2">No experience added yet</p>
        </div>
      ) : (
        <div className="space-y-6">
          {profile.experience.map((exp, index) => (
            <div key={exp.id} className="group relative p-4 hover:bg-gray-50 rounded-lg transition-colors">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 flex-shrink-0">
                  <Briefcase className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{exp.title || "Untitled Position"}</h3>
                  <p className="text-gray-700">{exp.company} • {exp.employmentType}</p>
                  <p className="text-sm text-gray-500">
                    {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                    {exp.location && ` • ${exp.location}`}
                  </p>
                  {exp.description && (
                    <p className="mt-2 text-sm text-gray-700 line-clamp-2">{exp.description}</p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="opacity-0 group-hover:opacity-100 h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    openEditDialog('experience', index, { ...exp });
                  }}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Render skills section
  const renderSkillsSection = () => {
    // Fix: Skills are stored at profile.skills, not profile.profile.skills
    const skills = profile.skills || [];
    
    // Debug log to check skills data
    console.log('Rendering skills section. Current skills:', {
      skillsArray: skills,
      profileSkillsLocation: profile.skills,
      profileProfileSkillsLocation: profile.profile?.skills,
      fullProfile: profile
    });
    
    return (
      <div className="p-6 border-t border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Skills</h2>
          <Button
            variant="ghost"
            className="text-blue-600 hover:text-blue-700"
            onClick={() => openEditDialog('skills', null, null)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Skill
          </Button>
        </div>
        
        {skills.length > 0 ? (
          <div className="space-y-2">
            {skills.map((skill, index) => {
              // Handle both string skills (from backend) and object skills (from frontend)
              const skillName = typeof skill === 'string' ? skill : skill.name || skill;
              const skillLevel = typeof skill === 'object' ? skill.level : 'Intermediate';
              const skillExperience = typeof skill === 'object' ? skill.experience : '';
              const skillDescription = typeof skill === 'object' ? skill.description : '';
              
              return (
                <div key={index} className="group flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                  <div className="flex-1">
                    <span className="text-sm font-medium">{skillName}</span>
                    {skillLevel && typeof skill === 'object' && (
                      <span className="text-xs text-gray-500 ml-2">({skillLevel})</span>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => openEditDialog('skills', index, { 
                      name: skillName, 
                      level: skillLevel, 
                      experience: skillExperience, 
                      description: skillDescription 
                    })}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No skills added yet</p>
        )}
      </div>
    );
  };

  // Render certifications section
  const renderCertificationsSection = () => {
    // Get certifications from profile.profile.certifications or root certifications, ensure it's an array
    const certifications = Array.isArray(profile.profile?.certifications) ? 
      profile.profile.certifications : 
      Array.isArray(profile.certifications) ? 
      profile.certifications : [];

    return (
      <div className="p-6 border-t border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Certifications</h2>
          <Button
            variant="ghost"
            className="text-blue-600 hover:text-blue-700"
            onClick={() => openEditDialog('certifications', -1, getDefaultData().certifications[0] || {})}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Certification
          </Button>
        </div>

        {certifications.length > 0 ? (
          <div className="space-y-4">
            {certifications.map((cert, index) => (
              <div key={index} className="group p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{cert.name}</h3>
                    <p className="text-sm text-gray-600">{cert.issuingOrganization}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {cert.issueDate ? new Date(cert.issueDate).toLocaleDateString() : 'N/A'}
                      {cert.expirationDate && ` - ${new Date(cert.expirationDate).toLocaleDateString()}`}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 h-8 w-8"
                    onClick={() => openEditDialog('certification', index, { ...cert })}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No certifications added yet</p>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600">Loading profile...</span>
      </div>
    );
  }

  const Label = ({ children, htmlFor, className }) => (
    <label htmlFor={htmlFor} className={className}>
      {children}
    </label>
  );

  const EditDialog = ({ isOpen, onClose, title, children, onSave, onDelete, isSaving, isEditMode = false }) => {
    if (!isOpen) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>
          
          <div className="p-6">
            {children}
          </div>
          
          <div className="p-6 border-t bg-gray-50 flex justify-between items-center">
            <div className="flex space-x-3">
              {/* Delete button - only show when editing existing entries */}
              {isEditMode && onDelete && (
                <Button 
                  variant="destructive" 
                  onClick={onDelete} 
                  disabled={isSaving}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  🗑️ Delete
                </Button>
              )}
            </div>
            
            <div className="flex space-x-3">
              <Button variant="outline" onClick={onClose} disabled={isSaving}>
                Cancel
              </Button>
              <Button onClick={onSave} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden max-w-4xl mx-auto">
      {/* Header Section */}
      <div className="relative">
        {/* Cover Photo */}
        <div className="h-48 bg-gradient-to-r from-blue-600 to-blue-800">
          <div className="absolute top-4 right-4">
            <Button variant="outline" size="icon" className="bg-white/90 hover:bg-white">
              <Camera className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        {/* Profile Info */}
        <div className="px-6 pb-6 relative">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between -mt-16 mb-4">
            <div className="flex items-end gap-4">
              <div className="relative">
                <Avatar className="h-32 w-32 border-4 border-white">
                  <AvatarImage src={user?.profileImage} />
                  <AvatarFallback className="text-3xl">
                    {profile.fullname?.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="absolute bottom-0 right-0 bg-white hover:bg-gray-100 h-10 w-10 rounded-full"
                >
                  <Camera className="h-5 w-5" />
                </Button>
              </div>
              
              <div className="mb-2">
                <h1 className="text-2xl font-bold">{profile.fullname}</h1>
                <p className="text-gray-600">{profile.headline}</p>
                <div className="flex items-center text-sm text-gray-500 mt-1">
                  <span>{profile.location}</span>
                </div>
              </div>
            </div>
            
            <div className="mt-4 md:mt-0 flex gap-2">
              <Button 
                variant="outline" 
                className="text-blue-600 border-blue-600 hover:bg-blue-50"
                onClick={() => openEditDialog('profile')}
              >
                <Pencil className="h-4 w-4 mr-1" /> Edit Profile
              </Button>
            </div>
          </div>
          
          {/* About Section */}
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-semibold">About</h2>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
                onClick={() => openEditDialog('about')}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-gray-700 whitespace-pre-line">
              {profile.about || "No about information provided."}
            </p>
          </div>
        </div>
      </div>
      
      {/* Profile Sections */}
      <div className="border-t border-gray-200">
        {renderExperienceSection()}
        {renderEducationSection()}
        {renderSkillsSection()}
        {renderCertificationsSection()}
      </div>
      
      {/* Edit Dialog */}
      <EditDialog
        isOpen={editDialog.isOpen}
        onClose={() => setEditDialog(prev => ({ ...prev, isOpen: false }))}
        title={`${editDialog.isNew ? 'Add' : 'Edit'} ${
          editDialog.type ? editDialog.type.charAt(0).toUpperCase() + editDialog.type.slice(1) : ''
        }`}
        onSave={handleSave}
        onDelete={() => {
          const handleDelete = async () => {
            try {
              console.log('🗑️ DELETE STARTED - Type:', editDialog.type, 'Index:', editDialog.index);
              console.log('🗑️ DELETE STARTED - Current profile:', JSON.stringify(profile, null, 2));
              
              setIsSaving(true);
              
              // Create updated profile with the item removed
              const updatedProfile = JSON.parse(JSON.stringify(profile));
              
              console.log('🗑️ DELETE - Profile before deletion:', {
                education: updatedProfile.education?.length || 0,
                experience: updatedProfile.experience?.length || 0,
                certifications: updatedProfile.certifications?.length || 0,
                skills: updatedProfile.skills?.length || 0
              });
              
              if (editDialog.type === 'education') {
                console.log('🗑️ DELETE - Removing education at index:', editDialog.index);
                console.log('🗑️ DELETE - Education before:', updatedProfile.education);
                updatedProfile.education.splice(editDialog.index, 1);
                console.log('🗑️ DELETE - Education after:', updatedProfile.education);
              } else if (editDialog.type === 'experience') {
                console.log('🗑️ DELETE - Removing experience at index:', editDialog.index);
                console.log('🗑️ DELETE - Experience before:', updatedProfile.experience);
                updatedProfile.experience.splice(editDialog.index, 1);
                console.log('🗑️ DELETE - Experience after:', updatedProfile.experience);
              } else if (editDialog.type === 'certifications') {
                console.log('🗑️ DELETE - Removing certification at index:', editDialog.index);
                console.log('🗑️ DELETE - Certifications before:', updatedProfile.certifications);
                updatedProfile.certifications.splice(editDialog.index, 1);
                console.log('🗑️ DELETE - Certifications after:', updatedProfile.certifications);
              } else if (editDialog.type === 'skills') {
                console.log('🗑️ DELETE - Removing skill at index:', editDialog.index);
                console.log('🗑️ DELETE - Skills before:', updatedProfile.skills);
                updatedProfile.skills.splice(editDialog.index, 1);
                console.log('🗑️ DELETE - Skills after:', updatedProfile.skills);
              }
              
              console.log('🗑️ DELETE - Profile after deletion:', {
                education: updatedProfile.education?.length || 0,
                experience: updatedProfile.experience?.length || 0,
                certifications: updatedProfile.certifications?.length || 0,
                skills: updatedProfile.skills?.length || 0
              });
              
              console.log('🗑️ DELETE - About to call saveProfileToBackend with:', JSON.stringify(updatedProfile, null, 2));
              
              // Save the updated profile to the backend
              await saveProfileToBackend(updatedProfile);
              
              console.log('🗑️ DELETE - Backend save completed successfully');
              
              // Update local state only after successful backend save
              setProfile(updatedProfile);
              
              console.log('🗑️ DELETE - Local state updated');
              
              // Call onUpdate if provided to refresh parent component
              if (onUpdate) {
                onUpdate(updatedProfile);
                console.log('🗑️ DELETE - Parent component updated');
              }
              
              toast.success(`${editDialog.type.charAt(0).toUpperCase() + editDialog.type.slice(1)} deleted successfully`);
              setEditDialog(prev => ({ ...prev, isOpen: false }));
              
              console.log('🗑️ DELETE COMPLETED SUCCESSFULLY');
              
            } catch (error) {
              console.error('🗑️ DELETE ERROR - Full error:', error);
              console.error('🗑️ DELETE ERROR - Error message:', error.message);
              console.error('🗑️ DELETE ERROR - Error response:', error.response?.data);
              toast.error(`Failed to delete ${editDialog.type}. Please try again.`);
            } finally {
              setIsSaving(false);
            }
          };
          
          handleDelete();
        }}
        isSaving={isSaving}
        isEditMode={!editDialog.isNew}
      >
        {renderEditForm()}
      </EditDialog>
    </div>
  );
};

export default EditProfile;
