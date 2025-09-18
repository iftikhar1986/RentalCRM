import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { LoadingScreen } from "@/components/loading-screen";
import { canAccessPath } from "@/lib/permissions";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import Analytics from "@/pages/analytics";
import Users from "@/pages/users";
import Branches from "@/pages/branches";
import Vehicles from "@/pages/vehicles";
import FieldSettings from "@/pages/field-settings";
import NotFound from "@/pages/not-found";

// Permission-protected route component
function ProtectedRoute({ path, component: Component }: { path: string; component: React.ComponentType }) {
  const { user } = useAuth();
  
  if (!canAccessPath(user, path)) {
    return <NotFound />;
  }
  
  return <Component />;
}

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();

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
          <Route path="/analytics">
            <ProtectedRoute path="/analytics" component={Analytics} />
          </Route>
          <Route path="/users">
            <ProtectedRoute path="/users" component={Users} />
          </Route>
          <Route path="/branches">
            <ProtectedRoute path="/branches" component={Branches} />
          </Route>
          <Route path="/vehicles">
            <ProtectedRoute path="/vehicles" component={Vehicles} />
          </Route>
          <Route path="/field-settings">
            <ProtectedRoute path="/field-settings" component={FieldSettings} />
          </Route>
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
