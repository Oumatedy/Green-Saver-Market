import { useUser } from '@clerk/clerk-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ShoppingCart, 
  Heart, 
  Clock, 
  Star, 
  MapPin, 
  Truck,
  Leaf,
  Apple
} from 'lucide-react';

export default function CustomerDashboard() {
  const { user } = useUser();

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-6">
        <h1 className="text-3xl font-bold text-primary mb-2">
          Welcome back, {user?.firstName || 'Customer'}!
        </h1>
        <p className="text-muted-foreground">
          Discover fresh, local produce from farms in your area
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">+2 from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Favorites</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">Saved products</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Loyalty Points</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">340</div>
            <p className="text-xs text-muted-foreground">Earn more with purchases</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Delivery</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Today</div>
            <p className="text-xs text-muted-foreground">2:00 PM - 4:00 PM</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="browse" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="browse">Browse Products</TabsTrigger>
          <TabsTrigger value="orders">My Orders</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>
        
        <TabsContent value="browse" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Fresh Produce Near You</h2>
            <Button>View All Products</Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Sample Products */}
            {[
              { name: 'Organic Tomatoes', price: '$4.99/lb', farm: 'Green Valley Farm', rating: 4.8 },
              { name: 'Fresh Spinach', price: '$3.49/bunch', farm: 'Sunny Acres', rating: 4.9 },
              { name: 'Sweet Corn', price: '$2.99/ear', farm: 'Harvest Moon Farm', rating: 4.7 },
            ].map((product, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                    <Badge variant="outline">
                      <Star className="h-3 w-3 mr-1 fill-current" />
                      {product.rating}
                    </Badge>
                  </div>
                  <CardDescription className="flex items-center">
                    <MapPin className="h-3 w-3 mr-1" />
                    {product.farm}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-primary">{product.price}</span>
                    <Button size="sm">
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Add to Cart
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="orders" className="space-y-4">
          <h2 className="text-2xl font-bold">Order History</h2>
          <div className="space-y-4">
            {[
              { id: '#1234', date: '2 days ago', status: 'Delivered', total: '$24.67' },
              { id: '#1233', date: '1 week ago', status: 'Delivered', total: '$18.43' },
              { id: '#1232', date: '2 weeks ago', status: 'Delivered', total: '$31.22' },
            ].map((order, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Order {order.id}</CardTitle>
                    <Badge variant="outline">{order.status}</Badge>
                  </div>
                  <CardDescription>{order.date}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{order.total}</span>
                    <div className="space-x-2">
                      <Button variant="outline" size="sm">View Details</Button>
                      <Button size="sm">Reorder</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="subscriptions" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">My Subscriptions</h2>
            <Button>Create New Subscription</Button>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Leaf className="h-5 w-5 mr-2 text-primary" />
                Weekly Veggie Box
              </CardTitle>
              <CardDescription>Fresh seasonal vegetables delivered every Tuesday</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">$29.99/week</p>
                  <p className="text-sm text-muted-foreground">Next delivery: Tomorrow</p>
                </div>
                <div className="space-x-2">
                  <Button variant="outline" size="sm">Modify</Button>
                  <Button variant="outline" size="sm">Pause</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="profile" className="space-y-4">
          <h2 className="text-2xl font-bold">Profile Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Full Name</label>
                  <p className="text-lg">{user?.fullName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <p className="text-lg">{user?.primaryEmailAddress?.emailAddress}</p>
                </div>
                <Button>Edit Profile</Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Delivery Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Default Address</label>
                  <p className="text-sm text-muted-foreground">123 Main St, Your City, ST 12345</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Preferred Time</label>
                  <p className="text-sm text-muted-foreground">Weekday evenings (5-7 PM)</p>
                </div>
                <Button variant="outline">Manage Addresses</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}