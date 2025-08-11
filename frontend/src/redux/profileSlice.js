import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import profileService from '../services/profileService';
import userService from '../services/userService';

// Helper function for consistent logging
const debugLog = (message, data = '') => {
  console.log(`[ProfileSlice] ${message}`, data);
};

// Async thunks
export const fetchProfile = createAsyncThunk(
  'profile/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      debugLog('Fetching profile data...');
      const response = await userService.getMyProfile();
      debugLog('Profile data received:', response);
      // The response is already the user object with success flag
      // Return the entire response as the profile data
      return response.user || response;
    } catch (error) {
      debugLog('Error fetching profile:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch profile');
    }
  }
);

export const fetchEducation = createAsyncThunk(
  'profile/fetchEducation',
  async (_, { rejectWithValue }) => {
    try {
      debugLog('Fetching education data...');
      const response = await profileService.getEducation();
      debugLog('Education data received:', response.data);
      return response.data;
    } catch (error) {
      debugLog('Error fetching education:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch education');
    }
  }
);

export const addEducation = createAsyncThunk(
  'profile/addEducation',
  async (educationData, { rejectWithValue }) => {
    try {
      debugLog('Adding education data...');
      const response = await profileService.addEducation(educationData);
      debugLog('Education data added:', response.data);
      return response.data;
    } catch (error) {
      debugLog('Error adding education:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || 'Failed to add education');
    }
  }
);

export const updateEducation = createAsyncThunk(
  'profile/updateEducation',
  async ({ id, ...educationData }, { rejectWithValue }) => {
    try {
      debugLog('Updating education data...');
      const response = await profileService.updateEducation(id, educationData);
      debugLog('Education data updated:', response.data);
      return response.data;
    } catch (error) {
      debugLog('Error updating education:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || 'Failed to update education');
    }
  }
);

export const deleteEducation = createAsyncThunk(
  'profile/deleteEducation',
  async (id, { rejectWithValue }) => {
    try {
      debugLog('Deleting education data...');
      await profileService.deleteEducation(id);
      debugLog('Education data deleted:', id);
      return id;
    } catch (error) {
      debugLog('Error deleting education:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || 'Failed to delete education');
    }
  }
);

export const updateAbout = createAsyncThunk(
  'profile/updateAbout',
  async (aboutData, { rejectWithValue }) => {
    try {
      debugLog('Updating about data...', aboutData);
      
      // The backend expects the about data directly, not nested under 'about'
      const response = await userService.updateProfile(aboutData);
      
      debugLog('About data updated:', response.data);
      return response.data;
    } catch (error) {
      debugLog('Error updating about:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || 'Failed to update about section');
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'profile/updateUserProfile',
  async (userData, { rejectWithValue }) => {
    try {
      debugLog('Updating user profile data...', userData);
      const response = await userService.updateProfile(userData);
      debugLog('User profile updated:', response.data);
      return response.data;
    } catch (error) {
      debugLog('Error updating user profile:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || 'Failed to update profile');
    }
  }
);

const initialState = {
  profile: null,
  loading: false,
  error: null,
  education: []
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    clearProfileError: (state) => {
      debugLog('Clearing profile error');
      state.error = null;
    },
    resetProfileState: () => {
      debugLog('Resetting profile state');
      return initialState;
    }
  },
  extraReducers: (builder) => {
    // Fetch Profile
    builder.addCase(fetchProfile.pending, (state) => {
      debugLog('Fetching profile - pending');
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchProfile.fulfilled, (state, action) => {
      debugLog('Fetch profile - succeeded', action.payload);
      state.loading = false;
      state.profile = action.payload;
    });
    builder.addCase(fetchProfile.rejected, (state, action) => {
      debugLog('Fetch profile - failed', action.payload || action.error);
      state.loading = false;
      state.error = action.payload;
    });

    // Fetch Education
    builder.addCase(fetchEducation.pending, (state) => {
      debugLog('Fetching education - pending');
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchEducation.fulfilled, (state, action) => {
      debugLog('Fetch education - succeeded', action.payload);
      state.loading = false;
      // Ensure we're setting the education array directly
      state.education = Array.isArray(action.payload) ? action.payload : [];
    });
    builder.addCase(fetchEducation.rejected, (state, action) => {
      debugLog('Fetch education - failed', action.payload || action.error);
      state.loading = false;
      state.error = action.payload;
      state.education = [];
    });

    // Add Education
    builder.addCase(addEducation.pending, (state) => {
      debugLog('Adding education - pending');
      state.loading = true;
      state.error = null;
    });
    builder.addCase(addEducation.fulfilled, (state, action) => {
      debugLog('Add education - succeeded', action.payload);
      state.loading = false;
      if (action.payload) {
        state.education = [...state.education, action.payload];
      }
    });
    builder.addCase(addEducation.rejected, (state, action) => {
      debugLog('Add education - failed', action.payload || action.error);
      state.loading = false;
      state.error = action.payload;
    });

    // Update Education
    builder.addCase(updateEducation.pending, (state) => {
      debugLog('Updating education - pending');
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateEducation.fulfilled, (state, action) => {
      debugLog('Update education - succeeded', action.payload);
      state.loading = false;
      if (action.payload) {
        state.education = state.education.map(edu => 
          edu._id === action.payload._id ? action.payload : edu
        );
      }
    });
    builder.addCase(updateEducation.rejected, (state, action) => {
      debugLog('Update education - failed', action.payload || action.error);
      state.loading = false;
      state.error = action.payload;
    });

    // Delete Education
    builder.addCase(deleteEducation.pending, (state) => {
      debugLog('Deleting education - pending');
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteEducation.fulfilled, (state, action) => {
      debugLog('Delete education - succeeded', action.payload);
      state.loading = false;
      state.education = state.education.filter(edu => edu._id !== action.payload);
    });
    builder.addCase(deleteEducation.rejected, (state, action) => {
      debugLog('Delete education - failed', action.payload || action.error);
      state.loading = false;
      state.error = action.payload;
    });

    // Update About
    builder.addCase(updateAbout.pending, (state) => {
      debugLog('Updating about - pending');
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateAbout.fulfilled, (state, action) => {
      debugLog('Update about - succeeded', action.payload);
      state.loading = false;
      if (action.payload.profile?.about) {
        state.profile.about = {
          ...state.profile.about,
          ...action.payload.profile.about
        };
      }
    });
    builder.addCase(updateAbout.rejected, (state, action) => {
      debugLog('Update about - failed', action.payload || action.error);
      state.loading = false;
      state.error = action.payload;
    });

    // Update User Profile
    builder.addCase(updateUserProfile.pending, (state) => {
      debugLog('Updating user profile - pending');
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateUserProfile.fulfilled, (state, action) => {
      debugLog('Update user profile - succeeded', action.payload);
      state.loading = false;
      state.profile = action.payload;
    });
    builder.addCase(updateUserProfile.rejected, (state, action) => {
      debugLog('Update user profile - failed', action.payload || action.error);
      state.loading = false;
      state.error = action.payload;
    });
  }
});

export const { clearProfileError, resetProfileState } = profileSlice.actions;
export default profileSlice.reducer;
