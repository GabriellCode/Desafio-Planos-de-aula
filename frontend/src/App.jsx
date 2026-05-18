import { Routes, Route, Link, useLocation } from 'react-router-dom';
import LessonPlanList from './pages/LessonPlanList';
import StudentList from './pages/StudentList';
import StudentDashboard from './pages/StudentDashboard';
import LessonPlanForm from './pages/LessonPlanForm';
import { LanguageProvider, useLanguage } from './context/LanguageContext';

function Navbar() {
  const { language, toggleLanguage } = useLanguage();
  const location = useLocation();

  const t = {
    plans: language === 'pt' ? 'Planos de Aula' : 'Lesson Plans',
    students: language === 'pt' ? 'Alunos' : 'Students',
  };

  return (
    <nav className="bg-white/80 backdrop-blur-xl sticky top-0 z-50 border-b border-gray-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <Link to="/" className="flex items-center gap-2 group transition-all duration-300 hover:opacity-80">
            <span className="text-2xl font-black text-gray-900 tracking-widest uppercase">
              BaseDocente<span className="text-green-600">.</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-500">
            <Link to="/" className={`hover:text-green-600 transition-colors ${location.pathname === '/' ? 'text-green-600 font-bold' : ''}`}>{t.plans}</Link>
            <Link to="/students" className={`hover:text-green-600 transition-colors ${location.pathname.startsWith('/student') ? 'text-green-600 font-bold' : ''}`}>{t.students}</Link>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={toggleLanguage}
              className="text-xs font-bold text-gray-500 hover:text-green-600 uppercase tracking-widest transition-colors px-2 py-1 rounded border border-gray-200 hover:border-green-600"
            >
              {language === 'pt' ? 'EN' : 'PT'}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

function App() {
  return (
    <LanguageProvider>
      <div className="min-h-screen bg-slate-50 text-gray-800 font-sans animate-fade-in flex flex-col">
        <Navbar />
        <main className="flex-grow flex flex-col relative">
          <Routes>
            {/* Global Plans */}
            <Route path="/" element={<LessonPlanList />} />
            <Route path="/plan/create" element={<LessonPlanForm />} />
            <Route path="/plan/:id/edit" element={<LessonPlanForm />} />

            {/* Student Management */}
            <Route path="/students" element={<StudentList />} />
            <Route path="/student/:id" element={<StudentDashboard />} />
            <Route path="/student/:studentId/plan/create" element={<LessonPlanForm />} />
            <Route path="/student/:studentId/plan/:id/edit" element={<LessonPlanForm />} />
          </Routes>
        </main>
      </div>
    </LanguageProvider>
  );
}

export default App;
