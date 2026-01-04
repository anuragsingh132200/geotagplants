'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Map, UploadCloud, List, Settings, Leaf } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Layout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    const navItems = [
        { href: '/', icon: Map, label: 'Farm Map' },
        { href: '/upload', icon: UploadCloud, label: 'Upload' },
        { href: '/inventory', icon: List, label: 'Inventory' },
        { href: '/settings', icon: Settings, label: 'Settings' },
    ];

    return (
        <div className="min-h-screen bg-background flex flex-col font-body">
            {/* Header */}
            <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border/40">
                <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-primary">
                        <div className="p-2 bg-primary/10 rounded-xl">
                            <Leaf className="w-6 h-6" />
                        </div>
                        <span className="font-display font-bold text-xl tracking-tight text-foreground">AgroTag</span>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 w-full max-w-5xl mx-auto p-4 md:p-6 pb-24 md:pb-8 md:ml-20">
                {children}
            </main>

            {/* Mobile Bottom Navigation */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border z-40 pb-safe">
                <div className="flex justify-around items-center h-16 px-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex flex-col items-center justify-center w-full h-full gap-1 transition-colors duration-200",
                                    isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <item.icon className={cn("w-6 h-6 transition-transform", isActive && "scale-110")} />
                                <span className="text-[10px] font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </div>
            </nav>

            {/* Desktop Sidebar */}
            <nav className="hidden md:block fixed left-0 top-20 w-20 h-[calc(100vh-5rem)] z-20">
                <div className="flex flex-col items-center gap-8 py-8">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "p-3 rounded-xl transition-all duration-200 hover:bg-secondary/50",
                                    isActive ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary" : "text-muted-foreground"
                                )}
                            >
                                <item.icon className="w-6 h-6" />
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
}
