import type { BillInput } from "@/lib/types";
import { demoScenarios } from "@/lib/demoData";

type DemoId = keyof typeof demoScenarios;

export const STORAGE_KEY = "billbrain:lastAnalysis";

export const UTILITY_OPTIONS: Array<BillInput["utilityType"]> = [
  "electricity",
  "water",
  "gas",
];

export const HOME_OPTIONS: Array<BillInput["homeType"]> = ["apartment", "house", "duplex"];

export const PROVIDER_OPTIONS = ["Hydro-Québec", "Énergir", "Veolia", "Custom API"] as const;

export const INPUT_METHODS = [
  {
    key: "manual" as const,
    title: "Input manually",
    description: "Type in the bill totals and usage yourself.",
    badge: "Quick",
    icon: "⌨️",
  },
  {
    key: "image" as const,
    title: "Upload picture or PDF",
    description: "Start from a photo, screenshot, or bill document.",
    badge: "Realistic",
    icon: "📸",
  },
  {
    key: "connect" as const,
    title: "Connect via MCP / API",
    description: "Simulate a provider or system connection for premium workflows.",
    badge: "Premium",
    icon: "🔌",
  },
  {
    key: "demo" as const,
    title: "Load demo",
    description: "Use one of the prepared demo scenarios for the pitch.",
    badge: "Pitch",
    icon: "🎯",
  },
];

export const DEMO_CARDS: Array<{
  id: DemoId;
  title: string;
  description: string;
}> = [
  {
    id: "heatingSpike",
    title: "Heating spike",
    description: "Cold-weather energy jump with likely electric heating impact.",
  },
  {
    id: "waterLeak",
    title: "Water leak",
    description: "Usage spike without occupancy change, pointing to a possible leak.",
  },
  {
    id: "feeJump",
    title: "Fee jump",
    description: "Small usage change but a higher bill, suggesting rate or fee issues.",
  },
];

export function formatUtility(value: BillInput["utilityType"]) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function formatHome(value: BillInput["homeType"]) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
