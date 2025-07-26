import { useUser } from '@clerk/clerk-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Package, 
  DollarSign, 
  TrendingUp, 
  Users,
  Plus,
  Sprout,
  Calendar,
  BarChart3
} from 'lucide-react';

export default function FarmerDashboard() {
  const { user } = useUser();

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-6">
        <h1 className="text-3xl font-bold text-primary mb-2">
          Welcome, {user?.firstName || 'Farmer'}!
        </h1>
        <p className="text-muted-foreground">
          Manage your farm, track sales, and connect with customers
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products Listed</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">+3 new this week</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month's Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$2,348</div>
            <p className="text-xs text-muted-foreground">+18% from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18</div>
            <p className="text-xs text-muted-foreground">Orders to fulfill</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">127</div>
            <p className="text-xs text-muted-foreground">Regular buyers</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="inventory" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="harvest">Harvest</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="farm">Farm Profile</TabsTrigger>
        </TabsList>
        
        <TabsContent value="inventory" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Product Inventory</h2>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add New Product
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: 'Organic Tomatoes', stock: 45, price: '$4.99/lb', status: 'In Stock' },
              { name: 'Fresh Lettuce', stock: 8, price: '$2.49/head', status: 'Low Stock' },
              { name: 'Sweet Corn', stock: 0, price: '$2.99/ear', status: 'Out of Stock' },
              { name: 'Bell Peppers', stock: 32, price: '$3.99/lb', status: 'In Stock' },
            ].map((product, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                    <Badge 
                      variant={product.status === 'Out of Stock' ? 'destructive' : 
                              product.status === 'Low Stock' ? 'secondary' : 'default'}
                    >
                      {product.status}
                    </Badge>
                  </div>
                  <CardDescription>Stock: {product.stock} units</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-primary">{product.price}</span>
                    <div className="space-x-2">
                      <Button variant="outline" size="sm">Edit</Button>
                      <Button size="sm">Update Stock</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="orders" className="space-y-4">
          <h2 className="text-2xl font-bold">Pending Orders</h2>
          <div className="space-y-4">
            {[
              { id: '#1234', customer: 'Sarah Johnson', items: '3 items', total: '$24.67', status: 'Preparing' },
              { id: '#1235', customer: 'Mike Chen', items: '2 items', total: '$18.43', status: 'Ready' },
              { id: '#1236', customer: 'Emma Davis', items: '5 items', total: '$31.22', status: 'Preparing' },
            ].map((order, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Order {order.id}</CardTitle>
                    <Badge variant="outline">{order.status}</Badge>
                  </div>
                  <CardDescription>Customer: {order.customer}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{order.items}</p>
                      <p className="font-semibold">{order.total}</p>
                    </div>
                    <div className="space-x-2">
                      <Button variant="outline" size="sm">View Details</Button>
                      <Button size="sm">Mark Ready</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="harvest" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Harvest Planning</h2>
            <Button>
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Harvest
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Sprout className="h-5 w-5 mr-2 text-primary" />
                  Upcoming Harvests
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { crop: 'Tomatoes', date: 'Tomorrow', quantity: '200 lbs' },
                  { crop: 'Lettuce', date: 'In 3 days', quantity: '50 heads' },
                  { crop: 'Peppers', date: 'Next week', quantity: '150 lbs' },
                ].map((harvest, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{harvest.crop}</p>
                      <p className="text-sm text-muted-foreground">{harvest.date}</p>
                    </div>
                    <p className="text-sm font-medium">{harvest.quantity}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Weather Forecast</CardTitle>
                <CardDescription>Next 7 days - Perfect for harvesting</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center p-6">
                  <p className="text-4xl mb-2">☀️</p>
                  <p className="text-lg font-medium">72°F</p>
                  <p className="text-sm text-muted-foreground">Sunny, low humidity</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-4">
          <h2 className="text-2xl font-bold">Sales Analytics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Sales Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-40 flex items-center justify-center border rounded">
                  <p className="text-muted-foreground">Sales chart would go here</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Top Products</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { name: 'Organic Tomatoes', sales: '$890', growth: '+12%' },
                  { name: 'Fresh Lettuce', sales: '$654', growth: '+8%' },
                  { name: 'Bell Peppers', sales: '$432', growth: '+15%' },
                ].map((product, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="font-medium">{product.name}</span>
                    <div className="text-right">
                      <p className="font-semibold">{product.sales}</p>
                      <p className="text-sm text-green-600">{product.growth}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="farm" className="space-y-4">
          <h2 className="text-2xl font-bold">Farm Profile</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Farm Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Farm Name</label>
                  <p className="text-lg">Green Valley Organic Farm</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Owner</label>
                  <p className="text-lg">{user?.fullName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Location</label>
                  <p className="text-sm text-muted-foreground">Sunny Valley, CA</p>
                </div>
                <Button>Edit Farm Details</Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Certifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Badge className="mr-2">USDA Organic</Badge>
                  <Badge className="mr-2">Non-GMO</Badge>
                  <Badge className="mr-2">Sustainable</Badge>
                </div>
                <Button variant="outline">Add Certification</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}