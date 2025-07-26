import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, ShoppingCart } from 'lucide-react';

export default function ProductCard({
  id,
  name,
  price,
  image,
  farmer,
  rating,
  category,
  organic,
  onAddToCart
}) {
  return (
    <Card className="group hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-0">
        <div className="relative">
          <img
            src={image}
            alt={name}
            className="w-full h-48 object-cover rounded-t-lg"
          />
          {organic && (
            <Badge className="absolute top-2 left-2 bg-secondary text-secondary-foreground">
              Organic
            </Badge>
          )}
          <Badge className="absolute top-2 right-2 bg-primary text-primary-foreground">
            {category}
          </Badge>
        </div>
        
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-1">{name}</h3>
          <p className="text-sm text-muted-foreground mb-2">by {farmer}</p>
          
          <div className="flex items-center mb-2">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm text-muted-foreground ml-1">{rating}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-primary">${price}</span>
            <span className="text-sm text-muted-foreground">per lb</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0">
        <Button 
          onClick={() => onAddToCart(id)}
          className="w-full"
          size="sm"
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
}
