"use client";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
const questions = [
  ["Do I need to know anything about websites?", "No. Tell us about your business and what you want visitors to do. The project planner walks you through the rest, and you can choose ‘Help me decide’ whenever you’re unsure."],
  ["Can you build something more complex?", "Yes. Choose Custom project to describe accounts, dashboards, booking flows, integrations, or other special features. We review the requirements and confirm what’s possible before agreeing on the project."],
  ["How much will my website cost?", "It depends on the pages, features, and complexity. Send your project brief to request a tailored quote. There’s no payment or commitment when you submit your idea."],
  ["What if I don’t have a logo or content yet?", "That’s okay. Tell us what you already have in the planner. We can discuss what you’ll need and include any agreed help in your quote."],
  ["Will it work on phones?", "Yes. We plan for phones, tablets, and desktop screens from the start. We’ll also discuss editing, hosting, and ongoing support when we review your brief."],
];
export default function HomeFaq(){return <Accordion type="single" collapsible className="faq-list">{questions.map(([q,a],i)=><AccordionItem value={`question-${i}`} key={q} className="faq-item"><AccordionTrigger className="faq-trigger">{q}</AccordionTrigger><AccordionContent className="faq-content">{a}</AccordionContent></AccordionItem>)}</Accordion>;}
