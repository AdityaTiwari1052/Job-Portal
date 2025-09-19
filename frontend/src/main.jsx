import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { Provider } from 'react-redux';
import store from './redux/store.js';
import { persistStore } from 'redux-persist';
import { PersistGate } from 'redux-persist/integration/react';
import { ClerkProvider } from '@clerk/clerk-react';
import { AppProvider } from './context/AppContext';
import { ModalProvider } from './context/ModalContext';

// Get Clerk publishable key from environment variables
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Clerk Publishable Key. Please add VITE_CLERK_PUBLISHABLE_KEY to your .env.local file.");
}

// Clerk JWT token template
const clerkTokenTemplate = {
  jobportal: {
    template: {
      name: 'jobportal',
      claims: {
        // Add any custom claims you need in the JWT
        user_metadata: { '*': true },
      },
      lifetime: 60 * 60 * 24 * 7, // 7 days
    },
  },
};

const persistor = persistStore(store);

// Error boundary for catching rendering errors
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div className="p-4 text-red-500">Something went wrong. Please refresh the page.</div>;
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ClerkProvider 
        publishableKey={PUBLISHABLE_KEY}
        tokenCache={typeof window !== 'undefined' ? window.localStorage : null}
        appearance={{
          variables: {
            colorPrimary: '#2563eb',
          },
        }}
        tokenTemplates={clerkTokenTemplate}
      >
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <AppProvider>
              <ModalProvider>
                <App />
              </ModalProvider>
            </AppProvider>
          </PersistGate>
        </Provider>
      </ClerkProvider>
    </ErrorBoundary>
  </React.StrictMode>
);