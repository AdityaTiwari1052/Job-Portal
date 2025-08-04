import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  isAuthenticated: false,
  notifications: [],
  loading: false
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setNotifications: (state, action) => {
      state.notifications = action.payload;
    },
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload);
    },
    markNotificationAsRead: (state, action) => {
      const notification = state.notifications.find(n => n._id === action.payload);
      if (notification) {
        notification.read = true;
      }
    },
    markAllNotificationsAsRead: (state) => {
      state.notifications = state.notifications.map(notification => ({
        ...notification,
        read: true
      }));
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.notifications = [];
    },
  },
});

export const { 
  setUser, 
  setLoading, 
  setNotifications, 
  addNotification, 
  markNotificationAsRead, 
  markAllNotificationsAsRead, 
  logout 
} = authSlice.actions;

export default authSlice.reducer;
