import { StackHandler } from "@stackframe/stack";
import BackHomeButton from "@/components/BackHome";

export default function Handler() {
  return (
    <div className="bg-black min-h-dvh flex flex-col gap-2 p-4 items-center justify-center">
            <div className="hero min-h-screen bg-[url('/imgs/bg-home.jpeg')]">
                <div className="hero-overlay"></div>
                <div className="hero-content text-neutral-content flex-col text-center">
                    <div className="max-w-md bg-black/50 p-8 rounded backdrop-blur-sm">
                        <StackHandler fullPage={false} />
                        <BackHomeButton />
                    </div>
                </div>
            </div>
        </div>
  )
}
