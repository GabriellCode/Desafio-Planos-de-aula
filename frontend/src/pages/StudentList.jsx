import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, UserPlus, Search, Trash2 } from 'lucide-react';
import { getStudents, deleteStudent, createStudent, reorderStudents } from '../api';
import { useLanguage } from '../context/LanguageContext';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, rectSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export default function StudentList() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Controle de estado para a janelinha de criação de um novo aluno
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');

  // Controle de estado para a janelinha de confirmação de exclusão
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);

  const t = {
    title: language === 'pt' ? 'Gerenciar' : 'Manage',
    subtitle: language === 'pt' ? 'Alunos' : 'Students',
    desc: language === 'pt' ? 'Acesse o painel individual de cada aluno para ver seus planos de aula e relatórios.' : 'Access individual dashboards to view lesson plans and reports.',
    searchPlaceholder: language === 'pt' ? 'Buscar aluno pelo nome...' : 'Search student by name...',
    addStudent: language === 'pt' ? 'Novo Aluno' : 'New Student',
    noStudents: language === 'pt' ? 'Nenhum aluno encontrado' : 'No students found',
    confirmDelete: language === 'pt' ? 'Deletar este aluno excluirá todos os planos e relatórios dele. Continuar?' : 'Deleting this student will remove all their plans and reports. Continue?',
    createTitle: language === 'pt' ? 'Cadastrar Novo Aluno' : 'Register New Student',
    name: language === 'pt' ? 'Nome Completo' : 'Full Name',
    email: language === 'pt' ? 'Email (Opcional)' : 'Email (Optional)',
    cancel: language === 'pt' ? 'Cancelar' : 'Cancel',
    save: language === 'pt' ? 'Cadastrar' : 'Register'
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await getStudents();
      setStudents(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleDeleteClick = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    setStudentToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (studentToDelete) {
      try {
        await deleteStudent(studentToDelete);
        fetchStudents();
      } catch (error) {
        console.error(error);
      } finally {
        setDeleteModalOpen(false);
        setStudentToDelete(null);
      }
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      await createStudent({ name: newName, email: newEmail });
      setIsCreating(false);
      setNewName('');
      setNewEmail('');
      fetchStudents();
    } catch (error) {
      console.error(error);
    }
  };

  const filteredStudents = students.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));

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
      setStudents((items) => {
        const oldIndex = items.findIndex(i => i.id === active.id);
        const newIndex = items.findIndex(i => i.id === over.id);
        const newArray = arrayMove(items, oldIndex, newIndex);
        
        const updatedArray = newArray.map((item, idx) => ({ ...item, order: items[idx].order ?? idx }));
        
        const payload = updatedArray.map((item, idx) => ({ id: item.id, order: items[idx].order ?? idx }));
        reorderStudents(payload).catch(console.error);

        return updatedArray;
      });
    }
  };

  const isSortable = search.trim() === '';

  return (
    <div className="w-full flex flex-col items-center pb-20 relative z-10 animate-fade-in">

      {/* Cabeçalho principal da página com o título */}
      <div className="text-center mt-20 mb-16 max-w-4xl px-4 animate-slide-up">
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

      <div className="w-full max-w-5xl px-4 sm:px-6 lg:px-8 space-y-8 animate-slide-up-delayed">
        
        {/* Barra de pesquisa e botão de adicionar aluno */}
        <div className="flex flex-col sm:flex-row gap-4 bg-white/80 backdrop-blur-lg p-5 rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/40">
          <div className="relative group flex-grow">
            <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400 group-focus-within:text-green-600 transition-colors" />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex h-12 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 pl-11 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300 shadow-sm"
            />
          </div>
          <button
            onClick={() => setIsCreating(true)}
            className="inline-flex items-center justify-center rounded-xl text-base font-bold transition-all duration-300 bg-green-600 text-white hover:bg-green-700 hover:shadow-lg hover:shadow-green-600/30 h-12 px-8 whitespace-nowrap"
          >
            <UserPlus className="w-5 h-5 mr-2" />
            {t.addStudent}
          </button>
        </div>

        {/* Grade onde os cards dos alunos são exibidos */}
        <div className="animate-slide-up-delayed-2">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm animate-pulse h-32"></div>
              ))}
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="bg-white/50 rounded-2xl p-16 text-center border border-gray-200 border-dashed flex flex-col items-center justify-center">
              <div className="bg-green-50 p-5 rounded-full mb-5 shadow-inner">
                <Users className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2 tracking-tight">{t.noStudents}</h3>
            </div>
          ) : (
            isSortable ? (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <SortableContext items={filteredStudents.map(s => s.id)} strategy={rectSortingStrategy}>
                    {filteredStudents.map((student, index) => (
                      <SortableStudentCard 
                        key={student.id} 
                        student={student} 
                        index={index} 
                        handleDeleteClick={handleDeleteClick} 
                        navigate={navigate}
                      />
                    ))}
                  </SortableContext>
                </div>
              </DndContext>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredStudents.map((student, index) => (
                  <SortableStudentCard 
                    key={student.id} 
                    student={student} 
                    index={index} 
                    handleDeleteClick={handleDeleteClick} 
                    navigate={navigate}
                    disabled={true}
                  />
                ))}
              </div>
            )
          )}
        </div>
      </div>

      {/* Modal flutuante para cadastrar um novo aluno */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl w-full max-w-md p-8 animate-slide-up">
            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-6">{t.createTitle}</h2>
            <form onSubmit={handleCreate} className="space-y-5">
              <div>
                <label className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-2 block">{t.name}</label>
                <input 
                  type="text" 
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="flex h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 shadow-sm"
                  autoFocus
                />
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-2 block">{t.email}</label>
                <input 
                  type="email" 
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="flex h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 shadow-sm"
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsCreating(false)} className="flex-1 h-12 rounded-xl font-bold text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 transition-colors">
                  {t.cancel}
                </button>
                <button type="submit" disabled={!newName.trim()} className="flex-1 h-12 rounded-xl font-bold text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 transition-colors shadow-md shadow-green-600/30">
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal flutuante para confirmar a exclusão de um aluno */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-slide-up">
            <h3 className="text-xl font-bold text-gray-900 mb-3">{language === 'pt' ? 'Excluir Aluno' : 'Delete Student'}</h3>
            <p className="text-gray-500 mb-8 font-light text-sm">
              {t.confirmDelete}
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => { setDeleteModalOpen(false); setStudentToDelete(null); }}
                className="px-5 py-2.5 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors text-sm"
              >
                {t.cancel}
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

