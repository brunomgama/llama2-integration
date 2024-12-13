"use client";
import { TbUser } from "react-icons/tb";

export default function Header() {
    return (
        <header className="flex h-16 w-full items-center justify-between px-6 bg-white shadow-md border-b border-gray-300">
            <div className="text-xl font-bold text-gray-800">
                llama2 Integration
            </div>

            <div className="text-gray-600 cursor-pointer">
                <TbUser className="text-3xl text-gray-500 hover:text-black" />
            </div>
        </header>
    );
}
