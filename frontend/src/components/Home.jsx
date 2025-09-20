import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Hero from './Hero';
import Jobs from './Jobs';
import FilterCard from './FilterCard';
import RecruiterAuthModal from './auth/RecruiterAuthModal';
import { useModal } from '../context/ModalContext';

function Home() {
  const [showFilters, setShowFilters] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { isRecruiterModalOpen, openRecruiterModal, closeRecruiterModal } = useModal();

  // Check if we should open the recruiter modal
  useEffect(() => {
    if (location.state?.showRecruiterLogin) {
      openRecruiterModal();
      // Clear the state to prevent reopening on refresh
      navigate('/', { replace: true, state: {} });
    }
  }, [location.state, openRecruiterModal, navigate]);

  return (
    <div className="min-h-screen bg-gray-50">

      <Hero />

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar */}
          <div className={`${showFilters ? 'block' : 'hidden'} lg:block w-full lg:w-56`}>
            <div className="sticky top-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Filters</h2>
                <button
                  onClick={() => setShowFilters(false)}
                  className="lg:hidden text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              <FilterCard />
            </div>
          </div>

          {/* Jobs List */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Latest Job Openings</h2>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors flex items-center gap-1"
              >
                {showFilters ? (
                  <>
                    <span>Hide Filters</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </>
                ) : (
                  <>
                    <span>Show Filters</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" />
                    </svg>
                  </>
                )}
              </button>
            </div>
            <Jobs />
          </div>
        </div>
      </div>

      {/* Recruiter Auth Modal */}
      <RecruiterAuthModal
        isOpen={isRecruiterModalOpen}
        onClose={closeRecruiterModal}
        onSuccess={() => {
          // Optional: handle successful login/registration
          console.log('Recruiter authentication successful');
        }}
      />
    </div>
  );
}

export default Home;
