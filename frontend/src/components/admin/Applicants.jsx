import React from 'react';
import { useSelector } from 'react-redux';
import Navbar from '../shared/Navbar';
import ApplicantsTable from './ApplicantsTable';

const Applicants = () => {
    const { applications = [] } = useSelector(store => ({
        applications: store.application?.applications || []
    }));

    return (
        <div>
            <Navbar />
            <div className="max-w-7xl mx-auto p-4">
                <h1 className="font-bold text-xl my-5">
                    Applicants {Array.isArray(applications) ? `(${applications.length})` : ''}
                </h1>
                <div className="bg-white p-4 rounded-lg shadow">
                    <ApplicantsTable />
                </div>
            </div>
        </div>
    );
};

export default Applicants;