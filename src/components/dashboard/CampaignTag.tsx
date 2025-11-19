import { Link } from "react-router-dom";
import { Hash } from "lucide-react";

interface CampaignTagProps {
  name: string;
  campaignId?: string;
}

export function CampaignTag({ name, campaignId }: CampaignTagProps) {
  const href = campaignId ? `/reports/${campaignId}` : "/campaigns";

  const handleClick = () => {
    // Scroll para o topo ao navegar
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Link
      to={href}
      onClick={handleClick}
      className="inline-flex items-center gap-1 px-2 py-0.5 mx-0.5 rounded-md bg-primary/15 hover:bg-primary/25 text-primary font-medium transition-colors duration-200 no-underline group"
    >
      <Hash className="w-3 h-3 opacity-70 group-hover:opacity-100 transition-opacity" />
      <span className="text-sm">{name}</span>
    </Link>
  );
}
