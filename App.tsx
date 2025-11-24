"use client";
import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import CategoryBoard from './components/CategoryBoard';
import AIChat from './components/AIChat';
import { Todo, Category, Attachment } from './types';
import { useTodo } from './context/TodoContext';
import { useFeatureGate } from './hooks/useFeatureGate';
import { X, Calendar, Clock, CheckSquare, Trash2, Bot, Plus, Sparkles, Check, Paperclip, File, Link as LinkIcon, User, UploadCloud, ArrowUpRight, Lock } from 'lucide-react';

// Helper date format
const formatDate = (isoString?: string) => {
  if (!isoString) return '';
  const d = new Date(isoString);
  const day = d.getDate().toString().padStart(2, '0');
  const month = d.toLocaleString('default', { month: 'short' });
  const year = d.getFullYear();
  return `${day} ${month}, ${year}`;
};

const ModalOverlay: React.FC<{ children: React.ReactNode; onClose: () => void; maxWidth?: string }> = ({ children, onClose, maxWidth = 'max-w-2xl' }) => (
  <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
    <div className="absolute inset-0" onClick={onClose} />
    <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full ${maxWidth} relative z-10 overflow-hidden animate-in zoom-in-95 duration-200 transition-colors max-h-[90vh] flex flex-col`}>
      {children}
    </div>
  </div>
);

const AttachmentsList: React.FC<{ 
    attachments: Attachment[], 
    onAdd: (a: Attachment) => void, 
    onRemove: (id: string) => void 
}> = ({ attachments, onAdd, onRemove }) => {
    const [inputOpen, setInputOpen] = useState(false);
    const [url, setUrl] = useState('');
    const [name, setName] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleAddLink = () => {
        if (url && name) {
            onAdd({ id: crypto.randomUUID(), name, url, type: 'link' });
            setUrl('');
            setName('');
            setInputOpen(false);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const dataUrl = event.target?.result as string;
          onAdd({
            id: crypto.randomUUID(),
            name: file.name,
            url: dataUrl,
            type: 'file'
          });
        };
        reader.readAsDataURL(file);
      }
      // Reset value to allow selecting same file again if needed
      if (e.target) e.target.value = '';
    };

    return (
        <div className="mt-2">
             <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Attachments</label>
             <div className="space-y-2 mb-3">
                 {attachments.map(att => (
                     <div key={att.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/30 p-2 rounded text-sm">
                         <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-200 truncate overflow-hidden">
                             {att.type === 'file' ? <File size={14} className="flex-shrink-0"/> : <LinkIcon size={14} className="flex-shrink-0"/>}
                             <a href={att.url} target="_blank" rel="noreferrer" className="hover:underline text-blue-500 truncate block" download={att.type === 'file' ? att.name : undefined}>{att.name}</a>
                         </div>
                         <button onClick={() => onRemove(att.id)} className="text-gray-400 hover:text-red-500 flex-shrink-0 ml-2">
                             <X size={14} />
                         </button>
                     </div>
                 ))}
             </div>
             
             {inputOpen ? (
                 <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded space-y-2">
                     <div className="text-xs font-semibold text-gray-500 mb-1">Add Link</div>
                     <input 
                        value={name} onChange={e => setName(e.target.value)} 
                        placeholder="Link Name"
                        className="w-full text-sm p-1 bg-white dark:bg-gray-600 rounded border border-gray-300 dark:border-gray-500"
                     />
                     <input 
                        value={url} onChange={e => setUrl(e.target.value)} 
                        placeholder="URL (e.g. https://...)"
                        className="w-full text-sm p-1 bg-white dark:bg-gray-600 rounded border border-gray-300 dark:border-gray-500"
                     />
                     <div className="flex justify-end space-x-2">
                         <button onClick={() => setInputOpen(false)} className="text-xs px-2 py-1 text-gray-500">Cancel</button>
                         <button onClick={handleAddLink} className="text-xs bg-blue-500 text-white px-2 py-1 rounded">Add Link</button>
                     </div>
                 </div>
             ) : (
                 <div className="flex space-x-2">
                     <button onClick={() => setInputOpen(true)} className="flex items-center space-x-1 text-xs text-gray-500 hover:text-indigo-500 bg-gray-100 dark:bg-gray-700/50 px-2 py-1.5 rounded transition-colors">
                         <LinkIcon size={14} />
                         <span>Add Link</span>
                     </button>
                     <button onClick={() => fileInputRef.current?.click()} className="flex items-center space-x-1 text-xs text-gray-500 hover:text-indigo-500 bg-gray-100 dark:bg-gray-700/50 px-2 py-1.5 rounded transition-colors">
                         <UploadCloud size={14} />
                         <span>Upload File</span>
                     </button>
                     <input 
                        type="file" 
                        hidden 
                        ref={fileInputRef} 
                        onChange={handleFileSelect}
                     />
                 </div>
             )}
        </div>
    );
};

const TodoDetailModal: React.FC<{ todoId: string; onClose: () => void; onOpenCategory: (cat: Category) => void }> = ({ todoId, onClose, onOpenCategory }) => {
  const { todos, updateTodo, deleteTodo, enrichTodoWithAI, categories } = useTodo();
  const { canAccessAI } = useFeatureGate();
  
  const todo = todos.find(t => t.id === todoId);
  const [title, setTitle] = useState(todo?.title || '');
  const [desc, setDesc] = useState(todo?.description || '');
  const [subtaskInput, setSubtaskInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    if (todo) {
      setTitle(todo.title);
      setDesc(todo.description || '');
    }
  }, [todo?.id]); 

  if (!todo) return null;

  const currentCategory = categories.find(c => c.id === todo.categoryId);
  const phases = currentCategory?.phases || [];

  const handleSave = () => {
    updateTodo(todo.id, { title, description: desc });
    onClose();
  };

  const addSubtask = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && subtaskInput.trim()) {
      const newSub = { id: crypto.randomUUID(), title: subtaskInput, completed: false };
      updateTodo(todo.id, { subTodos: [...todo.subTodos, newSub] });
      setSubtaskInput('');
    }
  };

  const toggleSubtask = (sId: string, currentStatus: boolean) => {
    const updatedSubs = todo.subTodos.map(s => s.id === sId ? { ...s, completed: !currentStatus } : s);
    updateTodo(todo.id, { subTodos: updatedSubs });
  };

  const updateSubtaskTitle = (sId: string, newTitle: string) => {
     const updatedSubs = todo.subTodos.map(s => s.id === sId ? { ...s, title: newTitle } : s);
     updateTodo(todo.id, { subTodos: updatedSubs });
  };

  const updateSubtaskDeadline = (sId: string, newDate: string) => {
      const updatedSubs = todo.subTodos.map(s => s.id === sId ? { ...s, deadline: newDate } : s);
      updateTodo(todo.id, { subTodos: updatedSubs });
  };

  const handleEnrich = async () => {
    setAiLoading(true);
    await enrichTodoWithAI(todo.id);
    setAiLoading(false);
  };

  const handleAttachmentAdd = (att: Attachment) => {
      updateTodo(todo.id, { attachments: [...todo.attachments, att] });
  };

  const handleAttachmentRemove = (id: string) => {
      updateTodo(todo.id, { attachments: todo.attachments.filter(a => a.id !== id) });
  };

  return (
    <ModalOverlay onClose={handleSave}>
        {/* Header */}
        <div className="p-6 border-b dark:border-gray-700 flex items-start justify-between flex-shrink-0">
          <div className="flex-1 mr-4">
            <input 
              value={title} 
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => updateTodo(todo.id, { title })}
              className="text-2xl font-bold text-gray-800 dark:text-white w-full outline-none placeholder-gray-300 bg-transparent"
              placeholder="Task Title"
            />
            <div className="flex items-center mt-2 space-x-4 text-gray-500 dark:text-gray-400 text-sm">
              <div className="flex items-center space-x-1">
                 <Clock size={14} />
                 <span>{Math.floor(todo.timeSpent / 60)}m tracked</span>
              </div>
              <div className="flex items-center space-x-1">
                 <div className={`w-2 h-2 rounded-full ${todo.completed ? 'bg-green-500' : 'bg-amber-500'}`} />
                 <span>{todo.completed ? 'Completed' : 'In Progress'}</span>
              </div>
              {currentCategory && (
                  <button 
                    onClick={() => { onClose(); onOpenCategory(currentCategory); }}
                    className="flex items-center space-x-1 text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors cursor-pointer text-indigo-600 dark:text-indigo-400 group">
                    <span>{currentCategory.title}</span>
                    <ArrowUpRight size={10} className="opacity-50 group-hover:opacity-100" />
                  </button>
              )}
            </div>
          </div>
          <button onClick={handleSave} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-500 dark:text-gray-400">
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Notes</label>
            <textarea 
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              onBlur={() => updateTodo(todo.id, { description: desc })}
              className="w-full min-h-[80px] text-gray-700 dark:text-gray-200 outline-none resize-none bg-white dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900 transition-all"
              placeholder="Add details..."
            />
          </div>
          
          {/* Attachments */}
          <AttachmentsList 
            attachments={todo.attachments} 
            onAdd={handleAttachmentAdd} 
            onRemove={handleAttachmentRemove} 
          />

          {/* Subtasks */}
          <div>
             <div className="flex items-center justify-between mb-2">
               <label className="block text-xs font-semibold text-gray-400 uppercase">Sub-tasks</label>
               {canAccessAI ? (
                 <button 
                   onClick={handleEnrich}
                   disabled={aiLoading}
                   className="flex items-center space-x-1 text-xs text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/30 px-2 py-1 rounded transition-colors">
                   <Bot size={12} />
                   <span>{aiLoading ? 'Generating...' : 'Auto-Breakdown'}</span>
                 </button>
               ) : (
                 <div className="flex items-center space-x-1 text-xs text-gray-400 px-2 py-1">
                    <Lock size={10} />
                    <span>AI Breakdown (Premium)</span>
                 </div>
               )}
             </div>
             
             <div className="space-y-2 mb-3">
               {todo.subTodos.map(st => (
                 <div key={st.id} className="flex items-center group bg-gray-50 dark:bg-gray-700/30 rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors">
                   <button 
                     onClick={() => toggleSubtask(st.id, st.completed)}
                     className={`mr-3 w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${st.completed ? 'bg-indigo-500 border-indigo-500' : 'border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-800'}`}>
                     {st.completed && <Check size={12} className="text-white" />}
                   </button>
                   
                   <div className="flex-1 flex flex-col">
                       <input 
                         value={st.title}
                         onChange={(e) => updateSubtaskTitle(st.id, e.target.value)}
                         className={`bg-transparent outline-none text-sm w-full ${st.completed ? 'line-through text-gray-400' : 'text-gray-700 dark:text-gray-200'}`}
                       />
                       {st.deadline && (
                           <span className={`text-[10px] ${new Date(st.deadline) < new Date() ? 'text-red-500' : 'text-gray-400'}`}>
                               Due: {formatDate(st.deadline)}
                           </span>
                       )}
                   </div>

                   {/* Subtask Deadline Picker */}
                   <div className="relative ml-2">
                        <div className="relative opacity-0 group-hover:opacity-100 transition-opacity focus-within:opacity-100">
                            <input 
                                type="date"
                                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                                onChange={(e) => updateSubtaskDeadline(st.id, e.target.value)}
                            />
                            <button className="p-1 text-gray-400 hover:text-indigo-500 rounded">
                                <Calendar size={14} />
                            </button>
                        </div>
                   </div>
                 </div>
               ))}
             </div>
             <div className="flex items-center text-gray-400 mt-2">
               <Plus size={16} className="mr-3" />
               <input 
                 value={subtaskInput}
                 onChange={(e) => setSubtaskInput(e.target.value)}
                 onKeyDown={addSubtask}
                 placeholder="Add a subtask..."
                 className="flex-1 bg-transparent outline-none text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400"
               />
             </div>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t dark:border-gray-700">
             <div>
               <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Due Date</label>
               <input 
                 type="date" 
                 value={todo.deadline ? todo.deadline.split('T')[0] : ''}
                 onChange={(e) => updateTodo(todo.id, { deadline: e.target.value })}
                 className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 outline-none focus:ring-2 focus:ring-indigo-500" 
               />
             </div>
             
             {phases.length > 0 && (
                <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Phase</label>
                    <select 
                        value={todo.phaseId || ''}
                        onChange={(e) => updateTodo(todo.id, { phaseId: e.target.value || undefined })}
                        className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="">Unphased</option>
                        {phases.map(p => (
                            <option key={p.id} value={p.id}>{p.title}</option>
                        ))}
                    </select>
                </div>
             )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t dark:border-gray-700 flex justify-between items-center flex-shrink-0">
          <button 
            onClick={() => { deleteTodo(todo.id); onClose(); }}
            className="text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 px-3 py-2 rounded-lg text-sm flex items-center space-x-2 transition-colors">
            <Trash2 size={16} />
            <span>Delete Task</span>
          </button>
          <button 
            onClick={handleSave}
            className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-2 rounded-lg text-sm hover:bg-gray-800 dark:hover:bg-gray-200 transition-all shadow-lg">
            Done
          </button>
        </div>
    </ModalOverlay>
  );
};

const CategoryDetailModal: React.FC<{ category: Category; onClose: () => void }> = ({ category, onClose }) => {
    const { updateCategory, teams } = useTodo();
    const { canAccessTeams } = useFeatureGate();
    const [title, setTitle] = useState(category.title);
    const [desc, setDesc] = useState(category.description || '');
    const [assignedTeam, setAssignedTeam] = useState(category.teamId || '');

    const handleSave = () => {
        updateCategory(category.id, { title, description: desc, teamId: assignedTeam || undefined });
        onClose();
    }

    const handleAttachmentAdd = (att: Attachment) => {
        updateCategory(category.id, { attachments: [...(category.attachments || []), att] });
    };
  
    const handleAttachmentRemove = (id: string) => {
        updateCategory(category.id, { attachments: (category.attachments || []).filter(a => a.id !== id) });
    };

    return (
        <ModalOverlay onClose={handleSave}>
            <div className="p-6">
                <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Edit Category</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Title</label>
                        <input 
                            value={title} onChange={e => setTitle(e.target.value)} 
                            className="w-full p-2 border rounded bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Description</label>
                        <textarea 
                            value={desc} onChange={e => setDesc(e.target.value)} 
                            className="w-full p-2 border rounded bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none h-24"
                        />
                    </div>
                    
                    {/* Team Assignment */}
                    {canAccessTeams && (
                        <div>
                            <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Assigned Team</label>
                            <select 
                                value={assignedTeam}
                                onChange={(e) => setAssignedTeam(e.target.value)}
                                className="w-full p-2 border rounded bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            >
                                <option value="">Personal (No Team)</option>
                                {teams.map(team => (
                                    <option key={team.id} value={team.id}>{team.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <AttachmentsList 
                        attachments={category.attachments || []}
                        onAdd={handleAttachmentAdd}
                        onRemove={handleAttachmentRemove}
                    />
                </div>
                <div className="mt-6 flex justify-end">
                    <button onClick={handleSave} className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-2 rounded">Close & Save</button>
                </div>
            </div>
        </ModalOverlay>
    );
};

const TeamsModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { teams, addTeam, addTeamMember } = useTodo();
    const [newTeamName, setNewTeamName] = useState('');
    const [newMemberName, setNewMemberName] = useState('');
    const [activeTeamId, setActiveTeamId] = useState<string | null>(teams[0]?.id || null);

    const handleCreateTeam = () => {
        if(newTeamName) {
            addTeam(newTeamName);
            setNewTeamName('');
        }
    }

    const handleAddMember = () => {
        if(activeTeamId && newMemberName) {
            addTeamMember(activeTeamId, newMemberName, 'Member');
            setNewMemberName('');
        }
    }

    return (
        <ModalOverlay onClose={onClose} maxWidth="max-w-4xl">
            <div className="p-6 h-[600px] flex flex-col">
                <h2 className="text-xl font-bold mb-6 text-gray-800 dark:text-white">Manage Teams</h2>
                
                <div className="flex flex-1 space-x-6 overflow-hidden">
                    {/* Sidebar List */}
                    <div className="w-2/5 border-r dark:border-gray-700 pr-4 flex flex-col">
                        <div className="space-y-1 overflow-y-auto flex-1">
                            {teams.map(t => (
                                <button 
                                    key={t.id}
                                    onClick={() => setActiveTeamId(t.id)}
                                    className={`w-full text-left px-3 py-2 rounded flex items-center justify-between ${activeTeamId === t.id ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                                >
                                    <span className="font-medium">{t.name}</span>
                                    <span className="text-xs bg-gray-200 dark:bg-gray-600 px-1.5 rounded-full">{t.members.length}</span>
                                </button>
                            ))}
                        </div>
                        <div className="mt-4 pt-4 border-t dark:border-gray-700">
                            <div className="flex items-center space-x-2">
                                <input 
                                    value={newTeamName}
                                    onChange={e => setNewTeamName(e.target.value)}
                                    placeholder="New Team Name"
                                    className="flex-1 text-sm p-2 border rounded bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white items-center"
                                />
                                <button onClick={handleCreateTeam} disabled={!newTeamName} className="bg-indigo-600 text-white p-2 rounded items-center justify-center flex disabled:opacity-50">
                                    <Plus size={16}/>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Team Details */}
                    <div className="flex-1 flex flex-col">
                         {activeTeamId ? (
                             <>
                                <div className="flex-1 overflow-y-auto">
                                    <h3 className="font-bold text-gray-700 dark:text-gray-300 mb-4">Team Members</h3>
                                    <div className="space-y-3">
                                        {teams.find(t => t.id === activeTeamId)?.members.map(m => (
                                            <div key={m.id} className="flex items-center space-x-3 p-2 bg-gray-50 dark:bg-gray-800/50 rounded border border-gray-100 dark:border-gray-700">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                                                    {m.avatar}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-gray-800 dark:text-gray-200">{m.name}</div>
                                                    <div className="text-xs text-gray-500">{m.role}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t dark:border-gray-700">
                                     <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Add Member</label>
                                     <div className="flex items-center space-x-2">
                                        <input 
                                            value={newMemberName}
                                            onChange={e => setNewMemberName(e.target.value)}
                                            placeholder="Member Name or Email"
                                            className="flex-1 text-sm p-2 border rounded bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white bg-white"
                                        />
                                        <button onClick={handleAddMember} disabled={!newMemberName} className="bg-indigo-600 text-white p-2 rounded items-center justify-center flex disabled:opacity-50" title="Invite Member">
                                            <Plus size={16} />
                                        </button>
                                     </div>
                                </div>
                             </>
                         ) : (
                             <div className="flex-1 flex items-center justify-center text-gray-400">Select a team</div>
                         )}
                    </div>
                </div>
            </div>
        </ModalOverlay>
    )
}

const NewCategoryModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { addCategory, teams, activeTeamId } = useTodo();
  const { canAccessTeams, canAccessAI } = useFeatureGate();
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [deadline, setDeadline] = useState('');
  const [selectedTeam, setSelectedTeam] = useState(activeTeamId || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!title) return;
    setLoading(true);
    await addCategory(title, 'bg-white dark:bg-gray-800', desc, deadline || undefined, selectedTeam || undefined); 
    setLoading(false);
    onClose();
  };

  return (
    <ModalOverlay onClose={onClose}>
      <div className="p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Create New Category</h2>
        
        <div className="space-y-4">
            <input 
            className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
            placeholder="Category Name (e.g., Marketing Launch)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            />
            
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Deadline (Optional)</label>
                    <input 
                        type="date"
                        className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        value={deadline}
                        onChange={(e) => setDeadline(e.target.value)}
                    />
                </div>
                {canAccessTeams && (
                    <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Assign to Team</label>
                        <select 
                            value={selectedTeam}
                            onChange={(e) => setSelectedTeam(e.target.value)}
                            className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                             <option value="">Personal (No Team)</option>
                             {teams.map(team => (
                                 <option key={team.id} value={team.id}>{team.name}</option>
                             ))}
                        </select>
                    </div>
                )}
            </div>

            {canAccessAI ? (
                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg">
                <div className="flex items-center space-x-2 text-indigo-700 dark:text-indigo-400 mb-2 font-medium text-sm">
                    <Sparkles size={16} />
                    <span>AI Auto-Plan</span>
                </div>
                <textarea 
                    className="w-full p-3 border border-indigo-100 dark:border-indigo-800 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
                    placeholder="Describe the project (e.g., 'Plan a launch party for 50 people'). AI will generate initial tasks."
                    rows={3}
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                />
                </div>
            ) : (
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 opacity-75">
                    <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 mb-2 font-medium text-sm">
                        <Lock size={16} />
                        <span>AI Auto-Plan (Premium)</span>
                    </div>
                    <p className="text-xs text-gray-400">Upgrade to Premium to automatically generate tasks for your projects.</p>
                </div>
            )}
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">Cancel</button>
          <button 
            onClick={handleSubmit} 
            disabled={loading || !title}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center space-x-2 shadow-md">
            {loading && <Bot size={16} className="animate-bounce" />}
            <span>{loading ? 'Planning...' : 'Create Category'}</span>
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
};

