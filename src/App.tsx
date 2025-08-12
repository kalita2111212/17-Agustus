import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Trophy, Users, Flag, Heart, Star, ArrowRight, ChevronDown, Award } from 'lucide-react';
import RegistrationForm from './components/RegistrationForm';
import ParticipantTable from './components/ParticipantTable';
import { getParticipantsWithCompetitions, getParticipantCount, getCompetitionStats, RegistrationFormData } from './services/competitionService';
import { ParticipantWithCompetitions } from './lib/supabase';

const heroes = [
  {
    name: 'Ir. Soekarno',
    role: 'Presiden Pertama RI',
    birth: '1901-1970',
    achievement: 'Proklamator Kemerdekaan Indonesia',
    image: 'https://images.pexels.com/photos/8566473/pexels-photo-8566473.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    name: 'Drs. Mohammad Hatta',
    role: 'Wakil Presiden Pertama',
    birth: '1902-1980',
    achievement: 'Bapak Koperasi Indonesia',
    image: 'https://images.pexels.com/photos/8112199/pexels-photo-8112199.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    name: 'R.A. Kartini',
    role: 'Pahlawan Emansipasi Wanita',
    birth: '1879-1904',
    achievement: 'Pelopor Kebangkitan Perempuan Indonesia',
    image: 'https://images.pexels.com/photos/8112173/pexels-photo-8112173.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    name: 'Cut Nyak Dhien',
    role: 'Pahlawan Perang Aceh',
    birth: '1848-1908',
    achievement: 'Pejuang Kemerdekaan dari Aceh',
    image: 'https://images.pexels.com/photos/8566471/pexels-photo-8566471.jpeg?auto=compress&cs=tinysrgb&w=400'
  }
];

const timeline = [
  { year: '1945', event: 'Proklamasi Kemerdekaan Indonesia', description: '17 Agustus 1945, Soekarno-Hatta memproklamasikan kemerdekaan' },
  { year: '1945', event: 'Pembentukan PPKI', description: 'Panitia Persiapan Kemerdekaan Indonesia dibentuk' },
  { year: '1945', event: 'Konstitusi Pertama', description: 'UUD 1945 disahkan sebagai konstitusi pertama' },
  { year: '1949', event: 'Pengakuan Kedaulatan', description: 'Belanda mengakui kedaulatan Indonesia' }
];

const quizQuestions = [
  {
    question: 'Kapan Indonesia memproklamasikan kemerdekaan?',
    options: ['17 Agustus 1945', '17 Agustus 1944', '17 Agustus 1946', '17 Agustus 1947'],
    correct: 0
  },
  {
    question: 'Siapa yang membacakan teks proklamasi?',
    options: ['Mohammad Hatta', 'Ir. Soekarno', 'Sutan Sjahrir', 'Tan Malaka'],
    correct: 1
  },
  {
    question: 'Di mana proklamasi kemerdekaan dibacakan?',
    options: ['Istana Merdeka', 'Gedung Sate', 'Jalan Pegangsaan Timur No. 56', 'Monas'],
    correct: 2
  },
  {
    question: 'Apa bunyi awal teks proklamasi?',
    options: ['Kami bangsa Indonesia', 'Dengan ini kami', 'Hari ini tanggal', 'Proklamasi'],
    correct: 0
  }
];

const competitions = [
  { name: 'Lomba Makan Kerupuk', winner: 'Ahmad Rizki', time: '45 detik' },
  { name: 'Lomba Balap Karung', winner: 'Siti Nurhaliza', time: '1 menit 20 detik' },
  { name: 'Lomba Panjat Pinang', winner: 'Tim Garuda', time: '3 menit 15 detik' },
  { name: 'Lomba Tarik Tambang', winner: 'RT 05', time: '2 menit 30 detik' }
];

