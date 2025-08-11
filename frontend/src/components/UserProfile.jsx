import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { X, Briefcase, GraduationCap, Award, BookOpen, MapPin, Calendar, Link2 } from 'lucide-react';
import ProfileHeader from './CleanEditProfile/ProfileHeader';
import ProfileSidebar from './CleanEditProfile/ProfileSidebar';
import apiClient from '../utils/apiClient';
import { toast } from 'sonner';

// Helper components for each section
const formatDate = (dateString) => {
  if (!dateString) return 'Present';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  } catch (e) {
    return dateString; // Return as is if date parsing fails
  }
};

const ExperienceSection = ({ experiences = [] }) => {
  const expList = Array.isArray(experiences) ? experiences : [];
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Briefcase className="h-5 w-5" /> Experience
      </h3>
      {expList.length === 0 ? (
        <p className="text-gray-500 text-sm">No experience added yet</p>
      ) : (
        <div className="space-y-6">
          {expList.map((exp, index) => (
            <div key={index} className="border-l-2 border-blue-500 pl-4 py-1">
              <div className="flex justify-between">
                <div>
                  <h4 className="font-medium">{exp.title || 'Untitled Position'}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{exp.company || 'Company not specified'}</p>
                </div>
                <div className="text-sm text-gray-500">
                  {exp.startDate ? formatDate(exp.startDate) : ''} - {' '}
                  {exp.current ? 'Present' : (exp.endDate ? formatDate(exp.endDate) : '')}
                </div>
              </div>
              {exp.location && (
                <div className="flex items-center text-sm text-gray-500 mt-1">
                  <MapPin className="h-4 w-4 mr-1" /> {exp.location}
                </div>
              )}
              {exp.description && (
                <p className="mt-2 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
                  {exp.description}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const EducationSection = ({ education = [] }) => {
  const eduList = Array.isArray(education) ? education : [];
  
  return (
    <div className="space-y-4 mt-8">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <GraduationCap className="h-5 w-5" /> Education
      </h3>
      {eduList.length === 0 ? (
        <p className="text-gray-500 text-sm">No education information available</p>
      ) : (
        <div className="space-y-4">
          {eduList.map((edu, index) => (
            <div key={index} className="border-l-2 border-green-500 pl-4 py-1">
              <div className="flex justify-between">
                <div>
                  <h4 className="font-medium">
                    {edu.degree || 'Degree'} {edu.field ? `in ${edu.field}` : ''}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{edu.school || 'Institution not specified'}</p>
                </div>
                <div className="text-sm text-gray-500">
                  {edu.startDate ? new Date(edu.startDate).getFullYear() : ''}
                  {edu.endDate || edu.current ? ' - ' : ''}
                  {edu.current ? 'Present' : (edu.endDate ? new Date(edu.endDate).getFullYear() : '')}
                </div>
              </div>
              {edu.grade && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Grade: {edu.grade}</p>
              )}
              {edu.description && (
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 whitespace-pre-line">
                  {edu.description}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const SkillsSection = ({ skills = [] }) => {
  const skillsList = Array.isArray(skills) ? skills : [];
  
  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
        <BookOpen className="h-5 w-5" /> Skills & Expertise
      </h3>
      {skillsList.length === 0 ? (
        <p className="text-gray-500 text-sm">No skills added yet</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {skillsList.map((skill, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 text-sm rounded-full"
            >
              {typeof skill === 'string' ? skill : (skill.name || skill.skill || 'Skill')}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

const CertificationsSection = ({ certifications = [] }) => {
  const certList = Array.isArray(certifications) ? certifications : [];
  
  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
        <Award className="h-5 w-5" /> Certifications
      </h3>
      {certList.length === 0 ? (
        <p className="text-gray-500 text-sm">No certifications added yet</p>
      ) : (
        <div className="space-y-4">
          {certList.map((cert, index) => (
            <div key={index} className="border-l-2 border-purple-500 pl-4 py-1">
              <h4 className="font-medium">{cert.name || 'Unnamed Certification'}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {cert.issuingOrganization || 'Issuing organization not specified'}
              </p>
              <div className="flex items-center text-sm text-gray-500 mt-1">
                <Calendar className="h-4 w-4 mr-1" />
                {cert.issueDate ? formatDate(cert.issueDate) : 'Date not specified'}
                {cert.expirationDate && ` - ${formatDate(cert.expirationDate)}`}
              </div>
              {cert.credentialUrl && (
                <a 
                  href={cert.credentialUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm flex items-center mt-1"
                >
                  <Link2 className="h-3 w-3 mr-1" /> View Credential
                </a>
              )}
              {cert.credentialId && (
                <p className="text-xs text-gray-500 mt-1">Credential ID: {cert.credentialId}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const AboutSection = ({ about, headline }) => {
  const aboutText = about || 'No about information available';
  
  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-3">About</h3>
      {headline && (
        <p className="text-gray-700 dark:text-gray-300 font-medium mb-3">{headline}</p>
      )}
      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
        {aboutText}
      </p>
    </div>
  );
};

const UserProfile = ({ onClose, isMobile = false }) => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const handleClose = () => {
    if (isMobile) {
      navigate(-1);
    } else if (onClose) {
      onClose();
    } else {
      navigate(-1);
    }
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get(`/api/users/profile/${username}`);
        console.log('Profile API Response:', response.data); // Debug log
        setUser(response.data.user || response.data);
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError('Failed to load user profile');
        toast.error('Failed to load user profile');
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchUserProfile();
    }
  }, [username]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h2 className="text-2xl font-bold mb-4">User not found</h2>
        <Button onClick={() => navigate('/')}>Back to Home</Button>
      </div>
    );
  }

  const profile = user.profile || {};
  const aboutInfo = typeof profile.about === 'string' ? { bio: profile.about } : (profile.about || {});
  
  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content Area */}
          <div className="w-full lg:w-2/3 space-y-6">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleClose}
                    className="mr-2"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                  <h2 className="text-xl font-semibold">Profile</h2>
                </div>
              </div>
              
              {/* Profile Header Content */}
              <div className="p-6">
                <ProfileHeader 
                  user={user} 
                  loading={loading} 
                  onEdit={null}
                  onCancel={handleClose}
                  isReadOnly={true}
                />
              </div>
            </div>
            
            {/* About Section */}
            {(aboutInfo.bio || aboutInfo.headline) && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <AboutSection 
                  about={aboutInfo.bio || aboutInfo.about} 
                  headline={aboutInfo.headline} 
                />
              </div>
            )}
            
            {/* Experience Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <ExperienceSection experiences={profile.experience || []} />
            </div>
            
            {/* Education Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <EducationSection education={profile.education || []} />
            </div>
            
            {/* Skills Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <SkillsSection skills={profile.skills || []} />
            </div>
            
            {/* Certifications Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <CertificationsSection certifications={profile.certifications || []} />
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="w-full lg:w-1/3 space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 sticky top-6">
              <ProfileSidebar user={user} isReadOnly={true} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
