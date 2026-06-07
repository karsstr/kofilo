'use client';

import { useState, useEffect, use } from 'react'; 
import { Product } from '@/types/product';
import Link from 'next/link';
import { useCartStore } from '@/store/useCartStore';

export default function CustomerMenuPage({ params }: { params: Promise<{ tableId: string }> }) {
  const { tableId } = use(params);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("Coffee");
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // 1. AMBIL DATA DARI GLOBAL STORE ZUSTAND
  const { cart, addToCart } = useCartStore();

  const [quantity, setQuantity] = useState(1);
  const [cupSize, setCupSize] = useState('Regular');
  const [sweetness, setSweetness] = useState('Normal Sugar');
  const [iceLevel, setIceLevel] = useState('Normal Ice');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        setProducts(data.products ?? []);
      } catch (error) {
        console.error("Gagal ambil produk:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const categories = ["Coffee", "Non-Coffee", "Mocktail", "Pastry", "Dessert", "Add-on"];
  const filteredProducts = products.filter(p => p.category?.name?.toLowerCase() === activeCategory.toLowerCase());

  const closeModal = () => {
    setSelectedProduct(null);
    setQuantity(1);
    setCupSize('Regular');
    setSweetness('Normal Sugar');
    setIceLevel('Normal Ice');
  };

  const handleAddToCart = () => {
    if (!selectedProduct) return;

    const isDrink = ['Coffee', 'Non-Coffee', 'Mocktail'].includes(selectedProduct.category?.name || '');
    const finalPrice = selectedProduct.price + (isDrink && cupSize === 'Large' ? 5000 : 0);
    const variantString = isDrink ? `${cupSize}, ${sweetness}, ${iceLevel}` : '';

    // Panggil fungsi addToCart dari Zustand
    addToCart({
      id: selectedProduct.id + (variantString ? `-${cupSize}-${sweetness}-${iceLevel}` : ''),
      name: selectedProduct.name,
      price: finalPrice,
      quantity: quantity,
      variants: variantString
    });
    
    closeModal();
  };

  const totalCartItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const totalCartPrice = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const isDrink = ['Coffee', 'Non-Coffee', 'Mocktail'].includes(selectedProduct?.category?.name || '');

  return (
    <div className="min-h-screen bg-[#f8f9fa] font-sans text-gray-800 pb-32">
      
      <header className="bg-white px-6 py-5 border-b border-gray-100 sticky top-0 z-10 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-[#7a5c43] text-white rounded-full flex items-center justify-center font-bold">C</div>
          <div>
            <h1 className="font-bold text-lg leading-tight">Craft Coffee</h1>
            <p className="text-sm text-gray-500">Table {tableId} • Dine In</p>
          </div>
        </div>
      </header>

      <div className="bg-white px-6 py-4 flex gap-3 overflow-x-auto scrollbar-hide border-b border-gray-100">
        {categories.map((cat) => (
          <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors border ${activeCategory === cat ? "bg-[#7a5c43] text-white border-[#7a5c43] shadow-sm" : "bg-white text-gray-600 border-gray-200 hover:border-[#7a5c43]"}`}>
            {cat}
          </button>
        ))}
      </div>

      <main className="p-6 max-w-7xl mx-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-40 text-gray-400">
            <div className="animate-pulse text-3xl mb-2">☕</div><p className="text-sm font-semibold">Loading menu...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {filteredProducts.map((product) => (
              <button key={product.id} onClick={() => setSelectedProduct(product)} disabled={!product.isAvailable} className={`bg-white rounded-2xl text-left overflow-hidden shadow-sm border transition-all hover:shadow-md hover:border-[#7a5c43] flex flex-col ${product.isAvailable ? 'border-gray-100' : 'border-gray-100 opacity-60'}`}>
                <div className="w-full aspect-square bg-[#e9e9e9] relative flex items-center justify-center text-4xl">
                  {product.image ? <img src={product.image} alt={product.name} className="w-full h-full object-cover" /> : <span className="text-gray-400 opacity-50">☕</span>}
                </div>
                <div className="p-4 flex flex-col flex-1 justify-between">
                  <div><h3 className="text-[15px] font-bold text-gray-900 leading-tight mb-1">{product.name}</h3></div>
                  <p className="text-[#7a5c43] font-bold text-[15px] mt-2">Rp {product.price.toLocaleString('id-ID')}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </main>

      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm transition-opacity">
          <div className="absolute inset-0" onClick={closeModal}></div>
          <div className="bg-white w-full max-w-lg rounded-t-3xl p-6 pb-8 relative z-10 animate-slide-up flex flex-col shadow-2xl" style={{ maxHeight: '85vh' }}>
            <div className="flex justify-between items-start mb-6 border-b border-gray-100 pb-4">
              <div>
                <h2 className="font-extrabold text-2xl text-[#1a1f36]">{selectedProduct.name}</h2>
                <p className="text-[#7a5c43] font-bold text-[15px] mt-1">Rp {selectedProduct.price.toLocaleString('id-ID')} Base Price</p>
              </div>
              <button onClick={closeModal} className="w-8 h-8 bg-gray-50 border border-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-hide flex flex-col gap-6 pb-2">
              {isDrink ? (
                <>
                  <div>
                    <h3 className="font-bold text-[#1a1f36] mb-3">Cup Size</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <button onClick={() => setCupSize('Regular')} className={`py-3.5 rounded-xl border text-sm font-bold transition-all ${cupSize === 'Regular' ? 'border-[#7a5c43] text-[#7a5c43]' : 'border-gray-200 text-[#64748b]'}`}>Regular</button>
                      <button onClick={() => setCupSize('Large')} className={`py-2 rounded-xl border flex flex-col items-center justify-center transition-all ${cupSize === 'Large' ? 'border-[#7a5c43] text-[#7a5c43]' : 'border-gray-200 text-[#64748b]'}`}>
                        <span className="text-sm font-bold">Large</span><span className="text-[10px] font-medium">+Rp 5.000</span>
                      </button>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-[#1a1f36] mb-3">Sweetness Level</h3>
                    <div className="grid grid-cols-3 gap-3">
                      {['Normal Sugar', 'Low Sugar', 'No Sugar'].map(level => (
                        <button key={level} onClick={() => setSweetness(level)} className={`py-3.5 px-2 rounded-xl border text-xs font-bold transition-all ${sweetness === level ? 'border-[#7a5c43] text-[#7a5c43]' : 'border-gray-200 text-[#64748b]'}`}>{level}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-[#1a1f36] mb-3">Ice Level</h3>
                    <div className="grid grid-cols-3 gap-3">
                      {['Normal Ice', 'Less Ice', 'No Ice'].map(level => (
                        <button key={level} onClick={() => setIceLevel(level)} className={`py-3.5 px-2 rounded-xl border text-xs font-bold transition-all ${iceLevel === level ? 'border-[#7a5c43] text-[#7a5c43]' : 'border-gray-200 text-[#64748b]'}`}>{level}</button>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-4 bg-gray-50 rounded-xl text-center border border-gray-100">
                  <p className="text-sm text-gray-500">Item ini tidak memerlukan pilihan varian.</p>
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 flex gap-4 bg-white">
              <div className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-2 py-3 w-[120px]">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="text-gray-500 font-bold text-xl px-3">−</button>
                <span className="font-extrabold text-[#1a1f36] text-lg">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="text-gray-500 font-bold text-xl px-3">+</button>
              </div>
              <button onClick={handleAddToCart} className="flex-1 bg-[#7a5c43] text-white py-3.5 rounded-xl font-bold text-[15px] shadow-sm hover:bg-[#634832] active:scale-95 transition-all">
                Add to Cart - Rp {((selectedProduct.price + (isDrink && cupSize === 'Large' ? 5000 : 0)) * quantity).toLocaleString('id-ID')}
              </button>
            </div>
          </div>
        </div>
      )}

      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-transparent z-40 pointer-events-none">
          <div className="max-w-lg mx-auto bg-[#7a5c43] rounded-2xl shadow-2xl p-4 flex justify-between items-center pointer-events-auto">
            <div className="flex flex-col">
              <span className="text-white text-sm font-medium">{totalCartItems} Items in Cart</span>
              <span className="text-white text-lg font-extrabold">Rp {totalCartPrice.toLocaleString('id-ID')}</span>
            </div>
            <Link href={`/${tableId}/cart`} className="bg-white text-[#7a5c43] px-6 py-2.5 rounded-full font-bold shadow-sm hover:bg-gray-50 active:scale-95 transition-transform">
              View Cart 🛒
            </Link>
          </div>
        </div>
      )}

    </div>
  );
}