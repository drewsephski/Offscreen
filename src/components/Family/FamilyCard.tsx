'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createClient } from '@/supabase-clients/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Baby, Heart, Plus, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const addChildSchema = z.object({
    displayName: z.string().min(1, 'Display name is required').max(50, 'Name must be less than 50 characters'),
    ageRange: z.enum(['6-8', '9-11', '12-14', '15-17'], {
        required_error: 'Please select an age range',
    }),
});

type AddChildFormData = z.infer<typeof addChildSchema>;

interface Child {
    id: string;
    display_name: string;
    age_range: string;
    created_at: string;
}

interface Family {
    id: string;
    name: string;
    created_at: string;
    userRole: string;
    children?: Child[];
}

interface FamilyCardProps {
    family: Family;
    onChildAdded: () => void;
}

export function FamilyCard({ family, onChildAdded }: FamilyCardProps) {
    const [children, setChildren] = useState<Child[]>(family.children || []);
    const [isAddChildOpen, setIsAddChildOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<AddChildFormData>({
        resolver: zodResolver(addChildSchema),
        defaultValues: {
            displayName: '',
            ageRange: undefined,
        },
    });

    useEffect(() => {
        setChildren(family.children || []);
    }, [family.children]);

    const handleAddChild = async (data: AddChildFormData) => {
        setIsSubmitting(true);

        try {
            const supabase = createClient();
            const { data: { user }, error: authError } = await supabase.auth.getUser();

            if (authError || !user) {
                throw new Error('Authentication error. Please sign in again.');
            }

            // Create child profile
            const { data: newChild, error: childError } = await supabase
                .from('child_profiles')
                .insert({
                    family_id: family.id,
                    user_id: user.id,
                    display_name: data.displayName,
                    age_range: data.ageRange,
                })
                .select()
                .single();

            if (childError) {
                console.error('Child creation error:', childError);
                throw new Error('Failed to create child profile. Please try again.');
            }

            // Create family membership for the child
            const { error: memberError } = await supabase
                .from('family_members')
                .insert({
                    family_id: family.id,
                    user_id: user.id,
                    role: 'child',
                });

            if (memberError) {
                console.error('Child membership error:', memberError);
                throw new Error('Failed to set up child membership. Please try again.');
            }

            setChildren(prev => [...prev, newChild as Child]);
            setIsAddChildOpen(false);
            form.reset();
            onChildAdded();

            toast.success(`${data.displayName} has been added to your family.`);
        } catch (error) {
            console.error('Add child error:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to add child. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Card className="border-l-4 border-l-primary shadow-lg">
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Heart className="h-5 w-5 text-red-500" />
                                <CardTitle className="text-xl">{family.name}</CardTitle>
                            </div>
                            <CardDescription>
                                Family coaching space • {children.length} {children.length === 1 ? 'child' : 'children'}
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground bg-muted px-2 py-1 rounded">
                            <Users className="h-3 w-3" />
                            <span className="capitalize">{family.userRole}</span>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {children.length > 0 ? (
                        <div className="space-y-3">
                            <h4 className="text-sm font-medium text-muted-foreground">Children</h4>
                            <div className="grid gap-2">
                                {children.map((child) => (
                                    <motion.div
                                        key={child.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border"
                                    >
                                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                            <Baby className="h-4 w-4 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium">{child.display_name}</p>
                                            <p className="text-sm text-muted-foreground">Age: {child.age_range}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-6 text-muted-foreground">
                            <Baby className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No children added yet</p>
                            <p className="text-xs">Add your first child to start coaching</p>
                        </div>
                    )}

                    <Dialog open={isAddChildOpen} onOpenChange={setIsAddChildOpen}>
                        <DialogTrigger asChild>
                            <Button className="w-full" variant="outline">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Child
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Add Child to Family</DialogTitle>
                                <DialogDescription>
                                    Create a profile for your child to enable personalized coaching sessions.
                                </DialogDescription>
                            </DialogHeader>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(handleAddChild)} className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="displayName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Display Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="e.g., Emma" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="ageRange"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Age Range</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select age range" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="6-8">6-8 years</SelectItem>
                                                        <SelectItem value="9-11">9-11 years</SelectItem>
                                                        <SelectItem value="12-14">12-14 years</SelectItem>
                                                        <SelectItem value="15-17">15-17 years</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <div className="flex gap-2 pt-4">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setIsAddChildOpen(false)}
                                            className="flex-1"
                                        >
                                            Cancel
                                        </Button>
                                        <Button type="submit" disabled={isSubmitting} className="flex-1">
                                            {isSubmitting ? 'Adding...' : 'Add Child'}
                                        </Button>
                                    </div>
                                </form>
                            </Form>
                        </DialogContent>
                    </Dialog>
                </CardContent>
            </Card>
        </motion.div>
    );
}
