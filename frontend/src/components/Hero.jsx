import React from "react";
import { assets } from "../assets/assets";

const Hero = () => {
  return (
    <div className="container 2xl:px-20 mx-auto my-10">
      {/* Gradient background */}
      <div className="bg-gradient-to-r from-cyan-600 via-blue-800 to-violet-900 text-white p-10 rounded-2xl shadow-lg text-center">
        {/* Heading */}
        <h2 className="text-3xl md:text-4xl font-bold mb-2">
          Over <span className="text-white">10,000+ jobs</span> to apply
        </h2>
        {/* Subtitle */}
        <p className="text-sm md:text-base text-gray-200 mb-6 max-w-2xl mx-auto">
          Your Next Big Career Move Starts Right Here – Explore The Best Job Opportunities
          And Take The First Step Toward Your Future!
        </p>

        {/* Search Box */}
        <div className="flex flex-col md:flex-row items-center gap-2 bg-white rounded-full shadow-lg p-2 max-w-3xl mx-auto">
          {/* Job Search */}
          <div className="flex items-center gap-2 flex-1 px-3">
            <img src={assets.search_icon} alt="Search" className="w-5 h-5" />
            <input
              type="text"
              placeholder="Search for jobs"
              className="flex-1 outline-none text-gray-700"
            />
          </div>
          <span className="hidden md:block w-px h-6 bg-gray-300"></span>
          {/* Location Search */}
          <div className="flex items-center gap-2 flex-1 px-3">
            <img src={assets.location_icon} alt="Location" className="w-5 h-5" />
            <input
              type="text"
              placeholder="Location"
              className="flex-1 outline-none text-gray-700"
            />
          </div>
          {/* Search Button */}
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-full font-medium transition-colors">
            Search
          </button>
        </div>
      </div>

      {/* Trusted by Section */}
      <div className="bg-white shadow-sm rounded-lg mt-6 p-4 flex flex-col md:flex-row items-center justify-center gap-8">
        <span className="text-gray-500 font-medium">Trusted by</span>
        <div className="flex items-center gap-8">
          <img src={assets.microsoft_logo} alt="Microsoft" className="h-6 object-contain" />
          <img src={assets.walmart_logo} alt="Walmart" className="h-6 object-contain" />
          <img src={assets.accenture_logo} alt="Accenture" className="h-6 object-contain" />
        </div>
      </div>
    </div>
  );
};

export default Hero;
