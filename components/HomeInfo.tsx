"use client";
import Link from 'next/link';
import Image from "next/image";
import { FingerprintIcon, UserPlusIcon } from '@phosphor-icons/react';

export default function HomeInfo() {
  return (
    <div className="bg-indigo-950 min-h-dvh flex flex-col gap-2 p-4 items-center justify-center">
      <div className="hero min-h-screen bg-[url('/imgs/bg-home.jpeg')]">
        <div className="hero-overlay"></div>
        <div className="hero-content text-neutral-content text-center">
          <div className="max-w-md">
            <h1 className="mb-5 text-5xl font-bold">
              <Image
                src="/imgs/logo3.png"
                alt="logo"
                width={400}
                height={200}
                className='flex mt-16 mx-auto'
              />
            </h1>
            <p className="my-4 text-sm text-justify">
                <strong>GameNext.js</strong> is a modern platform to manage and organize
                videogames. Built with Next.js, it uses Prisma, Neon database, and 
                Stack Auth to provide secure authentication, fast performance, and scalable 
                data management.
              </p>
              <Link href="handler/sign-in" className="btn btn-default hover:bg-white hover:text-black me-4 px-10 mt-8 btn-outline">
                <FingerprintIcon size={24} />
                Sign In
              </Link>

              <Link href="handler/sign-up" className="btn btn-default hover:bg-white hover:text-black px-10 mt-8 btn-outline">
                <UserPlusIcon size={24} />
                Sign Up
              </Link>
          </div>
        </div>
      </div>

    </div>
  );
}