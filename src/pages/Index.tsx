import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Header } from "@/components/layout/Header";
import { StatsGrid } from "@/components/dashboard/StatsGrid";

const Index = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        {/* <AppSidebar /> */}

        <div className="flex-1 flex flex-col">
          {/* <Header /> */}

          <main className="flex-1 p-6 space-y-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-foreground">
                BeTogether Dashboard
              </h1>
              <p className="text-muted-foreground">
                Stay connected, stay in control — manage every part of your
                BeTogether app with ease and real-time clarity.
              </p>
            </div>

            <StatsGrid />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;
