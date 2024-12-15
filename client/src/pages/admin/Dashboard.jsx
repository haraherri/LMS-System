import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetPurchasedCoursesQuery } from "@/features/api/purchaseApi";
import { DollarSign, ShoppingCart, TrendingUp, BarChart } from "lucide-react";
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
import { motion } from "framer-motion"; // Import framer-motion
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const { data, isLoading, isError } = useGetPurchasedCoursesQuery();

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  if (isError)
    return (
      <div className="flex items-center justify-center h-screen text-red-500">
        <p className="text-lg">
          Oops! Something went wrong loading the dashboard.
        </p>
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

  // Animation variants
  const cardVariants = {
    offscreen: {
      y: 50,
      opacity: 0,
    },
    onscreen: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        bounce: 0.4,
        duration: 0.8,
      },
    },
  };

  const chartVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 1,
      },
    },
  };

  return (
    <div className="p-8 space-y-8 bg-gray-100 dark:bg-gray-900 min-h-screen">
      <motion.h2
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-3xl font-bold text-gray-800 dark:text-gray-100 flex items-center"
      >
        <BarChart className="mr-2 h-6 w-6 text-blue-500" /> Dashboard Overview
      </motion.h2>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {/* Total Sales Card */}
        <motion.div
          initial="offscreen"
          whileInView="onscreen"
          viewport={{ once: true, amount: 0.8 }}
          variants={cardVariants}
        >
          <Card className="bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-x-4">
              <div className="rounded-full bg-blue-600 p-2">
                <ShoppingCart className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-xl font-medium tracking-wide">
                Total Sales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-extrabold">{totalSales}</div>
              <p className="text-sm text-gray-200">Total courses sold</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Revenue Card */}
        <motion.div
          initial="offscreen"
          whileInView="onscreen"
          viewport={{ once: true, amount: 0.8 }}
          variants={cardVariants}
        >
          <Card className="bg-gradient-to-br from-green-500 to-green-700 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-x-4">
              <div className="rounded-full bg-green-600 p-2">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-xl font-medium tracking-wide">
                Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-extrabold">${totalRevenue}</div>
              <p className="text-sm text-gray-200">Total earnings</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Average Price Card */}
        <motion.div
          initial="offscreen"
          whileInView="onscreen"
          viewport={{ once: true, amount: 0.8 }}
          variants={cardVariants}
        >
          <Card className="bg-gradient-to-br from-purple-500 to-purple-700 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-x-4">
              <div className="rounded-full bg-purple-600 p-2">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-xl font-medium tracking-wide">
                Average Price
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-extrabold">${averagePrice}</div>
              <p className="text-sm text-gray-200">Per course</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Sales Chart */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={chartVariants}
        className="col-span-full"
      >
        <Card className="shadow-lg">
          <CardHeader className="flex justify-between items-center">
            <CardTitle className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
              Revenue Overview
            </CardTitle>
            <Link to="/revenue-report">
              <Button variant="outline" size="sm">
                View Full Report
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="pt-4">
            <ResponsiveContainer width="100%" height={450}>
              <AreaChart data={courseData}>
                <defs>
                  <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="5 5"
                  stroke="#e0e0e0"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  stroke="#6b7280"
                  angle={-30}
                  textAnchor="end"
                  height={80}
                  interval={0}
                  tick={{ fontSize: 14, fill: "#6b7280" }}
                  className="font-medium"
                />
                <YAxis
                  stroke="#6b7280"
                  tick={{ fontSize: 14, fill: "#6b7280" }}
                  tickFormatter={(value) => `$${value}`}
                  className="font-medium"
                  domain={[0, "auto"]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "none",
                    borderRadius: "12px",
                    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                    color: "#f9fafb",
                  }}
                  labelStyle={{
                    color: "#f9fafb",
                    fontSize: 16,
                    fontWeight: "bold",
                  }}
                  itemStyle={{
                    color: "#f9fafb",
                    fontSize: 14,
                    fontWeight: "normal",
                  }}
                  formatter={(value) => [`$${value}`, "Price"]}
                />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke="#8884d8"
                  fillOpacity={1}
                  fill="url(#gradient)"
                  strokeWidth={3}
                  activeDot={{ r: 6 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Dashboard;