const App: React.FC = () => {
  const { searchQuery, setSearchQuery, isLoading } = useTodo();
  const [chatOpen, setChatOpen] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [teamsModalOpen, setTeamsModalOpen] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [selectedTodoId, setSelectedTodoId] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar 
        onOpenChat={() => setChatOpen(true)} 
        onNewCategory={() => setCategoryModalOpen(true)}
        onManageTeams={() => setTeamsModalOpen(true)}
        onOpenUpgrade={() => setUpgradeModalOpen(true)}
      />

      {/* Main Content */}
      <main className="flex-1 ml-64 overflow-y-auto overflow-x-hidden h-full relative">
        {/* Top Bar (Mobile/Search placeholder) */}
        <header className="sticky top-0 z-10 bg-[#f3f4f6]/90 dark:bg-gray-900/90 backdrop-blur-sm px-8 py-4 flex justify-between items-center transition-colors duration-200">
           <div className="flex items-center bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 px-4 py-2 w-96 hover:shadow-md transition-all">
             <span className="text-gray-400 mr-2">🔍</span>
             <input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tasks..." 
                className="bg-transparent outline-none w-full text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400" 
             />
           </div>
           <div className="flex items-center space-x-3">
             <div className="hidden md:flex items-center space-x-3">
               <button
                 onClick={() => setCategoryModalOpen(true)}
                 className="inline-flex items-center space-x-2 bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
               >
                 <Plus size={16} />
                 <span className="text-sm font-medium">New List</span>
               </button>
               <div className="text-right">
                <div className="text-sm font-bold text-gray-800 dark:text-white">Jane Doe</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Product Manager</div>
               </div>
             </div>
             <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold shadow-lg">
               JD
             </div>
           </div>
        </header>

        <CategoryBoard 
            onTodoClick={(t) => setSelectedTodoId(t.id)} 
            onEditCategory={(c) => setEditingCategory(c)}
        />
        
        <div className="h-20" /> {/* Bottom spacer */}
      </main>

      {/* Right Side Panels / Modals */}
      {chatOpen && <AIChat onClose={() => setChatOpen(false)} />}
      {categoryModalOpen && <NewCategoryModal onClose={() => setCategoryModalOpen(false)} />}
      {teamsModalOpen && <TeamsModal onClose={() => setTeamsModalOpen(false)} />}
      {upgradeModalOpen && (
        <ModalOverlay onClose={() => setUpgradeModalOpen(false)}>
          <div className="p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Upgrade Plan (Demo)</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Select a tier to enable demo features. No payment required.</p>
            <div className="space-y-3">
              <button onClick={async () => {
                  try {
                    const res = await fetch('/api/users/upgrade', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tier: 'FREE' }) });
                    if (!res.ok) throw new Error('Upgrade failed');
                    setUpgradeModalOpen(false);
                    // Refresh the session and data
                    await fetch('/api/auth/session');
                    window.location.reload();
                  } catch (err) {
                    console.error(err);
                  }
                }} className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">Free — Keep current plan</button>

              <button onClick={async () => {
                  try {
                    const res = await fetch('/api/users/upgrade', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tier: 'PREMIUM' }) });
                    if (!res.ok) throw new Error('Upgrade failed');
                    setUpgradeModalOpen(false);
                    await fetch('/api/auth/session');
                    window.location.reload();
                  } catch (err) {
                    console.error(err);
                  }
                }} className="w-full text-left px-4 py-3 rounded-lg border border-indigo-200 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-800">Pro — Enable premium features (Demo)</button>

              <button onClick={async () => {
                  try {
                    const res = await fetch('/api/users/upgrade', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tier: 'ENTERPRISE' }) });
                    if (!res.ok) throw new Error('Upgrade failed');
                    setUpgradeModalOpen(false);
                    await fetch('/api/auth/session');
                    window.location.reload();
                  } catch (err) {
                    console.error(err);
                  }
                }} className="w-full text-left px-4 py-3 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-800">Enterprise — Enable Teams (Demo)</button>
            </div>
            <div className="mt-6 flex justify-end">
              <button onClick={() => setUpgradeModalOpen(false)} className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800">Close</button>
            </div>
          </div>
        </ModalOverlay>
      )}
      {selectedTodoId && (
        <TodoDetailModal 
            todoId={selectedTodoId} 
            onClose={() => setSelectedTodoId(null)}
            onOpenCategory={(cat) => setEditingCategory(cat)} 
        />
      )}
      {editingCategory && <CategoryDetailModal category={editingCategory} onClose={() => setEditingCategory(null)} />}
    </div>
  );
};

export default App;