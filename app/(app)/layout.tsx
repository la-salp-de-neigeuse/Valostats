import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { AppFooter } from "@/components/layout/AppFooter";
import { SidebarProvider, MobileDrawer } from "@/components/layout/MobileDrawer";
import { SearchProvider } from "@/components/search/SearchProvider";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <SidebarProvider>
      <SearchProvider>
        <div className="min-h-screen bg-[#050505] text-slate-200 flex">
          <Sidebar />
          <MobileDrawer />
          <div className="flex-1 flex flex-col min-w-0">
            <Header user={user} />
            <main id="main-content" className="flex-1 p-6 md:p-8 overflow-y-auto">
              {children}
            </main>
            <AppFooter />
          </div>
        </div>
      </SearchProvider>
    </SidebarProvider>
  );
}
