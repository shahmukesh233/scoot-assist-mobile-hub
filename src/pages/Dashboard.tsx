import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Settings, LogOut } from 'lucide-react';

const Dashboard = () => {
  const handleLogout = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gradient-subtle p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-electric bg-clip-text text-transparent">
              MS-Scooter Support Dashboard
            </h1>
            <p className="text-muted-foreground">Welcome to your customer support portal</p>
          </div>
          <Button 
            variant="outline" 
            onClick={handleLogout}
            className="flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>

        {/* Dashboard Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="shadow-soft border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Profile
              </CardTitle>
              <CardDescription>
                Manage your account information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="electric" 
                className="w-full"
                onClick={() => window.location.href = '/profile'}
              >
                View Profile
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-soft border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary" />
                Support Tickets
              </CardTitle>
              <CardDescription>
                View and manage your support requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button 
                  variant="electric" 
                  className="w-full"
                  onClick={() => window.location.href = '/support'}
                >
                  Create Support Ticket
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.location.href = '/tickets'}
                >
                  View My Tickets
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary" />
                Settings
              </CardTitle>
              <CardDescription>
                Configure your preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="electric" className="w-full">
                Open Settings
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;