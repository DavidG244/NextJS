import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

function sanitizeFileName(name: string) {
    return name.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9._-]/g, "");
}

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        // Validate file type (optional)
        const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
        }

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            return NextResponse.json({ error: "File too large" }, { status: 400 });
        }

        const fileName = `${Date.now()}-${sanitizeFileName(file.name)}`;
        await fs.mkdir(UPLOADS_DIR, { recursive: true });
        const destination = path.join(UPLOADS_DIR, fileName);
        await fs.writeFile(destination, Buffer.from(await file.arrayBuffer()));

        return NextResponse.json({
            success: true,
            fileName,
            url: `/uploads/${fileName}`,
        });
    } catch (error) {
        console.error("Error uploading file:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}