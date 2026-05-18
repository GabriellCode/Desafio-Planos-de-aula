import { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BookOpen, Plus, Search, Trash2, Edit, Calendar, User, ChevronLeft, ChevronRight, SlidersHorizontal, X, Eye, GripVertical } from 'lucide-react';
import { getLessonPlans, deleteLessonPlan, reorderLessonPlans } from '../api';
import { useLanguage } from '../context/LanguageContext';
import { format } from 'date-fns';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, rectSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export default function LessonPlanList() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [searchTitle, setSearchTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [tags, setTags] = useState('');
  const [expectedDate, setExpectedDate] = useState('');
  const [sortBy, setSortBy] = useState('order');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showFilters, setShowFilters] = useState(false);
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 6;

  // Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState(null);

  const t = {
    title: language === 'pt' ? 'Planos de' : 'Lesson',
    subtitle: language === 'pt' ? 'Aula' : 'Plans',
    desc: language === 'pt' ? 'Gerencie todos os seus planos de aula, organizados em um único lugar.' : 'Manage all your lesson plans, organized in one place.',
    searchPlaceholder: language === 'pt' ? 'Buscar plano pelo título...' : 'Search plan by title...',
    addPlan: language === 'pt' ? 'Criar Novo Plano' : 'Create New Plan',
    noPlans: language === 'pt' ? 'Nenhum plano encontrado.' : 'No plans found.',
    confirmDelete: language === 'pt' ? 'Tem certeza que deseja excluir este plano?' : 'Are you sure you want to delete this plan?',
    noStudent: language === 'pt' ? 'Plano Avulso' : 'Global Plan',
    prev: language === 'pt' ? 'Anterior' : 'Previous',
    next: language === 'pt' ? 'Próxima' : 'Next',
    pageOf: language === 'pt' ? 'Página {current} de {total}' : 'Page {current} of {total}',
    filters: language === 'pt' ? 'Filtros' : 'Filters',
    subject: language === 'pt' ? 'Disciplina' : 'Subject',
    tagsPlaceholder: language === 'pt' ? 'Ex: matemática' : 'Ex: math',
    clear: language === 'pt' ? 'Limpar' : 'Clear',
    orderBy: language === 'pt' ? 'Ordenar por:' : 'Order by:',
    orderTitleAsc: language === 'pt' ? 'Título (A-Z)' : 'Title (A-Z)',
    orderTitleDesc: language === 'pt' ? 'Título (Z-A)' : 'Title (Z-A)',
    orderDateNew: language === 'pt' ? 'Mais Recentes' : 'Newest First',
    orderDateOld: language === 'pt' ? 'Mais Antigos' : 'Oldest First',
    orderCustom: language === 'pt' ? 'Ordem Customizada' : 'Custom Order'
  };

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getLessonPlans({ 
        page, 
        limit, 
        title: searchTitle, 
        subject, 
        tags, 
        expectedDate, 
        sortBy, 
        sortOrder 
      });
      setPlans(res.data);
      if (res.meta) {
        setTotalPages(res.meta.totalPages);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [page, searchTitle, subject, tags, expectedDate, sortBy, sortOrder]);

  // Debounce search and filter typing
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPlans();
    }, 500);
    return () => clearTimeout(timer);
  }, [fetchPlans]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [searchTitle, subject, tags, expectedDate, sortBy, sortOrder]);

  const handleDeleteClick = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    setPlanToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (planToDelete) {
      try {
        await deleteLessonPlan(planToDelete);
        fetchPlans();
      } catch (err) {
        console.error(err);
      } finally {
        setDeleteModalOpen(false);
        setPlanToDelete(null);
      }
    }
  };

  const clearFilters = () => {
    setSubject('');
    setTags('');
    setExpectedDate('');
    setSearchTitle('');
    setSortBy('order');
    setSortOrder('asc');
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setPlans((items) => {
        const oldIndex = items.findIndex(i => i.id === active.id);
        const newIndex = items.findIndex(i => i.id === over.id);
        const newArray = arrayMove(items, oldIndex, newIndex);
        
        // Optimistic update array and order values
        const updatedArray = newArray.map((item, idx) => ({ ...item, order: items[idx].order ?? idx }));
        
        // Sync with backend
        const payload = updatedArray.map((item, idx) => ({ id: item.id, order: items[idx].order ?? idx }));
        reorderLessonPlans(payload).catch(console.error);

        return updatedArray;
      });
    }
  };

  const inputStyles = "w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all";

  return (
    <div className="w-full flex flex-col items-center pb-20 relative z-10 animate-fade-in mt-10">
      
      {/* Hero Section */}
      <div className="text-center mt-10 mb-12 max-w-4xl px-4 animate-slide-up">
        <h1 className="text-5xl md:text-7xl font-black text-gray-900 uppercase tracking-tight leading-[1.1]">
          {t.title} <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-green-700">
            {t.subtitle}
          </span>
        </h1>
        <p className="mt-6 text-lg md:text-xl text-gray-600 max-w-2xl mx-auto font-light">
          {t.desc}
        </p>
      </div>

      <div className="w-full max-w-5xl px-4 sm:px-6 lg:px-8 space-y-6 animate-slide-up-delayed">
        
        {/* Main Controls Bar */}
        <div className="flex flex-col sm:flex-row gap-4 bg-white/80 backdrop-blur-lg p-5 rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/40">
          <div className="relative group flex-grow">
            <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400 group-focus-within:text-green-600 transition-colors" />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchTitle}
              onChange={(e) => setSearchTitle(e.target.value)}
              className="flex h-12 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 pl-11 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300 shadow-sm"
            />
            {searchTitle && (
              <button onClick={() => setSearchTitle('')} className="absolute right-3 top-3.5 text-gray-400 hover:text-red-500">
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center justify-center rounded-xl text-sm font-bold transition-all duration-300 h-12 px-6 border ${showFilters ? 'bg-gray-100 border-gray-200 text-gray-800' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'}`}
          >
            <SlidersHorizontal className="w-5 h-5 mr-2" />
            {t.filters}
            {(subject || tags || expectedDate || sortBy !== 'createdAt') && (
              <span className="ml-2 w-2 h-2 bg-green-500 rounded-full"></span>
            )}
          </button>

          <Link
            to="/plan/create"
            className="inline-flex items-center justify-center rounded-xl text-base font-bold transition-all duration-300 bg-green-600 text-white hover:bg-green-700 hover:shadow-lg hover:shadow-green-600/30 h-12 px-8 whitespace-nowrap"
          >
            <Plus className="w-5 h-5 mr-2" />
            {t.addPlan}
          </Link>
        </div>

        {/* Advanced Filters Panel */}
        {showFilters && (
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-lg shadow-gray-200/30 animate-slide-up grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{t.subject}</label>
              <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} className={inputStyles} placeholder="Ex: Biologia" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Tags</label>
              <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} className={inputStyles} placeholder={t.tagsPlaceholder} />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{t.expectedDate}</label>
              <input type="date" value={expectedDate} onChange={(e) => setExpectedDate(e.target.value)} className={inputStyles} />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{t.orderBy}</label>
              <select 
                className={inputStyles}
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [by, order] = e.target.value.split('-');
                  setSortBy(by);
                  setSortOrder(order);
                }}
              >
                <option value="order-asc">{t.orderCustom}</option>
                <option value="createdAt-desc">{t.orderDateNew}</option>
                <option value="createdAt-asc">{t.orderDateOld}</option>
                <option value="title-asc">{t.orderTitleAsc}</option>
                <option value="title-desc">{t.orderTitleDesc}</option>
              </select>
            </div>
            {(subject || tags || expectedDate || searchTitle || sortBy !== 'order') && (
              <div className="md:col-span-4 flex justify-end mt-2">
                <button onClick={clearFilters} className="text-sm font-bold text-gray-400 hover:text-red-500 transition-colors uppercase tracking-widest flex items-center">
                  <X className="w-4 h-4 mr-1" /> {t.clear}
                </button>
              </div>
            )}
          </div>
        )}

        {/* List / Cards */}
        <div className="animate-slide-up-delayed-2">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm animate-pulse h-48"></div>
              ))}
            </div>
          ) : plans.length === 0 ? (
            <div className="bg-white/50 rounded-2xl p-16 text-center border border-gray-200 border-dashed flex flex-col items-center justify-center">
              <div className="bg-green-50 p-5 rounded-full mb-5 shadow-inner">
                <BookOpen className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2 tracking-tight">{t.noPlans}</h3>
            </div>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <SortableContext items={plans.map(p => p.id)} strategy={rectSortingStrategy}>
                  {plans.map((plan, index) => (
                    <SortablePlanCard 
                      key={plan.id} 
                      plan={plan} 
                      index={index} 
                      t={t} 
                      handleDeleteClick={handleDeleteClick} 
                      isSortable={sortBy === 'order'}
                    />
                  ))}
                </SortableContext>
              </div>
            </DndContext>
          )}
        </div>

        {/* Pagination Controls */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-center space-x-4 mt-8 animate-fade-in">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center justify-center px-4 py-2 border border-gray-200 rounded-lg bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> {t.prev}
            </button>
            
            <span className="text-sm text-gray-600 font-medium">
              {t.pageOf.replace('{current}', page).replace('{total}', totalPages)}
            </span>
            
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex items-center justify-center px-4 py-2 border border-gray-200 rounded-lg bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {t.next} <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        )}
      </div>

      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-slide-up">
            <h3 className="text-xl font-bold text-gray-900 mb-3">{t.confirmDelete}</h3>
            <p className="text-gray-500 mb-8 font-light text-sm">
              {language === 'pt' ? 'Essa ação não pode ser desfeita. O plano será excluído permanentemente.' : 'This action cannot be undone. The plan will be permanently deleted.'}
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => { setDeleteModalOpen(false); setPlanToDelete(null); }}
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

