import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

import { Shield, Eye, EyeOff, User, Lock, ArrowRight, Book } from "lucide-react";
import companyLogo from "@assets/company-logo.png";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import UserManual from "@/components/user-manual";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const { toast } = useToast();

  const [showPassword, setShowPassword] = useState(false);
  const [isUserManualOpen, setIsUserManualOpen] = useState(false);

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginForm) => {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Login failed");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate auth queries to refresh the app state
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      // No page reload needed - the auth hook will automatically update
    },
    onError: (error: Error) => {
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: LoginForm) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-stone-100 flex items-center justify-center p-2 sm:p-4 relative overflow-hidden">
      {/* User Manual Button */}
      <Button
        onClick={() => setIsUserManualOpen(true)}
        variant="outline"
        size="sm"
        className="absolute top-4 right-4 z-10 flex items-center gap-2 bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 hover:border-blue-300 transition-all duration-200 rounded-xl"
      >
        <Book className="h-4 w-4" />
        <span className="hidden sm:inline">User Manual</span>
        <span className="sm:hidden">Manual</span>
      </Button>
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-br from-blue-100/20 to-purple-100/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-gray-100/30 to-slate-100/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-stone-100/20 to-gray-100/20 rounded-full blur-2xl"></div>
      </div>
      
      <div className="relative w-full max-w-md">
        {/* Header Section */}
        <div className="text-center mb-6 sm:mb-12">
          <div className="flex justify-center mb-4 sm:mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-gray-800/10 rounded-2xl blur-lg transform rotate-3"></div>
              <img 
                src={companyLogo}
                alt="Company Logo" 
                className="relative h-20 sm:h-32 w-auto drop-shadow-lg"
              />
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-gray-600 font-medium text-sm sm:text-base">Internal Lead Management Platform</p>
          </div>
        </div>
        
        {/* Login Card */}
        <Card className="bg-white/90 backdrop-blur-lg border-0 shadow-2xl shadow-black/20 ring-1 ring-black/5">
          <CardHeader className="pb-4 sm:pb-8 pt-6 sm:pt-10 px-4 sm:px-10">
            <div className="text-center space-y-3">
              <div className="inline-flex items-center justify-center w-12 sm:w-16 h-12 sm:h-16 bg-gradient-to-br from-black to-gray-800 rounded-2xl shadow-lg mb-4">
                <Shield className="w-6 sm:w-8 h-6 sm:h-8 text-white" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                Welcome Back
              </h2>
              <p className="text-gray-600 text-base sm:text-lg">
                Sign in to access your dashboard
              </p>
            </div>
          </CardHeader>
          
          <CardContent className="px-4 sm:px-10 pb-6 sm:pb-10">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-base font-semibold text-gray-800 flex items-center gap-3">
                        <div className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center">
                          <User size={14} className="text-gray-600" />
                        </div>
                        Email Address
                      </FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="email"
                          className="h-12 sm:h-14 bg-gray-50/80 border-gray-200/80 focus:bg-white focus:ring-2 focus:ring-black/10 focus:border-black transition-all duration-300 text-sm sm:text-base rounded-xl shadow-sm"
                          placeholder="your.email@company.com"
                        />
                      </FormControl>
                      <FormMessage className="text-sm" />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-base font-semibold text-gray-800 flex items-center gap-3">
                        <div className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Lock size={14} className="text-gray-600" />
                        </div>
                        Password
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            {...field} 
                            type={showPassword ? "text" : "password"}
                            className="h-12 sm:h-14 bg-gray-50/80 border-gray-200/80 focus:bg-white focus:ring-2 focus:ring-black/10 focus:border-black transition-all duration-300 text-sm sm:text-base pr-12 sm:pr-14 rounded-xl shadow-sm"
                            placeholder="Enter your password"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-12 sm:h-14 px-3 sm:px-4 hover:bg-gray-50 rounded-r-xl transition-colors"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-5 w-5 text-gray-400" />
                            ) : (
                              <Eye className="h-5 w-5 text-gray-400" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage className="text-sm" />
                    </FormItem>
                  )}
                />
                
                <Button
                  type="submit"
                  disabled={loginMutation.isPending}
                  className="w-full h-12 sm:h-14 bg-gradient-to-r from-black to-gray-800 text-white hover:from-gray-800 hover:to-gray-700 focus:ring-2 focus:ring-black/20 font-semibold text-base sm:text-lg transition-all duration-300 group shadow-lg hover:shadow-xl rounded-xl"
                >
                  {loginMutation.isPending ? (
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Signing you in...
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      Sign In
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                    </div>
                  )}
                </Button>
              </form>
            </Form>

          </CardContent>
        </Card>
        
        {/* Footer */}
        <div className="text-center mt-6 sm:mt-12 space-y-3 sm:space-y-4">
          <p className="text-sm sm:text-base text-gray-600 font-medium">
            Secure access for Q-Mobility staff only
          </p>
          <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-gray-500">
            <Shield size={14} className="text-gray-400" />
            <span>Protected by enterprise-grade security</span>
          </div>
          <div className="text-xs text-gray-400 pt-2">
            © 2025 Q-Mobility. All rights reserved.
          </div>
        </div>
      </div>
      
      {/* User Manual Dialog */}
      <UserManual 
        isOpen={isUserManualOpen} 
        onClose={() => setIsUserManualOpen(false)} 
      />
    </div>
  );
}