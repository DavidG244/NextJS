import React from "react";
import { redirect } from "next/navigation";
import SideBar from "@/components/SideBar";
import { stackServerApp } from "@/stack/server";
import ConsoleManager from "@/components/ConsoleManager";

export default async function ConsolesPage() {
  const user = await stackServerApp.getUser();
  if (!user) {
    redirect("/");
  }

  return (
    <div>
      <SideBar currentPath="/consoles">
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-semibold">Administración de Consolas</h1>
            <p className="text-gray-500">Agrega, edita o elimina consolas. No se podrá eliminar una consola que tenga juegos vinculados.</p>
          </div>
          <ConsoleManager />
        </div>
      </SideBar>
    </div>
  );
}
