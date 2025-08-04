import React from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarImage } from './ui/avatar';

const LatestJobCards = ({ job }) => {
    const navigate = useNavigate();
    return (
        <div 
            onClick={() => navigate(`/description/${job._id}`)} 
            className='p-5 rounded-md shadow-xl bg-white border border-gray-100 cursor-pointer sm:text-left sm:flex sm:flex-col sm:items-start'
        >
            <div className=" items-center gap-4">
                <Button className="p-6" variant="outline" size="icon">
                    <Avatar>
                        <AvatarImage src={job?.company?.logo} />
                    </Avatar>
                </Button>
                <div>
                    <h1 className='font-medium text-gray-500'>{job?.company?.name}</h1>
                    <p className='text-sm text-gray-500'>India</p>
                </div>
            </div>
            <div className="mt-2">
                <h1 className='font-bold text-[#F83002] my-2'>{job?.title}</h1>
                <p className='text-sm text-gray-600'>{job?.description}</p>
            </div>
            <div className='flex items-center gap-2 mt-4'>
                <Badge className='text-blue-700 font-bold' variant="ghost">{job?.position} Positions</Badge>
                <Badge className='text-[#F83002] font-bold' variant="ghost">{job?.jobType}</Badge>
                <Badge className='text-[#7209b7] font-bold' variant="ghost">{job?.salary} LPA</Badge>
            </div>
        </div>
    );
};

export default LatestJobCards;
