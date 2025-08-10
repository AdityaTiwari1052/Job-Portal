import apiClient from '@/utils/apiClient';
import { toast } from 'sonner';

const profileService = {
  // Get all education entries
  async getEducation() {
    try {
      const response = await apiClient.get('/user/me');
      // Ensure we return an empty array if no education data exists
      return {
        data: Array.isArray(response.data.user?.profile?.education) 
          ? response.data.user.profile.education 
          : [],
        success: true
      };
    } catch (error) {
      console.error('Error fetching education:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch education');
      // Return empty array on error to prevent UI from breaking
      return { data: [], success: false };
    }
  },

  // Add new education entry
  async addEducation(educationData) {
    try {
      // First, add the education with a temporary ID
      const tempId = Date.now().toString();
      const tempEducation = { ...educationData, _id: tempId };
      
      // Get current education to append the new one
      const { data: userData } = await apiClient.get('/user/me');
      const currentEducation = userData.user?.profile?.education || [];
      
      // Create the updated education array with the new entry
      const updatedEducation = [...currentEducation, tempEducation];
      
      // Send the updated array to the backend
      await apiClient.post('/user/profile/update', {
        education: updatedEducation
      });
      
      // Return the temporary education object with the data we have
      toast.success('Education added successfully');
      return {
        data: tempEducation,
        success: true
      };
    } catch (error) {
      console.error('Error adding education:', error);
      const errorMessage = error.response?.data?.message || 'Failed to add education';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  },

  // Update education entry
  async updateEducation(id, educationData) {
    try {
      // First get current education array
      const { data: userData } = await apiClient.get('/user/me');
      const currentEducation = userData.user?.profile?.education || [];
      
      // Update the specific education entry
      const updatedEducation = currentEducation.map(edu => 
        edu._id === id ? { ...edu, ...educationData } : edu
      );
      
      // Send the updated array directly to the backend
      const response = await apiClient.post('/user/profile/update', updatedEducation);
      
      // Verify the update was successful
      const updatedEdu = response.data?.user?.profile?.education?.find(e => e._id === id);
      if (!updatedEdu) {
        throw new Error('Failed to verify updated education');
      }
      
      toast.success('Education updated successfully');
      return {
        data: updatedEdu,
        success: true
      };
    } catch (error) {
      console.error('Error updating education:', error);
      toast.error(error.response?.data?.message || 'Failed to update education');
      throw error;
    }
  },

  // Delete education entry
  async deleteEducation(id) {
    try {
      // First get current education array
      const { data: userData } = await apiClient.get('/user/me');
      const currentEducation = userData.user?.profile?.education || [];
      
      // Filter out the education to delete
      const updatedEducation = currentEducation.filter(edu => edu._id !== id);
      
      // Update the profile with the filtered education array
      await apiClient.post('/user/profile/update', {
        education: updatedEducation
      });
      
      toast.success('Education deleted successfully');
      return {
        data: id,
        success: true
      };
    } catch (error) {
      console.error('Error deleting education:', error);
      toast.error(error.response?.data?.message || 'Failed to delete education');
      throw error;
    }
  },

  // Update education section
  async updateEducationSection(educationData) {
    try {
      const response = await apiClient.post('/user/profile/update', {
        education: [educationData]
      });
      toast.success('Education updated successfully');
      return response.data;
    } catch (error) {
      console.error('Error updating education:', error);
      toast.error(error.response?.data?.message || 'Failed to update education');
      throw error;
    }
  },

  // Add new education entry
  async addEducationEntry(educationItem) {
    try {
      const response = await apiClient.post('/user/profile/update', {
        education: [educationItem]
      });
      toast.success('Education added successfully');
      return response.data;
    } catch (error) {
      console.error('Error adding education:', error);
      toast.error(error.response?.data?.message || 'Failed to add education');
      throw error;
    }
  },

  // Delete education entry
  async deleteEducationEntry(educationId) {
    try {
      // First, get current education array
      const { data } = await apiClient.get('/user/me');
      const currentEducation = data.user?.profile?.education || [];
      
      // Remove the education with the given ID
      const updatedEducation = currentEducation.filter(edu => edu._id !== educationId);
      
      // Update the profile with the filtered education array
      const response = await apiClient.post('/user/profile/update', {
        education: updatedEducation
      });
      
      toast.success('Education deleted successfully');
      return response.data;
    } catch (error) {
      console.error('Error deleting education:', error);
      toast.error(error.response?.data?.message || 'Failed to delete education');
      throw error;
    }
  },

  // Update skills
  async updateSkills(skills) {
    try {
      const response = await apiClient.put('/user/profile/update', { skills });
      toast.success('Skills updated successfully');
      return response.data;
    } catch (error) {
      console.error('Error updating skills:', error);
      toast.error(error.response?.data?.message || 'Failed to update skills');
      throw error;
    }
  },

  // Add skill
  async addSkill(skill) {
    try {
      const response = await apiClient.put('/user/profile/update', { skills: [skill] });
      toast.success('Skill added successfully');
      return response.data;
    } catch (error) {
      console.error('Error adding skill:', error);
      toast.error(error.response?.data?.message || 'Failed to add skill');
      throw error;
    }
  },

  // Delete skill
  async deleteSkill(skill) {
    try {
      // First, get current skills array
      const { data } = await apiClient.get('/user/me');
      const currentSkills = data.user?.profile?.skills || [];
      
      // Remove the skill with the given name
      const updatedSkills = currentSkills.filter(s => s !== skill);
      
      // Update the profile with the filtered skills array
      const response = await apiClient.put('/user/profile/update', {
        skills: updatedSkills
      });
      
      toast.success('Skill deleted successfully');
      return response.data;
    } catch (error) {
      console.error('Error deleting skill:', error);
      toast.error(error.response?.data?.message || 'Failed to delete skill');
      throw error;
    }
  },

  // Update about section
  async updateAbout(aboutData) {
    try {
      // Send the data directly at the root level, not nested under 'about'
      const response = await apiClient.post('/user/profile/update', aboutData);
      toast.success('About section updated successfully');
      return response.data;
    } catch (error) {
      console.error('Error updating about section:', error);
      toast.error(error.response?.data?.message || 'Failed to update about section');
      throw error;
    }
  },

  // Update experience section
  async updateExperience(experienceData) {
    try {
      const response = await apiClient.put('/user/profile/update', {
        experience: [experienceData]
      });
      toast.success('Experience updated successfully');
      return response.data;
    } catch (error) {
      console.error('Error updating experience:', error);
      toast.error(error.response?.data?.message || 'Failed to update experience');
      throw error;
    }
  },

  // Add new experience entry
  async addExperience(experienceItem) {
    try {
      const response = await apiClient.put('/user/profile/update', {
        experience: [experienceItem]
      });
      toast.success('Experience added successfully');
      return response.data;
    } catch (error) {
      console.error('Error adding experience:', error);
      toast.error(error.response?.data?.message || 'Failed to add experience');
      throw error;
    }
  },

  // Delete experience entry
  async deleteExperience(experienceId) {
    try {
      // First, get current experience array
      const { data } = await apiClient.get('/user/me');
      const currentExperience = data.user?.profile?.experience || [];
      
      // Remove the experience with the given ID
      const updatedExperience = currentExperience.filter(exp => exp._id !== experienceId);
      
      // Update the profile with the filtered experience array
      const response = await apiClient.put('/user/profile/update', {
        experience: updatedExperience
      });
      
      toast.success('Experience deleted successfully');
      return response.data;
    } catch (error) {
      console.error('Error deleting experience:', error);
      toast.error(error.response?.data?.message || 'Failed to delete experience');
      throw error;
    }
  },

  // Update certifications
  async updateCertifications(certifications) {
    try {
      const response = await apiClient.put('/user/profile/update', { certifications });
      toast.success('Certifications updated successfully');
      return response.data;
    } catch (error) {
      console.error('Error updating certifications:', error);
      toast.error(error.response?.data?.message || 'Failed to update certifications');
      throw error;
    }
  },

  // Add certification
  async addCertification(certification) {
    try {
      const response = await apiClient.put('/user/profile/update', { certifications: [certification] });
      toast.success('Certification added successfully');
      return response.data;
    } catch (error) {
      console.error('Error adding certification:', error);
      toast.error(error.response?.data?.message || 'Failed to add certification');
      throw error;
    }
  },

  // Delete certification
  async deleteCertification(certificationId) {
    try {
      // First, get current certifications array
      const { data } = await apiClient.get('/user/me');
      const currentCertifications = data.user?.profile?.certifications || [];
      
      // Remove the certification with the given ID
      const updatedCertifications = currentCertifications.filter(cert => cert._id !== certificationId);
      
      // Update the profile with the filtered certifications array
      const response = await apiClient.put('/user/profile/update', {
        certifications: updatedCertifications
      });
      
      toast.success('Certification deleted successfully');
      return response.data;
    } catch (error) {
      console.error('Error deleting certification:', error);
      toast.error(error.response?.data?.message || 'Failed to delete certification');
      throw error;
    }
  },
};

export default profileService;
