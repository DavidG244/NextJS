import { NextResponse } from "next/server";
import { PrismaClient } from "@/app/generated/prisma";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
import fs from "fs/promises";
import path from "path";

const prisma = new PrismaClient({
    adapter: new PrismaNeon({
        connectionString: process.env.DATABASE_URL!,
    }),
});

const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

function sanitizeFileName(name: string) {
    return name.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9._-]/g, "");
}

async function saveCoverFile(file: File | null): Promise<string | null> {
    if (!file || !(file instanceof File) || file.size === 0) {
        return null;
    }

    const fileName = `${Date.now()}-${sanitizeFileName(file.name)}`;
    await fs.mkdir(UPLOADS_DIR, { recursive: true });
    const destination = path.join(UPLOADS_DIR, fileName);
    await fs.writeFile(destination, Buffer.from(await file.arrayBuffer()));
    return `/uploads/${fileName}`;
}

async function parseGameRequest(request: Request) {
    const contentType = request.headers.get("content-type") || "";
    let payload: any;

    if (contentType.includes("multipart/form-data")) {
        const formData = await request.formData();
        payload = {
            title: formData.get("title"),
            cover: formData.get("cover"),
            coverFile: formData.get("cover_file"),
            developer: formData.get("developer"),
            releaseDate: formData.get("releaseDate"),
            price: formData.get("price"),
            genre: formData.get("genre"),
            description: formData.get("description"),
            console_id: formData.get("console_id"),
        };
    } else {
        payload = await request.json();
    }

    let cover: string | null | undefined;
    if (payload.coverFile && payload.coverFile instanceof File) {
        cover = await saveCoverFile(payload.coverFile);
    } else if (typeof payload.cover === "string" && payload.cover.trim() !== "") {
        cover = payload.cover.trim();
    }

    return {
        title: String(payload.title || ""),
        cover,
        developer: String(payload.developer || ""),
        releaseDate: String(payload.releaseDate || ""),
        price: payload.price,
        genre: String(payload.genre || ""),
        description: String(payload.description || ""),
        console_id: payload.console_id,
    };
}

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
    try {
        const { id } = await params;
        const gameId = parseInt(id);

        if (isNaN(gameId)) {
            return NextResponse.json(
                { error: "ID inválido" },
                { status: 400 }
            );
        }

        const game = await prisma.game.findUnique({
            where: { id: gameId },
            include: {
                console: true,
            },
        });

        if (!game) {
            return NextResponse.json(
                { error: "Juego no encontrado" },
                { status: 404 }
            );
        }

        return NextResponse.json(game);
    } catch (error) {
        console.error("Error fetching game:", error);
        if (error instanceof PrismaClientKnownRequestError && error.code === "P2025") {
            return NextResponse.json(
                { error: "Juego no encontrado" },
                { status: 404 }
            );
        }
        return NextResponse.json(
            { error: "Error al obtener el juego" },
            { status: 500 }
        );
    }
}

export async function PUT(request: Request, { params }: RouteParams) {
    try {
        const { id } = await params;
        const gameId = parseInt(id);

        if (isNaN(gameId)) {
            return NextResponse.json(
                { error: "ID inválido" },
                { status: 400 }
            );
        }

        const body = await parseGameRequest(request);
        const {
            title,
            cover,
            developer,
            releaseDate,
            price,
            genre,
            description,
            console_id
        } = body;

        const data: any = {
            title,
            developer,
            releaseDate: new Date(releaseDate),
            price: parseFloat(String(price)),
            genre,
            description,
            console_id: parseInt(String(console_id)),
        };

        if (cover) {
            data.cover = cover;
        }

        const game = await prisma.game.update({
            where: { id: gameId },
            data,
            include: {
                console: true,
            },
        });

        return NextResponse.json(game);
    } catch (error: unknown) {
        console.error("Error deleting game:", error);

        if (error instanceof PrismaClientKnownRequestError && error.code === "P2025") {
            return NextResponse.json(
                { error: "Juego no encontrado" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { error: "Error al actualizar el juego" },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request, { params }: RouteParams) {
    try {
        const { id } = await params;
        const gameId = parseInt(id);

        if (isNaN(gameId)) {
            return NextResponse.json(
                { error: "ID inválido" },
                { status: 400 }
            );
        }

        await prisma.game.delete({
            where: { id: gameId },
        });

        return NextResponse.json({ message: "Juego eliminado exitosamente" });
    } catch (error) {
        console.error("Error deleting game:", error);
        return NextResponse.json(
            { error: "Error al eliminar el juego" },
            { status: 500 }
        );
    }
}