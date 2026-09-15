"use client";

import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";

interface ConceptDemo {
  id: string;
  title: string;
  category: string;
  tag: string;
  description: string;
  highlights: string[];
  styleName: string;
  paletteName: string;
  accentColor: string;
  typeParam: string;
  styleParam: string;
  paletteParam: string;
}

const conceptDemos: ConceptDemo[] = [
  {
    id: "flour-and-stone",
    title: "The Flour & Stone Bakery",
    category: "Artisan Bakery & Cafe Storefront",
    tag: "CONCEPT DEMO · RETAIL & FOOD",
    description:
      "A warm, inviting digital storefront featuring fresh daily bake schedules, dietary badge filters, opening hours announcements, and custom celebration cake enquiry forms.",
    highlights: ["Daily bakes board", "Dietary allergen tags", "Custom cake enquiry form"],
    styleName: "Bold & playful",
    paletteName: "Peach please",
    accentColor: "#f7b995",
    typeParam: "store",
    styleParam: "playful",
    paletteParam: "peach",
  },
  {
    id: "atelier-form",
    title: "Atelier Form & Space",
    category: "Architecture & Interior Studio",
    tag: "CONCEPT DEMO · PORTFOLIO",
    description:
      "A disciplined, minimalist editorial showcase prioritizing large architectural photography, project material specifications, blueprint sketches, and client consultation bookings.",
    highlights: ["Full-bleed project galleries", "Materials archive", "Consultation booking"],
    styleName: "Clean & minimal",
    paletteName: "Keep it neutral",
    accentColor: "#e4e4df",
    typeParam: "business",
    styleParam: "clean",
    paletteParam: "neutral",
  },
  {
    id: "pages-and-press",
    title: "Pages & Press Books",
    category: "Independent Bookseller & Club",
    tag: "CONCEPT DEMO · BOUTIQUE STORE",
    description:
      "An elegant, character-rich boutique with staff monthly book picks, author interview archives, monthly subscriber club perks, and responsive cart checkout flows.",
    highlights: ["Curated staff picks", "Author spotlight archive", "Subscriber book club"],
    styleName: "Elegant & editorial",
    paletteName: "Lilac club",
    accentColor: "#d8c9f6",
    typeParam: "store",
    styleParam: "editorial",
    paletteParam: "lilac",
  },
  {
    id: "pulseflow-tools",
    title: "Pulseflow Studio Tools",
    category: "Creative Workflow Platform",
    tag: "CONCEPT DEMO · WEB APPLICATION",
    description:
      "A sleek dark-mode product showcase displaying feature grid breakdowns, interactive workflow tours, live telemetry mockups, and early-access onboarding.",
    highlights: ["Feature comparison bento", "Interactive workflow demo", "Early access onboarding"],
    styleName: "Modern & dark",
    paletteName: "Electric blue",
    accentColor: "#a4c2ff",
    typeParam: "custom",
    styleParam: "dark",
    paletteParam: "blue",
  },
];

export default function PortfolioSection() {
  return (
    <section id="demos" className="section container">
      <div className="section-heading">
        <div>
          <div className="eyebrow">
            <Sparkles size={16} /> CONCEPT DEMOS & DESIGN DIRECTIONS
          </div>
          <h2>Explore what we can build together.</h2>
        </div>
        <p>
          These concept demonstrations illustrate our design styles, structure, and responsive craft.
          No invented clients or fake awards — just honest, thoughtful web design.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {conceptDemos.map((demo) => (
          <div
            key={demo.id}
            className="bg-white border border-[#181816]/10 rounded-2xl p-6 sm:p-7 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div>
              {/* Card Header & Tag */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[11px] font-bold tracking-wider uppercase text-neutral-500 bg-neutral-100 px-2.5 py-1 rounded-full">
                  {demo.tag}
                </span>
                <span
                  className="w-4 h-4 rounded-full border border-black/10 shadow-xs"
                  style={{ backgroundColor: demo.accentColor }}
                  title={`Palette: ${demo.paletteName}`}
                />
              </div>

              <h3 className="text-xl font-bold text-[#181816] tracking-tight group-hover:text-neutral-700 transition-colors">
                {demo.title}
              </h3>
              <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mt-0.5 mb-3">
                {demo.category}
              </p>

              <p className="text-sm text-neutral-600 leading-relaxed mb-5">
                {demo.description}
              </p>

              {/* Highlights pills */}
              <div className="space-y-1.5 mb-6">
                <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block">
                  Demonstration Features:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {demo.highlights.map((h) => (
                    <span
                      key={h}
                      className="text-xs bg-[#fbfbf8] border border-[#181816]/10 text-[#181816] px-2.5 py-1 rounded-md font-medium"
                    >
                      {h}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Card Footer Action */}
            <div className="pt-4 border-t border-neutral-100 flex items-center justify-between gap-3">
              <span className="text-xs text-neutral-500 font-medium">
                {demo.styleName} · {demo.paletteName}
              </span>

              <Link
                href={`/start?type=${demo.typeParam}&style=${demo.styleParam}&palette=${demo.paletteParam}`}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#181816] hover:text-neutral-600 transition-colors bg-[#effa82] hover:bg-[#e4ef73] px-3 py-1.5 rounded-lg"
              >
                Try in planner <ArrowUpRight size={14} />
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 rounded-xl bg-[#fbfbf8] border border-[#181816]/10 text-center max-w-2xl mx-auto text-xs text-neutral-500">
        💡 <strong>Looking for something specific to your industry?</strong> Start with the planner or email your notes directly to{" "}
        <a href="mailto:p8339378@gmail.com" className="font-semibold text-neutral-900 underline">
          p8339378@gmail.com
        </a>
        .
      </div>
    </section>
  );
}
