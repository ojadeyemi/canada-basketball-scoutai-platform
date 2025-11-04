interface SeasonTypeBadgeProps {
  seasonType: string;
}

const BADGE_CONFIG = {
  regular: {
    label: "Regular",
    color: "bg-blue-500/10 text-blue-500",
    icon: "🏀",
  },
  playoffs: {
    label: "Playoffs",
    color: "bg-yellow-500/10 text-yellow-500",
    icon: "🏆",
  },
  championship: {
    label: "Championship",
    color: "bg-purple-500/10 text-purple-500",
    icon: "👑",
  },
  total: {
    label: "Total",
    color: "bg-slate-500/10 text-slate-500",
    icon: "📊",
  },
} as const;

export default function SeasonTypeBadge({ seasonType }: SeasonTypeBadgeProps) {
  const config = BADGE_CONFIG[seasonType as keyof typeof BADGE_CONFIG] || {
    label: seasonType.charAt(0).toUpperCase() + seasonType.slice(1),
    color: "bg-gray-500/10 text-gray-500",
    icon: "",
  };

  return (
    <span className={`px-2 py-0.5 text-xs rounded font-medium ${config.color}`}>
      {config.icon} {config.label}
    </span>
  );
}
