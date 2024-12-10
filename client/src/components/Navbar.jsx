import {
  BookOpen,
  LayoutDashboard,
  LogOut,
  Menu,
  School,
  UserCog,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import DarkMode from "@/DarkMode";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Separator } from "@radix-ui/react-dropdown-menu";
import { Link, useNavigate } from "react-router-dom";
import { useLogoutUserMutation } from "@/features/api/authApi";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const Navbar = () => {
  const { user } = useSelector((state) => state.auth);
  const [logoutUser, { data, isSuccess }] = useLogoutUserMutation();
  const navigate = useNavigate();
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const logoutHandler = async () => {
    await logoutUser();
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success(data.message || "Logged out successfully!");
      navigate("/login");
    }
  }, [isSuccess]);

  return (
    <div className="h-16 dark:bg-[#0A0A0A] bg-white border-b dark:border-b-gray-800 border-b-gray-200 fixed top-0 left-0 right-0 duration-300 z-10">
      <div className="max-w-7xl mx-auto hidden md:flex justify-between items-center gap-10 h-full">
        <div className="flex items-center gap-2">
          <School size={"30"} />
          <Link to="/">
            <h1 className="hidden md:block font-extrabold text-2xl">
              E-Learning
            </h1>
          </Link>
        </div>
        <div className="flex items-center gap-8">
          {user ? (
            <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
              <PopoverTrigger asChild>
                <div
                  className="cursor-pointer"
                  onMouseEnter={() => setIsPopoverOpen(true)}
                >
                  <Avatar className="h-10 w-10 relative aspect-square">
                    <AvatarImage
                      src={user?.photoUrl || "https://github.com/shadcn.png"}
                      alt={user?.name || "@user"}
                      className="object-cover w-full h-full"
                    />
                    <AvatarFallback>
                      {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </PopoverTrigger>
              <PopoverContent
                className="w-64 rounded-xl border border-gray-200 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md shadow-lg p-3"
                onMouseEnter={() => setIsPopoverOpen(true)}
                onMouseLeave={() => setIsPopoverOpen(false)}
              >
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage
                        src={user?.photoUrl || "https://github.com/shadcn.png"}
                        alt={user?.name || "@user"}
                      />
                      <AvatarFallback>
                        {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-base font-semibold leading-none text-gray-900 dark:text-gray-100">
                        {user?.name || "User"}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {user?.email || "user@example.com"}
                      </p>
                    </div>
                  </div>
                  <Separator className="bg-gray-200 dark:bg-gray-700" />
                  <div className="space-y-2">
                    <Link
                      to="my-learning"
                      onClick={() => setIsPopoverOpen(false)}
                      className="group flex items-center space-x-2 px-3 py-2 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <BookOpen className="h-5 w-5 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                      <span className="group-hover:text-blue-600 dark:group-hover:text-blue-400">
                        My Learning
                      </span>
                    </Link>
                    <Link
                      to="profile"
                      onClick={() => setIsPopoverOpen(false)}
                      className="group flex items-center space-x-2 px-3 py-2 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <UserCog className="h-5 w-5 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                      <span className="group-hover:text-blue-600 dark:group-hover:text-blue-400">
                        Edit Profile
                      </span>
                    </Link>
                    <button
                      className="w-full text-left flex items-center space-x-2 px-3 py-2 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => {
                        logoutHandler();
                        setIsPopoverOpen(false);
                      }}
                    >
                      <LogOut className="h-5 w-5 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                      <span className="group-hover:text-blue-600 dark:group-hover:text-blue-400">
                        Log out
                      </span>
                    </button>
                  </div>
                  {user.role === "instructor" && (
                    <>
                      <Separator className="bg-gray-200 dark:bg-gray-700" />
                      <Link
                        to="/dashboard"
                        onClick={() => setIsPopoverOpen(false)}
                        className="group flex items-center space-x-2 px-3 py-2 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <LayoutDashboard className="h-5 w-5 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                        <span className="group-hover:text-blue-600 dark:group-hover:text-blue-400">
                          Dashboard
                        </span>
                      </Link>
                    </>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => navigate("/login")}>
                Login
              </Button>
              <Button onClick={() => navigate("/login")}>Signup</Button>
            </div>
          )}
          <DarkMode />
        </div>
      </div>
      <div className="flex md:hidden items-center justify-between px-4 h-full">
        <h1 className="font-extrabold text-2xl">E-Learning</h1>
        <MobileNavbar />
      </div>
    </div>
  );
};

export default Navbar;

const MobileNavbar = () => {
  const role = "instructor";
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          size="icon"
          className="rounded-full bg-gray-200 hover:bg-gray-200"
          variant="outline"
        >
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col">
        <SheetHeader className="flex flex-row items-center justify-between mt-2">
          <SheetTitle>E-Learning</SheetTitle>
          <DarkMode />
        </SheetHeader>
        <Separator className="mr-2" />
        <nav className="flex flex-col space-y-4">
          <span>My Learning</span>
          <span>Edit Profile</span>
          <p>Log out</p>
        </nav>
        {role === "instructor" && (
          <SheetFooter>
            <SheetClose asChild>
              <Button type="submit">Dashboard</Button>
            </SheetClose>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
};
