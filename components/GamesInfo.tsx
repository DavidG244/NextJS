export const dynamic = "force-dynamic";

import { PrismaClient } from "@/app/generated/prisma";
import { PrismaNeon } from "@prisma/adapter-neon";
import GamesTable from "./GamesTable";

const prisma = new PrismaClient({
    adapter: new PrismaNeon({
        connectionString: process.env.DATABASE_URL!,
    }),
});

export default async function GamesInfo() {
    const games = await prisma.game.findMany({
        include: {
            console: true,
        },
        orderBy: {
            title: 'asc'
        }
    });

    return (
        <div>
            <h1 className="text-4xl border-b-2 pb-2 mb-8">Games</h1>
            <GamesTable initialGames={games} />
        </div>
    );
}