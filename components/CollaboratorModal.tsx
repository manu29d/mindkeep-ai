import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Search, UserPlus, Mail, Check } from 'lucide-react';
import { Todo } from '../types';
import { useTodo } from '../context/TodoContext';

interface CollaboratorModalProps {
  todo: Todo;
  onClose: () => void;
}

const CollaboratorModal: React.FC<CollaboratorModalProps> = ({ todo, onClose }) => {
  const { categories, teams, updateTodo } = useTodo();
  const [email, setEmail] = useState('');
  const [searchResult, setSearchResult] = useState<{ id: string; name: string; email: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [portalEl, setPortalEl] = useState<HTMLElement | null>(null);

  const category = categories.find(c => c.id === todo.categoryId);
  const team = category?.teamId ? teams.find(t => t.id === category.teamId) : null;

  useEffect(() => {
    // Create a container div for the portal and append to document.body
    const el = document.createElement('div');
    // Ensure the portal sits above everything; utility z-index class is applied inside content as well
    el.setAttribute('data-portal', 'collaborator-modal');
    document.body.appendChild(el);
    setPortalEl(el);
    return () => {
      if (document.body.contains(el)) document.body.removeChild(el);
    };
  }, []);

  const searchUser = async () => {
    if (!email.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/users/search?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      setSearchResult(data.user || null);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const inviteUser = async () => {
    if (!searchResult) return;
    setInviting(true);
    try {
      const res = await fetch('/api/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, todoId: todo.id })
      });
      if (res.ok) {
        alert('Invitation sent!');
        onClose();
      } else {
        alert('Failed to send invitation');
      }
    } catch (error) {
      console.error(error);
    }
    setInviting(false);
  };

  const isAssigned = (userId: string) => todo.assigneeIds?.includes(userId);

  const toggleAssignee = async (userId: string) => {
      const currentAssignees = todo.assigneeIds || [];
      let newAssignees;
      if (currentAssignees.includes(userId)) {
          newAssignees = currentAssignees.filter(id => id !== userId);
      } else {
          newAssignees = [...currentAssignees, userId];
      }
      await updateTodo(todo.id, { assigneeIds: newAssignees });
  };

  const content = (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold dark:text-white">Add Collaborator</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded dark:text-gray-300">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Team Members Section */}
          {team && (
             <div>
                 <h3 className="text-sm font-semibold mb-2 text-gray-500 dark:text-gray-400">Team Members ({team.name})</h3>
                 <div className="space-y-2 max-h-40 overflow-y-auto">
                     {team.members.map(member => (
                         <div key={member.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
                             <div className="flex items-center space-x-2">
                                 <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-xs font-bold text-indigo-600 dark:text-indigo-300">
                                     {member.user?.name?.[0] || member.user?.email?.[0] || '?'}
                                 </div>
                                 <span className="text-sm dark:text-gray-200">{member.user?.name || member.user?.email}</span>
                             </div>
                             <button 
                                onClick={() => toggleAssignee(member.userId)}
                                className={`p-1 rounded-full transition-colors ${isAssigned(member.userId) ? 'bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400' : 'bg-gray-200 text-gray-500 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-400 dark:hover:bg-gray-500'}`}
                             >
                                 {isAssigned(member.userId) ? <Check size={14} /> : <UserPlus size={14} />}
                             </button>
                         </div>
                     ))}
                 </div>
             </div>
          )}

          {/* External Invite Section */}
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Invite External User</label>
            <div className="flex space-x-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                className="flex-1 px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <button
                onClick={searchUser}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                <Search size={16} />
              </button>
            </div>
          </div>

          {searchResult && (
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded">
              <div className="flex items-center space-x-2 dark:text-gray-200">
                <UserPlus size={16} className="text-green-600 dark:text-green-400" />
                <span>{searchResult.name} ({searchResult.email})</span>
              </div>
              <button
                onClick={inviteUser}
                disabled={inviting}
                className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              >
                {inviting ? 'Inviting...' : 'Invite'}
              </button>
            </div>
          )}

          {!searchResult && email && !loading && (
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded">
              <div className="flex items-center space-x-2 dark:text-gray-200">
                <Mail size={16} className="text-yellow-600 dark:text-yellow-400" />
                <span>User not found. Send email invite?</span>
              </div>
              <button className="mt-2 px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700">
                Send Invite (Future)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (!portalEl) return null; // Wait until portal container exists (SSR-safe)

  return createPortal(content, portalEl);
};

export default CollaboratorModal;