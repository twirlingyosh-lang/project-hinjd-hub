import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, ShoppingCart, ArrowLeft, Package } from 'lucide-react';
import { toast } from 'sonner';
import { storefrontApiRequest, STOREFRONT_PRODUCT_BY_HANDLE_QUERY } from '@/lib/shopifyConfig';
import { useCartStore } from '@/stores/cartStore';
import { CartDrawer } from '@/components/shop/CartDrawer';

const ProductDetailPage = () => {
  const { handle } = useParams<{ handle: string }>();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariantId, setSelectedVariantId] = useState<string>('');
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const addItem = useCartStore(state => state.addItem);
  const isCartLoading = useCartStore(state => state.isLoading);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await storefrontApiRequest(STOREFRONT_PRODUCT_BY_HANDLE_QUERY, { handle });
        if (data?.data?.product) {
          setProduct(data.data.product);
          const firstVariant = data.data.product.variants.edges[0]?.node;
          if (firstVariant) setSelectedVariantId(firstVariant.id);
        }
      } catch (error) {
        console.error('Failed to load product:', error);
        toast.error('Failed to load product');
      } finally {
        setLoading(false);
      }
    };
    if (handle) fetchProduct();
  }, [handle]);

  const selectedVariant = product?.variants?.edges?.find(
    (v: any) => v.node.id === selectedVariantId
  )?.node;

  const handleAddToCart = async () => {
    if (!product || !selectedVariant) return;
    await addItem({
      product: { node: product },
      variantId: selectedVariant.id,
      variantTitle: selectedVariant.title,
      price: selectedVariant.price,
      quantity: 1,
      selectedOptions: selectedVariant.selectedOptions || [],
    });
    toast.success(`${product.title} added to cart`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <Package className="h-16 w-16 text-muted-foreground" />
        <p className="text-muted-foreground">Product not found</p>
        <Link to="/store"><Button variant="outline"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Store</Button></Link>
      </div>
    );
  }

  const images = product.images?.edges || [];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/store" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Store
          </Link>
          <CartDrawer />
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-secondary/10 rounded-lg overflow-hidden">
              {images[selectedImageIdx]?.node ? (
                <img
                  src={images[selectedImageIdx].node.url}
                  alt={images[selectedImageIdx].node.altText || product.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="h-20 w-20 text-muted-foreground" />
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {images.map((img: any, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIdx(idx)}
                    className={`w-16 h-16 rounded-md overflow-hidden border-2 flex-shrink-0 ${
                      idx === selectedImageIdx ? 'border-primary' : 'border-transparent'
                    }`}
                  >
                    <img src={img.node.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">{product.title}</h1>
              <p className="text-muted-foreground">{product.description}</p>
            </div>

            {selectedVariant && (
              <p className="text-3xl font-bold text-primary">
                {selectedVariant.price.currencyCode} {parseFloat(selectedVariant.price.amount).toFixed(2)}
              </p>
            )}

            {product.variants.edges.length > 1 && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Variant</label>
                <Select value={selectedVariantId} onValueChange={setSelectedVariantId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select variant" />
                  </SelectTrigger>
                  <SelectContent>
                    {product.variants.edges.map((v: any) => (
                      <SelectItem key={v.node.id} value={v.node.id}>
                        {v.node.title} — {v.node.price.currencyCode} {parseFloat(v.node.price.amount).toFixed(2)}
                        {!v.node.availableForSale && ' (Sold Out)'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {selectedVariant && !selectedVariant.availableForSale && (
              <Badge variant="secondary" className="text-sm">Currently Sold Out</Badge>
            )}

            <Button
              size="lg"
              className="w-full gap-2"
              onClick={handleAddToCart}
              disabled={isCartLoading || !selectedVariant?.availableForSale}
            >
              {isCartLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingCart className="h-4 w-4" />}
              Add to Cart
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
