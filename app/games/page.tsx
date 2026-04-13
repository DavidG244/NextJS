import GamesInfo from "@/components/GamesInfo";
import { stackServerApp } from "@/stack/server";
import { redirect } from "next/navigation";
import SideBar from "@/components/SideBar";
import AddGameButton from "@/components/AddGameButton";

export const dynamic = "force-dynamic";

export default async function GamesPage(
    {
        children
    }: {
        children: React.ReactNode;
    }) {
    const user = await stackServerApp.getUser();
    if (!user) {
        redirect("/");
    }
    return (
        <div>
            <SideBar currentPath="/games">
                <div className="flex justify-between items-center mb-6">
                    <GamesInfo />
                    {/* El botón Add Game ya está en el sidebar */}
                </div>
            </SideBar>
        </div>
    )
}