import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Clock, AlertCircle, CheckCircle, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { getActualUserId } from '@/lib/auth-utils';

interface SupportTicket {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  category: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  attachment_url?: string;
}

const SupportTickets = () => {
  const { toast } = useToast();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const userId = await getActualUserId();
      if (!userId) {
        window.location.href = '/';
        return;
      }

      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('customer_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTickets(data || []);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast({
        title: 'Error',
        description: 'Failed to load support tickets',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <Clock className="w-4 h-4" />;
      case 'in_progress':
        return <AlertCircle className="w-4 h-4" />;
      case 'resolved':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'resolved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'medium':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'low':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const formatCategory = (category: string) => {
    switch (category) {
      case 'battery':
        return 'Battery Issues';
      case 'mechanical':
        return 'Mechanical Problems';
      case 'safety':
        return 'Safety Concerns';
      case 'general':
        return 'General Questions';
      default:
        return category;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle p-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-8">
            <div className="text-lg">Loading support tickets...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-electric bg-clip-text text-transparent">
              Support Tickets
            </h1>
            <p className="text-muted-foreground">View and manage your support requests</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="electric" 
              onClick={() => window.location.href = '/support'}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Ticket
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/dashboard'}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Dashboard
            </Button>
          </div>
        </div>

        {/* Content */}
        {tickets.length === 0 ? (
          <Card className="shadow-soft border-0 text-center">
            <CardContent className="pt-8">
              <div className="text-muted-foreground mb-4">
                <Clock className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No Support Tickets</h3>
                <p className="text-sm">You haven't submitted any support requests yet.</p>
              </div>
              <Button 
                onClick={() => window.location.href = '/support'}
                variant="electric"
              >
                Create Your First Ticket
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {tickets.map((ticket) => (
              <Card key={ticket.id} className="shadow-soft border-0">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{ticket.title}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {ticket.description}
                      </CardDescription>
                    </div>
                    <div className="flex flex-col gap-2 ml-4">
                      <Badge className={`${getStatusColor(ticket.status)} flex items-center gap-1`}>
                        {getStatusIcon(ticket.status)}
                        {ticket.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                      <Badge className={getPriorityColor(ticket.priority)}>
                        {ticket.priority.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Category:</span>
                      <p className="font-medium">{formatCategory(ticket.category)}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Created:</span>
                      <p className="font-medium">
                        {format(new Date(ticket.created_at), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Last Updated:</span>
                      <p className="font-medium">
                        {format(new Date(ticket.updated_at), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Ticket ID:</span>
                      <p className="font-medium font-mono text-xs">
                        {ticket.id.slice(0, 8)}...
                      </p>
                    </div>
                  </div>
                  
                  {ticket.attachment_url && (
                    <div className="mt-4 pt-4 border-t">
                      <span className="text-muted-foreground text-sm">Attachment:</span>
                      <p className="text-sm font-medium">File attached</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SupportTickets;