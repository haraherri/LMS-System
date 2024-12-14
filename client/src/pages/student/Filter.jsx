import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

import React, { useState } from "react";

const categories = [
  { id: "Web Development", label: "Web Development" },
  { id: "Mobile Development", label: "Mobile Development" },
  { id: "Data Science", label: "Data Science" },
  { id: "Machine Learning", label: "Machine Learning" },
  { id: "Artificial Intelligence", label: "Artificial Intelligence" },
  { id: "Cybersecurity", label: "Cybersecurity" },
  { id: "Cloud Computing", label: "Cloud Computing" },
  { id: "DevOps", label: "DevOps" },
  { id: "Game Development", label: "Game Development" },
  { id: "UI/UX Design", label: "UI/UX Design" },
  { id: "Digital Marketing", label: "Digital Marketing" },
  { id: "Business Analytics", label: "Business Analytics" },
  { id: "Project Management", label: "Project Management" },
];

const Filter = ({ handleFilterChange }) => {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [sortByPrice, setSortByPrice] = useState("");

  const handleCategoryChange = (categoryId) => {
    setSelectedCategories((prev) => {
      const newCategories = prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId];

      handleFilterChange(newCategories, sortByPrice);
      return newCategories;
    });
  };

  const handleSortByPriceChange = (selectedValue) => {
    setSortByPrice(selectedValue);
    handleFilterChange(selectedCategories, selectedValue);
  };
  return (
    <div className="w-full md:w-[20%]">
      <div className="flex items-center justify-between">
        <h1 className="font-semibold text-lg md:text-xl">Filter Options</h1>
        <Select onValueChange={handleSortByPriceChange}>
          <SelectTrigger>
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Sort by price</SelectLabel>
              <SelectItem value="low">Low to High</SelectItem>
              <SelectItem value="high">High to Low</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <Separator className="my-4" />
      <div>
        <h1 className="font-semibold mb-2">CATEGORIES</h1>
        {categories.map((category) => (
          <div className="flex items-center space-x-2 my-2" key={category.id}>
            <Checkbox
              id={category.id}
              onCheckedChange={() => handleCategoryChange(category.id)}
            />

            <Label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              {" "}
              {category.label}{" "}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Filter;
