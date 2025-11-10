import { useState } from "react";
import { getPlayerInitials, getInitialsColor } from "@/utils/playerHelpers";
import { cn } from "@/lib/utils";

interface PlayerAvatarProps {
  fullName: string;
  photoUrl?: string;
  leagueLogoUrl?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-12 w-12 text-sm",
  lg: "h-16 w-16 text-lg",
  xl: "h-24 w-24 text-2xl",
};

export const PlayerAvatar = ({
  fullName,
  photoUrl,
  leagueLogoUrl,
  size = "md",
  className,
}: PlayerAvatarProps) => {
  const [imageError, setImageError] = useState(false);
  const [leagueLogoError, setLeagueLogoError] = useState(false);
  const initials = getPlayerInitials(fullName);
  const bgColor = getInitialsColor(fullName);

  // Priority: leagueLogoUrl > photoUrl > initials
  const shouldShowLeagueLogo = leagueLogoUrl && !leagueLogoError;
  const shouldShowPhoto = !shouldShowLeagueLogo && photoUrl && !imageError;
  const shouldShowInitials = !shouldShowLeagueLogo && !shouldShowPhoto;

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full font-semibold text-white",
        sizeClasses[size],
        shouldShowInitials && bgColor,
        className,
      )}
    >
      {shouldShowInitials ? (
        <span>{initials}</span>
      ) : shouldShowLeagueLogo ? (
        <img
          src={leagueLogoUrl}
          alt="League logo"
          className="h-full w-full rounded-full object-cover"
          onError={() => setLeagueLogoError(true)}
        />
      ) : (
        <img
          src={photoUrl}
          alt={fullName}
          className="h-full w-full rounded-full object-cover"
          onError={() => setImageError(true)}
        />
      )}
    </div>
  );
};
