"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState, useMemo, type CSSProperties } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  Ghost,
  MousePointer2,
  Layers3,
  ShoppingBag,
  Blocks,
  Sparkles,
  Monitor,
  Menu,
  CheckCircle2,
  LoaderCircle,
  Pencil,
  ShieldCheck,
  Info,
  Eye,
  EyeOff
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  projectKinds,
  designStyles,
  palettes,
  pageOptions,
  featureOptions,
  budgetOptions,
  timelineOptions,
  assetOptions,
  briefSchema,
  emptyDraft,
  nameFor,
  type Draft
} from "@/lib/brief";

const DRAFT_STORAGE_KEY = "ghost_studio_draft_v2";

const steps = ["Your idea", "Your style", "The details", "The plan", "Say hello"];
const icons = { landing: MousePointer2, business: Layers3, store: ShoppingBag, custom: Blocks, unsure: Sparkles };

function Header() {
  return (
    <header className="site-header planner-header container">
      <Link href="/" className="brand" aria-label="Ghost Studio home">
        <Image src="/favicon.png" alt="" width={36} height={36} referrerPolicy="no-referrer" />
        <span>
          ghost<span className="brand-light">studio</span>
        </span>
      </Link>
      <div className="flex items-center gap-4">
        <span className="hidden sm:inline-block text-xs font-mono text-muted-foreground">
          Direct enquiries: <a href="mailto:p8339378@gmail.com" className="hover:underline text-foreground font-semibold">p8339378@gmail.com</a>
        </span>
        <Link href="/" className="planner-back">
          <ArrowLeft size={16} /> Back to the studio
        </Link>
      </div>
    </header>
  );
}

function Preview({ draft }: { draft: Draft }) {
  const accent = palettes.find((p) => p.id === draft.palette)?.color || "#effa82";
  return (
    <div className="live-preview" aria-label="An illustrative preview of your selected website style">
      <div className="preview-browser">
        <span />
        <span />
        <span />
        <span className="preview-browser-label">{draft.websiteName.trim() || "your next website"}</span>
        <Monitor size={13} />
      </div>
      <div
        className={`preview-site preview-${draft.style} preview-nav-${draft.navigation}`}
        style={{ "--preview-accent": accent } as CSSProperties}
      >
        <div className="preview-nav">
          <span className="preview-logo">{draft.websiteName.trim() || "Your Brand"}</span>
          <div className="preview-navlinks">
            {draft.pages
              .filter((p) => p !== "Home")
              .slice(0, 3)
              .map((p) => (
                <span key={p}>{p}</span>
              ))}
          </div>
          <Menu size={14} />
        </div>
        <div className="preview-body">
          <span className="preview-tag">A LITTLE DIFFERENT. ALL YOU.</span>
          <h3>
            {draft.projectType === "store" ? (
              <>
                Good things.
                <br />
                <em>Great finds.</em>
              </>
            ) : draft.projectType === "custom" ? (
              <>
                Your next
                <br />
                <em>big thing.</em>
              </>
            ) : (
              <>
                Something good
                <br />
                <em>starts here.</em>
              </>
            )}
          </h3>
          <p>
            A space for your story.
            <br />
            Built around what makes you, you.
          </p>
          <span className="preview-fake-button">
            {draft.projectType === "store" ? "Explore the collection" : "Let’s get acquainted"}{" "}
            <ArrowUpRight size={13} />
          </span>
          <div className="preview-rule" />
          <div className="preview-detail-row">
            <span>Thoughtful by design.</span>
            <Sparkles size={18} />
          </div>
        </div>
      </div>
      <p className="preview-disclaimer">
        Style preview only. Your final website will be custom-crafted around your specific content and brand.
      </p>
    </div>
  );
}

function Summary({ draft, step }: { draft: Draft; step: number }) {
  return (
    <aside className="blueprint">
      <div className="blueprint-heading">
        <span className="eyebrow">YOUR LITTLE BLUEPRINT</span>
        <Sparkles size={20} />
      </div>
      <Preview draft={draft} />
      <div className="blueprint-details">
        <div>
          <span>We’re building</span>
          <strong>{nameFor(projectKinds, draft.projectType)}</strong>
        </div>
        <div>
          <span>The feeling</span>
          <strong>{nameFor(designStyles, draft.style)}</strong>
        </div>
        <div>
          <span>{draft.projectType === "landing" ? "Sections" : "Pages"}</span>
          <strong>
            {draft.pages.length}
            {draft.extraPages.trim() ? " + custom" : ""}
          </strong>
        </div>
        {step >= 2 && (
          <div>
            <span>Extra features</span>
            <strong>{draft.features.length ? `${draft.features.length} chosen` : "None yet"}</strong>
          </div>
        )}
        {step >= 3 && (
          <div>
            <span>Planning budget</span>
            <strong>{nameFor(budgetOptions, draft.budget)}</strong>
          </div>
        )}
      </div>
      <div className="blueprint-note">
        <Ghost size={30} />
        <p>
          Nothing is locked in stone.
          <br />
          We review your requirements and agree on scope, price, and timeline before starting.
        </p>
      </div>
    </aside>
  );
}

