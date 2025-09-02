"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Paperclip, Mic, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpc/client";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export default function BuilderPage() {
  const router = useRouter();
  const [value, setInput] = useState("");
  const trpc = useTRPC();

  const createProject = useMutation(
    trpc.projects.create.mutationOptions({
      onError: (error) => {
        toast.error(error.message);
      },
      onSuccess: (data) => {
        toast.success("Project created successfully!");
        router.push(`/projects/${data.id}`);
      },
    })
  );

  // 🔹 Mutations for run + enhance
  const runMutation = trpc.messages.create.useMutation({
    onError: (err) => toast.error(err.message),
    onSuccess: () => toast.success("Run started"),
  });

  const enhanceMutation = trpc.messages.create.useMutation({
    onError: (err) => toast.error(err.message),
    onSuccess: () => toast.success("Enhance + Run started"),
  });

  const suggestions = [
    "Create a financial app",
    "Design a directory website",
    "Build a project management app",
    "Make a landing page",
    "Generate a CRM",
    "Build a mobile app",
  ];

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files?.length) console.log("Selected files:", files);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files?.length) console.log("Selected images:", files);
  };

  const handleMicAccess = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log("Microphone access granted", stream);
    } catch (error) {
      console.error("Microphone access denied:", error);
    }
  };

  // 🔹 Run directly
  const handleRun = () => {
    if (!value.trim()) return;
    runMutation.mutate({
      value,
      projectId: "demo-project-id", // replace with actual project ID
      enhance: false,
    });
  };

  // 🔹 Enhance + Run
  const handleEnhanceRun = () => {
    if (!value.trim()) return;
    enhanceMutation.mutate({
      value,
      projectId: "demo-project-id",
      enhance: true,
    });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        className="w-full max-w-4xl mx-auto text-center"
      >
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="glass rounded-2xl p-6 mb-8 border border-white/10"
        >
          <div className="relative">
            <textarea
              value={value}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your idea and we'll bring it to life (or /command)"
              className="w-full h-32 bg-transparent border-none outline-none resize-none text-lg placeholder:text-muted-foreground pr-16"
            />

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
                  <Image size={18} />
                </Button>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="default"
                  size="sm"
                  className="rounded-full px-4"
                  disabled={runMutation.isPending || !value.trim()}
                  onClick={handleRun}
                >
                  Run
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  className="rounded-full px-4"
                  disabled={enhanceMutation.isPending || !value.trim()}
                  onClick={handleEnhanceRun}
                >
                  Enhance + Run
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-8"
        >
          <p className="text-muted-foreground mb-4">or import from</p>
          <div className="flex items-center justify-center gap-4">
            <Button variant="outline" className="glass border-purple-500/20 hover:border-purple-500/40">
              Figma
            </Button>
            <Button variant="outline" className="glass border-gray-500/20 hover:border-gray-500/40">
              GitHub
            </Button>
          </div>
        </motion.div>

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
