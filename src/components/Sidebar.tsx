
import { Calendar, BarChart3, FileText, Home } from "lucide-react";
import { useLocation, Link } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";
import cashinLogo from "@/assets/cashin-logo.svg";

const menuItems = [
  {
    title: "Início",
    icon: Home,
    url: "/",
  },
  {
    title: "Campanhas",
    icon: Calendar,
    url: "/campaigns",
  },
  {
    title: "Apuração",
    icon: BarChart3,
    url: "/apuracao",
  },
  {
    title: "Relatórios",
    icon: FileText,
    url: "/reports",
  },
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center justify-center py-6 px-4">
          <img 
            src={cashinLogo} 
            alt="Cashin" 
            className="h-8 w-auto"
          />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = location.pathname === item.url;
                
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link to={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
