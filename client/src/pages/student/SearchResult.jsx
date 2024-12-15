import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import React from "react";
import { Link } from "react-router-dom";
import { Star, ChevronRight } from "lucide-react";

const SearchResult = ({ course }) => {
  const rating = course.rating || 4.5;
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;

  return (
    <Link to={`/course-detail/${course._id}`}>
      <div className="flex items-center gap-4 p-4 rounded-lg hover:bg-gray-100 transition-colors duration-200">
        <div className="relative flex-shrink-0">
          <img
            alt="course-thumbnail"
            className="h-24 w-40 object-cover rounded-lg"
            src={course.courseThumbnail}
          />
          <Badge className="absolute top-1 left-1">{course?.courseLevel}</Badge>
        </div>
        <div className="flex flex-col gap-1 flex-grow">
          <h3 className="font-semibold text-lg">{course.courseTitle}</h3>
          <p className="text-sm text-gray-600 line-clamp-1">
            {course.subTitle}
          </p>
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={course?.creator?.avatar} />
              <AvatarFallback>
                {course?.creator?.name?.slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <p className="text-xs text-gray-500">
              By <span className="font-medium">{course?.creator?.name}</span>
            </p>
          </div>
          <div className="flex items-center mt-1">
            {Array.from({ length: fullStars }).map((_, i) => (
              <Star
                key={`full-star-${i}`}
                className="h-4 w-4 text-yellow-500"
                fill="#fbbf24"
              />
            ))}
            {hasHalfStar && (
              <Star
                key="half-star"
                className="h-4 w-4 text-yellow-500"
                viewBox="0 0 24 24"
                fill="url(#halfStar)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <defs>
                  <linearGradient id="halfStar">
                    <stop offset="50%" stopColor="#fbbf24" />
                    <stop
                      offset="50%"
                      stopColor="transparent"
                      stopOpacity="0"
                    />
                  </linearGradient>
                </defs>
              </Star>
            )}
            <span className="ml-1 text-xs text-gray-500">
              ({rating.toFixed(1)})
            </span>
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-gray-400 ml-auto" />
      </div>
    </Link>
  );
};

export default SearchResult;
