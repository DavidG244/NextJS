import { notFound, redirect } from "next/navigation";
import { stackServerApp } from "@/stack/server";
import { PrismaClient } from "@/app/generated/prisma";
import { PrismaNeon } from "@prisma/adapter-neon";
import GameForm from "@/components/GameForm";
import BackHome from "@/components/BackHome";

const prisma = new PrismaClient({
    adapter: new PrismaNeon({
        connectionString: process.env.DATABASE_URL!,
    }),
});

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function EditGamePage({ params }: PageProps) {
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

    const initialData = {
        title: game.title,
        cover: game.cover || "",
        developer: game.developer,
        releaseDate: game.releaseDate.toISOString().split('T')[0], // Formato YYYY-MM-DD
        price: game.price.toString(),
        genre: game.genre,
        description: game.description,
        console_id: game.console_id,
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto rounded-[32px] border border-base-300 bg-base-300/90 p-8 shadow-2xl shadow-black/20 backdrop-blur-xl">
                <div className="flex flex-col gap-6 mb-8">
                    <div>
                        <h1 className="text-4xl font-bold">Editar: {game.title}</h1>
                        <p className="text-sm text-gray-400 mt-2">Actualiza los datos del juego y guarda los cambios.</p>
                    </div>
                    <div>
                        
                    </div>
                </div>
                <GameForm
                    initialData={initialData}
                    submitButtonText="Actualizar Juego"
                    gameId={gameId}
                />
            </div>
        </div>
    );
}