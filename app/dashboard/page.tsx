import { PrismaClient } from "@/app/generated/prisma";
import { PrismaNeon } from "@prisma/adapter-neon";
import { stackServerApp } from "@/stack/server";
import { redirect } from "next/navigation";
import SideBar from "@/components/SideBar";
import DashboardCharts from "@/components/DashboardCharts";

const prisma = new PrismaClient({
    adapter: new PrismaNeon({
        connectionString: process.env.DATABASE_URL!,
    }),
});

export default async function DashboardsPage(
    {
        children
    }: {
        children: React.ReactNode;
    }) {
    const user = await stackServerApp.getUser();
    if (!user) {
        redirect("/");
    }

    const games = await prisma.game.findMany({
        include: {
            console: true,
        },
        orderBy: {
            title: "asc",
        },
    });

    const chartGames = games.map((game) => ({
        id: game.id,
        title: game.title,
        console: {
            name: game.console?.name ?? "Sin consola",
        },
        releaseDate: game.releaseDate.toISOString(),
    }));

    return (
        <div>
            <SideBar currentPath="/dashboard">
                <div className="space-y-8">
                    <div>
                        <h1 className="text-4xl font-semibold">Dashboard</h1>
                        <p className="text-gray-500">Resumen visual de tus juegos por consola y por año de lanzamiento.</p>
                    </div>
                    <DashboardCharts games={chartGames} />
                    {children}
                </div>
            </SideBar>
        </div>
    )
}