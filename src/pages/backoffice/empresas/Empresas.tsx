import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";

const Empresas = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="max-w-[1600px] mx-auto px-6 pt-24 pb-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold">Empresas</h1>
          <Link to="/backoffice/empresas/nova">
            <Button className="rounded-full">
              <Plus className="h-5 w-5 mr-2" />
              Nova Empresa
            </Button>
          </Link>
        </div>
        <Card className="p-8 rounded-3xl shadow-card">
          <p className="text-muted-foreground text-center">Lista de empresas será exibida aqui</p>
        </Card>
      </main>
    </div>
  );
};

export default Empresas;
