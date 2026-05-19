import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, ArrowLeft, Wand2, Send } from 'lucide-react';
import { getLessonPlan, createLessonPlan, updateLessonPlan, generateAIRecommendations, getStudents } from '../api';
import { useLanguage } from '../context/LanguageContext';

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  objective: z.string().min(1, 'Objective is required'),
  summary: z.string().min(1, 'Summary is required'),
  expectedDate: z.string().min(1, 'Date is required'),
  subject: z.string().min(1, 'Subject is required'),
  contents: z.string().min(1, 'Contents are required'),
  resources: z.string().min(1, 'Resources are required'),
  tags: z.string().min(1, 'Tags are required'),
  studentId: z.string().optional().nullable(),
});

export default function LessonPlanForm() {
  const { language } = useLanguage();
  const { studentId, id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [students, setStudents] = useState([]);

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      tags: '',
      studentId: studentId || '',
    },
  });

  useEffect(() => {
    getStudents().then(res => {
      setStudents(res.data || []);
    });
  }, []);

  useEffect(() => {
    if (students.length > 0 && studentId) {
      setValue('studentId', studentId);
    }
  }, [students, studentId, setValue]);

  const t = {
    back: language === 'pt' ? 'Voltar' : 'Back',
    editPlan: language === 'pt' ? 'Editar Plano' : 'Edit Plan',
    newPlan: language === 'pt' ? 'Criar Novo Plano' : 'Craft New Plan',
    desc: language === 'pt' ? 'Preencha Título, Disciplina e Resumo e deixe a IA preencher o resto para você.' : 'Fill Title, Subject and Summary and let AI do the rest.',
    aiThinking: language === 'pt' ? 'A IA está processando...' : 'AI is Thinking...',
    smartAssist: language === 'pt' ? 'Gerar Recomendações com IA' : 'Generate AI Recommendations',
    title: language === 'pt' ? 'Título' : 'Title',
    subject: language === 'pt' ? 'Disciplina' : 'Subject',
    expectedDate: language === 'pt' ? 'Data Prevista' : 'Expected Date',
    tags: language === 'pt' ? 'Tags (Gerado pela IA)' : 'Tags (AI Generated)',
    objective: language === 'pt' ? 'Objetivo Principal' : 'Main Objective',
    summary: language === 'pt' ? 'Resumo / Ementa' : 'Summary',
    contents: language === 'pt' ? 'Conteúdo Detalhado (Gerado pela IA)' : 'Detailed Contents (AI Generated)',
    resources: language === 'pt' ? 'Recursos de Apoio (Gerado pela IA)' : 'Support Resources (AI Generated)',
    save: language === 'pt' ? 'Salvar Plano' : 'Publish Plan',
    saving: language === 'pt' ? 'Salvando...' : 'Saving...',
    aiErrorInput: language === 'pt' ? 'Preencha Título, Disciplina, Objetivo e Resumo antes de gerar recomendações.' : 'Please fill Title, Subject, Objective and Summary before generating recommendations.',
    aiErrorFail: language === 'pt' ? 'Falha ao consultar a IA. Tente novamente mais tarde.' : 'Failed to consult AI. Try again later.',
    saveError: language === 'pt' ? 'Erro ao salvar o plano de aula.' : 'Error saving lesson plan.',
    tagsPlaceholder: language === 'pt' ? 'Ex: matemática (Ou deixe a IA preencher)' : 'Ex: math (Or let AI fill)',
    contentsPlaceholder: language === 'pt' ? 'Tópicos e atividades... (Deixe em branco para a IA gerar)' : 'Topics... (Leave blank for AI)',
    resourcesPlaceholder: language === 'pt' ? 'Links e livros úteis... (Deixe em branco para a IA sugerir)' : 'Useful links... (Leave blank for AI)',
    titlePlaceholder: language === 'pt' ? 'Ex: Introdução à Mitologia' : 'Ex: Introduction to Mythology',
    subjectPlaceholder: language === 'pt' ? 'Ex: História' : 'Ex: History',
    objectivePlaceholder: language === 'pt' ? 'O que os alunos devem aprender?' : 'What should the students learn?',
    summaryPlaceholder: language === 'pt' ? 'Breve resumo da aula (Ou deixe a IA gerar)' : 'Brief lesson summary (Or let AI fill)',
    studentLabel: language === 'pt' ? 'Atribuir a Aluno (Opcional)' : 'Assign to Student (Optional)',
    studentPlaceholder: language === 'pt' ? '-- Plano Avulso (Sem Aluno) --' : '-- Global Plan (No Student) --'
  };

  useEffect(() => {
    if (isEdit && id) {
      getLessonPlan(id).then((data) => {
        setValue('title', data.title);
        setValue('objective', data.objective);
        setValue('summary', data.summary);
        setValue('expectedDate', new Date(data.expectedDate).toISOString().split('T')[0]);
        setValue('subject', data.subject);
        setValue('contents', data.contents);
        setValue('resources', data.resources);
        setValue('tags', data.tags);
        setValue('studentId', data.studentId || '');
      });
    }
  }, [id, isEdit, setValue]);

  const onSubmit = async (data) => {
    setLoading(true);
    const finalStudentId = data.studentId ? data.studentId : null;
    try {
      if (isEdit && id) {
        await updateLessonPlan(id, { ...data, expectedDate: new Date(data.expectedDate).toISOString(), studentId: finalStudentId });
      } else {
        await createLessonPlan({ ...data, expectedDate: new Date(data.expectedDate).toISOString(), studentId: finalStudentId });
      }
      navigate(finalStudentId ? `/student/${finalStudentId}` : '/');
    } catch (error) {
      console.error(error);
      alert(t.saveError);
    } finally {
      setLoading(false);
    }
  };

  const handleAI = async () => {
    const title = getValues('title');
    const subject = getValues('subject');
    const objective = getValues('objective');
    const summary = getValues('summary');

    if (!title || !subject || !objective || !summary) {
      setAiError(t.aiErrorInput);
      return;
    }
    setAiError('');
    setAiLoading(true);
    try {
      const data = await generateAIRecommendations({ title, subject, summary, language });
      
      if (data.resumo_gerado && !summary) {
        setValue('summary', data.resumo_gerado);
      }
      
      const currentContents = getValues('contents') || '';
      const newContents = currentContents + (currentContents ? '\n\n' : '') + `=== Sugestões da IA ===\n${data.sugestoes_conteudo}\n\nTópicos Relacionados:\n- ${data.topicos_relacionados.join('\n- ')}`;
      setValue('contents', newContents);

      const aiTags = data.tags.join(', ');
      setValue('tags', aiTags);

      if (data.recursos_apoio) {
        const currentResources = getValues('resources') || '';
        const newResources = currentResources + (currentResources ? '\n\n' : '') + `=== Sugestões de Apoio (IA) ===\n${data.recursos_apoio}`;
        setValue('resources', newResources);
      }
    } catch (err) {
      console.error(err);
      setAiError(err.response?.data?.error || t.aiErrorFail);
    } finally {
      setAiLoading(false);
    }
  };

  const inputStyles = "flex h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300 shadow-sm";
  const labelStyles = "text-sm font-bold text-gray-700 uppercase tracking-wider mb-2 block";

  return (
    <div className="w-full flex flex-col items-center pb-20 relative z-10 animate-fade-in mt-10">

      <div className="w-full max-w-4xl px-4 sm:px-6 lg:px-8">
        <button onClick={() => navigate(studentId ? `/student/${studentId}` : '/')} className="flex items-center text-sm font-bold text-gray-500 hover:text-green-600 mb-8 transition-colors uppercase tracking-widest">
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t.back}
        </button>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden">
          <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h2 className="text-3xl font-black text-gray-900 tracking-tight uppercase">
                {isEdit ? t.editPlan : t.newPlan}
              </h2>
              <p className="text-gray-500 text-sm mt-2 font-light">
                {t.desc}
              </p>
            </div>
            

          </div>

          {aiError && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mx-8 mt-8 rounded-r-lg">
              <p className="text-sm font-bold text-red-700">{aiError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className={labelStyles}>{t.title}</label>
                <input {...register('title')} className={inputStyles} placeholder={t.titlePlaceholder} />
                {errors.title && <p className="text-xs text-red-500 font-bold mt-2">{errors.title.message}</p>}
              </div>
              <div>
                <label className={labelStyles}>{t.subject}</label>
                <input 
                  {...register('subject')}
                  onBlur={(e) => {
                    register('subject').onBlur(e);
                    const val = e.target.value.trim();
                    const map = {
                      'historia': 'História',
                      'história': 'História',
                      'matematica': 'Matemática',
                      'matemática': 'Matemática',
                      'fisica': 'Física',
                      'física': 'Física',
                      'quimica': 'Química',
                      'química': 'Química',
                      'ciencias': 'Ciências',
                      'ciências': 'Ciências',
                      'biologia': 'Biologia',
                      'geografia': 'Geografia',
                      'ingles': 'Inglês',
                      'inglês': 'Inglês',
                      'portugues': 'Português',
                      'português': 'Português',
                      'artes': 'Artes',
                      'educacao fisica': 'Educação Física',
                      'educação física': 'Educação Física',
                      'filosofia': 'Filosofia',
                      'sociologia': 'Sociologia',
                      'redacao': 'Redação',
                      'redação': 'Redação'
                    };
                    const lower = val.toLowerCase();
                    if (map[lower]) {
                      setValue('subject', map[lower]);
                    } else if (val) {
                      setValue('subject', val.charAt(0).toUpperCase() + val.slice(1));
                    }
                  }}
                  className={inputStyles} 
                  placeholder={t.subjectPlaceholder} 
                />
                {errors.subject && <p className="text-xs text-red-500 font-bold mt-2">{errors.subject.message}</p>}
              </div>
              
              <div className="md:col-span-2">
                <label className={labelStyles}>{t.objective}</label>
                <textarea {...register('objective')} rows={3} className={`${inputStyles} h-auto py-3 resize-none`} placeholder={t.objectivePlaceholder} />
                {errors.objective && <p className="text-xs text-red-500 font-bold mt-2">{errors.objective.message}</p>}
              </div>

              <div className="md:col-span-2">
                <label className={labelStyles}>{t.summary}</label>
                <textarea {...register('summary')} rows={4} className={`${inputStyles} h-auto py-3 resize-none`} placeholder={t.summaryPlaceholder} />
                {errors.summary && <p className="text-xs text-red-500 font-bold mt-2">{errors.summary.message}</p>}
              </div>

              <div className="md:col-span-2 flex justify-end -mt-4">
                <button
                  type="button"
                  onClick={handleAI}
                  disabled={aiLoading}
                  className="inline-flex items-center justify-center rounded-xl text-sm font-bold transition-all duration-300 bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 hover:shadow-md hover:shadow-green-500/30 h-10 px-5 shadow-sm whitespace-nowrap"
                >
                  {aiLoading ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {t.aiThinking}</>
                  ) : (
                    <><Wand2 className="w-4 h-4 mr-2" /> {t.smartAssist}</>
                  )}
                </button>
              </div>

              <div>
                <label className={labelStyles}>{t.expectedDate}</label>
                <input type="date" {...register('expectedDate')} className={inputStyles} />
                {errors.expectedDate && <p className="text-xs text-red-500 font-bold mt-2">{errors.expectedDate.message}</p>}
              </div>
              <div>
                <label className={`${labelStyles} flex items-center`}>
                  {t.tags}
                </label>
                <input {...register('tags')} className={inputStyles} placeholder={t.tagsPlaceholder} />
                {errors.tags && <p className="text-xs text-red-500 font-bold mt-2">{errors.tags.message}</p>}
              </div>
              <div>
                <label className={labelStyles}>{t.studentLabel}</label>
                <select {...register('studentId')} className={inputStyles}>
                  <option value="">{t.studentPlaceholder}</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
                {errors.studentId && <p className="text-xs text-red-500 font-bold mt-2">{errors.studentId.message}</p>}
              </div>
            </div>

            <div>
              <label className={`${labelStyles} flex items-center text-amber-600`}>
                {t.contents}
              </label>
              <textarea {...register('contents')} rows={8} className={`${inputStyles} h-auto py-3 resize-none`} placeholder={t.contentsPlaceholder} />
              {errors.contents && <p className="text-xs text-red-500 font-bold mt-2">{errors.contents.message}</p>}
            </div>

            <div>
              <label className={`${labelStyles} flex items-center text-amber-600`}>
                {t.resources}
              </label>
              <textarea {...register('resources')} rows={3} className={`${inputStyles} h-auto py-3 resize-none`} placeholder={t.resourcesPlaceholder} />
              {errors.resources && <p className="text-xs text-red-500 font-bold mt-2">{errors.resources.message}</p>}
            </div>

            <div className="pt-8 mt-8 border-t border-gray-100 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center h-14 px-10 bg-green-600 text-white text-base font-bold rounded-full hover:bg-green-700 hover:shadow-lg hover:shadow-green-600/30 disabled:opacity-50 transition-all duration-300"
              >
                {loading && <Loader2 className="w-5 h-5 mr-3 animate-spin" />}
                {!loading && <Send className="w-5 h-5 mr-3" />}
                {loading ? t.saving : t.save}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
