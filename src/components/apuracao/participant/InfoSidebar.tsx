import { Copy, Phone, Mail, User, Building, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface InfoSidebarProps {
  name: string;
  id: string;
  email: string;
  phone: string;
  employeeId: string;
  role: string;
  manager: string;
  division: string;
  unit: string;
}

export function InfoSidebar({
  name,
  id,
  email,
  phone,
  employeeId,
  role,
  manager,
  division,
  unit,
}: InfoSidebarProps) {
  const { toast } = useToast();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .slice(0, 2)
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(email);
    toast({ title: "Email copiado!" });
  };

  const handleWhatsApp = () => {
    const cleanPhone = phone.replace(/\D/g, "");
    window.open(`https://wa.me/${cleanPhone}`, "_blank");
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Informações Básicas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-3xl mb-3">
              {getInitials(name)}
            </div>
            <h3 className="text-xl font-bold text-gray-900">{name}</h3>
            <p className="text-sm text-gray-600">ID: {id}</p>
          </div>

          <div className="space-y-3 pt-3 border-t">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-1">
                <Mail className="h-4 w-4 text-gray-600" />
                <span className="text-sm text-gray-900 truncate">{email}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyEmail}
                className="flex-shrink-0"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-1">
                <Phone className="h-4 w-4 text-gray-600" />
                <span className="text-sm text-gray-900">{phone}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleWhatsApp}
                className="flex-shrink-0 text-green-600"
              >
                <Phone className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Building className="h-4 w-4 text-gray-600" />
              <span className="text-sm text-gray-900">{employeeId}</span>
            </div>

            <div>
              <Badge className="bg-blue-100 text-blue-800">{role}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Hierarquia
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-600" />
              <div>
                <p className="text-xs text-gray-600">Gerente</p>
                <p className="font-semibold text-gray-900">{manager}</p>
              </div>
            </div>

            <div className="ml-4 border-l-2 border-blue-300 pl-4 space-y-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-xs text-gray-600">Participante</p>
                  <p className="font-semibold text-blue-600">{name}</p>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t space-y-2">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-600" />
                <div>
                  <p className="text-xs text-gray-600">Divisional</p>
                  <p className="font-semibold text-gray-900">{division}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-gray-600" />
                <div>
                  <p className="text-xs text-gray-600">Unidade</p>
                  <p className="font-semibold text-gray-900">{unit}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
