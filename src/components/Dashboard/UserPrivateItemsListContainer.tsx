import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getUserPrivateItems } from '@/data/anon/privateItems';
import Link from 'next/link';

export default async function UserPrivateItemsListContainer() {
    const privateItems = await getUserPrivateItems();

    return (
        <div className="space-y-8">
            {privateItems.length === 0 ? (
                <Card>
                    <CardHeader>
                        <CardTitle>No Private Items</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground mb-4">
                            You haven't created any private items yet.
                        </p>
                        <Link href="/dashboard/new">
                            <Button>Create Your First Private Item</Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {privateItems.map((item) => (
                        <Card key={item.id}>
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <CardTitle className="text-lg">{item.name}</CardTitle>
                                    <Badge variant="secondary">Private</Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">{item.description}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
