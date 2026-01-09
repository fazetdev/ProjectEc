'use client';

import { useEffect, useState, useCallback } from 'react';
import { Package, TrendingUp, DollarSign, Tag, ShoppingBag, AlertCircle, Eye, EyeOff, Wifi, WifiOff, RefreshCw, Cloud, CloudOff } from 'lucide-react';
import { offlineStorage, PendingSale } from '@/lib/offlineStorage';

type Product = {
  _id: string;
  name: string;
  price: number;
  sellingPrice: number;
  expectedProfit: number;
  actualProfit: number;
  totalSales: number;
  lastSaleDate: string | null;
  lastSalePrice: number;
  genderCategory: string;
  ageGroup: string;
  sizes: string[];
  stockCount: number;
  originalStock: number;
  isSold: boolean;
  dateAdded: string;
  imageFile: string;
};

type DashboardStats = {
  totalProducts: number;
  totalStock: number;
  totalOriginalStock: number;
  totalExpectedProfit: number;
  totalActualProfit: number;
  totalSales: number;
  todaySales: number;
  todayProfit: number;
};

export default function Dashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalStock: 0,
    totalOriginalStock: 0,
    totalExpectedProfit: 0,
    totalActualProfit: 0,
    totalSales: 0,
    todaySales: 0,
    todayProfit: 0
  });
  const [loading, setLoading] = useState(true);
  const [sellingProductId, setSellingProductId] = useState<string | null>(null);
  const [salePrice, setSalePrice] = useState('');
  const [saleError, setSaleError] = useState('');
  const [saleSuccess, setSaleSuccess] = useState('');
  const [showProfit, setShowProfit] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [quickSellMode, setQuickSellMode] = useState(false);
  
  // OFFLINE STATES
  const [isOnline, setIsOnline] = useState(true);
  const [pendingSales, setPendingSales] = useState<PendingSale[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [usingCachedData, setUsingCachedData] = useState(false);

  // Check network status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Try to sync pending sales when back online
      if (offlineStorage.hasPendingSales()) {
        syncPendingSales();
      }
    };
    
    const handleOffline = () => setIsOnline(false);
    
    setIsOnline(navigator.onLine);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load data
  useEffect(() => {
    fetchDashboardData();
    loadPendingSales();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/products');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setProducts(data);
      updateStats(data);
      
      // Cache data for offline use
      offlineStorage.cacheDashboardData(data, calculateStats(data));
      setUsingCachedData(false);
      setLoading(false);
      
    } catch (err) {
      console.error('Failed to fetch products:', err);
      
      // Try to load cached data
      const cached = offlineStorage.getCachedData();
      if (cached) {
        setProducts(cached.products || []);
        setStats(cached.stats || getDefaultStats());
        setUsingCachedData(true);
        console.log('Using cached data');
      }
      
      setLoading(false);
    }
  };

  const updateStats = (data: Product[]) => {
    const totalProducts = data.length;
    const totalStock = data.reduce((sum: number, p: Product) => sum + p.stockCount, 0);
    const totalOriginalStock = data.reduce((sum: number, p: Product) => sum + p.originalStock, 0);
    const totalExpectedProfit = data
      .filter((p: Product) => !p.isSold)
      .reduce((sum: number, p: Product) => sum + p.expectedProfit * p.stockCount, 0);
    const totalActualProfit = data.reduce((sum: number, p: Product) => sum + p.actualProfit, 0);
    const totalSales = data.reduce((sum: number, p: Product) => sum + p.totalSales, 0);
    
    const today = new Date().toISOString().split('T')[0];
    const todaySales = data.filter((p: Product) => 
      p.lastSaleDate && p.lastSaleDate.startsWith(today)
    ).length;
    
    const todayProfit = data
      .filter((p: Product) => p.lastSaleDate && p.lastSaleDate.startsWith(today))
      .reduce((sum: number, p: Product) => sum + (p.lastSalePrice - p.price), 0);
    
    setStats({
      totalProducts,
      totalStock,
      totalOriginalStock,
      totalExpectedProfit,
      totalActualProfit,
      totalSales,
      todaySales,
      todayProfit
    });
  };

  const calculateStats = (data: Product[]): DashboardStats => {
    const totalProducts = data.length;
    const totalStock = data.reduce((sum: number, p: Product) => sum + p.stockCount, 0);
    const totalOriginalStock = data.reduce((sum: number, p: Product) => sum + p.originalStock, 0);
    const totalExpectedProfit = data
      .filter((p: Product) => !p.isSold)
      .reduce((sum: number, p: Product) => sum + p.expectedProfit * p.stockCount, 0);
    const totalActualProfit = data.reduce((sum: number, p: Product) => sum + p.actualProfit, 0);
    const totalSales = data.reduce((sum: number, p: Product) => sum + p.totalSales, 0);
    
    const today = new Date().toISOString().split('T')[0];
    const todaySales = data.filter((p: Product) => 
      p.lastSaleDate && p.lastSaleDate.startsWith(today)
    ).length;
    
    const todayProfit = data
      .filter((p: Product) => p.lastSaleDate && p.lastSaleDate.startsWith(today))
      .reduce((sum: number, p: Product) => sum + (p.lastSalePrice - p.price), 0);
    
    return {
      totalProducts,
      totalStock,
      totalOriginalStock,
      totalExpectedProfit,
      totalActualProfit,
      totalSales,
      todaySales,
      todayProfit
    };
  };

  const getDefaultStats = (): DashboardStats => ({
    totalProducts: 0,
    totalStock: 0,
    totalOriginalStock: 0,
    totalExpectedProfit: 0,
    totalActualProfit: 0,
    totalSales: 0,
    todaySales: 0,
    todayProfit: 0
  });

  const loadPendingSales = () => {
    const sales = offlineStorage.getPendingSales();
    setPendingSales(sales);
  };

  const handleSellClick = (productId: string, expectedPrice: number, productName: string) => {
    setSellingProductId(productId);
    setSalePrice(expectedPrice.toString());
    setSaleError('');
    setSaleSuccess('');
    setQuickSellMode(false);
  };

  const handleSellSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sellingProductId || !salePrice) return;
    
    setSaleError('');
    setSaleSuccess('');
    
    const salePriceNum = parseFloat(salePrice);
    const product = products.find(p => p._id === sellingProductId);
    
    if (!product) {
      setSaleError('Product not found');
      return;
    }

    // If offline, save to pending sales
    if (!isOnline) {
      const saleId = offlineStorage.savePendingSale({
        productId: sellingProductId,
        productName: product.name,
        salePrice: salePriceNum
      });
      
      setSaleSuccess('Sale saved offline! Will sync when back online.');
      loadPendingSales();
      
      // Update local state optimistically
      const updatedProducts = products.map(p => 
        p._id === sellingProductId 
          ? { ...p, stockCount: Math.max(0, p.stockCount - 1) }
          : p
      );
      setProducts(updatedProducts);
      updateStats(updatedProducts);
      
      setTimeout(() => {
        setSellingProductId(null);
        setSalePrice('');
      }, 2000);
      
      return;
    }

    // If online, try to sync immediately
    try {
      const response = await fetch('/api/products/sell', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: sellingProductId,
          salePrice: salePriceNum
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to record sale');
      }
      
      setSaleSuccess('Sale recorded successfully! Stock updated.');
      
      setTimeout(() => {
        fetchDashboardData();
        setSellingProductId(null);
        setSalePrice('');
      }, 1500);
      
    } catch (err: any) {
      // If API fails, save offline
      const saleId = offlineStorage.savePendingSale({
        productId: sellingProductId,
        productName: product.name,
        salePrice: salePriceNum
      });
      
      setSaleError(`Network error. Sale saved offline (ID: ${saleId})`);
      loadPendingSales();
      
      // Still update local state optimistically
      const updatedProducts = products.map(p => 
        p._id === sellingProductId 
          ? { ...p, stockCount: Math.max(0, p.stockCount - 1) }
          : p
      );
      setProducts(updatedProducts);
      updateStats(updatedProducts);
    }
  };

  const syncPendingSales = async () => {
    if (!isOnline || isSyncing) return;
    
    const pending = offlineStorage.getPendingSales();
    if (pending.length === 0) return;
    
    setIsSyncing(true);
    
    for (const sale of pending) {
      if (sale.status === 'pending') {
        offlineStorage.updateSaleStatus(sale.id, 'syncing');
        loadPendingSales();
        
        try {
          const response = await fetch('/api/products/sell', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              productId: sale.productId,
              salePrice: sale.salePrice
            }),
          });
          
          if (response.ok) {
            offlineStorage.removePendingSale(sale.id);
          } else {
            offlineStorage.updateSaleStatus(sale.id, 'failed');
          }
        } catch (error) {
          offlineStorage.updateSaleStatus(sale.id, 'failed');
        }
        
        loadPendingSales();
      }
    }
    
    setIsSyncing(false);
    fetchDashboardData(); // Refresh data after sync
  };

  const cancelSale = () => {
    setSellingProductId(null);
    setSalePrice('');
    setSaleError('');
    setSaleSuccess('');
    setQuickSellMode(false);
  };

  const handleQuickSell = () => {
    const availableProducts = products.filter(p => p.stockCount > 0);
    if (availableProducts.length === 0) {
      alert('No products in stock to sell');
      return;
    }
    
    setQuickSellMode(true);
    setShowMobileMenu(false);
  };

  const formatProfit = (amount: number) => {
    if (showProfit) {
      return `₦${amount.toFixed(2)}`;
    }
    return '••••••';
  };

  const getImagePath = (imageFile: string) => {
    if (!imageFile) return '/shoes/default-shoe.jpg';
    return `/shoes/${imageFile}`;
  };

  const getLowStockItems = () => {
    return products
      .filter(p => p.stockCount > 0 && p.stockCount <= 3)
      .sort((a, b) => a.stockCount - b.stockCount)
      .slice(0, 5);
  };

  const getHotItems = () => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    return products
      .filter(p => p.lastSaleDate && new Date(p.lastSaleDate) >= sevenDaysAgo)
      .sort((a, b) => (b.totalSales || 0) - (a.totalSales || 0))
      .slice(0, 3);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-white">Loading your business data...</p>
      </div>
    );
  }

  const lowStockItems = getLowStockItems();
  const hotItems = getHotItems();

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Sale Modal */}
      {sellingProductId && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Record Sale</h3>
              {!isOnline && (
                <span className="flex items-center gap-1 text-yellow-400 text-sm">
                  <WifiOff size={16} />
                  Offline Mode
                </span>
              )}
            </div>
            
            <form onSubmit={handleSellSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Actual Sale Price (₦)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={salePrice}
                  onChange={(e) => setSalePrice(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                  placeholder="0.00"
                  autoFocus
                  required
                />
              </div>
              
              {saleError && (
                <div className="p-3 bg-red-500/20 border border-red-500/40 rounded-xl">
                  <p className="text-red-400 text-sm">{saleError}</p>
                </div>
              )}
              
              {saleSuccess && (
                <div className="p-3 bg-green-500/20 border border-green-500/40 rounded-xl">
                  <p className="text-green-400 text-sm">{saleSuccess}</p>
                </div>
              )}
              
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-medium text-lg transition-colors"
                >
                  {isOnline ? 'Confirm Sale' : 'Save Offline'}
                </button>
                <button
                  type="button"
                  onClick={cancelSale}
                  className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl font-medium text-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mobile Quick Sell Panel */}
      {quickSellMode && (
        <div className="fixed inset-0 bg-black/90 z-40 p-4 pt-20 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold">Quick Sell</h2>
              <div className="flex items-center gap-2 mt-1">
                {!isOnline && (
                  <span className="flex items-center gap-1 text-yellow-400 text-xs">
                    <WifiOff size={12} />
                    Offline
                  </span>
                )}
                {pendingSales.length > 0 && (
                  <span className="flex items-center gap-1 text-blue-400 text-xs">
                    <Cloud size={12} />
                    {pendingSales.length} pending
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => setQuickSellMode(false)}
              className="p-2 hover:bg-gray-800 rounded-lg"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-3">
            {products
              .filter(p => p.stockCount > 0)
              .slice(0, 10)
              .map((product) => (
                <div 
                  key={product._id} 
                  className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-xl active:bg-gray-700 transition-colors"
                  onClick={() => handleSellClick(product._id, product.sellingPrice, product.name)}
                >
                  <div className="h-14 w-14 bg-gray-900 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={getImagePath(product.imageFile)}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{product.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-400">Stock: {product.stockCount}</span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-blue-400">₦{product.sellingPrice.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">₦{product.sellingPrice.toFixed(2)}</div>
                    <div className="text-xs text-green-400">Sell →</div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Mobile Header */}
      <header className="sticky top-0 z-30 bg-gray-900/90 backdrop-blur-sm border-b border-gray-800 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Dashboard</h1>
            <div className="flex items-center gap-2">
              <p className="text-xs text-gray-400">Shoe Business</p>
              {!isOnline && (
                <span className="flex items-center gap-1 text-yellow-400 text-xs">
                  <WifiOff size={12} />
                  Offline
                </span>
              )}
              {usingCachedData && (
                <span className="flex items-center gap-1 text-blue-400 text-xs">
                  <Cloud size={12} />
                  Cached
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Pending Sales Badge */}
            {pendingSales.length > 0 && (
              <button
                onClick={syncPendingSales}
                disabled={!isOnline || isSyncing}
                className={`relative p-2 rounded-lg ${isOnline ? 'hover:bg-gray-800' : 'opacity-50'}`}
              >
                <Cloud size={20} className={isSyncing ? 'animate-pulse' : ''} />
                {pendingSales.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {pendingSales.length}
                  </span>
                )}
              </button>
            )}
            
            <button
              onClick={() => setShowProfit(!showProfit)}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              aria-label={showProfit ? "Hide profits" : "Show profits"}
            >
              {showProfit ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
            
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="p-2 hover:bg-gray-800 rounded-lg lg:hidden transition-colors"
              aria-label="Menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {showMobileMenu ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Quick Stats Bar */}
        <div className="flex items-center justify-between mt-4 p-3 bg-gray-800/50 rounded-xl">
          <div className="text-center">
            <div className="text-2xl font-bold">{stats.totalStock}</div>
            <div className="text-xs text-gray-400">In Stock</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{stats.todaySales}</div>
            <div className="text-xs text-gray-400">Today</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{formatProfit(stats.todayProfit)}</div>
            <div className="text-xs text-gray-400">Today's Profit</div>
          </div>
        </div>
      </header>

      <main className="p-4 pb-24 max-w-6xl mx-auto">
        {/* Network Status Banner */}
        {!isOnline && (
          <div className="mb-4 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <WifiOff size={18} className="text-yellow-400" />
              <span className="text-yellow-300">You're offline. Sales will be saved locally.</span>
            </div>
            {pendingSales.length > 0 && (
              <span className="text-yellow-300 text-sm">
                {pendingSales.length} pending sale(s)
              </span>
            )}
          </div>
        )}

        {/* Pending Sales Sync Banner */}
        {isOnline && pendingSales.length > 0 && (
          <div className="mb-4 p-3 bg-blue-500/20 border border-blue-500/30 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cloud size={18} className="text-blue-400" />
              <span className="text-blue-300">{pendingSales.length} pending sale(s) to sync</span>
            </div>
            <button
              onClick={syncPendingSales}
              disabled={isSyncing}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              {isSyncing ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  Syncing...
                </>
              ) : (
                'Sync Now'
              )}
            </button>
          </div>
        )}

        {/* Quick Sell FAB */}
        <button
          onClick={handleQuickSell}
          className="fixed bottom-20 right-4 z-20 bg-green-600 hover:bg-green-700 text-white p-4 rounded-full shadow-lg lg:hidden transition-all active:scale-95"
          aria-label="Quick Sell"
        >
          <ShoppingBag size={24} />
        </button>

        {/* Main Stats Grid - Mobile Stacked */}
        <div className="space-y-4 mb-6">
          <div className="bg-gray-800/30 border border-gray-700 rounded-2xl p-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400">
                    <Package size={22} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Total Inventory</p>
                    <p className="text-2xl font-bold">{stats.totalProducts} items</p>
                  </div>
                </div>
                <p className="text-sm text-gray-500">
                  {stats.totalStock} available • {stats.totalOriginalStock - stats.totalStock} sold
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-800/30 border border-gray-700 rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-xl bg-green-500/20 text-green-400">
                  <Tag size={18} />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Today's Sales</p>
                  <p className="text-xl font-bold">{stats.todaySales}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/30 border border-gray-700 rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
                  <DollarSign size={18} />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Today's Profit</p>
                  <p className="text-xl font-bold">{formatProfit(stats.todayProfit)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/30 border border-gray-700 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-yellow-500/20 text-yellow-400">
                  <TrendingUp size={18} />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Total Profit</p>
                  <p className="text-2xl font-bold">{formatProfit(stats.totalActualProfit)}</p>
                </div>
              </div>
              <button
                onClick={() => setShowProfit(!showProfit)}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                aria-label={showProfit ? "Hide profit" : "Show profit"}
              >
                {showProfit ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <p className="text-sm text-gray-500">From {stats.totalSales} total sales</p>
          </div>
        </div>

        {/* Low Stock Alert Section */}
        {lowStockItems.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <AlertCircle size={20} className="text-yellow-500" />
                Low Stock Alert
              </h2>
              <span className="text-sm text-gray-400">{lowStockItems.length} items</span>
            </div>
            
            <div className="space-y-2">
              {lowStockItems.map((product) => (
                <div 
                  key={product._id}
                  className="flex items-center gap-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl"
                >
                  <div className="h-12 w-12 bg-gray-900 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={getImagePath(product.imageFile)}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{product.name}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-sm text-yellow-400">⚠️ Only {product.stockCount} left</span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-400">{product.genderCategory} • {product.ageGroup}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleSellClick(product._id, product.sellingPrice, product.name)}
                    className="px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 rounded-lg text-sm font-medium transition-colors"
                  >
                    Sell
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Hot Items This Week */}
        {hotItems.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-bold mb-3">Hot This Week</h2>
            
            <div className="space-y-2">
              {hotItems.map((product) => (
                <div 
                  key={product._id}
                  className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-xl active:bg-gray-700 transition-colors"
                  onClick={() => handleSellClick(product._id, product.sellingPrice, product.name)}
                >
                  <div className="h-12 w-12 bg-gray-900 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={getImagePath(product.imageFile)}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{product.name}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-sm text-green-400">🔥 {product.totalSales || 0} sold</span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-blue-400">₦{product.sellingPrice.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{product.stockCount} in stock</div>
                    <div className="text-xs text-gray-400">Tap to sell</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Category Summary */}
        <div className="bg-gray-800/30 border border-gray-700 rounded-2xl p-5 mb-6">
          <h2 className="text-lg font-bold mb-4">Inventory by Category</h2>
          
          <div className="space-y-4">
            {['Men', 'Women', 'Kids'].map((gender) => {
              const genderProducts = products.filter(p => p.genderCategory === gender);
              const inStock = genderProducts.reduce((sum, p) => sum + p.stockCount, 0);
              const total = genderProducts.reduce((sum, p) => sum + p.originalStock, 0);
              
              return (
                <div key={gender} className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">{gender}</span>
                    <div className="text-sm text-gray-400">
                      {inStock} in stock • {total - inStock} sold
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{genderProducts.length} models</div>
                    <div className="text-sm text-gray-400">
                      {total > 0 ? Math.round((inStock / total) * 100) : 0}% remaining
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile Bottom Nav */}
        <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 p-3 flex justify-around z-30 lg:hidden">
          <button
            onClick={handleQuickSell}
            className="flex flex-col items-center p-2 hover:text-blue-400 transition-colors"
          >
            <ShoppingBag size={22} />
            <span className="text-xs mt-1">Sell</span>
          </button>
          
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex flex-col items-center p-2 hover:text-blue-400 transition-colors"
          >
            <Package size={22} />
            <span className="text-xs mt-1">Stock</span>
          </button>
          
          <button
            onClick={() => setShowProfit(!showProfit)}
            className="flex flex-col items-center p-2 hover:text-blue-400 transition-colors"
          >
            {showProfit ? <EyeOff size={22} /> : <Eye size={22} />}
            <span className="text-xs mt-1">{showProfit ? 'Hide' : 'Show'}</span>
          </button>
        </div>
      </main>

      {/* Desktop Quick Sell Button */}
      <button
        onClick={handleQuickSell}
        className="fixed bottom-6 right-6 z-20 bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-full shadow-lg hidden lg:flex items-center gap-2 transition-all hover:scale-105"
      >
        <ShoppingBag size={20} />
        <span className="font-medium">Quick Sell</span>
      </button>
    </div>
  );
}