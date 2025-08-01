'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import useSWR from 'swr';

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to fetch');
  }
  return res.json();
};

interface AirClub {
  id: string;
  name: string;
  airport: string | null;
  is_trial_active: boolean;
  subscription_status: string | null;
  plan_name: string | null;
  created_at: string;
}

interface AirClubContextType {
  selectedAirClub: AirClub | null;
  setSelectedAirClub: (airClub: AirClub | null) => void;
  airClubs: AirClub[];
  isLoading: boolean;
  error: any;
  refreshAirClubs: () => void;
}

const AirClubContext = createContext<AirClubContextType | undefined>(undefined);

export function AirClubProvider({ children }: { children: React.ReactNode }) {
  const [selectedAirClub, setSelectedAirClub] = useState<AirClub | null>(null);
  
  const { data: airClubs, error, isLoading, mutate } = useSWR<AirClub[]>('/api/air-clubs', fetcher);

  // Set the first air club as selected by default
  useEffect(() => {
    if (airClubs && airClubs.length > 0 && !selectedAirClub) {
      setSelectedAirClub(airClubs[0]);
    }
  }, [airClubs, selectedAirClub]);

  const refreshAirClubs = () => {
    mutate();
  };

  const value = {
    selectedAirClub,
    setSelectedAirClub,
    airClubs: airClubs || [],
    isLoading,
    error,
    refreshAirClubs
  };

  return (
    <AirClubContext.Provider value={value}>
      {children}
    </AirClubContext.Provider>
  );
}

export function useAirClub() {
  const context = useContext(AirClubContext);
  if (context === undefined) {
    throw new Error('useAirClub must be used within an AirClubProvider');
  }
  return context;
} 