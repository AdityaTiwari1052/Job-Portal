import React from 'react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from './ui/carousel';
import { Button } from './ui/button';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setSearchedQuery } from '@/redux/jobSlice';

const category = [
    "Frontend Developer",
    "Backend Developer",
    "Data Science",
    "Graphic Designer",
    "FullStack Developer"
];

const CategoryCarousel = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Function to handle search based on category
    const searchJobHandler = (query) => {
        dispatch(setSearchedQuery(query));  
        navigate("/browse");
    };

    return (
        <div className="relative w-full max-w-full px-4 mx-auto my-10">
            {/* Carousel Component */}
            <Carousel className="w-full">
                <CarouselContent>
                    {
                        category.map((cat, index) => (
                            <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                                <Button 
                                    onClick={() => searchJobHandler(cat)} 
                                    variant="outline" 
                                    className="rounded-full px-4 py-2 text-sm md:text-base"
                                >
                                    {cat}
                                </Button>
                            </CarouselItem>
                        ))
                    }
                </CarouselContent>

                {/* Fixed Left & Right Arrow Buttons */}
                <CarouselPrevious className="absolute left-2 md:left-4 top-1/2 transform -translate-y-1/2 bg-gray-700 text-white p-3 md:p-4 rounded-full shadow-lg hover:bg-gray-900 z-10" />
                <CarouselNext className="absolute right-2 md:right-4 top-1/2 transform -translate-y-1/2 bg-gray-700 text-white p-3 md:p-4 rounded-full shadow-lg hover:bg-gray-900 z-10" />
            </Carousel>
        </div>
    );
}

export default CategoryCarousel;
