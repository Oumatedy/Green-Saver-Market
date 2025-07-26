import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Star, ShoppingCart, Heart, Truck, Shield } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function ProductDetails() {
  const { id } = useParams();
  const [quantity, setQuantity] = useState(1);

  // Mock product data - replace with actual API call
  const product = {
    id: '1',
    name: 'Organic Tomatoes',
    price: 4.99,
    images: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
    farmer: 'Green Valley Farm',
    rating: 4.8,
    reviews: 127,
    category: 'Vegetables',
    organic: true,
    description: 'Fresh, vine-ripened organic tomatoes grown with care in our sustainable farm. Perfect for salads, cooking, or eating fresh.',
    features: ['Certified Organic', 'Non-GMO', 'Locally Grown', 'Pesticide Free'],
    nutritionFacts: {
      calories: 18,
      protein: '0.9g',
      carbs: '3.9g',
      fiber: '1.2g',
      vitamin_c: '14mg'
    },
    inStock: true,
    harvestDate: '2024-01-15',
    expiryDate: '2024-01-22'
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-muted rounded-lg overflow-hidden">
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              {product.images.slice(1).map((image, index) => (
                <div key={index} className="aspect-square bg-muted rounded-lg overflow-hidden">
                  <img
                    src={image}
                    alt={`${product.name} ${index + 2}`}
                    className="w-full h-full object-cover cursor-pointer hover:opacity-80"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">{product.category}</Badge>
                {product.organic && (
                  <Badge className="bg-secondary text-secondary-foreground">Organic</Badge>
                )}
              </div>
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              <p className="text-muted-foreground">by {product.farmer}</p>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <span className="ml-1 font-medium">{product.rating}</span>
                <span className="ml-1 text-muted-foreground">({product.reviews} reviews)</span>
              </div>
            </div>

            <div className="text-3xl font-bold text-primary">
              ${product.price} <span className="text-lg font-normal text-muted-foreground">per lb</span>
            </div>

            <p className="text-muted-foreground">{product.description}</p>

            {/* Features */}
            <div>
              <h3 className="font-semibold mb-3">Features</h3>
              <div className="flex flex-wrap gap-2">
                {product.features.map((feature, index) => (
                  <Badge key={index} variant="outline">{feature}</Badge>
                ))}
              </div>
            </div>

            {/* Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <label className="font-medium">Quantity:</label>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    -
                  </Button>
                  <span className="px-4 py-1 border rounded">{quantity}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    +
                  </Button>
                </div>
              </div>

              <div className="flex space-x-4">
                <Button className="flex-1" size="lg">
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Add to Cart
                </Button>
                <Button variant="outline" size="lg">
                  <Heart className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Delivery Info */}
            <div className="space-y-3 pt-6 border-t">
              <div className="flex items-center text-sm">
                <Truck className="h-4 w-4 mr-2 text-primary" />
                <span>Free delivery on orders over $30</span>
              </div>
              <div className="flex items-center text-sm">
                <Shield className="h-4 w-4 mr-2 text-primary" />
                <span>100% satisfaction guarantee</span>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Nutrition Facts</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Calories</span>
                  <span>{product.nutritionFacts.calories}</span>
                </div>
                <div className="flex justify-between">
                  <span>Protein</span>
                  <span>{product.nutritionFacts.protein}</span>
                </div>
                <div className="flex justify-between">
                  <span>Carbohydrates</span>
                  <span>{product.nutritionFacts.carbs}</span>
                </div>
                <div className="flex justify-between">
                  <span>Fiber</span>
                  <span>{product.nutritionFacts.fiber}</span>
                </div>
                <div className="flex justify-between">
                  <span>Vitamin C</span>
                  <span>{product.nutritionFacts.vitamin_c}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Farm Information</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Harvest Date</span>
                  <span>{new Date(product.harvestDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Best Before</span>
                  <span>{new Date(product.expiryDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Farm</span>
                  <span>{product.farmer}</span>
                </div>
                <div className="flex justify-between">
                  <span>Certification</span>
                  <span>USDA Organic</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}