import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DollarSign } from "lucide-react";
import cashinLogo from "@/assets/cashin-logo.svg";

interface Participant {
  id: string;
  name: string;
  phone: string;
  email: string;
  pixKey: string;
  prize: number;
}

interface PaymentProcessingModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignName: string;
}

const mockParticipants: Participant[] = [
  {
    id: "1",
    name: "Matheus Silva",
    phone: "(11) 98765-4321",
    email: "matheus@email.com",
    pixKey: "matheus.silva@email.com",
    prize: 1250.00
  },
  {
    id: "2",
    name: "Ana Santos",
    phone: "(11) 97654-3210",
    email: "ana@email.com",
    pixKey: "11976543210",
    prize: 980.50
  },
  {
    id: "3",
    name: "Carlos Oliveira",
    phone: "(11) 96543-2109",
    email: "carlos@email.com",
    pixKey: "12345678901",
    prize: 750.00
  },
  {
    id: "4",
    name: "Juliana Costa",
    phone: "(11) 95432-1098",
    email: "juliana@email.com",
    pixKey: "juliana.costa@email.com",
    prize: 620.00
  },
  {
    id: "5",
    name: "Roberto Alves",
    phone: "(11) 94321-0987",
    email: "roberto@email.com",
    pixKey: "11943210987",
    prize: 450.00
  }
];

export const PaymentProcessingModal = ({ isOpen, onClose, campaignName }: PaymentProcessingModalProps) => {
  const totalPrize = mockParticipants.reduce((sum, p) => sum + p.prize, 0);
  const walletCashins = 15000;
  const walletReais = 8500.00;

  const handlePayWithReais = () => {
    console.log("Processing payment with Reais");
  };

  const handlePayWithCashins = () => {
    console.log("Processing payment with Cashins");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Processar Pagamentos - {campaignName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Participants Table */}
          <div className="rounded-lg border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Nome</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Telefone</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Email</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Chave PIX</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold bg-primary/10">Prêmio</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {mockParticipants.map((participant) => (
                    <tr key={participant.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium">{participant.name}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{participant.phone}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{participant.email}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground font-mono text-xs">
                        {participant.pixKey}
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-bold bg-primary/5">
                        R$ {participant.prize.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-primary/10 font-bold">
                    <td colSpan={4} className="px-4 py-3 text-sm text-right">Total a Pagar:</td>
                    <td className="px-4 py-3 text-right text-base">
                      R$ {totalPrize.toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Wallet Balances */}
          <div className="bg-muted/50 rounded-lg p-6 border border-border">
            <h3 className="text-lg font-semibold mb-4">Saldos da Carteira</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-background rounded-lg p-4 border border-border">
                <div className="text-sm text-muted-foreground mb-1">Cashins</div>
                <div className="text-2xl font-bold text-[#A500B9]">
                  {walletCashins.toLocaleString('pt-BR')} Cashins
                </div>
              </div>
              <div className="bg-background rounded-lg p-4 border border-border">
                <div className="text-sm text-muted-foreground mb-1">Reais</div>
                <div className="text-2xl font-bold text-emerald-600">
                  R$ {walletReais.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          </div>

          {/* Payment Buttons */}
          <div className="flex gap-4 justify-end pt-4 border-t border-border">
            <Button
              onClick={handlePayWithReais}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-6 text-lg font-semibold"
              size="lg"
            >
              <DollarSign className="w-6 h-6 mr-2" />
              Pagar com Reais
            </Button>
            <Button
              onClick={handlePayWithCashins}
              className="bg-[#A500B9] hover:bg-[#8A009A] text-white px-8 py-6 text-lg font-semibold"
              size="lg"
            >
              Pagar com
              <img src={cashinLogo} alt="Cashin" className="w-24 h-6 ml-2 brightness-0 invert" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
