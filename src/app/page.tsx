"use client";

import { Navbar } from "@/app/components/Navbar"; 
import { useState, useEffect } from "react"; 
import { useRouter } from "next/navigation";
import { ArrowRight, GitBranch, MessageSquareCode, Zap, Terminal, Code2, Database, ShieldCheck, Loader2 } from "lucide-react";
import api from "@/lib/axios"; 

export default function Home() {
  const [repoUrl, setRepoUrl] = useState("");
  // Start as 'true' to show a loader while we check the backend
  const [checkingAuth, setCheckingAuth] = useState(true); 
  const router = useRouter();

  // --- AUTH CHECK LOGIC ---
  useEffect(() => {
    const verifyUser = async () => {
      try {
        // 1. Ask Backend if the user is logged in
        await api.get("/api/user/check-auth");
        
        // 2. If Success (200 OK) -> User is Logged In
        // Redirect them to Chat immediately
        router.replace("/chat");
      } catch (error) {
        // 3. If Error (401/403/Network Error) -> User is Guest
        // Stop loading and reveal the Landing Page
        setCheckingAuth(false);
      } finally {
         // Ensure loader stops even if something unexpected happens
         setCheckingAuth(false);
      }
    };

    verifyUser();
  }, [router]);

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    // Since we redirect logged-in users, anyone seeing this is a guest.
    router.push("/auth/register");
  };

  // --- LOADING STATE ---
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center flex-col gap-4">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        <p className="text-gray-500 text-sm">Verifying session...</p>
      </div>
    );
  }

  // --- LANDING PAGE CONTENT (Only for Guests) ---
  return (
    <div className="min-h-screen bg-[#0d1117] font-[family-name:var(--font-geist-sans)] text-white overflow-x-hidden selection:bg-blue-500/30">
      <Navbar />

      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-20 px-4 md:pt-48 md:pb-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none">
            <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] animate-pulse-slow" />
            <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-green-500/10 rounded-full blur-[120px] animate-pulse-slow delay-1000" />
        </div>
        
        <div className="max-w-4xl mx-auto text-center space-y-8 relative z-10">
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium mb-4">
               <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                v2.0 is now live
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight">
              Chat with your <br className="hidden md:block" />
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-green-400 bg-clip-text text-transparent animate-gradient-x">
                Codebase Instantly.
              </span>
            </h1>
            <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              Stop grepping through thousands of files. Paste a GitHub link and get an AI Architect that understands your entire project context.
            </p>
          </div>

          {/* INPUT FORM */}
          <div className="w-full max-w-xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
            <div className="bg-[#161b22]/80 backdrop-blur-md border border-[#30363d] p-2 md:p-3 rounded-2xl shadow-2xl flex flex-col md:flex-row gap-2 hover:border-blue-500/30 transition-colors">
              <form onSubmit={handleAnalyze} className="contents">
                <div className="flex-1 relative group">
                   <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-blue-400 transition-colors">
                     <Terminal size={18} />
                   </div>
                   <input 
                    type="text" 
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    placeholder="github.com/username/repo"
                    className="w-full bg-[#0d1117]/50 border border-[#30363d] group-focus-within:border-blue-500/50 rounded-xl pl-12 pr-4 py-4 text-white outline-none transition-all placeholder:text-gray-600 font-mono text-sm"
                  />
                </div>
                
                {/* ANALYZE BUTTON */}
                <button
                  type="submit"
                  disabled={!repoUrl.trim()}
                  className={`
                    group relative flex items-center justify-center gap-2 px-8 py-4 md:py-0 rounded-xl font-bold text-sm md:text-base whitespace-nowrap overflow-hidden
                    transition-all duration-300 transform active:scale-95
                    ${repoUrl.trim() 
                      ? "text-white cursor-pointer shadow-[0_0_20px_rgba(35,134,54,0.4)] hover:shadow-[0_0_30px_rgba(35,134,54,0.6)]" 
                      : "bg-[#238636]/10 cursor-not-allowed text-gray-500 border border-[#30363d]" 
                    }
                  `}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Analyze <ArrowRight size={16} className={`transition-transform duration-300 ${repoUrl.trim() ? "group-hover:translate-x-1" : ""}`} />
                  </span>
                </button>
              </form>
            </div>
            
            <div className="flex items-center justify-center gap-4 mt-6 text-xs text-gray-500">
              <span>Try:</span>
              <button onClick={() => setRepoUrl("https://github.com/facebook/react")} className="px-3 py-1 rounded-full border border-[#30363d] hover:border-blue-500/50 hover:text-blue-400 transition-colors">
                 facebook/react
              </button>
              <button onClick={() => setRepoUrl("https://github.com/vercel/next.js")} className="px-3 py-1 rounded-full border border-[#30363d] hover:border-blue-500/50 hover:text-blue-400 transition-colors">
                 vercel/next.js
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* --- TECH STACK STRIP --- */}
      <section className="border-y border-[#30363d] bg-[#161b22]/50 backdrop-blur-sm overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 py-8">
            <p className="text-center text-xs text-gray-500 uppercase tracking-[0.2em] mb-6">Powered by modern tech stack</p>
            <div className="flex justify-center items-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
               <TechLogo name="Next.js" icon={<Code2 />} />
               <TechLogo name="Gemini AI" icon={<Zap />} />
               <TechLogo name="MongoDB" icon={<Database />} />
               <TechLogo name="TypeScript" icon={<Terminal />} />
               <TechLogo name="Secure" icon={<ShieldCheck />} />
            </div>
        </div>
      </section>

      {/* --- FEATURES GRID --- */}
      <section className="py-24 px-4 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Built for engineers, by engineers</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">We parse the Abstract Syntax Tree (AST) to ensure our AI understands the actual logic, not just the text.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              delay="0"
              icon={<GitBranch className="text-blue-400 w-6 h-6" />}
              title="Interactive Tree View"
              desc="Visualize file relationships instantly. Click any file to understand its purpose and dependencies without opening it."
            />
            <FeatureCard 
              delay="100"
              icon={<MessageSquareCode className="text-green-400 w-6 h-6" />}
              title="Context-Aware Chat"
              desc="Ask questions like 'Where is the auth logic?' or 'How do I add a new API route?' and get code-backed answers."
            />
            <FeatureCard 
              delay="200"
              icon={<Zap className="text-purple-400 w-6 h-6" />}
              title="Instant Onboarding"
              desc="Reduce ramp-up time for new engineers from weeks to days. Generate docs and guides on the fly."
            />
          </div>
        </div>
      </section>

      {/* --- HOW IT WORKS --- */}
      <section className="py-24 px-4 bg-gradient-to-b from-[#161b22] to-[#0d1117] border-t border-[#30363d]">
        <div className="max-w-5xl mx-auto">
           <div className="text-center mb-16">
             <h2 className="text-3xl font-bold">From URL to Insight in Seconds</h2>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative">
             <div className="hidden md:block absolute top-8 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-blue-500/20 via-green-500/20 to-purple-500/20 -z-1" />
             <Step num="1" title="Paste URL" desc="Simply drop any public GitHub repository link into the search bar." />
             <Step num="2" title="AI Analysis" desc="Our engine maps the file structure and indexes code logic." />
             <Step num="3" title="Start Chatting" desc="Ask complex questions and get answers grounded in truth." />
           </div>
        </div>
      </section>

      {/* --- CTA FOOTER --- */}
      <footer className="py-24 border-t border-[#30363d] text-center px-4 bg-[url('/grid.svg')] bg-center">
        <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-200 to-white bg-clip-text text-transparent">
              Ready to decode your repo?
            </h2>
            <p className="text-gray-400 text-lg">
              Join thousands of developers who are shipping faster with RepoExplainer.
            </p>
            <div className="flex justify-center pt-4">
                <button 
                  onClick={() => router.push("/auth/register")}
                  className="group relative px-8 py-4 bg-white text-black font-bold rounded-full hover:bg-gray-100 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] active:scale-95"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Get Started Now <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform"/>
                  </span>
                </button>
            </div>
        </div>
        <div className="mt-20 pt-8 border-t border-[#30363d]/50 text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} RepoExplainer. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

