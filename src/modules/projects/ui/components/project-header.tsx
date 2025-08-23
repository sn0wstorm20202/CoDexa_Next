import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useSuspenseQuery } from "@tanstack/react-query";

import {
    ChevronDownIcon,
    ChevronLeftIcon,
    EditIcon,
    SunMoonIcon,
} from "lucide-react"

import { useTRPC } from "@/trpc/client";
import { Button } from "@/components/ui/button";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuPortal,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Props {
    projectId:string;
}

export const ProjectHeader = ({projectId }: Props) => {
    const trpc = useTRPC();
    const {data: project} = useSuspenseQuery(
        trpc.projects.getOne.queryOptions({id: projectId})
    );

    return(
    <header className="p-2 flex justify-between items-center border-b">
        Header
    </header>
    );
};



