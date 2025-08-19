import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Settings, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-card/80 backdrop-blur-sm">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Bell className="h-6 w-6 text-primary" />
            <h1 className="text-lg font-semibold text-foreground">FreshBuzz</h1>
          </div>
          
          <nav className="flex items-center gap-2">
            <Button
              asChild
              variant={isActive("/") ? "default" : "ghost"}
              size="sm"
              className="text-sm"
            >
              <Link to="/">
                <Home className="h-4 w-4 mr-2" />
                News
              </Link>
            </Button>
            <Button
              asChild
              variant={isActive("/settings") ? "default" : "ghost"}
              size="sm"
              className="text-sm"
            >
              <Link to="/settings">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
};

export default Layout;