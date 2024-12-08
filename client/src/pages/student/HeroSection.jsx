import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import React from "react";

const HeroSection = () => {
  return (
    <div className="relative bg-gradient-to-br from-blue-400 via-purple-500 to-indigo-600 dark:from-gray-800 dark:via-gray-800 dark:to-gray-900 py-20 md:py-28 px-4 text-center">
      <div className="absolute inset-0 z-0 opacity-30">
        <img
          src="/banner.jpg"
          alt="Background"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="max-w-5xl mx-auto relative z-10">
        <h1 className="text-white text-4xl md:text-5xl lg:text-6xl font-extrabold mb-8 md:mb-10 bg-clip-text text-transparent bg-gradient-to-r from-blue-200 via-cyan-200 to-white">
          Learn Without Limits: Your Gateway to Endless Knowledge
        </h1>
        <p className="text-gray-200 dark:text-gray-300 text-base md:text-lg mb-10 md:mb-12 font-medium">
          Explore thousands of courses, expand your skillset, and achieve your
          goals with our expert-led training.
        </p>

        <div className="relative rounded-2xl p-6 md:p-8 bg-white/30 dark:bg-gray-900/50 backdrop-filter backdrop-blur-lg shadow-2xl">
          <div
            className="absolute inset-0 bg-white/5 dark:bg-black/5 -z-10 rounded-2xl"
            style={{
              boxShadow:
                "0px 8px 32px -8px rgba(255, 255, 255, 0.25), inset 0px 4px 8px -2px rgba(255, 255, 255, 0.2), inset 0px -4px 8px -2px rgba(255, 255, 255, 0.1)",
            }}
          ></div>
          <form className="flex flex-col md:flex-row items-center gap-4">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 dark:text-gray-400" />
              <Input
                type="text"
                placeholder="Search for your next learning adventure..."
                className="pl-12 pr-4 py-3 w-full border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 text-base bg-gray-100 dark:bg-gray-700/50"
              />
            </div>
            <Button
              type="submit"
              className="w-full md:w-auto bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-3 text-base rounded-lg font-medium whitespace-nowrap"
            >
              Search
            </Button>
          </form>
          <div className="mt-6 text-center">
            <span className="text-gray-600 dark:text-gray-400 text-sm">
              Not sure where to start? Explore our
            </span>
            <Link
              to="/courses"
              className="text-blue-600 dark:text-blue-400 hover:underline ml-1 text-sm font-medium"
            >
              course catalog
              <ChevronRight className="inline-block w-4 h-4 ml-0.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
