import React, { useState } from 'react';
import { User, Mail, Phone, Calendar, Users, Trophy, X, CheckCircle, MapPin } from 'lucide-react';
import { registerParticipant, RegistrationFormData } from '../services/competitionService';

interface RegistrationFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: RegistrationFormData) => void;
}

const childCompetitions = [
  { id: 'lomba-bendera', name: 'Lomba Bendera' },
  { id: 'lomba-kelereng', name: 'Lomba Kelereng' },
  { id: 'lomba-makan-kerupuk', name: 'Lomba Makan Kerupuk' },
  { id: 'lomba-hias-sepeda', name: 'Lomba Hias Sepeda (Karnaval)' }
];

const adultIndividualCompetitions = [
  { id: 'lomba-balap-karung', name: 'Lomba Balap Karung' },
  { id: 'lomba-memecahkan-balon', name: 'Lomba Memecahkan Balon' }
];

const adultGroupCompetitions = [
  { id: 'lomba-joget-balon', name: 'Lomba Joget Balon' },
  { id: 'lomba-memindahkan-tepung', name: 'Lomba Memindahkan Tepung' }
];

export default function RegistrationForm({ isOpen, onClose, onSubmit }: RegistrationFormProps) {
  const [formData, setFormData] = useState<RegistrationFormData>({
    block: '',
    houseNumber: '',
    childCompetitions: [],
    childParticipant1Name: '',
    childParticipant1Age: '',
    childParticipant2Name: '',
    childParticipant2Age: '',
    adultIndividualCompetitions: [],
    adultParticipant1Name: '',
    adultParticipant2Name: '',
    adultGroupCompetitions: [],
    groupMembers: ''
  });
  
  const [errors, setErrors] = useState<Partial<RegistrationFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const validateForm = (): boolean => {
    const newErrors: Partial<RegistrationFormData> = {};

    if (!formData.block.trim()) newErrors.block = 'Blok wajib diisi';
    if (!formData.houseNumber.trim()) newErrors.houseNumber = 'No Rumah wajib diisi';

    // Validasi kategori anak
    if (formData.childCompetitions.length > 0) {
      if (!formData.childParticipant1Name.trim()) {
        newErrors.childParticipant1Name = 'Nama Peserta Anak 1 wajib diisi';
      }
      if (!formData.childParticipant1Age.trim()) {
        newErrors.childParticipant1Age = 'Umur Anak 1 wajib diisi';
      } else if (isNaN(Number(formData.childParticipant1Age)) || Number(formData.childParticipant1Age) < 5 || Number(formData.childParticipant1Age) > 17) {
        newErrors.childParticipant1Age = 'Umur anak harus antara 5-17 tahun';
      }
      
      if (formData.childParticipant2Name.trim() && !formData.childParticipant2Age.trim()) {
        newErrors.childParticipant2Age = 'Umur Anak 2 wajib diisi jika nama diisi';
      } else if (formData.childParticipant2Age.trim() && (isNaN(Number(formData.childParticipant2Age)) || Number(formData.childParticipant2Age) < 5 || Number(formData.childParticipant2Age) > 17)) {
        newErrors.childParticipant2Age = 'Umur anak harus antara 5-17 tahun';
      }
    }

    // Validasi kategori dewasa perorangan
    if (formData.adultIndividualCompetitions.length > 0) {
      if (!formData.adultParticipant1Name.trim()) {
        newErrors.adultParticipant1Name = 'Nama Peserta Dewasa 1 wajib diisi';
      }
    }

    // Validasi kategori dewasa kelompok
    if (formData.adultGroupCompetitions.length > 0) {
      if (!formData.groupMembers.trim()) {
        newErrors.groupMembers = 'Daftar anggota kelompok wajib diisi';
      }
    }

    // Minimal harus pilih satu kategori
    if (formData.childCompetitions.length === 0 && 
        formData.adultIndividualCompetitions.length === 0 && 
        formData.adultGroupCompetitions.length === 0) {
      newErrors.childCompetitions = 'Pilih minimal satu kategori lomba';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      // Register participant in Supabase
      await registerParticipant(formData);
      
      setIsSubmitting(false);
      setIsSubmitted(true);
      
      // Pass data to parent component
      onSubmit(formData);
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setIsSubmitted(false);
        setFormData({
          block: '',
          houseNumber: '',
          childCompetitions: [],
          childParticipant1Name: '',
          childParticipant1Age: '',
          childParticipant2Name: '',
          childParticipant2Age: '',
          adultIndividualCompetitions: [],
          adultParticipant1Name: '',
          adultParticipant2Name: '',
          adultGroupCompetitions: [],
          groupMembers: ''
        });
        onClose();
      }, 3000);
    } catch (error) {
      console.error('Registration error:', error);
      setSubmitError('Terjadi kesalahan saat mendaftar. Silakan coba lagi.');
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name as keyof RegistrationFormData]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleCheckboxChange = (category: 'child' | 'adultIndividual' | 'adultGroup', competitionId: string) => {
    const fieldName = category === 'child' ? 'childCompetitions' : 
                     category === 'adultIndividual' ? 'adultIndividualCompetitions' : 
                     'adultGroupCompetitions';
    
    setFormData(prev => {
      const currentCompetitions = prev[fieldName] as string[];
      const isSelected = currentCompetitions.includes(competitionId);
      
      return {
        ...prev,
        [fieldName]: isSelected 
          ? currentCompetitions.filter(id => id !== competitionId)
          : [...currentCompetitions, competitionId]
      };
    });

    // Clear error when user selects competition
    if (errors[fieldName as keyof RegistrationFormData]) {
      setErrors(prev => ({ ...prev, [fieldName]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Trophy className="w-8 h-8 mr-3" />
              <div>
                <h2 className="text-2xl font-bold">Pendaftaran Lomba 17 Agustus</h2>
                <p className="opacity-90">Daftar sekarang dan menangkan hadiah menarik!</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Success Message */}
        {isSubmitted && (
          <div className="p-6 bg-green-50 border-l-4 border-green-500">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-500 mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-green-800">Pendaftaran Berhasil!</h3>
                <p className="text-green-700">Terima kasih telah mendaftar. Data Anda telah tersimpan.</p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {submitError && (
          <div className="p-6 bg-red-50 border-l-4 border-red-500">
            <div className="flex items-center">
              <X className="w-8 h-8 text-red-500 mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-red-800">Pendaftaran Gagal</h3>
                <p className="text-red-700">{submitError}</p>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        {!isSubmitted && (
          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            {/* Alamat */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-red-600" />
                Alamat
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Blok *
                  </label>
                  <input
                    type="text"
                    name="block"
                    value={formData.block}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors ${
                      errors.block ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Contoh: A, B, C"
                  />
                  {errors.block && <p className="text-red-500 text-sm mt-1">{errors.block}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    No Rumah *
                  </label>
                  <input
                    type="text"
                    name="houseNumber"
                    value={formData.houseNumber}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors ${
                      errors.houseNumber ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Contoh: 123"
                  />
                  {errors.houseNumber && <p className="text-red-500 text-sm mt-1">{errors.houseNumber}</p>}
                </div>
              </div>
            </div>

            {/* Kategori Perorangan Anak */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-red-600" />
                Kategori Perorangan Anak
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Pilih Lomba Anak
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {childCompetitions.map(comp => (
                      <label key={comp.id} className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.childCompetitions.includes(comp.id)}
                          onChange={() => handleCheckboxChange('child', comp.id)}
                          className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                        />
                        <span className="ml-3 text-sm font-medium text-gray-700">{comp.name}</span>
                      </label>
                    ))}
                  </div>
                  {errors.childCompetitions && <p className="text-red-500 text-sm mt-1">{errors.childCompetitions}</p>}
                </div>

                {formData.childCompetitions.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nama Peserta Anak 1 *
                      </label>
                      <input
                        type="text"
                        name="childParticipant1Name"
                        value={formData.childParticipant1Name}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors ${
                          errors.childParticipant1Name ? 'border-red-500 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder="Nama lengkap anak"
                      />
                      {errors.childParticipant1Name && <p className="text-red-500 text-sm mt-1">{errors.childParticipant1Name}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Umur Anak 1 *
                      </label>
                      <input
                        type="number"
                        name="childParticipant1Age"
                        value={formData.childParticipant1Age}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors ${
                          errors.childParticipant1Age ? 'border-red-500 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder="Umur"
                        min="5"
                        max="17"
                      />
                      {errors.childParticipant1Age && <p className="text-red-500 text-sm mt-1">{errors.childParticipant1Age}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nama Peserta Anak 2 (Opsional)
                      </label>
                      <input
                        type="text"
                        name="childParticipant2Name"
                        value={formData.childParticipant2Name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                        placeholder="Nama lengkap anak kedua"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Umur Anak 2
                      </label>
                      <input
                        type="number"
                        name="childParticipant2Age"
                        value={formData.childParticipant2Age}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors ${
                          errors.childParticipant2Age ? 'border-red-500 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder="Umur"
                        min="5"
                        max="17"
                      />
                      {errors.childParticipant2Age && <p className="text-red-500 text-sm mt-1">{errors.childParticipant2Age}</p>}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Kategori Perorangan Dewasa */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2 text-red-600" />
                Kategori Perorangan Dewasa
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Pilih Lomba Dewasa Perorangan
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {adultIndividualCompetitions.map(comp => (
                      <label key={comp.id} className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.adultIndividualCompetitions.includes(comp.id)}
                          onChange={() => handleCheckboxChange('adultIndividual', comp.id)}
                          className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                        />
                        <span className="ml-3 text-sm font-medium text-gray-700">{comp.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {formData.adultIndividualCompetitions.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-green-50 rounded-lg">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nama Peserta Dewasa 1 *
                      </label>
                      <input
                        type="text"
                        name="adultParticipant1Name"
                        value={formData.adultParticipant1Name}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors ${
                          errors.adultParticipant1Name ? 'border-red-500 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder="Nama lengkap peserta"
                      />
                      {errors.adultParticipant1Name && <p className="text-red-500 text-sm mt-1">{errors.adultParticipant1Name}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nama Peserta Dewasa 2 (Opsional)
                      </label>
                      <input
                        type="text"
                        name="adultParticipant2Name"
                        value={formData.adultParticipant2Name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                        placeholder="Nama lengkap peserta kedua"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Kategori Kelompok Dewasa */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Trophy className="w-5 h-5 mr-2 text-red-600" />
                Kategori Kelompok Dewasa
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Pilih Lomba Kelompok
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {adultGroupCompetitions.map(comp => (
                      <label key={comp.id} className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.adultGroupCompetitions.includes(comp.id)}
                          onChange={() => handleCheckboxChange('adultGroup', comp.id)}
                          className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                        />
                        <span className="ml-3 text-sm font-medium text-gray-700">{comp.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {formData.adultGroupCompetitions.length > 0 && (
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Daftar Anggota Kelompok *
                    </label>
                    <textarea
                      name="groupMembers"
                      value={formData.groupMembers}
                      onChange={handleInputChange}
                      rows={4}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors ${
                        errors.groupMembers ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Tulis nama setiap anggota di baris baru&#10;Contoh:&#10;Ahmad Rizki&#10;Siti Nurhaliza&#10;Budi Santoso"
                    />
                    {errors.groupMembers && <p className="text-red-500 text-sm mt-1">{errors.groupMembers}</p>}
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Mendaftar...
                  </>
                ) : (
                  'Daftar Sekarang'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}