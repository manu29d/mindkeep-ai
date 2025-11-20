import React, { useState } from 'react';
import { Todo, TimerState } from '../types';
import { useTodo } from '../context/TodoContext';
import { 
  Play, Pause, Square, Bot, 
  Calendar as CalendarIcon, Trash2, UserPlus, Paperclip
} from 'lucide-react';

interface Props {
  todo: Todo;
  onClick: () => void;
}

const formatTime = (seconds: number) => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hrs > 0) return `${hrs}h ${mins}m`;
  return `${mins}m ${secs}s`;
};

const formatDate = (isoString: string) => {
  if (!isoString) return '';
  const d = new Date(isoString);
  const day = d.getDate().toString().padStart(2, '0');
  const month = d.toLocaleString('default', { month: 'short' });
  const year = d.getFullYear();
  return `${day} ${month}, ${year}`;
};

const TodoItem: React.FC<Props> = ({ todo, onClick }) => {
  const { toggleTimer, stopTimer, enrichTodoWithAI, deleteTodo, updateTodo } = useTodo();
  const [isHovered, setIsHovered] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('todoId', todo.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleAiClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setAiLoading(true);
    await enrichTodoWithAI(todo.id);
    setAiLoading(false);
  };

  const handleTimerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleTimer(todo.id);
  };

  const handleStopClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    stopTimer(todo.id);
  };

  const timerActive = todo.timerState === TimerState.RUNNING;

  return (
    <div 
      draggable={!todo.completed}
      onDragStart={handleDragStart}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-3 cursor-pointer transform transition-all duration-500 ease-in-out
        ${todo.completed 
            ? 'opacity-60 bg-gray-50 dark:bg-gray-800/50 scale-[0.98]' 
            : 'hover:border-amber-300 dark:hover:border-amber-500/50 hover:shadow-md hover:-translate-y-0.5'
        }
      `}
    >
      {/* Header / Title */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-start space-x-3 overflow-hidden w-full">
           <button 
            onClick={(e) => { e.stopPropagation(); updateTodo(todo.id, { completed: !todo.completed }); }}
            className={`mt-1 flex-shrink-0 w-5 h-5 rounded border flex items-center justify-center transition-all duration-300
              ${todo.completed 
                ? 'bg-green-500 border-green-500 scale-110' 
                : 'border-gray-300 dark:border-gray-500 hover:border-gray-400 dark:hover:border-gray-400 hover:scale-105'}`}>
             {todo.completed && <div className="w-2.5 h-2.5 bg-white rounded-sm animate-in zoom-in duration-200" />}
           </button>
           <div className="min-w-0 flex-1">
             <h3 className={`font-medium text-gray-800 dark:text-gray-100 leading-tight truncate transition-all duration-300 ${todo.completed ? 'line-through text-gray-500 dark:text-gray-500 decoration-gray-400' : ''}`}>
               {todo.title}
             </h3>
             <div className="flex flex-wrap gap-2 mt-1">
                {todo.deadline && (
                <div className={`flex items-center text-xs ${new Date(todo.deadline) < new Date() && !todo.completed ? 'text-red-500 font-bold' : 'text-gray-400 dark:text-gray-500'}`}>
                    <CalendarIcon size={10} className="mr-1" />
                    {formatDate(todo.deadline)}
                </div>
                )}
                {todo.attachments && todo.attachments.length > 0 && (
                    <div className="flex items-center text-xs text-gray-400 dark:text-gray-500">
                        <Paperclip size={10} className="mr-1" />
                        {todo.attachments.length}
                    </div>
                )}
             </div>
           </div>
        </div>
        
        {/* Actions (Timer & Options) */}
        <div className="flex items-center space-x-1 flex-shrink-0 ml-2">
          {/* Timer Controls */}
          {(isHovered || todo.timeSpent > 0) && !todo.completed && (
             <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-full px-2 py-1 text-xs mr-1 animate-in fade-in zoom-in duration-200">
               <span className="mr-2 font-mono font-medium text-gray-700 dark:text-gray-300">
                 {formatTime(todo.timeSpent)}
               </span>
               
               {timerActive ? (
                  <button onClick={handleTimerClick} className="p-1 hover:bg-white dark:hover:bg-gray-600 rounded-full text-amber-600 dark:text-amber-400">
                    <Pause size={12} fill="currentColor" />
                  </button>
               ) : (
                  <button onClick={handleTimerClick} className="p-1 hover:bg-white dark:hover:bg-gray-600 rounded-full text-green-600 dark:text-green-400">
                    <Play size={12} fill="currentColor" />
                  </button>
               )}
               
               {(todo.timerState === TimerState.RUNNING || todo.timerState === TimerState.PAUSED) && (
                 <button onClick={handleStopClick} className="p-1 hover:bg-white dark:hover:bg-gray-600 rounded-full text-red-500 dark:text-red-400 ml-1">
                   <Square size={12} fill="currentColor" />
                 </button>
               )}
             </div>
          )}
        </div>
      </div>

      {/* Subtasks Preview */}
      {todo.subTodos.length > 0 && (
        <div className="ml-8 mt-2 space-y-1">
          {todo.subTodos.slice(0, 2).map(st => (
            <div key={st.id} className="flex items-center text-xs text-gray-500 dark:text-gray-400">
              <div className={`w-1.5 h-1.5 rounded-full mr-2 transition-colors duration-300 ${st.completed ? 'bg-green-400' : 'bg-gray-300 dark:bg-gray-600'}`} />
              <span className={`transition-all duration-300 ${st.completed ? 'line-through opacity-70' : ''}`}>{st.title}</span>
            </div>
          ))}
          {todo.subTodos.length > 2 && (
            <div className="text-xs text-gray-400 pl-3.5">+{todo.subTodos.length - 2} more</div>
          )}
        </div>
      )}

      {/* Footer Actions */}
      <div className={`flex items-center justify-between mt-3 pt-2 border-t border-gray-100 dark:border-gray-700 ${isHovered ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200`}>
        <div className="flex space-x-2">
          <button 
            onClick={handleAiClick}
            disabled={aiLoading}
            className={`p-1.5 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors ${aiLoading ? 'animate-pulse' : ''}`} title="AI Breakdown">
            <Bot size={16} />
          </button>
          <button className="p-1.5 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/30 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" title="Add Collaborator">
            <UserPlus size={16} />
          </button>
        </div>
        
        <button 
          onClick={(e) => { e.stopPropagation(); deleteTodo(todo.id); }}
          className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-900/30 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors">
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};

export default TodoItem;