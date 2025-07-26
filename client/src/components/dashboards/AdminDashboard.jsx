import { useUser } from '@clerk/clerk-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  ShoppingCart, 
  DollarSign, 
  TrendingUp,
  AlertTriangle,
  Settings,
  BarChart3,
  Activity
} from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useUser();

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-6">
        <h1 className="text-3xl font-bold text-primary mb-2">
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground">
          Platform overview and management tools
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,247</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,231</div>
            <p className="text-xs text-muted-foreground">+18% from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">284</div>
            <p className="text-xs text-muted-foreground">Currently processing</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+15.3%</div>
            <p className="text-xs text-muted-foreground">User acquisition</p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts Section */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-destructive" />
            System Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-destructive/10 rounded-lg">
              <span className="text-sm">Low inventory alerts from 3 farmers</span>
              <Button variant="outline" size="sm">Review</Button>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-100 rounded-lg">
              <span className="text-sm">Payment processing delays reported</span>
              <Button variant="outline" size="sm">Investigate</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { action: 'New farmer registered', time: '2 minutes ago', type: 'user' },
                  { action: 'Large order placed ($234)', time: '15 minutes ago', type: 'order' },
                  { action: 'Payment processing issue', time: '1 hour ago', type: 'alert' },
                  { action: 'Delivery completed', time: '2 hours ago', type: 'delivery' },
                ].map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="text-sm font-medium">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                    <Badge variant="outline">{activity.type}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Platform Health</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">API Response Time</span>
                    <span className="text-sm font-medium text-green-600">125ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Server Uptime</span>
                    <span className="text-sm font-medium text-green-600">99.9%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Database Performance</span>
                    <span className="text-sm font-medium text-green-600">Optimal</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Active Users</span>
                    <span className="text-sm font-medium">847</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="users" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">User Management</h2>
            <Button>Export Users</Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-center">Customers</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-3xl font-bold text-primary">892</div>
                <p className="text-sm text-muted-foreground">Active accounts</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-center">Farmers</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-3xl font-bold text-accent">67</div>
                <p className="text-sm text-muted-foreground">Verified farms</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-center">Delivery Partners</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-3xl font-bold text-secondary">34</div>
                <p className="text-sm text-muted-foreground">Active drivers</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Registrations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: 'John Smith', email: 'john@example.com', role: 'Customer', date: 'Today' },
                  { name: 'Green Hills Farm', email: 'contact@greenhills.com', role: 'Farmer', date: 'Yesterday' },
                  { name: 'Maria Garcia', email: 'maria@delivery.com', role: 'Driver', date: '2 days ago' },
                ].map((user, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline">{user.role}</Badge>
                      <p className="text-xs text-muted-foreground mt-1">{user.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="orders" className="space-y-4">
          <h2 className="text-2xl font-bold">Order Management</h2>
          <div className="space-y-4">
            {[
              { id: '#1234', customer: 'Sarah Johnson', farmer: 'Green Valley Farm', total: '$24.67', status: 'Processing' },
              { id: '#1235', customer: 'Mike Chen', farmer: 'Sunny Acres', total: '$18.43', status: 'Shipped' },
              { id: '#1236', customer: 'Emma Davis', farmer: 'Harvest Moon', total: '$31.22', status: 'Delivered' },
            ].map((order, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Order {order.id}</CardTitle>
                    <Badge variant="outline">{order.status}</Badge>
                  </div>
                  <CardDescription>
                    Customer: {order.customer} • Farmer: {order.farmer}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{order.total}</span>
                    <div className="space-x-2">
                      <Button variant="outline" size="sm">View Details</Button>
                      <Button size="sm">Manage</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-4">
          <h2 className="text-2xl font-bold">Platform Analytics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Revenue Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-40 flex items-center justify-center border rounded">
                  <p className="text-muted-foreground">Revenue chart would go here</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-40 flex items-center justify-center border rounded">
                  <p className="text-muted-foreground">User growth chart would go here</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-4">
          <h2 className="text-2xl font-bold">Platform Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  General Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Platform Name</label>
                  <p className="text-lg">Green Saver Market</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Commission Rate</label>
                  <p className="text-lg">5%</p>
                </div>
                <Button>Edit Settings</Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>System Maintenance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Button variant="outline" className="w-full">Database Backup</Button>
                  <Button variant="outline" className="w-full">Clear Cache</Button>
                  <Button variant="outline" className="w-full">System Health Check</Button>
                  <Button variant="destructive" className="w-full">Maintenance Mode</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}