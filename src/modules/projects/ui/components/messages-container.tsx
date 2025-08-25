import { useSuspenseQuery ,useQuery} from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { Fragment } from "generated/prisma";
import { MessageForm } from "./message-form";
import { MessageCard } from "./message-card";
import { useEffect, useRef, useState } from "react";
import { MessageLoading } from "./message-loading";
  


/*

NOTE: There is slight changes in this code base as there is showing error following the video code
I have decided to fix it using claude and claude has ggiven me this code without changing the core logic
THANKS!!!!

*/ 
interface Props {
  projectId: string;
  activeFragment: Fragment | null ;
  setActiveFragment: (fragment: Fragment | null) => void;
};

export const MessagesContainer = ({
   projectId ,
   activeFragment,
   setActiveFragment
  }: Props) => {
  const trpc = useTRPC();
  const bottomRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  // data -> messages
  const { data: messages } = useQuery( //In video he use useSuspenseQuery
    trpc.messages.getMany.queryOptions({
      projectId,
    }, {
      refetchInterval: 5000,
    }));

  // mark mounted once on client
  useEffect(() => {
    setMounted(true);
  }, []);

  // make sure we always work with an array
  const safeMessages = Array.isArray(messages) ? messages : [];

  // find last ASSISTANT message (safe across runtimes)
  useEffect(() => {
    const lastAssistantMessageWithFragment = [...safeMessages]
      .reverse()
      .find((m) => m.role === "ASSISTANT" && !!m.fragment,
    );
    if (lastAssistantMessageWithFragment ) {
      setActiveFragment(lastAssistantMessageWithFragment.fragment);
    }
  }, [safeMessages , setActiveFragment]);

  // auto-scroll when list length changes
  useEffect(() => {
    bottomRef.current?.scrollIntoView();
  }, [safeMessages.length]);

  if (!mounted) {
    return <div>Loading...</div>;
  }

  const LastMessage = safeMessages[safeMessages.length - 1];
  const isLastMessageUser = LastMessage?.role === "USER";


  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="pt-2 pr-1">
          {safeMessages.map((message) => (
            <MessageCard
              key={message.id}
              content={message.content}
              role={message.role}
              // Prisma returns `fragment`; MessageCard expects `fragments`
              fragment={message.fragment ?? null}
              createdAt={new Date(message.createdAt)}
              isActiveFragment={activeFragment?.id === message.fragment?.id}
              onFragmentClick={() => setActiveFragment(message.fragment)}
              type={message.type}
            />
          ))}
          {isLastMessageUser && <MessageLoading />}
          <div ref={bottomRef} />
        </div>
      </div>
      <div className="relative p-3 pt-1">
        <div className="absolute -top-6 left-0 right-0 h-6 bg-gradient-to-b from-transparent to-background/70 pointer-events-none" />
        <MessageForm projectId={projectId} />
      </div>
    </div>
  );
};
