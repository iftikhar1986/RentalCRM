import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { LoadingScreen } from "@/components/loading-screen";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import Analytics from "@/pages/analytics";
import Users from "@/pages/users";
import Branches from "@/pages/branches";
import Vehicles from "@/pages/vehicles";
import FieldSettings from "@/pages/field-settings";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading screen while checking authentication
  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Switch>
      {!isAuthenticated ? (
        <Route path="/" component={Login} />
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/analytics" component={Analytics} />
          <Route path="/users" component={Users} />
          <Route path="/branches" component={Branches} />
          <Route path="/vehicles" component={Vehicles} />
          <Route path="/field-settings" component={FieldSettings} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
