import { useState } from "react";
import { Mail, MessageCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

interface SendMessageModalProps {
  open: boolean;
  onClose: () => void;
  participantName: string;
  email: string;
  phone: string;
  onSend: (type: "email" | "whatsapp", message: string) => void;
}

const emailTemplates = {
  congratulations: {
    name: "Parabéns pela Meta",
    content: `Olá {{name}},

Parabéns por atingir suas metas na campanha {{campaign}}!

Sua performance de {{performance}}% foi excepcional.

Prêmio: R$ {{prize}}

Continue assim!

Equipe de Incentivos`,
  },
  reminder: {
    name: "Lembrete de Performance",
    content: `Olá {{name}},

Este é um lembrete sobre sua performance na campanha {{campaign}}.

Faltam {{days}} dias para o fechamento.

Atual: {{performance}}%
Meta: 100%

Vamos juntos!`,
  },
};

const whatsappTemplates = {
  congratulations: {
    name: "Parabéns - WhatsApp",
    content: `🎉 Parabéns *{{name}}*!

Você atingiu *{{performance}}%* na campanha {{campaign}}!

💰 Prêmio: R$ {{prize}}

Continue esse ritmo! 🚀`,
  },
  reminder: {
    name: "Lembrete - WhatsApp",
    content: `📊 Olá *{{name}}*!

Sua performance atual: *{{performance}}%*

Faltam *{{days}} dias* para fechar a campanha {{campaign}}.

Vamos lá! 💪`,
  },
};

export function SendMessageModal({
  open,
  onClose,
  participantName,
  email,
  phone,
  onSend,
}: SendMessageModalProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>("congratulations");
  const [customMessage, setCustomMessage] = useState("");
  const [activeTab, setActiveTab] = useState<"email" | "whatsapp">("email");

  const fillTemplate = (template: string) => {
    return template
      .replace(/\{\{name\}\}/g, participantName)
      .replace(/\{\{campaign\}\}/g, "GOL DE OURO")
      .replace(/\{\{performance\}\}/g, "169.3")
      .replace(/\{\{prize\}\}/g, "2.320")
      .replace(/\{\{days\}\}/g, "5");
  };

  const getCurrentTemplate = () => {
    const templates = activeTab === "email" ? emailTemplates : whatsappTemplates;
    return templates[selectedTemplate as keyof typeof templates];
  };

  const handleSend = () => {
    const message = customMessage || fillTemplate(getCurrentTemplate().content);
    onSend(activeTab, message);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-white">
        <DialogHeader>
          <DialogTitle>Enviar Mensagem</DialogTitle>
          <DialogDescription>
            Envie uma mensagem para {participantName}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="email" className="gap-2">
              <Mail className="h-4 w-4" />
              Email
            </TabsTrigger>
            <TabsTrigger value="whatsapp" className="gap-2">
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </TabsTrigger>
          </TabsList>

          <TabsContent value="email" className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Template</label>
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white z-50">
                  {Object.entries(emailTemplates).map(([key, template]) => (
                    <SelectItem key={key} value={key}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Card className="bg-gray-50">
              <CardContent className="p-4">
                <p className="text-xs text-gray-600 mb-2">Preview</p>
                <pre className="text-sm text-gray-900 whitespace-pre-wrap font-sans">
                  {fillTemplate(getCurrentTemplate().content)}
                </pre>
              </CardContent>
            </Card>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Personalizar (opcional)
              </label>
              <Textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Digite sua mensagem personalizada..."
                rows={6}
              />
            </div>

            <p className="text-xs text-gray-600">
              Para: {email}
            </p>
          </TabsContent>

          <TabsContent value="whatsapp" className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Template</label>
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white z-50">
                  {Object.entries(whatsappTemplates).map(([key, template]) => (
                    <SelectItem key={key} value={key}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <p className="text-xs text-gray-600 mb-2">Preview</p>
                <pre className="text-sm text-gray-900 whitespace-pre-wrap font-sans">
                  {fillTemplate(getCurrentTemplate().content)}
                </pre>
              </CardContent>
            </Card>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Personalizar (opcional)
              </label>
              <Textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Digite sua mensagem personalizada..."
                rows={6}
              />
            </div>

            <p className="text-xs text-gray-600">
              Para: {phone}
            </p>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSend}>
            Enviar {activeTab === "email" ? "Email" : "WhatsApp"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
