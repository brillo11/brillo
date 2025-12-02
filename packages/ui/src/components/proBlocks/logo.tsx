import React from "react";

interface LogoProps {
  className?: string;
  variant?: "full" | "icon";
  size?: "sm" | "md" | "lg" | "xl";
  forceWhiteText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  className = "",
  variant = "full",
  size = "md",
  forceWhiteText = false,
}) => {
  // Container dimensions
  const containerSizes = {
    sm: "w-8 h-8 rounded-lg",
    md: "w-10 h-10 rounded-xl",
    lg: "w-12 h-12 rounded-2xl",
    xl: "w-16 h-16 rounded-2xl",
  };

  // Text sizing
  const textSizes = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl",
    xl: "text-5xl",
  };

  return (
    <div className={`flex items-center gap-3 ${className} select-none group`}>
      {/* Icon Container */}
      <div
        className={`
        relative shrink-0 flex items-center justify-center 
        bg-gradient-to-br from-red-600 via-orange-500 to-amber-500 
        shadow-md shadow-red-200 group-hover:shadow-red-300 transition-all duration-300
        ${containerSizes[size]}
      `}
      >
        {/* Abstract "Streamline Play" Icon 
            Represents: Video (Play shape), Analytics (Bar chart), Steps (Learning)
        */}
        <svg
          viewBox="0 0 24 24"
      fill="none"
          className="w-3/5 h-3/5 fill-white"
      xmlns="http://www.w3.org/2000/svg"
        >
          {/* Top Bar */}
          <path d="M5 6C5 4.89543 5.89543 4 7 4H11C12.1046 4 13 4.89543 13 6C13 7.10457 12.1046 8 11 8H7C5.89543 8 5 7.10457 5 6Z" />

          {/* Middle Bar (Longest - forming the arrow tip) */}
          <path d="M5 12C5 10.8954 5.89543 10 7 10H17C18.1046 10 19 10.8954 19 12C19 13.1046 18.1046 14 17 14H7C5.89543 14 5 13.1046 5 12Z" />

          {/* Bottom Bar */}
          <path d="M5 18C5 16.8954 5.89543 16 7 16H11C12.1046 16 13 16.8954 13 18C13 19.1046 12.1046 20 11 20H7C5.89543 20 5 19.1046 5 18Z" />
    </svg>
      </div>

      {/* Text Logo */}
      {variant === "full" && (
        <div
          className={`font-extrabold tracking-tight leading-tight ${textSizes[size]} flex items-baseline overflow-visible`}
        >
          <span className={forceWhiteText ? "text-white" : "text-slate-800"}>
            Tube
          </span>
          <span
            className={`
            ml-0.5 pb-0.5
            ${
              forceWhiteText
                ? "text-red-100"
                : "text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-600"
            }
          `}
          >
            Insight
          </span>
        </div>
      )}
    </div>
  );
};
