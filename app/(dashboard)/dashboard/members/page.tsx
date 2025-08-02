'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, UserCheck, UserPlus, Mail, Shield, Calendar, AlertCircle } from 'lucide-react';
import { useAirClub } from '@/lib/contexts/AirClubContext';
import useSWR from 'swr';

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to fetch');
  }
  return res.json();
};

export default function MembersPage() {
  const { selectedAirClub, airClubs } = useAirClub();
  const [activeTab, setActiveTab] = useState<'members' | 'invites' | 'roles'>('members');

  // Show loading state if no air club is selected
  if (!selectedAirClub) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Member Management</h1>
          <p className="text-muted-foreground">
            Please select an air club from the dropdown to manage its members
          </p>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Air Club Selected</h3>
              <p className="text-muted-foreground mb-4">
                Please select an air club from the dropdown menu to manage its members.
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
        variant={activeTab === 'members' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setActiveTab('members')}
        className="flex-1"
      >
        <Users className="h-4 w-4 mr-2" />
        Members
      </Button>
      <Button
        variant={activeTab === 'invites' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setActiveTab('invites')}
        className="flex-1"
      >
        <Mail className="h-4 w-4 mr-2" />
        Invites
      </Button>
      <Button
        variant={activeTab === 'roles' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setActiveTab('roles')}
        className="flex-1"
      >
        <Shield className="h-4 w-4 mr-2" />
        Roles
      </Button>
    </div>
  );

  // Members Tab
  const MembersTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Club Members
          </CardTitle>
          <CardDescription>Manage your club's members and their roles</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                Currently showing members for: <strong>{selectedAirClub.name}</strong>
              </p>
              <Button size="sm" className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Invite Member
              </Button>
            </div>
            <div className="text-center py-8">
              <UserCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Member Management</h3>
              <p className="text-muted-foreground mb-4">
                Member management features will be available in future updates.
              </p>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• Invite new members to your club</p>
                <p>• Manage member roles and permissions</p>
                <p>• Track pilot qualifications and certifications</p>
                <p>• View member activity and booking history</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Invites Tab
  const InvitesTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Pending Invites
          </CardTitle>
          <CardDescription>Manage invitations sent to potential members</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Invite Management</h3>
            <p className="text-muted-foreground mb-4">
              Invite management features will be available in future updates.
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• Send email invitations to new members</p>
              <p>• Track invitation status and responses</p>
              <p>• Resend or cancel pending invitations</p>
              <p>• Set invitation expiration dates</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Roles Tab
  const RolesTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Member Roles
          </CardTitle>
          <CardDescription>Configure roles and permissions for your club</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Role Management</h3>
            <p className="text-muted-foreground mb-4">
              Role management features will be available in future updates.
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• Create custom roles for your club</p>
              <p>• Set permissions for different member types</p>
              <p>• Manage admin and moderator roles</p>
              <p>• Configure booking and aircraft access</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Member Management</h1>
        <p className="text-muted-foreground">
          Managing members for: <strong>{selectedAirClub.name}</strong>
          {selectedAirClub.airport && ` at ${selectedAirClub.airport}`}
        </p>
      </div>

      <TabSelector />

      {activeTab === 'members' && <MembersTab />}
      {activeTab === 'invites' && <InvitesTab />}
      {activeTab === 'roles' && <RolesTab />}
    </div>
  );
} 