import React from "react";
import { Button } from "./ui/button";
import { Bookmark, Briefcase, DollarSign } from "lucide-react";
import { Avatar, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const Job = ({ job, onViewDetails }) => {
    const navigate = useNavigate();
    const { user } = useSelector(store => store.auth);

    // DEBUGGING: Log the user and job objects to inspect their structure
    console.log("Job Component Debug:", {
        userId: user?._id,
        jobId: job?._id,
        jobCreatedBy: job?.created_by,
        isOwner: user?._id === job?.created_by
    });

    const daysAgoFunction = (mongodbTime) => {
        if (!mongodbTime) return "Unknown";
        const createdAt = new Date(mongodbTime);
        const currentTime = new Date();
        const timeDifference = currentTime - createdAt;
        return Math.floor(timeDifference / (1000 * 60 * 60 * 24));
    };

    if (!job) {
        return <p className="text-center text-gray-500">Job data unavailable</p>;
    }

    return (
        <div className="p-5 rounded-md shadow-md bg-white border border-gray-200 transition-all duration-200 hover:shadow-lg h-full flex flex-col">
            {/* Main content container */}
            <div className="flex flex-col h-full">
                {/* Company and Logo */}
                <div className="flex items-start gap-4 mb-4">
                    <Avatar className="w-14 h-14 flex-shrink-0 border border-gray-200">
                        <AvatarImage 
                            src={job?.company?.logo || "/placeholder-logo.png"} 
                            alt={job?.company?.name || "Company Logo"} 
                            className="object-cover"
                        />
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <h1 className="font-bold text-gray-800 text-lg mb-1 truncate">{job?.title || "Job Title"}</h1>
                        <p className="font-medium text-gray-700 truncate">{job?.company?.name || "Unknown Company"}</p>
                        <p className="text-sm text-gray-500">{job?.location || "Location not specified"}</p>
                    </div>
                </div>
                
                {/* Job Description */}
                <div className="flex-grow mb-4">
                    <p className="text-gray-600 text-sm line-clamp-3">
                        {job?.description || "No description provided."}
                    </p>
                </div>
                
                {/* Job Details */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                        <Briefcase className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">{job?.jobType || 'Full-time'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">{job?.salary ? `${job.salary} LPA` : 'Salary not specified'}</span>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-auto pt-4 border-t border-gray-100">
                    <Button 
                        onClick={onViewDetails || (() => navigate(`/description/${job?._id}`))}
                        variant="outline"
                        size="sm"
                        className="w-full mb-3"
                    >
                        View Details
                    </Button>
                    <div className="flex justify-between items-center text-xs text-gray-500">
                        <span>
                            {daysAgoFunction(job?.createdAt) === 0
                                ? "Posted today"
                                : `Posted ${daysAgoFunction(job?.createdAt)} days ago`}
                        </span>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                            <Bookmark className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Job;