function SortablePlanCard({ plan, index, handleDeleteClick, t, isSortable }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: plan.id, disabled: !isSortable });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    position: 'relative'
  };

  // Import lucide icons directly here or pass them if preferred

  return (
    <div 
      ref={setNodeRef}
      style={style}
      {...(isSortable ? attributes : {})} 
      {...(isSortable ? listeners : {})}
      className={`group bg-white rounded-2xl p-6 border flex flex-col justify-between ${
        isDragging 
          ? 'border-green-500 shadow-2xl opacity-80 cursor-grabbing' 
          : `border-gray-100 shadow-lg shadow-gray-200/50 hover:border-green-500/50 hover:shadow-xl hover:shadow-green-500/10 hover:-translate-y-1 ${isSortable ? 'cursor-grab' : ''} transition-all duration-300`
      }`}
    >
      <div>
        <div className="flex justify-between items-start mb-4">
          <div className="flex gap-2 items-start" onPointerDown={(e) => e.stopPropagation()}>
            <Link to={plan.studentId ? `/student/${plan.studentId}/plan/${plan.id}` : `/plan/${plan.id}`} state={{ from: '/' }} className="group-hover:text-green-600 transition-colors">
              <h3 className="font-bold text-xl text-gray-900 line-clamp-2">
                {plan.title}
              </h3>
            </Link>
          </div>
          <div className="flex gap-1 ml-2" onPointerDown={(e) => e.stopPropagation()}>
            <Link 
              to={plan.studentId ? `/student/${plan.studentId}/plan/${plan.id}` : `/plan/${plan.id}`} 
              state={{ from: '/' }}
              className="text-gray-400 hover:text-green-600 transition-colors bg-gray-50 hover:bg-green-50 p-1.5 rounded-lg opacity-0 group-hover:opacity-100"
            >
              <Eye className="w-4 h-4" />
            </Link>
            <Link 
              to={plan.studentId ? `/student/${plan.studentId}/plan/${plan.id}/edit` : `/plan/${plan.id}/edit`} 
              state={{ from: '/' }}
              className="text-gray-400 hover:text-blue-600 transition-colors bg-gray-50 hover:bg-blue-50 p-1.5 rounded-lg opacity-0 group-hover:opacity-100"
            >
              <Edit className="w-4 h-4" />
            </Link>
            <button 
              onClick={(e) => handleDeleteClick(e, plan.id)} 
              className="text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors bg-gray-50 p-1.5 rounded-lg opacity-0 group-hover:opacity-100"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-500">
            <Calendar className="w-4 h-4 mr-2 text-green-500" />
            <span>{format(new Date(plan.expectedDate), 'dd/MM/yyyy')}</span>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <User className="w-4 h-4 mr-2 text-green-500" />
            <span className="font-medium text-gray-700">{plan.student ? plan.student.name : t.noStudent}</span>
          </div>
        </div>
        
        <p className="text-gray-600 text-sm line-clamp-3">
          {plan.objective}
        </p>
      </div>
      
      <div className="mt-6 pt-4 border-t border-gray-50 flex justify-between items-center">
        <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded font-medium">
          {plan.subject}
        </span>
      </div>
    </div>
  );
}
