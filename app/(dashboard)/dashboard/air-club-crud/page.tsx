'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  PlusCircle, 
  Edit, 
  Trash2, 
  Loader2,
  Eye,
  Save,
  X
} from 'lucide-react';
import useSWR, { mutate } from 'swr';

// Type definitions based on the database schema
interface AirClub {
  id: string;
  name: string;
  address: string | null; // Updated to match actual database column
  phone: string | null;
  email: string | null;
  airport: string | null;
  created_at: string;
  description: string | null;
  website: string | null;
  created_by: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  stripe_product_id: string | null;
  plan_name: string | null;
  subscription_status: string | null;
}

interface AirClubFormData {
  name: string;
  address: string;
  phone: string;
  email: string;
  airport: string;
  description: string;
  website: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Initial form state
const initialFormData: AirClubFormData = {
  name: '',
  address: '',
  phone: '',
  email: '',
  airport: '',
  description: '',
  website: '',
};

export default function AirClubCRUDPage() {
  const [airClubs, setAirClubs] = useState<AirClub[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<AirClubFormData>(initialFormData);
  const [showForm, setShowForm] = useState(false);

  // Check URL parameters for create mode
  useEffect(() => {
    // Only run on client side to prevent hydration issues
    if (typeof window === 'undefined') return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');
    if (mode === 'create') {
      setIsCreating(true);
      setShowForm(true);
      setEditingId(null);
      setFormData(initialFormData);
    }
  }, []);

  // Fetch air clubs from API
  const { data: apiAirClubs, error, mutate: refreshAirClubs } = useSWR<AirClub[]>('/api/air-clubs', fetcher);

  // Initialize with API data
  useEffect(() => {
    if (apiAirClubs) {
      setAirClubs(apiAirClubs);
    }
  }, [apiAirClubs]);

  // Handle form input changes
  const handleInputChange = (field: keyof AirClubFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Create new air club
  const handleCreate = async () => {
    setIsLoading(true);
    try {
      console.log('Sending form data:', formData);
      
      const response = await fetch('/api/air-clubs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error(errorData.error || 'Failed to create air club');
      }

      const newClub = await response.json();
      console.log('Success response:', newClub);
      
             // Refresh the air clubs list
       await refreshAirClubs();
       
       // Show success feedback
       alert('Air club created successfully!');
       
       setFormData(initialFormData);
       setShowForm(false);
       setIsCreating(false);
    } catch (error) {
      console.error('Error creating air club:', error);
      alert('Error creating air club: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  // Update existing air club
  const handleUpdate = async () => {
    if (!editingId) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/air-clubs/${editingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update air club');
      }

             // Refresh the air clubs list
       await refreshAirClubs();
       
       // Show success feedback
       alert('Air club updated successfully!');
       
       setFormData(initialFormData);
       setEditingId(null);
    } catch (error) {
      console.error('Error updating air club:', error);
      alert('Error updating air club: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  // Delete air club
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this air club?')) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/air-clubs/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete air club');
      }

      // Refresh the air clubs list
      await refreshAirClubs();
    } catch (error) {
      console.error('Error deleting air club:', error);
      alert('Error deleting air club: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  // Start editing
  const handleEdit = (club: AirClub) => {
    setEditingId(club.id);
    setFormData({
      name: club.name,
      address: club.address || '',
      phone: club.phone || '',
      email: club.email || '',
      airport: club.airport || '',
      description: club.description || '',
      website: club.website || '',
    });
    setShowForm(true);
  };

  // Cancel form
  const handleCancel = () => {
    setFormData(initialFormData);
    setEditingId(null);
    setShowForm(false);
    setIsCreating(false);
  };

  // Get subscription status badge color
  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'trialing':
        return <Badge className="bg-blue-100 text-blue-800">Trial</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status || 'Unknown'}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Air Club Management</h1>
          <p className="text-muted-foreground">
            Manage air clubs, members, and subscriptions
          </p>
        </div>
        <Button 
          onClick={() => {
            setIsCreating(true);
            setShowForm(true);
            setEditingId(null);
            setFormData(initialFormData);
          }}
          className="flex items-center gap-2"
        >
          <PlusCircle className="h-4 w-4" />
          Add Air Club
        </Button>
      </div>



      {/* Create/Edit Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {isCreating ? 'Create New Air Club' : 'Edit Air Club'}
              <Button variant="ghost" size="sm" onClick={handleCancel}>
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Club Name *</Label>
                                 <Input
                   id="name"
                   value={formData.name}
                   onChange={(e) => handleInputChange('name', e.target.value)}
                   placeholder="Enter club name"
                   className="mt-1"
                   autoFocus={isCreating}
                 />
              </div>
              <div>
                <Label htmlFor="airport">Airport Code *</Label>
                <Input
                  id="airport"
                  value={formData.airport}
                  onChange={(e) => handleInputChange('airport', e.target.value)}
                  placeholder="e.g., LAX, SAN"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="contact@club.com"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="(555) 123-4567"
                  className="mt-1"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="123 Aviation Way, City, State"
                  className="mt-1"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  placeholder="https://clubwebsite.com"
                  className="mt-1"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Brief description of the club..."
                  className="mt-1"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <Button 
                onClick={isCreating ? handleCreate : handleUpdate}
                disabled={isLoading || !formData.name || !formData.email || !formData.airport}
                className="flex items-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {isCreating ? 'Create Club' : 'Update Club'}
              </Button>
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Air Clubs List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            Air Clubs ({airClubs.length})
          </h2>
        </div>

        {airClubs.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="space-y-4">
                <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                  <PlusCircle className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">No Air Clubs Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Get started by creating your first air club.
                  </p>
                  <Button 
                    onClick={() => {
                      setIsCreating(true);
                      setShowForm(true);
                      setEditingId(null);
                      setFormData(initialFormData);
                    }}
                    className="flex items-center gap-2"
                  >
                    <PlusCircle className="h-4 w-4" />
                    Create First Air Club
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
                     <div className="space-y-2">
                           {airClubs.map((club) => (
                <div key={club.id} className="border border-border rounded-lg p-3 hover:bg-accent/50 transition-colors bg-card">
                 <div className="flex items-start justify-between">
                   <div className="flex-1">
                     <div className="flex items-center gap-2 mb-1">
                       <h3 className="text-lg font-semibold">{club.name}</h3>
                       {getStatusBadge(club.subscription_status)}
                     </div>
                                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <span className="font-medium text-card-foreground">Airport:</span>
                          <span className="text-muted-foreground">{club.airport}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="font-medium text-card-foreground">Email:</span>
                          <span className="text-muted-foreground">{club.email}</span>
                        </div>
                        {club.phone && (
                          <div className="flex items-center gap-1">
                            <span className="font-medium text-card-foreground">Phone:</span>
                            <span className="text-muted-foreground">{club.phone}</span>
                          </div>
                        )}
                        {club.address && (
                          <div className="flex items-center gap-1">
                            <span className="font-medium text-card-foreground">Address:</span>
                            <span className="text-muted-foreground">{club.address}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <span className="font-medium text-card-foreground">Plan:</span>
                          <span className="text-muted-foreground">{club.plan_name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="font-medium text-card-foreground">Created:</span>
                          <span className="text-muted-foreground">{new Date(club.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                     {club.description && (
                       <p className="text-sm text-muted-foreground mt-1">
                         {club.description}
                       </p>
                     )}
                   </div>
                   <div className="flex gap-2 ml-4">
                     <Button
                       variant="outline"
                       size="sm"
                       onClick={() => handleEdit(club)}
                       className="flex items-center gap-1"
                     >
                       <Edit className="h-3 w-3" />
                       Edit
                     </Button>
                     <Button
                       variant="outline"
                       size="sm"
                       onClick={() => {/* View details */}}
                       className="flex items-center gap-1"
                     >
                       <Eye className="h-3 w-3" />
                       View
                     </Button>
                     <Button
                       variant="outline"
                       size="sm"
                       onClick={() => handleDelete(club.id)}
                       className="flex items-center gap-1 text-red-600 hover:text-red-700"
                     >
                       <Trash2 className="h-3 w-3" />
                       Delete
                     </Button>
                   </div>
                 </div>
               </div>
             ))}
          </div>
        )}
      </div>
    </div>
  );
} 