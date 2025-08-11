import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MapPin, Globe, Edit2 } from 'lucide-react';
import { updateAbout } from '@/redux/profileSlice';

// Selectors
const selectProfile = (state) => state.profile.profile || {};
const selectProfileLoading = (state) => state.profile.loading;
const selectProfileError = (state) => state.profile.error;

const AboutSection = React.memo(({ user, onSave, isCurrentUser = true, isReadOnly = false }) => {
  const dispatch = useDispatch();
  const { toast } = useToast();
  
  console.log('\n=== ABOUT SECTION DEBUG ===');
  console.log('User prop:', JSON.stringify({
    hasUser: !!user,
    userId: user?._id,
    hasProfile: !!user?.profile,
    profileKeys: user?.profile ? Object.keys(user.profile) : 'No profile',
    hasAbout: !!user?.profile?.about,
    aboutType: typeof user?.profile?.about,
    aboutData: user?.profile?.about || 'No about data',
    legacyAbout: user?.about ? 'Present' : 'Not present',
    legacyHeadline: user?.headline ? 'Present' : 'Not present',
    legacyLocation: user?.location ? 'Present' : 'Not present',
    legacyWebsite: user?.website ? 'Present' : 'Not present'
  }, null, 2));

  // Get profile from Redux or use the user prop
  const profileFromRedux = useSelector(selectProfile, shallowEqual);
  const loading = useSelector(selectProfileLoading);
  const error = useSelector(selectProfileError);
  
  useEffect(() => {
    console.log('Redux profile data:', JSON.stringify({
      hasProfile: !!profileFromRedux,
      profileKeys: profileFromRedux ? Object.keys(profileFromRedux) : 'No profile',
      hasAbout: !!profileFromRedux?.about,
      aboutData: profileFromRedux?.about || 'No about data in Redux',
      loading,
      error
    }, null, 2));
  }, [profileFromRedux, loading, error]);

  // Use the user prop if available, otherwise use the Redux state
  const profile = user?.profile || profileFromRedux || user || {};

  console.log('Profile data in AboutSection:', {
    hasProfile: !!user?.profile,
    aboutType: typeof user?.about,
    profileAboutType: typeof profile?.about,
    fullProfile: profile
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Normalize the about data
  const aboutData = useMemo(() => {
    console.log('Normalizing about data...');
    
    // Try to get about data from different possible locations
    const aboutFromProfile = user?.profile?.about;
    const aboutFromRoot = {
      bio: user?.about,
      headline: user?.headline,
      location: user?.location,
      website: user?.website
    };
    
    // Log the sources
    console.log('About from profile.about:', aboutFromProfile);
    console.log('About from root level:', aboutFromRoot);
    
    // Merge the data with profile.about taking precedence
    const normalizedAbout = {
      bio: '',
      headline: '',
      location: '',
      website: '',
      ...(aboutFromRoot || {}),
      ...(aboutFromProfile || {})
    };
    
    console.log('Normalized about data:', normalizedAbout);
    return normalizedAbout;
  }, [user]);

  console.log('Processed about data:', aboutData);

  const [formData, setFormData] = useState({
    bio: '',
    headline: '',
    location: '',
    website: ''
  });

  // Initialize form data when about data changes
  useEffect(() => {
    console.log('Initializing form data with about:', aboutData);
    setFormData({
      bio: aboutData.bio || '',
      headline: aboutData.headline || '',
      location: aboutData.location || '',
      website: aboutData.website || ''
    });
  }, [aboutData]);

  // Check if there's any content to display
  const hasContent = useMemo(() => 
    aboutData?.bio || aboutData?.headline || aboutData?.location || aboutData?.website,
  [aboutData]);

  // Handle form input changes
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  // Handle form submission
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    try {
      console.log('Submitting form data:', formData);
      await dispatch(updateAbout({
        about: {
          bio: formData.bio,
          headline: formData.headline,
          location: formData.location,
          website: formData.website
        }
      })).unwrap();
      
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      setIsDialogOpen(false);
      
      // Call the parent's onSave if provided
      if (onSave) {
        onSave();
      }
    } catch (error) {
      console.error('Error updating about:', error);
      toast({
        title: 'Error updating profile',
        description: error.message || 'Failed to update profile',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  }, [dispatch, formData, toast, onSave]);

  // Memoize the rendered content to prevent unnecessary re-renders
  const renderedContent = useMemo(() => {
    if (!hasContent) {
      return <p className="text-gray-500 italic">No information added yet</p>;
    }

    return (
      <div className="space-y-4">
        {aboutData.headline && (
          <p className="text-lg font-medium">{aboutData.headline}</p>
        )}
        {aboutData.bio && (
          <p className="text-gray-600 whitespace-pre-line">{aboutData.bio}</p>
        )}
        {(aboutData.location || aboutData.website) && (
          <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-600">
            {aboutData.location && (
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{aboutData.location}</span>
              </div>
            )}
            {aboutData.website && (
              <div className="flex items-center">
                <Globe className="h-4 w-4 mr-1" />
                <a 
                  href={aboutData.website.startsWith('http') ? aboutData.website : `https://${aboutData.website}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {aboutData.website.replace(/^https?:\/\//, '')}
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }, [aboutData, hasContent]);

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>About</CardTitle>
            <CardDescription>
              {hasContent ? 'Your professional summary and contact information' : 'Add information about yourself'}
            </CardDescription>
          </div>
          {isCurrentUser && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsDialogOpen(true)}
              className="text-blue-600 hover:text-blue-700"
            >
              <Edit2 className="h-4 w-4 mr-1" />
              {hasContent ? 'Edit' : 'Add'}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        ) : error ? (
          <p className="text-red-500">Error loading about information</p>
        ) : (
          renderedContent
        )}
      </CardContent>

      {/* Edit Dialog */}
      {isDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Edit About</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="headline">Headline</Label>
                  <Input
                    id="headline"
                    name="headline"
                    value={formData.headline}
                    onChange={handleChange}
                    placeholder="E.g., Senior Software Engineer"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="bio">About</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Tell others about yourself..."
                    rows={5}
                    className="mt-1"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="City, Country"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      name="website"
                      type="url"
                      value={formData.website}
                      onChange={handleChange}
                      placeholder="https://example.com"
                      className="mt-1"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
});

AboutSection.displayName = 'AboutSection';

export default AboutSection;
