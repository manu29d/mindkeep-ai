import React from 'react';
import { Check, X } from 'lucide-react';
import { useTodo } from '../context/TodoContext';

const InvitationsList: React.FC = () => {
  const { invitations, respondToInvitation } = useTodo();

  const pendingInvitations = invitations.filter(inv => inv.status === 'PENDING');

  if (pendingInvitations.length === 0) return null;

  return (
    <div className="mb-4">
      <h3 className="text-sm font-bold mb-2">Invitations</h3>
      <div className="space-y-2">
        {pendingInvitations.map(inv => (
          <div key={inv.id} className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded flex items-center justify-between">
            <div>
              <p className="text-sm">Invited to collaborate on &quot;{inv.todo?.title}&quot;</p>
              <p className="text-xs text-gray-500">From {inv.todo?.owner?.name}</p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => respondToInvitation(inv.id, 'accept')}
                className="p-1 bg-green-600 text-white rounded hover:bg-green-700"
              >
                <Check size={16} />
              </button>
              <button
                onClick={() => respondToInvitation(inv.id, 'reject')}
                className="p-1 bg-red-600 text-white rounded hover:bg-red-700"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InvitationsList;