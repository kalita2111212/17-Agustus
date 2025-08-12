import { supabase, Competition, Participant, ParticipantCompetition, ParticipantWithCompetitions } from '../lib/supabase';

export interface RegistrationFormData {
  block: string;
  houseNumber: string;
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

// Get all competitions
export async function getCompetitions(): Promise<Competition[]> {
  const { data, error } = await supabase
    .from('competitions')
    .select('*')
    .order('category', { ascending: true });

  if (error) {
    console.error('Error fetching competitions:', error);
    throw error;
  }

  return data || [];
}

// Get competitions by category
export async function getCompetitionsByCategory(category: string): Promise<Competition[]> {
  const { data, error } = await supabase
    .from('competitions')
    .select('*')
    .eq('category', category)
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching competitions by category:', error);
    throw error;
  }

  return data || [];
}

// Register participant
export async function registerParticipant(formData: RegistrationFormData): Promise<string> {
  try {
    // First, create the participant
    const { data: participant, error: participantError } = await supabase
      .from('participants')
      .insert({
        block: formData.block,
        house_number: formData.houseNumber,
        registration_date: new Date().toISOString()
      })
      .select()
      .single();

    if (participantError) {
      console.error('Error creating participant:', participantError);
      throw participantError;
    }

    const participantId = participant.id;

    // Get all competitions to map names to IDs
    const competitions = await getCompetitions();
    const competitionMap = new Map(competitions.map(comp => [comp.name.toLowerCase().replace(/\s+/g, '-').replace(/[()]/g, ''), comp.id]));

    // Prepare participant competitions data
    const participantCompetitions: Omit<ParticipantCompetition, 'id' | 'created_at'>[] = [];

    // Handle child competitions
    if (formData.childCompetitions.length > 0 && formData.childParticipant1Name) {
      for (const competitionKey of formData.childCompetitions) {
        const competitionId = competitionMap.get(competitionKey);
        if (competitionId) {
          participantCompetitions.push({
            participant_id: participantId,
            competition_id: competitionId,
            participant_name: formData.childParticipant1Name,
            participant_age: formData.childParticipant1Age ? parseInt(formData.childParticipant1Age) : undefined,
            additional_participant_name: formData.childParticipant2Name || undefined,
            additional_participant_age: formData.childParticipant2Age ? parseInt(formData.childParticipant2Age) : undefined
          });
        }
      }
    }

    // Handle adult individual competitions
    if (formData.adultIndividualCompetitions.length > 0 && formData.adultParticipant1Name) {
      for (const competitionKey of formData.adultIndividualCompetitions) {
        const competitionId = competitionMap.get(competitionKey);
        if (competitionId) {
          participantCompetitions.push({
            participant_id: participantId,
            competition_id: competitionId,
            participant_name: formData.adultParticipant1Name,
            additional_participant_name: formData.adultParticipant2Name || undefined
          });
        }
      }
    }

    // Handle adult group competitions
    if (formData.adultGroupCompetitions.length > 0 && formData.groupMembers) {
      for (const competitionKey of formData.adultGroupCompetitions) {
        const competitionId = competitionMap.get(competitionKey);
        if (competitionId) {
          participantCompetitions.push({
            participant_id: participantId,
            competition_id: competitionId,
            participant_name: 'Tim Kelompok', // Default name for group
            group_members: formData.groupMembers
          });
        }
      }
    }

    // Insert participant competitions
    if (participantCompetitions.length > 0) {
      const { error: competitionsError } = await supabase
        .from('participant_competitions')
        .insert(participantCompetitions);

      if (competitionsError) {
        console.error('Error creating participant competitions:', competitionsError);
        throw competitionsError;
      }
    }

    return participantId;
  } catch (error) {
    console.error('Error in registerParticipant:', error);
    throw error;
  }
}

