import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Package, Truck, Clock, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { getActualUserId } from '@/lib/auth-utils';

interface Order {
  id: string;
  order_number: string;
  scooter_model: string;
  quantity: number;
  total_amount: number;
  status: string;
  delivery_address: string;
  delivery_city: string;
  estimated_delivery_date: string;
  tracking_number: string;
  created_at: string;
}

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const userId = await getActualUserId();
      if (!userId) {
        window.location.href = '/';
        return;
      }

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load orders",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'confirmed':
      case 'processing':
        return <Package className="w-4 h-4" />;
      case 'shipped':
        return <Truck className="w-4 h-4" />;
      case 'delivered':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'secondary';
      case 'confirmed':
      case 'processing':
        return 'default';
      case 'shipped':
        return 'default';
      case 'delivered':
        return 'default';
      case 'cancelled':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const formatScooterModel = (model: string) => {
    return model.replace('ms_', 'MS ').replace('_', ' ').toUpperCase();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleCreateInquiry = (order: Order) => {
    // Redirect to support with pre-filled order information
    const orderInfo = `Order Number: ${order.order_number}\nScooter Model: ${formatScooterModel(order.scooter_model)}\nOrder Status: ${order.status}`;
    const encodedInfo = encodeURIComponent(orderInfo);
    window.location.href = `/support?inquiry=${encodedInfo}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle p-4 flex items-center justify-center">
        <div>Loading orders...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => window.location.href = '/dashboard'}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-electric bg-clip-text text-transparent">
              My Orders
            </h1>
            <p className="text-muted-foreground">Track your scooter orders and delivery status</p>
          </div>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <Card className="shadow-soft border-0">
            <CardContent className="text-center py-12">
              <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
              <p className="text-muted-foreground mb-4">
                You haven't placed any scooter orders yet.
              </p>
              <Button variant="electric" onClick={() => window.location.href = '/dashboard'}>
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id} className="shadow-soft border-0">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Package className="w-5 h-5 text-primary" />
                        {order.order_number}
                      </CardTitle>
                      <CardDescription>
                        Ordered on {formatDate(order.created_at)}
                      </CardDescription>
                    </div>
                    <Badge variant={getStatusColor(order.status)} className="flex items-center gap-1">
                      {getStatusIcon(order.status)}
                      {order.status.toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground">PRODUCT</h4>
                      <p>{formatScooterModel(order.scooter_model)}</p>
                      <p className="text-sm text-muted-foreground">Quantity: {order.quantity}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground">DELIVERY ADDRESS</h4>
                      <p>{order.delivery_address}</p>
                      <p className="text-sm text-muted-foreground">{order.delivery_city}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground">TOTAL</h4>
                      <p className="text-lg font-bold">${order.total_amount}</p>
                    </div>
                  </div>

                  {order.estimated_delivery_date && (
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground">ESTIMATED DELIVERY</h4>
                      <p>{formatDate(order.estimated_delivery_date)}</p>
                    </div>
                  )}

                  {order.tracking_number && (
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground">TRACKING NUMBER</h4>
                      <p className="font-mono">{order.tracking_number}</p>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button 
                      variant="electric" 
                      size="sm"
                      onClick={() => handleCreateInquiry(order)}
                    >
                      Inquire About Delivery
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;