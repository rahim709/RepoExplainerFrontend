import { ApiKeyCheck } from "@/components/ApiKeyCheck";
import { Navbar } from "./components/Navbar";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0d1117] font-[family-name:var(--font-geist-sans)] text-white">
      {/* Navbar is rendered here */}
      <Navbar />

      {/* Adding pt-16 (padding-top) to prevent the hero from being hidden under the sticky Navbar */}
      <main className="flex flex-col items-center justify-center pt-32 px-4 pb-20">
        <div className="max-w-2xl w-full text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
              Master Any Codebase in Seconds
            </h1>
            <p className="text-gray-400 text-xl max-w-lg mx-auto">
              Paste a GitHub link to visualize architecture and chat with your repository.
            </p>
          </div>

          <div className="w-full bg-[#161b22] border border-[#30363d] p-8 rounded-xl shadow-2xl">
            <div className="flex flex-col gap-4">
              <input 
                type="text" 
                placeholder="https://github.com/username/repo"
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-600 font-mono text-sm"
              />
              
              <ApiKeyCheck>
                <div className="flex justify-center">
                  <a
                    href="/chat"
                    className="flex items-center justify-center gap-2 w-full px-6 py-4 rounded-md font-bold text-lg bg-[#238636] hover:bg-[#2ea043] text-white transition-all border border-[#2ea043]"
                  >
                    Analyze Repository →
                  </a>
                </div>
              </ApiKeyCheck>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 text-left">
            <div className="p-4 border border-[#30363d] rounded-lg bg-[#0d1117] hover:border-blue-400 transition-colors">
              <div className="text-blue-400 mb-2 font-semibold font-mono tracking-tight">🌳 Tree View</div>
              <p className="text-sm text-gray-400">Instantly map out project structure and file relations.</p>
            </div>
            <div className="p-4 border border-[#30363d] rounded-lg bg-[#0d1117] hover:border-green-400 transition-colors">
              <div className="text-green-400 mb-2 font-semibold font-mono tracking-tight">💬 AI Architect</div>
              <p className="text-sm text-gray-400">Ask deep questions about logic, data flow, and state.</p>
            </div>
            <div className="p-4 border border-[#30363d] rounded-lg bg-[#0d1117] hover:border-purple-400 transition-colors">
              <div className="text-purple-400 mb-2 font-semibold font-mono tracking-tight">🚀 Fast Onboarding</div>
              <p className="text-sm text-gray-400">Go from "cloned" to "contributing" in minutes.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}