// Get all participants with their competitions
export async function getParticipantsWithCompetitions(): Promise<ParticipantWithCompetitions[]> {
  try {
    // Get all participants
    const { data: participants, error: participantsError } = await supabase
      .from('participants')
      .select('*')
      .order('created_at', { ascending: false });

    if (participantsError) {
      console.error('Error fetching participants:', participantsError);
      throw participantsError;
    }

    if (!participants || participants.length === 0) {
      return [];
    }

    // Get all competitions and participant competitions
    const [competitions, participantCompetitions] = await Promise.all([
      getCompetitions(),
      supabase
        .from('participant_competitions')
        .select('*')
        .then(({ data, error }) => {
          if (error) throw error;
          return data || [];
        })
    ]);

    // Create competition maps
    const competitionMap = new Map(competitions.map(comp => [comp.id, comp]));
    const competitionNameToKey = new Map([
      ['Lomba Bendera', 'lomba-bendera'],
      ['Lomba Kelereng', 'lomba-kelereng'],
      ['Lomba Makan Kerupuk', 'lomba-makan-kerupuk'],
      ['Lomba Hias Sepeda (Karnaval)', 'lomba-hias-sepeda'],
      ['Lomba Balap Karung', 'lomba-balap-karung'],
      ['Lomba Memecahkan Balon', 'lomba-memecahkan-balon'],
      ['Lomba Joget Balon', 'lomba-joget-balon'],
      ['Lomba Memindahkan Tepung', 'lomba-memindahkan-tepung']
    ]);

    // Transform participants data
    const result: ParticipantWithCompetitions[] = participants.map(participant => {
      const participantComps = participantCompetitions.filter(pc => pc.participant_id === participant.id);
      
      const childCompetitions: string[] = [];
      const adultIndividualCompetitions: string[] = [];
      const adultGroupCompetitions: string[] = [];
      
      let childParticipant1Name = '';
      let childParticipant1Age = '';
      let childParticipant2Name = '';
      let childParticipant2Age = '';
      let adultParticipant1Name = '';
      let adultParticipant2Name = '';
      let groupMembers = '';

      participantComps.forEach(pc => {
        const competition = competitionMap.get(pc.competition_id);
        if (!competition) return;

        const competitionKey = competitionNameToKey.get(competition.name);
        if (!competitionKey) return;

        if (competition.category === 'child') {
          childCompetitions.push(competitionKey);
          if (!childParticipant1Name) {
            childParticipant1Name = pc.participant_name;
            childParticipant1Age = pc.participant_age?.toString() || '';
            childParticipant2Name = pc.additional_participant_name || '';
            childParticipant2Age = pc.additional_participant_age?.toString() || '';
          }
        } else if (competition.category === 'adult_individual') {
          adultIndividualCompetitions.push(competitionKey);
          if (!adultParticipant1Name) {
            adultParticipant1Name = pc.participant_name;
            adultParticipant2Name = pc.additional_participant_name || '';
          }
        } else if (competition.category === 'adult_group') {
          adultGroupCompetitions.push(competitionKey);
          if (!groupMembers) {
            groupMembers = pc.group_members || '';
          }
        }
      });

      return {
        ...participant,
        childCompetitions,
        childParticipant1Name,
        childParticipant1Age,
        childParticipant2Name,
        childParticipant2Age,
        adultIndividualCompetitions,
        adultParticipant1Name,
        adultParticipant2Name,
        adultGroupCompetitions,
        groupMembers
      };
    });

    return result;
  } catch (error) {
    console.error('Error in getParticipantsWithCompetitions:', error);
    throw error;
  }
}

// Get participant count
export async function getParticipantCount(): Promise<number> {
  const { count, error } = await supabase
    .from('participants')
    .select('*', { count: 'exact', head: true });

  if (error) {
    console.error('Error getting participant count:', error);
    throw error;
  }

  return count || 0;
}

// Get competition statistics
export async function getCompetitionStats() {
  try {
    const { data, error } = await supabase
      .from('participant_competitions')
      .select(`
        competition_id,
        competitions!inner(name, category)
      `);

    if (error) throw error;

    const stats = {
      child: new Set(),
      adult_individual: new Set(),
      adult_group: new Set()
    };

    data?.forEach(pc => {
      const category = pc.competitions.category as keyof typeof stats;
      stats[category].add(pc.competition_id);
    });

    return {
      childCompetitions: stats.child.size,
      adultIndividualCompetitions: stats.adult_individual.size,
      adultGroupCompetitions: stats.adult_group.size
    };
  } catch (error) {
    console.error('Error getting competition stats:', error);
    return {
      childCompetitions: 0,
      adultIndividualCompetitions: 0,
      adultGroupCompetitions: 0
    };
  }
}