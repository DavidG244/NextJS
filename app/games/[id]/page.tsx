import { notFound, redirect } from "next/navigation";
import { stackServerApp } from "@/stack/server";
import { PrismaClient } from "@/app/generated/prisma";
import { PrismaNeon } from "@prisma/adapter-neon";
import GameShow from "@/components/GameShow";

export const dynamic = "force-dynamic";

const prisma = new PrismaClient({
    adapter: new PrismaNeon({
        connectionString: process.env.DATABASE_URL!,
    }),
});

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function GameShowPage({ params }: PageProps) {
    const user = await stackServerApp.getUser();
    if (!user) {
        redirect("/");
    }

    const { id } = await params;
    const gameId = parseInt(id);

    if (isNaN(gameId)) {
        notFound();
    }

    const game = await prisma.game.findUnique({
        where: { id: gameId },
        include: {
            console: true,
        },
    });

    if (!game) {
        notFound();
    }

    return (
        <div className="container mx-auto px-4 py-8">
                <GameShow game={game} />
            </div>
    );
}