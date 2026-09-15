import type { Metadata } from "next";
import Planner from "./planner";
export const metadata: Metadata = { title: "Plan your website", description: "Bring your idea to life. Choose your website type, style, pages, and features, then send your project brief to Ghost Studio." };
export default function StartPage() { return <Planner/>; }
