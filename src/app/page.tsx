'use client';

import dynamic from 'next/dynamic';
import { useSelector } from 'react-redux';
import Link from 'next/link';
import { Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RootState } from '@/lib/store';

// Dynamically import map to avoid SSR issues with Leaflet
const MapWithNoSSR = dynamic(() => import('@/components/farm-map'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center bg-muted/20 backdrop-blur-sm z-10">
      <Loader2 className="w-10 h-10 animate-spin text-primary" />
    </div>
  ),
});

export default function Home() {
  const { plants, loading } = useSelector((state: RootState) => state.plants);

  // Mobile: account for header (64px) + bottom nav (64px) + padding
  // Desktop: account for header + sidebar padding
  return (
    <div className="h-[calc(100vh-12rem)] md:h-[calc(100vh-8rem)] relative rounded-3xl overflow-hidden shadow-2xl border border-border/50 animate-in zoom-in-95 duration-700">
      {loading ? (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/20 backdrop-blur-sm z-10">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      ) : (
        <MapWithNoSSR plants={plants} />
      )}

      {/* Floating Action Button */}
      <div className="absolute bottom-6 right-6 z-[1002]">
        <Link href="/upload">
          <Button
            size="lg"
            className="rounded-full w-14 h-14 shadow-xl shadow-primary/30 bg-primary hover:bg-primary/90 text-white p-0 hover:scale-110 transition-transform duration-200"
          >
            <Plus className="w-8 h-8" />
          </Button>
        </Link>
      </div>

      {/* Plants Counter */}
      <div className="absolute top-4 right-6 z-[1001] bg-background/90 backdrop-blur px-4 py-2 rounded-xl shadow-lg border border-border/50">
        <p className="text-sm font-semibold text-foreground">
          {plants.length} Plants Tagged
        </p>
      </div>
    </div>
  );
}
