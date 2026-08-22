import React from "react";

export function SectionHeader({
  icon,
  title,
  subtitle,
  action,
  className = "",
}) {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-end justify-between gap-3 ${className}`}>
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          {icon && React.createElement(icon, { size: 20, className: "text-purple-400" })}
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white-100">
            {title}
          </h2>
        </div>
        {subtitle && (
          <p className="text-xs sm:text-sm text-white-300">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}
