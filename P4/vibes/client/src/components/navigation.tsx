import { Link } from "wouter";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FileText, User, LogOut, ChevronDown, Shield } from "lucide-react";

export function Navigation() {
  const { user, logout, isLoading } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="sticky top-0 z-50 h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-full max-w-4xl items-center justify-between gap-4 px-6">
        <Link href="/" className="flex items-center gap-2">
          <FileText className="h-6 w-6 text-primary" />
          <span className="text-lg font-semibold" data-testid="text-app-title">ArticleShare</span>
        </Link>

        <nav className="flex items-center gap-4">
          {isLoading ? (
            <div className="h-9 w-24 animate-pulse rounded-md bg-muted" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2" data-testid="button-user-menu">
                  <User className="h-4 w-4" />
                  <span data-testid="text-username">{user.username}</span>
                  {user.isAdmin && (
                    <Badge variant="secondary" className="ml-1 gap-1" data-testid="badge-admin">
                      <Shield className="h-3 w-3" />
                      Admin
                    </Badge>
                  )}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/" className="flex w-full cursor-pointer items-center gap-2" data-testid="link-my-posts">
                    <FileText className="h-4 w-4" />
                    All Posts
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer text-destructive focus:text-destructive"
                  data-testid="button-logout"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" asChild data-testid="link-login">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild data-testid="link-register">
                <Link href="/register">Register</Link>
              </Button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
