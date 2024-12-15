import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetPurchasedCoursesQuery } from "@/features/api/purchaseApi";
import { DollarSign, ShoppingCart, TrendingUp } from "lucide-react"; // Import icons
import React from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const Dashboard = () => {
  const { data, isLoading, isError } = useGetPurchasedCoursesQuery();

  if (isLoading)
    return <div className="p-8 text-center">Loading dashboard...</div>;
  if (isError)
    return (
      <div className="p-8 text-center text-red-500">
        Error loading dashboard
      </div>
    );

  const purchasedCourses = data?.purchasedCourses || [];

  const courseData = purchasedCourses.map((course) => ({
    name: course.courseId.courseTitle,
    price: course.courseId.coursePrice,
  }));

  const totalSales = purchasedCourses.length;
  const totalRevenue = purchasedCourses.reduce(
    (acc, course) => acc + course.courseId.coursePrice,
    0
  );

  const averagePrice =
    totalSales > 0 ? (totalRevenue / totalSales).toFixed(2) : 0;

  return (
    <div className="p-8 space-y-8">
      <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6">
        Dashboard Overview
      </h2>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {/* Total Sales Card */}
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium">Total Sales</CardTitle>
            <ShoppingCart className="h-5 w-5 opacity-75" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalSales}</div>
            <p className="text-sm opacity-75">Total courses sold</p>
          </CardContent>
        </Card>

        {/* Revenue Card */}
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-5 w-5 opacity-75" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₹{totalRevenue}</div>
            <p className="text-sm opacity-75">Total earnings</p>
          </CardContent>
        </Card>

        {/* Average Price Card */}
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium">Average Price</CardTitle>
            <TrendingUp className="h-5 w-5 opacity-75" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₹{averagePrice}</div>
            <p className="text-sm opacity-75">Per course</p>
          </CardContent>
        </Card>
      </div>

      {/* Sales Chart */}
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">
            Revenue Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={courseData}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis
                dataKey="name"
                stroke="#6b7280"
                angle={-45}
                textAnchor="end"
                height={70}
                interval={0}
                tick={{ fontSize: 12 }}
              />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                }}
                formatter={(value) => [`₹${value}`, "Price"]}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke="#4F46E5"
                fillOpacity={1}
                fill="url(#colorPrice)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
