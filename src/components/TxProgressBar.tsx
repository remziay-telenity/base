"use client";

interface TxProgressBarProps {
  count: number;
  milestone: number;
  prevMilestone: number;
}

export function TxProgressBar({ count, milestone, prevMilestone }: TxProgressBarProps) {
  const progress = Math.min(
    100,
    Math.round(((count - prevMilestone) / (milestone - prevMilestone)) * 100)
  );
  const done = count >= milestone;

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className={done ? "text-green-400 font-medium" : "text-gray-400"}>
          {done ? "✓ " : ""}{milestone} transactions
        </span>
        <span className={done ? "text-green-400" : "text-gray-500"}>
          {done ? "complete" : `${count}/${milestone}`}
        </span>
      </div>
      <div className="h-1.5 bg-[#222] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            done ? "bg-green-500" : "bg-blue-500"
          }`}
          style={{ width: `${done ? 100 : progress}%` }}
        />
      </div>
    </div>
  );
}
