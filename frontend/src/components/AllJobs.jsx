import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import Job from './Job';
import JobDescription from './JobDescription';

const AllJobs = ({ onJobSelect, selectedJobId, selectedJobData }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({ jobType: 'all', location: '' });
    
    const { allJobs = [] } = useSelector(store => store.job);
    const { user } = useSelector(store => store.auth);

    const filteredJobs = allJobs.filter(job => {
        const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           job.company?.name.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesFilters = Object.entries(filters).every(([key, value]) => {
            if (!value || value === 'all') return true;
            return job[key]?.toLowerCase() === value.toLowerCase();
        });
        
        return matchesSearch && matchesFilters;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold">All Jobs</h1>
                <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-2">
                    <Input
                        placeholder="Search jobs..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full sm:w-64"
                    />
                    <div className="flex gap-2">
                        <Select 
                            value={filters.jobType} 
                            onValueChange={(value) => setFilters({...filters, jobType: value})}
                        >
                            <SelectTrigger className="w-full sm:w-32">
                                <SelectValue placeholder="Job Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="full-time">Full-time</SelectItem>
                                <SelectItem value="part-time">Part-time</SelectItem>
                                <SelectItem value="contract">Contract</SelectItem>
                                <SelectItem value="internship">Internship</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select 
                            value={filters.location} 
                            onValueChange={(value) => setFilters({...filters, location: value})}
                        >
                            <SelectTrigger className="w-full sm:w-32">
                                <SelectValue placeholder="Location" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">All Locations</SelectItem>
                                <SelectItem value="remote">Remote</SelectItem>
                                <SelectItem value="onsite">On-site</SelectItem>
                                <SelectItem value="hybrid">Hybrid</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                {filteredJobs.length > 0 ? (
                    filteredJobs.map((job) => {
                        const jobData = {
                            ...job,
                            company: job.company || {},
                            description: job.description || "No description provided"
                        };
                        
                        return (
                            <Job 
                                key={job._id} 
                                job={jobData}
                                isSelected={selectedJobId === job._id}
                                onClick={() => onJobSelect(job._id, job)}
                            />
                        );
                    })
                ) : (
                    <div className="text-center py-8">
                        <p className="text-muted-foreground">No jobs found</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AllJobs;
