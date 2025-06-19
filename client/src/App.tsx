
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { trpc } from '@/utils/trpc';
import { useState, useEffect, useCallback } from 'react';
import { CreateIdeaForm } from '@/components/CreateIdeaForm';
import { CreateRoleForm } from '@/components/CreateRoleForm';
import { ApplyForRoleForm } from '@/components/ApplyForRoleForm';
import { UserProfile } from '@/components/UserProfile';
import type { Idea, User, Role } from '../../server/src/schema';

function App() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [ideaRoles, setIdeaRoles] = useState<Role[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [createIdeaOpen, setCreateIdeaOpen] = useState(false);
  const [createRoleOpen, setCreateRoleOpen] = useState(false);
  const [applyRoleOpen, setApplyRoleOpen] = useState(false);
  const [userProfileOpen, setUserProfileOpen] = useState(false);
  const [backendError, setBackendError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Current user ID - would come from authentication system
  const CURRENT_USER_ID = 1;

  const loadIdeas = useCallback(async () => {
    try {
      setBackendError(null);
      const result = await trpc.getAllIdeas.query();
      setIdeas(result);
    } catch (error) {
      console.error('Failed to load ideas:', error);
      setBackendError('Unable to connect to the backend. Please check if the server is running.');
      setIdeas([]);
    }
  }, []);

  const loadCurrentUser = useCallback(async () => {
    try {
      setBackendError(null);
      const user = await trpc.getUserById.query(CURRENT_USER_ID);
      setCurrentUser(user);
    } catch (error) {
      console.error('Failed to load current user:', error);
      // Create a fallback user when backend is not available
      setCurrentUser({
        id: CURRENT_USER_ID,
        name: 'Test User',
        email: 'test@example.com',
        bio: null,
        skills: [],
        created_at: new Date()
      });
    }
  }, []);

  // Fetch roles when selectedIdea changes
  useEffect(() => {
    if (selectedIdea) {
      const fetchRoles = async () => {
        try {
          // Check if getRolesByIdeaId exists on the trpc client
          if ('getRolesByIdeaId' in trpc) {
            const trpcWithRoles = trpc as typeof trpc & {
              getRolesByIdeaId: { query: (id: number) => Promise<Role[]> };
            };
            const roles = await trpcWithRoles.getRolesByIdeaId.query(selectedIdea.id);
            setIdeaRoles(roles);
          } else {
            // Endpoint not implemented yet
            setIdeaRoles([]);
            console.log(`getRolesByIdeaId endpoint not yet implemented for idea ${selectedIdea.id}`);
          }
        } catch (error) {
          console.error(`Failed to fetch roles for idea ${selectedIdea.id}:`, error);
          setIdeaRoles([]);
        }
      };
      fetchRoles();
    } else {
      setIdeaRoles([]); // Clear roles when no idea is selected
    }
  }, [selectedIdea]);

  useEffect(() => {
    const initializeApp = async () => {
      setIsLoading(true);
      await Promise.all([loadIdeas(), loadCurrentUser()]);
      setIsLoading(false);
    };
    
    initializeApp();
  }, [loadIdeas, loadCurrentUser]);

  const handleCreateIdea = async () => {
    await loadIdeas();
    setCreateIdeaOpen(false);
  };

  const handleCreateRole = async () => {
    await loadIdeas();
    setCreateRoleOpen(false);
  };

  const handleApplyForRole = async () => {
    setApplyRoleOpen(false);
  };

  const handleUpdateProfile = async () => {
    await loadCurrentUser();
    setUserProfileOpen(false);
  };

  const getDevelopmentStageColor = (stage: string) => {
    switch (stage) {
      case 'Concept': return 'bg-blue-100 text-blue-800';
      case 'Prototype': return 'bg-yellow-100 text-yellow-800';
      case 'MVP': return 'bg-orange-100 text-orange-800';
      case 'Launched': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <div className="text-4xl mb-4">🚀</div>
          <h2 className="text-xl font-semibold mb-2">Loading SILKLABS...</h2>
          <p className="text-gray-600">Connecting to the platform</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                🚀 SILKLABS
              </h1>
              <p className="text-gray-600">Connect Ideas with Collaborators</p>
            </div>
            <div className="flex items-center gap-3">
              {currentUser && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Welcome, {currentUser.name}!</span>
                  <Dialog open={userProfileOpen} onOpenChange={setUserProfileOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">👤 Profile</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Your Profile</DialogTitle>
                        <DialogDescription>Update your profile information</DialogDescription>
                      </DialogHeader>
                      <UserProfile 
                        user={currentUser} 
                        onUpdate={handleUpdateProfile}
                      />
                    </DialogContent>
                  </Dialog>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Backend Error Alert */}
        {backendError && (
          <Alert className="mb-6 border-orange-200 bg-orange-50">
            <AlertDescription className="text-orange-800">
              <strong>⚠️ Backend Connection Issue:</strong> {backendError}
              <br />
              <span className="text-sm">The frontend is running in demo mode with limited functionality.</span>
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="browse" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="browse">💡 Browse Ideas</TabsTrigger>
            <TabsTrigger value="my-ideas">📋 My Ideas</TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Discover Ideas</h2>
              <Dialog open={createIdeaOpen} onOpenChange={setCreateIdeaOpen}>
                <DialogTrigger asChild>
                  <Button 
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    disabled={!!backendError}
                  >
                    ✨ Submit New Idea
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Submit Your Idea</DialogTitle>
                    <DialogDescription>Share your idea with the SILKLABS community</DialogDescription>
                  </DialogHeader>
                  <CreateIdeaForm 
                    currentUserId={CURRENT_USER_ID}
                    onSuccess={handleCreateIdea}
                  />
                </DialogContent>
              </Dialog>
            </div>

            {ideas.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <div className="text-4xl mb-4">💭</div>
                  {backendError ? (
                    <div>
                      <p className="text-gray-500 mb-4">Unable to load ideas from the backend.</p>
                      <p className="text-sm text-gray-400">Please ensure the server is running and try refreshing the page.</p>
                    </div>
                  ) : (
                    <p className="text-gray-500">No ideas yet. Be the first to share yours!</p>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {ideas.map((idea: Idea) => (
                  <Card key={idea.id} className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-purple-500">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <CardTitle className="text-lg">{idea.title}</CardTitle>
                          <Badge className={getDevelopmentStageColor(idea.development_stage)}>
                            {idea.development_stage}
                          </Badge>
                        </div>
                        {idea.is_for_sale && (
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            💰 For Sale
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="line-clamp-3 mb-4">
                        {idea.description}
                      </CardDescription>
                      
                      {idea.is_for_sale && idea.price && (
                        <div className="mb-4 p-3 bg-green-50 rounded-lg">
                          <div className="font-semibold text-green-800">
                            Price: ${idea.price.toLocaleString()}
                          </div>
                          {idea.price_reasoning && (
                            <div className="text-sm text-green-600 mt-1">
                              {idea.price_reasoning}
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          Created: {idea.created_at.toLocaleDateString()}
                        </span>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedIdea(idea)}
                          >
                            👁️ View Details
                          </Button>
                          {idea.development_stage !== 'Launched' && idea.owner_id === CURRENT_USER_ID && (
                            <Dialog open={createRoleOpen} onOpenChange={setCreateRoleOpen}>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="secondary" disabled={!!backendError}>
                                  👥 Add Role
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Create Role for "{idea.title}"</DialogTitle>
                                  <DialogDescription>Define a role you need for this idea</DialogDescription>
                                </DialogHeader>
                                <CreateRoleForm 
                                  ideaId={idea.id}
                                  onSuccess={handleCreateRole}
                                />
                              </DialogContent>
                            </Dialog>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="my-ideas" className="space-y-6">
            <h2 className="text-2xl font-semibold">My Ideas</h2>
            {ideas.filter(idea => idea.owner_id === CURRENT_USER_ID).length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <div className="text-4xl mb-4">📝</div>
                  {backendError ? (
                    <div>
                      <p className="text-gray-500 mb-4">Unable to load your ideas from the backend.</p>
                      <p className="text-sm text-gray-400">Please ensure the server is running and try refreshing the page.</p>
                    </div>
                  ) : (
                    <>
                      <p className="text-gray-500">You haven't submitted any ideas yet.</p>
                      <Dialog open={createIdeaOpen} onOpenChange={setCreateIdeaOpen}>
                        <DialogTrigger asChild>
                          <Button className="mt-4">Submit Your First Idea</Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Submit Your Idea</DialogTitle>
                            <DialogDescription>Share your idea with the SILKLABS community</DialogDescription>
                          </DialogHeader>
                          <CreateIdeaForm 
                            currentUserId={CURRENT_USER_ID}
                            onSuccess={handleCreateIdea}
                          />
                        </DialogContent>
                      </Dialog>
                    </>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {ideas.filter(idea => idea.owner_id === CURRENT_USER_ID).map((idea: Idea) => (
                  <Card key={idea.id} className="border-l-4 border-l-blue-500">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <CardTitle className="text-lg">{idea.title}</CardTitle>
                          <Badge className={getDevelopmentStageColor(idea.development_stage)}>
                            {idea.development_stage}
                          </Badge>
                        </div>
                        {idea.is_for_sale && (
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            💰 For Sale
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="line-clamp-3 mb-4">
                        {idea.description}
                      </CardDescription>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          Created: {idea.created_at.toLocaleDateString()}
                        </span>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedIdea(idea)}
                          >
                            👁️ View Details
                          </Button>
                          {idea.development_stage !== 'Launched' && (
                            <Dialog open={createRoleOpen} onOpenChange={setCreateRoleOpen}>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="secondary" disabled={!!backendError}>
                                  👥 Add Role
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Create Role for "{idea.title}"</DialogTitle>
                                  <DialogDescription>Define a role you need for this idea</DialogDescription>
                                </DialogHeader>
                                <CreateRoleForm 
                                  ideaId={idea.id}
                                  onSuccess={handleCreateRole}
                                />
                              </DialogContent>
                            </Dialog>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Idea Details Dialog */}
        {selectedIdea && (
          <Dialog open={!!selectedIdea} onOpenChange={() => setSelectedIdea(null)}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <DialogTitle className="text-2xl">{selectedIdea.title}</DialogTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className={getDevelopmentStageColor(selectedIdea.development_stage)}>
                        {selectedIdea.development_stage}
                      </Badge>
                      {selectedIdea.is_for_sale && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          💰 For Sale
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </DialogHeader>
              
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-gray-700">{selectedIdea.description}</p>
                </div>

                {selectedIdea.is_for_sale && selectedIdea.price && (
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h3 className="font-semibold text-green-800 mb-2">
                      💰 Available for Purchase - ${selectedIdea.price.toLocaleString()}
                    </h3>
                    {selectedIdea.price_reasoning && (
                      <p className="text-green-600">{selectedIdea.price_reasoning}</p>
                    )}
                  </div>
                )}

                {selectedIdea.development_stage !== 'Launched' && ideaRoles.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Required Roles</h3>
                    <div className="grid gap-3 grid-cols-1 md:grid-cols-2">
                      {ideaRoles.map((role: Role) => (
                        <Card key={role.id} className="p-4">
                          <CardTitle className="text-md mb-1">{role.title}</CardTitle>
                          <CardDescription className="text-sm line-clamp-2 mb-2">{role.description}</CardDescription>
                          <Badge variant="outline" className="w-fit">
                            {role.compensation_type === 'Compensated' ? '💰 Compensated' : '🤝 Volunteer'}
                          </Badge>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {selectedIdea.development_stage !== 'Launched' && selectedIdea.owner_id !== CURRENT_USER_ID && (
                  <div className="flex justify-center pt-4">
                    <Dialog open={applyRoleOpen} onOpenChange={setApplyRoleOpen}>
                      <DialogTrigger asChild>
                        <Button 
                          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                          disabled={!!backendError}
                        >
                          🤝 Interested in Collaborating?
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Apply for Collaboration</DialogTitle>
                          <DialogDescription>Express your interest in working on "{selectedIdea.title}"</DialogDescription>
                        </DialogHeader>
                        {backendError ? (
                          <Alert className="border-orange-200 bg-orange-50">
                            <AlertDescription className="text-orange-800">
                              Application submission is currently unavailable due to backend connection issues.
                            </AlertDescription>
                          </Alert>
                        ) : (
                          <ApplyForRoleForm 
                            ideaId={selectedIdea.id}
                            applicantId={CURRENT_USER_ID}
                            roles={ideaRoles}
                            onSuccess={handleApplyForRole}
                          />
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                )}

                {selectedIdea.development_stage !== 'Launched' && ideaRoles.length === 0 && selectedIdea.owner_id !== CURRENT_USER_ID && !backendError && (
                  <p className="text-center text-gray-500 italic mt-4">No specific roles listed for this idea yet. You can still express general interest.</p>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}

export default App;
