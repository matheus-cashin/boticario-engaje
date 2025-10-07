import { Home, TrendingUp, BookOpen, FileText, Package, Archive, Users, Search, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Navigation = () => {
  const navItems = [
    { name: "Home", active: true },
    { name: "Sell" },
    { name: "Sales Ledger" },
    { name: "Reporting" },
    { name: "Catalog" },
    { name: "Inventory" },
    { name: "Customers" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 bg-card border-b border-border z-50 shadow-soft">
      <div className="max-w-[1600px] mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-primary-foreground rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-primary-foreground rounded-full" />
                </div>
              </div>
              <span className="font-bold text-xl">BOTICÁRIO</span>
            </div>
            
            <div className="hidden lg:flex items-center gap-2">
              {navItems.map((item) => (
                <Button
                  key={item.name}
                  variant={item.active ? "default" : "ghost"}
                  className={item.active ? "rounded-full" : "rounded-full text-muted-foreground"}
                  size="sm"
                >
                  {item.name}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Search className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Bell className="h-5 w-5" />
            </Button>
            <Avatar className="h-9 w-9">
              <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Balan" />
              <AvatarFallback>BA</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
