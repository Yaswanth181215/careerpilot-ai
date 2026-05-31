import React, { useState, useEffect } from 'react';
import { ApiClient } from '../services/api.js';
import { Card } from '../components/ui/Card.js';
import { Button } from '../components/ui/Button.js';
import { Input } from '../components/ui/Input.js';
import { Map, Loader2, Sparkles, BookOpen, Layers, CheckCircle } from 'lucide-react';

export const LearningRoadmap: React.FC = () => {
  const [goal, setGoal] = useState('');
  const [loading, setLoading] = useState(false);
  const [roadmaps, setRoadmaps] = useState<any[]>([]);
  const [selectedRoadmap, setSelectedRoadmap] = useState<any | null>(null);

  const fetchRoadmaps = async () => {
    try {
      const data = await ApiClient.request('/career/roadmap/list');
      setRoadmaps(data.roadmaps);
      if (data.roadmaps.length > 0) {
        setSelectedRoadmap(data.roadmaps[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRoadmaps();
  }, []);

  const generateRoadmap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal.trim()) return;
    setLoading(true);

    try {
      const response = await ApiClient.request('/career/roadmap/generate', {
        method: 'POST',
        body: JSON.stringify({ goal }),
      });
      setGoal('');
      await fetchRoadmaps();
      setSelectedRoadmap(response.roadmap);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">AI Learning Roadmaps</h1>
        <p className="text-slate-400 text-sm">Generate weekly plans, project ideas, and certification objectives dynamically.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Creation Form & Saved Roadmaps */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <Card hoverable={false} className="flex flex-col gap-4">
            <h3 className="font-bold text-sm flex items-center gap-2 text-indigo-400">
              <Map className="h-4 w-4" />
              <span>Generate Roadmap</span>
            </h3>

            <form onSubmit={generateRoadmap} className="flex flex-col gap-3">
              <Input
                label="Target Role / Goal"
                placeholder="e.g. Kubernetes Administrator, AWS Engineer"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                required
              />
              <Button type="submit" disabled={loading || !goal.trim()} className="flex items-center justify-center gap-2 mt-2 py-2.5">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Planning Roadmap...</span>
                  </>
                ) : (
                  <span>Create Plan</span>
                )}
              </Button>
            </form>
          </Card>

          <Card hoverable={false} className="flex flex-col gap-3">
            <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider">Your Career Paths</h3>
            {roadmaps.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No custom roadmaps generated yet.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {roadmaps.map((r) => (
                  <button
                    key={r._id}
                    onClick={() => setSelectedRoadmap(r)}
                    className={`text-left px-4 py-3 rounded-xl border text-xs font-semibold transition-all ${
                      selectedRoadmap?._id === r._id
                        ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-400'
                        : 'bg-slate-900/40 border-white/5 hover:bg-slate-900/60'
                    }`}
                  >
                    {r.title}
                  </button>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Selected Roadmap Timeline details */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {selectedRoadmap ? (
            <div className="flex flex-col gap-6 animate-fadeIn">
              <Card hoverable={false} className="flex flex-col gap-2 bg-indigo-950/15 border-indigo-500/20">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-100">{selectedRoadmap.title}</h3>
                  <span className="px-2.5 py-0.5 bg-indigo-500/10 text-indigo-400 text-xs font-semibold rounded border border-indigo-500/25">
                    {selectedRoadmap.durationWeeks} Weeks
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed mt-1">{selectedRoadmap.description}</p>
              </Card>

              {/* Weekly Timeline List */}
              <div className="flex flex-col gap-6 relative pl-6 border-l border-white/10 ml-3">
                {selectedRoadmap.weeklyPlan.map((week: any, idx: number) => (
                  <div key={idx} className="relative flex flex-col gap-4">
                    {/* Circle Node */}
                    <div className="absolute left-[-31px] top-1.5 h-4.5 w-4.5 rounded-full bg-slate-950 border-2 border-indigo-500 flex items-center justify-center">
                      <div className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                    </div>

                    <Card hoverable={false} className="flex flex-col gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2 py-0.5 bg-white/5 border border-white/10 rounded-md text-slate-400">
                          WEEK {week.week}
                        </span>
                        <h4 className="font-bold text-sm text-slate-200">{week.topic}</h4>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-1">
                        {/* Weekly Objectives */}
                        <div className="flex flex-col gap-2">
                          <span className="text-[10px] uppercase font-bold text-indigo-400 flex items-center gap-1">
                            <CheckCircle className="h-3.5 w-3.5" />
                            <span>Action Tasks</span>
                          </span>
                          <ul className="text-xs text-slate-300 flex flex-col gap-1.5">
                            {week.tasks.map((task: string, tIdx: number) => (
                              <li key={tIdx} className="list-disc ml-4">{task}</li>
                            ))}
                          </ul>
                        </div>

                        {/* Weekly Resources */}
                        <div className="flex flex-col gap-2">
                          <span className="text-[10px] uppercase font-bold text-emerald-400 flex items-center gap-1">
                            <BookOpen className="h-3.5 w-3.5" />
                            <span>Learning Resources</span>
                          </span>
                          <ul className="text-xs text-slate-300 flex flex-col gap-1.5">
                            {week.resources.map((res: string, rIdx: number) => (
                              <li key={rIdx} className="list-disc ml-4">{res}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Micro Project idea recommendation */}
                      {week.projectIdea && (
                        <div className="bg-white/5 rounded-xl border border-white/5 p-3.5 flex flex-col gap-1.5">
                          <span className="text-[10px] font-bold tracking-wider text-amber-400 flex items-center gap-1">
                            <Layers className="h-3.5 w-3.5" />
                            <span>SUGGESTED CAPSTONE PROJECT</span>
                          </span>
                          <p className="text-xs text-slate-300 leading-relaxed font-medium">{week.projectIdea}</p>
                        </div>
                      )}
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <Card hoverable={false} className="flex flex-col items-center justify-center p-12 border-dashed border-slate-800 text-slate-500">
              <Map className="h-12 w-12 text-slate-700 mb-3" />
              <p className="text-sm text-center">Generate a learning roadmap path above to map out week-by-week goals.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
export default LearningRoadmap;
