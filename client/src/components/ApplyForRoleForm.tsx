
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { trpc } from '@/utils/trpc';
import { useState } from 'react';
import type { CreateApplicationInput, Role } from '../../../server/src/schema';

interface ApplyForRoleFormProps {
  ideaId: number;
  applicantId: number;
  roles: Role[];
  onSuccess: () => Promise<void>;
}

export function ApplyForRoleForm({ applicantId, roles, onSuccess }: ApplyForRoleFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [motivation, setMotivation] = useState('');
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const applicationData: CreateApplicationInput = {
        // If no roles are available, use a placeholder role_id (1)
        // This should be handled properly when the server supports fetching roles
        role_id: roles.length > 0 ? parseInt(selectedRoleId) : 1,
        applicant_id: applicantId,
        motivation
      };
      
      await trpc.applyForRole.mutate(applicationData);
      await onSuccess();
      setMotivation('');
      setSelectedRoleId('');
    } catch (error) {
      console.error('Failed to apply for role:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {roles.length > 0 && (
        <div>
          <Label htmlFor="role">Select Role to Apply For *</Label>
          <Select
            value={selectedRoleId}
            onValueChange={setSelectedRoleId}
            required
          >
            <SelectTrigger id="role">
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              {roles.map((role: Role) => (
                <SelectItem key={role.id} value={role.id.toString()}> 
                  {role.title} ({role.compensation_type})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {roles.length === 0 && (
        <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> No specific roles have been defined for this idea yet. Your application will be treated as a general expression of interest.
          </p>
        </div>
      )}

      <div>
        <Label htmlFor="motivation">
          {roles.length > 0 ? 'Why are you interested in this role?' : 'Why are you interested in this idea?'} *
        </Label>
        <Textarea
          id="motivation"
          value={motivation}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            setMotivation(e.target.value)
          }
          placeholder={
            roles.length > 0 
              ? "Describe your motivation, relevant skills, and what you can contribute to this role"
              : "Describe your motivation, relevant skills, and what you can contribute to this idea"
          }
          rows={5}
          required
        />
      </div>

      <div className="text-sm text-gray-600 p-3 bg-blue-50 rounded-lg">
        💡 <strong>Tip:</strong> Be specific about your skills and experience. Explain how you can add value to this project and what excites you about the idea.
      </div>

      <Button 
        type="submit" 
        disabled={isLoading || (roles.length > 0 && !selectedRoleId)}
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
      >
        {isLoading ? 'Submitting...' : '🚀 Express Interest'}
      </Button>
    </form>
  );
}
