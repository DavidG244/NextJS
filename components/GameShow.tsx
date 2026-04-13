"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PencilIcon, ArrowLeftIcon } from "@phosphor-icons/react";

interface Game {
    id: number;
    title: string;
    cover: string | null;
    developer: string;
    releaseDate: Date;
    price: number;
    genre: string;
    description: string;
    console_id: number;
    console: {
        id: number;
        name: string;
        image: string;
        releaseDate: Date;
        manufacturer: string;
        description: string;
    };
}

interface GameShowProps {
    game: Game;
}

export default function GameShow({ game }: GameShowProps) {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);

    const getCoverSrc = (cover: string | null) => {
        const defaultImg = "/imgs/No_image_available.svg";

        if (!cover || typeof cover !== "string" || cover.trim() === "") {
            return defaultImg;
        }

        const trimmed = cover.trim();

        if (/^(http|https):\/\//i.test(trimmed)) {
            return trimmed;
        }

        if (trimmed.startsWith("/")) {
            return trimmed;
        }

        return `/${trimmed.replace(/^\/+/, "")}`;
    };

    const [imageSrc, setImageSrc] = useState(getCoverSrc(game.cover));

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString("es-ES", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        });
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("es-ES", {
            style: "currency",
            currency: "EUR",
        }).format(price);
    };

    const handleEdit = () => {
        router.push(`/games/${game.id}/edit`);
    };

    return (
        <div className="max-w-5xl mx-auto p-6">
            <div className="rounded-[32px] border border-base-300 bg-base-300/90 p-8 shadow-2xl shadow-black/20 backdrop-blur-xl">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-8">
                    <div>
                        <button
                            onClick={() => router.back()}
                            className="btn btn-ghost btn-circle mb-3 lg:mb-0"
                            title="Volver"
                        >
                            <ArrowLeftIcon size={24} />
                        </button>
                        <h1 className="text-3xl font-bold text-white">{game.title}</h1>
                    </div>
                    <div className="text-sm text-gray-300">
                        <p className="font-medium">Detalles del juego</p>
                        <p className="text-gray-400">Ver y administrar la información del juego seleccionado.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-[320px_minmax(0,1fr)]">
                    {/* Carátula */}
                    <div className="overflow-hidden rounded-[32px] border border-base-200 bg-base-200 shadow-xl aspect-[4/5]">
                        <img
                            src={imageSrc}
                            alt={`Carátula de ${game.title}`}
                            className="w-full h-full object-cover"
                            onError={() => setImageSrc("/imgs/No_image_available.svg")}
                        />
                    </div>

                    {/* Información del juego */}
                    <div className="space-y-6 text-white">
                        <div className="space-y-3 rounded-3xl border border-base-200 bg-base-200 p-6 shadow-sm">
                            <h2 className="text-xl font-semibold text-white">Información del Juego</h2>
                            <div className="space-y-2 text-sm text-slate-300">
                                <p><span className="font-semibold text-slate-100">Desarrollador:</span> {game.developer}</p>
                                <p><span className="font-semibold text-slate-100">Consola:</span> {game.console.name}</p>
                                <p><span className="font-semibold text-slate-100">Género:</span> {game.genre}</p>
                                <p><span className="font-semibold text-slate-100">Fecha de lanzamiento:</span> {formatDate(game.releaseDate)}</p>
                                <p><span className="font-semibold text-slate-100">Precio:</span> {formatPrice(game.price)}</p>
                            </div>
                        </div>

                        <div className="rounded-3xl border border-base-200 bg-base-200 p-6 shadow-sm">
                            <h3 className="text-lg font-semibold mb-2 text-white">Descripción</h3>
                            <p className="text-slate-300">{game.description}</p>
                        </div>

                        <div className="rounded-3xl border border-base-200 bg-base-200 p-6 shadow-sm">
                            <h3 className="text-lg font-semibold mb-2 text-white">Información de la Consola</h3>
                            <div className="space-y-2 text-sm text-slate-300">
                                <p><span className="font-semibold text-slate-100">Nombre:</span> {game.console.name}</p>
                                <p><span className="font-semibold text-slate-100">Fabricante:</span> {game.console.manufacturer}</p>
                                <p><span className="font-semibold text-slate-100">Lanzamiento:</span> {formatDate(game.console.releaseDate)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Acciones */}
                <div className="flex flex-wrap gap-4 mt-8 justify-end">
                    <Link href="/" className="btn btn-outline gap-2">
                        <ArrowLeftIcon size={20} />
                        Volver al inicio
                    </Link>
                    <button
                        onClick={handleEdit}
                        className="btn btn-primary gap-2"
                    >
                        <PencilIcon size={20} />
                        Editar
                    </button>
                </div>
            </div>
        </div>
    );
}