export default function Planner() {
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [step, setStep] = useState(0);
  const [furthest, setFurthest] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [reference, setReference] = useState("");
  const [savedDraftNotice, setSavedDraftNotice] = useState<{ step: number; draft: Partial<Draft> } | null>(null);
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  const requestId = useRef("");
  const trap = useRef<HTMLInputElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const latest = useRef(draft);
  latest.current = draft;

  // Dynamic budget options based on project type
  const activeBudgetOptions = useMemo(() => {
    return budgetOptions.filter((o) => {
      if (draft.projectType === "store" || draft.projectType === "custom") return o.id !== "under600";
      if (draft.projectType === "landing") return o.id !== "3000plus";
      return true;
    });
  }, [draft.projectType]);

  // Dynamic timeline options based on project type
  const activeTimelineOptions = useMemo(() => {
    return timelineOptions.filter((o) => {
      if ((draft.projectType === "store" || draft.projectType === "custom") && o.id === "asap") return false;
      return true;
    });
  }, [draft.projectType]);

  // Sync budget/timeline if current selection is invalid for project type
  const currentBudget = draft.budget;
  const currentTimeline = draft.timeline;
  useEffect(() => {
    if (!activeBudgetOptions.some((o) => o.id === currentBudget) && activeBudgetOptions.length > 0) {
      update("budget", activeBudgetOptions[0].id as Draft["budget"]);
    }
    if (!activeTimelineOptions.some((o) => o.id === currentTimeline) && activeTimelineOptions.length > 0) {
      update("timeline", activeTimelineOptions[0].id as Draft["timeline"]);
    }
  }, [currentBudget, currentTimeline, activeBudgetOptions, activeTimelineOptions]);

  // Read URL query params on mount & Restore saved draft
  useEffect(() => {
    const timer = setTimeout(() => {
      // 1. Check URL parameters
      const urlParams = new URLSearchParams(window.location.search);
      const kind = urlParams.get("type");
      const styleParam = urlParams.get("style");
      const paletteParam = urlParams.get("palette");

      // 2. Safely read unfinished draft from localStorage
      try {
        const stored = localStorage.getItem(DRAFT_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && typeof parsed === "object" && typeof parsed.step === "number") {
            const restoredDraft: Partial<Draft> = parsed.draft || {};
            // Validate restored data integrity
            const isValidType = projectKinds.some((k) => k.id === restoredDraft.projectType);
            const isValidStyle = designStyles.some((s) => s.id === restoredDraft.style);
            const hasUserInput = Boolean(
              restoredDraft.description?.trim() ||
              restoredDraft.websiteName?.trim() ||
              (restoredDraft.features && restoredDraft.features.length > 0) ||
              parsed.step > 0
            );

            if (isValidType && isValidStyle && hasUserInput) {
              setSavedDraftNotice({
                step: Math.min(Math.max(0, parsed.step), 4),
                draft: restoredDraft,
              });
            }
          }
        }
      } catch {
        // Gracefully handle browser storage disabled / private mode
      }

      // Apply URL presets if provided
      if (projectKinds.some((k) => k.id === kind)) {
        setDraft((d) => ({
          ...d,
          projectType: kind as Draft["projectType"],
          pages:
            kind === "landing"
              ? ["Home", "About", "Contact"]
              : kind === "store"
              ? ["Home", "Shop", "About", "Contact"]
              : d.pages,
          style: designStyles.some((s) => s.id === styleParam) ? (styleParam as Draft["style"]) : d.style,
          palette: palettes.some((p) => p.id === paletteParam) ? (paletteParam as Draft["palette"]) : d.palette,
        }));
      }
      setHasInitialized(true);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  // Auto-save unfinished draft to localStorage (excluding contact details & consent)
  useEffect(() => {
    if (!hasInitialized || reference || savedDraftNotice) return; // don't save after confirmed submission or before init, or while there's a draft notice
    try {
      const stateToPersist = {
        step,
        savedAt: Date.now(),
        draft: {
          projectType: draft.projectType,
          websiteName: draft.websiteName,
          description: draft.description,
          style: draft.style,
          palette: draft.palette,
          navigation: draft.navigation,
          pages: draft.pages,
          extraPages: draft.extraPages,
          features: draft.features,
          customRequirements: draft.customRequirements,
          budget: draft.budget,
          timeline: draft.timeline,
          assets: draft.assets,
          inspiration: draft.inspiration,
        },
      };
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(stateToPersist));
    } catch {
      // Storage unavailable / blocked
    }
  }, [step, draft, reference, hasInitialized, savedDraftNotice]);

  useEffect(() => {
    requestId.current = "";
  }, [draft]);

  useEffect(() => {
    if (step > 0) heading.current?.focus({ preventScroll: true });
  }, [step]);

  function continueSavedDraft() {
    if (!savedDraftNotice) return;
    const restored = savedDraftNotice.draft;
    setDraft((prev) => ({
      ...prev,
      ...restored,
      // Ensure Home is always in pages
      pages: Array.isArray(restored.pages) && restored.pages.includes("Home") ? restored.pages : ["Home", "About", "Contact"],
    }));
    setStep(savedDraftNotice.step);
    setFurthest((f) => Math.max(f, savedDraftNotice.step));
    setSavedDraftNotice(null);
  }

  function discardSavedDraft() {
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch {}
    setSavedDraftNotice(null);
    setDraft(emptyDraft);
    setStep(0);
    setFurthest(0);
  }

  function update<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
    setSendError("");
  }

  function toggle(key: "pages" | "features" | "assets", value: string) {
    setDraft((d) => {
      const current = d[key] as string[];
      return {
        ...d,
        [key]: current.includes(value) ? current.filter((v) => v !== value) : [...current, value],
      };
    });
    setSendError("");
  }

  function goTo(nextStep: number) {
    setStep(nextStep);
    setFurthest((f) => Math.max(f, nextStep));
    setErrors({});
    setSendError("");
    window.scrollTo({
      top: 0,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    });
  }

  function next() {
    const nextErrors: Record<string, string> = {};
    if (step === 0 && draft.description.trim().length < 20) {
      nextErrors.description = "Tell us a little more about your idea (at least 20 characters).";
    }
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      document.getElementById(Object.keys(nextErrors)[0])?.focus();
      return;
    }
    goTo(step + 1);
  }

  async function submit() {
    if (sending) return;
    if (!requestId.current) requestId.current = crypto.randomUUID();
    const payload = {
      ...draft,
      requestId: requestId.current,
      website: trap.current?.value || "",
    };

    const result = briefSchema.safeParse(payload);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        fieldErrors[String(issue.path[0])] = issue.message;
      }
      setErrors(fieldErrors);
      if (fieldErrors.description) {
        setStep(0);
      }
      requestAnimationFrame(() => document.getElementById(Object.keys(fieldErrors)[0])?.focus());
      return;
    }

    setSending(true);
    setSendError("");
    const abort = new AbortController();
    const timeout = setTimeout(() => abort.abort(), 20000);

    try {
      const response = await fetch("/api/briefs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.data),
        signal: abort.signal,
      });

      const rawBody: unknown = await response.json().catch(() => ({}));
      const body = rawBody && typeof rawBody === "object" ? (rawBody as { error?: unknown; saved?: unknown; reference?: unknown }) : {};

      if (!response.ok) {
        if (response.status === 409) requestId.current = "";
        throw new Error(typeof body.error === "string" ? body.error : "Your brief hasn’t been saved yet. Please try again.");
      }

      if (body.saved !== true || typeof body.reference !== "string") {
        throw new Error("We couldn’t confirm your brief. Please try again.");
      }

      // Submission confirmed! Clear draft from localStorage
      try {
        localStorage.removeItem(DRAFT_STORAGE_KEY);
      } catch {}

      setReference(body.reference);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      setSendError(
        error instanceof Error && error.name !== "AbortError"
          ? error.message
          : "We couldn’t confirm your brief yet. Your details are still here — please try again."
      );
    } finally {
      clearTimeout(timeout);
      setSending(false);
    }
  }

  // Submission Confirmed View
  if (reference) {
    return (
      <TooltipProvider>
        <Header />
        <main id="main-content" className="success-page container">
          <div className="success-badge">
            <CheckCircle2 size={45} />
          </div>
          <div className="eyebrow">ONE GOOD IDEA, SAFELY LANDED.</div>
          <h1>
            Your brief has
            <br />
            <span className="highlight-word">landed.</span>
          </h1>
          <p>
            Thanks, {draft.name.trim().split(/\s+/)[0]}. Your idea has been safely saved in our database.
            We will review your requirements and reach out to <strong>{draft.email}</strong> to schedule our chat.
          </p>
          <div className="receipt-card">
            <span className="eyebrow">YOUR PROJECT REFERENCE</span>
            <strong className="receipt-reference">{reference}</strong>
            <div>
              <span>{draft.websiteName || "Your next website"}</span>
              <span>{nameFor(projectKinds, draft.projectType)}</span>
            </div>
            <p>Keep this reference for your conversations with Ghost Studio.</p>
          </div>
          <div className="bg-[#effa82]/40 border border-[#181816]/10 p-4 rounded-xl text-xs text-neutral-800 text-left max-w-md mx-auto space-y-1">
            <div className="font-semibold text-neutral-900">What happens next?</div>
            <p>1. We review your chosen pages, features, and style feeling.</p>
            <p>2. We discuss and agree on exact scope, pricing, and timeline with you.</p>
            <p>3. No payment or commitment has been taken.</p>
          </div>
          <div className="flex flex-wrap gap-3 justify-center mt-6">
            <Link href="/" className="button button-dark">
              Back to the studio <ArrowUpRight size={18} />
            </Link>
          </div>
        </main>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider delayDuration={150}>
      <Header />
      <main id="main-content" className="planner-main container">
        {/* Saved Draft Notice Banner */}
        {savedDraftNotice && (
          <div className="mb-6 p-4 rounded-2xl bg-[#effa82]/30 border border-[#181816]/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">👻</span>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-700 block">Saved Draft Found</span>
                <span className="text-sm font-medium text-neutral-900">
                  You have an unfinished website brief from earlier (Step {savedDraftNotice.step + 1}: {steps[savedDraftNotice.step]}).
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                type="button"
                size="sm"
                onClick={continueSavedDraft}
                className="button button-dark text-xs h-8 flex-1 sm:flex-none"
              >
                Continue your draft
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={discardSavedDraft}
                className="text-xs h-8 text-neutral-600 bg-white hover:text-neutral-900"
              >
                Start again
              </Button>
            </div>
          </div>
        )}

        <div className="planner-title-row">
          <div>
            <div className="eyebrow">
              <Sparkles size={16} /> A GOOD WEBSITE STARTS WITH A LITTLE HELLO.
            </div>
            <h1>
              Let’s make it <span>yours.</span>
            </h1>
          </div>
          <span className="planner-kicker">
            Your idea. A few easy choices.
            <br />
            We’ll agree on scope, quote, and timeline together.
          </span>
        </div>

        {/* 5-Step Navigation */}
        <nav className="planner-progress" aria-label="Project planner progress">
          {steps.map((label, i) => (
            <Button
              type="button"
              variant="ghost"
              key={label}
              disabled={i > furthest || sending}
              className={`progress-step ${step === i ? "active" : ""} ${i < step ? "done" : ""}`}
              onClick={() => goTo(i)}
              aria-current={step === i ? "step" : undefined}
            >
              <span className="progress-number">{i < step ? <Check size={16} /> : String(i + 1).padStart(2, "0")}</span>
              <span>{label}</span>
            </Button>
          ))}
        </nav>

        {/* Mobile Preview Toggle Button */}
        <div className="lg:hidden mb-4 flex justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowMobilePreview(!showMobilePreview)}
            className="text-xs gap-1.5 h-8 bg-white"
          >
            {showMobilePreview ? <EyeOff size={14} /> : <Eye size={14} />}
            {showMobilePreview ? "Hide live preview" : "Show live preview"}
          </Button>
        </div>

        <div className="planner-grid">
          <form
            className="planner-form"
            aria-busy={sending}
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              if (step === 4) void submit();
              else next();
            }}
          >
            <div className="mb-6 flex items-center justify-between">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Step {step + 1} of {steps.length}: <span className="text-foreground font-bold">{steps[step]}</span>
              </div>
              <div className="flex gap-1">
                {steps.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 w-7 rounded-full transition-colors ${i <= step ? "bg-foreground" : "bg-neutral-200"}`}
                  />
                ))}
              </div>
            </div>

            <fieldset className="planner-fields" disabled={sending}>
              <div className="form-heading">
                <span className="form-step-count">STEP {String(step + 1).padStart(2, "0")} / 05</span>
                <h2 ref={heading} tabIndex={-1}>
                  {[
                    "What are we making?",
                    "Let’s find your feeling.",
                    "What should it do?",
                    "A few practical things.",
                    "One last little hello.",
                  ][step]}
                </h2>
                <p>
                  {[
                    "Start with the closest fit. We’ll discuss the finer details together.",
                    "Pick what feels like you. The preview is just a starting point.",
                    "Choose what matters to your visitors. Keep it simple or dream bigger.",
                    "Give us a starting point for your quote. No commitment needed.",
                    "Review your idea and leave your details so we can talk about it.",
                  ][step]}
                </p>
              </div>

              {/* STEP 0: Project Type & Idea */}
              {step === 0 && (
                <div className="step-content">
                  <RadioGroup
                    value={draft.projectType}
                    onValueChange={(v) => update("projectType", v as Draft["projectType"])}
                    className="project-choice-grid"
                    aria-label="Website type"
                  >
                    {projectKinds.map((kind) => {
                      const Icon = icons[kind.id];
                      return (
                        <label
                          className={`project-choice ${draft.projectType === kind.id ? "selected" : ""} ${
                            kind.id === "unsure" ? "choice-wide" : ""
                          }`}
                          htmlFor={`type-${kind.id}`}
                          key={kind.id}
                        >
                          <Icon size={26} />
                          <RadioGroupItem id={`type-${kind.id}`} value={kind.id} className="choice-radio" />
                          <span className="choice-title">{kind.title}</span>
                          <span className="choice-description">{kind.description}</span>
                        </label>
                      );
                    })}
                  </RadioGroup>

                  <div className="form-field">
                    <label htmlFor="websiteName">
                      What’s your business or project called? <span>Optional</span>
                    </label>
                    <Input
                      id="websiteName"
                      className="studio-input"
                      value={draft.websiteName}
                      onChange={(e) => update("websiteName", e.target.value)}
                      maxLength={100}
                      placeholder="Your future favourite website"
                      autoComplete="organization"
                    />
                  </div>

                  <div className="form-field">
                    <label htmlFor="description">
                      Tell us about your idea <span>Required</span>
                    </label>
                    <Textarea
                      id="description"
                      className="studio-input"
                      value={draft.description}
                      onChange={(e) => update("description", e.target.value)}
                      maxLength={4000}
                      placeholder="For example: I run an independent coffee shop and bakery. We need visitors to see our daily menu, check our opening hours, and request custom cake orders…"
                      aria-invalid={!!errors.description}
                      aria-describedby={errors.description ? "description-error" : "description-hint"}
                      required
                    />
                    <span id="description-hint" className="field-hint">
                      Who is it for, and what would you like visitors to do?
                    </span>
                    {errors.description && (
                      <p id="description-error" className="field-error" role="alert">
                        {errors.description}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 1: Style, Palette & Navigation */}
              {step === 1 && (
                <div className="step-content">
                  <RadioGroup
                    value={draft.style}
                    onValueChange={(v) => update("style", v as Draft["style"])}
                    className="style-choice-grid"
                    aria-label="Website style"
                  >
                    {designStyles.map((style) => (
                      <label
                        className={`style-choice style-choice-${style.id} ${draft.style === style.id ? "selected" : ""}`}
                        htmlFor={`style-${style.id}`}
                        key={style.id}
                      >
                        <span className="style-letter" aria-hidden="true">
                          Aa<span>↗</span>
                        </span>
                        <RadioGroupItem id={`style-${style.id}`} value={style.id} className="choice-radio" />
                        <span className="choice-title">{style.title}</span>
                        <span className="choice-description">{style.description}</span>
                      </label>
                    ))}
                  </RadioGroup>

                  <fieldset className="form-field">
                    <legend>Choose an accent colour</legend>
                    <RadioGroup
                      className="palette-options"
                      value={draft.palette}
                      onValueChange={(v) => update("palette", v as Draft["palette"])}
                      aria-label="Accent colour"
                    >
                      {palettes.map((p) => (
                        <label
                          key={p.id}
                          htmlFor={`palette-${p.id}`}
                          className={`palette-option ${draft.palette === p.id ? "selected" : ""}`}
                        >
                          <RadioGroupItem
                            value={p.id}
                            id={`palette-${p.id}`}
                            style={{ background: p.color }}
                            className="palette-circle"
                          />
                          <span>{p.title}</span>
                        </label>
                      ))}
                    </RadioGroup>
                    <p className="field-hint">Already have brand colours? Share them in the inspiration field below.</p>
                  </fieldset>

                  <fieldset className="form-field">
                    <legend>How should visitors get around?</legend>
                    <RadioGroup
                      value={draft.navigation}
                      onValueChange={(v) => update("navigation", v as Draft["navigation"])}
                      className="navigation-options"
                      aria-label="Website navigation"
                    >
                      <label htmlFor="nav-top" className={`compact-choice ${draft.navigation === "top" ? "selected" : ""}`}>
                        <RadioGroupItem id="nav-top" value="top" />
                        <span>Menu at the top</span>
                      </label>
                      <label htmlFor="nav-sidebar" className={`compact-choice ${draft.navigation === "sidebar" ? "selected" : ""}`}>
                        <RadioGroupItem id="nav-sidebar" value="sidebar" />
                        <span>A side menu</span>
                      </label>
                    </RadioGroup>
                  </fieldset>

                  <div className="form-field">
                    <label htmlFor="inspiration">
                      Anything you love the look of? <span>Optional</span>
                    </label>
                    <Textarea
                      id="inspiration"
                      className="studio-input small-textarea"
                      placeholder="Website links, colour codes, brands you admire, or just a vibe…"
                      maxLength={1000}
                      value={draft.inspiration}
                      onChange={(e) => update("inspiration", e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* STEP 2: Pages & Features */}
              {step === 2 && (
                <div className="step-content">
                  <fieldset className="form-field first-field">
                    <legend>{draft.projectType === "landing" ? "Which sections do you need?" : "Which pages do you need?"}</legend>
                    <div className="page-choices">
                      {pageOptions.map((page) => (
                        <label
                          className={`page-choice ${draft.pages.includes(page) ? "selected" : ""}`}
                          htmlFor={`page-${page}`}
                          key={page}
                        >
                          <Checkbox
                            id={`page-${page}`}
                            checked={draft.pages.includes(page)}
                            disabled={page === "Home"}
                            onCheckedChange={() => toggle("pages", page)}
                          />
                          <span>{page}</span>
                        </label>
                      ))}
                    </div>
                    <p className="field-hint">
                      Home is included.{" "}
                      {draft.projectType === "landing"
                        ? "These become sections of your single page."
                        : "We’ll help you refine the exact site map during our chat."}
                    </p>
                  </fieldset>

                  <div className="form-field">
                    <label htmlFor="extraPages">
                      Other {draft.projectType === "landing" ? "sections" : "pages"}? <span>Optional</span>
                    </label>
                    <Input
                      id="extraPages"
                      className="studio-input"
                      value={draft.extraPages}
                      onChange={(e) => update("extraPages", e.target.value)}
                      placeholder="For example: Team, Case Studies, Pricing calculator, FAQ…"
                      maxLength={600}
                    />
                  </div>

                  <fieldset className="form-field">
                    <legend>Add a little functionality</legend>
                    <div className="feature-choices">
                      {featureOptions.map((feature) => (
                        <label
                          className={`feature-choice ${draft.features.includes(feature.id) ? "selected" : ""} transition-transform hover:scale-[1.01]`}
                          htmlFor={`feature-${feature.id}`}
                          key={feature.id}
                        >
                          <Checkbox
                            id={`feature-${feature.id}`}
                            checked={draft.features.includes(feature.id)}
                            onCheckedChange={() => toggle("features", feature.id)}
                          />
                          <span>
                            <strong className="flex items-center gap-1.5">
                              {feature.title}
                              <Tooltip>
                                <TooltipTrigger type="button" tabIndex={-1} className="inline-flex items-center">
                                  <Info size={13} className="text-muted-foreground hover:text-foreground transition-colors" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs text-xs">
                                  {feature.description}
                                </TooltipContent>
                              </Tooltip>
                            </strong>
                            <span>{feature.description}</span>
                          </span>
                        </label>
                      ))}
                    </div>
                  </fieldset>

                  {(draft.projectType === "custom" ||
                    draft.features.some((f) => ["accounts", "dashboard", "integrations", "automation", "payments"].includes(f))) && (
                    <div className="complex-note">
                      <Blocks size={22} />
                      <p>
                        A bigger idea? Wonderful. We’ll discuss how these systems and integrations work together before quoting.
                      </p>
                    </div>
                  )}

                  <div className="form-field">
                    <label htmlFor="customRequirements">
                      Anything else it needs to do? <span>Optional</span>
                    </label>
                    <Textarea
                      id="customRequirements"
                      className="studio-input"
                      placeholder="Tell us about special workflows, tools you connect to, user roles, or anything that doesn’t fit a checkbox."
                      value={draft.customRequirements}
                      onChange={(e) => update("customRequirements", e.target.value)}
                      maxLength={4000}
                    />
                  </div>
                </div>
              )}

              {/* STEP 3: Budget, Timeline & Assets */}
              {step === 3 && (
                <div className="step-content">
                  <div className="form-field first-field">
                    <label htmlFor="budget">What budget do you have in mind?</label>
                    <Select value={draft.budget} onValueChange={(v) => update("budget", v as Draft["budget"])}>
                      <SelectTrigger id="budget" className="studio-input">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {activeBudgetOptions.map((o) => (
                          <SelectItem key={o.id} value={o.id}>
                            {o.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="field-hint">This helps us match the scope to what you want to spend. No price is locked in until we agree.</p>
                  </div>

                  <fieldset className="form-field">
                    <legend>When would you like it ready?</legend>
                    <RadioGroup
                      value={draft.timeline}
                      onValueChange={(v) => update("timeline", v as Draft["timeline"])}
                      className="timeline-options"
                      aria-label="Desired timeline"
                    >
                      {activeTimelineOptions.map((o) => (
                        <label
                          htmlFor={`time-${o.id}`}
                          key={o.id}
                          className={`compact-choice ${draft.timeline === o.id ? "selected" : ""} transition-all hover:scale-[1.01]`}
                        >
                          <RadioGroupItem id={`time-${o.id}`} value={o.id} />
                          <span>{o.title}</span>
                        </label>
                      ))}
                    </RadioGroup>
                    <p className="field-hint">We’ll agree on an achievable launch timeline together.</p>
                  </fieldset>

                  <fieldset className="form-field">
                    <legend>What do you already have ready?</legend>
                    <p className="field-hint legend-hint">Select anything that’s prepared. Starting from scratch is completely fine.</p>
                    <div className="asset-choices">
                      {assetOptions.map((a, i) => (
                        <label
                          htmlFor={`asset-${i}`}
                          className={`compact-choice ${draft.assets.includes(a) ? "selected" : ""} transition-all hover:scale-[1.01]`}
                          key={a}
                        >
                          <Checkbox
                            id={`asset-${i}`}
                            checked={draft.assets.includes(a)}
                            onCheckedChange={() => toggle("assets", a)}
                          />
                          <span>{a}</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>

                  <div className="plan-note">
                    <Ghost size={37} />
                    <div>
                      <h3>We’ll fill in the blanks together.</h3>
                      <p>Content, domain registration, hosting, and ongoing updates — we’ll map it all out during our conversation.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: Review, Contact & Submit */}
              {step === 4 && (
                <div className="step-content">
                  <div className="review-card">
                    <div className="review-heading">
                      <h3>{draft.websiteName || "Your next big project"}</h3>
                      <Button type="button" variant="ghost" onClick={() => goTo(0)} aria-label="Edit your project idea">
                        <Pencil size={14} /> Edit
                      </Button>
                    </div>
                    <p className="review-description">{draft.description}</p>
                    <dl>
                      <div>
                        <dt>Website</dt>
                        <dd>{nameFor(projectKinds, draft.projectType)}</dd>
                      </div>
                      <div>
                        <dt>Style</dt>
                        <dd>
                          {nameFor(designStyles, draft.style)} · {nameFor(palettes, draft.palette)}
                        </dd>
                      </div>
                      <div>
                        <dt>Navigation</dt>
                        <dd>{draft.navigation === "top" ? "Menu at the top" : "Side menu"}</dd>
                      </div>
                      <div>
                        <dt>{draft.projectType === "landing" ? "Sections" : "Pages"}</dt>
                        <dd>
                          {draft.pages.join(", ")}
                          {draft.extraPages && ` · ${draft.extraPages}`}
                        </dd>
                      </div>
                      <div>
                        <dt>Features</dt>
                        <dd>
                          {draft.features.length
                            ? draft.features.map((f) => nameFor(featureOptions, f)).join(", ")
                            : "No extra features selected"}
                        </dd>
                      </div>
                      {draft.customRequirements && (
                        <div>
                          <dt>Custom details</dt>
                          <dd>{draft.customRequirements}</dd>
                        </div>
                      )}
                      {draft.inspiration && (
                        <div>
                          <dt>Inspiration</dt>
                          <dd>{draft.inspiration}</dd>
                        </div>
                      )}
                      <div>
                        <dt>Budget</dt>
                        <dd>{nameFor(budgetOptions, draft.budget)}</dd>
                      </div>
                      <div>
                        <dt>Timeline</dt>
                        <dd>{nameFor(timelineOptions, draft.timeline)}</dd>
                      </div>
                      <div>
                        <dt>Ready to go</dt>
                        <dd>{draft.assets.length ? draft.assets.join(", ") : "Starting from scratch"}</dd>
                      </div>
                    </dl>
                    <Button type="button" variant="link" className="edit-details" onClick={() => goTo(2)}>
                      Change pages or features <ArrowRight size={15} />
                    </Button>
                  </div>

                  <div className="contact-fields">
                    <div className="form-field">
                      <label htmlFor="name">
                        Your name <span>Required</span>
                      </label>
                      <Input
                        id="name"
                        className="studio-input"
                        placeholder="First and last name"
                        autoComplete="name"
                        value={draft.name}
                        onChange={(e) => update("name", e.target.value)}
                        maxLength={100}
                        required
                        aria-invalid={!!errors.name}
                        aria-describedby={errors.name ? "name-error" : undefined}
                      />
                      {errors.name && (
                        <p id="name-error" className="field-error" role="alert">
                          {errors.name}
                        </p>
                      )}
                    </div>

                    <div className="form-field">
                      <label htmlFor="email">
                        Email address <span>Required</span>
                      </label>
                      <Input
                        id="email"
                        type="email"
                        className="studio-input"
                        placeholder="you@example.com"
                        autoComplete="email"
                        value={draft.email}
                        onChange={(e) => update("email", e.target.value)}
                        maxLength={254}
                        required
                        aria-invalid={!!errors.email}
                        aria-describedby={errors.email ? "email-error" : undefined}
                      />
                      {errors.email && (
                        <p id="email-error" className="field-error" role="alert">
                          {errors.email}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="form-field">
                    <label htmlFor="phone">
                      Phone number <span>Optional</span>
                    </label>
                    <Input
                      id="phone"
                      type="tel"
                      className="studio-input"
                      placeholder="Include your country code"
                      autoComplete="tel"
                      value={draft.phone}
                      onChange={(e) => update("phone", e.target.value)}
                      maxLength={40}
                    />
                  </div>

                  {/* Anti-spam honeypot */}
                  <div className="trap-field" aria-hidden="true">
                    <label htmlFor="website">Leave this field empty</label>
                    <input ref={trap} id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
                  </div>

                  <div className="consent-field">
                    <Checkbox
                      id="consent"
                      checked={draft.consent}
                      onCheckedChange={(v) => update("consent", v === true)}
                      aria-required="true"
                      aria-invalid={!!errors.consent}
                      aria-describedby={errors.consent ? "consent-error" : undefined}
                    />
                    <label htmlFor="consent">
                      I agree that Ghost Studio can use my details to discuss this project, as explained in the{" "}
                      <Link href="/privacy" target="_blank" rel="noopener noreferrer">
                        privacy notice <ArrowUpRight size={12} />
                      </Link>
                      .
                    </label>
                  </div>
                  {errors.consent && (
                    <p id="consent-error" className="field-error" role="alert">
                      {errors.consent}
                    </p>
                  )}

                  <div className="submit-reassurance">
                    <ShieldCheck size={17} /> A project enquiry. No payment or commitment.
                  </div>
                </div>
              )}

              {sendError && (
                <div className="send-error" role="alert">
                  {sendError}
                </div>
              )}

              <div className="planner-form-footer">
                {step > 0 ? (
                  <Button
                    className="button button-outline"
                    variant="outline"
                    type="button"
                    onClick={() => goTo(step - 1)}
                    disabled={sending}
                  >
                    <ArrowLeft size={17} /> Back
                  </Button>
                ) : (
                  <span className="footer-note">Let’s take it one step at a time.</span>
                )}
                <Button className="button button-dark" type="submit" disabled={sending}>
                  {sending ? (
                    <>
                      <LoaderCircle className="spin" size={18} /> Saving your brief…
                    </>
                  ) : step === 4 ? (
                    <>
                      Send my project brief <ArrowUpRight size={20} />
                    </>
                  ) : (
                    <>
                      Continue <ArrowRight size={19} />
                    </>
                  )}
                </Button>
              </div>
            </fieldset>
          </form>

          {/* Blueprint and Live Preview (Desktop & Mobile when toggled) */}
          <div className={`${showMobilePreview ? "block" : "hidden lg:block"}`}>
            <Summary draft={draft} step={step} />
          </div>
        </div>

        <div className="planner-bottom">
          <span>ghoststudio.mk</span>
          <span>A little spirit. A website that’s yours.</span>
          <Link href="/privacy">Privacy Notice</Link>
        </div>
      </main>
    </TooltipProvider>
  );
}
