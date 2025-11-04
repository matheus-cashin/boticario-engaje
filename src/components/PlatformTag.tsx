
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
      className: "bg-cashin-green/10 text-cashin-green border-cashin-green/20",
    },
    email: {
      label: "Email",
      icon: Mail,
      className: "bg-primary/10 text-primary border-primary/20",
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
