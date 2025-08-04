'use client'

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Paperclip, Mic, Image, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";



export default function BuilderPage() {
    const [input, setInput] = useState("");


    const suggestions = [
        "Create a financial app",
        "Design a directory website",
        "Build a project management app",
        "Make a landing page",
        "Generate a CRM",
        "Build a mobile app"
    ];

    const fileInputRef = useRef<HTMLInputElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            console.log("Selected files:", files);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            console.log("Selected images:", files);
        }
    };

    const handleMicAccess = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            console.log("Microphone access granted", stream);
        } catch (error) {
            console.error("Microphone access denied:", error);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
                className="w-full max-w-4xl mx-auto text-center"
            >
                {/* Header */}
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="text-4xl md:text-6xl font-bold mb-6 gradient-text"
                >
                    What do you want to build?
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="text-xl text-muted-foreground mb-12"
                >
                    Create stunning apps & websites by chatting with AI.
                </motion.p>

                {/* Chat Input */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="glass rounded-2xl p-6 mb-8 border border-white/10"
                >
                    <div className="relative">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type your idea and we'll bring it to life (or /command)"
                            className="w-full h-32 bg-transparent border-none outline-none resize-none text-lg placeholder:text-muted-foreground pr-16"
                        />

                        {/* Hidden Inputs */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            hidden
                            onChange={handleFileChange}
                        />
                        <input
                            ref={imageInputRef}
                            type="file"
                            accept="image/*"
                            hidden
                            onChange={handleImageChange}
                        />

                        {/* Input Actions */}
                        <div className="absolute bottom-4 left-0 right-0 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="p-2 h-auto"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <Paperclip size={18} />
                                </Button>

                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="p-2 h-auto"
                                    onClick={handleMicAccess}
                                >
                                    <Mic size={18} />
                                </Button>

                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="p-2 h-auto"
                                    onClick={() => imageInputRef.current?.click()}
                                >
                                    {/* eslint-disable-next-line jsx-a11y/alt-text */}
                                    <Image size={18} />
                                </Button>
                            </div>

                            <Button
                                variant="default"
                                size="sm"
                                className="rounded-full p-2 h-auto"
                                disabled={!input.trim()}
                            >
                                <ArrowUp size={18} />
                            </Button>
                        </div>
                    </div>
                </motion.div>

                {/* Import Options */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="mb-8"
                >
                    <p className="text-muted-foreground mb-4">or import from</p>
                    <div className="flex items-center justify-center gap-4">
                        <Button variant="outline" className="glass border-purple-500/20 hover:border-purple-500/40">
                            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none">
                                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Figma
                        </Button>
                        <Button variant="outline" className="glass border-gray-500/20 hover:border-gray-500/40">
                            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none">
                                <path d="M9 19C-1 12 2 3 9 3C16 3 19 12 9 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M9 19C9 19 13 20 16 17C19 14 16 10 13 10H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            GitHub
                        </Button>
                    </div>
                </motion.div>

                {/* Suggestions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    className="grid grid-cols-2 md:grid-cols-3 gap-3"
                >
                    {suggestions.map((suggestion, index) => (
                        <motion.button
                            key={suggestion}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                            onClick={() => setInput(suggestion)}
                            className="glass p-3 rounded-lg text-sm hover:bg-white/5 transition-all duration-300 hover-lift"
                        >
                            {suggestion}
                        </motion.button>
                    ))}
                </motion.div>
            </motion.div>
        </div>
    );
} 