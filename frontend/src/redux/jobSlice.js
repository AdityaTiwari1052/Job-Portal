import { createSlice } from "@reduxjs/toolkit";

const jobSlice = createSlice({
    name: "job",
    initialState: {
        allJobs: [],
        allAdminJobs: [],
        singleJob: null,
        searchJobByText: "",
        allAppliedJobs: [],
        searchedQuery: "",
        isLoading: false,
        error: null
    },
    reducers: {
        setAllJobs: (state, action) => {
            state.allJobs = action.payload;
            state.isLoading = false;
            state.error = null;
        },
        setSingleJob: (state, action) => {
            state.singleJob = action.payload;
            state.isLoading = false;
            state.error = null;
        },
        setAllAdminJobs: (state, action) => {
            state.allAdminJobs = action.payload;
            state.isLoading = false;
            state.error = null;
        },
        setSearchJobByText: (state, action) => {
            state.searchJobByText = action.payload;
        },
        setAllAppliedJobs: (state, action) => {
            state.allAppliedJobs = action.payload;
            state.isLoading = false;
            state.error = null;
        },
        setSearchedQuery: (state, action) => {
            state.searchedQuery = action.payload;
        },
        setLoading: (state, action) => {
            state.isLoading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
            state.isLoading = false;
        }
    }
});

export const {
    setAllJobs,
    setSingleJob,
    setAllAdminJobs,
    setSearchJobByText,
    setAllAppliedJobs,
    setSearchedQuery,
    setLoading,
    setError
} = jobSlice.actions;

export default jobSlice.reducer;