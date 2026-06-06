import React from "react";

interface PremiumMetricCardProps {
  title: string;
  value: string | number | React.ReactNode;
  index: number;
}

const gradients = [
  "bg-gradient-to-br from-amber-600 to-amber-500",
  "bg-gradient-to-br from-sky-700 to-sky-500",
  "bg-gradient-to-br from-emerald-600 to-emerald-500",
  "bg-gradient-to-br from-purple-700 to-purple-500",
];

export default function PremiumMetricCard({ title, value, index }: PremiumMetricCardProps) {
  const bgClass = gradients[index % gradients.length];
  
  return (
    <div className={`p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/10 flex flex-col justify-between hover:shadow-[0_8px_30px_rgb(0,0,0,0.15)] transition-all ${bgClass}`}>
      <h3 className="text-xs font-bold text-white/80 uppercase tracking-wider mb-2 drop-shadow-sm">{title}</h3>
      <p className="text-3xl font-black text-white drop-shadow-md">{value}</p>
    </div>
  );
}
