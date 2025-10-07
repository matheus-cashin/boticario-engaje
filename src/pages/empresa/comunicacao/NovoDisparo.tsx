import Navigation from "@/components/Navigation";
import { Card } from "@/components/ui/card";

const NovoDisparo = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="max-w-[1600px] mx-auto px-6 pt-24 pb-12">
        <h1 className="text-4xl font-bold mb-8">Novo Disparo</h1>
        <Card className="p-8 rounded-3xl shadow-card">
          <p className="text-muted-foreground text-center">Formulário de novo disparo será exibido aqui</p>
        </Card>
      </main>
    </div>
  );
};

export default NovoDisparo;
