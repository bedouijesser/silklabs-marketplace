
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { trpc } from '@/utils/trpc';
import { useState } from 'react';
import type { User, UpdateUserInput } from '../../../server/src/schema';

interface UserProfileProps {
  user: User;
  onUpdate: () => Promise<void>;
}

export function UserProfile({ user, onUpdate }: UserProfileProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UpdateUserInput>({
    id: user.id,
    name: user.name,
    bio: user.bio,
    skills: user.skills
  });
  const [newSkill, setNewSkill] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await trpc.updateUserProfile.mutate(formData);
      await onUpdate();
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills?.includes(newSkill.trim())) {
      setFormData((prev: UpdateUserInput) => ({
        ...prev,
        skills: [...(prev.skills || []), newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData((prev: UpdateUserInput) => ({
      ...prev,
      skills: prev.skills?.filter(skill => skill !== skillToRemove) || []
    }));
  };

  if (!isEditing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">{user.name}</h2>
          <Button onClick={() => setIsEditing(true)} variant="outline">
            ✏️ Edit Profile
          </Button>
        </div>

        <div>
          <Label className="text-sm font-medium text-gray-600">Email</Label>
          <p className="text-lg">{user.email}</p>
        </div>

        <div>
          <Label className="text-sm font-medium text-gray-600">Bio</Label>
          <p className="text-gray-700">{user.bio || 'No bio provided yet.'}</p>
        </div>

        <div>
          <Label className="text-sm font-medium text-gray-600">Skills</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {user.skills.length > 0 ? (
              user.skills.map((skill: string) => (
                <Badge key={skill} variant="secondary">
                  {skill}
                </Badge>
              ))
            ) : (
              <p className="text-gray-500">No skills listed yet.</p>
            )}
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium text-gray-600">Member Since</Label>
          <p className="text-gray-700">{user.created_at.toLocaleDateString()}</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="name">Name *</Label>
        <Input
          id="name"
          value={formData.name || ''}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setFormData((prev: UpdateUserInput) => ({ ...prev, name: e.target.value }))
          }
          required
        />
      </div>

      <div>
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          value={formData.bio || ''}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            setFormData((prev: UpdateUserInput) => ({ ...prev, bio: e.target.value || null }))
          }
          placeholder="Tell us about yourself..."
          rows={4}
        />
      </div>

      <div>
        <Label>Skills</Label>
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              value={newSkill}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewSkill(e.target.value)}
              placeholder="Add a skill"
              onKeyPress={(e: React.KeyboardEvent) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addSkill();
                }
              }}
            />
            <Button type="button" onClick={addSkill} variant="outline">
              Add
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {formData.skills?.map((skill: string) => (
              <Badge key={skill} variant="secondary" className="cursor-pointer hover:bg-red-100">
                {skill}
                <button
                  type="button"
                  onClick={() => removeSkill(skill)}
                  className="ml-2 text-red-500 hover:text-red-700"
                >
                  ✕
                </button>
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : '💾 Save Changes'}
        </Button>
        <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
