
import { Badge } from "@/components/ui/badge";
import { Mail, MessageCircle } from "lucide-react";

interface PlatformTagProps {
  platform: "whatsapp" | "email";
}

export function PlatformTag({ platform }: PlatformTagProps) {
  const config = {
    whatsapp: {
      label: "WhatsApp",
      icon: MessageCircle,
      className: "bg-green-100 text-green-800 border-green-200",
    },
    email: {
      label: "Email",
      icon: Mail,
      className: "bg-blue-100 text-blue-800 border-blue-200",
    },
  };

  // Garantir que platform é válido, com fallback para "email"
  const validPlatform = (platform && config[platform]) ? platform : "email";
  const { label, icon: Icon, className } = config[validPlatform];

  return (
    <Badge variant="outline" className={className}>
      <Icon className="w-3 h-3 mr-1" />
      {label}
    </Badge>
  );
}
