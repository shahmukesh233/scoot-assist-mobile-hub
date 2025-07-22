import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, ArrowLeft, Send } from 'lucide-react';

const supportFormSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.string().min(1, 'Please select a category'),
  priority: z.string().min(1, 'Please select a priority'),
});

type SupportFormData = z.infer<typeof supportFormSchema>;

interface SupportFormProps {
  initialQuestion?: string;
  initialCategory?: string;
  onBack: () => void;
  onSuccess: () => void;
}

const SupportForm = ({ initialQuestion, initialCategory, onBack, onSuccess }: SupportFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const form = useForm<SupportFormData>({
    resolver: zodResolver(supportFormSchema),
    defaultValues: {
      title: initialQuestion ? initialQuestion.slice(0, 100) : '',
      description: initialQuestion || '',
      category: initialCategory || '',
      priority: 'medium',
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Please select a file smaller than 10MB',
          variant: 'destructive',
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const uploadFile = async (file: File, customerId: string): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${customerId}/${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('support-attachments')
        .upload(fileName, file);

      if (error) throw error;
      return data.path;
    } catch (error) {
      console.error('File upload error:', error);
      return null;
    }
  };

  const onSubmit = async (data: SupportFormData) => {
    setIsSubmitting(true);
    
    try {
      // Generate a proper UUID for demo purposes
      // In a real app, this would come from the authenticated user
      const mockCustomerId = crypto.randomUUID();
      
      let attachmentUrl = null;
      
      // Upload file if selected
      if (selectedFile) {
        attachmentUrl = await uploadFile(selectedFile, mockCustomerId);
        if (!attachmentUrl) {
          throw new Error('File upload failed');
        }
      }

      // Create support ticket
      const { error } = await supabase
        .from('support_tickets')
        .insert({
          customer_id: mockCustomerId,
          title: data.title,
          description: data.description,
          category: data.category,
          priority: data.priority,
          attachment_url: attachmentUrl,
          status: 'open'
        });

      if (error) throw error;

      toast({
        title: 'Ticket Created Successfully',
        description: 'Your support request has been submitted. We\'ll get back to you soon!',
      });

      onSuccess();
    } catch (error) {
      console.error('Submission error:', error);
      toast({
        title: 'Submission Failed',
        description: 'There was an error submitting your request. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Questions
        </Button>
        
        <Card className="shadow-soft border-0">
          <CardHeader>
            <CardTitle>Submit Support Request</CardTitle>
            <CardDescription>
              Tell us about your issue and we'll help you resolve it
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Brief description of your issue" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Please provide detailed information about your issue, including any error messages or steps to reproduce the problem..."
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="battery">Battery Issues</SelectItem>
                            <SelectItem value="mechanical">Mechanical Problems</SelectItem>
                            <SelectItem value="safety">Safety Concerns</SelectItem>
                            <SelectItem value="general">General Questions</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priority</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="urgent">Urgent</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Attachment (Optional)</label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                    {selectedFile ? (
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Selected: {selectedFile.name}</p>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setSelectedFile(null)}
                        >
                          Remove File
                        </Button>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground mb-2">
                          Upload images, videos, or documents to help explain your issue
                        </p>
                        <input
                          type="file"
                          id="file-upload"
                          className="hidden"
                          accept="image/*,video/*,.pdf,.doc,.docx,.txt"
                          onChange={handleFileSelect}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById('file-upload')?.click()}
                        >
                          Choose File
                        </Button>
                        <p className="text-xs text-muted-foreground mt-2">
                          Max file size: 10MB
                        </p>
                      </>
                    )}
                  </div>
                  
                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  )}
                </div>

                <Button type="submit" disabled={isSubmitting} className="w-full">
                  {isSubmitting ? (
                    'Submitting...'
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Submit Support Request
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SupportForm;