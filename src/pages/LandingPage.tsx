import { ArrowRight, Brain, Calendar, CheckCircle2, Clock, MessageSquare, Shield, Sparkles, Stethoscope, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Navigation */}
      <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded-sm rotate-45"></div>
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900">ClinicSaaS AI</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-indigo-600 transition-colors">Features</a>
            <a href="#pricing" className="hover:text-indigo-600 transition-colors">Pricing</a>
            <a href="#about" className="hover:text-indigo-600 transition-colors">Testimonials</a>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/dashboard')}
              className="text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors"
            >
              Sign In
            </button>
            <button 
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-lg transition-colors shadow-sm"
            >
              Start Free Trial
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 pt-24 pb-32 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[500px] opacity-30 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-400 blur-[100px] rounded-full mix-blend-multiply"></div>
        </div>

        <div className="relative max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            The First AI Operating System for Clinics
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.1]">
            Stop losing revenue to <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
              empty chairs.
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed">
            Predict no-shows, automate WhatsApp follow-ups, and generate clinical summaries instantly. Save 10 hours a week and boost monthly revenue by up to 20%.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button 
              onClick={() => navigate('/dashboard')}
              className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white text-lg font-bold rounded-xl transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
            >
              Start 7-Day Free Trial <ArrowRight className="w-5 h-5" />
            </button>
            <p className="text-xs font-medium text-slate-500 sm:hidden">No credit card required. Cancel anytime.</p>
          </div>
          <p className="hidden sm:block text-sm font-medium text-slate-500 pt-2">No credit card required • Cancel anytime • Setup in 2 minutes</p>
        </div>

        {/* Dashboard Preview Image Mockup */}
        <div className="max-w-5xl mx-auto mt-20 relative">
          <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-transparent to-transparent z-10"></div>
          <div className="rounded-2xl border border-slate-200/60 bg-white/50 backdrop-blur-sm p-2 shadow-2xl relative">
            <div className="rounded-xl overflow-hidden border border-slate-100 bg-white">
              {/* Very simplified abstraction of the dashboard to look like an app */}
              <div className="h-12 border-b border-slate-100 flex items-center px-4 bg-slate-50 gap-4">
                <div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-red-400"></div><div className="w-3 h-3 rounded-full bg-amber-400"></div><div className="w-3 h-3 rounded-full bg-emerald-400"></div></div>
                <div className="h-6 w-64 bg-white rounded border border-slate-200 mx-auto"></div>
              </div>
              <div className="h-[400px] bg-white flex">
                <div className="w-48 border-r border-slate-100 hidden sm:block p-4 space-y-3">
                  <div className="h-4 w-full bg-slate-100 rounded"></div>
                  <div className="h-4 w-3/4 bg-slate-100 rounded"></div>
                  <div className="h-4 w-5/6 bg-slate-100 rounded"></div>
                </div>
                <div className="flex-1 p-6 space-y-6">
                  <div className="flex gap-4">
                    <div className="h-24 flex-1 bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex flex-col justify-between">
                      <div className="h-3 w-20 bg-indigo-200 rounded"></div>
                      <div className="h-8 w-32 bg-indigo-600 rounded"></div>
                    </div>
                    <div className="h-24 flex-1 bg-slate-50 border border-slate-100 rounded-xl p-4 flex flex-col justify-between">
                      <div className="h-3 w-24 bg-slate-200 rounded"></div>
                      <div className="h-8 w-24 bg-slate-800 rounded"></div>
                    </div>
                  </div>
                  <div className="h-48 w-full bg-slate-50 border border-slate-100 rounded-xl"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-4">
              Everything you need to scale, <br/> none of the complexity.
            </h2>
            <p className="text-slate-600 text-lg font-medium">Replaces 4 different tools with one intelligent, unified platform.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-100 transition-colors">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-6">
                <Brain className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">AI No-Show Prediction</h3>
              <p className="text-slate-600 font-medium leading-relaxed">
                Our model analyzes historical patient data to flag high-risk appointments 48 hours in advance, allowing you to proactively reschedule.
              </p>
            </div>
            
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:border-emerald-100 transition-colors">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-6">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Auto WhatsApp Drafts</h3>
              <p className="text-slate-600 font-medium leading-relaxed">
                Stop typing repetitive messages. The AI instantly drafts personalized reminders and reactivation campaigns for inactive patients.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:border-amber-100 transition-colors">
              <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mb-6">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">1-Click Summaries</h3>
              <p className="text-slate-600 font-medium leading-relaxed">
                Generate clinical history summaries in seconds. Save up to 5 minutes per patient reading through old, dusty medical files.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-slate-600 text-lg font-medium">Invest in technology that pays for itself with the first saved appointment.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto items-center">
            
            {/* Starter Plan */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
              <h3 className="text-xl font-bold text-slate-900 mb-2">Starter</h3>
              <p className="text-slate-500 font-medium text-sm mb-6">For single practitioners.</p>
              <div className="mb-6">
                <span className="text-4xl font-extrabold text-slate-900">$49</span>
                <span className="text-slate-500 font-medium">/month</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-slate-600 font-medium"><CheckCircle2 className="w-5 h-5 text-indigo-500" /> Up to 500 patients</li>
                <li className="flex items-center gap-3 text-slate-600 font-medium"><CheckCircle2 className="w-5 h-5 text-indigo-500" /> Basic Scheduling</li>
                <li className="flex items-center gap-3 text-slate-600 font-medium"><CheckCircle2 className="w-5 h-5 text-slate-300" /> No AI Features</li>
              </ul>
              <button className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold rounded-xl transition-colors">
                Start Free Trial
              </button>
            </div>

            {/* Pro Plan (Highlighted) */}
            <div className="bg-indigo-900 rounded-3xl p-8 border border-indigo-700 shadow-2xl relative transform md:-translate-y-4">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-indigo-400 to-purple-400 text-white text-xs font-bold uppercase tracking-widest py-1.5 px-4 rounded-full">
                Most Popular
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Pro</h3>
              <p className="text-indigo-200 font-medium text-sm mb-6">For growing clinics wanting automation.</p>
              <div className="mb-6">
                <span className="text-4xl font-extrabold text-white">$149</span>
                <span className="text-indigo-200 font-medium">/month</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-indigo-50 font-medium"><CheckCircle2 className="w-5 h-5 text-indigo-400" /> Unlimited patients</li>
                <li className="flex items-center gap-3 text-indigo-50 font-medium"><CheckCircle2 className="w-5 h-5 text-indigo-400" /> AI No-Show Prediction</li>
                <li className="flex items-center gap-3 text-indigo-50 font-medium"><CheckCircle2 className="w-5 h-5 text-indigo-400" /> AI WhatsApp Drafts</li>
                <li className="flex items-center gap-3 text-indigo-50 font-medium"><CheckCircle2 className="w-5 h-5 text-indigo-400" /> Patient Summaries</li>
              </ul>
              <button 
                onClick={() => navigate('/dashboard')}
                className="w-full py-3 bg-white hover:bg-indigo-50 text-indigo-900 font-bold rounded-xl transition-colors shadow-lg"
              >
                Start 7-Day Free Trial
              </button>
            </div>

            {/* Premium Plan */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
              <h3 className="text-xl font-bold text-slate-900 mb-2">Premium</h3>
              <p className="text-slate-500 font-medium text-sm mb-6">For multi-location enterprises.</p>
              <div className="mb-6">
                <span className="text-4xl font-extrabold text-slate-900">$299</span>
                <span className="text-slate-500 font-medium">/month</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-slate-600 font-medium"><CheckCircle2 className="w-5 h-5 text-indigo-500" /> Everything in Pro</li>
                <li className="flex items-center gap-3 text-slate-600 font-medium"><CheckCircle2 className="w-5 h-5 text-indigo-500" /> Multi-location support</li>
                <li className="flex items-center gap-3 text-slate-600 font-medium"><CheckCircle2 className="w-5 h-5 text-indigo-500" /> API Access</li>
              </ul>
              <button className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold rounded-xl transition-colors">
                Contact Sales
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <footer className="bg-white border-t border-slate-200 py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6">Ready to modernize your clinic?</h2>
          <button 
            onClick={() => navigate('/dashboard')}
            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-base font-bold rounded-xl transition-all shadow-md inline-flex items-center gap-2"
          >
            Start your free trial <ArrowRight className="w-4 h-4" />
          </button>
          <p className="text-sm font-medium text-slate-500 mt-6">© 2026 ClinicSaaS AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
