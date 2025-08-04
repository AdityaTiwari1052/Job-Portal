import React from "react";
import { Button } from "./ui/button";
import { Bookmark } from "lucide-react";
import { Avatar, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { useNavigate } from "react-router-dom";

const Job = ({ job }) => {
    const navigate = useNavigate();

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
        <div className="p-5 rounded-md shadow-md bg-white border border-gray-200 transition-transform duration-200 hover:scale-105 w-full">
            {/* Container for responsiveness */}
            <div className="flex flex-col md:flex-row md:items-start gap-4 w-full">
                
                {/* Left Section: Logo and Company Info */}
                <div className="flex items-center gap-3 md:flex-col md:items-start md:w-1/4">
                    <Avatar className="w-14 h-14">
                        <AvatarImage 
                            src={job?.company?.logo || "/placeholder-logo.png"} 
                            alt={job?.company?.name || "Company Logo"} 
                        />
                    </Avatar>
                    <div>
                        <h1 className="font-medium text-gray-700">{job?.company?.name || "Unknown Company"}</h1>
                        <p className="text-sm text-gray-500">{job?.location || "Location not specified"}</p>
                    </div>
                </div>

                {/* Right Section: Job Details */}
                <div className="flex-1 w-full">
                    {/* Header with posting date and bookmark */}
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-500">
                            {daysAgoFunction(job?.createdAt) === 0
                                ? "Today"
                                : `${daysAgoFunction(job?.createdAt)} days ago`}
                        </p>
                        <Button variant="outline" className="rounded-full" size="icon">
                            <Bookmark />
                        </Button>
                    </div>

                    {/* Title and description */}
                    <div className="mt-2">
                        <h1 className="font-bold text-gray-700 mb-1">{job?.title || "Job Title Not Available"}</h1>
                        <p className="text-sm text-gray-600 line-clamp-2">{job?.description || "No description provided."}</p>
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap items-center gap-2 mt-4">
                        <Badge className="text-blue-700 font-bold bg-blue-100 px-3 py-1 rounded-md">
                            {job?.position ? `${job.position} Positions` : "Positions: N/A"}
                        </Badge>
                        <Badge className="text-red-700 font-bold bg-red-100 px-3 py-1 rounded-md">
                            {job?.jobType || "Job Type: N/A"}
                        </Badge>
                        <Badge className="text-purple-700 font-bold bg-purple-100 px-3 py-1 rounded-md">
                            {job?.salary ? `${job.salary} LPA` : "Salary: N/A"}
                        </Badge>
                    </div>

                    {/* Buttons */}
                    <div className="flex flex-col sm:flex-row items-stretch gap-3 mt-4 w-full">
                        <Button 
                            onClick={() => navigate(`/description/${job?._id}`)} 
                            variant="outline"
                            className="w-full"
                        >
                            View Details
                        </Button>
                        <Button className="bg-purple-700 text-white w-full hover:bg-purple-800">
                            Save For Later
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Job;
