'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Cloud, User, CheckCircle, Settings } from 'lucide-react';

export default function SettingsPage() {
    const email = process.env.NEXT_PUBLIC_USER_EMAIL || 'anurag3@gmail.com';
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dlot6ojqh';

    return (
        <div className="space-y-6 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-2">
                <h1 className="text-3xl font-display font-bold text-foreground">Settings</h1>
                <p className="text-muted-foreground">Your account configuration.</p>
            </div>

            <Card className="shadow-lg border-border/60">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Settings className="w-5 h-5 text-primary" />
                        <span>System Configuration</span>
                    </CardTitle>
                    <CardDescription>
                        Current system settings and configuration status.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">Email:</span>
                            <span className="text-sm font-medium">{email}</span>
                        </div>
                        <CheckCircle className="w-4 h-4 text-primary" />
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-2">
                            <Cloud className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">Cloud Storage:</span>
                            <span className="text-sm font-medium">Connected ({cloudName})</span>
                        </div>
                        <CheckCircle className="w-4 h-4 text-primary" />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
