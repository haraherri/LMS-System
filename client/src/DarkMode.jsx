import React, { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "./components/ui/button";
import { Moon, Sun, Monitor, Settings } from "lucide-react";
import { useTheme } from "./components/ThemeProvider";

const DarkMode = () => {
  const { setTheme, theme } = useTheme();
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          onMouseEnter={() => setIsPopoverOpen(true)}
        >
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-40 py-3" // Giảm chiều rộng từ w-64 xuống w-56
        align="center"
        sideOffset={5}
        onMouseEnter={() => setIsPopoverOpen(true)}
        onMouseLeave={() => setIsPopoverOpen(false)}
      >
        <Button
          variant={theme === "light" ? "secondary" : "ghost"}
          size="sm"
          className="w-full justify-start py-3 rounded-md"
          onClick={() => {
            setTheme("light");
            setIsPopoverOpen(false);
          }}
        >
          <Sun className="h-5 w-5 mr-2" />
          Light
        </Button>
        <Button
          variant={theme === "dark" ? "secondary" : "ghost"}
          size="sm"
          className="w-full justify-start py-3 my-1 rounded-md"
          onClick={() => {
            setTheme("dark");
            setIsPopoverOpen(false);
          }}
        >
          <Moon className="h-5 w-5 mr-2" />
          Dark
        </Button>
        <Button
          variant={theme === "system" ? "secondary" : "ghost"}
          size="sm"
          className="w-full justify-start py-3 rounded-md"
          onClick={() => {
            setTheme("system");
            setIsPopoverOpen(false);
          }}
        >
          <Monitor className="h-5 w-5 mr-2" />
          System
        </Button>
      </PopoverContent>
    </Popover>
  );
};

export default DarkMode;
