"use client"
import { ArrowLeftIcon } from '@phosphor-icons/react';
import Link from 'next/link';
export default function BackHomeButton() {
    return (
        <div>
            <Link href="/" className="btn btn-outline mt-4 inline-flex items-center gap-2 hover:bg-white hover:text-black">
                <ArrowLeftIcon size={24} />
                Back to Home
            </Link>
        </div>
    )
}