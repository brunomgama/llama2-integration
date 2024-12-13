"use client";

import { useState } from "react";
import { TbMessage } from "react-icons/tb";
import { Input } from "@/components/ui/input";
import Header from "@/components/header/Header";

export default function Home() {
    const [inputText, setInputText] = useState("");
    const [messages, setMessages] = useState<{ text: string; sender: "user" | "ai" }[]>([]);
    const [loading, setLoading] = useState(false);

    const onKeyPressHandler = (e) => {
        if (e.key === "Enter") {
            handleSubmit();
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputText(e.target.value);
    };

    const handleSubmit = async () => {
        if (!inputText.trim()) return;

        setMessages([...messages, { text: inputText, sender: "user" }]);
        setInputText("");
        setLoading(true);

        let accumulatedResponse = "";

        try {
            const response = await fetch("http://localhost:11434/api/generate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model: "llama2",
                    prompt: inputText,
                }),
            });

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            let done = false;

            while (!done) {
                const { value, done: streamDone } = await reader!.read();
                const chunk = decoder.decode(value, { stream: true });

                accumulatedResponse += chunk;

                done = streamDone;
            }

            const responseChunks = accumulatedResponse.split("\n").filter(Boolean);

            let finalResponse = "";
            responseChunks.forEach((chunk) => {
                try {
                    const jsonResponse = JSON.parse(chunk);
                    finalResponse += jsonResponse.response || "";
                } catch (e) {
                    console.error("Error parsing chunk:", chunk);
                }
            });

            setMessages((prevMessages) => [
                ...prevMessages,
                { text: finalResponse, sender: "ai" },
            ]);
        } catch (err) {
            console.log("There was an error with the request: ", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-screen w-full">
            <Header />

            {/* Scrollable Messages */}
            <main className="flex-grow overflow-y-auto bg-gray-50 px-6 pt-20 pb-20">
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`flex ${
                            message.sender === "ai" ? "justify-start" : "justify-end"
                        }`}
                    >
                        <div
                            className={`p-4 max-w-lg ${message.sender === "ai" ? "text-black" : "text-white"} rounded-lg ${
                                message.sender === "ai" ? "bg-gray-300" : "bg-blue-500"
                            }`}
                        >
                            {message.text}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="p-4 max-w-lg text-black rounded-lg bg-gray-300">
                        ...
                    </div>
                )}
            </main>

            {/* Fixed Footer */}
            <footer className="fixed bottom-0 left-0 w-full bg-white h-16 flex items-center px-6 border-t border-gray-300 z-10">
                <div className="relative w-full">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <TbMessage className="text-2xl text-gray-500" />
                    </div>

                    <Input
                        type="text"
                        id="input"
                        value={inputText}
                        onChange={handleInputChange}
                        onKeyDown={onKeyPressHandler}
                        className="block w-full pl-12 pr-24 h-12 text-sm
                        text-gray-900 border border-gray-300 rounded-lg
                        focus:outline-none focus:ring-2 focus:ring-blue-500
                        focus:border-blue-500"
                        placeholder="What can I help with?"
                    />

                    <button
                        type="button"
                        onClick={handleSubmit}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-700 hover:bg-blue-800 text-white font-medium rounded-lg text-sm px-6 h-10"
                    >
                        {loading ? "Loading..." : "Send"}
                    </button>
                </div>
            </footer>
        </div>
    );
}
