'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plane, Plus, Settings, AlertCircle, Calendar, Wrench, Users, MapPin } from 'lucide-react';
import { useAirClub } from '@/lib/contexts/AirClubContext';
import useSWR from 'swr';

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to fetch');
  }
  return res.json();
};

export default function FleetPage() {
  const { selectedAirClub, airClubs } = useAirClub();
  const [activeTab, setActiveTab] = useState<'aircraft' | 'maintenance' | 'scheduling'>('aircraft');

  // Fetch aircraft for the selected air club
  const { data: aircraftData, error: aircraftError, isLoading: aircraftLoading } = useSWR(
    selectedAirClub ? `/api/aircrafts?airClubId=${selectedAirClub.id}` : null,
    fetcher
  );

  // Show loading state if no air club is selected
  if (!selectedAirClub) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fleet Management</h1>
          <p className="text-muted-foreground">
            Please select an air club from the dropdown to manage its fleet
          </p>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Air Club Selected</h3>
              <p className="text-muted-foreground mb-4">
                Please select an air club from the dropdown menu to manage its fleet.
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
        variant={activeTab === 'aircraft' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setActiveTab('aircraft')}
        className="flex-1"
      >
        <Plane className="h-4 w-4 mr-2" />
        Aircraft
      </Button>
      <Button
        variant={activeTab === 'maintenance' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setActiveTab('maintenance')}
        className="flex-1"
      >
        <Wrench className="h-4 w-4 mr-2" />
        Maintenance
      </Button>
      <Button
        variant={activeTab === 'scheduling' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setActiveTab('scheduling')}
        className="flex-1"
      >
        <Calendar className="h-4 w-4 mr-2" />
        Scheduling
      </Button>
    </div>
  );

  // Aircraft Tab
  const AircraftTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plane className="h-5 w-5" />
            Fleet Aircraft
          </CardTitle>
          <CardDescription>Manage your club's aircraft fleet</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                Currently showing aircraft for: <strong>{selectedAirClub.name}</strong>
              </p>
              <Button size="sm" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Aircraft
              </Button>
            </div>
            
            {aircraftLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading aircraft...</p>
              </div>
            ) : aircraftError ? (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Error Loading Aircraft</h3>
                <p className="text-muted-foreground">Failed to load aircraft data.</p>
              </div>
            ) : aircraftData && aircraftData.length > 0 ? (
              <div className="grid gap-4">
                {aircraftData.map((aircraft: any) => (
                  <Card key={aircraft.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Plane className="h-8 w-8 text-primary" />
                        <div>
                          <h3 className="font-semibold">{aircraft.registration}</h3>
                          <p className="text-sm text-muted-foreground">{aircraft.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{aircraft.seats} seats</Badge>
                        <Button size="sm" variant="ghost">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Plane className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Aircraft Found</h3>
                <p className="text-muted-foreground mb-4">
                  Add your first aircraft to start managing your fleet.
                </p>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add First Aircraft
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Maintenance Tab
  const MaintenanceTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Maintenance Schedule
          </CardTitle>
          <CardDescription>Track maintenance schedules and inspections</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Wrench className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Maintenance Management</h3>
            <p className="text-muted-foreground mb-4">
              Maintenance tracking features will be available in future updates.
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• Schedule regular maintenance inspections</p>
              <p>• Track maintenance history and logs</p>
              <p>• Set up maintenance alerts and reminders</p>
              <p>• Manage maintenance providers and costs</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Scheduling Tab
  const SchedulingTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Fleet Scheduling
          </CardTitle>
          <CardDescription>Manage aircraft availability and booking schedules</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Scheduling Management</h3>
            <p className="text-muted-foreground mb-4">
              Fleet scheduling features will be available in future updates.
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• View aircraft availability calendar</p>
              <p>• Manage booking conflicts and overlaps</p>
              <p>• Set aircraft availability rules</p>
              <p>• Track aircraft utilization and hours</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Fleet Management</h1>
        <p className="text-muted-foreground">
          Managing fleet for: <strong>{selectedAirClub.name}</strong>
          {selectedAirClub.airport && ` at ${selectedAirClub.airport}`}
        </p>
      </div>

      <TabSelector />

      {activeTab === 'aircraft' && <AircraftTab />}
      {activeTab === 'maintenance' && <MaintenanceTab />}
      {activeTab === 'scheduling' && <SchedulingTab />}
    </div>
  );
} 