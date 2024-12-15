import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button"; // Import Button từ Shadcn UI
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const NotFound = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <Card className="w-[400px]">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-bold text-gray-800">
            404
          </CardTitle>
          <CardDescription className="text-gray-600">
            Page Not Found
          </CardDescription>
        </CardHeader>
        <CardContent className="text-gray-700 text-center py-4">
          Oops! The page you're looking for doesn't exist.
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button asChild>
            <Link to="/">Go Back to Home</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default NotFound;
