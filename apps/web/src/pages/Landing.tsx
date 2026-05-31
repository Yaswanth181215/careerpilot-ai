import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { Button } from '../components/ui/Button.js';
import { Input } from '../components/ui/Input.js';
import { Compass, CheckCircle2, Star, Sparkles, LogIn, Code, ShieldCheck } from 'lucide-react';

export const Landing: React.FC = () => {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(name, email, password);
        setIsLogin(true);
        setName('');
        setErrorMsg('Account created! You can now log in.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Auth execution failed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      {/* Decorative Blur Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-500/10 rounded-full blur-[120px]" />

      {/* Navigation Headers */}
      <header className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between sticky top-0 bg-slate-950/60 backdrop-blur-md z-30 border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-2xl bg-gradient-to-r from-indigo-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">
            CareerPilot AI
          </span>
        </div>
        <Button variant="secondary" onClick={() => { setIsLogin(true); setShowModal(true); }} className="flex items-center gap-2">
          <LogIn className="h-4 w-4" />
          <span>Launch Console</span>
        </Button>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-16 text-center flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-semibold mb-6 animate-pulse">
          <Sparkles className="h-3 w-3" />
          <span>Venture-Backed Career Accelerator</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight max-w-4xl leading-tight mb-6">
          Architect Your Tech Career with{' '}
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">
            Precision AI
          </span>
        </h1>
        <p className="text-slate-400 text-lg md:text-xl max-w-2xl mb-10 leading-relaxed">
          Unlock high-paying roles at top product companies. AI-driven mock interviews, secure code compilation pipelines, resume parser scanners, and mentor channels.
        </p>
        <div className="flex items-center gap-4">
          <Button variant="primary" onClick={() => { setIsLogin(false); setShowModal(true); }} className="px-8 py-4 text-base">
            Get Started Free
          </Button>
          <Button variant="secondary" onClick={() => { setIsLogin(true); setShowModal(true); }} className="px-8 py-4 text-base">
            Developer Log in
          </Button>
        </div>
      </section>

      {/* Feature Grid Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 border-t border-white/5">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Complete AI Ecosystem</h2>
          <p className="text-slate-400">Everything you need to compete and unlock placement offers.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-card rounded-2xl p-8 border border-white/5 flex flex-col gap-4">
            <div className="p-3 bg-indigo-600/10 text-indigo-400 rounded-xl w-fit">
              <Compass className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold">10-Agent AI Engine</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Decoupled Gemini agents evaluate technical concepts, STAR-behavioral patterns, and speech delivery.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-8 border border-white/5 flex flex-col gap-4">
            <div className="p-3 bg-emerald-600/10 text-emerald-400 rounded-xl w-fit">
              <Code className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold">Three-Tier Code Sandbox</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Compile Python, Java, C++, and JS code safely inside isolated containers or failover to Piston environments.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-8 border border-white/5 flex flex-col gap-4">
            <div className="p-3 bg-amber-600/10 text-amber-400 rounded-xl w-fit">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold">Enterprise Security</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Helmet configurations, CSRF blocks, rate-limiting guards, and token rotation workflows keep data safe.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-slate-900/50 py-16 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <h4 className="text-4xl md:text-5xl font-black text-indigo-400 mb-2">94%</h4>
            <p className="text-slate-400 text-sm font-semibold uppercase tracking-wider">Placement Success</p>
          </div>
          <div>
            <h4 className="text-4xl md:text-5xl font-black text-emerald-400 mb-2">12k+</h4>
            <p className="text-slate-400 text-sm font-semibold uppercase tracking-wider">Interviews Graded</p>
          </div>
          <div>
            <h4 className="text-4xl md:text-5xl font-black text-purple-400 mb-2">85+</h4>
            <p className="text-slate-400 text-sm font-semibold uppercase tracking-wider">ATS Score Average</p>
          </div>
          <div>
            <h4 className="text-4xl md:text-5xl font-black text-amber-400 mb-2">&lt; 3s</h4>
            <p className="text-slate-400 text-sm font-semibold uppercase tracking-wider">Code Execution Time</p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4 font-sans">Endorsed by Top Engineers</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="glass-card p-8 border border-white/5 rounded-2xl flex flex-col justify-between">
            <p className="text-slate-300 italic mb-6 leading-relaxed">
              "The voice analysis and ATS parser matched exactly what my Amazon interviewer assessed. The structured roadmap helped me prepare for the system design rounds."
            </p>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-indigo-600/30 flex items-center justify-center font-bold text-indigo-400">
                SD
              </div>
              <div>
                <h5 className="font-bold text-sm">Siddharth Das</h5>
                <p className="text-xs text-slate-500">Software Engineer, Microsoft</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-8 border border-white/5 rounded-2xl flex flex-col justify-between">
            <p className="text-slate-300 italic mb-6 leading-relaxed">
              "The coding sandbox is extremely fast. Failover paths ensure no interrupts when submitting files. Best prep ecosystem out there."
            </p>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-emerald-600/30 flex items-center justify-center font-bold text-emerald-400">
                RK
              </div>
              <div>
                <h5 className="font-bold text-sm">Rohan Kulkarni</h5>
                <p className="text-xs text-slate-500">Programmer, Infosys SP</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 bg-slate-950">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between text-slate-500 text-sm gap-6">
          <p>© 2026 CareerPilot AI. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white">Privacy Policy</a>
            <a href="#" className="hover:text-white">Terms of Use</a>
          </div>
        </div>
      </footer>

      {/* Auth Modal Popup */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm px-4">
          <div className="glass-card max-w-md w-full p-8 border border-white/10 rounded-3xl relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              ✕
            </button>
            <h2 className="text-2xl font-bold mb-6 text-center">
              {isLogin ? 'Log in to Console' : 'Create Free Account'}
            </h2>

            {errorMsg && (
              <div className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 p-3 rounded-xl text-sm mb-4">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleAuth} className="flex flex-col gap-4">
              {!isLogin && (
                <Input
                  label="Name"
                  type="text"
                  placeholder="Jane Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              )}
              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Button type="submit" variant="primary" className="py-3 mt-2">
                {isLogin ? 'Sign In' : 'Sign Up'}
              </Button>
            </form>

            <p className="text-xs text-slate-500 text-center mt-6">
              {isLogin ? "Don't have an account? " : 'Already registered? '}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-indigo-400 font-semibold hover:underline"
              >
                {isLogin ? 'Sign up' : 'Log in'}
              </button>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
export default Landing;
