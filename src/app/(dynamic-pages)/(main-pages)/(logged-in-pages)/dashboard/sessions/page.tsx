'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageLoading } from '@/components/ui/loading-spinner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { T } from '@/components/ui/Typography';
import { useChildSession } from '@/hooks/useChildSession';
import { useParentDashboard } from '@/hooks/useParentDashboard';
import { createClient } from '@/supabase-clients/client';
import { Play, Plus, UserPlus, Users } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

export default function SessionsPage() {
  const {
    children: familyChildren,
    sessions: sessionList,
    isLoading,
    refreshData,
    fetchFamilyData,
  } = useParentDashboard();
  const { startSession } = useChildSession();
  const [userRole, setUserRole] = useState<'parent' | 'child' | null>(null);
  const [startingSession, setStartingSession] = useState(false);
  const [showAddChild, setShowAddChild] = useState(false);
  const [newChildName, setNewChildName] = useState('');
  const [newChildAge, setNewChildAge] = useState('');
  const [addingChild, setAddingChild] = useState(false);
  const hasFetchedRef = useRef(false);

  // Initialize family data on component mount
  useEffect(() => {
    if (!hasFetchedRef.current && !isLoading && familyChildren.length === 0) {
      hasFetchedRef.current = true;
      fetchFamilyData().catch(console.error);
    }
  }, [fetchFamilyData, isLoading, familyChildren.length]);

  useEffect(() => {
    async function checkRole() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: member } = await supabase
        .from('family_members')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (member) {
        setUserRole(member.role as 'parent' | 'child');
      }
    }
    checkRole();
  }, []);

  const handleAddChild = async () => {
    if (!newChildName || !newChildAge) return;

    setAddingChild(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      // Get family ID
      const { data: member } = await supabase
        .from('family_members')
        .select('family_id')
        .eq('user_id', user.id)
        .single();

      if (!member) throw new Error('No family found');

      // Create child profile
      await supabase.from('child_profiles').insert({
        user_id: user.id, // For now, parent manages child profiles
        family_id: member.family_id,
        display_name: newChildName,
        age_range: newChildAge as any,
      });

      // Reset form
      setNewChildName('');
      setNewChildAge('');
      setShowAddChild(false);

      // Refresh data properly
      if (member.family_id) {
        await refreshData(member.family_id);
      }
    } catch (error) {
      console.error('Error adding child:', error);
    } finally {
      setAddingChild(false);
    }
  };

  const handleStartSession = async (childId: string, familyId: string) => {
    setStartingSession(true);
    try {
      const session = await startSession(familyId, childId);
      // Redirect to session page
      window.location.href = `/dashboard/child-session/${session.id}`;
    } catch (error) {
      console.error('Failed to start session:', error);
    } finally {
      setStartingSession(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
        <T.H1>Coaching Sessions</T.H1>
        <PageLoading message="Loading your sessions..." />
      </div>
    );
  }

  const children = familyChildren || [];
  const activeSessions =
    sessionList?.filter((s) => s.status === 'active') || [];

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <T.H1>Coaching Sessions</T.H1>
      </div>

      {userRole === 'parent' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Start New Session
            </CardTitle>
          </CardHeader>
          <CardContent>
            {children.length === 0 ? (
              <div className="text-center space-y-4">
                <p className="text-muted-foreground">
                  No children in your family yet.
                </p>
                <Button onClick={() => setShowAddChild(true)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Your First Child
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {children.map((child) => (
                  <Card key={child.user_id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">
                          {child.display_name || 'Child'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Age range: {child.age_range || 'Unknown'}
                        </p>
                      </div>
                      <Button
                        onClick={() =>
                          handleStartSession(child.id, child.family_id)
                        }
                        disabled={startingSession}
                        className="flex items-center gap-2"
                      >
                        <Play className="h-4 w-4" />
                        Start
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {userRole === 'parent' && (children.length > 0 || showAddChild) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Manage Children
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!showAddChild ? (
              <Button onClick={() => setShowAddChild(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Another Child
              </Button>
            ) : (
              <div className="space-y-4 max-w-md">
                <div className="space-y-2">
                  <Label htmlFor="child-name">Child's Name</Label>
                  <Input
                    id="child-name"
                    placeholder="e.g., Emma"
                    value={newChildName}
                    onChange={(e) => setNewChildName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="child-age">Age Range</Label>
                  <Select value={newChildAge} onValueChange={setNewChildAge}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select age range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="6-8">6-8 years</SelectItem>
                      <SelectItem value="9-11">9-11 years</SelectItem>
                      <SelectItem value="12-14">12-14 years</SelectItem>
                      <SelectItem value="15-17">15-17 years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleAddChild}
                    disabled={!newChildName || !newChildAge || addingChild}
                    className="flex-1"
                  >
                    {addingChild ? 'Adding...' : 'Add Child'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowAddChild(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {(userRole === 'child' || userRole === 'parent') && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Active Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeSessions.length === 0 ? (
              <p className="text-muted-foreground">No active sessions.</p>
            ) : (
              <div className="space-y-2">
                {activeSessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">
                        Session with {session.childName || 'Child'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Started{' '}
                        {new Date(session.startedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Link href={`/dashboard/child-session/${session.id}`}>
                      <Button variant="outline">Continue</Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
