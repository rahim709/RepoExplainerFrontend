"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check auth status on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full p-4 border-b border-[#30363d] bg-[#161b22]/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <Image 
            src="/Octo-Icon.svg" 
            alt="RepoExplainer Logo" 
            width={32} 
            height={32} 
          />
          <span className="text-xl font-bold tracking-tight text-white">
            RepoExplainer
          </span>
        </Link>
        
        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            /* --- LOGGED IN STATE --- */
            <Link 
              href="/chat" 
              className="px-4 py-1.5 rounded-md border border-[#238636] bg-[#238636] text-sm font-bold text-white hover:bg-[#2ea043] transition-all shadow-sm"
            >
              Go to Dashboard
            </Link>
          ) : (
            /* --- LOGGED OUT STATE --- */
            <>
              <Link 
                href="/auth/login" 
                className="px-4 py-1.5 text-sm font-medium text-[#c9d1d9] hover:text-white transition-colors"
              >
                Sign in
              </Link>

              <Link 
                href="/auth/register" 
                className="px-4 py-1.5 rounded-md border border-[#30363d] bg-[#21262d] text-sm font-medium text-white hover:bg-[#30363d] hover:border-[#8b949e] transition-all"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};