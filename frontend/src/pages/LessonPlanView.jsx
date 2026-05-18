import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Calendar, User, BookOpen, Tag } from 'lucide-react';
import { getLessonPlan } from '../api';
import { useLanguage } from '../context/LanguageContext';
import { format } from 'date-fns';

export default function LessonPlanView() {
  const { id, studentId } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLessonPlan(id)
      .then(setPlan)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const t = {
    back: language === 'pt' ? 'Voltar' : 'Back',
    edit: language === 'pt' ? 'Editar Plano' : 'Edit Plan',
    subject: language === 'pt' ? 'Disciplina' : 'Subject',
    noStudent: language === 'pt' ? 'Plano Avulso' : 'Global Plan',
    objective: language === 'pt' ? 'Objetivo Principal' : 'Main Objective',
    summary: language === 'pt' ? 'Resumo / Ementa' : 'Summary',
    contents: language === 'pt' ? 'Conteúdo Detalhado' : 'Detailed Contents',
    resources: language === 'pt' ? 'Recursos de Apoio' : 'Support Resources',
    notFound: language === 'pt' ? 'Plano não encontrado.' : 'Plan not found.'
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-900 bg-slate-50"><div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  if (!plan) {
    return (
      <div className="w-full flex flex-col items-center mt-20">
        <p className="text-xl text-gray-500">{t.notFound}</p>
        <button onClick={() => navigate(studentId ? `/student/${studentId}` : '/')} className="mt-4 text-green-600 font-bold underline">
          {t.back}
        </button>
      </div>
    );
  }

  const backUrl = studentId ? `/student/${studentId}` : '/';
  const editUrl = studentId ? `/student/${studentId}/plan/${id}/edit` : `/plan/${id}/edit`;

  return (
    <div className="w-full flex flex-col items-center pb-20 relative z-10 animate-fade-in mt-10">
      <div className="w-full max-w-4xl px-4 sm:px-6 lg:px-8">
        
        <div className="flex justify-between items-center mb-8">
          <button onClick={() => navigate(backUrl)} className="flex items-center text-sm font-bold text-gray-500 hover:text-green-600 transition-colors uppercase tracking-widest">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t.back}
          </button>
          
          <Link to={editUrl} className="flex items-center text-sm font-bold text-gray-500 hover:text-green-600 transition-colors uppercase tracking-widest bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm hover:border-green-500">
            <Edit className="w-4 h-4 mr-2" />
            {t.edit}
          </Link>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden">
          
          {/* Header */}
          <div className="p-8 md:p-12 border-b border-gray-100 bg-gray-50/30">
            <div className="flex gap-2 mb-4">
              <span className="inline-flex items-center bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                <BookOpen className="w-3 h-3 mr-1" /> {plan.subject}
              </span>
              {plan.tags && plan.tags.split(',').map((tag, idx) => tag.trim() && (
                <span key={idx} className="inline-flex items-center bg-gray-100 text-gray-600 text-xs font-bold px-3 py-1 rounded-full">
                  <Tag className="w-3 h-3 mr-1" /> {tag.trim()}
                </span>
              ))}
            </div>

            <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-tight mb-6">
              {plan.title}
            </h1>

            <div className="flex flex-wrap gap-6 text-sm text-gray-500">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-green-500" />
                <span className="font-medium">{format(new Date(plan.expectedDate), 'dd/MM/yyyy')}</span>
              </div>
              <div className="flex items-center">
                <User className="w-4 h-4 mr-2 text-green-500" />
                <span className="font-medium text-gray-700">{plan.student ? plan.student.name : t.noStudent}</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8 md:p-12 space-y-10">
            
            {plan.objective && (
              <div>
                <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">{t.objective}</h2>
                <p className="text-lg text-gray-800 leading-relaxed">{plan.objective}</p>
              </div>
            )}

            {plan.summary && (
              <div>
                <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">{t.summary}</h2>
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{plan.summary}</p>
                </div>
              </div>
            )}

            {plan.contents && (
              <div>
                <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">{t.contents}</h2>
                <div className="prose prose-green max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {plan.contents}
                </div>
              </div>
            )}

            {plan.resources && (
              <div>
                <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">{t.resources}</h2>
                <div className="bg-green-50/50 rounded-2xl p-6 border border-green-100">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{plan.resources}</p>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
