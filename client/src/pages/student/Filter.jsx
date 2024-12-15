import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import {
  SlidersHorizontal,
  ChevronDown,
  Filter as FilterIcon,
  XCircle,
} from "lucide-react";

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
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const handleCategoryChange = (categoryId) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleSortByPriceChange = (selectedValue) => {
    setSortByPrice(selectedValue);
  };

  useEffect(() => {
    handleFilterChange(selectedCategories, sortByPrice);
  }, [selectedCategories, sortByPrice]);

  const clearFilters = () => {
    setSelectedCategories([]);
    setSortByPrice("");
  };

  return (
    <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-[220px] justify-between bg-white"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {(selectedCategories.length > 0 || sortByPrice) && (
            <div className="w-2 h-2 rounded-full bg-red-500 ml-1"></div>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger className="px-4 py-3 hover:no-underline">
              <div className="flex items-center gap-2">
                <FilterIcon size={16} />
                <span className="font-medium">Categories</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="px-4 pb-4">
                {categories.map((category) => (
                  <div
                    className="flex items-center space-x-2 my-2"
                    key={category.id}
                  >
                    <Checkbox
                      id={category.id}
                      onCheckedChange={() => handleCategoryChange(category.id)}
                      checked={selectedCategories.includes(category.id)}
                    />
                    <Label
                      htmlFor={category.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {category.label}
                    </Label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger className="px-4 py-3 hover:no-underline">
              <div className="flex items-center gap-2">
                <FilterIcon size={16} />
                <span className="font-medium">Sort by Price</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="px-4 pb-4">
                <Select
                  onValueChange={handleSortByPriceChange}
                  value={sortByPrice}
                >
                  <SelectTrigger className="w-full h-10 mt-5">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="low">Low to High</SelectItem>
                      <SelectItem value="high">High to Low</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        <div className="flex items-center justify-end px-4 py-2">
          <Button
            variant="link"
            className="text-sm"
            onClick={() => {
              clearFilters();
              setIsFilterOpen(false);
            }}
          >
            <XCircle className="h-4 w-4 mr-1" />
            Clear All
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default Filter;
