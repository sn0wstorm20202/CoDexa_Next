import type { Metadata } from 'next'
import { ThemeProvider } from 'next-themes'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from "@/components/ui/toaster"
import { TooltipProvider } from "@/components/ui/tooltip"
import { TRPCReactProvider } from "@/trpc/client"
import { ReactQueryProvider } from '@/components/ReactQueryProvider'
import { ClerkProvider } from "@clerk/nextjs";
import Script from 'next/script'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'Codexa - AI-Powered App Builder',
    description: 'Create stunning apps & websites by chatting with AI.',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <ClerkProvider>
            <TRPCReactProvider>
                <html lang="en" suppressHydrationWarning>
                    <body className={inter.className} suppressHydrationWarning={true}>
                        <Script id="sanitize-body-attrs" strategy="beforeInteractive">
                            {`
                              try {
                                if (typeof document !== 'undefined' && document.body) {
                                  var attrs = ['cz-shortcut-listen','data-new-gr-c-s-check-loaded','data-gr-ext-installed','data-lt-installed'];
                                  attrs.forEach(function(a){ document.body.removeAttribute(a); });
                                }
                              } catch (e) {}
                            `}
                        </Script>
                        <ReactQueryProvider>
                            <TooltipProvider>
                                <ThemeProvider
                                    attribute="class"
                                    defaultTheme="system"
                                    enableSystem
                                    disableTransitionOnChange
                                >
                                    <Toaster />
                                    {children}
                                </ThemeProvider>
                            </TooltipProvider>
                        </ReactQueryProvider>
                    </body>
                </html>
            </TRPCReactProvider>
        </ClerkProvider>
    );
};