import React, { useState } from 'react';
import { X, Search, UserPlus, Mail } from 'lucide-react';

interface CollaboratorModalProps {
  todoId: string;
  onClose: () => void;
}

const CollaboratorModal: React.FC<CollaboratorModalProps> = ({ todoId, onClose }) => {
  const [email, setEmail] = useState('');
  const [searchResult, setSearchResult] = useState<{ id: string; name: string; email: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [inviting, setInviting] = useState(false);

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
        body: JSON.stringify({ email, todoId })
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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Add Collaborator</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <div className="flex space-x-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                className="flex-1 px-3 py-2 border rounded"
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
              <div className="flex items-center space-x-2">
                <UserPlus size={16} className="text-green-600" />
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
              <div className="flex items-center space-x-2">
                <Mail size={16} className="text-yellow-600" />
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
};

export default CollaboratorModal;