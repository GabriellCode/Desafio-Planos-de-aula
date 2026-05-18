import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, ArrowLeft, Send } from 'lucide-react';
import { getReport, createReport, updateReport } from '../api';
import { useLanguage } from '../context/LanguageContext';

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
});

export default function ReportForm() {
  const { language } = useLanguage();
  const { studentId, reportId } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(reportId);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  const t = {
    back: language === 'pt' ? 'Voltar para o Painel' : 'Back to Dashboard',
    editTitle: language === 'pt' ? 'Editar Relatório' : 'Edit Report',
    newTitle: language === 'pt' ? 'Novo Relatório' : 'New Report',
    desc: language === 'pt' ? 'Escreva uma avaliação detalhada do desempenho deste aluno.' : 'Write a detailed evaluation of this student\'s performance.',
    title: language === 'pt' ? 'Título do Relatório' : 'Report Title',
    content: language === 'pt' ? 'Conteúdo' : 'Content',
    save: language === 'pt' ? 'Salvar Relatório' : 'Save Report',
    saving: language === 'pt' ? 'Salvando...' : 'Saving...',
  };

  useEffect(() => {
    if (isEdit && reportId) {
      getReport(reportId).then((data) => {
        setValue('title', data.title);
        setValue('content', data.content);
      });
    }
  }, [reportId, isEdit, setValue]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      if (isEdit && reportId) {
        await updateReport(reportId, { ...data, studentId });
      } else {
        await createReport({ ...data, studentId });
      }
      navigate(`/student/${studentId}`);
    } catch (error) {
      console.error(error);
      alert('Error saving report.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyles = "flex w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300 shadow-sm";
  const labelStyles = "text-sm font-bold text-gray-700 uppercase tracking-wider mb-2 block";

  return (
    <div className="w-full flex flex-col items-center pb-20 relative z-10 animate-fade-in mt-10">

      <div className="w-full max-w-4xl px-4 sm:px-6 lg:px-8">
        <button onClick={() => navigate(`/student/${studentId}`)} className="flex items-center text-sm font-bold text-gray-500 hover:text-green-600 mb-8 transition-colors uppercase tracking-widest">
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t.back}
        </button>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden">
          <div className="p-8 border-b border-gray-100">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight uppercase">
              {isEdit ? t.editTitle : t.newTitle}
            </h2>
            <p className="text-gray-500 text-sm mt-2 font-light">
              {t.desc}
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-8">
            <div>
              <label className={labelStyles}>{t.title}</label>
              <input {...register('title')} className={inputStyles} placeholder="Ex: Avaliação Bimestral" />
              {errors.title && <p className="text-xs text-red-500 font-bold mt-2">{errors.title.message}</p>}
            </div>

            <div>
              <label className={labelStyles}>{t.content}</label>
              <textarea {...register('content')} rows={10} className={`resize-none leading-relaxed ${inputStyles}`} />
              {errors.content && <p className="text-xs text-red-500 font-bold mt-2">{errors.content.message}</p>}
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
