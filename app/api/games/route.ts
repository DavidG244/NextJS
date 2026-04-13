import { NextResponse } from "next/server";
import { PrismaClient } from "@/app/generated/prisma";
import { PrismaNeon } from "@prisma/adapter-neon";
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

async function saveCoverFile(file: any): Promise<string | null> {
    if (
        !file ||
        typeof file !== "object" ||
        typeof file.size !== "number" ||
        file.size === 0 ||
        typeof file.name !== "string" ||
        typeof file.arrayBuffer !== "function"
    ) {
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
    const maybeCoverFile = payload.coverFile;
    if (maybeCoverFile && typeof maybeCoverFile === "object" && typeof maybeCoverFile.arrayBuffer === "function") {
        cover = await saveCoverFile(maybeCoverFile);
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

export async function GET() {
    try {
        const games = await prisma.game.findMany({
            include: {
                console: true,
            },
            orderBy: {
                title: 'asc'
            }
        });

        return NextResponse.json(games);
    } catch (error) {
        console.error("Error fetching games:", error);
        return NextResponse.json(
            { error: "Error al obtener los juegos" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
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

        const parsedPrice = parseFloat(String(price));
        const parsedConsoleId = parseInt(String(console_id), 10);

        if (Number.isNaN(parsedPrice)) {
            return NextResponse.json(
                { error: "Precio inválido" },
                { status: 400 }
            );
        }

        if (Number.isNaN(parsedConsoleId)) {
            return NextResponse.json(
                { error: "Consola inválida" },
                { status: 400 }
            );
        }

        const data: any = {
            title,
            developer,
            releaseDate: new Date(releaseDate),
            price: parsedPrice,
            genre,
            description,
            console_id: parsedConsoleId,
        };

        if (cover) {
            data.cover = cover;
        }

        const game = await prisma.game.create({
            data,
            include: {
                console: true,
            },
        });

        return NextResponse.json(game, { status: 201 });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error("Error creating game:", error);
        return NextResponse.json(
            { error: `Error al crear el juego: ${errorMessage}` },
            { status: 500 }
        );
    }
}