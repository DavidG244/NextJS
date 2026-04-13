import { NextResponse } from "next/server";
import { PrismaClient } from "@/app/generated/prisma";
import { PrismaNeon } from "@prisma/adapter-neon";

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