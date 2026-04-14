import { NextResponse } from "next/server";
import { PrismaClient } from "@/app/generated/prisma";
import { PrismaNeon } from "@prisma/adapter-neon";
import { consoleSchema } from "@/lib/validations/console";

const prisma = new PrismaClient({
    adapter: new PrismaNeon({
        connectionString: process.env.DATABASE_URL!,
    }),
});

export async function GET() {
    try {
        const consoles = await prisma.console.findMany({
            orderBy: {
                name: 'asc'
            },
            include: {
                _count: {
                    select: { games: true }
                }
            }
        });

        return NextResponse.json(consoles);
    } catch (error) {
        console.error("Error fetching consoles:", error);
        return NextResponse.json(
            { error: "Error al obtener las consolas" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
        return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
    }

    const validation = consoleSchema.safeParse(body);
    if (!validation.success) {
        const errors = validation.error.errors.map((err) => err.message).join(", ");
        return NextResponse.json({ error: errors }, { status: 400 });
    }

    try {
        const newConsole = await prisma.console.create({
            data: {
                name: validation.data.name,
                manufacturer: validation.data.manufacturer,
                releaseDate: new Date(validation.data.releaseDate),
                description: validation.data.description,
            },
        });

        return NextResponse.json(newConsole, { status: 201 });
    } catch (error: unknown) {
        console.error("Error creating console:", error);
        if (typeof error === "object" && error !== null && "code" in error) {
            const prismaError = error as { code?: string };
            if (prismaError.code === "P2002") {
                return NextResponse.json({ error: "Ya existe una consola con esos datos" }, { status: 400 });
            }
        }
        return NextResponse.json(
            { error: "Error al crear la consola" },
            { status: 500 }
        );
    }
}
