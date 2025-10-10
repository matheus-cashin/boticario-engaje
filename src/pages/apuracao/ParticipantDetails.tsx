import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MessageCircle, CreditCard } from "lucide-react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { InfoSidebar } from "@/components/apuracao/participant/InfoSidebar";
import { PerformanceCard } from "@/components/apuracao/participant/PerformanceCard";
import { PrizeCard } from "@/components/apuracao/participant/PrizeCard";
import { HistoryCard } from "@/components/apuracao/participant/HistoryCard";
import { SendMessageModal } from "@/components/apuracao/participant/SendMessageModal";
import { useParticipantData } from "@/hooks/useParticipantData";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export default function ParticipantDetails() {
  const { participantId } = useParams();
  const navigate = useNavigate();
  const { data: participantData, isLoading } = useParticipantData(participantId || "1");
  const { toast } = useToast();
  const [showMessageModal, setShowMessageModal] = useState(false);

  const handleSendMessage = (type: "email" | "whatsapp", message: string) => {
    toast({
      title: `Mensagem enviada via ${type === "email" ? "Email" : "WhatsApp"}!`,
      description: "A mensagem foi enviada com sucesso.",
    });
  };

  const handleProcessPayment = () => {
    toast({
      title: "Processando pagamento",
      description: "O pagamento está sendo processado...",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-4">
              <Skeleton className="h-96 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-96 w-full" />
              <div className="grid grid-cols-2 gap-6">
                <Skeleton className="h-80 w-full" />
                <Skeleton className="h-80 w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!participantData) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <button
            onClick={() => {
              if (participantData.scheduleId) {
                navigate(`/apuracao/results/${participantData.scheduleId}`);
              } else {
                navigate("/apuracao");
              }
            }}
            className="hover:text-gray-900 transition-colors"
          >
            Dashboard
          </button>
          <span>›</span>
          <span className="text-gray-900 font-medium">Participante</span>
        </div>

        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={() => {
              if (participantData.scheduleId) {
                navigate(`/apuracao/results/${participantData.scheduleId}`);
              } else {
                navigate("/apuracao");
              }
            }}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Dashboard
          </Button>
        </div>

        {/* Layout Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <InfoSidebar
              name={participantData.name}
              id={participantData.id}
              email={participantData.email}
              phone={participantData.phone}
              employeeId={participantData.employeeId}
              role={participantData.role}
              manager={participantData.manager}
              division={participantData.division}
              unit={participantData.unit}
            />
          </motion.div>

          {/* Área Principal */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <PerformanceCard
                campaignName={participantData.campaign.name}
                period={participantData.campaign.period}
                performance={participantData.performance}
                averageAchievement={participantData.averageAchievement}
                ranking={participantData.ranking}
              />
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <PrizeCard
                  level={participantData.level}
                  base={participantData.prize.base}
                  bonus={participantData.prize.bonus}
                  total={participantData.prize.total}
                  status={participantData.prize.status}
                  paidDate={participantData.prize.paidDate}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                <HistoryCard
                  history={participantData.history}
                  trend={participantData.trend}
                />
              </motion.div>
            </div>
          </div>
        </div>

        {/* Footer Ações */}
        <div className="flex items-center justify-end gap-3 pb-8">
          <Button
            variant="outline"
            onClick={() => {
              if (participantData.scheduleId) {
                navigate(`/apuracao/results/${participantData.scheduleId}`);
              } else {
                navigate("/apuracao");
              }
            }}
          >
            Voltar ao Dashboard
          </Button>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => setShowMessageModal(true)}
          >
            <MessageCircle className="h-4 w-4" />
            Enviar Mensagem
          </Button>
          {participantData.prize.status === "pending" && (
            <Button
              className="gap-2 bg-orange-600 hover:bg-orange-700"
              onClick={handleProcessPayment}
            >
              <CreditCard className="h-4 w-4" />
              Processar Pagamento
            </Button>
          )}
        </div>
      </div>

      <SendMessageModal
        open={showMessageModal}
        onClose={() => setShowMessageModal(false)}
        participantName={participantData.name}
        email={participantData.email}
        phone={participantData.phone}
        onSend={handleSendMessage}
      />
    </div>
  );
}
