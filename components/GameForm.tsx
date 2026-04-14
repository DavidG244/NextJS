"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

interface Console {
    id: number;
    name: string;
    manufacturer: string;
}

interface GameFormData {
    title: string;
    cover: string;
    developer: string;
    releaseDate: string;
    price: string;
    genre: string;
    description: string;
    console_id: number;
}

interface GameFormProps {
    initialData?: Partial<GameFormData>;
    submitButtonText: string;
    gameId?: number;
}

export default function GameForm({ initialData, submitButtonText, gameId }: GameFormProps) {
    const router = useRouter();
    const [formData, setFormData] = useState<GameFormData>({
        title: initialData?.title || "",
        cover: initialData?.cover || "",
        developer: initialData?.developer || "",
        releaseDate: initialData?.releaseDate || "",
        price: initialData?.price?.toString() || "",
        genre: initialData?.genre || "",
        description: initialData?.description || "",
        console_id: initialData?.console_id || 0,
    });

    const [consoles, setConsoles] = useState<Console[]>([]);
    const [isLoadingConsoles, setIsLoadingConsoles] = useState(true);
    const [loadConsolesError, setLoadConsolesError] = useState<string | null>(null);
    const [selectedCoverFile, setSelectedCoverFile] = useState<File | null>(null);
    const [coverPreview, setCoverPreview] = useState<string>(initialData?.cover || "");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        const loadConsoles = async () => {
            setIsLoadingConsoles(true);
            setLoadConsolesError(null);

            try {
                const response = await fetch("/api/consoles", {
                    headers: {
                        Accept: "application/json",
                    },
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => null);
                    const message = errorData?.error || `Status ${response.status}`;
                    setLoadConsolesError(`No se pudieron cargar las consolas: ${message}`);
                    return;
                }

                const data = await response.json();
                setConsoles(data);
            } catch (err) {
                console.error("Error loading consoles:", err);
                setLoadConsolesError("Error al cargar las consolas");
            } finally {
                setIsLoadingConsoles(false);
            }
        };

        loadConsoles();
    }, []);

    useEffect(() => {
        setCoverPreview(initialData?.cover || "");
    }, [initialData?.cover]);

    useEffect(() => {
        if (!selectedCoverFile) {
            return;
        }

        const objectUrl = URL.createObjectURL(selectedCoverFile);
        setCoverPreview(objectUrl);

        return () => {
            URL.revokeObjectURL(objectUrl);
        };
    }, [selectedCoverFile]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setFieldErrors({});

        // Validación
        const fieldValidationErrors: Record<string, string> = {};
        if (!formData.title.trim()) fieldValidationErrors.title = "El título es obligatorio";
        if (!formData.developer.trim()) fieldValidationErrors.developer = "El desarrollador es obligatorio";
        if (!formData.genre.trim()) fieldValidationErrors.genre = "El género es obligatorio";
        if (!formData.releaseDate) fieldValidationErrors.releaseDate = "La fecha de lanzamiento es obligatoria";
        const parsedPrice = Number(formData.price);
        if (formData.price.trim() === "") {
            fieldValidationErrors.price = "El precio es obligatorio";
        } else if (isNaN(parsedPrice) || parsedPrice < 0) {
            fieldValidationErrors.price = "El precio debe ser un número válido y no negativo";
        }
        if (!formData.console_id || formData.console_id === 0) fieldValidationErrors.console_id = "Debes seleccionar una consola";
        // Imagen es OPCIONAL - no se valida como obligatoria

        if (Object.keys(fieldValidationErrors).length > 0) {
            setFieldErrors(fieldValidationErrors);
            setError("Corrige los campos señalados");
            setIsLoading(false);
            return;
        }

        const formDataToSend = new FormData();
        formDataToSend.append("title", formData.title.trim());
        formDataToSend.append("developer", formData.developer.trim());
        formDataToSend.append("releaseDate", formData.releaseDate);
        formDataToSend.append("price", String(Number(formData.price)));
        formDataToSend.append("genre", formData.genre.trim());
        formDataToSend.append("description", formData.description.trim());
        formDataToSend.append("console_id", String(formData.console_id));

        if (selectedCoverFile) {
            formDataToSend.append("cover_file", selectedCoverFile);
        }

        if (formData.cover && formData.cover.trim() !== "") {
            formDataToSend.append("cover", formData.cover.trim());
        }

        try {
            const url = gameId ? `/api/games/${gameId}` : "/api/games";
            const method = gameId ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                body: formDataToSend,
            });

            if (response.ok) {
                const successMessage = gameId ? "¡Juego actualizado exitosamente!" : "¡Juego creado exitosamente!";
                await Swal.fire({
                    icon: "success",
                    title: successMessage,
                    text: formData.title,
                    confirmButtonText: "Aceptar",
                    confirmButtonColor: "#3085d6",
                });
                router.push("/games");
            } else {
                const errorData = await response.json();
                const errorMessage = formatValidationError(errorData.error || "Error al guardar el juego");
                const responseFieldErrors = mapFieldErrors(errorData.error);
                if (Object.keys(responseFieldErrors).length > 0) {
                    setFieldErrors(responseFieldErrors);
                    setError("Corrige los campos señalados");
                } else {
                    setError(errorMessage);
                }
                await Swal.fire({
                    icon: "error",
                    title: "Error al guardar",
                    text: errorMessage,
                    confirmButtonText: "Aceptar",
                    confirmButtonColor: "#d33",
                });
            }
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : "Error desconocido";
            await Swal.fire({
                icon: "error",
                title: "Error",
                text: errorMsg,
                confirmButtonText: "Aceptar",
                confirmButtonColor: "#d33",
            });
            setError(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === "console_id" ? Number(value) : value
        }));
    };

    const handleCoverFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        setSelectedCoverFile(file);
    };

    const formatValidationError = (error: unknown): string => {
        if (typeof error === "string") return error;
        if (Array.isArray(error)) return error.map(formatValidationError).join(". ");
        if (error && typeof error === "object") {
            const obj = error as Record<string, unknown>;
            const values = Object.values(obj);
            const messages = values.flatMap((value) => {
                if (typeof value === "string") return [value];
                if (Array.isArray(value)) return value.map(formatValidationError);
                if (typeof value === "object" && value !== null) {
                    return Object.values(value).map(formatValidationError);
                }
                return [] as string[];
            });
            return messages.filter(Boolean).join(". ");
        }
        return String(error);
    };

    const mapFieldErrors = (error: unknown): Record<string, string> => {
        const fieldErrors: Record<string, string> = {};
        if (!error || typeof error !== "object") return fieldErrors;

        const obj = error as Record<string, unknown>;
        for (const [key, value] of Object.entries(obj)) {
            if (key === "_errors") continue;
            if (!value) continue;

            if (typeof value === "string") {
                fieldErrors[key] = value;
                continue;
            }

            if (Array.isArray(value) && value.length > 0) {
                const first = value.find((item) => typeof item === "string");
                if (first) fieldErrors[key] = String(first);
                continue;
            }

            if (typeof value === "object" && value !== null) {
                const child = value as Record<string, unknown>;
                if (Array.isArray(child._errors) && child._errors.length > 0) {
                    fieldErrors[key] = String(child._errors[0]);
                    continue;
                }
                const nested = Object.values(child).flatMap((nestedValue) => {
                    if (typeof nestedValue === "string") return [nestedValue];
                    if (Array.isArray(nestedValue)) return nestedValue.filter((item) => typeof item === "string").map(String);
                    return [] as string[];
                });
                if (nested.length > 0) {
                    fieldErrors[key] = nested[0];
                }
            }
        }

        return fieldErrors;
    };

    const getCoverSrc = (cover: string | null) => {
        const defaultImg = "/imgs/No_image_available.svg";

        if (!cover || typeof cover !== "string" || cover.trim() === "") {
            return defaultImg;
        }

        const trimmed = cover.trim();
        if (/^(http|https):\/\//i.test(trimmed) || trimmed.startsWith("blob:") || trimmed.startsWith("data:")) {
            return trimmed;
        }

        if (trimmed.startsWith("/")) {
            return trimmed;
        }

        return `/${trimmed.replace(/^\/+/, "")}`;
    };

    return (
        <div className="w-full p-0">
            <form onSubmit={handleSubmit} noValidate className="space-y-8">
                {error && (
                    <div className="alert alert-error shadow-lg">
                        <div>
                            <span>{error}</span>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 items-start">
                    <div className="overflow-hidden rounded-[24px] border border-base-300 bg-base-200 shadow-xl aspect-[4/5]">
                        <img
                            src={coverPreview ? getCoverSrc(coverPreview) : getCoverSrc(formData.cover)}
                            alt={formData.title ? `Carátula de ${formData.title}` : "Carátula predeterminada"}
                            className="w-full h-full object-cover"
                            onError={(event) => {
                                const target = event.target as HTMLImageElement;
                                target.src = "/imgs/No_image_available.svg";
                            }}
                        />
                    </div>

                    <div className="space-y-4">
                        {/* Título */}
                    <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-4 items-center">
                        <label className="label pb-0">
                            <span className="label-text font-semibold">Título *</span>
                        </label>
                        <div className="space-y-1 w-full">
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className="input input-bordered input-sm w-full"
                                required
                            />
                            {fieldErrors.title && (
                                <p className="text-xs text-error">{fieldErrors.title}</p>
                            )}
                        </div>
                    </div>

                    {/* Desarrollador */}
                    <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-4 items-center">
                        <label className="label pb-0">
                            <span className="label-text font-semibold">Desarrollador *</span>
                        </label>
                        <div className="space-y-1 w-full">
                            <input
                                type="text"
                                name="developer"
                                value={formData.developer}
                                onChange={handleChange}
                                className="input input-bordered input-sm w-full"
                                required
                            />
                            {fieldErrors.developer && (
                                <p className="text-xs text-error">{fieldErrors.developer}</p>
                            )}
                        </div>
                    </div>

                    {/* Portada */}
                    <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-4 items-center">
                        <label className="label pb-0">
                            <span className="label-text font-semibold">Portada</span>
                        </label>
                        <div className="space-y-2">
                            <input
                                type="file"
                                name="cover_file"
                                accept="image/*"
                                onChange={handleCoverFileChange}
                                className="file-input file-input-bordered file-input-sm w-full"
                            />
                            <p className="text-xs text-gray-400">Selecciona una imagen desde tu equipo. Si no seleccionas nada, se conserva la portada actual.</p>
                        </div>
                    </div>

                    {/* Consola */}
                    <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-4 items-center">
                        <label className="label pb-0">
                            <span className="label-text font-semibold">Consola *</span>
                        </label>
                        <div className="space-y-1 w-full">
                            <select
                                name="console_id"
                                value={formData.console_id}
                                onChange={handleChange}
                                className="select select-bordered select-sm w-full"
                                required
                                disabled={isLoadingConsoles || Boolean(loadConsolesError)}
                            >
                                <option value={0} disabled>
                                    {isLoadingConsoles
                                        ? 'Cargando consolas...'
                                        : loadConsolesError
                                            ? 'No se pudieron cargar las consolas'
                                            : 'Seleccionar consola'}
                                </option>
                                {consoles.map(console => (
                                    <option key={console.id} value={console.id}>
                                        {console.name}
                                    </option>
                                ))}
                            </select>
                            {loadConsolesError && (
                                <p className="text-xs text-error">{loadConsolesError}</p>
                            )}
                            {fieldErrors.console_id && (
                                <p className="text-xs text-error">{fieldErrors.console_id}</p>
                            )}
                        </div>
                    </div>

                    {/* Género */}
                    <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-4 items-center">
                        <label className="label pb-0">
                            <span className="label-text font-semibold">Género *</span>
                        </label>
                        <div className="space-y-1 w-full">
                            <input
                                type="text"
                                name="genre"
                                value={formData.genre}
                                onChange={handleChange}
                                className="input input-bordered input-sm w-full"
                                required
                            />
                            {fieldErrors.genre && (
                                <p className="text-xs text-error">{fieldErrors.genre}</p>
                            )}
                        </div>
                    </div>

                    {/* Fecha de lanzamiento */}
                    <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-4 items-center">
                        <label className="label pb-0">
                            <span className="label-text font-semibold">Fecha de Lanzamiento *</span>
                        </label>
                        <div className="space-y-1 w-full">
                            <input
                                type="date"
                                name="releaseDate"
                                value={formData.releaseDate}
                                onChange={handleChange}
                                className="input input-bordered input-sm w-full"
                                required
                            />
                            {fieldErrors.releaseDate && (
                                <p className="text-xs text-error">{fieldErrors.releaseDate}</p>
                            )}
                        </div>
                    </div>

                    {/* Precio */}
                    <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-4 items-center">
                        <label className="label pb-0">
                            <span className="label-text font-semibold">Precio (€) *</span>
                        </label>
                        <div className="space-y-1 w-full">
                            <input
                                type="text"
                                inputMode="decimal"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                className="input input-bordered input-sm w-full"
                                placeholder="0.00"
                            />
                            {fieldErrors.price && (
                                <p className="text-xs text-error">{fieldErrors.price}</p>
                            )}
                        </div>
                    </div>
                </div>
                </div>

                {/* Description */}
                <div>
                    <label className="label pb-2">
                        <span className="label-text font-semibold text-base">Descripción *</span>
                    </label>
                    <div className="space-y-1">
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            className="textarea textarea-bordered w-full"
                            rows={5}
                            required
                        />
                        {fieldErrors.description && (
                            <p className="text-xs text-error">{fieldErrors.description}</p>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-4 justify-end pt-4 border-t border-base-200">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="btn btn-outline"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className={`btn btn-primary ${isLoading ? 'loading' : ''}`}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Guardando...' : submitButtonText}
                    </button>
                </div>
            </form>
        </div>
    );
}
