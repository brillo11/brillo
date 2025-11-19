import { ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

interface StatCardProps {
  icon: ReactNode;
  iconBgColor?: string;
  label: string;
  value: string | number;
  description?: string;
  progressBar?: {
    percentage: number;
    color?: string;
  };
  className?: string;
}

export function StatCard({
  icon,
  iconBgColor = "bg-blue-50",
  label,
  value,
  description,
  progressBar,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow min-h-[100px] sm:min-h-[120px] flex flex-col justify-between",
        className
      )}
    >
      <div className="flex items-center justify-between mb-2 sm:mb-4">
        <div
          className={cn(
            "w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center",
            iconBgColor
          )}
        >
          {icon}
        </div>
        <span className="text-xs font-medium text-slate-400">{label}</span>
      </div>
      <div
        className={cn(
          "text-xl sm:text-2xl font-bold text-slate-900",
          progressBar ? "mb-2 sm:mb-3" : "mt-auto"
        )}
      >
        {value}
      </div>
      {progressBar ? (
        <div className="w-full bg-slate-100 rounded-full h-2 mt-auto">
          <div
            className={cn(
              "h-2 rounded-full transition-all duration-700",
              progressBar.color || "bg-blue-800"
            )}
            style={{ width: `${progressBar.percentage}%` }}
          />
        </div>
      ) : (
        description && (
          <p className="text-xs font-normal text-slate-500">{description}</p>
        )
      )}
    </div>
  );
}
