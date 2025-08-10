import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Star, StarHalf } from 'lucide-react';

const proficiencyLevels = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'expert', label: 'Expert' }
];

const commonSkills = [
  'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'TypeScript', 'HTML/CSS',
  'SQL', 'Git', 'Docker', 'AWS', 'MongoDB', 'PostgreSQL', 'Express.js', 'Next.js',
  'Vue.js', 'Angular', 'Spring Boot', 'Django', 'Flask', 'Kubernetes', 'GraphQL',
  'Redis', 'Elasticsearch', 'Jenkins', 'Terraform', 'Linux', 'Bash', 'C++', 'C#',
  'Go', 'Rust', 'Swift', 'Kotlin', 'PHP', 'Ruby', 'Scala', 'R', 'MATLAB'
];

const SkillsForm = ({
  initialData = {},
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const [selectedSkill, setSelectedSkill] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      name: initialData.name || '',
      level: initialData.level || 'intermediate',
      experience: initialData.experience || '1-3',
      endorsements: initialData.endorsements || 0,
      featured: initialData.featured || false
    }
  });

  const level = watch('level');
  const experience = watch('experience');
  const featured = watch('featured');

  // Update form values when initialData changes
  useEffect(() => {
    setValue('name', initialData.name || '');
    setValue('level', initialData.level || 'intermediate');
    setValue('experience', initialData.experience || '1-3');
    setValue('endorsements', initialData.endorsements || 0);
    setValue('featured', initialData.featured || false);
    setSelectedSkill(initialData.name || '');
  }, [initialData, setValue]);

  const handleSkillChange = (e) => {
    const value = e.target.value;
    setSelectedSkill(value);
    setValue('name', value);
    
    if (value.length > 1) {
      const filtered = commonSkills
        .filter(skill => 
          skill.toLowerCase().includes(value.toLowerCase())
        )
        .slice(0, 5);
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const selectSuggestion = (suggestion) => {
    setSelectedSkill(suggestion);
    setValue('name', suggestion);
    setShowSuggestions(false);
  };

  const handleLevelChange = (value) => {
    setValue('level', value);
  };

  const handleExperienceChange = (value) => {
    setValue('experience', value);
  };

  const toggleFeatured = () => {
    setValue('featured', !featured);
  };

  const handleFormSubmit = (data) => {
    // Format the data before submitting
    const formattedData = {
      ...data,
      // Ensure the skill name is properly capitalized
      name: data.name.split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      ).join(' ')
    };
    onSubmit(formattedData);
  };

  const renderProficiencyIndicator = () => {
    const levelIndex = proficiencyLevels.findIndex(l => l.value === level);
    return (
      <div className="flex items-center mt-1">
        {proficiencyLevels.map((_, index) => (
          <span key={index} className="flex items-center">
            {index <= levelIndex ? (
              <Star className="h-5 w-5 text-yellow-400 fill-current" />
            ) : (
              <Star className="h-5 w-5 text-gray-300 fill-current" />
            )}
          </span>
        ))}
        <span className="ml-2 text-sm text-gray-600">
          {proficiencyLevels.find(l => l.value === level)?.label}
        </span>
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="skill">Skill Name *</Label>
          <div className="relative">
            <Input
              id="skill"
              value={selectedSkill}
              onChange={handleSkillChange}
              placeholder="e.g., JavaScript, Python, React"
              className="w-full"
              required
            />
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => selectSuggestion(suggestion)}
                  >
                    {suggestion}
                  </div>
                ))}
              </div>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Start typing to see suggestions or enter a custom skill
          </p>
        </div>

        <div className="space-y-2">
          <Label>Proficiency Level</Label>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Beginner</span>
              <span className="text-sm font-medium">Expert</span>
            </div>
            <div className="px-2">
              <Slider
                defaultValue={[proficiencyLevels.findIndex(l => l.value === (initialData.level || 'intermediate'))]}
                max={proficiencyLevels.length - 1}
                step={1}
                onValueChange={(value) => handleLevelChange(proficiencyLevels[value[0]].value)}
                className="w-full"
              />
            </div>
            {renderProficiencyIndicator()}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Years of Experience</Label>
          <div className="grid grid-cols-3 gap-2">
            {['<1', '1-3', '3-5', '5-10', '10+'].map((exp) => (
              <button
                key={exp}
                type="button"
                onClick={() => handleExperienceChange(exp)}
                className={`px-3 py-2 text-sm rounded-md border ${
                  experience === exp
                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                {exp} {exp !== '10+' ? 'years' : 'years+'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={toggleFeatured}
              className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800"
            >
              <div className={`w-5 h-5 rounded border flex items-center justify-center ${
                featured ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
              }`}>
                {featured && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span>Feature this skill on my profile</span>
            </button>
          </div>
          
          <div className="text-sm text-gray-500">
            {featured ? (
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                <Star className="h-3.5 w-3.5 mr-1 text-blue-500" />
                Featured
              </Badge>
            ) : null}
          </div>
        </div>
      </div>
      
      <div className="flex justify-end gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Skill'}
        </Button>
      </div>
    </form>
  );
};

export default SkillsForm;
