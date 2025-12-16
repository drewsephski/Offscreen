'use client';

import { FamilySection } from '@/components/Family/FamilySection';

interface FamilySectionWrapperProps {
    onChildAdded: () => void;
}

export function FamilySectionWrapper({ onChildAdded }: FamilySectionWrapperProps) {
    return <FamilySection onChildAdded={onChildAdded} />;
}
