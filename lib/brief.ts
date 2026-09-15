import { z } from "zod";

export const projectKinds = [
  { id: "landing", title: "Landing page", description: "One focused page for a launch, service, or idea.", icon: "pointer" },
  { id: "business", title: "Business website", description: "A proper home for your business, with multiple pages.", icon: "layers" },
  { id: "store", title: "Online store", description: "A catalogue, shopping cart, and checkout for your products.", icon: "bag" },
  { id: "custom", title: "Custom project", description: "An app, portal, dashboard, or something a little different.", icon: "blocks" },
  { id: "unsure", title: "Help me decide", description: "I have an idea. Let’s find the right starting point.", icon: "sparkles" },
] as const;
export const designStyles = [
  { id: "clean", title: "Clean & minimal", description: "Simple, spacious, and easy on the eyes." },
  { id: "playful", title: "Bold & playful", description: "A bit of colour. A lot of personality." },
  { id: "elegant", title: "Elegant & editorial", description: "Refined typography and a considered feel." },
  { id: "dark", title: "Modern & dark", description: "High contrast with an after-hours mood." },
  { id: "decide", title: "Surprise me", description: "Let the studio suggest a direction." },
] as const;
export const palettes = [
  { id: "yellow", title: "Lemon pop", color: "#effa82" },
  { id: "lilac", title: "Lilac club", color: "#d8c9f6" },
  { id: "blue", title: "Electric blue", color: "#a4c2ff" },
  { id: "peach", title: "Peach please", color: "#f7b995" },
  { id: "neutral", title: "Keep it neutral", color: "#e4e4df" },
] as const;
export const pageOptions = ["Home", "About", "Services", "Gallery", "Shop", "Blog", "Contact", "FAQ"] as const;
export const featureOptions = [
  { id: "contact", title: "Contact form", description: "Let visitors send you a message." },
  { id: "gallery", title: "Photo gallery", description: "Show your work or products." },
  { id: "editor", title: "Content editing", description: "Update your own text and posts." },
  { id: "booking", title: "Online bookings", description: "Appointments, dates, or reservations." },
  { id: "payments", title: "Online payments", description: "Take payments through your site." },
  { id: "accounts", title: "Member accounts", description: "A place for clients to sign in." },
  { id: "dashboard", title: "Custom dashboard", description: "Manage information in one place." },
  { id: "languages", title: "Multiple languages", description: "Welcome more people, in their language." },
  { id: "integrations", title: "Connect other tools", description: "Connect your CRM, stock, or other software." },
  { id: "automation", title: "Automated workflows", description: "Save time on repeat tasks." },
  { id: "search", title: "Search & filters", description: "Help visitors find the right thing." },
  { id: "help", title: "Help me choose", description: "Recommend what fits my idea." },
] as const;
export const budgetOptions = [
  { id: "under600", title: "Under €600" }, { id: "600-1200", title: "€600–€1,200" },
  { id: "1200-3000", title: "€1,200–€3,000" }, { id: "3000plus", title: "€3,000+" },
  { id: "unsure", title: "Help me work this out" },
] as const;
export const timelineOptions = [
  { id: "asap", title: "As soon as possible" }, { id: "month", title: "Within a month" },
  { id: "quarter", title: "In 2–3 months" }, { id: "flexible", title: "I’m flexible" },
] as const;
export const assetOptions = ["Logo & brand assets", "Written content", "Photos & images", "Domain name"] as const;
export const briefSchema = z.object({
  requestId: z.string().uuid(),
  projectType: z.enum(["landing", "business", "store", "custom", "unsure"]),
  websiteName: z.string().trim().max(100),
  description: z.string().trim().min(20, "Tell us a little more about your idea (at least 20 characters).").max(4000),
  style: z.enum(["clean", "playful", "elegant", "dark", "decide"]),
  palette: z.enum(["yellow", "lilac", "blue", "peach", "neutral"]),
  navigation: z.enum(["top", "sidebar"]),
  pages: z.array(z.enum(pageOptions)).min(1).max(8).refine(v => v.includes("Home")),
  extraPages: z.string().trim().max(600),
  features: z.array(z.enum(["contact", "gallery", "editor", "booking", "payments", "accounts", "dashboard", "languages", "integrations", "automation", "search", "help"])).max(12),
  customRequirements: z.string().trim().max(4000),
  budget: z.enum(["under600", "600-1200", "1200-3000", "3000plus", "unsure"]),
  timeline: z.enum(["asap", "month", "quarter", "flexible"]),
  assets: z.array(z.enum(assetOptions)).max(4),
  inspiration: z.string().trim().max(1000),
  name: z.string().trim().min(2, "Enter your name.").max(100),
  email: z.string().trim().email("Enter a valid email address.").max(254),
  phone: z.string().trim().max(40),
  consent: z.boolean().refine(v => v, "Please agree to using your details to discuss this project."),
  website: z.string().max(0),
}).strict();
export type Brief = z.infer<typeof briefSchema>;
export type Draft = Omit<Brief, "requestId" | "website">;
export const emptyDraft: Draft = {
  projectType: "unsure", websiteName: "", description: "", style: "playful", palette: "yellow", navigation: "top",
  pages: ["Home", "About", "Contact"], extraPages: "", features: ["contact"], customRequirements: "", budget: "unsure", timeline: "flexible",
  assets: [], inspiration: "", name: "", email: "", phone: "", consent: false,
};
export function nameFor(items: ReadonlyArray<{id: string; title: string}>, id: string) { return items.find(v => v.id === id)?.title ?? id; }
