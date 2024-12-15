import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Search, X } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import Filter from "./Filter";
import SearchResult from "./SearchResult";
import { useGetSearchCourseQuery } from "@/features/api/courseApi";
import { Input } from "@/components/ui/input";

const SearchPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryParam = searchParams.get("query");
  const [query, setQuery] = useState(queryParam || "");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [sortByPrice, setSortByPrice] = useState("");
  const searchInputRef = useRef(null);

  const { data, isLoading } = useGetSearchCourseQuery({
    searchQuery: query,
    categories: selectedCategories,
    sortByPrice,
  });
  const isEmpty = !isLoading && data?.courses.length === 0;

  const handleFilterChange = (categories, price) => {
    setSelectedCategories(categories);
    setSortByPrice(price);
  };

  const handleSearchInputChange = (event) => {
    setQuery(event.target.value);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/search?query=${query}`);
  };

  useEffect(() => {
    setQuery(queryParam || "");
    setSelectedCategories([]);
    setSortByPrice("");
  }, [queryParam]);

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <Filter handleFilterChange={handleFilterChange} />
        </div>
        <div className="md:col-span-3">
          <form
            onSubmit={handleSearch}
            className="w-full flex items-center gap-2 mb-6"
          >
            <Input
              type="text"
              placeholder="Search for courses..."
              value={query}
              onChange={handleSearchInputChange}
              className="focus-visible:ring-blue-500"
              ref={searchInputRef}
            />
            <Button type="submit" variant="outline" size="icon">
              <Search className="h-4 w-4" />
            </Button>
          </form>
          <h1 className="font-bold text-2xl md:text-3xl mb-4">
            Search Results for:{" "}
            <span className="text-blue-600">
              "{queryParam || "All Courses"}"
            </span>
          </h1>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => <CourseSkeleton key={i} />)
          ) : isEmpty ? (
            <CourseNotFound />
          ) : (
            <div className="divide-y divide-gray-200">
              {data?.courses?.map((course) => (
                <SearchResult key={course._id} course={course} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;

const CourseNotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] bg-gray-50 rounded-lg  p-6">
      <AlertCircle className="text-red-500 h-16 w-16 mb-4" />
      <h1 className="font-bold text-2xl md:text-3xl text-gray-800 mb-2">
        Course Not Found
      </h1>
      <p className="text-lg text-gray-600 text-center mb-4">
        Sorry, we couldn't find any courses matching your search criteria.
      </p>
      <Link to="/" className="italic">
        <Button variant="link">Browse All Courses</Button>
      </Link>
    </div>
  );
};

const CourseSkeleton = () => {
  return (
    <div className="flex items-center gap-4 p-4">
      <div className="relative flex-shrink-0">
        <Skeleton className="h-24 w-40 rounded-lg" />
      </div>
      <div className="flex flex-col gap-1 flex-grow">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex items-center gap-2 mt-1">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-4 w-1/3" />
        </div>
        <Skeleton className="h-4 w-16 mt-1" />
      </div>
    </div>
  );
};