function App() {
  const [currentQuiz, setCurrentQuiz] = useState(0);
  const [score, setScore] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [participants, setParticipants] = useState<ParticipantWithCompetitions[]>([]);
  const [showParticipantTable, setShowParticipantTable] = useState(false);
  const [participantCount, setParticipantCount] = useState(0);
  const [competitionStats, setCompetitionStats] = useState({
    childCompetitions: 0,
    adultIndividualCompetitions: 0,
    adultGroupCompetitions: 0
  });
  const [isLoading, setIsLoading] = useState(false);

  // Load participants and stats
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [participantsData, count, stats] = await Promise.all([
        getParticipantsWithCompetitions(),
        getParticipantCount(),
        getCompetitionStats()
      ]);
      
      setParticipants(participantsData);
      setParticipantCount(count);
      setCompetitionStats(stats);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const currentYear = now.getFullYear();
      let targetDate = new Date(currentYear, 7, 17); // August 17
      
      if (now > targetDate) {
        targetDate = new Date(currentYear + 1, 7, 17);
      }
      
      const difference = targetDate.getTime() - now.getTime();
      
      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);
        
        setTimeLeft({ days, hours, minutes, seconds });
      }
    };

    const timer = setInterval(calculateTimeLeft, 1000);
    calculateTimeLeft();
    
    return () => clearInterval(timer);
  }, []);

  const handleQuizAnswer = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
    setShowResult(true);
    
    if (answerIndex === quizQuestions[currentQuiz].correct) {
      setScore(score + 1);
    }
    
    setTimeout(() => {
      if (currentQuiz < quizQuestions.length - 1) {
        setCurrentQuiz(currentQuiz + 1);
        setSelectedAnswer(null);
        setShowResult(false);
      } else {
        setQuizFinished(true);
      }
    }, 1500);
  };

  const resetQuiz = () => {
    setCurrentQuiz(0);
    setScore(0);
    setQuizStarted(false);
    setQuizFinished(false);
    setSelectedAnswer(null);
    setShowResult(false);
  };

  const handleRegistrationSubmit = async (formData: RegistrationFormData) => {
    // Reload data after successful registration
    await loadData();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-red-600 via-red-700 to-red-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-20 h-20 bg-yellow-400 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-32 h-32 bg-white rounded-full opacity-10 animate-bounce"></div>
          <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-yellow-300 rounded-full opacity-15"></div>
        </div>
        
        <div className="relative z-10 text-center px-6 max-w-4xl">
          <div className="mb-8">
            <Flag className="w-16 h-16 mx-auto mb-4 text-yellow-300" />
            <h1 className="text-6xl md:text-8xl font-bold mb-4 bg-gradient-to-r from-white to-yellow-200 bg-clip-text text-transparent">
              17 AGUSTUS
            </h1>
            <p className="text-2xl md:text-3xl font-semibold mb-2">HARI KEMERDEKAAN</p>
            <p className="text-xl md:text-2xl opacity-90">REPUBLIK INDONESIA</p>
          </div>
          
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-8 mb-8">
            <h3 className="text-2xl font-semibold mb-4 flex items-center justify-center">
              <Clock className="w-6 h-6 mr-2" />
              Countdown ke 17 Agustus
            </h3>
            <div className="grid grid-cols-4 gap-4 text-center">
              <div className="bg-red-500 bg-opacity-50 rounded-lg p-4">
                <div className="text-3xl font-bold">{timeLeft.days}</div>
                <div className="text-sm">Hari</div>
              </div>
              <div className="bg-red-500 bg-opacity-50 rounded-lg p-4">
                <div className="text-3xl font-bold">{timeLeft.hours}</div>
                <div className="text-sm">Jam</div>
              </div>
              <div className="bg-red-500 bg-opacity-50 rounded-lg p-4">
                <div className="text-3xl font-bold">{timeLeft.minutes}</div>
                <div className="text-sm">Menit</div>
              </div>
              <div className="bg-red-500 bg-opacity-50 rounded-lg p-4">
                <div className="text-3xl font-bold">{timeLeft.seconds}</div>
                <div className="text-sm">Detik</div>
              </div>
            </div>
          </div>
          
          <ChevronDown className="w-8 h-8 animate-bounce mx-auto" />
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-red-600" />
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Timeline Kemerdekaan</h2>
            <p className="text-xl text-gray-600">Perjalanan menuju Indonesia Merdeka</p>
          </div>
          
          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 bg-red-600 h-full"></div>
            
            {timeline.map((item, index) => (
              <div key={index} className={`relative flex items-center mb-12 ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                <div className={`w-1/2 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8 text-left'}`}>
                  <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="text-2xl font-bold text-red-700 mb-2">{item.year}</div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">{item.event}</h3>
                    <p className="text-gray-600">{item.description}</p>
                  </div>
                </div>
                
                <div className="absolute left-1/2 transform -translate-x-1/2 w-6 h-6 bg-red-600 rounded-full border-4 border-white shadow-lg"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Heroes Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <Heart className="w-16 h-16 mx-auto mb-4 text-red-600" />
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Pahlawan Nasional</h2>
            <p className="text-xl text-gray-600">Mengenang jasa para pejuang kemerdekaan</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {heroes.map((hero, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden">
                <div className="h-48 bg-gradient-to-br from-red-400 to-red-600 relative overflow-hidden">
                  <img 
                    src={hero.image} 
                    alt={hero.name}
                    className="w-full h-full object-cover opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{hero.name}</h3>
                  <p className="text-red-600 font-semibold mb-2">{hero.role}</p>
                  <p className="text-sm text-gray-500 mb-3">{hero.birth}</p>
                  <p className="text-sm text-gray-600">{hero.achievement}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quiz Section */}
      <section className="py-20 bg-red-600 text-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <Star className="w-16 h-16 mx-auto mb-4" />
            <h2 className="text-4xl font-bold mb-4">Kuis Indonesia</h2>
            <p className="text-xl opacity-90">Seberapa tahu kamu tentang kemerdekaan Indonesia?</p>
          </div>
          
          {!quizStarted ? (
            <div className="text-center bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-8">
              <h3 className="text-2xl font-semibold mb-4">Siap untuk tantangan?</h3>
              <p className="text-lg opacity-90 mb-6">
                {quizQuestions.length} pertanyaan menanti untuk menguji pengetahuan kamu!
              </p>
              <button
                onClick={() => setQuizStarted(true)}
                className="bg-yellow-400 hover:bg-yellow-500 text-red-800 font-bold py-4 px-8 rounded-full text-xl transition-all duration-300 transform hover:scale-105"
              >
                Mulai Kuis
              </button>
            </div>
          ) : quizFinished ? (
            <div className="text-center bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-8">
              <Trophy className="w-20 h-20 mx-auto mb-4 text-yellow-400" />
              <h3 className="text-3xl font-bold mb-4">Kuis Selesai!</h3>
              <p className="text-2xl mb-4">Skor kamu: {score}/{quizQuestions.length}</p>
              <p className="text-lg opacity-90 mb-6">
                {score === quizQuestions.length ? "Sempurna! Kamu benar-benar paham sejarah Indonesia!" :
                 score >= quizQuestions.length * 0.7 ? "Bagus sekali! Pengetahuan kamu sudah cukup baik." :
                 "Tetap semangat! Belajar lagi tentang sejarah Indonesia ya!"}
              </p>
              <button
                onClick={resetQuiz}
                className="bg-yellow-400 hover:bg-yellow-500 text-red-800 font-bold py-3 px-6 rounded-full transition-all duration-300"
              >
                Ulangi Kuis
              </button>
            </div>
          ) : (
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-8">
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg">Pertanyaan {currentQuiz + 1} dari {quizQuestions.length}</span>
                  <span className="text-lg">Skor: {score}</span>
                </div>
                <div className="w-full bg-white bg-opacity-20 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentQuiz + 1) / quizQuestions.length) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <h3 className="text-2xl font-semibold mb-6">{quizQuestions[currentQuiz].question}</h3>
              
              <div className="grid grid-cols-1 gap-4">
                {quizQuestions[currentQuiz].options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuizAnswer(index)}
                    disabled={showResult}
                    className={`p-4 rounded-lg text-left transition-all duration-300 ${
                      showResult
                        ? index === quizQuestions[currentQuiz].correct
                          ? 'bg-green-500 bg-opacity-80'
                          : index === selectedAnswer
                          ? 'bg-red-500 bg-opacity-80'
                          : 'bg-white bg-opacity-20'
                        : 'bg-white bg-opacity-20 hover:bg-opacity-30 transform hover:scale-105'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <Users className="w-16 h-16 mx-auto mb-4 text-red-600" />
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Indonesia Hari Ini</h2>
            <p className="text-xl text-gray-600">Fakta menarik tentang Indonesia</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-8 bg-gradient-to-br from-red-50 to-red-100 rounded-2xl shadow-lg">
              <div className="text-4xl font-bold text-red-600 mb-2">{isLoading ? '...' : participantCount}</div>
              <div className="text-gray-700 font-semibold">Total Peserta</div>
            </div>
            <div className="text-center p-8 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl shadow-lg">
              <div className="text-4xl font-bold text-blue-600 mb-2">{isLoading ? '...' : competitionStats.childCompetitions}</div>
              <div className="text-gray-700 font-semibold">Lomba Anak</div>
            </div>
            <div className="text-center p-8 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl shadow-lg">
              <div className="text-4xl font-bold text-green-600 mb-2">{isLoading ? '...' : competitionStats.adultIndividualCompetitions}</div>
              <div className="text-gray-700 font-semibold">Lomba Dewasa</div>
            </div>
            <div className="text-center p-8 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl shadow-lg">
              <div className="text-4xl font-bold text-yellow-600 mb-2">{isLoading ? '...' : competitionStats.adultGroupCompetitions}</div>
              <div className="text-gray-700 font-semibold">Lomba Kelompok</div>
            </div>
          </div>
        </div>
      </section>

      {/* Competition Results */}
      <section className="py-20 bg-gradient-to-br from-yellow-50 to-orange-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <Award className="w-16 h-16 mx-auto mb-4 text-orange-600" />
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Hasil Lomba 17 Agustus</h2>
            <p className="text-xl text-gray-600 mb-8">Para juara lomba kemerdekaan</p>
            
            <button
              onClick={() => setShowRegistrationForm(true)}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-4 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl mb-8"
            >
              🏆 Daftar Lomba Sekarang
            </button>
            
            <button
              onClick={() => setShowParticipantTable(!showParticipantTable)}
              className="ml-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl mb-8"
            >
              📋 {showParticipantTable ? 'Sembunyikan' : 'Lihat'} Daftar Peserta ({isLoading ? '...' : participantCount})
            </button>
          </div>
          
          {showParticipantTable && (
            <div className="mb-16">
              <ParticipantTable participants={participants} />
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {competitions.map((comp, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{comp.name}</h3>
                    <p className="text-orange-600 font-semibold mb-1">🏆 Juara: {comp.winner}</p>
                    <p className="text-gray-600">⏱️ Waktu: {comp.time}</p>
                  </div>
                  <div className="text-4xl">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🏆'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center mb-4">
                <Flag className="w-8 h-8 mr-2 text-red-500" />
                <h3 className="text-2xl font-bold">Indonesia Merdeka</h3>
              </div>
              <p className="text-gray-300">
                Merayakan kemerdekaan Indonesia dengan penuh kebanggaan dan semangat persatuan.
              </p>
            </div>
            
            <div>
              <h4 className="text-xl font-semibold mb-4">Link Berguna</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-red-400 transition-colors">Sejarah Indonesia</a></li>
                <li><a href="#" className="hover:text-red-400 transition-colors">Pahlawan Nasional</a></li>
                <li><a href="#" className="hover:text-red-400 transition-colors">Budaya Indonesia</a></li>
                <li><a href="#" className="hover:text-red-400 transition-colors">Wisata Indonesia</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-xl font-semibold mb-4">Kontak</h4>
              <div className="text-gray-300 space-y-2">
                <p>🇮🇩 Republik Indonesia</p>
                <p>📧 info@indonesia.go.id</p>
                <p>🌐 www.indonesia.go.id</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-700 pt-8 text-center">
            <p className="text-gray-300">
              © 2024 Website 17 Agustus. Dibuat dengan 🇮🇩 untuk Indonesia.
            </p>
            <p className="text-sm text-gray-400 mt-2">
              "Merdeka atau Mati!" - Bung Tomo
            </p>
          </div>
        </div>
      </footer>
      
      {/* Registration Form Modal */}
      <RegistrationForm 
        isOpen={showRegistrationForm} 
        onClose={() => setShowRegistrationForm(false)} 
        onSubmit={handleRegistrationSubmit}
      />
    </div>
  );
}

export default App;