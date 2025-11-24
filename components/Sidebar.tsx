import React from 'react';
import { ViewMode } from '../types';
import { useTodo } from '../context/TodoContext';
import { useFeatureGate } from '../hooks/useFeatureGate';
import InvitationsList from './InvitationsList';
import { 
  LayoutDashboard, 
  Calendar, 
  CalendarDays, 
  HelpCircle, 
  CheckCircle, 
  Plus,
  Users,
  Moon,
  Sun,
  Activity,
  Lock
} from 'lucide-react';

const Sidebar: React.FC<{ onOpenChat: () => void, onNewCategory: () => void, onManageTeams: () => void, onOpenUpgrade: () => void }> = ({ onOpenChat, onNewCategory, onManageTeams, onOpenUpgrade }) => {
  const { viewMode, setViewMode, isDarkMode, toggleDarkMode, teams, activeTeamId, setActiveTeamId } = useTodo();
  const { canAccessTeams } = useFeatureGate();

  const NavItem = ({ mode, icon: Icon, label }: { mode: ViewMode; icon: React.ElementType; label: string }) => (
    <button
      onClick={() => {
        setViewMode(mode);
        if (mode === ViewMode.BOARD) {
           setActiveTeamId(null);
        }
      }}
      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-r-full transition-colors mb-1
        ${viewMode === mode && activeTeamId === null
          ? 'bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-100 font-medium' 
          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
    >
      <Icon size={20} />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="w-64 h-screen bg-white dark:bg-gray-900 border-r dark:border-gray-800 flex flex-col flex-shrink-0 fixed left-0 top-0 z-10 transition-colors duration-200">
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-amber-400 rounded-lg flex items-center justify-center shadow-md">
            <span className="text-white font-bold text-lg">M</span>
          </div>
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">MindKeep</h1>
        </div>
        <button 
          onClick={toggleDarkMode}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors">
          {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>

      <nav className="flex-1 pr-4 overflow-y-auto custom-scrollbar">
        <NavItem mode={ViewMode.BOARD} icon={LayoutDashboard} label="All Notes" />
        <NavItem mode={ViewMode.TODAY} icon={Calendar} label="Today" />
        <NavItem mode={ViewMode.TOMORROW} icon={CalendarDays} label="Tomorrow" />
        <NavItem mode={ViewMode.IN_PROGRESS} icon={Activity} label="In Progress" />
        <NavItem mode={ViewMode.UNSPECIFIED} icon={HelpCircle} label="Unscheduled" />
        <NavItem mode={ViewMode.COMPLETED} icon={CheckCircle} label="Completed" />
        
        {canAccessTeams ? (
          <>
            <div className="mt-8 px-4 flex items-center justify-between text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              <span>Teams</span>
              <button onClick={onManageTeams} className="hover:text-indigo-500 p-1">
                <Plus size={14} />
              </button>
            </div>
            {teams.map(team => (
              <button 
                key={team.id} 
                onClick={() => {
                    setActiveTeamId(team.id);
                    setViewMode(ViewMode.BOARD);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-2 rounded-r-full transition-colors mb-1
                    ${activeTeamId === team.id 
                        ? 'bg-indigo-100 text-indigo-900 dark:bg-indigo-900/40 dark:text-indigo-100 font-medium' 
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
              >
                <Users size={18} />
                <span className="truncate">{team.name}</span>
              </button>
            ))}
            {teams.length === 0 && (
                <div className="px-4 text-xs text-gray-400 italic">No teams yet</div>
            )}
          </>
        ) : (
          <div className="mt-8 px-4">
             <div className="flex items-center justify-between text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                 <span>Teams</span>
                 <button onClick={onOpenUpgrade} className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-100 px-2 py-0.5 rounded">
                  Upgrade
                 </button>
               </div>
               <div className="text-xs text-gray-400 italic">Choose a tier to enable Teams</div>
          </div>
        )}
      </nav>

      <InvitationsList />

      <div className="p-4 space-y-2 border-t dark:border-gray-800">
        <button
          onClick={onOpenUpgrade}
          className="w-full flex items-center justify-center space-x-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          <span>Change Plan</span>
        </button>
        <button 
          onClick={onOpenChat}
          className="w-full flex items-center justify-center space-x-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          <span>Ask AI Assistant</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;