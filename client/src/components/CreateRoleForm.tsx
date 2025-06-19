
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { trpc } from '@/utils/trpc';
import { useState } from 'react';
import type { CreateRoleInput } from '../../../server/src/schema';

interface CreateRoleFormProps {
  ideaId: number;
  onSuccess: () => Promise<void>;
}

export function CreateRoleForm({ ideaId, onSuccess }: CreateRoleFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CreateRoleInput>({
    idea_id: ideaId,
    title: '',
    description: '',
    compensation_type: 'Volunteer'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await trpc.createRole.mutate(formData);
      await onSuccess();
      // Reset form
      setFormData({
        idea_id: ideaId,
        title: '',
        description: '',
        compensation_type: 'Volunteer'
      });
    } catch (error) {
      console.error('Failed to create role:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="role-title">Role Title *</Label>
        <Input
          id="role-title"
          value={formData.title}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setFormData((prev: CreateRoleInput) => ({ ...prev, title: e.target.value }))
          }
          placeholder="e.g., Frontend Developer, UI/UX Designer"
          required
        />
      </div>

      <div>
        <Label htmlFor="role-description">Role Description *</Label>
        <Textarea
          id="role-description"
          value={formData.description}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            setFormData((prev: CreateRoleInput) => ({ ...prev, description: e.target.value }))
          }
          placeholder="Describe the responsibilities and requirements for this role"
          rows={4}
          required
        />
      </div>

      <div>
        <Label htmlFor="compensation">Compensation Type *</Label>
        <Select
          value={formData.compensation_type || 'Volunteer'}
          onValueChange={(value: 'Volunteer' | 'Compensated') =>
            setFormData((prev: CreateRoleInput) => ({ ...prev, compensation_type: value }))
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Volunteer">🤝 Volunteer</SelectItem>
            <SelectItem value="Compensated">💰 Compensated</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button 
        type="submit" 
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? 'Creating...' : '👥 Create Role'}
      </Button>
    </form>
  );
}
