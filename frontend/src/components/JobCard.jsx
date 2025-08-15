import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { toast } from 'sonner';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

const JobCard = ({ job }) => {
  const navigate = useNavigate();
  const { isSignedIn } = useUser();

  // Debug: Log the job object to see its structure
  useEffect(() => {
    console.log('Job data:', job);
  }, [job]);

  const handleApplyClick = (e) => {
    e.stopPropagation(); 
    if (!isSignedIn) {
      toast.info('Please sign in to apply for jobs');
      return;
    }
    navigate(`/description/${job._id}`); 
  };

  const handleLearnMore = (e) => {
    e.stopPropagation();
    navigate(`/description/${job._id}`);
  };

  const handleCardClick = () => {
    navigate(`/description/${job._id}`);
  };

  // Helper function to get job description
  const getJobDescription = () => {
    // Try different possible property names for description
    return job?.description || 
           job?.jobDescription || 
           job?.job_description ||
           job?.details?.description ||
           'No description available';
  };

  return (
    <div
      className="w-full h-[320px] bg-white border border-gray-200 hover:shadow-sm transition p-4 flex flex-col justify-between"
      onClick={handleCardClick}
    >
      <div>
        <div className="flex flex-col mb-4">
          <div className="mb-3">
            {job?.company?.logo ? (
              <img
                src={job.company.logo}
                alt={job.company.name}
                className="w-12 h-12 object-contain rounded"
              />
            ) : (
              <div className="w-12 h-12 rounded bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
                {job?.company?.name?.charAt(0) || 'C'}
              </div>
            )}
          </div>
          
          <h3 className="text-lg font-bold text-gray-900">
            {job?.title || job?.jobTitle || 'Job Title'}
          </h3>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <Badge className="bg-blue-50 text-blue-700 px-3 py-1 text-sm rounded-md border border-blue-100 hover:bg-blue-100 transition-colors">
            {job?.location || 'Location'}
          </Badge>
          <Badge className="bg-red-50 text-red-700 px-3 py-1 text-sm rounded-md border border-red-100 hover:bg-red-100 transition-colors">
            {job?.experienceLevel || 'Experience'}
          </Badge>
          <Badge className="bg-green-50 text-green-700 px-3 py-1 text-sm rounded-md border border-green-100 hover:bg-green-100 transition-colors">
            {job?.jobType || 'Full-time'}
          </Badge>
        </div>

        <div className="text-sm text-gray-600 line-clamp-4 h-20 overflow-hidden mb-2">
          {getJobDescription()}
        </div>
      </div>

      <div className="flex gap-2 pt-3">
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 flex-1"
          onClick={handleApplyClick}
        >
          Apply now
        </Button>
        <Button
          variant="outline"
          className="border-gray-300 text-gray-700 hover:bg-gray-50 text-sm px-4 py-2 flex-1"
          onClick={handleLearnMore}
        >
          Learn more
        </Button>
      </div>
    </div>
  );
};

export default JobCard;
