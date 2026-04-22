"use client";

interface RoleCardProps {
  name: string;
  description: string;
  category: string;
  categoryColor: string;
  completed?: boolean;
}

export function RoleCard({
  name,
  description,
  category,
  categoryColor,
  completed,
}: RoleCardProps) {
  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-xl border transition ${
        completed
          ? "border-green-800 bg-green-950/30"
          : "border-[#222] bg-[#111]"
      }`}
    >
      <div
        className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
          completed
            ? "border-green-400 bg-green-400"
            : "border-gray-600"
        }`}
      >
        {completed && (
          <svg
            className="w-3 h-3 text-black"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-sm">{name}</span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${categoryColor}`}
          >
            {category}
          </span>
        </div>
        <p className="text-xs text-gray-400 mt-0.5">{description}</p>
      </div>
    </div>
  );
}
