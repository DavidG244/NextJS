import { redirect } from "next/navigation";
import { stackServerApp } from "@/stack/server";
import GameForm from "@/components/GameForm";
import BackHome from "@/components/BackHome";

export default async function AddGamePage() {
    const user = await stackServerApp.getUser();
    if (!user) {
        redirect("/");
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto rounded-[32px] border border-base-300 bg-base-300/90 p-8 shadow-2xl shadow-black/20 backdrop-blur-xl">
                <div className="flex flex-col gap-6 mb-8">
                    <div>
                        <h1 className="text-4xl font-bold">Agregar Nuevo Juego</h1>
                        <p className="text-sm text-gray-400 mt-2">Completa la información del juego para agregarlo a la biblioteca.</p>
                    </div>
                    <div>
                    </div>
                </div>
                <GameForm
                    submitButtonText="Agregar Juego"
                />
            </div>
        </div>
    );
}