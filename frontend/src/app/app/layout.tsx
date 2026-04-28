"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppHeader } from "@/features/app/components/AppHeader";
import { Sidebar } from "@/features/app/components/Sidebar";
import { useAuthSession } from "@/features/app/hooks/useAuthSession";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const session = useAuthSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (session === null) {
      const timeout = setTimeout(() => {
        if (!localStorage.getItem("fluencyai.auth")) {
          router.replace("/login");
        }
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [router, session]);

  if (!mounted || (!session && !localStorage.getItem("fluencyai.auth"))) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background text-on-surface transition-colors duration-300">
      {/* Overlay for mobile menu */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm transition-all"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <Sidebar 
        user={session?.user} 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />
      
      <AppHeader 
        user={session?.user} 
        onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
      />
      
      <div className="lg:pl-64 pt-16 min-h-screen">
        {children}
      </div>
    </div>
  );
}
