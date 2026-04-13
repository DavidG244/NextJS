"use client";

import Link from "next/link";
import { PlusIcon } from "@phosphor-icons/react";

export default function AddGameButton() {
    return (
        <Link href="/games/add" className="btn btn-primary">
            <PlusIcon size={20} />
            Agregar Juego
        </Link>
    );
}
