import { User } from "lucide-react";

interface UserMessageProps {
  content: string;
}

export default function UserMessage({ content }: UserMessageProps) {
  return (
    <div className="flex gap-3 w-full py-3 flex-row-reverse justify-start">
      {/* Avatar */}
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center ring-1 ring-border">
        <User className="w-4 h-4 text-white" />
      </div>

      {/* Content */}
      <div className="max-w-[80%] rounded-lg px-4 py-3 bg-primary text-primary-foreground">
        <p className="text-sm whitespace-pre-wrap break-words">{content}</p>
      </div>
    </div>
  );
}
