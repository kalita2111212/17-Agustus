import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Competition {
  id: string;
  name: string;
  category: 'child' | 'adult_individual' | 'adult_group';
  description?: string;
  max_participants?: number;
  created_at: string;
}

export interface Participant {
  id: string;
  block: string;
  house_number: string;
  registration_date: string;
  created_at: string;
}

export interface ParticipantCompetition {
  id: string;
  participant_id: string;
  competition_id: string;
  participant_name: string;
  participant_age?: number;
  additional_participant_name?: string;
  additional_participant_age?: number;
  group_members?: string;
  created_at: string;
}

// Extended types for UI
export interface ParticipantWithCompetitions extends Participant {
  childCompetitions: string[];
  childParticipant1Name: string;
  childParticipant1Age: string;
  childParticipant2Name: string;
  childParticipant2Age: string;
  adultIndividualCompetitions: string[];
  adultParticipant1Name: string;
  adultParticipant2Name: string;
  adultGroupCompetitions: string[];
  groupMembers: string;
}