function SortableStudentCard({ student, index, handleDeleteClick, navigate, disabled }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: student.id, disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    position: 'relative'
  };

  const handleCardClick = (e) => {
    // Só entra no painel do aluno se foi um clique normal (não se estivesse apenas arrastando o card)
    if (!isDragging) {
      navigate(`/student/${student.id}`);
    }
  };

  return (
    <div 
      ref={setNodeRef}
      style={style}
      {...(!disabled ? attributes : {})} 
      {...(!disabled ? listeners : {})}
      onClick={handleCardClick}
      className={`group bg-white rounded-2xl p-6 border flex flex-col justify-between ${
        isDragging 
          ? 'border-green-500 shadow-2xl opacity-80 cursor-grabbing' 
          : `border-gray-100 shadow-lg shadow-gray-200/50 hover:border-green-500/50 hover:shadow-xl hover:shadow-green-500/10 hover:-translate-y-1 ${!disabled ? 'cursor-grab' : 'cursor-pointer'} transition-all duration-300`
      }`}
      style={{ ...style, animationDelay: `${index * 50}ms` }}
    >
      <div className="flex items-start justify-between">
        <div onPointerDown={(e) => e.stopPropagation()}>
          <h3 className="font-bold text-2xl text-gray-900 group-hover:text-green-600 transition-colors">
            {student.name}
          </h3>
          {student.email && (
            <p className="text-sm text-gray-500 mt-1">{student.email}</p>
          )}
        </div>
        <button 
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => handleDeleteClick(e, student.id)} 
          className="text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors p-2 bg-gray-50 rounded-xl opacity-0 group-hover:opacity-100 z-10"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
      <div className="mt-6 pt-4 border-t border-gray-50 flex justify-between items-center">
        <span className="text-xs font-bold text-green-600/70 uppercase tracking-wider group-hover:text-green-600">
          Abrir Painel →
        </span>
      </div>
    </div>
  );
}
