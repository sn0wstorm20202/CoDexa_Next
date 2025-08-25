import Image from "next/image";
import { useState, useEffect } from "react";

const ShimmerMessages = () => {
    const messages = [
        "Thinking...",
        "Loading...",
        "Generating...",
        "Analysing your request...",
        "Building your website...",
        "Crafting components...",
        "Optimizing layout...",
        "Adding final touches...",
        "Almost ready...",
    ];

    const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

    useEffect(() => {
    const Interval = setInterval (() => {
        setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
     }, 2000);

     return () => clearInterval(Interval);
    }, [messages.length]);

    return(
        <div className="flex items-center gap-2">
            <span className= "text-base text-muted-foreground animated-pulse">
                {messages[currentMessageIndex]}
            </span>

        </div>
    );
};


export const MessageLoading = () => {
    return (
        <div className="flex flex group px-2 pb-4">
            <div className="flex items-center gap-2 pl-2 mb-2">
                <Image
                    src="/logo.svg"
                    alt="codexa"
                    width={18}
                    height={18}
                    className="shrink-0"
                />
                <span className="text-sm font-medium">Codexa</span>
            </div>   
            <div> className="pl-8.5 flex flex-col gap-y-4"
               < ShimmerMessages /> 
            </div>   
        </div>
    )
}