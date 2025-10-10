import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CalendarIcon, Upload, Plus, X, Download } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import * as XLSX from 'xlsx';

interface CreateCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface Participant {
  name: string;
  phone: string;
  email: string;
}

export function CreateCampaignModal({ isOpen, onClose, onSuccess }: CreateCampaignModalProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  // Form states
  const [campaignName, setCampaignName] = useState("");
  const [salesTarget, setSalesTarget] = useState<string>("");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [apurationType, setApurationType] = useState<"planilha" | "integracao">("planilha");
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [manualParticipant, setManualParticipant] = useState<Participant>({
    name: "",
    phone: "",
    email: "",
  });

  const handleDownloadTemplate = () => {
    window.open('/templates/Planilha_Padrao_Participantes.xlsx', '_blank');
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

      const parsedParticipants: Participant[] = jsonData.map((row) => ({
        name: row['Nome'] || row['nome'] || '',
        phone: String(row['Celular'] || row['celular'] || ''),
        email: row['E-mail'] || row['email'] || row['Email'] || '',
      })).filter(p => p.name && p.phone);

      setParticipants(parsedParticipants);
      
      toast({
        title: "Planilha carregada",
        description: `${parsedParticipants.length} participantes importados com sucesso.`,
      });
    } catch (error) {
      console.error('Erro ao processar planilha:', error);
      toast({
        title: "Erro ao processar planilha",
        description: "Verifique se a planilha está no formato correto.",
        variant: "destructive",
      });
    }
  };

  const handleAddManualParticipant = () => {
    if (!manualParticipant.name || !manualParticipant.phone || !manualParticipant.email) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos do participante.",
        variant: "destructive",
      });
      return;
    }

    setParticipants([...participants, manualParticipant]);
    setManualParticipant({ name: "", phone: "", email: "" });
    
    toast({
      title: "Participante adicionado",
      description: "Participante adicionado à lista com sucesso.",
    });
  };

  const handleRemoveParticipant = (index: number) => {
    setParticipants(participants.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!campaignName || !startDate || !endDate) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha nome da campanha e período.",
        variant: "destructive",
      });
      return;
    }

    if (participants.length === 0) {
      toast({
        title: "Participantes necessários",
        description: "Adicione pelo menos um participante.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log('🚀 Iniciando criação de campanha:', {
        campaignName,
        startDate: format(startDate, 'yyyy-MM-dd'),
        endDate: format(endDate, 'yyyy-MM-dd'),
        apurationType,
        processing_mode: apurationType === 'integracao' ? 'automatic' : 'manual',
        participantsCount: participants.length
      });
      
      // Criar campanha
      const { data: schedule, error: scheduleError } = await supabase
        .from('schedules')
        .insert({
          name: campaignName,
          tenant_id: 'default',
          campaign_id: `campaign_${Date.now()}`,
          start_date: format(startDate, 'yyyy-MM-dd'),
          end_date: format(endDate, 'yyyy-MM-dd'),
          status: 'pending',
          journey_type: 1,
          rule_text: 'Regra a ser definida',
          notification_types: ['whatsapp'],
          processing_mode: apurationType === 'integracao' ? 'full_auto' : 'manual',
          sales_target: salesTarget ? parseFloat(salesTarget.replace(/[^\d,]/g, '').replace(',', '.')) : 0,
        })
        .select()
        .single();

      console.log('📊 Resultado da criação do schedule:', { schedule, scheduleError });

      if (scheduleError) {
        console.error('❌ Erro ao criar schedule:', scheduleError);
        throw scheduleError;
      }

      if (!schedule) {
        console.error('❌ Schedule não retornou dados');
        throw new Error('Erro ao criar campanha: dados não retornados');
      }

      console.log('✅ Schedule criado com sucesso:', schedule.id);

      // Criar participantes
      const participantsData = participants.map(p => ({
        schedule_id: schedule.id,
        name: p.name,
        phone: p.phone,
        email: p.email,
        is_active: true,
      }));

      console.log('👥 Criando participantes:', participantsData.length);

      const { error: participantsError } = await supabase
        .from('participants')
        .insert(participantsData);

      if (participantsError) {
        console.error('❌ Erro ao criar participantes:', participantsError);
        throw participantsError;
      }

      console.log('✅ Participantes criados com sucesso');

      toast({
        title: "Campanha criada",
        description: `Campanha "${campaignName}" criada com ${participants.length} participantes.`,
      });

      onSuccess();
      handleClose();
    } catch (error) {
      console.error('❌ Erro geral ao criar campanha:', error);
      console.error('Detalhes do erro:', {
        message: error instanceof Error ? error.message : 'Erro desconhecido',
        details: error instanceof Error && 'details' in error ? (error as any).details : null,
        hint: error instanceof Error && 'hint' in error ? (error as any).hint : null,
        code: error instanceof Error && 'code' in error ? (error as any).code : null,
      });
      
      toast({
        title: "Erro ao criar campanha",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setCampaignName("");
    setSalesTarget("");
    setStartDate(undefined);
    setEndDate(undefined);
    setApurationType("planilha");
    setParticipants([]);
    setManualParticipant({ name: "", phone: "", email: "" });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Campanha</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Nome da Campanha */}
          <div className="space-y-2">
            <Label htmlFor="campaign-name">Nome da Campanha *</Label>
            <Input
              id="campaign-name"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              placeholder="Digite o nome da campanha"
            />
          </div>

          {/* Meta de Vendas */}
          <div className="space-y-2">
            <Label htmlFor="sales-target">Meta de Vendas Total (R$)</Label>
            <Input
              id="sales-target"
              type="text"
              value={salesTarget}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                const formatted = value ? new Intl.NumberFormat('pt-BR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                }).format(parseFloat(value) / 100) : '';
                setSalesTarget(formatted);
              }}
              placeholder="0,00"
            />
            <p className="text-xs text-muted-foreground">
              Meta total de vendas para toda a campanha
            </p>
          </div>

          {/* Período */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data de Início *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "dd/MM/yyyy") : "Selecione"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Data de Término *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "dd/MM/yyyy") : "Selecione"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                    disabled={(date) => startDate ? date < startDate : false}
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Tipo de Apuração */}
          <div className="space-y-2">
            <Label>Tipo de Apuração *</Label>
            <RadioGroup value={apurationType} onValueChange={(value: "planilha" | "integracao") => setApurationType(value)}>
              <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value="planilha" id="planilha" />
                <Label htmlFor="planilha" className="flex-1 cursor-pointer">
                  <div className="font-medium">Planilha</div>
                  <div className="text-xs text-muted-foreground">Upload manual de arquivos de vendas</div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value="integracao" id="integracao" />
                <Label htmlFor="integracao" className="flex-1 cursor-pointer">
                  <div className="font-medium">Integração</div>
                  <div className="text-xs text-muted-foreground">Dados recebidos automaticamente via integração</div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Participantes */}
          <div className="space-y-2">
            <Label>Participantes ({participants.length})</Label>
            
            <Tabs defaultValue="upload" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upload">Upload de Planilha</TabsTrigger>
                <TabsTrigger value="manual">Inclusão Manual</TabsTrigger>
              </TabsList>

              <TabsContent value="upload" className="space-y-4">
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground mb-4">
                    Faça upload da planilha com os participantes
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDownloadTemplate}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Baixar Template
                    </Button>
                    <label htmlFor="file-upload">
                      <Button variant="default" size="sm" asChild>
                        <span>
                          <Upload className="mr-2 h-4 w-4" />
                          Selecionar Arquivo
                        </span>
                      </Button>
                    </label>
                    <input
                      id="file-upload"
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="manual" className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  <Input
                    placeholder="Nome completo"
                    value={manualParticipant.name}
                    onChange={(e) => setManualParticipant({ ...manualParticipant, name: e.target.value })}
                  />
                  <Input
                    placeholder="Celular (com DDD)"
                    value={manualParticipant.phone}
                    onChange={(e) => setManualParticipant({ ...manualParticipant, phone: e.target.value })}
                  />
                  <Input
                    placeholder="E-mail"
                    type="email"
                    value={manualParticipant.email}
                    onChange={(e) => setManualParticipant({ ...manualParticipant, email: e.target.value })}
                  />
                  <Button onClick={handleAddManualParticipant} className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar Participante
                  </Button>
                </div>
              </TabsContent>
            </Tabs>

            {/* Lista de Participantes */}
            {participants.length > 0 && (
              <div className="border rounded-lg max-h-48 overflow-y-auto">
                <div className="divide-y">
                  {participants.map((participant, index) => (
                    <div key={index} className="flex items-center justify-between p-3 hover:bg-muted/50">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{participant.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {participant.phone} • {participant.email}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveParticipant(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Criando..." : "Criar Campanha"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
