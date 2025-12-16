'use client';

import { FamilyCard } from '@/components/Family/FamilyCard';
import { InlineLoading } from '@/components/ui/loading-spinner';
import { Skeleton } from '@/components/ui/skeleton';
import { useParentDashboard } from '@/hooks/useParentDashboard';
import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import { useEffect, useRef } from 'react';

function FamilySectionSkeleton() {
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <Users className="h-6 w-6 text-muted-foreground" />
                <div className="flex items-center space-x-2">
                    <InlineLoading size="sm" />
                    <span className="text-muted-foreground">Loading family data...</span>
                </div>
            </div>
            <Skeleton className="h-48 w-full rounded-lg" />
        </div>
    );
}

interface FamilySectionProps {
    onChildAdded: () => void;
}

export function FamilySection({ onChildAdded }: FamilySectionProps) {
    const { families, children, fetchFamilyData, isLoading } = useParentDashboard();
    const hasFetchedRef = useRef(false);

    // Use a ref-based approach to prevent infinite loops
    useEffect(() => {
        if (!hasFetchedRef.current && !isLoading && families.length === 0) {
            hasFetchedRef.current = true;
            fetchFamilyData().catch(console.error);
        }
    }, [fetchFamilyData, isLoading, families.length]);

    if (isLoading && families.length === 0) {
        return <FamilySectionSkeleton />;
    }

    if (!families || families.length === 0) {
        return null;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-4"
        >
            <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">Family</h2>
                <span className="text-sm text-muted-foreground">
                    ({families.length} {families.length === 1 ? 'family' : 'families'})
                </span>
            </div>

            <div className="space-y-4">
                {families.map((family) => {
                    const familyChildren = children.filter(child => child.family_id === family.id);
                    return (
                        <FamilyCard
                            key={family.id}
                            family={{ ...family, children: familyChildren }}
                            onChildAdded={onChildAdded}
                        />
                    );
                })}
            </div>
        </motion.div>
    );
}
