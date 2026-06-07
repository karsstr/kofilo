'use client';

import { useState, useEffect } from 'react';
import { useCartStore } from '@/store/useCartStore';
import { useRouter } from 'next/navigation';
import { Product } from '@/types/product';

export default function CashierClient({ cashierName }: { cashierName: string }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("Coffee");
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  
  // STATE UNTUK MODAL KUSTOMISASI MENU
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [cupSize, setCupSize] = useState('Regular');
  const [sweetness, setSweetness] = useState('Normal Sugar');
  const [iceLevel, setIceLevel] = useState('Normal Ice');

  // STATE UNTUK MODAL CHECKOUT / PAYMENT
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'QRIS'>('CASH');
  const [cashAmount, setCashAmount] = useState<number | 'EXACT' | null>('EXACT');
  const [transactionId, setTransactionId] = useState('');

  const router = useRouter();
  const { cart, addToCart, updateQuantity, removeFromCart } = useCartStore();

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

  const categories = ["Coffee", "Non-Coffee", "Mocktail", "Pastry", "Dessert"];
  const filteredProducts = products.filter(
    (p) => p.category?.name?.toLowerCase() === activeCategory.toLowerCase()
  );

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const taxAndService = subtotal * 0.10;
  const total = subtotal + taxAndService;

  const isDrinkCategory = (product: Product) => {
    if (typeof product.category?.isDrink === 'boolean') {
      return product.category.isDrink;
    }
    const drinkCategories = ['coffee', 'non-coffee', 'mocktail', 'tea', 'smoothies'];
    return drinkCategories.includes(product.category?.name?.toLowerCase() || '');
  };

  const openModal = (product: Product) => {
    setSelectedProduct(product);
    setQuantity(1);
    setCupSize('Regular');
    setSweetness('Normal Sugar');
    setIceLevel('Normal Ice');
  };

  const handleAddToCartConfirm = () => {
    if (!selectedProduct) return;

    const isDrink = isDrinkCategory(selectedProduct);
    const additionalPrice = (isDrink && cupSize === 'Large') ? 5000 : 0;
    const finalPrice = selectedProduct.price + additionalPrice;

    let uniqueId = selectedProduct.id;
    let variantName = selectedProduct.name;

    if (isDrink) {
      uniqueId = `${selectedProduct.id}-${cupSize}-${sweetness}-${iceLevel}`;
      variantName = `${selectedProduct.name} (${cupSize}, ${sweetness}, ${iceLevel})`;
    }

    addToCart({
      id: uniqueId,
      name: variantName,
      price: finalPrice,
      quantity: quantity,
    });

    setSelectedProduct(null);
  };

  const openCheckoutModal = () => {
    setTransactionId(`TX${Math.floor(Math.random() * 100000000)}`);
    setShowCheckoutModal(true);
    setPaymentMethod('CASH');
    setCashAmount('EXACT');
  };

  const confirmPayment = () => {
    alert(`Payment Successful!\nTransaction ID: ${transactionId}\nTotal: Rp ${total.toLocaleString('id-ID')}`);
    cart.forEach(item => removeFromCart(item.id));
    setShowCheckoutModal(false);
  };

  const handleLogout = () => {
    window.location.href = '/api/auth/logout';
  };

  const parseItemName = (fullName: string) => {
    const match = fullName.match(/^(.*?)(?:\s*\((.*?)\))?$/);
    const baseName = match ? match[1] : fullName;
    const variantString = match && match[2] ? match[2] : "";
    const variants = variantString ? variantString.split(', ') : [];
    return { baseName, variants };
  };

  return (
    <div className="flex h-screen w-full bg-[#f8f9fa] font-sans relative selection:bg-[#6C4E31] selection:text-white">
      
      {/* ==========================================
          SISI KIRI: MENU & KATEGORI 
          ========================================== */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="px-8 py-6 bg-white/80 backdrop-blur-md flex justify-between items-center shrink-0 border-b border-gray-100 z-10 sticky top-0">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#6C4E31] to-[#583f27] text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-[#6C4E31]/20">
              {cashierName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="font-extrabold text-xl leading-none text-[#1a1f36] tracking-tight">Craft Coffee</h1>
              <p className="text-[13px] text-gray-500 mt-1 font-medium flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Cashier: {cashierName}
              </p>
            </div>
          </div>
          
          <div className="relative w-80 group">
            <input 
              type="text" 
              placeholder="Search menu..." 
              className="w-full bg-gray-50/50 border border-gray-200 rounded-2xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:border-[#6C4E31]/30 focus:bg-white focus:ring-4 focus:ring-[#6C4E31]/5 transition-all duration-300 placeholder-gray-400"
            />
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 absolute left-4 top-3.5 text-gray-400 group-focus-within:text-[#6C4E31] transition-colors duration-300">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </div>
        </header>

        <div className="px-8 py-6 flex gap-3 overflow-x-auto scrollbar-hide shrink-0 items-center">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2.5 rounded-2xl text-sm font-bold whitespace-nowrap transition-all duration-300 ease-out border ${
                activeCategory === cat
                  ? "bg-[#6C4E31] text-white border-[#6C4E31] shadow-lg shadow-[#6C4E31]/25 -translate-y-0.5"
                  : "bg-white text-gray-600 border-gray-200 hover:border-[#6C4E31]/40 hover:text-[#6C4E31] hover:shadow-md hover:bg-gray-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <main className="flex-1 overflow-y-auto px-8 pb-8 scrollbar-hide">
          {loading ? (
            /* PREMIUM SKELETON LOADING */
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-3xl h-[280px] animate-pulse shadow-sm border border-gray-100 flex flex-col overflow-hidden">
                  <div className="w-full h-48 bg-gray-100"></div>
                  <div className="p-5 flex flex-col gap-3">
                    <div className="h-4 bg-gray-200 rounded-full w-3/4"></div>
                    <div className="h-4 bg-gray-100 rounded-full w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <button
                  key={product.id}
                  onClick={() => openModal(product)}
                  disabled={!product.isAvailable}
                  className={`bg-white rounded-3xl text-left overflow-hidden shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] border border-gray-100 transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] hover:shadow-[0_12px_30px_-10px_rgba(108,78,49,0.2)] hover:-translate-y-1.5 hover:border-[#6C4E31]/20 flex flex-col active:scale-[0.97] group ${
                    product.isAvailable ? '' : 'opacity-40 grayscale-[50%]'
                  }`}
                >
                  <div className="w-full h-48 bg-gray-50 relative overflow-hidden">
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-5xl text-gray-200 group-hover:scale-110 transition-transform duration-500">☕</div>
                    )}
                    {/* Subtle overlay gradient for premium feel */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <div className="p-5 flex flex-col">
                    <h3 className="text-[15px] font-extrabold text-[#1a1f36] leading-tight mb-2 line-clamp-2 group-hover:text-[#6C4E31] transition-colors">{product.name}</h3>
                    <p className="text-[#6C4E31] font-extrabold text-[14px]">Rp {product.price.toLocaleString('id-ID')}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* ==========================================
          SISI KANAN: CURRENT ORDER 
          ========================================== */}
      <div className="w-[400px] bg-white border-l border-gray-100 flex flex-col h-full shrink-0 shadow-[-10px_0_30px_-15px_rgba(0,0,0,0.05)] relative z-20">
        <header className="px-7 py-6 flex justify-between items-start shrink-0 border-b border-gray-100 bg-white">
          <div>
            <h2 className="font-extrabold text-xl text-[#1a1f36] tracking-tight">Current Order</h2>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="bg-[#6C4E31]/10 text-[#6C4E31] px-2.5 py-1 rounded-md text-[11px] font-extrabold uppercase tracking-wider">Table ~</span>
              <span className="text-xs text-gray-400 font-medium">• Dine In</span>
            </div>
          </div>
          <div className="flex gap-1 text-gray-400 relative">
            <button onClick={() => setShowDropdown(!showDropdown)} className="p-2 hover:bg-gray-50 hover:text-gray-800 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-200">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" /></svg>
            </button>
            {showDropdown && (
              <div className="absolute right-0 top-12 mt-1 w-44 bg-white border border-gray-100 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] z-50 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                <button onClick={handleLogout} className="w-full text-left px-5 py-3 text-sm font-bold text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors flex items-center gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" /></svg>
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-7 bg-[#fcfcfc] flex flex-col scrollbar-hide">
          {cart.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-300">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mb-4 opacity-50"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" /></svg>
               <p className="font-bold text-sm text-gray-400">Cart is empty</p>
               <p className="text-xs text-gray-300 mt-1">Select items from the menu to add.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              {cart.map((item) => {
                const { baseName, variants } = parseItemName(item.name);
                return (
                  <div key={item.id} className="flex justify-between items-start pb-5 border-b border-gray-100 last:border-0 animate-in slide-in-from-right-4 fade-in duration-300 ease-out">
                    <div className="flex-1 pr-3">
                      <h3 className="font-extrabold text-[#1a1f36] text-[14px] leading-snug mb-1.5">{baseName}</h3>
                      {variants.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {variants.map((v, i) => (
                            <span key={i} className="text-[10px] bg-gray-100 text-gray-500 font-bold px-2 py-0.5 rounded-md">- {v}</span>
                          ))}
                        </div>
                      )}
                      <p className="font-extrabold text-[#6C4E31] text-[13px]">Rp {(item.price * item.quantity).toLocaleString('id-ID')}</p>
                    </div>
                    <div className="flex items-center gap-3 bg-white rounded-xl p-1 shadow-sm border border-gray-100">
                      <button onClick={() => {
                          if (item.quantity > 1) {
                            updateQuantity(item.id, item.quantity - 1);
                          } else {
                            removeFromCart(item.id);
                          }
                        }} className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-black hover:bg-gray-50 rounded-lg transition-colors font-bold text-lg leading-none">−</button>
                      <span className="font-extrabold text-[13px] w-4 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-black hover:bg-gray-50 rounded-lg transition-colors font-bold text-lg leading-none">+</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="px-7 pb-7 pt-4 bg-white shrink-0 border-t border-gray-100 relative shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.02)]">
          <div className="flex flex-col gap-3 mb-6">
            <div className="flex justify-between text-[13px] font-bold text-gray-400">
              <span>Subtotal</span><span className="text-gray-600">Rp {subtotal.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between text-[13px] font-bold text-gray-400">
              <span>Tax (10%)</span><span className="text-gray-600">Rp {taxAndService.toLocaleString('id-ID')}</span>
            </div>
            <div className="border-t border-dashed border-gray-200 my-1"></div>
            <div className="flex justify-between items-end mt-1">
              <span className="text-sm font-extrabold text-gray-400 mb-0.5">Total</span>
              <span className="text-[22px] font-black text-[#1a1f36] leading-none">Rp {total.toLocaleString('id-ID')}</span>
            </div>
          </div>
          
          <button 
            disabled={cart.length === 0} 
            onClick={openCheckoutModal}
            className={`w-full py-4 rounded-2xl font-extrabold text-[15px] transition-all duration-300 flex justify-center items-center gap-2 ${
              cart.length > 0 
                ? 'bg-[#6C4E31] text-white shadow-[0_8px_20px_-6px_rgba(108,78,49,0.4)] hover:bg-[#583f27] hover:-translate-y-0.5 active:scale-[0.98]' 
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            Proceed to Checkout Rp {total.toLocaleString('id-ID')}
            {cart.length > 0 && <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" /></svg>}
          </button>
        </div>
      </div>

      {/* ==========================================
          MODAL 1: KUSTOMISASI MENU
          ========================================== */}
      {selectedProduct && !showCheckoutModal && (
        <div className="fixed inset-0 z-[60] bg-[#1a1f36]/40 backdrop-blur-md flex items-center justify-center p-4 transition-all duration-300">
          <div className="bg-white rounded-[28px] w-full max-w-[420px] p-7 shadow-2xl flex flex-col gap-7 animate-in fade-in zoom-in-[0.96] duration-300 ease-out">
            
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-[22px] font-black text-[#1a1f36] leading-tight mb-1">{selectedProduct.name}</h2>
                <p className="text-[15px] font-bold text-[#6C4E31]">Rp {selectedProduct.price.toLocaleString('id-ID')} <span className="text-gray-400 font-medium text-xs ml-1">Base Price</span></p>
              </div>
              <button onClick={() => setSelectedProduct(null)} className="p-2.5 bg-gray-50 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors active:scale-90">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {isDrinkCategory(selectedProduct) && (
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-3">
                  <h3 className="font-bold text-[13px] text-gray-400 uppercase tracking-wider">Cup Size</h3>
                  <div className="flex gap-3">
                    <button onClick={() => setCupSize('Regular')} className={`flex-1 py-3.5 rounded-2xl border-2 text-[14px] font-bold transition-all flex flex-col items-center justify-center ${cupSize === 'Regular' ? 'border-[#6C4E31] text-[#6C4E31] bg-[#6C4E31]/5 ring-4 ring-[#6C4E31]/10' : 'border-gray-100 text-gray-500 hover:border-gray-200 hover:bg-gray-50'}`}>Regular</button>
                    <button onClick={() => setCupSize('Large')} className={`flex-1 py-3.5 rounded-2xl border-2 text-[14px] font-bold transition-all flex flex-col items-center justify-center ${cupSize === 'Large' ? 'border-[#6C4E31] text-[#6C4E31] bg-[#6C4E31]/5 ring-4 ring-[#6C4E31]/10' : 'border-gray-100 text-gray-500 hover:border-gray-200 hover:bg-gray-50'}`}>
                      <span>Large</span><span className="text-[11px] font-extrabold text-[#6C4E31] opacity-80 mt-0.5">+Rp 5.000</span>
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <h3 className="font-bold text-[13px] text-gray-400 uppercase tracking-wider">Sweetness Level</h3>
                  <div className="flex gap-2">
                    {['Normal Sugar', 'Low Sugar', 'No Sugar'].map((level) => (
                      <button key={level} onClick={() => setSweetness(level)} className={`flex-1 py-3 rounded-xl border-2 text-[13px] font-bold transition-all ${sweetness === level ? 'border-[#6C4E31] text-[#6C4E31] bg-[#6C4E31]/5' : 'border-gray-100 text-gray-500 hover:border-gray-200 hover:bg-gray-50'}`}>
                        {level.split(' ')[0]} <span className="block text-[10px] text-gray-400">{level.split(' ')[1]}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <h3 className="font-bold text-[13px] text-gray-400 uppercase tracking-wider">Ice Level</h3>
                  <div className="flex gap-2">
                    {['Normal Ice', 'Less Ice', 'No Ice'].map((level) => (
                      <button key={level} onClick={() => setIceLevel(level)} className={`flex-1 py-3 rounded-xl border-2 text-[13px] font-bold transition-all ${iceLevel === level ? 'border-[#6C4E31] text-[#6C4E31] bg-[#6C4E31]/5' : 'border-gray-100 text-gray-500 hover:border-gray-200 hover:bg-gray-50'}`}>
                        {level.split(' ')[0]} <span className="block text-[10px] text-gray-400">{level.split(' ')[1]}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-4 items-center mt-2 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-4 bg-gray-50 rounded-2xl p-2 border border-gray-200">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-11 h-11 flex items-center justify-center text-gray-400 hover:text-black hover:bg-white rounded-xl shadow-sm transition-all font-bold text-xl active:scale-95">−</button>
                <span className="font-black text-[17px] w-5 text-center">{quantity}</span>
                <button onClick={() => setQuantity(q => q + 1)} className="w-11 h-11 flex items-center justify-center text-gray-400 hover:text-black hover:bg-white rounded-xl shadow-sm transition-all font-bold text-xl active:scale-95">+</button>
              </div>
              <button onClick={handleAddToCartConfirm} className="flex-1 bg-[#6C4E31] text-white py-4 rounded-2xl font-extrabold text-[15px] shadow-[0_8px_20px_-6px_rgba(108,78,49,0.4)] hover:bg-[#583f27] hover:-translate-y-0.5 active:scale-[0.98] transition-all flex flex-col items-center justify-center">
                <span>Add to Cart</span>
                <span className="text-[11px] font-medium opacity-80 mt-0.5">Rp {((selectedProduct.price + (isDrinkCategory(selectedProduct) && cupSize === 'Large' ? 5000 : 0)) * quantity).toLocaleString('id-ID')}</span>
              </button>
            </div>
            
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL 2: CHECKOUT & PAYMENT
          ========================================== */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-[70] bg-[#1a1f36]/60 backdrop-blur-md flex items-center justify-center p-4 transition-all duration-300">
          <div className="bg-white rounded-[32px] w-full max-w-4xl shadow-2xl flex flex-col md:flex-row overflow-hidden animate-in fade-in zoom-in-[0.96] duration-300 ease-out max-h-[90vh]">
            
            {/* KIRI: METODE PEMBAYARAN */}
            <div className="flex-1 p-10 flex flex-col overflow-y-auto">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-black text-[#1a1f36] tracking-tight">Payment</h2>
                <button onClick={() => setShowCheckoutModal(false)} className="p-3 bg-gray-50 hover:bg-gray-100 rounded-full text-gray-400 transition-colors active:scale-90">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              {/* Toggle Payment Method */}
              <div className="flex gap-4 mb-8">
                <button 
                  onClick={() => setPaymentMethod('CASH')}
                  className={`flex-1 py-5 rounded-2xl border-2 flex flex-col items-center justify-center gap-3 font-extrabold transition-all ${paymentMethod === 'CASH' ? 'border-[#6C4E31] text-[#6C4E31] bg-[#6C4E31]/5 ring-4 ring-[#6C4E31]/10' : 'border-gray-100 text-gray-400 hover:border-gray-200 hover:bg-gray-50'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V4.22a.75.75 0 00-.75-.75h-13.5a.75.75 0 00-.75.75v14.53zM15.75 18.75v-1.5a.75.75 0 00-1.5 0v1.5m-3-1.5v1.5m-3-1.5v1.5m10.5-12.75h-10.5M10.5 9h-3m3 3h-3m3 3h-3m3 0v1.5" /></svg>
                  CASH
                </button>
                <button 
                  onClick={() => setPaymentMethod('QRIS')}
                  className={`flex-1 py-5 rounded-2xl border-2 flex flex-col items-center justify-center gap-3 font-extrabold transition-all ${paymentMethod === 'QRIS' ? 'border-[#6C4E31] text-[#6C4E31] bg-[#6C4E31]/5 ring-4 ring-[#6C4E31]/10' : 'border-gray-100 text-gray-400 hover:border-gray-200 hover:bg-gray-50'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" /><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 16.5h.008v.008h-.008v-.008zM16.5 19.5h.008v.008h-.008v-.008zM19.5 16.5h.008v.008h-.008v-.008zM19.5 19.5h.008v.008h-.008v-.008zM16.5 13.5h.008v.008h-.008v-.008zM13.5 16.5h.008v.008h-.008v-.008zM13.5 19.5h.008v.008h-.008v-.008zM19.5 13.5h.008v.008h-.008v-.008z" /></svg>
                  QRIS / E-Wallet
                </button>
              </div>

              {/* Quick Cash Options */}
              {paymentMethod === 'CASH' && (
                <div className="mb-auto animate-in fade-in duration-300">
                  <h3 className="font-bold text-[13px] text-gray-400 uppercase tracking-wider mb-4">Quick Cash</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => setCashAmount('EXACT')}
                      className={`py-4 rounded-2xl border-2 text-[14px] font-bold transition-all ${cashAmount === 'EXACT' ? 'border-[#6C4E31] text-[#6C4E31] bg-[#6C4E31]/5' : 'border-gray-100 text-gray-500 hover:border-gray-200 hover:bg-gray-50'}`}
                    >
                      Exact Amount
                    </button>
                    {[50000, 100000, 150000, 200000].map((amount) => (
                      <button 
                        key={amount}
                        onClick={() => setCashAmount(amount)}
                        className={`py-4 rounded-2xl border-2 text-[14px] font-bold transition-all ${cashAmount === amount ? 'border-[#6C4E31] text-[#6C4E31] bg-[#6C4E31]/5' : 'border-gray-100 text-gray-500 hover:border-gray-200 hover:bg-gray-50'}`}
                      >
                        Rp {amount.toLocaleString('id-ID')}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* QRIS Placeholder */}
              {paymentMethod === 'QRIS' && (
                <div className="mb-auto flex flex-col items-center justify-center p-10 border-2 border-dashed border-gray-200 rounded-3xl bg-gray-50 animate-in fade-in duration-300">
                  <div className="w-20 h-20 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-5">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-[#6C4E31]"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" /><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 16.5h.008v.008h-.008v-.008zM16.5 19.5h.008v.008h-.008v-.008zM19.5 16.5h.008v.008h-.008v-.008zM19.5 19.5h.008v.008h-.008v-.008zM16.5 13.5h.008v.008h-.008v-.008zM13.5 16.5h.008v.008h-.008v-.008zM13.5 19.5h.008v.008h-.008v-.008zM19.5 13.5h.008v.008h-.008v-.008z" /></svg>
                  </div>
                  <h3 className="font-extrabold text-[#1a1f36] text-lg mb-1">Awaiting Payment</h3>
                  <p className="text-sm font-medium text-gray-500 text-center">Please scan the QR code displayed on<br/>the EDC machine to complete.</p>
                </div>
              )}

              <button 
                onClick={confirmPayment}
                className="mt-8 w-full bg-[#6C4E31] text-white py-5 rounded-2xl font-black text-[16px] shadow-[0_8px_25px_-8px_rgba(108,78,49,0.5)] hover:bg-[#583f27] hover:-translate-y-0.5 active:scale-[0.98] transition-all"
              >
                Confirm Payment - Rp {total.toLocaleString('id-ID')}
              </button>
            </div>

            {/* KANAN: RECEIPT PREVIEW */}
            <div className="w-[380px] bg-[#f4f5f7] border-l border-gray-200 p-10 flex justify-center items-start overflow-y-auto hidden md:flex">
              <div className="bg-white w-full rounded-sm relative shadow-md" style={{ filter: "drop-shadow(0 10px 15px rgba(0,0,0,0.05))" }}>
                {/* Paper zig-zag top simulation */}
                <div className="absolute top-0 left-0 right-0 h-2 bg-repeat-x" style={{ backgroundImage: 'radial-gradient(circle at 50% 0, transparent 0, transparent 4px, white 4px)', backgroundSize: '12px 12px' }}></div>
                
                <div className="p-7 pt-10 pb-10 font-mono text-[12px] text-gray-800">
                  <div className="text-center mb-8">
                    <h3 className="font-black text-xl mb-1.5 font-sans tracking-tight text-[#1a1f36]">CRAFT COFFEE</h3>
                    <p className="text-gray-500 text-[10px] uppercase tracking-wider">Jl. Senopati No. 42, Jakarta</p>
                    <p className="text-gray-500 text-[10px] uppercase tracking-wider">Tel: (021) 555-0123</p>
                  </div>

                  <div className="border-t border-dashed border-gray-300 py-3.5 flex justify-between text-gray-500 text-[10px] uppercase tracking-wider">
                    <div>
                      <p className="mb-1">Date: {new Date().toLocaleDateString('id-ID')}</p>
                      <p>Time: {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    <div className="text-right">
                      <p className="mb-1">TX: {transactionId}</p>
                      <p>Cashier: {cashierName.split(' ')[0]}</p>
                    </div>
                  </div>

                  <div className="border-t border-dashed border-gray-300 py-5 flex flex-col gap-4">
                    {cart.map((item) => {
                      const { baseName, variants } = parseItemName(item.name);
                      return (
                        <div key={item.id}>
                          <div className="flex justify-between font-bold text-[13px] text-[#1a1f36]">
                            <span>{item.quantity}x {baseName}</span>
                            <span>Rp {(item.price * item.quantity).toLocaleString('id-ID')}</span>
                          </div>
                          {variants.length > 0 && (
                            <div className="text-gray-400 pl-5 mt-1.5 text-[11px]">
                              {variants.map((v, i) => <div key={i} className="mb-0.5">- {v}</div>)}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="border-t border-dashed border-gray-300 py-4 flex flex-col gap-2">
                    <div className="flex justify-between text-gray-500">
                      <span>Subtotal</span>
                      <span>Rp {subtotal.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between text-gray-500">
                      <span>Tax (10%)</span>
                      <span>Rp {taxAndService.toLocaleString('id-ID')}</span>
                    </div>
                  </div>

                  <div className="border-t border-dashed border-gray-300 py-4 flex justify-between items-center font-black text-[16px] text-[#1a1f36]">
                    <span>TOTAL</span>
                    <span>Rp {total.toLocaleString('id-ID')}</span>
                  </div>

                  <div className="border-t border-dashed border-gray-300 pt-8 pb-2 text-center flex flex-col gap-1.5">
                    <p className="font-bold text-[13px] text-[#1a1f36]">PAID - {paymentMethod}</p>
                    <p className="text-gray-400 text-[10px] mt-1 uppercase tracking-widest">Thank you for your visit!</p>
                  </div>
                </div>

                {/* Paper zig-zag bottom simulation */}
                <div className="absolute bottom-0 left-0 right-0 h-2 bg-repeat-x rotate-180" style={{ backgroundImage: 'radial-gradient(circle at 50% 0, transparent 0, transparent 4px, white 4px)', backgroundSize: '12px 12px' }}></div>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}