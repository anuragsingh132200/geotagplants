'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Cloud, Save, CheckCircle } from 'lucide-react';

export default function SettingsPage() {
    const [email, setEmail] = useState('');
    const [cloudName, setCloudName] = useState('');
    const [uploadPreset, setUploadPreset] = useState('');
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedEmail = localStorage.getItem('user_email') || '';
            const savedCloud = localStorage.getItem('cloudinary_cloud_name') || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '';
            const savedPreset = localStorage.getItem('cloudinary_upload_preset') || process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '';

            setEmail(savedEmail);
            setCloudName(savedCloud);
            setUploadPreset(savedPreset);
        }
    }, []);

    const handleSave = () => {
        if (!email) {
            alert('Email is required');
            return;
        }

        localStorage.setItem('user_email', email);
        if (cloudName) localStorage.setItem('cloudinary_cloud_name', cloudName);
        if (uploadPreset) localStorage.setItem('cloudinary_upload_preset', uploadPreset);

        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className="space-y-6 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-2">
                <h1 className="text-3xl font-display font-bold text-foreground">Settings</h1>
                <p className="text-muted-foreground">Configure your account and cloud storage.</p>
            </div>

            <Card className="shadow-lg border-border/60">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Cloud className="w-5 h-5 text-primary" />
                        <span>Configuration</span>
                    </CardTitle>
                    <CardDescription>
                        Required for image uploads and location extraction.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Your Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="farmer@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="bg-muted/30"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                        <div className="space-y-2">
                            <Label htmlFor="cloudName">Cloud Name (Optional)</Label>
                            <Input
                                id="cloudName"
                                placeholder="e.g. demo-cloud"
                                value={cloudName}
                                onChange={(e) => setCloudName(e.target.value)}
                                className="bg-muted/30"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="uploadPreset">Upload Preset (Optional)</Label>
                            <Input
                                id="uploadPreset"
                                placeholder="e.g. ml_default"
                                value={uploadPreset}
                                onChange={(e) => setUploadPreset(e.target.value)}
                                className="bg-muted/30"
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <Button
                            onClick={handleSave}
                            className="w-full md:w-auto gap-2 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20"
                        >
                            {saved ? (
                                <>
                                    <CheckCircle className="w-4 h-4" />
                                    Saved!
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    Save Settings
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-secondary/20 border-secondary">
                <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground text-center">
                        <strong>Note:</strong> In a production environment, these secrets would be handled securely on the server.
                        For this demo, we store them in your browser&apos;s LocalStorage.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
