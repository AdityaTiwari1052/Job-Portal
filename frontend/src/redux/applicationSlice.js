import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  applications: [],
  status: 'idle',
  error: null,
};

const applicationSlice = createSlice({
  name: 'applications',
  initialState,
  reducers: {
    setApplications: (state, action) => {
      state.applications = action.payload;
      state.status = 'succeeded';
      state.error = null;
    },
    setLoading: (state, action) => {
      state.status = action.payload ? 'loading' : 'idle';
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.status = 'failed';
    },
    resetApplications: (state) => {
      state.applications = [];
      state.status = 'idle';
      state.error = null;
    },
  },
});

export const { setApplications, setLoading, setError, resetApplications } = applicationSlice.actions;

export default applicationSlice.reducer;