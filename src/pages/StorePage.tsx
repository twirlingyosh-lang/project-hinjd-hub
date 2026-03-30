import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, ShoppingCart, Package } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { storefrontApiRequest, STOREFRONT_PRODUCTS_QUERY, ShopifyProduct } from '@/lib/shopifyConfig';
import { useCartStore } from '@/stores/cartStore';
import { CartDrawer } from '@/components/shop/CartDrawer';

const StorePage = () => {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore(state => state.addItem);
  const isCartLoading = useCartStore(state => state.isLoading);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await storefrontApiRequest(STOREFRONT_PRODUCTS_QUERY, { first: 50 });
        if (data?.data?.products?.edges) {
          setProducts(data.data.products.edges);
        }
      } catch (error) {
        console.error('Failed to load products:', error);
        toast.error('Failed to load products');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleAddToCart = async (product: ShopifyProduct) => {
    const variant = product.node.variants.edges[0]?.node;
    if (!variant) return;
    await addItem({
      product,
      variantId: variant.id,
      variantTitle: variant.title,
      price: variant.price,
      quantity: 1,
      selectedOptions: variant.selectedOptions || [],
    });
    toast.success(`${product.node.title} added to cart`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Package className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">HINJD Store</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/">
              <Button variant="ghost" size="sm">Home</Button>
            </Link>
            <CartDrawer />
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-12 md:py-20 text-center px-4">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Industrial Solutions & Equipment</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Premium diagnostic guides, subscriptions, and tools for the aggregate and heavy equipment industry.
        </p>
      </section>

      {/* Products */}
      <section className="container mx-auto px-4 pb-20">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No products found</h3>
            <p className="text-muted-foreground">Check back soon for new products.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => {
              const image = product.node.images.edges[0]?.node;
              const price = product.node.priceRange.minVariantPrice;
              const variant = product.node.variants.edges[0]?.node;

              return (
                <Card key={product.node.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
                  <Link to={`/store/product/${product.node.handle}`}>
                    <div className="aspect-square bg-secondary/10 overflow-hidden">
                      {image ? (
                        <img
                          src={image.url}
                          alt={image.altText || product.node.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-16 w-16 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  </Link>
                  <CardContent className="p-4 space-y-3">
                    <Link to={`/store/product/${product.node.handle}`}>
                      <h3 className="font-semibold text-lg hover:text-primary transition-colors">{product.node.title}</h3>
                    </Link>
                    <p className="text-sm text-muted-foreground line-clamp-2">{product.node.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-primary">
                        {price.currencyCode} {parseFloat(price.amount).toFixed(2)}
                      </span>
                      {variant && !variant.availableForSale && (
                        <Badge variant="secondary">Sold Out</Badge>
                      )}
                    </div>
                    <Button
                      className="w-full gap-2"
                      onClick={(e) => {
                        e.preventDefault();
                        handleAddToCart(product);
                      }}
                      disabled={isCartLoading || !variant?.availableForSale}
                    >
                      {isCartLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingCart className="h-4 w-4" />}
                      Add to Cart
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default StorePage;