// --- SUBCOMPONENTS ---

function FeatureCard({ icon, title, desc, delay }: { icon: React.ReactNode, title: string, desc: string, delay: string }) {
  return (
    <div 
      className="p-8 border border-[#30363d] rounded-2xl bg-[#0d1117] hover:border-blue-500/50 hover:bg-[#161b22] hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group animate-in fade-in slide-in-from-bottom-8 fill-mode-backwards"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="mb-6 p-4 bg-[#161b22] w-fit rounded-xl border border-[#30363d] group-hover:border-blue-500/30 group-hover:scale-110 transition-transform duration-300 shadow-inner">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3 text-gray-100 group-hover:text-blue-400 transition-colors">{title}</h3>
      <p className="text-gray-400 text-base leading-relaxed">{desc}</p>
    </div>
  );
}

function Step({ num, title, desc }: { num: string, title: string, desc: string }) {
  return (
    <div className="text-center relative group">
      <div className="w-16 h-16 bg-[#0d1117] border border-[#30363d] rounded-full flex items-center justify-center mx-auto mb-6 text-xl font-bold text-gray-400 group-hover:text-white group-hover:border-blue-500 group-hover:scale-110 transition-all duration-300 shadow-xl z-10 relative">
        {num}
      </div>
      <h3 className="text-xl font-bold mb-2 group-hover:text-blue-400 transition-colors">{title}</h3>
      <p className="text-gray-400 text-sm leading-relaxed px-4">{desc}</p>
    </div>
  );
}

function TechLogo({ name, icon }: { name: string, icon: React.ReactNode }) {
    return (
        <div className="flex flex-col items-center gap-2 group cursor-default">
            <div className="p-3 rounded-lg bg-[#161b22] border border-[#30363d] group-hover:border-gray-500 transition-colors">
                {icon}
            </div>
            <span className="text-xs font-semibold">{name}</span>
        </div>
    )
}