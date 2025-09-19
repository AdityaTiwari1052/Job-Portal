import React, { useEffect, useState } from 'react';
import { Label } from './ui/label';
import { useDispatch } from 'react-redux';
import { setSearchedQuery, setSelectedCategory, setSelectedLocation } from '@/redux/jobSlice';

const categories = [
  "Programming",
  "Data Science",
  "Designing",
  "Networking",
  "Management",
  "Marketing",
  "Cybersecurity"
];

const locations = [
  "Delhi",
  "Mumbai",
  "Bangalore",
  "Chennai",
  "Hyderabad",
  "Pune",
  "Kolkata",
  "Ahmedabad",
  "Jaipur",
  "Noida",
  "Gurgaon",
  "Remote"
];

const FilterCard = () => {
   const [selectedCategories, setSelectedCategories] = useState([]);
   const [selectedLocations, setSelectedLocations] = useState([]);
   const dispatch = useDispatch();

   const handleCategoryChange = (category) => {
     setSelectedCategories(prev =>
       prev.includes(category)
         ? prev.filter(c => c !== category)
         : [...prev, category]
     );
   };

   const handleLocationChange = (location) => {
     setSelectedLocations(prev =>
       prev.includes(location)
         ? prev.filter(l => l !== location)
         : [...prev, location]
     );
   };

   useEffect(() => {
     // Send all selected categories and locations as comma-separated strings
     const categoryString = selectedCategories.join(',');
     const locationString = selectedLocations.join(',');

     dispatch(setSelectedCategory(categoryString));
     dispatch(setSelectedLocation(locationString));
   }, [selectedCategories, selectedLocations, dispatch]);
    
  return (
    <div className='space-y-6'>
      {/* Categories Section */}
      <div>
        <h2 className='font-medium text-gray-800 mb-2'>Categories</h2>
        <div className='space-y-2'>
          {categories.map((category, index) => (
            <div key={`category-${index}`} className='flex items-center space-x-2'>
              <input
                type="checkbox"
                id={`category-${index}`}
                checked={selectedCategories.includes(category)}
                onChange={() => handleCategoryChange(category)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <Label htmlFor={`category-${index}`} className='text-sm text-gray-700'>
                {category}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Location Section */}
      <div>
        <h2 className='font-medium text-gray-800 mb-2'>Location</h2>
        <div className='space-y-2'>
          {locations.map((location, index) => (
            <div key={`location-${index}`} className='flex items-center space-x-2'>
              <input
                type="checkbox"
                id={`location-${index}`}
                checked={selectedLocations.includes(location)}
                onChange={() => handleLocationChange(location)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <Label htmlFor={`location-${index}`} className='text-sm text-gray-700'>
                {location}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Clear Filters Button - Only show when filters are active */}
      {(selectedCategories.length > 0 || selectedLocations.length > 0) && (
        <button 
          onClick={() => {
            setSelectedCategories([]);
            setSelectedLocations([]);
          }}
          className='text-sm text-blue-600 hover:text-blue-800 font-medium mt-2 block'
        >
          Clear all filters
        </button>
      )}
    </div>
  );
};

export default FilterCard;