'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Users, Settings, Shield, Menu, Package, User, Building2, ChevronDown, Plane, Calendar } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { useAirClub } from '@/lib/contexts/AirClubContext';

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  const { selectedAirClub, setSelectedAirClub, airClubs, isLoading, error } = useAirClub();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const navItems = [
    { href: '/dashboard', icon: Users, label: 'Home' },
    { href: '/dashboard/club', icon: Building2, label: 'Club Info' },
    { href: '/dashboard/fleet', icon: Plane, label: 'Fleet' },
    { href: '/dashboard/bookings', icon: Calendar, label: 'Bookings' },
    { href: '/dashboard/members', icon: Users, label: 'Members' },
    { href: '/dashboard/account-settings', icon: User, label: 'Account Settings' }
  ];

  const handleAirClubSelect = (airClub: any) => {
    setSelectedAirClub(airClub);
    // You can add logic here to switch context or navigate to the selected air club
    // For now, we'll just update the selected air club
  };

  return (
    <div className="flex flex-col h-[calc(100vh-68px)] max-w-7xl mx-auto w-full">
      {/* Mobile header */}
      <div className="lg:hidden flex items-center justify-between bg-background border-b border-border p-4">
        <div className="flex items-center">
          <span className="font-medium text-foreground">
            {isMounted ? (pathname === '/dashboard' ? 'Home' : 'Menu') : 'Menu'}
          </span>
        </div>
        <Button
          className="-mr-3"
          variant="ghost"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle sidebar</span>
        </Button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`w-64 bg-sidebar lg:bg-sidebar border-r border-sidebar-border lg:block ${
            isSidebarOpen ? 'block' : 'hidden'
          } lg:relative absolute inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <nav className="h-full overflow-y-auto p-4">
            {/* Air Clubs Dropdown */}
            <div className="mb-6">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-full justify-between text-left"
                  >
                    <div className="flex items-center">
                      <Plane className="h-4 w-4 mr-2" />
                      <span className="truncate">
                        {selectedAirClub ? selectedAirClub.name : 'Select Air Club'}
                      </span>
                    </div>
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="start">
                  {isLoading ? (
                    <DropdownMenuItem disabled>
                      <span className="text-muted-foreground">Loading air clubs...</span>
                    </DropdownMenuItem>
                  ) : error ? (
                    <DropdownMenuItem disabled>
                      <span className="text-muted-foreground">Error loading air clubs</span>
                    </DropdownMenuItem>
                  ) : airClubs && airClubs.length > 0 ? (
                    <>
                      {airClubs.map((airClub: any) => (
                        <DropdownMenuItem
                          key={airClub.id}
                          onClick={() => handleAirClubSelect(airClub)}
                          className={`cursor-pointer ${
                            selectedAirClub?.id === airClub.id ? 'bg-accent' : ''
                          }`}
                        >
                          <div className="flex items-center w-full">
                            <Plane className="h-4 w-4 mr-2" />
                            <div className="flex-1 min-w-0">
                              <div className="truncate font-medium">{airClub.name}</div>
                              <div className="text-xs text-muted-foreground truncate">
                                {airClub.airport}
                              </div>
                            </div>
                            {airClub.is_trial_active && (
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded ml-2">
                                Trial
                              </span>
                            )}
                          </div>
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard/air-club-crud?mode=create" className="cursor-pointer">
                          <Plane className="h-4 w-4 mr-2" />
                          Create New Air Club
                        </Link>
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/air-club-crud?mode=create" className="cursor-pointer">
                        <Plane className="h-4 w-4 mr-2" />
                        Create Your First Air Club
                      </Link>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Navigation Items */}
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} passHref>
                <Button
                  variant={pathname === item.href ? 'secondary' : 'ghost'}
                  className={`shadow-none my-1 w-full justify-start ${
                    pathname === item.href ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  }`}
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
