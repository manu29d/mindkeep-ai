import React, { useState } from 'react';
import { Category, Todo, ViewMode } from '../types';
import { useTodo } from '../context/TodoContext';
import { useFeatureGate } from '../hooks/useFeatureGate';
import TodoItem from './TodoItem';
import { Plus, MoreHorizontal, Trash, Calendar, Layers, Edit2, Paperclip, FolderPen } from 'lucide-react';

const formatDate = (isoString?: string) => {
  if (!isoString) return '';
  const d = new Date(isoString);
  const day = d.getDate().toString().padStart(2, '0');
  const month = d.toLocaleString('default', { month: 'short' });
  const year = d.getFullYear();
  return `${day} ${month}, ${year}`;
};

const getSortedTodos = (todos: Todo[], order: string[] | undefined) => {
  if (!order || order.length === 0) return todos;
  const todoMap = new Map(todos.map(t => [t.id, t]));
  const sorted: Todo[] = [];
  order.forEach(id => {
    if (todoMap.has(id)) {
      sorted.push(todoMap.get(id)!);
      todoMap.delete(id);
    }
  });
  Array.from(todoMap.values()).forEach(t => sorted.push(t));
  return sorted;
};

const CategoryColumn: React.FC<{ 
  category: Category; 
  todos: Todo[]; 
  onAddTodo: (phaseId?: string) => void;
  onTodoClick: (todo: Todo) => void;
  onEditCategory: (cat: Category) => void;
}> = ({ category, todos, onAddTodo, onTodoClick, onEditCategory }) => {
  const { moveTodo, updateCategory, deleteCategory, addPhase, teams, todoOrder, reorderTodo } = useTodo();
  const { canAccessPhases } = useFeatureGate();
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showPhaseInput, setShowPhaseInput] = useState(false);
  const [newPhaseTitle, setNewPhaseTitle] = useState('');
  
  // Inline Editing States
  const [editingCatDeadline, setEditingCatDeadline] = useState(false);
  const [editingPhaseDeadline, setEditingPhaseDeadline] = useState<string | null>(null); // phaseId

  const team = teams.find(t => t.id === category.teamId);

  const handleDrop = (e: React.DragEvent, targetPhaseId?: string) => {
    e.preventDefault();
    // Check if it's a Todo Drag
    const todoId = e.dataTransfer.getData('todoId');
    if (todoId) {
      e.stopPropagation();
      moveTodo(todoId, category.id, targetPhaseId);
    }
  };

  const handleTodoDrop = (e: React.DragEvent, targetTodoId: string, containerId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const sourceTodoId = e.dataTransfer.getData('todoId');
    
    if (sourceTodoId && sourceTodoId !== targetTodoId) {
        const currentOrder = todoOrder[containerId] || (containerId === category.id ? unphasedTodos : phasedGroups.find(g => g.phase.id === containerId)?.todos || []).map(t => t.id);
        const sourceIndex = currentOrder.indexOf(sourceTodoId);
        const targetIndex = currentOrder.indexOf(targetTodoId);
        
        if (sourceIndex === -1) {
            // Moving from another list
            const newOrder = [...currentOrder];
            if (targetIndex !== -1) {
                newOrder.splice(targetIndex, 0, sourceTodoId);
            } else {
                newOrder.push(sourceTodoId);
            }
            reorderTodo(containerId, newOrder);
            moveTodo(sourceTodoId, category.id, containerId === category.id ? undefined : containerId);
        } else {
            // Reordering within same list
            const newOrder = [...currentOrder];
            const [moved] = newOrder.splice(sourceIndex, 1);
            newOrder.splice(targetIndex, 0, moved);
            reorderTodo(containerId, newOrder);
        }
    }
  };

  const handleDragStart = (e: React.DragEvent, todo: Todo) => {
      e.dataTransfer.setData('todoId', todo.id);
      e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleAddPhase = () => {
    if (newPhaseTitle.trim()) {
      addPhase(category.id, newPhaseTitle);
      setNewPhaseTitle('');
      setShowPhaseInput(false);
    }
  };

  const handlePhaseDeadlineUpdate = (phaseId: string, newDate: string) => {
    const updatedPhases = (category.phases || []).map(p => 
        p.id === phaseId ? { ...p, deadline: newDate } : p
    );
    updateCategory(category.id, { phases: updatedPhases });
    setEditingPhaseDeadline(null);
  };

  const colors = [
    'bg-white dark:bg-gray-800', 
    'bg-red-100 dark:bg-red-900/40', 
    'bg-orange-100 dark:bg-orange-900/40', 
    'bg-amber-100 dark:bg-amber-900/40', 
    'bg-green-100 dark:bg-green-900/40', 
    'bg-teal-100 dark:bg-teal-900/40', 
    'bg-blue-100 dark:bg-blue-900/40', 
    'bg-indigo-100 dark:bg-indigo-900/40', 
    'bg-purple-100 dark:bg-purple-900/40', 
    'bg-pink-100 dark:bg-pink-900/40'
  ];

  // Group todos by phase
  const unphasedTodos = getSortedTodos(todos.filter(t => !t.phaseId), todoOrder[category.id]);
  const phasedGroups = (category.phases || []).map(phase => ({
    phase,
    todos: getSortedTodos(todos.filter(t => t.phaseId === phase.id), todoOrder[phase.id])
  }));

  return (
    <div 
      onDrop={(e) => handleDrop(e, undefined)}
      onDragOver={handleDragOver}
      className={`flex flex-col rounded-xl p-4 h-full min-h-[200px] transition-colors duration-300 border border-transparent hover:border-gray-200 dark:hover:border-gray-600 shadow-sm relative
        ${category.color}`}
    >
      {/* Header */}
      <div className="flex flex-col mb-4 group">
        {team && (
            <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1 px-1">
                {team.name}
            </div>
        )}
        <div className="flex items-center justify-between">
            <h2 className="font-bold text-gray-800 dark:text-gray-100 text-lg px-1 truncate cursor-pointer" onClick={() => onEditCategory(category)}>
              {category.title}
            </h2>
            <div className="relative opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                {/* Attachment Indicator */}
                {(category.attachments?.length || 0) > 0 && (
                    <div className="mr-2 text-gray-500 dark:text-gray-400" title="Has Attachments">
                        <Paperclip size={14} />
                    </div>
                )}

                <button 
                    onClick={() => setShowColorPicker(!showColorPicker)}
                    className="p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300">
                    <MoreHorizontal size={16} />
                </button>
            
                {/* Context Menu */}
                {showColorPicker && (
                    <div className="absolute right-0 top-8 z-20 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-100 dark:border-gray-700 p-2 w-56 animate-in fade-in zoom-in duration-150">
                        <div className="text-xs font-semibold text-gray-400 mb-2 uppercase">Card Color</div>
                        <div className="grid grid-cols-5 gap-1 mb-3">
                        {colors.map(c => (
                            <button 
                            key={c} 
                            onClick={() => { updateCategory(category.id, { color: c }); setShowColorPicker(false); }}
                            className={`w-6 h-6 rounded-full border border-gray-200 dark:border-gray-600 ${c.split(' ')[0]}`} // Show light color
                            />
                        ))}
                        </div>
                        <hr className="my-2 dark:border-gray-700" />
                        {canAccessPhases && (
                            <button 
                                onClick={() => { setShowPhaseInput(true); setShowColorPicker(false); }}
                                className="w-full flex items-center space-x-2 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded text-sm">
                                <Layers size={14} />
                                <span>Add Phase</span>
                            </button>
                        )}
                        <button 
                            onClick={() => { onEditCategory(category); setShowColorPicker(false); }}
                            className="w-full flex items-center space-x-2 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded text-sm">
                            <FolderPen size={14} />
                            <span>Edit Details</span>
                        </button>
                        <button 
                            onClick={() => {
                                if (window.confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
                                    deleteCategory(category.id);
                                }
                            }}
                            className="w-full flex items-center space-x-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded text-sm">
                            <Trash size={14} />
                            <span>Delete Category</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
        
        {/* Category Deadline - Editable */}
        <div className="px-1 mt-1 min-h-[20px]">
            {editingCatDeadline ? (
                <input 
                    type="date"
                    autoFocus
                    defaultValue={category.deadline ? category.deadline.split('T')[0] : ''}
                    onBlur={(e) => {
                        updateCategory(category.id, { deadline: e.target.value ? e.target.value : undefined });
                        setEditingCatDeadline(false);
                    }}
                    onKeyDown={(e) => {
                        if(e.key === 'Enter') e.currentTarget.blur();
                    }}
                    className="text-xs p-1 rounded border border-indigo-300 bg-white text-gray-800 dark:bg-gray-700 dark:text-white outline-none w-full"
                />
            ) : (
                <div 
                    onClick={() => setEditingCatDeadline(true)}
                    className="flex items-center text-xs text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer group/date transition-colors"
                >
                    <Calendar size={10} className="mr-1" />
                    <span>{category.deadline ? `Due: ${formatDate(category.deadline)}` : 'Set Deadline'}</span>
                    <Edit2 size={10} className="ml-1 opacity-0 group-hover/date:opacity-100 transition-opacity" />
                </div>
            )}
        </div>
      </div>

      {/* Phase Input */}
      {showPhaseInput && (
        <div className="mb-3 flex items-center space-x-2 animate-in slide-in-from-top-2">
            <input 
              value={newPhaseTitle}
              onChange={(e) => setNewPhaseTitle(e.target.value)}
              placeholder="Phase name..."
              className="flex-1 px-2 py-1 rounded text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleAddPhase()}
            />
            <button onClick={handleAddPhase} className="text-indigo-600 hover:text-indigo-800 bg-indigo-100 p-1 rounded">
                <Plus size={14} />
            </button>
        </div>
      )}

      {/* Todos List Container */}
      <div className="flex-1 overflow-y-auto pr-1 max-h-[calc(100vh-250px)] custom-scrollbar space-y-4">
        
        {/* Unphased Todos */}
        <div className="space-y-3 min-h-[40px]">
            {unphasedTodos.map(todo => (
            <div 
                key={todo.id}
                draggable
                onDragStart={(e) => handleDragStart(e, todo)}
                onDrop={(e) => handleTodoDrop(e, todo.id, category.id)}
                onDragOver={handleDragOver}
            >
                <TodoItem todo={todo} onClick={() => onTodoClick(todo)} />
            </div>
            ))}
        </div>

        {/* Phases */}
        {phasedGroups.map((group) => (
            <div 
                key={group.phase.id} 
                className="border-t border-gray-300/30 dark:border-gray-600/50 pt-3 pb-1"
                onDrop={(e) => handleDrop(e, group.phase.id)}
                onDragOver={handleDragOver}
            >
                <div className="flex items-center justify-between mb-2 px-1">
                    <div className="flex items-center space-x-2 overflow-hidden">
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 truncate max-w-[100px]">{group.phase.title}</span>
                        
                        {/* Phase Deadline - Editable */}
                        {editingPhaseDeadline === group.phase.id ? (
                             <input 
                                type="date"
                                autoFocus
                                defaultValue={group.phase.deadline ? group.phase.deadline.split('T')[0] : ''}
                                onBlur={(e) => handlePhaseDeadlineUpdate(group.phase.id, e.target.value)}
                                onKeyDown={(e) => { if(e.key === 'Enter') e.currentTarget.blur(); }}
                                className="text-[10px] p-0.5 rounded border border-indigo-300 bg-white text-gray-800 dark:bg-gray-700 dark:text-white outline-none w-24"
                             />
                        ) : (
                            <button 
                                onClick={() => setEditingPhaseDeadline(group.phase.id)}
                                className={`text-[10px] px-1.5 py-0.5 rounded flex items-center hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors
                                    ${group.phase.deadline ? 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300' : 'text-transparent hover:text-gray-500'}`}>
                                {group.phase.deadline ? formatDate(group.phase.deadline) : <Calendar size={10}/>}
                            </button>
                        )}
                    </div>
                    <button 
                        onClick={() => onAddTodo(group.phase.id)}
                        className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-1 rounded" title="Add to Phase">
                        <Plus size={12} />
                    </button>
                </div>
                <div className="space-y-3 min-h-[40px] bg-black/5 dark:bg-white/5 rounded-lg p-2">
                    {group.todos.map(todo => (
                         <div 
                            key={todo.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, todo)}
                            onDrop={(e) => handleTodoDrop(e, todo.id, group.phase.id)}
                            onDragOver={handleDragOver}
                        >
                            <TodoItem todo={todo} onClick={() => onTodoClick(todo)} />
                        </div>
                    ))}
                    {group.todos.length === 0 && (
                        <div className="text-xs text-center text-gray-400 py-2 italic">Drop tasks here</div>
                    )}
                </div>
            </div>
        ))}
      </div>

      {/* Global Add Button */}
      <button 
        onClick={() => onAddTodo()}
        className="mt-3 flex items-center space-x-2 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-black/5 dark:hover:bg-white/10 p-2 rounded-lg transition-colors text-sm font-medium">
        <Plus size={18} />
        <span>Add a task</span>
      </button>
    </div>
  );
};

const CategoryBoard: React.FC<{ onTodoClick: (t: Todo) => void; onEditCategory: (c: Category) => void }> = ({ onTodoClick, onEditCategory }) => {
  const { categories, todos, viewMode, addTodo, activeTeamId, moveCategory, searchQuery } = useTodo();

  // 1. Filter Categories by Team
  // 2. Filter Categories by Search Query (Keep category if it matches query)
  const filteredCategories = categories.filter(c => {
      // Team Filter
      const matchesTeam = activeTeamId ? c.teamId === activeTeamId : true;
      if (!matchesTeam) return false;

      // Search Filter: If search query matches category title, keep it even if no todos match.
      // But mainly we want to see todos. We will keep the category if it matches team. 
      // The Todo filtering happens below.
      return true; 
  });

  // 3. Filter Todos by Search Query
  const getFilteredTodos = (catId: string) => {
    const filtered = todos.filter(t => {
        if (t.categoryId !== catId) return false;
        if (t.completed) return false;
        
        // Search Logic
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            const matchesTitle = t.title.toLowerCase().includes(query);
            const matchesDesc = t.description?.toLowerCase().includes(query);
            const matchesSub = Array.isArray(t.subTodos) && t.subTodos.some(st => st.title.toLowerCase().includes(query));
            return matchesTitle || matchesDesc || matchesSub;
        }
        return true;
    });
    
    // Debug logging
    if (filtered.length === 0 && todos.some(t => t.categoryId === catId)) {
      console.log('CategoryBoard: Todos exist for category but filtered to 0', {
        categoryId: catId,
        totalTodos: todos.filter(t => t.categoryId === catId).length,
        completedCount: todos.filter(t => t.categoryId === catId && t.completed).length,
        searchQuery
      });
    }
    
    return filtered;
  };

  // DND Handlers for Categories
  const handleCategoryDragStart = (e: React.DragEvent, index: number) => {
      e.dataTransfer.setData('type', 'CATEGORY');
      e.dataTransfer.setData('catIndex', index.toString());
  };

  const handleCategoryDrop = (e: React.DragEvent, targetIndex: number) => {
      e.preventDefault();
      const type = e.dataTransfer.getData('type');
      if (type === 'CATEGORY') {
          const sourceIndex = parseInt(e.dataTransfer.getData('catIndex'), 10);
          if (!isNaN(sourceIndex) && sourceIndex !== targetIndex) {
              // Map the visual index back to the global index if needed, 
              // BUT since we render 'filteredCategories', the indices match the visible list.
              // We need to be careful. 'moveCategory' in context likely assumes the full list.
              // Actually, in a real app with filtered views, reordering is tricky. 
              // For now, we will assume reordering works best when in 'Personal' (unfiltered) or we map ids.
              
              // Better Approach: Find the actual IDs and move based on ID or find index in global list.
              // Simplification for this demo: Pass the global index.
              const sourceCat = filteredCategories[sourceIndex];
              const targetCat = filteredCategories[targetIndex];
              
              const globalSourceIndex = categories.findIndex(c => c.id === sourceCat.id);
              const globalTargetIndex = categories.findIndex(c => c.id === targetCat.id);
              
              moveCategory(globalSourceIndex, globalTargetIndex);
          }
      }
  };

  if (viewMode !== ViewMode.BOARD) {
    // List View for specialized modes
    let displayedTodos = todos;
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    const tmr = new Date(now);
    tmr.setDate(tmr.getDate() + 1);
    const tomorrow = tmr.toISOString().split('T')[0];

    // Apply Search Filter to List Views as well
    if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        displayedTodos = displayedTodos.filter(t => 
             t.title.toLowerCase().includes(query) || 
             t.description?.toLowerCase().includes(query)
        );
    }

    if (viewMode === ViewMode.TODAY) {
      displayedTodos = displayedTodos.filter(t => t.deadline && t.deadline.startsWith(today) && !t.completed);
    } else if (viewMode === ViewMode.TOMORROW) {
      displayedTodos = displayedTodos.filter(t => t.deadline && t.deadline.startsWith(tomorrow) && !t.completed);
    } else if (viewMode === ViewMode.UNSPECIFIED) {
      displayedTodos = displayedTodos.filter(t => !t.deadline && !t.completed);
    } else if (viewMode === ViewMode.COMPLETED) {
      displayedTodos = displayedTodos.filter(t => t.completed).sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0));
    } else if (viewMode === ViewMode.IN_PROGRESS) {
      displayedTodos = displayedTodos.filter(t => {
          if (t.completed) return false;
          const hasCompletedSub = t.subTodos.some(st => st.completed);
          return hasCompletedSub || t.timeSpent > 0;
      });
    }

    return (
      <div className="p-8 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 capitalize">{viewMode.toLowerCase().replace(/_/g, ' ')} Tasks</h2>
        <div className="space-y-3">
          {displayedTodos.length === 0 && (
             <div className="text-center py-20 text-gray-400 dark:text-gray-600">
               <div className="mb-4 text-6xl opacity-20">☕</div>
               No tasks found for this view.
             </div>
          )}
          {displayedTodos.map(t => (
            <TodoItem key={t.id} todo={t} onClick={() => onTodoClick(t)} />
          ))}
        </div>
      </div>
    );
  }

  // Default Board View
  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-start">
      {filteredCategories.map((cat, index) => {
        const todosForCat = getFilteredTodos(cat.id);
        
        // If searching, only show categories that have matching todos or match title themselves
        if (searchQuery.trim()) {
             const query = searchQuery.toLowerCase();
             const catMatches = cat.title.toLowerCase().includes(query);
             if (todosForCat.length === 0 && !catMatches) {
                 return null;
             }
        }

        return (
            <div 
                key={cat.id} 
                draggable
                onDragStart={(e) => handleCategoryDragStart(e, index)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleCategoryDrop(e, index)}
                className="cursor-grab active:cursor-grabbing"
            >
                <CategoryColumn 
                category={cat} 
                todos={todosForCat} 
                onAddTodo={(phaseId) => addTodo(cat.id, "New Task", phaseId)}
                onTodoClick={onTodoClick}
                onEditCategory={onEditCategory}
                />
            </div>
        )
      })}
      {filteredCategories.length === 0 && (
          <div className="col-span-full text-center py-20 text-gray-400">
              <div className="mb-2 text-4xl opacity-30">📭</div>
              No categories found in this space.
          </div>
      )}
    </div>
  );
};

export default CategoryBoard;