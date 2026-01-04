'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import { useDispatch } from 'react-redux';
import dynamic from 'next/dynamic';
import { Loader2, UploadCloud, MapPin, CheckCircle2, ArrowRight, X, FileImage } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { AppDispatch } from '@/lib/store';
import { extractLocationData } from '@/lib/slices/uploadSlice';
import { savePlantData } from '@/lib/slices/plantsSlice';
import { uploadImageWithProgress, generateUploadedImageName } from '@/lib/services/cloudinary';

// Dynamically import mini map for step 3
const MiniMap = dynamic(() => import('@/components/mini-map'), { ssr: false });

interface FileWithProgress {
    file: File;
    preview: string;
    imageName: string;
    cloudinaryUrl?: string;
    coords?: { lat: number; lng: number };
    progress: number;
    status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error';
    error?: string;
}

export default function UploadPage() {
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();

    // Steps: 1=Upload, 2=Preview/Extract, 3=Save
    const [step, setStep] = useState(1);
    const [files, setFiles] = useState<FileWithProgress[]>([]);
    const [uploading, setUploading] = useState(false);
    const [overallProgress, setOverallProgress] = useState(0);
    const [currentProcessingIndex, setCurrentProcessingIndex] = useState<number | null>(null);

    // Settings from env
    const email = process.env.NEXT_PUBLIC_USER_EMAIL || 'anurag9@gmail.com';

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const newFiles = acceptedFiles.map(file => ({
            file,
            preview: URL.createObjectURL(file),
            imageName: generateUploadedImageName(file.name),
            progress: 0,
            status: 'pending' as const
        }));
        setFiles(prev => [...prev, ...newFiles]);
        setStep(2);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': [] },
        multiple: true
    });

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const clearAllFiles = () => {
        setFiles([]);
        setStep(1);
        setOverallProgress(0);
        setCurrentProcessingIndex(null);
    };

    const handleBatchUploadAndExtract = async () => {
        if (files.length === 0) return;

        setUploading(true);
        setOverallProgress(0);

        try {
            for (let i = 0; i < files.length; i++) {
                setCurrentProcessingIndex(i);
                const fileWithProgress = files[i];
                
                // Update file status to uploading
                setFiles(prev => prev.map((f, index) => 
                    index === i ? { ...f, status: 'uploading' as const, progress: 0 } : f
                ));

                // 1. Upload to Cloudinary
                const imageUrl = await uploadImageWithProgress(
                    fileWithProgress.file, 
                    (progress) => {
                        setFiles(prev => prev.map((f, index) => 
                            index === i ? { ...f, progress: Math.min(progress, 50) } : f
                        ));
                        // Update overall progress
                        const completedFiles = i * 50 + progress;
                        const totalProgress = (completedFiles / (files.length * 100)) * 100;
                        setOverallProgress(Math.min(totalProgress, 99));
                    }
                );

                // Update file with cloudinary URL
                setFiles(prev => prev.map((f, index) => 
                    index === i ? { ...f, cloudinaryUrl: imageUrl, status: 'processing' as const, progress: 50 } : f
                ));

                // 2. Extract Location
                try {
                    const extractRes = await dispatch(extractLocationData({
                        emailId: email,
                        imageName: fileWithProgress.imageName,
                        imageUrl: imageUrl,
                    })).unwrap();

                    // Update file with coordinates and mark as completed
                    setFiles(prev => prev.map((f, index) => 
                        index === i ? { 
                            ...f, 
                            coords: { lat: extractRes.latitude, lng: extractRes.longitude }, 
                            status: 'completed' as const, 
                            progress: 100 
                        } : f
                    ));
                } catch (error) {
                    // Mark file as error
                    setFiles(prev => prev.map((f, index) => 
                        index === i ? { 
                            ...f, 
                            status: 'error' as const, 
                            error: error instanceof Error ? error.message : 'Processing failed'
                        } : f
                    ));
                }
            }

            setOverallProgress(100);
            setStep(3);
        } catch (error) {
            console.error('Batch upload failed:', error);
            alert(error instanceof Error ? error.message : 'Batch upload failed');
        } finally {
            setUploading(false);
            setCurrentProcessingIndex(null);
        }
    };

    const handleBatchSave = async () => {
        const completedFiles = files.filter(f => f.status === 'completed' && f.coords && f.cloudinaryUrl);
        if (completedFiles.length === 0) {
            alert('No completed files to save. Please process files first.');
            return;
        }

        try {
            setUploading(true);
            
            // Save all completed files with delay between requests to avoid rate limiting
            const savePromises = completedFiles.map(async (file, index) => {
                // Add small delay to avoid overwhelming the API
                if (index > 0) {
                    await new Promise(resolve => setTimeout(resolve, 100 * index));
                }
                
                const result = await dispatch(savePlantData({
                    imageName: file.imageName,
                    imageUrl: file.cloudinaryUrl!,
                    latitude: file.coords!.lat,
                    longitude: file.coords!.lng,
                    emailId: email,
                })).unwrap();
                
                console.log(`Saved file ${index + 1}:`, file.imageName, result);
                return result;
            });

            const results = await Promise.all(savePromises);
            console.log('Batch save completed. Results:', results);
            
            if (results.every(r => r)) {
                router.push('/inventory');
            } else {
                throw new Error('Some files failed to save');
            }
        } catch (error) {
            console.error('Batch save failed:', error);
            alert(`Batch save failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-2xl mx-auto animate-in fade-in zoom-in-95 duration-500">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-display font-bold text-foreground">Add New Plants</h1>
                <p className="text-muted-foreground">Upload multiple photos to geotag their locations on your farm.</p>
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
                <>
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
                                <p className="text-lg font-medium text-foreground">Click or drag images here</p>
                                <p className="text-sm mt-1">Supports JPG, PNG, WEBP • Multiple files allowed</p>
                            </div>
                        </div>
                    </Card>
                    
                    {files.length > 0 && (
                        <Card className="p-4">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold">Selected Files ({files.length})</h3>
                                <Button variant="outline" size="sm" onClick={clearAllFiles}>
                                    Clear All
                                </Button>
                            </div>
                            <div className="space-y-3 max-h-60 overflow-y-auto">
                                {files.map((file, index) => (
                                    <div key={index} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                                        <img 
                                            src={file.preview} 
                                            alt={file.imageName}
                                            className="w-12 h-12 object-cover rounded"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{file.imageName}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                {file.status === 'pending' && (
                                                    <span className="text-xs text-muted-foreground">Pending</span>
                                                )}
                                                {file.status === 'uploading' && (
                                                    <>
                                                        <Loader2 className="w-3 h-3 animate-spin" />
                                                        <span className="text-xs text-muted-foreground ml-1">Uploading {file.progress}%</span>
                                                    </>
                                                )}
                                                {file.status === 'processing' && (
                                                    <>
                                                        <Loader2 className="w-3 h-3 animate-spin" />
                                                        <span className="text-xs text-muted-foreground ml-1">Processing...</span>
                                                    </>
                                                )}
                                                {file.status === 'completed' && (
                                                    <span className="text-xs text-green-600">✓ Completed</span>
                                                )}
                                                {file.status === 'error' && (
                                                    <span className="text-xs text-red-600">✗ {file.error}</span>
                                                )}
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeFile(index)}
                                            disabled={uploading}
                                        >
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}
                </>
            )}

            {/* Step 2: Preview + Extract */}
            {step === 2 && (
                <div className="space-y-6">
                    {/* Overall Progress */}
                    <Card className="p-4">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold">Batch Processing</h3>
                                <span className="text-sm text-muted-foreground">
                                    {files.filter(f => f.status === 'completed').length} / {files.length} completed
                                </span>
                            </div>
                            <Progress value={overallProgress} className="w-full" />
                            {currentProcessingIndex !== null && (
                                <p className="text-sm text-muted-foreground mt-1">
                                    Processing: {files[currentProcessingIndex]?.imageName}
                                </p>
                            )}
                        </div>
                    </Card>

                    {/* Action Buttons */}
                    <div className="flex gap-4">
                        <Button
                            onClick={handleBatchUploadAndExtract}
                            disabled={uploading || files.length === 0}
                            className="flex-1 h-14 text-lg font-semibold shadow-xl shadow-primary/20"
                        >
                            {uploading ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Processing... {overallProgress}%
                                </>
                            ) : (
                                <>
                                    <MapPin className="mr-2 h-5 w-5" />
                                    Extract All Locations
                                </>
                            )}
                        </Button>
                        <Button variant="ghost" className="flex-1 flex-1 h-14 text-lg" onClick={() => setStep(1)} disabled={uploading}>
                            Back
                        </Button>
                    </div>

                    {/* Files Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {files.map((file, index) => (
                            <Card key={index} className="overflow-hidden">
                                <div className="aspect-video relative">
                                    <img 
                                        src={file.preview} 
                                        alt={file.imageName} 
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-2">
                                        <div className="w-full">
                                            <Input
                                                value={file.imageName}
                                                onChange={(e) => {
                                                    setFiles(prev => prev.map((f, i) => 
                                                        i === index ? { ...f, imageName: e.target.value } : f
                                                    ));
                                                }}
                                                className="bg-white/90 backdrop-blur border-none text-sm"
                                                placeholder="e.g. Tomato Row 4"
                                            />
                                        </div>
                                    </div>
                                    {file.status === 'completed' && file.coords && (
                                        <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                                            ✓ {file.coords.lat.toFixed(4)}, {file.coords.lng.toFixed(4)}
                                        </div>
                                    )}
                                </div>
                                <div className="p-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            {file.status === 'pending' && (
                                                <span className="text-xs text-muted-foreground">Pending</span>
                                            )}
                                            {file.status === 'uploading' && (
                                                <>
                                                    <Loader2 className="w-3 h-3 animate-spin" />
                                                    <span className="text-xs text-muted-foreground ml-1">{file.progress}%</span>
                                                </>
                                            )}
                                            {file.status === 'processing' && (
                                                <>
                                                    <Loader2 className="w-3 h-3 animate-spin" />
                                                    <span className="text-xs text-muted-foreground ml-1">Processing...</span>
                                                </>
                                            )}
                                            {file.status === 'completed' && (
                                                <span className="text-xs text-green-600">✓ Ready</span>
                                            )}
                                            {file.status === 'error' && (
                                                <span className="text-xs text-red-600">✗ Failed</span>
                                            )}
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeFile(index)}
                                            disabled={uploading}
                                        >
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* Step 3: Confirm + Save */}
            {step === 3 && (
                <div className="space-y-6">
                    <Card className="p-6 border-primary/20 bg-primary/5">
                        <div className="flex items-start gap-4">
                            <div className="bg-primary/20 p-2 rounded-full text-primary">
                                <CheckCircle2 className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-primary">Batch Processing Complete!</h3>
                                <p className="text-muted-foreground text-sm">
                                    {files.filter(f => f.status === 'completed').length} of {files.length} images processed successfully
                                </p>
                                {files.some(f => f.status === 'error') && (
                                    <p className="text-red-600 text-sm mt-1">
                                        {files.filter(f => f.status === 'error').length} images failed to process
                                    </p>
                                )}
                            </div>
                        </div>
                    </Card>

                    {/* Action Buttons */}
                    <div className="flex gap-4">
                        <Button
                            onClick={handleBatchSave}
                            disabled={uploading || files.filter(f => f.status === 'completed').length === 0}
                            className="flex-1 h-14 text-lg font-semibold bg-primary hover:bg-primary/90 shadow-xl shadow-primary/25"
                        >
                            {uploading ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Saving All...
                                </>
                            ) : (
                                <>
                                    Save All Plants ({files.filter(f => f.status === 'completed').length})
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </>
                            )}
                        </Button>
                        <Button variant="ghost" className="flex-1 h-14 text-lg font-semibold" onClick={clearAllFiles} disabled={uploading}>
                            Start Over
                        </Button>
                    </div>

                    {/* Successfully processed files */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {files.filter(f => f.status === 'completed' && f.coords).map((file, index) => (
                            <Card key={index} className="overflow-hidden">
                                <div className="aspect-video relative">
                                    <img 
                                        src={file.preview} 
                                        alt={file.imageName} 
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-2">
                                        <div className="w-full">
                                            <p className="text-white text-xs truncate">{file.imageName}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-3">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <MapPin className="w-4 h-4 text-accent" />
                                        <span>{file.coords!.lat.toFixed(6)}, {file.coords!.lng.toFixed(6)}</span>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
