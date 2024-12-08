import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useLoginUserMutation,
  useRegisterUserMutation,
} from "@/features/api/authApi";
import {
  BookOpenCheck,
  KeyRound,
  Loader2,
  Lock,
  LogIn,
  Mail,
  User,
  UserPlus,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Login = () => {
  const [signupInput, setSignupInput] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loginInput, setLoginInput] = useState({ email: "", password: "" });

  const [
    registerUser,
    {
      data: registerData,
      error: registerError,
      isLoading: registerIsLoading,
      isSuccess: registerIsSuccess,
    },
  ] = useRegisterUserMutation();

  const [
    loginUser,
    {
      data: loginData,
      error: loginError,
      isLoading: loginIsloading,
      isSuccess: loginIsSuccess,
    },
  ] = useLoginUserMutation();

  const navigate = useNavigate();

  const changeInputHandler = (e, type) => {
    const { name, value } = e.target;
    if (type === "signup") {
      setSignupInput({ ...signupInput, [name]: value });
    } else {
      setLoginInput({ ...loginInput, [name]: value });
    }
  };

  const handleRegistration = async (type) => {
    const inputData = type === "signup" ? signupInput : loginInput;
    const action = type === "signup" ? registerUser : loginUser;
    await action(inputData);
  };

  useEffect(() => {
    if (registerIsSuccess && registerData) {
      toast.success(registerData.message || "Signup successfully!");
    }
    if (registerError) {
      toast.error(registerError.data.error || "Signup failed!");
    }
  }, [registerData, registerError, registerIsSuccess]);

  useEffect(() => {
    if (loginIsSuccess && loginData) {
      toast.success(loginData.message || "Login successfully!");
      navigate("/");
    }
    if (loginError) {
      toast.error(loginError.data.error || "Login failed!");
    }
  }, [loginData, loginError, loginIsSuccess]);

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: "url('/login-bg.jpg')", // Chỉ cần thêm dấu / trước tên file
      }}
    >
      <div className="absolute inset-0 bg-white/70 backdrop-blur-sm" />
      <div className="relative w-full max-w-lg p-6 bg-white/90 backdrop-blur-md rounded-xl shadow-2xl space-y-8">
        <div className="flex items-center justify-center">
          <BookOpenCheck className="h-12 w-12 text-blue-500 mr-3" />
          <h2 className="text-3xl font-bold text-gray-800">
            LMS - Learning Management System
          </h2>
        </div>
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-100/50 rounded-lg backdrop-blur-md">
            <TabsTrigger
              value="login"
              className="group relative flex items-center justify-center px-4 py-2 text-gray-700 hover:bg-gray-200/50 focus:z-10 rounded-md transition-all duration-300"
            >
              <span className="flex items-center transition-colors duration-300">
                <LogIn className="mr-2 h-4 w-4" />
                Login
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="signup"
              className="group relative flex items-center justify-center px-4 py-2 text-gray-700 hover:bg-gray-200/50 focus:z-10 rounded-md transition-all duration-300"
            >
              <span className="flex items-center transition-colors duration-300">
                <UserPlus className="mr-2 h-4 w-4" />
                Signup
              </span>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="login" className="p-0 mt-6">
            <Card className="border-none shadow-none bg-transparent">
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-gray-700 flex items-center"
                  >
                    <Mail className="mr-2 h-4 w-4 text-gray-500" />
                    Email Address
                  </Label>
                  <Input
                    type="email"
                    name="email"
                    value={loginInput.email}
                    placeholder="Enter your email"
                    onChange={(e) => changeInputHandler(e, "login")}
                    required={true}
                    className="bg-gray-50/50 border border-gray-300 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    className="text-gray-700 flex items-center"
                  >
                    <KeyRound className="mr-2 h-4 w-4 text-gray-500" />
                    Password
                  </Label>
                  <Input
                    type="password"
                    name="password"
                    value={loginInput.password}
                    placeholder="Enter your password"
                    onChange={(e) => changeInputHandler(e, "login")}
                    required={true}
                    className="bg-gray-50/50 border border-gray-300 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  />
                </div>
              </CardContent>
              <CardFooter className="px-0 pt-6">
                <Button
                  disabled={loginIsloading}
                  onClick={() => handleRegistration("login")}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition-all duration-300"
                >
                  {loginIsloading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please
                      wait...
                    </>
                  ) : (
                    <>
                      <LogIn className="mr-2 h-4 w-4" />
                      Login
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          <TabsContent value="signup" className="p-0 mt-6">
            <Card className="border-none shadow-none bg-transparent">
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="name"
                    className="text-gray-700 flex items-center"
                  >
                    <User className="mr-2 h-4 w-4 text-gray-500" />
                    Full Name
                  </Label>
                  <Input
                    type="text"
                    name="name"
                    value={signupInput.name}
                    onChange={(e) => changeInputHandler(e, "signup")}
                    placeholder="Enter your full name"
                    required={true}
                    className="bg-gray-50/50 border border-gray-300 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-gray-700 flex items-center"
                  >
                    <Mail className="mr-2 h-4 w-4 text-gray-500" />
                    Email Address
                  </Label>
                  <Input
                    type="email"
                    name="email"
                    value={signupInput.email}
                    placeholder="Enter your email"
                    onChange={(e) => changeInputHandler(e, "signup")}
                    required={true}
                    className="bg-gray-50/50 border border-gray-300 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    className="text-gray-700 flex items-center"
                  >
                    <KeyRound className="mr-2 h-4 w-4 text-gray-500" />
                    Password
                  </Label>
                  <Input
                    type="password"
                    name="password"
                    value={signupInput.password}
                    placeholder="Create a password"
                    onChange={(e) => changeInputHandler(e, "signup")}
                    required={true}
                    className="bg-gray-50/50 border border-gray-300 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  />
                </div>
              </CardContent>
              <CardFooter className="px-0 pt-6">
                <Button
                  disabled={registerIsLoading}
                  onClick={() => handleRegistration("signup")}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition-all duration-300"
                >
                  {registerIsLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please
                      wait...
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Sign Up
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Login;
