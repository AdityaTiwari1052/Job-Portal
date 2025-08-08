import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Download } from 'lucide-react';
import { format } from 'date-fns';

const ApplicantsList = ({ applicants, onBack }) => {
    const handleDownloadResume = (resumeUrl) => {
        if (resumeUrl) {
            window.open(resumeUrl, '_blank');
        } else {
            alert('No resume available for this applicant');
        }
    };

    if (applicants.length === 0) {
        return (
            <div className="text-center py-8">
                <p className="text-muted-foreground">No applicants found for this job.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Button 
                variant="outline" 
                onClick={onBack}
                className="mb-4"
            >
                ← Back to Jobs
            </Button>
            
            <h2 className="text-xl font-semibold mb-4">Applicants</h2>
            
            <div className="space-y-4">
                {applicants.map((application) => (
                    <div key={application._id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-4">
                                <Avatar className="h-12 w-12">
                                    <AvatarImage src={application.applicant?.profilePhoto} alt={application.applicant?.name} />
                                    <AvatarFallback>
                                        {application.applicant?.name?.charAt(0) || 'A'}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="font-medium">{application.applicant?.name || 'Anonymous'}</h3>
                                    <p className="text-sm text-muted-foreground">
                                        {application.applicant?.email || 'No email provided'}
                                    </p>
                                    {application.appliedAt && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Applied on {format(new Date(application.appliedAt), 'MMM d, yyyy')}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleDownloadResume(application.resume)}
                                disabled={!application.resume}
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Resume
                            </Button>
                        </div>
                        
                        {application.coverLetter && (
                            <div className="mt-3 pt-3 border-t">
                                <h4 className="text-sm font-medium mb-1">Cover Letter</h4>
                                <p className="text-sm text-muted-foreground whitespace-pre-line">
                                    {application.coverLetter}
                                </p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ApplicantsList;
