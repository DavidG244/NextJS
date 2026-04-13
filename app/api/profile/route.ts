import { NextResponse } from "next/server";
import { stackServerApp } from "@/stack/server";

export async function GET() {
    try {
        const user = await stackServerApp.getUser();
        if (!user) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        return NextResponse.json({
            id: user.id,
            displayName: user.displayName,
            email: user.primaryEmail,
            profileImageUrl: user.profileImageUrl,
        });
    } catch (error) {
        console.error("Error fetching profile:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}