"use client";
import { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PencilIcon, TrashIcon, EyeIcon } from "@phosphor-icons/react";

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

const ITEMS_PER_PAGE = 12;

export default function GamesTable({ initialGames }: { initialGames: Game[] }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedConsole, setSelectedConsole] = useState("");
    const router = useRouter();
    const searchParams = useSearchParams();

    const pageFromQuery = Number(searchParams.get("page") ?? "1");
    const currentPage = Number.isNaN(pageFromQuery) || pageFromQuery < 1 ? 1 : Math.floor(pageFromQuery);

    const consoleOptions = useMemo(() => {
        const uniqueConsoles = Array.from(
            new Set(initialGames.map((game) => game.console.name))
        );
        return uniqueConsoles.sort((a, b) => a.localeCompare(b));
    }, [initialGames]);

    const CONSOLE_COLORS = [
        "#6366f1",
        "#ec4899",
        "#f59e0b",
        "#22c55e",
        "#14b8a6",
        "#f97316",
        "#8b5cf6",
        "#0ea5e9",
    ];

    const consoleColorMap = useMemo(() => {
        return consoleOptions.reduce<Record<string, string>>((map, name, index) => {
            map[name] = CONSOLE_COLORS[index % CONSOLE_COLORS.length];
            return map;
        }, {});
    }, [consoleOptions]);

    const getConsoleLabelStyle = (consoleName: string) => {
        const color = consoleColorMap[consoleName] ?? "#6366f1";
        return {
            backgroundColor: color,
            borderColor: color,
            color: "#ffffff",
        };
    };

    // Filtrar juegos basado en la búsqueda y la consola seleccionada
    const filteredGames = useMemo(() => {
        return initialGames.filter((game) => {
            if (selectedConsole && game.console.name !== selectedConsole) {
                return false;
            }

            const term = searchTerm.toLowerCase();
            return (
                game.title.toLowerCase().includes(term) ||
                game.developer.toLowerCase().includes(term) ||
                game.genre.toLowerCase().includes(term) ||
                game.console.name.toLowerCase().includes(term)
            );
        });
    }, [searchTerm, selectedConsole, initialGames]);

    // Calcular paginación
    const totalPages = Math.max(1, Math.ceil(filteredGames.length / ITEMS_PER_PAGE));
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedGames = filteredGames.slice(
        startIndex,
        startIndex + ITEMS_PER_PAGE
    );

    useEffect(() => {
        if (currentPage > totalPages) {
            updatePage(totalPages);
        }
    }, [currentPage, totalPages]);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        updatePage(1); // Resetear a página 1 cuando se busca
    };

    const [deleteCandidate, setDeleteCandidate] = useState<Game | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleConsoleSelect = (consoleName: string) => {
        setSelectedConsole(consoleName);
        updatePage(1); // Resetear a página 1 cuando se cambia filtro
    };

    const updatePage = (page: number) => {
        const params = new URLSearchParams(searchParams.toString());

        if (page <= 1) {
            params.delete("page");
        } else {
            params.set("page", String(page));
        }

        const query = params.toString();
        const path = `${window.location.pathname}${query ? `?${query}` : ""}`;

        router.replace(path, { scroll: false });
    };

    const handlePreviousPage = () => {
        updatePage(Math.max(currentPage - 1, 1));
    };

    const handleNextPage = () => {
        updatePage(Math.min(currentPage + 1, totalPages));
    };

    const handleEdit = (id: number) => {
        router.push(`/games/${id}/edit`);
    };

    const handleDelete = (candidate: Game) => {
        setDeleteCandidate(candidate);
    };

    const closeDeleteModal = () => {
        if (!isDeleting) {
            setDeleteCandidate(null);
        }
    };

    const confirmDelete = async () => {
        if (!deleteCandidate) return;
        setIsDeleting(true);

        try {
            const response = await fetch(`/api/games/${deleteCandidate.id}`, {
                method: 'DELETE',
                cache: 'no-store',
            });
            const result = await response.json().catch(() => null);
            if (response.ok) {
                router.replace('/games');
            } else {
                alert(result?.error || 'Error al eliminar el juego');
            }
        } catch (error) {
            console.error('Error deleting game:', error);
            alert('Error al eliminar el juego');
        } finally {
            setIsDeleting(false);
            setDeleteCandidate(null);
        }
    };

    const handleView = (id: number) => {
        router.push(`/games/${id}`);
    };

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

    return (
        <div className="space-y-4 w-full min-w-0">
            {/* Barra de búsqueda - Responsive */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-stretch sm:items-center w-full">
                <input
                    type="text"
                    placeholder="Buscar por título, desarrollador, género o consola..."
                    value={searchTerm}
                    onChange={handleSearch}
                    className="input input-bordered w-full text-sm"
                />
                <div className="text-xs sm:text-sm font-medium text-gray-600 whitespace-nowrap">
                    {filteredGames.length} resultado{filteredGames.length !== 1 ? "s" : ""}
                </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-3">
                <button
                    type="button"
                    onClick={() => handleConsoleSelect("")}
                    className={`btn btn-xs sm:btn-sm rounded-full border text-sm transition duration-200 ease-out transform hover:-translate-y-0.5 hover:shadow-lg ${selectedConsole === "" ? "text-white" : "text-gray-700"}`}
                    style={
                        selectedConsole === ""
                            ? { backgroundColor: "#4b5563", borderColor: "#4b5563", transition: "all 200ms ease" }
                            : { backgroundColor: "transparent", borderColor: "#6b7280", transition: "all 200ms ease" }
                    }
                >
                    Todas
                </button>
                {consoleOptions.map((consoleName) => {
                    const color = consoleColorMap[consoleName] ?? "#6366f1";
                    const isSelected = selectedConsole === consoleName;
                    return (
                        <button
                            key={consoleName}
                            type="button"
                            onClick={() => handleConsoleSelect(consoleName)}
                            className="btn btn-xs sm:btn-sm rounded-full border text-sm transition duration-200 ease-out transform hover:-translate-y-0.5 hover:shadow-lg"
                            style={{
                                color: isSelected ? "#ffffff" : color,
                                backgroundColor: isSelected ? color : "transparent",
                                borderColor: color,
                                transition: "all 200ms ease",
                            }}
                        >
                            {consoleName}
                        </button>
                    );
                })}
            </div>

            {/* Tabla - Responsive con columnas adaptativas */}
            <div className="w-full overflow-x-auto rounded-lg border border-gray-700">
                <table className="table table-zebra table-fixed w-full min-w-full text-sm">
                    <thead>
                        <tr className="bg-gray-800 text-white">
                            {/* Columna Portada - Siempre visible */}
                            <th className="text-left p-2 sm:p-3 w-16 sm:w-20 text-gray-300">Portada</th>
                            
                            {/* Columna Título - Siempre visible */}
                            <th className="text-left p-2 sm:p-3 text-gray-300">Título</th>
                            
                            {/* Columna Desarrollador - Oculta en móvil */}
                            <th className="text-left p-2 sm:p-3 hidden md:table-cell text-gray-300">Desarrollador</th>
                            
                            {/* Columna Consola - Oculta en móvil */}
                            <th className="text-left p-2 sm:p-3 hidden sm:table-cell text-gray-300">Consola</th>
                            
                            {/* Columna Género - Oculta en móvil y tablet */}
                            <th className="text-left p-2 sm:p-3 hidden lg:table-cell text-gray-300">Género</th>
                            
                            {/* Columna Fecha - Oculta en móvil y tablet */}
                            <th className="text-left p-2 sm:p-3 hidden lg:table-cell text-gray-300">Lanzamiento</th>
                            
                            {/* Columna Precio - Visible de tablet en adelante */}
                            <th className="text-left p-2 sm:p-3 hidden md:table-cell text-gray-300">Precio</th>
                            
                            {/* Acciones - Siempre visible */}
                            <th className="text-center p-2 sm:p-3 w-24 sm:w-32 text-gray-300">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedGames.length > 0 ? (
                            paginatedGames.map((game) => (
                                <tr key={game.id} className="hover:bg-gray-700 border-b border-gray-700 text-gray-100">
                                    {/* Portada */}
                                    <td className="p-2 sm:p-3 w-16 sm:w-20">
                                        <img
                                            src={getCoverSrc(game.cover)}
                                            alt={`Portada de ${game.title}`}
                                            className="w-12 h-14 sm:w-14 sm:h-16 object-cover rounded"
                                            loading="lazy"
                                            onError={(event) => {
                                                const img = event.currentTarget;
                                                if (img.src !== "/imgs/No_image_available.svg") {
                                                    img.src = "/imgs/No_image_available.svg";
                                                }
                                            }}
                                        />
                                    </td>
                                    
                                    {/* Título - Siempre visible */}
                                    <td className="p-2 sm:p-3">
                                        <div className="flex flex-col gap-1">
                                            <div className="font-medium truncate text-xs sm:text-sm" title={game.title}>
                                                {game.title}
                                            </div>
                                            {/* Info extra en móviles */}
                                            <div className="text-xs text-gray-600 sm:hidden">
                                                <span
                                                    className="inline-flex items-center rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white mr-2"
                                                    style={getConsoleLabelStyle(game.console.name)}
                                                >
                                                    {game.console.name}
                                                </span>
                                                {game.genre}
                                            </div>
                                        </div>
                                    </td>
                                    
                                    {/* Desarrollador - Oculto en móvil */}
                                    <td className="p-2 sm:p-3 hidden md:table-cell">
                                        <div className="truncate text-xs" title={game.developer}>
                                            {game.developer}
                                        </div>
                                    </td>
                                    
                                    {/* Consola - Oculto en móvil */}
                                    <td className="p-2 sm:p-3 hidden sm:table-cell max-w-[120px]">
                                        <span
                                            className="inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold max-w-full overflow-hidden text-ellipsis whitespace-nowrap block truncate"
                                            title={game.console.name}
                                            style={getConsoleLabelStyle(game.console.name)}
                                        >
                                            {game.console.name}
                                        </span>
                                    </td>
                                    
                                    {/* Género - Oculto en móvil y tablet */}
                                    <td className="p-2 sm:p-3 hidden lg:table-cell">
                                        <div className="truncate text-xs" title={game.genre}>
                                            {game.genre}
                                        </div>
                                    </td>
                                    
                                    {/* Fecha - Oculta en móvil y tablet */}
                                    <td className="p-2 sm:p-3 hidden lg:table-cell text-xs whitespace-nowrap">
                                        {formatDate(game.releaseDate)}
                                    </td>
                                    
                                    {/* Precio - Visible de tablet en adelante */}
                                    <td className="p-2 sm:p-3 hidden md:table-cell font-semibold text-success text-xs whitespace-nowrap">
                                        {formatPrice(game.price)}
                                    </td>
                                    
                                    {/* Acciones */}
                                    <td className="p-2 sm:p-3">
                                        <div className="flex gap-1 sm:gap-2 justify-center">
                                            <button
                                                onClick={() => handleView(game.id)}
                                                className="btn btn-xs sm:btn-sm btn-ghost btn-circle"
                                                title="Ver detalles"
                                            >
                                                <EyeIcon size={16} className="sm:w-[18px] sm:h-[18px]" />
                                            </button>
                                            <button
                                                onClick={() => handleEdit(game.id)}
                                                className="btn btn-xs sm:btn-sm btn-ghost btn-circle text-warning"
                                                title="Editar"
                                            >
                                                <PencilIcon size={16} className="sm:w-[18px] sm:h-[18px]" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(game)}
                                                className="btn btn-xs sm:btn-sm btn-ghost btn-circle text-error"
                                                title="Eliminar"
                                            >
                                                <TrashIcon size={16} className="sm:w-[18px] sm:h-[18px]" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={8} className="text-center py-8 text-gray-500 text-sm">
                                    No se encontraron juegos que coincidan con tu búsqueda.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {deleteCandidate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-8">
                    <div role="dialog" aria-modal="true" aria-labelledby="delete-game-title" className="w-full max-w-lg rounded-[32px] border border-base-200 bg-base-100 p-6 shadow-2xl shadow-black/40">
                        <div className="mb-4">
                            <h2 id="delete-game-title" className="text-2xl font-bold text-red-600">Eliminar juego</h2>
                            <p className="mt-2 text-sm text-slate-600">
                                ¿Estás seguro de que quieres eliminar <strong>{deleteCandidate.title}</strong>? Esta acción no se puede deshacer.
                            </p>
                        </div>
                        <div className="mb-6 rounded-3xl border border-yellow-300 bg-yellow-50 p-4 text-sm text-yellow-900">
                            <p>El juego se eliminará permanentemente de la base de datos.</p>
                        </div>
                        <div className="flex flex-wrap gap-3 justify-end">
                            <button
                                type="button"
                                onClick={closeDeleteModal}
                                className="btn btn-ghost"
                                disabled={isDeleting}
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={confirmDelete}
                                className={`btn btn-error ${isDeleting ? 'loading' : ''}`}
                                disabled={isDeleting}
                            >
                                {isDeleting ? 'Eliminando...' : 'Eliminar juego'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Paginación - Responsive */}
            {filteredGames.length > 0 && (
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
                        Mostrando {startIndex + 1} a{" "}
                        {Math.min(startIndex + ITEMS_PER_PAGE, filteredGames.length)} de{" "}
                        {filteredGames.length}
                    </div>
                    <div className="join">
                        <button
                            onClick={handlePreviousPage}
                            disabled={currentPage === 1}
                            className="join-item btn btn-xs sm:btn-sm"
                        >
                            «
                        </button>
                        <button className="join-item btn btn-xs sm:btn-sm no-animation">
                            <span className="hidden sm:inline">
                                Página {currentPage} de {totalPages || 1}
                            </span>
                            <span className="sm:hidden">
                                {currentPage}/{totalPages || 1}
                            </span>
                        </button>
                        <button
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className="join-item btn btn-xs sm:btn-sm"
                        >
                            »
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
