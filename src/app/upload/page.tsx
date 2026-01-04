'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import { useDispatch } from 'react-redux';
import dynamic from 'next/dynamic';
import { Loader2, UploadCloud, MapPin, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AppDispatch } from '@/lib/store';
import { extractLocationData } from '@/lib/slices/uploadSlice';
import { savePlantData } from '@/lib/slices/plantsSlice';
import { uploadImageWithProgress, generateUploadedImageName } from '@/lib/services/cloudinary';

// Dynamically import mini map for step 3
const MiniMap = dynamic(() => import('@/components/mini-map'), { ssr: false });

export default function UploadPage() {
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();

    // Steps: 1=Upload, 2=Preview/Extract, 3=Save
    const [step, setStep] = useState(1);
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string>('');
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);

    // Form State
    const [cloudinaryUrl, setCloudinaryUrl] = useState('');
    const [imageName, setImageName] = useState('');
    const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

    // Settings from env
    const email = process.env.NEXT_PUBLIC_USER_EMAIL || 'anurag132200@gmail.com';

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (file) {
            setFile(file);
            setPreview(URL.createObjectURL(file));
            // Generate API-compatible image name with embedded coords format
            const apiImageName = generateUploadedImageName(file.name);
            setImageName(apiImageName);
            setStep(2);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': [] },
        maxFiles: 1
    });

    const handleUploadAndExtract = async () => {
        if (!file) return;

        setUploading(true);
        setProgress(10);

        try {
            // 1. Upload to Cloudinary
            const imageUrl = await uploadImageWithProgress(file, (p) => setProgress(Math.min(p, 50)));
            setCloudinaryUrl(imageUrl);
            setProgress(50);

            // 2. Extract Location
            const extractRes = await dispatch(extractLocationData({
                emailId: settings.email,
                imageName: imageName,
                imageUrl: imageUrl,
            })).unwrap();

            setCoords({ lat: extractRes.latitude, lng: extractRes.longitude });
            setProgress(100);
            setStep(3);
        } catch (error) {
            console.error('Upload failed:', error);
            alert(error instanceof Error ? error.message : 'Upload failed');
            setStep(1);
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async () => {
        if (!coords || !cloudinaryUrl) return;

        try {
            setUploading(true);
            await dispatch(savePlantData({
                imageName,
                imageUrl: cloudinaryUrl,
                latitude: coords.lat,
                longitude: coords.lng,
                emailId: settings.email,
            })).unwrap();
            router.push('/inventory');
        } catch (error) {
            console.error('Save failed:', error);
            alert(error instanceof Error ? error.message : 'Save failed');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-2xl mx-auto animate-in fade-in zoom-in-95 duration-500">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-display font-bold text-foreground">Add New Plant</h1>
                <p className="text-muted-foreground">Upload a photo to geotag its location on the farm.</p>
            </div>

            {/* Step Indicator */}
            <div className="flex justify-center mb-8">
                <div className="flex items-center gap-2 text-sm font-medium">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>1</span>
                    <div className="w-12 h-1 bg-border rounded-full" />
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>2</span>
                    <div className="w-12 h-1 bg-border rounded-full" />
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>3</span>
                </div>
            </div>

            {/* Step 1: Dropzone */}
            {step === 1 && (
                <Card
                    {...getRootProps()}
                    className={`
            border-2 border-dashed p-12 text-center cursor-pointer transition-all duration-300
            hover:border-primary hover:bg-primary/5
            ${isDragActive ? 'border-primary bg-primary/10 scale-105' : 'border-border'}
          `}
                >
                    <input {...getInputProps()} />
                    <div className="flex flex-col items-center gap-4 text-muted-foreground">
                        <div className="p-4 bg-background rounded-full shadow-lg">
                            <UploadCloud className="w-10 h-10 text-primary" />
                        </div>
                        <div>
                            <p className="text-lg font-medium text-foreground">Click or drag image here</p>
                            <p className="text-sm mt-1">Supports JPG, PNG, WEBP</p>
                        </div>
                    </div>
                </Card>
            )}

            {/* Step 2: Preview + Extract */}
            {step === 2 && (
                <div className="space-y-6">
                    <div className="aspect-video relative rounded-2xl overflow-hidden shadow-lg border border-border">
                        <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-6">
                            <div className="w-full">
                                <Label className="text-white mb-2 block">Plant Name</Label>
                                <Input
                                    value={imageName}
                                    onChange={(e) => setImageName(e.target.value)}
                                    className="bg-white/90 backdrop-blur border-none"
                                    placeholder="e.g. Tomato Row 4"
                                />
                            </div>
                        </div>
                    </div>

                    <Button
                        onClick={handleUploadAndExtract}
                        disabled={uploading}
                        className="w-full h-14 text-lg font-semibold shadow-xl shadow-primary/20"
                    >
                        {uploading ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Processing... {progress}%
                            </>
                        ) : (
                            <>
                                <MapPin className="mr-2 h-5 w-5" />
                                Extract Location
                            </>
                        )}
                    </Button>

                    <Button variant="ghost" className="w-full" onClick={() => setStep(1)} disabled={uploading}>
                        Cancel
                    </Button>
                </div>
            )}

            {/* Step 3: Confirm + Save */}
            {step === 3 && coords && (
                <div className="space-y-6">
                    <Card className="p-6 border-primary/20 bg-primary/5">
                        <div className="flex items-start gap-4">
                            <div className="bg-primary/20 p-2 rounded-full text-primary">
                                <CheckCircle2 className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-primary">Location Extracted!</h3>
                                <p className="text-muted-foreground text-sm">
                                    Latitude: {coords.lat.toFixed(6)} | Longitude: {coords.lng.toFixed(6)}
                                </p>
                            </div>
                        </div>
                    </Card>

                    <div className="h-64 rounded-2xl overflow-hidden shadow-lg border border-border relative z-0">
                        <MiniMap lat={coords.lat} lng={coords.lng} name={imageName} />
                    </div>

                    <Button
                        onClick={handleSave}
                        disabled={uploading}
                        className="w-full h-14 text-lg font-semibold bg-primary hover:bg-primary/90 shadow-xl shadow-primary/25"
                    >
                        {uploading ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                Confirm & Save Plant
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </>
                        )}
                    </Button>
                </div>
            )}
        </div>
    );
}
