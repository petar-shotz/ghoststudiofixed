"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Menu, X, Mail } from "lucide-react";

export default function SiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="site-header container relative">
      <Link href="/" className="brand" aria-label="Ghost Studio home">
        <Image src="/favicon.png" alt="" width={36} height={36} referrerPolicy="no-referrer" className="brand-ghost" />
        <span>
          ghost<span className="brand-light">studio</span>
        </span>
      </Link>

      <nav className="desktop-nav" aria-label="Main navigation">
        <a href="#possibilities">What we build</a>
        <a href="#demos">Concept demos</a>
        <a href="#how-it-works">How it works</a>
        <a href="#questions">FAQ</a>
        <a href="#contact">Contact</a>
      </nav>

      <div className="hidden md:flex items-center gap-3">
        <a
          href="mailto:p8339378@gmail.com"
          className="text-xs font-semibold text-neutral-600 hover:text-neutral-900 transition-colors flex items-center gap-1"
          title="Direct email contact"
        >
          <Mail size={13} /> p8339378@gmail.com
        </a>
        <Link href="/start" className="button button-small button-dark">
          Start a project <ArrowUpRight size={18} />
        </Link>
      </div>

      {/* Mobile Menu Button */}
      <button
        type="button"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="md:hidden p-2 rounded-lg text-neutral-700 hover:bg-neutral-100"
        aria-label="Toggle navigation menu"
        aria-expanded={mobileMenuOpen}
        aria-controls="mobile-menu"
      >
        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div id="mobile-menu" className="absolute top-full left-0 right-0 bg-[#fbfbf8] border-b border-[#181816]/10 p-5 shadow-lg flex flex-col gap-4 md:hidden z-50 animate-in slide-in-from-top-2">
          <nav className="flex flex-col gap-3 text-sm font-medium text-neutral-800">
            <a href="#possibilities" onClick={() => setMobileMenuOpen(false)}>
              What we build
            </a>
            <a href="#demos" onClick={() => setMobileMenuOpen(false)}>
              Concept demos
            </a>
            <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)}>
              How it works
            </a>
            <a href="#questions" onClick={() => setMobileMenuOpen(false)}>
              FAQ
            </a>
            <a href="#contact" onClick={() => setMobileMenuOpen(false)}>
              Contact
            </a>
          </nav>
          <div className="pt-3 border-t border-neutral-200 flex flex-col gap-2.5">
            <a
              href="mailto:p8339378@gmail.com"
              className="text-xs font-semibold text-neutral-700 flex items-center gap-1.5 py-1"
            >
              <Mail size={14} /> p8339378@gmail.com
            </a>
            <Link
              href="/start"
              onClick={() => setMobileMenuOpen(false)}
              className="button button-dark text-center justify-center text-xs py-2.5"
            >
              Start a project <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
