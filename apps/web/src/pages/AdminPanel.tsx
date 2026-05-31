import React, { useEffect, useState } from 'react';
import { ApiClient } from '../services/api.js';
import { Card } from '../components/ui/Card.js';
import { Button } from '../components/ui/Button.js';
import { ShieldAlert, Users, Sliders, ToggleLeft, ToggleRight, ListCollapse } from 'lucide-react';

interface UserRecord {
  _id: string;
  name: string;
  email: string;
  role: string;
  xp: number;
}

interface AuditLog {
  _id: string;
  action: string;
  timestamp: string;
  ip: string;
  userAgent: string;
  metadata?: any;
}

export const AdminPanel: React.FC = () => {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [featureFlags, setFeatureFlags] = useState<Record<string, boolean>>({
    'code-sandbox-engine': true,
    'dynamic-mock-interviews': true,
    'personalized-weekly-roadmaps': true,
  });
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    try {
      const usersData = await ApiClient.request('/admin/users');
      setUsers(usersData.users || []);

      const logsData = await ApiClient.request('/admin/audit-logs');
      setLogs(logsData.logs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const toggleFlag = async (name: string) => {
    const nextState = !featureFlags[name];
    try {
      await ApiClient.request('/admin/feature/toggle', {
        method: 'POST',
        body: JSON.stringify({
          name,
          isEnabled: nextState,
        }),
      });
      setFeatureFlags({ ...featureFlags, [name]: nextState });
    } catch (err) {
      console.error(err);
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      await ApiClient.request('/admin/user/role', {
        method: 'POST',
        body: JSON.stringify({
          userId,
          role: newRole,
        }),
      });
      alert(`User role successfully changed to ${newRole}`);
      await fetchAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Enterprise Operations Control</h1>
        <p className="text-slate-400 text-sm">Manage student credentials, evaluate system feature flags, and review chronological audit trails.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Users lists Column */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <Card hoverable={false} className="p-0 overflow-hidden flex flex-col">
            <div className="px-6 py-4 bg-slate-900/50 border-b border-white/10 flex justify-between items-center">
              <h3 className="font-bold text-sm text-slate-300 flex items-center gap-2">
                <Users className="h-4 w-4 text-indigo-400" />
                <span>Student Directory Registry</span>
              </h3>
            </div>

            <div className="flex flex-col divide-y divide-white/5 max-h-[360px] overflow-y-auto">
              {loading ? (
                <p className="p-6 text-xs text-slate-500 animate-pulse">Scanning DB collections...</p>
              ) : users.length === 0 ? (
                <p className="p-6 text-xs text-slate-500 italic">No user accounts found.</p>
              ) : (
                users.map((u) => (
                  <div key={u._id} className="px-6 py-4 flex items-center justify-between text-xs hover:bg-white/5">
                    <div>
                      <h4 className="font-bold text-slate-200">{u.name}</h4>
                      <p className="text-slate-500 mt-0.5">{u.email}</p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <span className="px-2 py-0.5 bg-white/5 border border-white/10 text-slate-400 font-semibold rounded uppercase text-[9px]">
                        {u.role}
                      </span>
                      <select
                        value={u.role}
                        onChange={(e) => updateUserRole(u._id, e.target.value)}
                        className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-[10px] text-white focus:outline-none focus:border-indigo-500"
                      >
                        <option value="Student">Student</option>
                        <option value="Mentor">Mentor</option>
                        <option value="Admin">Admin</option>
                      </select>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Audit Logs lists */}
          <Card hoverable={false} className="p-0 overflow-hidden flex flex-col">
            <div className="px-6 py-4 bg-slate-900/50 border-b border-white/10 flex justify-between items-center">
              <h3 className="font-bold text-sm text-slate-300 flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-emerald-400" />
                <span>Auditing Trails & Security Logs</span>
              </h3>
            </div>

            <div className="flex flex-col divide-y divide-white/5 max-h-[300px] overflow-y-auto font-mono text-[10px] text-slate-400">
              {loading ? (
                <p className="p-6 italic">Traversing security logs...</p>
              ) : logs.length === 0 ? (
                <p className="p-6 italic text-center">No logs generated yet.</p>
              ) : (
                logs.map((log) => (
                  <div key={log._id} className="px-6 py-3.5 flex justify-between hover:bg-white/5">
                    <div>
                      <span className="font-bold text-indigo-400">[{log.action}]</span>
                      <span className="text-slate-500 ml-2">IP: {log.ip}</span>
                      <p className="text-slate-500 mt-1 max-w-md truncate">{log.userAgent}</p>
                    </div>
                    <span className="text-slate-600 shrink-0 text-right">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Feature flags control side bars */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <Card hoverable={false} className="flex flex-col gap-4">
            <h3 className="font-bold text-sm flex items-center gap-2 text-indigo-400">
              <Sliders className="h-4 w-4" />
              <span>Feature Flags overrides</span>
            </h3>

            <div className="flex flex-col gap-4 mt-2">
              {Object.keys(featureFlags).map((flag) => {
                const isActive = featureFlags[flag];
                return (
                  <div key={flag} className="flex justify-between items-center p-3 bg-white/5 border border-white/5 rounded-xl">
                    <div>
                      <h4 className="text-xs font-semibold capitalize text-slate-300">
                        {flag.replace(/-/g, ' ')}
                      </h4>
                      <p className="text-[9px] text-slate-500 mt-0.5">Toggle release feature live</p>
                    </div>

                    <button onClick={() => toggleFlag(flag)} className="text-slate-400 hover:text-white">
                      {isActive ? (
                        <ToggleRight className="h-7 w-7 text-indigo-500" />
                      ) : (
                        <ToggleLeft className="h-7 w-7 text-slate-600" />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
export default AdminPanel;
