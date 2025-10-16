import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, MessageSquare, Zap, Heart, Trophy, Gift, Plus } from "lucide-react";

interface CommunicationRulerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const timelineMessages = [
  {
    id: 1,
    icon: Sparkles,
    title: "Boas-vindas",
    subtitle: "Primeira impressão",
    color: "text-[#A500B9]"
  },
  {
    id: 2,
    icon: MessageSquare,
    title: "Dicas para discurso",
    subtitle: "Orientações práticas",
    color: "text-[#A500B9]"
  },
  {
    id: 3,
    icon: Zap,
    title: "Motivacional",
    subtitle: "Engajamento",
    color: "text-[#A500B9]"
  },
  {
    id: 4,
    icon: Heart,
    title: "Obrigado por participar",
    subtitle: "Agradecimento",
    color: "text-[#A500B9]"
  }
];

const adHocMessages = [
  {
    icon: Trophy,
    title: "Ranking",
    color: "text-[#A500B9]"
  },
  {
    icon: Gift,
    title: "Distribuição de prêmio",
    color: "text-[#A500B9]"
  }
];

export function CommunicationRulerModal({ isOpen, onClose }: CommunicationRulerModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Régua de Comunicação</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Timeline de Mensagens */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-4">Timeline de Mensagens</h3>
            <div className="relative pl-8 space-y-4">
              {/* Vertical line */}
              <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-[#A500B9]/30" />
              
              {timelineMessages.map((message, index) => {
                const Icon = message.icon;
                return (
                  <div key={message.id} className="relative">
                    {/* Icon circle */}
                    <div className="absolute -left-8 top-3 w-10 h-10 rounded-full bg-background border-2 border-[#A500B9] flex items-center justify-center">
                      <Icon className={`w-5 h-5 ${message.color}`} />
                    </div>
                    
                    {/* Message card */}
                    <div className="bg-background border border-border rounded-lg p-4 hover:border-[#A500B9]/50 transition-colors cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{message.title}</h4>
                          <p className="text-sm text-muted-foreground">{message.subtitle}</p>
                        </div>
                        <span className="text-xs text-muted-foreground">#{message.id}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mensagens Avulsas */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-4">Mensagens Avulsas</h3>
            <div className="grid grid-cols-2 gap-4">
              {adHocMessages.map((message, index) => {
                const Icon = message.icon;
                return (
                  <div 
                    key={index}
                    className="bg-background border border-border rounded-lg p-4 hover:border-[#A500B9]/50 transition-colors cursor-pointer flex items-center gap-3"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#A500B9]/10 flex items-center justify-center">
                      <Icon className={`w-5 h-5 ${message.color}`} />
                    </div>
                    <span className="font-medium">{message.title}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cadastrar Mensagem Personalizada */}
          <Button 
            variant="outline" 
            className="w-full gap-2 hover:border-[#A500B9]/50"
          >
            <Plus className="w-4 h-4" />
            Cadastrar Mensagem Personalizada
          </Button>

          {/* Footer link */}
          <p className="text-xs text-center text-muted-foreground">
            Deseja solicitar alterações nas mensagens?{" "}
            <button className="text-[#A500B9] hover:underline">
              Clique aqui
            </button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
