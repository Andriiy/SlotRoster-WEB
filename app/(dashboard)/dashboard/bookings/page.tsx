'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Plus, Clock, User, Plane, AlertCircle, CheckCircle, XCircle, MapPin } from 'lucide-react';
import { useAirClub } from '@/lib/contexts/AirClubContext';
import useSWR from 'swr';

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to fetch');
  }
  return res.json();
};

export default function BookingsPage() {
  const { selectedAirClub, airClubs } = useAirClub();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'calendar'>('upcoming');

  // Mock booking data - in a real app, this would come from an API
  const mockBookings = [
    {
      id: '1',
      aircraft: { registration: 'N12345', type: 'Cessna 172' },
      pilot: { name: 'John Smith', email: 'john@example.com' },
      startTime: '2024-01-15T10:00:00Z',
      endTime: '2024-01-15T12:00:00Z',
      status: 'confirmed',
      purpose: 'Training flight',
      notes: 'Student pilot training session'
    },
    {
      id: '2',
      aircraft: { registration: 'N67890', type: 'Piper PA-28' },
      pilot: { name: 'Sarah Johnson', email: 'sarah@example.com' },
      startTime: '2024-01-16T14:00:00Z',
      endTime: '2024-01-16T16:00:00Z',
      status: 'pending',
      purpose: 'Cross-country flight',
      notes: 'Flight to neighboring airport'
    },
    {
      id: '3',
      aircraft: { registration: 'N12345', type: 'Cessna 172' },
      pilot: { name: 'Mike Wilson', email: 'mike@example.com' },
      startTime: '2024-01-14T09:00:00Z',
      endTime: '2024-01-14T11:00:00Z',
      status: 'completed',
      purpose: 'Local flight',
      notes: 'Completed successfully'
    }
  ];

  // Show loading state if no air club is selected
  if (!selectedAirClub) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Booking Management</h1>
          <p className="text-muted-foreground">
            Please select an air club from the dropdown to manage its bookings
          </p>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Air Club Selected</h3>
              <p className="text-muted-foreground mb-4">
                Please select an air club from the dropdown menu to manage its bookings.
              </p>
              <Button asChild>
                <a href="/dashboard/air-club-crud?mode=create">Create Your First Air Club</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Tab selector component
  const TabSelector = () => (
    <div className="flex bg-muted rounded-lg p-1 mb-6">
      <Button
        variant={activeTab === 'upcoming' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setActiveTab('upcoming')}
        className="flex-1"
      >
        <Clock className="h-4 w-4 mr-2" />
        Upcoming
      </Button>
      <Button
        variant={activeTab === 'past' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setActiveTab('past')}
        className="flex-1"
      >
        <Calendar className="h-4 w-4 mr-2" />
        Past
      </Button>
      <Button
        variant={activeTab === 'calendar' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setActiveTab('calendar')}
        className="flex-1"
      >
        <Calendar className="h-4 w-4 mr-2" />
        Calendar
      </Button>
    </div>
  );

  // Helper function to get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge variant="default" className="flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Confirmed</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="flex items-center gap-1"><Clock className="h-3 w-3" /> Pending</Badge>;
      case 'completed':
        return <Badge variant="outline" className="flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Completed</Badge>;
      case 'cancelled':
        return <Badge variant="destructive" className="flex items-center gap-1"><XCircle className="h-3 w-3" /> Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Helper function to format date
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Helper function to get duration
  const getDuration = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end.getTime() - start.getTime();
    const diffHours = Math.round(diffMs / (1000 * 60 * 60));
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''}`;
  };

  // Upcoming Bookings Tab
  const UpcomingTab = () => {
    const upcomingBookings = mockBookings.filter(booking => 
      new Date(booking.startTime) > new Date() && booking.status !== 'cancelled'
    );

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Upcoming Bookings
            </CardTitle>
            <CardDescription>Manage upcoming aircraft bookings and reservations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  Currently showing bookings for: <strong>{selectedAirClub.name}</strong>
                </p>
                <Button size="sm" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  New Booking
                </Button>
              </div>
              
              {upcomingBookings.length > 0 ? (
                <div className="space-y-4">
                  {upcomingBookings.map((booking) => (
                    <Card key={booking.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Plane className="h-5 w-5 text-primary" />
                            <div>
                              <h3 className="font-semibold">{booking.aircraft.registration}</h3>
                              <p className="text-sm text-muted-foreground">{booking.aircraft.type}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{booking.pilot.name}</p>
                              <p className="text-sm text-muted-foreground">{booking.pilot.email}</p>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="mb-2">
                            {getStatusBadge(booking.status)}
                          </div>
                          <p className="text-sm font-medium">{formatDateTime(booking.startTime)}</p>
                          <p className="text-xs text-muted-foreground">
                            {getDuration(booking.startTime, booking.endTime)}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-sm"><strong>Purpose:</strong> {booking.purpose}</p>
                        {booking.notes && (
                          <p className="text-sm text-muted-foreground mt-1">{booking.notes}</p>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Upcoming Bookings</h3>
                  <p className="text-muted-foreground mb-4">
                    No upcoming bookings found for this air club.
                  </p>
                  <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Create First Booking
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Past Bookings Tab
  const PastTab = () => {
    const pastBookings = mockBookings.filter(booking => 
      new Date(booking.startTime) < new Date()
    );

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Past Bookings
            </CardTitle>
            <CardDescription>View completed and past aircraft bookings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pastBookings.length > 0 ? (
                <div className="space-y-4">
                  {pastBookings.map((booking) => (
                    <Card key={booking.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Plane className="h-5 w-5 text-primary" />
                            <div>
                              <h3 className="font-semibold">{booking.aircraft.registration}</h3>
                              <p className="text-sm text-muted-foreground">{booking.aircraft.type}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{booking.pilot.name}</p>
                              <p className="text-sm text-muted-foreground">{booking.pilot.email}</p>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="mb-2">
                            {getStatusBadge(booking.status)}
                          </div>
                          <p className="text-sm font-medium">{formatDateTime(booking.startTime)}</p>
                          <p className="text-xs text-muted-foreground">
                            {getDuration(booking.startTime, booking.endTime)}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-sm"><strong>Purpose:</strong> {booking.purpose}</p>
                        {booking.notes && (
                          <p className="text-sm text-muted-foreground mt-1">{booking.notes}</p>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Past Bookings</h3>
                  <p className="text-muted-foreground">
                    No past bookings found for this air club.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Calendar Tab
  const CalendarTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Booking Calendar
          </CardTitle>
          <CardDescription>View and manage bookings in calendar format</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Calendar View</h3>
            <p className="text-muted-foreground mb-4">
              Calendar view features will be available in future updates.
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• View all bookings in calendar format</p>
              <p>• Drag and drop to reschedule bookings</p>
              <p>• Quick booking creation from calendar</p>
              <p>• Visual conflict detection and resolution</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Booking Management</h1>
        <p className="text-muted-foreground">
          Managing bookings for: <strong>{selectedAirClub.name}</strong>
          {selectedAirClub.airport && ` at ${selectedAirClub.airport}`}
        </p>
      </div>

      <TabSelector />

      {activeTab === 'upcoming' && <UpcomingTab />}
      {activeTab === 'past' && <PastTab />}
      {activeTab === 'calendar' && <CalendarTab />}
    </div>
  );
} 