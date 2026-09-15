"use client";

import { useState } from "react";
import { Mail, Copy, Check, ArrowUpRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ContactSection() {
  const [copied, setCopied] = useState(false);
  const email = "p8339378@gmail.com";

  function copyEmail() {
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <section id="contact" className="section container">
      <div className="bg-[#effa82]/25 border border-[#181816]/10 rounded-3xl p-8 sm:p-12">
        <div className="max-w-3xl">
          <div className="eyebrow">
            <Sparkles size={16} /> DIRECT STUDIO CONTACT
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#181816] mt-2 mb-4">
            Have questions before planning your brief?
          </h2>
          <p className="text-base sm:text-lg text-neutral-700 leading-relaxed mb-6">
            We are here to help. Whether you have a quick question about capabilities, want feedback on an idea,
            or prefer to email requirements directly, reach out anytime.
          </p>

          {/* Contact Box */}
          <div className="bg-white border border-[#181816]/10 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#d8c9f6] flex items-center justify-center text-[#181816] shrink-0">
                <Mail size={22} />
              </div>
              <div>
                <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block">
                  Studio Email Address
                </span>
                <a
                  href={`mailto:${email}`}
                  className="text-lg sm:text-xl font-bold text-[#181816] hover:underline"
                >
                  {email}
                </a>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={copyEmail}
                className="text-xs gap-1.5 h-10 px-3 bg-white"
              >
                {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                {copied ? "Copied!" : "Copy address"}
              </Button>
              <a
                href={`mailto:${email}`}
                className="button button-dark text-xs h-10 px-4 inline-flex items-center gap-1.5 flex-1 sm:flex-none justify-center"
              >
                Open email <ArrowUpRight size={14} />
              </a>
            </div>
          </div>

          {/* Transparent Process Guarantee */}
          <div className="grid sm:grid-cols-3 gap-4 pt-4 border-t border-[#181816]/10 text-xs text-neutral-700">
            <div className="space-y-1">
              <strong className="font-semibold text-neutral-900 block">1. Share your brief</strong>
              <span>Use our 5-step planner or email your outline to {email}.</span>
            </div>
            <div className="space-y-1">
              <strong className="font-semibold text-neutral-900 block">2. Agree on scope & price</strong>
              <span>We discuss your needs and provide a clear quote and timeline before any work begins.</span>
            </div>
            <div className="space-y-1">
              <strong className="font-semibold text-neutral-900 block">3. Launch without surprises</strong>
              <span>No surprise charges, no confusing tech jargon, and honest collaboration.</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
