import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Plus, Edit, Trash2, Calendar, Eye } from 'lucide-react';
import { getStudent, getLessonPlans, deleteLessonPlan, reorderLessonPlans } from '../api';
import { useLanguage } from '../context/LanguageContext';
import { format } from 'date-fns';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, rectSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export default function StudentDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  
  const [student, setStudent] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  // Delete Modal State
  const [deleteModal, setDeleteModal] = useState({ open: false, type: null, id: null });

  const t = {
    back: language === 'pt' ? 'Voltar para Alunos' : 'Back to Students',
    plansTab: language === 'pt' ? 'Planos de Aula' : 'Lesson Plans',
    newPlan: language === 'pt' ? 'Criar Plano' : 'Create Plan',
    noPlans: language === 'pt' ? 'Nenhum plano de aula.' : 'No lesson plans.',
    deleteConfirm: language === 'pt' ? 'Tem certeza que deseja excluir?' : 'Are you sure you want to delete?'
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const studentRes = await getStudent(id);
      setStudent(studentRes);

      const plansRes = await getLessonPlans({ studentId: id });
      setPlans(plansRes.data);
    } catch (error) {
      console.error(error);
      if (error.response?.status === 404) {
        navigate('/');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleDeletePlanClick = (e, planId) => {
    e.preventDefault();
    e.stopPropagation();
    setDeleteModal({ open: true, type: 'plan', id: planId });
  };

  const confirmDelete = async () => {
    if (deleteModal.id) {
      try {
        if (deleteModal.type === 'plan') {
          await deleteLessonPlan(deleteModal.id);
        }
        fetchData();
      } catch (error) {
        console.error(error);
      } finally {
        setDeleteModal({ open: false, type: null, id: null });
      }
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  if (loading || !student) {
    return <div className="min-h-screen flex items-center justify-center text-gray-900 bg-slate-50"><div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setPlans((items) => {
        const oldIndex = items.findIndex(i => i.id === active.id);
        const newIndex = items.findIndex(i => i.id === over.id);
        const newArray = arrayMove(items, oldIndex, newIndex);
        
        const updatedArray = newArray.map((item, idx) => ({ ...item, order: items[idx].order ?? idx }));
        
        const payload = updatedArray.map((item, idx) => ({ id: item.id, order: items[idx].order ?? idx }));
        reorderLessonPlans(payload).catch(console.error);

        return updatedArray;
      });
    }
  };

  return (
    <div className="w-full flex flex-col items-center pb-20 relative z-10 animate-fade-in mt-10">

      <div className="w-full max-w-5xl px-4 sm:px-6 lg:px-8">
        <button onClick={() => navigate('/students')} className="flex items-center text-sm font-bold text-gray-500 hover:text-green-600 mb-8 transition-colors uppercase tracking-widest">
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t.back}
        </button>

        {/* Dashboard Header */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden mb-8">
          <div className="p-8 md:p-12 border-b border-gray-100">
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight uppercase mb-2">
              {student.name}
            </h1>
            {student.email && <p className="text-gray-500 font-light">{student.email}</p>}
          </div>
          
          <div className="flex px-8 md:px-12 gap-8 border-b border-gray-100 bg-gray-50/50">
            <div className="py-6 text-sm font-bold uppercase tracking-widest text-green-600 relative">
              <BookOpen className="w-4 h-4 inline-block mr-2 -mt-1" />
              {t.plansTab} ({plans.length})
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-green-600 rounded-t-full shadow-sm"></div>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="animate-slide-up">
            <div className="space-y-6">
              <div className="flex justify-end">
                <Link to={`/student/${id}/plan/create`} className="inline-flex items-center justify-center rounded-xl text-sm font-bold transition-all duration-300 bg-green-600 text-white hover:bg-green-700 hover:shadow-lg hover:shadow-green-600/30 h-10 px-6">
                  <Plus className="w-4 h-4 mr-2" /> {t.newPlan}
                </Link>
              </div>
              
              {plans.length === 0 ? (
                <div className="bg-white/50 rounded-2xl p-16 text-center border border-gray-200 border-dashed">
                  <p className="text-gray-500 font-medium">{t.noPlans}</p>
                </div>
              ) : (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <SortableContext items={plans.map(p => p.id)} strategy={rectSortingStrategy}>
                      {plans.map((plan, index) => (
                        <SortablePlanCard 
                          key={plan.id}
                          plan={plan}
                          id={id}
                          handleDeletePlanClick={handleDeletePlanClick}
                        />
                      ))}
                    </SortableContext>
                  </div>
                </DndContext>
              )}
            </div>
        </div>
      </div>

      {/* Delete Modal */}
      {deleteModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-slide-up">
            <h3 className="text-xl font-bold text-gray-900 mb-3">{t.deleteConfirm}</h3>
            <p className="text-gray-500 mb-8 font-light text-sm">
              {language === 'pt' ? 'Essa ação não pode ser desfeita. O item será excluído permanentemente.' : 'This action cannot be undone. The item will be permanently deleted.'}
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setDeleteModal({ open: false, type: null, id: null })}
                className="px-5 py-2.5 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors text-sm"
              >
                {language === 'pt' ? 'Cancelar' : 'Cancel'}
              </button>
              <button 
                onClick={confirmDelete}
                className="px-5 py-2.5 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 shadow-md hover:shadow-red-500/30 transition-all text-sm"
              >
                {language === 'pt' ? 'Excluir' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SortablePlanCard({ plan, id, handleDeletePlanClick }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: plan.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    position: 'relative'
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners}
      className={`group bg-white border flex flex-col ${
        isDragging 
          ? 'border-green-500 shadow-2xl opacity-80 cursor-grabbing' 
          : 'border-gray-100 shadow-sm hover:border-green-500/30 hover:shadow-lg hover:shadow-gray-200/50 cursor-grab transition-all duration-300'
      } rounded-2xl p-6`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex gap-2 items-start" onPointerDown={(e) => e.stopPropagation()}>
          <Link to={`/student/${id}/plan/${plan.id}`} className="group-hover:text-green-600 transition-colors">
            <h3 className="font-bold text-xl text-gray-900 line-clamp-2">{plan.title}</h3>
          </Link>
        </div>
        <div className="flex gap-2" onPointerDown={(e) => e.stopPropagation()}>
          <Link to={`/student/${id}/plan/${plan.id}`} className="text-gray-400 hover:text-green-600 transition-colors bg-gray-50 hover:bg-green-50 p-1.5 rounded-lg opacity-0 group-hover:opacity-100"><Eye className="w-4 h-4" /></Link>
          <Link to={`/student/${id}/plan/${plan.id}/edit`} className="text-gray-400 hover:text-blue-600 transition-colors bg-gray-50 hover:bg-blue-50 p-1.5 rounded-lg opacity-0 group-hover:opacity-100"><Edit className="w-4 h-4" /></Link>
          <button onClick={(e) => handleDeletePlanClick(e, plan.id)} className="text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors bg-gray-50 p-1.5 rounded-lg opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4" /></button>
        </div>
      </div>
      <div className="flex items-center text-sm text-gray-500 mb-4">
        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
        <span>{format(new Date(plan.expectedDate), 'dd/MM/yyyy')}</span>
      </div>
      <p className="text-gray-600 text-sm line-clamp-2">{plan.objective}</p>
    </div>
  );
}
