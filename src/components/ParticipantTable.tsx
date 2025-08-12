import React from 'react';
import { Trophy, Users, User, MapPin, Calendar } from 'lucide-react';
import { ParticipantWithCompetitions } from '../lib/supabase';

interface ParticipantTableProps {
  participants: ParticipantWithCompetitions[];
}

const competitionNames: { [key: string]: string } = {
  'lomba-bendera': 'Lomba Bendera',
  'lomba-kelereng': 'Lomba Kelereng',
  'lomba-makan-kerupuk': 'Lomba Makan Kerupuk',
  'lomba-hias-sepeda': 'Lomba Hias Sepeda (Karnaval)',
  'lomba-balap-karung': 'Lomba Balap Karung',
  'lomba-memecahkan-balon': 'Lomba Memecahkan Balon',
  'lomba-joget-balon': 'Lomba Joget Balon',
  'lomba-memindahkan-tepung': 'Lomba Memindahkan Tepung'
};

export default function ParticipantTable({ participants }: ParticipantTableProps) {
  const getCompetitionsByCategory = () => {
    const categories = {
      child: new Set<string>(),
      adultIndividual: new Set<string>(),
      adultGroup: new Set<string>()
    };

    participants.forEach(participant => {
      participant.childCompetitions.forEach(comp => categories.child.add(comp));
      participant.adultIndividualCompetitions.forEach(comp => categories.adultIndividual.add(comp));
      participant.adultGroupCompetitions.forEach(comp => categories.adultGroup.add(comp));
    });

    return categories;
  };

  const categories = getCompetitionsByCategory();

  const getParticipantsForCompetition = (competitionId: string, category: 'child' | 'adultIndividual' | 'adultGroup') => {
    return participants.filter(participant => {
      if (category === 'child') return participant.childCompetitions.includes(competitionId);
      if (category === 'adultIndividual') return participant.adultIndividualCompetitions.includes(competitionId);
      if (category === 'adultGroup') return participant.adultGroupCompetitions.includes(competitionId);
      return false;
    });
  };

  if (participants.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
        <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">Belum Ada Peserta</h3>
        <p className="text-gray-500">Daftar sekarang untuk menjadi peserta pertama!</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Peserta</p>
              <p className="text-3xl font-bold">{participants.length}</p>
            </div>
            <Users className="w-10 h-10 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Lomba Anak</p>
              <p className="text-3xl font-bold">{categories.child.size}</p>
            </div>
            <User className="w-10 h-10 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Lomba Dewasa</p>
              <p className="text-3xl font-bold">{categories.adultIndividual.size}</p>
            </div>
            <Trophy className="w-10 h-10 text-orange-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Lomba Kelompok</p>
              <p className="text-3xl font-bold">{categories.adultGroup.size}</p>
            </div>
            <Users className="w-10 h-10 text-purple-200" />
          </div>
        </div>
      </div>

      {/* Competition Tables */}
      {/* Kategori Anak */}
      {categories.child.size > 0 && (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
            <h3 className="text-2xl font-bold flex items-center">
              <User className="w-6 h-6 mr-2" />
              Kategori Perorangan Anak
            </h3>
          </div>
          
          <div className="p-6 space-y-6">
            {Array.from(categories.child).map(competitionId => {
              const competitionParticipants = getParticipantsForCompetition(competitionId, 'child');
              return (
                <div key={competitionId} className="border rounded-lg overflow-hidden">
                  <div className="bg-blue-50 px-4 py-3 border-b">
                    <h4 className="font-semibold text-blue-800 flex items-center">
                      <Trophy className="w-4 h-4 mr-2" />
                      {competitionNames[competitionId]} ({competitionParticipants.length} peserta)
                    </h4>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">No</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Alamat</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Peserta 1</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Umur</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Peserta 2</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Umur</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal Daftar</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {competitionParticipants.map((participant, index) => (
                          <tr key={participant.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-900">{index + 1}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              <div className="flex items-center">
                                <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                                Blok {participant.block} No. {participant.house_number}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                              {participant.childParticipant1Name}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {participant.childParticipant1Age} tahun
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {participant.childParticipant2Name || '-'}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {participant.childParticipant2Age ? `${participant.childParticipant2Age} tahun` : '-'}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500">
                              <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                {new Date(participant.registration_date).toLocaleDateString('id-ID')}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Kategori Dewasa Perorangan */}
      {categories.adultIndividual.size > 0 && (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6">
            <h3 className="text-2xl font-bold flex items-center">
              <Trophy className="w-6 h-6 mr-2" />
              Kategori Perorangan Dewasa
            </h3>
          </div>
          
          <div className="p-6 space-y-6">
            {Array.from(categories.adultIndividual).map(competitionId => {
              const competitionParticipants = getParticipantsForCompetition(competitionId, 'adultIndividual');
              return (
                <div key={competitionId} className="border rounded-lg overflow-hidden">
                  <div className="bg-green-50 px-4 py-3 border-b">
                    <h4 className="font-semibold text-green-800 flex items-center">
                      <Trophy className="w-4 h-4 mr-2" />
                      {competitionNames[competitionId]} ({competitionParticipants.length} peserta)
                    </h4>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">No</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Alamat</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Peserta 1</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Peserta 2</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal Daftar</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {competitionParticipants.map((participant, index) => (
                          <tr key={participant.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-900">{index + 1}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              <div className="flex items-center">
                                <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                                Blok {participant.block} No. {participant.house_number}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                              {participant.adultParticipant1Name}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {participant.adultParticipant2Name || '-'}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500">
                              <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                {new Date(participant.registration_date).toLocaleDateString('id-ID')}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Kategori Kelompok Dewasa */}
      {categories.adultGroup.size > 0 && (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6">
            <h3 className="text-2xl font-bold flex items-center">
              <Users className="w-6 h-6 mr-2" />
              Kategori Kelompok Dewasa
            </h3>
          </div>
          
          <div className="p-6 space-y-6">
            {Array.from(categories.adultGroup).map(competitionId => {
              const competitionParticipants = getParticipantsForCompetition(competitionId, 'adultGroup');
              return (
                <div key={competitionId} className="border rounded-lg overflow-hidden">
                  <div className="bg-purple-50 px-4 py-3 border-b">
                    <h4 className="font-semibold text-purple-800 flex items-center">
                      <Trophy className="w-4 h-4 mr-2" />
                      {competitionNames[competitionId]} ({competitionParticipants.length} tim)
                    </h4>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">No</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Alamat</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Anggota Tim</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal Daftar</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {competitionParticipants.map((participant, index) => (
                          <tr key={participant.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-900">{index + 1}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              <div className="flex items-center">
                                <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                                Blok {participant.block} No. {participant.house_number}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              <div className="space-y-1">
                                {participant.groupMembers.split('\n').filter(member => member.trim()).map((member, idx) => (
                                  <div key={idx} className="flex items-center">
                                    <span className="w-5 h-5 bg-purple-100 text-purple-600 rounded-full text-xs flex items-center justify-center mr-2">
                                      {idx + 1}
                                    </span>
                                    {member.trim()}
                                  </div>
                                ))}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500">
                              <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                {new Date(participant.registration_date).toLocaleDateString('id-ID')}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}