import type { BillInput } from "@/lib/types";

export const demoScenarios: Record<string, BillInput> = {
  heatingSpike: {
    utilityType: "electricity",
    homeType: "house",
    currentTotal: 241.9,
    previousTotal: 172.4,
    currentUsage: 1480,
    previousUsage: 1090,
    weatherDeltaPercent: -14,
    note: "It got colder this month and I used a portable heater in the basement.",
    fileName: "hydro_january.pdf"
  },
  waterLeak: {
    utilityType: "water",
    homeType: "house",
    currentTotal: 186.5,
    previousTotal: 97.2,
    currentUsage: 31,
    previousUsage: 14,
    weatherDeltaPercent: 0,
    note: "No change in occupancy. Nobody was home during one weekend.",
    fileName: "water_bill_march.pdf"
  },
  feeJump: {
    utilityType: "gas",
    homeType: "apartment",
    currentTotal: 132.2,
    previousTotal: 118.4,
    currentUsage: 64,
    previousUsage: 63,
    weatherDeltaPercent: -2,
    note: "Usage feels stable. I do not think anything changed.",
    fileName: "gas_bill_february.pdf"
  }
};
