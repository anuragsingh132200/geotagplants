'use client';

import { useState } from 'react';
import { useSelector } from 'react-redux';
import Link from 'next/link';
import { Search, Loader2, Leaf } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PlantCard } from '@/components/plant-card';
import { RootState } from '@/lib/store';

export default function InventoryPage() {
    const { plants, loading, error } = useSelector((state: RootState) => state.plants);
    const [search, setSearch] = useState('');

    const filteredPlants = plants?.filter((p) =>
        p.imageName.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-display font-bold text-foreground">Farm Inventory</h1>
                    <p className="text-muted-foreground mt-1">Manage your geotagged plants.</p>
                </div>

                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search plants..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 bg-white/50 backdrop-blur border-border/60 focus:bg-white transition-colors"
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
                    <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
                    <p>Loading your harvest...</p>
                </div>
            ) : error ? (
                <div className="text-center py-24 text-destructive">
                    <p>Error loading plants: {error}</p>
                </div>
            ) : filteredPlants?.length === 0 ? (
                <div className="text-center py-24 space-y-4">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                        <Leaf className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-xl font-semibold">No plants found</h3>
                        <p className="text-muted-foreground">Get started by uploading your first photo.</p>
                    </div>
                    <Link href="/upload">
                        <Button className="mt-4">Add Plant</Button>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPlants?.map((plant) => (
                        <PlantCard key={plant.id} plant={plant} />
                    ))}
                </div>
            )}
        </div>
    );
}
