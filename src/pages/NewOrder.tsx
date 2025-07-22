import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, ShoppingCart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const scooterModels = [
  { value: 'ms_classic', label: 'MS Classic', price: 1299.99 },
  { value: 'ms_sport', label: 'MS Sport', price: 1599.99 },
  { value: 'ms_electric', label: 'MS Electric', price: 1899.99 },
  { value: 'ms_premium', label: 'MS Premium', price: 2299.99 },
];

const NewOrder = () => {
  const [selectedModel, setSelectedModel] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryCity, setDeliveryCity] = useState('');
  const [deliveryPostalCode, setDeliveryPostalCode] = useState('');
  const [deliveryPhone, setDeliveryPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const selectedModelData = scooterModels.find(model => model.value === selectedModel);
  const totalAmount = selectedModelData ? selectedModelData.price * quantity : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = '/';
        return;
      }

      // Generate order number
      const { data: orderNumberData, error: orderNumberError } = await supabase
        .rpc('generate_order_number');

      if (orderNumberError) throw orderNumberError;

      const orderData = {
        customer_id: user.id,
        order_number: orderNumberData,
        scooter_model: selectedModel as 'ms_classic' | 'ms_sport' | 'ms_electric' | 'ms_premium',
        quantity: quantity,
        unit_price: selectedModelData?.price || 0,
        total_amount: totalAmount,
        delivery_address: deliveryAddress,
        delivery_city: deliveryCity,
        delivery_postal_code: deliveryPostalCode,
        delivery_phone: deliveryPhone,
        notes: notes || null,
      };

      const { error } = await supabase
        .from('orders')
        .insert(orderData);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Order ${orderNumberData} has been placed successfully!`,
      });

      // Redirect to orders page
      window.location.href = '/orders';
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to place order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle p-4">
      <div className="max-w-2xl mx-auto">
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
              Place New Order
            </h1>
            <p className="text-muted-foreground">Order your MS-Scooter for delivery</p>
          </div>
        </div>

        {/* Order Form */}
        <form onSubmit={handleSubmit}>
          <Card className="shadow-soft border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-primary" />
                Order Details
              </CardTitle>
              <CardDescription>
                Fill in the details for your scooter order
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Scooter Model Selection */}
              <div className="space-y-2">
                <Label htmlFor="model">Scooter Model</Label>
                <Select value={selectedModel} onValueChange={setSelectedModel} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a scooter model" />
                  </SelectTrigger>
                  <SelectContent>
                    {scooterModels.map((model) => (
                      <SelectItem key={model.value} value={model.value}>
                        {model.label} - ${model.price}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Quantity */}
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  max="10"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  required
                />
              </div>

              {/* Delivery Address */}
              <div className="space-y-2">
                <Label htmlFor="address">Delivery Address</Label>
                <Textarea
                  id="address"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Enter your full delivery address"
                  required
                />
              </div>

              {/* City and Postal Code */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={deliveryCity}
                    onChange={(e) => setDeliveryCity(e.target.value)}
                    placeholder="City"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postal">Postal Code</Label>
                  <Input
                    id="postal"
                    value={deliveryPostalCode}
                    onChange={(e) => setDeliveryPostalCode(e.target.value)}
                    placeholder="Postal Code"
                    required
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <Label htmlFor="phone">Delivery Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={deliveryPhone}
                  onChange={(e) => setDeliveryPhone(e.target.value)}
                  placeholder="Phone number for delivery"
                  required
                />
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Special Instructions (Optional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any special delivery instructions..."
                />
              </div>

              {/* Order Summary */}
              {selectedModelData && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2">Order Summary</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>{selectedModelData.label} x {quantity}</span>
                      <span>${(selectedModelData.price * quantity).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>Total</span>
                      <span>${totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <Button 
                  type="submit"
                  disabled={loading || !selectedModel}
                  variant="electric"
                  className="flex-1"
                >
                  {loading ? 'Placing Order...' : 'Place Order'}
                </Button>
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => window.location.href = '/dashboard'}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
};

export default NewOrder;