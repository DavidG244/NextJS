import { NextResponse } from "next/server";
import { PrismaClient } from "@/app/generated/prisma";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
import { consoleSchema } from "@/lib/validations/console";

const prisma = new PrismaClient({
  adapter: new PrismaNeon({
    connectionString: process.env.DATABASE_URL!,
  }),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const consoleId = parseInt(id, 10);

  if (Number.isNaN(consoleId)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  try {
    const consoleItem = await prisma.console.findUnique({
      where: { id: consoleId },
      include: {
        _count: {
          select: { games: true },
        },
      },
    });

    if (!consoleItem) {
      return NextResponse.json({ error: "Consola no encontrada" }, { status: 404 });
    }

    return NextResponse.json(consoleItem);
  } catch (error) {
    console.error("Error fetching console:", error);
    return NextResponse.json({ error: "Error al obtener la consola" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const consoleId = parseInt(id, 10);

  if (Number.isNaN(consoleId)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const validation = consoleSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json({ error: validation.error.format() }, { status: 400 });
  }

  try {
    const updatedConsole = await prisma.console.update({
      where: { id: consoleId },
      data: {
        name: validation.data.name,
        manufacturer: validation.data.manufacturer,
        releaseDate: new Date(validation.data.releaseDate),
        description: validation.data.description,
      },
      include: {
        _count: {
          select: { games: true },
        },
      },
    });

    return NextResponse.json(updatedConsole);
  } catch (error: unknown) {
    console.error("Error updating console:", error);
    if (error instanceof PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ error: "Consola no encontrada" }, { status: 404 });
    }
    return NextResponse.json({ error: "Error al actualizar la consola" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const consoleId = parseInt(id, 10);

  if (Number.isNaN(consoleId)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  try {
    const attachedGames = await prisma.game.count({ where: { console_id: consoleId } });
    if (attachedGames > 0) {
      return NextResponse.json({ error: "No se puede eliminar una consola con juegos vinculados" }, { status: 400 });
    }

    await prisma.console.delete({ where: { id: consoleId } });
    return NextResponse.json({ message: "Consola eliminada correctamente" });
  } catch (error: unknown) {
    console.error("Error deleting console:", error);
    if (error instanceof PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ error: "Consola no encontrada" }, { status: 404 });
    }
    return NextResponse.json({ error: "Error al eliminar la consola" }, { status: 500 });
  }
}
