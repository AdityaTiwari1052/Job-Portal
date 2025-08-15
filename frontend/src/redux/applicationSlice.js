import { createSlice } from "@reduxjs/toolkit";

const applicationSlice = createSlice({
    name: 'application',
    initialState: {
        applicants: [], 
    },
    reducers: {
        setAllApplicants: (state, action) => {
            console.log('Setting applicants in Redux:', action.payload);
            state.applicants = action.payload;
        }
    }
});

export const { setAllApplicants } = applicationSlice.actions;
export default applicationSlice.reducer;