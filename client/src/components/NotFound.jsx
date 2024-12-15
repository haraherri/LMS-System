import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader className="text-center">
          <div className="flex flex-col items-center space-y-4">
            <AlertCircle className="w-16 h-16 text-yellow-500" />
            <CardTitle className="text-4xl font-bold text-gray-800 dark:text-gray-200">
              404 - Page Not Found
            </CardTitle>
          </div>
          <CardDescription className="text-gray-600 dark:text-gray-400 mt-4">
            Oops! It seems like you've stumbled upon a missing piece of the
            puzzle.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-gray-700 dark:text-gray-300 text-center py-4">
          <p className="mb-4">
            The page you're looking for might have been moved, renamed, or
            doesn't exist anymore.
          </p>
          <p>
            Don't worry, let's get you back on track. You can try returning to
            the homepage or using the search bar to find what you're looking
            for.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-center gap-4 mt-4">
          <Button asChild className="w-full sm:w-auto">
            <Link to="/">Go Back to Home</Link>
          </Button>
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link to="/contact">Contact Support</Link>
          </Button>
        </CardFooter>
      </Card>
      <p className="text-gray-500 dark:text-gray-400 mt-8 text-sm">
        © {new Date().getFullYear()} lumins.hz. All rights reserved.
      </p>
    </div>
  );
};

export default NotFound;
