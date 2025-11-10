import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CalendarIcon, Upload, Plus, X, Download, Trash2 } from "lucide-react";
import { format, parse } from "date-fns";
import { cn } from "@/lib/utils";
import * as XLSX from 'xlsx';

interface EditCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  scheduleId: string;
  campaignData: any;
}

interface Participant {
  id?: string;
  name: string;
  phone: string;
  email: string;
}

export function EditCampaignModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  scheduleId,
  campaignData 
}: EditCampaignModalProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Form states
  const [campaignName, setCampaignName] = useState("");
  const [salesTarget, setSalesTarget] = useState<string>("");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [processingMode, setProcessingMode] = useState<string>("");
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [manualParticipant, setManualParticipant] = useState<Participant>({
    name: "",
    phone: "",
    email: "",
  });

  const hasLoadedParticipants = useRef(false);
  const participantsListRef = useRef<HTMLDivElement>(null);

  // Preenche os campos do formulário ao abrir com os dados da campanha
  useEffect(() => {
    if (isOpen && campaignData) {
      setCampaignName(campaignData.name);
      
      // Parse datas
      if (campaignData.startDate && campaignData.startDate !== 'N/A') {
        try {
          const parsedStart = parse(campaignData.startDate, 'dd/MM/yyyy', new Date());
          setStartDate(parsedStart);
        } catch (error) {
          console.error('Erro ao parsear data de início:', error);
        }
      }
      
      if (campaignData.endDate && campaignData.endDate !== 'N/A') {
        try {
          const parsedEnd = parse(campaignData.endDate, 'dd/MM/yyyy', new Date());
          setEndDate(parsedEnd);
        } catch (error) {
          console.error('Erro ao parsear data de término:', error);
        }
      }
    }
  }, [isOpen, campaignData]);

  // Carrega detalhes e participantes apenas uma vez por abertura do modal
  useEffect(() => {
    if (isOpen && scheduleId && !hasLoadedParticipants.current) {
      loadCampaignDetails();
      loadParticipants();
      hasLoadedParticipants.current = true;
    }
  }, [isOpen, scheduleId]);

  const loadCampaignDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('schedules')
        .select('processing_mode, sales_target')
        .eq('id', scheduleId)
        .single();

      if (error) throw error;
      
      setProcessingMode(data?.processing_mode || 'manual');
      
      // Format sales target
      if (data?.sales_target) {
        const formatted = new Intl.NumberFormat('pt-BR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }).format(data.sales_target);
        setSalesTarget(formatted);
      }
    } catch (error) {
      console.error('Erro ao carregar detalhes da campanha:', error);
    }
  };

  const loadParticipants = async () => {
    try {
      const { data, error } = await supabase
        .from('participants')
        .select('*')
        .eq('schedule_id', scheduleId)
        .eq('is_active', true);

      if (error) throw error;

      setParticipants(data.map(p => ({
        id: p.id,
        name: p.name,
        phone: p.phone,
        email: p.email || '',
      })));
    } catch (error) {
      console.error('Erro ao carregar participantes:', error);
    }
  };

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

      setParticipants((prev) => [...prev, ...parsedParticipants]);
      
      toast({
        title: "Planilha carregada",
        description: `${parsedParticipants.length} novos participantes importados.`,
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
    console.log('🔵 handleAddManualParticipant - Estado atual:', {
      participantesAtuais: participants.length,
      manualParticipant
    });

    if (!manualParticipant.name || !manualParticipant.phone || !manualParticipant.email) {
      console.log('❌ Campos vazios:', manualParticipant);
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos do participante.",
        variant: "destructive",
      });
      return;
    }

    const newParticipant = {
      name: manualParticipant.name,
      phone: manualParticipant.phone,
      email: manualParticipant.email,
    };

    console.log('✅ Adicionando novo participante:', newParticipant);
    
    setParticipants(prev => {
      const updated = [...prev, newParticipant];
      console.log('📋 Lista atualizada:', {
        antes: prev.length,
        depois: updated.length,
        novosParticipantes: updated
      });
      return updated;
    });
    
    setManualParticipant({ name: "", phone: "", email: "" });
    
    toast({
      title: "Participante adicionado",
      description: `${newParticipant.name} foi adicionado à lista.`,
    });
  };

  const handleRemoveParticipant = (index: number) => {
    setParticipants(participants.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    console.log('🔵 Iniciando handleSubmit', { campaignName, startDate, endDate, participants: participants.length });
    
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
        description: "A campanha deve ter pelo menos um participante.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log('📝 Atualizando campanha no banco...');
      
      // Parsear sales_target corretamente
      const parsedSalesTarget = salesTarget 
        ? parseFloat(salesTarget.replace(/\./g, '').replace(',', '.')) 
        : 0;
      
      console.log('💰 Sales Target:', { original: salesTarget, parsed: parsedSalesTarget });
      
      // Atualizar campanha
      const { data: updatedSchedule, error: scheduleError } = await supabase
        .from('schedules')
        .update({
          name: campaignName,
          start_date: format(startDate, 'yyyy-MM-dd'),
          end_date: format(endDate, 'yyyy-MM-dd'),
          sales_target: parsedSalesTarget,
        })
        .eq('id', scheduleId)
        .select();

      console.log('📊 Resultado update schedules:', { updatedSchedule, scheduleError });

      if (scheduleError) {
        console.error('❌ Erro ao atualizar schedule:', scheduleError);
        throw scheduleError;
      }

      console.log('👥 Gerenciando participantes...');
      
      // Desativar participantes existentes
      const { error: deactivateError } = await supabase
        .from('participants')
        .update({ is_active: false })
        .eq('schedule_id', scheduleId);

      console.log('🔄 Participantes desativados:', { deactivateError });

      if (deactivateError) {
        console.error('❌ Erro ao desativar participantes:', deactivateError);
        throw deactivateError;
      }

      // Inserir/atualizar participantes
      const participantsToInsert = participants.filter(p => !p.id);
      const participantsToUpdate = participants.filter(p => p.id);

      console.log('📋 Participantes para processar:', { 
        inserir: participantsToInsert.length, 
        atualizar: participantsToUpdate.length 
      });

      if (participantsToInsert.length > 0) {
        const insertData = participantsToInsert.map(p => ({
          schedule_id: scheduleId,
          name: p.name.trim(),
          phone: p.phone.trim(),
          email: p.email?.trim() || null,
          is_active: true,
        }));
        
        console.log('➕ Inserindo participantes:', insertData);
        
        const { data: insertedParticipants, error: insertError } = await supabase
          .from('participants')
          .insert(insertData)
          .select();

        console.log('✅ Participantes inseridos:', { insertedParticipants, insertError });

        if (insertError) {
          console.error('❌ Erro ao inserir participantes:', insertError);
          throw insertError;
        }
      }

      if (participantsToUpdate.length > 0) {
        const updateData = participantsToUpdate.map(p => ({
          id: p.id,
          schedule_id: scheduleId,
          name: p.name.trim(),
          phone: p.phone.trim(),
          email: p.email?.trim() || null,
          is_active: true,
        }));
        
        console.log('🔄 Atualizando participantes:', updateData);
        
        const { data: updatedParticipants, error: updateError } = await supabase
          .from('participants')
          .upsert(updateData)
          .select();

        console.log('✅ Participantes atualizados:', { updatedParticipants, updateError });

        if (updateError) {
          console.error('❌ Erro ao atualizar participantes:', updateError);
          throw updateError;
        }
      }
      // Notificar header para atualizar contagem (broadcast realtime)
      try {
        const channel = supabase.channel(`campaign-participants-${scheduleId}`);
        await new Promise<void>((resolve) => {
          channel.subscribe((status) => {
            if (status === 'SUBSCRIBED') resolve();
          });
        });
        await channel.send({
          type: 'broadcast',
          event: 'participants_updated',
          payload: { scheduleId }
        });
        supabase.removeChannel(channel);
      } catch (notifyErr) {
        console.warn('Aviso: não foi possível enviar broadcast de atualização de participantes', notifyErr);
      }

      console.log('✅ Campanha atualizada com sucesso!');
      
      toast({
        title: "Campanha atualizada",
        description: `Campanha "${campaignName}" atualizada com sucesso.`,
      });

      console.log('🔄 Chamando onSuccess e handleClose...');
      onSuccess();
      handleClose();
    } catch (error) {
      console.error('❌ Erro ao atualizar campanha:', error);
      toast({
        title: "Erro ao atualizar campanha",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      console.log('🏁 handleSubmit finalizado');
    }
  };

  const handleDeleteCampaign = async () => {
    setIsDeleting(true);

    try {
      // Deletar todos os registros relacionados à campanha na ordem correta
      console.log('🗑️ Iniciando exclusão da campanha:', scheduleId);

      // Buscar arquivos e IDs relacionados à campanha (usaremos para remover FKs por source_file_id)
      const { data: files } = await supabase
        .from('campaign_files')
        .select('id, file_path')
        .eq('schedule_id', scheduleId);

      const fileIds = (files ?? []).map((f) => f.id);
      const filePaths = (files ?? []).map((f) => f.file_path);
      
      // 1. Deletar histórico de comunicações
      await supabase
        .from('dispatch_history')
        .delete()
        .eq('schedule_id', scheduleId);
      
      // 2. Deletar créditos (por schedule e por arquivos caso haja)
      await supabase
        .from('credits')
        .delete()
        .eq('schedule_id', scheduleId);
      if (fileIds.length > 0) {
        await supabase
          .from('credits')
          .delete()
          .in('source_file_id', fileIds);
      }
      
      // 3. Deletar dados de vendas (por schedule e por arquivos caso haja)
      await supabase
        .from('sales_data')
        .delete()
        .eq('schedule_id', scheduleId);
      if (fileIds.length > 0) {
        await supabase
          .from('sales_data')
          .delete()
          .in('source_file_id', fileIds);
      }
      
      // 4. Deletar rankings (ANTES de campaign_files por causa da FK e também por source_file_id)
      await supabase
        .from('rankings')
        .delete()
        .eq('schedule_id', scheduleId);
      if (fileIds.length > 0) {
        await supabase
          .from('rankings')
          .delete()
          .in('source_file_id', fileIds);
      }
      
      // 5. Deletar regras da campanha
      await supabase
        .from('company_rules')
        .delete()
        .eq('schedule_id', scheduleId);
      
      // 6. Deletar participantes da campanha
      await supabase
        .from('participants')
        .delete()
        .eq('schedule_id', scheduleId);
      
      // 7. Deletar arquivos do storage (se houver)
      if (filePaths.length > 0) {
        await supabase.storage.from('campaign-files').remove(filePaths);
      }
      
      // 8. Deletar registros de arquivos
      await supabase
        .from('campaign_files')
        .delete()
        .eq('schedule_id', scheduleId);

      // 8. Deletar a campanha
      const { error } = await supabase
        .from('schedules')
        .delete()
        .eq('id', scheduleId);

      if (error) throw error;
      
      console.log('✅ Campanha excluída com sucesso');

      toast({
        title: "Campanha excluída",
        description: "A campanha foi excluída com sucesso.",
      });

      onSuccess();
      handleClose();
    } catch (error) {
      console.error('Erro ao excluir campanha:', error);
      toast({
        title: "Erro ao excluir campanha",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    setCampaignName("");
    setSalesTarget("");
    setStartDate(undefined);
    setEndDate(undefined);
    setProcessingMode("");
    setParticipants([]);
    setManualParticipant({ name: "", phone: "", email: "" });
    hasLoadedParticipants.current = false;
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Campanha</DialogTitle>
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

          {/* Tipo de Apuração - Read Only */}
          <div className="space-y-2">
            <Label>Tipo de Apuração</Label>
            <div className="border rounded-lg p-3 bg-muted/50">
              <div className="flex items-center space-x-2">
                {processingMode === 'full_auto' ? (
                  <>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                      Integração
                    </span>
                    <span className="text-sm text-muted-foreground">
                      Dados recebidos automaticamente via integração
                    </span>
                  </>
                ) : (
                  <>
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                      Planilha
                    </span>
                    <span className="text-sm text-muted-foreground">
                      Upload manual de arquivos de vendas
                    </span>
                  </>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                O tipo de apuração não pode ser alterado após a criação da campanha
              </p>
            </div>
          </div>

          {/* Participantes */}
          <div className="space-y-2">
            <Label>Participantes ({participants.length})</Label>
            
            <Tabs defaultValue="manual" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="manual">Inclusão Manual</TabsTrigger>
                <TabsTrigger value="upload">Upload de Planilha</TabsTrigger>
              </TabsList>

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
            </Tabs>

            {/* Lista de Participantes */}
            {participants.length > 0 && (
              <div ref={participantsListRef} className="border rounded-lg max-h-48 overflow-y-auto">
                <div className="divide-y">
                  {participants.map((participant, index) => {
                    console.log('🔍 Renderizando participante:', index, participant);
                    return (
                      <div key={`${participant.name}-${participant.phone}-${index}`} className="flex items-center justify-between p-3 hover:bg-muted/50">
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
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-between gap-3">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="destructive" 
                disabled={isLoading || isDeleting}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir Campanha
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação não pode ser desfeita. A campanha "{campaignName}" e todos os seus dados serão permanentemente excluídos.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleDeleteCampaign}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isDeleting ? "Excluindo..." : "Sim, excluir"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <div className="flex gap-3">
            <Button variant="outline" onClick={handleClose} disabled={isLoading || isDeleting}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={isLoading || isDeleting}>
              {isLoading ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
