import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import useGetAllJobs from '@/hooks/useGetAllJobs';
import JobCard from './JobCard';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

const Jobs = () => {
    const { allJobs, isLoading, error } = useSelector(store => {
        console.log('Redux store state:', {
            allJobs: store.job.allJobs,
            isLoading: store.job.isLoading,
            error: store.job.error
        });
        return store.job;
    });
    
    const [currentPage, setCurrentPage] = useState(1);
    const jobsPerPage = 9; // 3 columns x 3 rows
    
    // Fetch jobs when component mounts
    useGetAllJobs();

    // Log when allJobs changes
    useEffect(() => {
        console.log('All jobs updated:', {
            count: allJobs.length,
            jobs: allJobs,
            isLoading,
            error
        });
    }, [allJobs, isLoading, error]);

    // Get current jobs for pagination
    const indexOfLastJob = currentPage * jobsPerPage;
    const indexOfFirstJob = indexOfLastJob - jobsPerPage;
    const currentJobs = allJobs.slice(indexOfFirstJob, indexOfLastJob);
    const totalPages = Math.ceil(allJobs.length / jobsPerPage);

    // Change page
    const paginate = (pageNumber) => setCurrentPage(pageNumber);
    const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
    const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

    // Generate page numbers with ellipsis
    const getPageNumbers = () => {
        const pageNumbers = [];
        const maxVisiblePages = 5;
        
        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) {
                pageNumbers.push(i);
            }
        } else {
            // Always show first page
            pageNumbers.push(1);
            
            // Calculate start and end of the middle section
            let start = Math.max(2, currentPage - 1);
            let end = Math.min(totalPages - 1, currentPage + 1);
            
            // Adjust if we're at the start or end
            if (currentPage <= 3) {
                end = 4;
            } else if (currentPage >= totalPages - 2) {
                start = totalPages - 3;
            }
            
            // Add ellipsis after first page if needed
            if (start > 2) {
                pageNumbers.push('...');
            }
            
            // Add middle pages
            for (let i = start; i <= end; i++) {
                if (i > 1 && i < totalPages) {
                    pageNumbers.push(i);
                }
            }
            
            // Add ellipsis before last page if needed
            if (end < totalPages - 1) {
                pageNumbers.push('...');
            }
            
            // Always show last page
            if (totalPages > 1) {
                pageNumbers.push(totalPages);
            }
        }
        
        return pageNumbers;
    };

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, index) => (
                    <div key={index} className="bg-white rounded-lg border border-gray-200 p-5 animate-pulse">
                        <div className="flex items-start space-x-4">
                            <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                            </div>
                        </div>
                        <div className="mt-4 space-y-2">
                            <div className="h-3 bg-gray-100 rounded"></div>
                            <div className="h-3 bg-gray-100 rounded w-5/6"></div>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2">
                            <div className="h-6 bg-gray-100 rounded-full w-20"></div>
                            <div className="h-6 bg-gray-100 rounded-full w-16"></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-8">
                <p className="text-red-500">{error}</p>
            </div>
        );
    }

    if (allJobs.length === 0) {
        return (
            <div className="text-center py-8">
                <p className="text-gray-500">No jobs found. Try adjusting your search filters.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentJobs.map((job, index) => (
                    <motion.div
                        key={job?._id || index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ 
                            duration: 0.2,
                            delay: index * 0.05
                        }}
                        className="flex justify-center"
                    >
                        <JobCard job={job} />
                    </motion.div>
                ))}
            </div>

            {totalPages > 1 && (
                <div className="flex justify-center mt-8">
                    <nav className="flex items-center space-x-1">
                        <button
                            onClick={prevPage}
                            disabled={currentPage === 1}
                            className={`p-2 rounded-md ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </button>

                        {getPageNumbers().map((number, index) => (
                            <button
                                key={index}
                                onClick={() => typeof number === 'number' && paginate(number)}
                                className={`w-10 h-10 flex items-center justify-center rounded-md text-sm font-medium ${
                                    number === currentPage
                                        ? 'bg-blue-600 text-white'
                                        : 'text-gray-700 hover:bg-gray-100'
                                }`}
                                disabled={number === '...'}
                            >
                                {number === '...' ? <MoreHorizontal className="h-4 w-4" /> : number}
                            </button>
                        ))}

                        <button
                            onClick={nextPage}
                            disabled={currentPage === totalPages}
                            className={`p-2 rounded-md ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
                        >
                            <ChevronRight className="h-5 w-5" />
                        </button>
                    </nav>
                </div>
            )}
        </div>
    );
};

export default Jobs;