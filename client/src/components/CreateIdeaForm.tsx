
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { trpc } from '@/utils/trpc';
import { useState } from 'react';
import type { CreateIdeaInput } from '../../../server/src/schema';

interface CreateIdeaFormProps {
  currentUserId: number;
  onSuccess: () => Promise<void>;
}

export function CreateIdeaForm({ currentUserId, onSuccess }: CreateIdeaFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CreateIdeaInput>({
    title: '',
    description: '',
    owner_id: currentUserId,
    development_stage: 'Concept',
    is_for_sale: undefined,
    price: undefined,
    price_reasoning: undefined
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await trpc.createIdea.mutate(formData);
      await onSuccess();
      // Reset form
      setFormData({
        title: '',
        description: '',
        owner_id: currentUserId,
        development_stage: 'Concept',
        is_for_sale: undefined,
        price: undefined,
        price_reasoning: undefined
      });
    } catch (error) {
      console.error('Failed to create idea:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setFormData((prev: CreateIdeaInput) => ({ ...prev, title: e.target.value }))
          }
          placeholder="Enter your idea title"
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            setFormData((prev: CreateIdeaInput) => ({ ...prev, description: e.target.value }))
          }
          placeholder="Describe your idea in detail"
          rows={4}
          required
        />
      </div>

      <div>
        <Label htmlFor="stage">Development Stage *</Label>
        <Select
          value={formData.development_stage || 'Concept'}
          onValueChange={(value: 'Concept' | 'Prototype' | 'MVP' | 'Launched') =>
            setFormData((prev: CreateIdeaInput) => ({ ...prev, development_stage: value }))
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Concept">💡 Concept</SelectItem>
            <SelectItem value="Prototype">🔧 Prototype</SelectItem>
            <SelectItem value="MVP">🚀 MVP</SelectItem>
            <SelectItem value="Launched">✅ Launched</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {formData.development_stage === 'Launched' && (
        <div className="space-y-4 p-4 border rounded-lg bg-green-50">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="for-sale"
              checked={formData.is_for_sale || false}
              onCheckedChange={(checked: boolean) =>
                setFormData((prev: CreateIdeaInput) => ({ 
                  ...prev, 
                  is_for_sale: checked,
                  price: checked ? prev.price : undefined,
                  price_reasoning: checked ? prev.price_reasoning : undefined
                }))
              }
            />
            <Label htmlFor="for-sale">This idea is for sale</Label>
          </div>

          {formData.is_for_sale && (
            <>
              <div>
                <Label htmlFor="price">Price ($)</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData((prev: CreateIdeaInput) => ({ 
                      ...prev, 
                      price: e.target.value ? parseFloat(e.target.value) : undefined 
                    }))
                  }
                  placeholder="Enter price"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <Label htmlFor="price-reasoning">Price Reasoning</Label>
                <Textarea
                  id="price-reasoning"
                  value={formData.price_reasoning || ''}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setFormData((prev: CreateIdeaInput) => ({ 
                      ...prev, 
                      price_reasoning: e.target.value || undefined 
                    }))
                  }
                  placeholder="Explain your pricing rationale"
                  rows={3}
                />
              </div>
            </>
          )}
        </div>
      )}

      <Button 
        type="submit" 
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
      >
        {isLoading ? 'Creating...' : '✨ Submit Idea'}
      </Button>
    </form>
  );
}
