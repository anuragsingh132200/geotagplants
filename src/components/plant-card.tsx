'use client';

import { Plant, getPlantId } from '@/lib/types';
import { MapPin, Calendar, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/lib/store';
import { removePlant } from '@/lib/slices/plantsSlice';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export function PlantCard({ plant }: { plant: Plant }) {
    const dispatch = useDispatch<AppDispatch>();
    const [isHovered, setIsHovered] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        dispatch(removePlant(getPlantId(plant)));
        setIsDeleting(false);
    };

    return (
        <div
            className="group relative bg-card rounded-2xl overflow-hidden border border-border/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="aspect-[4/3] overflow-hidden relative bg-muted">
                <img
                    src={plant.imageUrl}
                    alt={plant.imageName}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                        e.currentTarget.src = '/placeholder-plant.png';
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>

            <div className="p-4">
                <h3 className="font-display font-semibold text-lg truncate" title={plant.imageName}>
                    {plant.imageName}
                </h3>

                <div className="mt-3 flex flex-col gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-accent" />
                        <span>{plant.latitude.toFixed(6)}, {plant.longitude.toFixed(6)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span>{plant.uploadedAt ? format(new Date(plant.uploadedAt), 'PP') : 'Just now'}</span>
                    </div>
                </div>
            </div>

            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button
                        variant="destructive"
                        size="icon"
                        className={`absolute top-2 right-2 rounded-full shadow-lg transition-all duration-200 ${isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-90 md:opacity-0'
                            } md:group-hover:opacity-100`}
                        disabled={isDeleting}
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Plant?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently remove this plant record from your farm inventory.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
