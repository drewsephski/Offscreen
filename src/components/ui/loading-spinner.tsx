'use client';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    variant?: 'pulse' | 'float' | 'bounce' | 'orbit' | 'dots';
    className?: string;
    color?: 'primary' | 'secondary' | 'accent' | 'muted';
}

const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
};

const colorClasses = {
    primary: 'bg-primary',
    secondary: 'bg-secondary',
    accent: 'bg-accent',
    muted: 'bg-muted',
};

export default function LoadingSpinner({
    size = 'md',
    variant = 'pulse',
    className,
    color = 'primary',
}: LoadingSpinnerProps) {
    const baseClasses = cn(sizeClasses[size], colorClasses[color], className);

    switch (variant) {
        case 'pulse':
            return (
                <motion.div
                    className={cn(baseClasses, 'rounded-full')}
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [1, 0.7, 1],
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                />
            );

        case 'float':
            return (
                <motion.div
                    className={cn(baseClasses, 'rounded-full')}
                    animate={{
                        y: [0, -10, 0],
                        rotate: [0, 180, 360],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                />
            );

        case 'bounce':
            return (
                <motion.div
                    className={cn(baseClasses, 'rounded-full')}
                    animate={{
                        y: [0, -15, 0],
                    }}
                    transition={{
                        duration: 0.8,
                        repeat: Infinity,
                        ease: 'easeOut',
                        bounce: 0.5,
                    }}
                />
            );

        case 'orbit':
            return (
                <div className={cn('relative', sizeClasses[size])}>
                    <motion.div
                        className={cn(
                            'absolute inset-0 rounded-full border-2 border-t-transparent border-r-transparent',
                            colorClasses[color].replace('bg-', 'border-')
                        )}
                        animate={{
                            rotate: 360,
                        }}
                        transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: 'linear',
                        }}
                    />
                </div>
            );

        case 'dots':
            return (
                <div className="flex space-x-1">
                    {[0, 1, 2].map((i) => (
                        <motion.div
                            key={i}
                            className={cn(
                                'rounded-full',
                                size === 'sm' ? 'w-1 h-1' : size === 'md' ? 'w-2 h-2' : size === 'lg' ? 'w-3 h-3' : 'w-4 h-4',
                                colorClasses[color]
                            )}
                            animate={{
                                scale: [1, 1.3, 1],
                                opacity: [1, 0.5, 1],
                            }}
                            transition={{
                                duration: 1.2,
                                repeat: Infinity,
                                delay: i * 0.2,
                                ease: 'easeInOut',
                            }}
                        />
                    ))}
                </div>
            );

        default:
            return (
                <motion.div
                    className={cn(baseClasses, 'rounded-full')}
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [1, 0.7, 1],
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                />
            );
    }
}

// Specialized AI loading spinner
export function AILoadingSpinner({ className }: { className?: string }) {
    return (
        <div className={cn('flex items-center space-x-2', className)}>
            <LoadingSpinner size="sm" variant="float" color="primary" />
            <div className="flex space-x-1">
                {[0, 1, 2].map((i) => (
                    <motion.div
                        key={i}
                        className="w-1 h-1 bg-primary rounded-full"
                        animate={{
                            scale: [1, 1.5, 1],
                            opacity: [0.5, 1, 0.5],
                        }}
                        transition={{
                            duration: 1,
                            repeat: Infinity,
                            delay: i * 0.3,
                            ease: 'easeInOut',
                        }}
                    />
                ))}
            </div>
        </div>
    );
}

// Page loading component
export function PageLoading({ message = 'Loading...' }: { message?: string }) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[200px] space-y-4">
            <LoadingSpinner size="lg" variant="orbit" color="primary" />
            <motion.p
                className="text-muted-foreground text-center"
                animate={{
                    opacity: [0.5, 1, 0.5],
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
            >
                {message}
            </motion.p>
        </div>
    );
}

// Inline loading for buttons and forms
export function InlineLoading({ size = 'sm' }: { size?: 'sm' | 'md' }) {
    return (
        <div className="flex items-center justify-center">
            <LoadingSpinner size={size} variant="dots" color="primary" />
        </div>
    );
}
