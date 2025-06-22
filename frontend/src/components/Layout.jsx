import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Home,
  CreditCard,
  ArrowUpDown,
  TrendingUp,
  PiggyBank,
  Target,
  Settings,
  Menu,
  LogOut,
  User,
  DollarSign,
} from 'lucide-react';

const Layout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/accounts', label: 'Accounts', icon: CreditCard },
    { path: '/transactions', label: 'Transactions', icon: ArrowUpDown },
    { path: '/investments', label: 'Investments', icon: TrendingUp },
    { path: '/budgets', label: 'Budgets', icon: PiggyBank },
    { path: '/goals', label: 'Goals', icon: Target },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleNavigation = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const getUserInitials = () => {
    if (!user) return 'U';
    return `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase();
  };

  const NavigationContent = ({ isMobile = false }) => (
    <nav className={`${isMobile ? 'flex flex-col space-y-2' : 'space-y-1'}`}>
      {navigationItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        
        return (
          <Button
            key={item.path}
            variant={isActive ? 'default' : 'ghost'}
            className={`${isMobile ? 'w-full justify-start' : 'w-full justify-start'} ${
              isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
            }`}
            onClick={() => handleNavigation(item.path)}
          >
            <Icon className="mr-3 h-4 w-4" />
            {item.label}
          </Button>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="lg:hidden border-b bg-card px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64">
                <div className="flex flex-col h-full">
                  <div className="flex items-center space-x-2 mb-6">
                    <DollarSign className="h-6 w-6 text-primary" />
                    <span className="text-lg font-semibold">Personal Finance</span>
                  </div>
                  <NavigationContent isMobile={true} />
                </div>
              </SheetContent>
            </Sheet>
            <div className="flex items-center space-x-2">
              <DollarSign className="h-6 w-6 text-primary" />
              <span className="text-lg font-semibold">Personal Finance</span>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">{getUserInitials()}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user?.first_name} {user?.last_name}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleNavigation('/settings')}>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:border-r lg:bg-card">
          <div className="flex flex-col flex-1 min-h-0">
            <div className="flex items-center h-16 px-6 border-b">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-6 w-6 text-primary" />
                <span className="text-lg font-semibold">Personal Finance</span>
              </div>
            </div>
            
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className="px-3">
                <NavigationContent />
              </div>
            </div>
            
            <div className="flex-shrink-0 border-t p-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="w-full justify-start">
                    <Avatar className="h-6 w-6 mr-3">
                      <AvatarFallback className="text-xs">{getUserInitials()}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-medium">
                        {user?.first_name} {user?.last_name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {user?.email}
                      </span>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuItem onClick={() => handleNavigation('/settings')}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:pl-64">
          <div className="min-h-screen">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;

