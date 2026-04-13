"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import BackHome from "@/components/BackHome";

interface PageProps {
    params: { id: string };
}

export default function DeleteGamePage({ params }: PageProps) {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);
    const rawId = Array.isArray(params.id) ? params.id[0] : params.id;
    const getGameId = () => {
        const candidate = rawId ?? (typeof window !== 'undefined' ? window.location.pathname.split('/').slice(-2, -1)[0] : undefined);
        return Number(candidate);
    };

    const handleDelete = async () => {
        if (!confirm('¿Estás seguro de que quieres eliminar este juego?')) {
            return;
        }

        const gameId = getGameId();
        if (Number.isNaN(gameId)) {
            alert('ID de juego inválido');
            return;
        }

        setIsDeleting(true);
        try {
            const response = await fetch(`/api/games/${gameId}`, {
                method: 'DELETE',
                cache: 'no-store',
            });
            const result = await response.json().catch(() => null);

            if (response.ok) {
                router.push('/games');
            } else {
                alert(result?.error || 'Error al eliminar el juego');
            }
        } catch (error) {
            console.error('Error deleting game:', error);
            alert('Error al eliminar el juego');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div>
            <BackHome />
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-2xl mx-auto">
                    <div className="card bg-base-100 shadow-xl">
                        <div className="card-body">
                            <h2 className="card-title text-error">Eliminar Juego</h2>
                            <p className="text-lg">
                                ¿Estás seguro de que quieres eliminar este juego?
                            </p>

                            <div className="alert alert-warning">
                                <span>Esta acción no se puede deshacer.</span>
                            </div>

                            <div className="card-actions justify-end mt-6">
                                <button
                                    onClick={() => router.back()}
                                    className="btn btn-ghost"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className={`btn btn-error ${isDeleting ? 'loading' : ''}`}
                                    disabled={isDeleting}
                                >
                                    {isDeleting ? 'Eliminando...' : 'Eliminar Juego'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}