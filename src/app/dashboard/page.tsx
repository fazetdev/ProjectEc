'use client';

import { useEffect, useState } from 'react';
import { Package, TrendingUp, DollarSign, Tag } from 'lucide-react';

type Product = {
  _id: string;
  name: string;
  description: string;
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
  dateSold: string | null;
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

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/products');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setProducts(data);
      
      // Calculate dashboard statistics
      const totalProducts = data.length;
      const totalStock = data.reduce((sum: number, p: Product) => sum + p.stockCount, 0);
      const totalOriginalStock = data.reduce((sum: number, p: Product) => sum + p.originalStock, 0);
      const totalExpectedProfit = data
        .filter((p: Product) => !p.isSold)
        .reduce((sum: number, p: Product) => sum + p.expectedProfit * p.stockCount, 0);
      const totalActualProfit = data.reduce((sum: number, p: Product) => sum + p.actualProfit, 0);
      const totalSales = data.reduce((sum: number, p: Product) => sum + p.totalSales, 0);
      
      // Calculate today's sales (simplified - would need actual date filtering)
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
      
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setLoading(false);
    }
  };

  const handleSellClick = (productId: string, expectedPrice: number) => {
    setSellingProductId(productId);
    setSalePrice(expectedPrice.toString());
    setSaleError('');
    setSaleSuccess('');
  };

  const handleSellSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sellingProductId || !salePrice) return;
    
    setSaleError('');
    setSaleSuccess('');
    
    try {
      const response = await fetch('/api/products/sell', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: sellingProductId,
          salePrice: parseFloat(salePrice)
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to record sale');
      }
      
      setSaleSuccess('Sale recorded successfully! Stock updated.');
      
      // Refresh dashboard data
      setTimeout(() => {
        fetchDashboardData();
        setSellingProductId(null);
        setSalePrice('');
      }, 1500);
      
    } catch (err: any) {
      setSaleError(err.message || 'Failed to record sale');
    }
  };

  const cancelSale = () => {
    setSellingProductId(null);
    setSalePrice('');
    setSaleError('');
    setSaleSuccess('');
  };

  // Get recently added products (last 3)
  const recentProducts = [...products]
    .sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime())
    .slice(0, 3);

  // Get best selling products
  const bestSellers = [...products]
    .sort((a, b) => b.totalSales - a.totalSales)
    .slice(0, 3);

  // Helper function to get image path
  const getImagePath = (imageFile: string) => {
    if (!imageFile) return '/shoes/default-shoe.jpg';
    return `/shoes/${imageFile}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Sale Modal */}
      {sellingProductId && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Record Sale</h3>
            
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
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter actual sale price"
                  autoFocus
                  required
                />
              </div>
              
              {saleError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-red-400 text-sm">{saleError}</p>
                </div>
              )}
              
              {saleSuccess && (
                <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <p className="text-green-400 text-sm">{saleSuccess}</p>
                </div>
              )}
              
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium"
                >
                  Confirm Sale
                </button>
                <button
                  type="button"
                  onClick={cancelSale}
                  className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Business Dashboard</h1>
          <p className="text-gray-400">Real-time sales & inventory tracking</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-5">
            <div className="flex items-center">
              <div className="p-2.5 rounded-lg bg-blue-500/20 text-blue-400">
                <Package className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-400">Available Stock</p>
                <p className="text-2xl font-bold">{stats.totalStock}</p>
                <p className="text-xs text-gray-500 mt-1">of {stats.totalOriginalStock} total</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-5">
            <div className="flex items-center">
              <div className="p-2.5 rounded-lg bg-green-500/20 text-green-400">
                <Tag className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-400">Today's Sales</p>
                <p className="text-2xl font-bold">{stats.todaySales}</p>
                <p className="text-xs text-gray-500 mt-1">₦{stats.todayProfit.toFixed(2)} profit</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-5">
            <div className="flex items-center">
              <div className="p-2.5 rounded-lg bg-yellow-500/20 text-yellow-400">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-400">Total Sales</p>
                <p className="text-2xl font-bold">{stats.totalSales}</p>
                <p className="text-xs text-gray-500 mt-1">items sold</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-5">
            <div className="flex items-center">
              <div className="p-2.5 rounded-lg bg-purple-500/20 text-purple-400">
                <DollarSign className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-400">Actual Profit</p>
                <p className="text-2xl font-bold">₦{stats.totalActualProfit.toFixed(2)}</p>
                <p className="text-xs text-gray-500 mt-1">from all sales</p>
              </div>
            </div>
          </div>
        </div>

        {/* Two Columns: Recent & Best Sellers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Additions */}
          <div className="bg-gray-800/30 border border-gray-700 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-700">
              <h2 className="text-xl font-bold">Recent Additions</h2>
              <p className="text-gray-400 text-sm">New shoes added to inventory</p>
            </div>
            
            <div className="p-4">
              {recentProducts.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400">No shoes in inventory</p>
                  <p className="text-gray-500 text-sm mt-1">Add your first pair of shoes</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentProducts.map((product) => (
                    <div key={product._id} className="flex items-center gap-4 p-3 bg-gray-800/50 rounded-lg">
                      <div className="h-16 w-16 bg-gray-900 rounded overflow-hidden flex-shrink-0">
                        <img
                          src={getImagePath(product.imageFile)}
                          alt={product.name}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/shoes/default-shoe.jpg';
                          }}
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium truncate">{product.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-400">Stock: {product.stockCount}</span>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-400">Cost: ₦{product.price.toFixed(2)}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleSellClick(product._id, product.sellingPrice)}
                        disabled={product.stockCount === 0}
                        className={`px-4 py-2 rounded-lg text-sm font-medium ${
                          product.stockCount === 0
                            ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                            : 'bg-green-600 hover:bg-green-700 text-white'
                        }`}
                      >
                        {product.stockCount === 0 ? 'Sold Out' : 'Sell'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Best Sellers */}
          <div className="bg-gray-800/30 border border-gray-700 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-700">
              <h2 className="text-xl font-bold">Best Sellers</h2>
              <p className="text-gray-400 text-sm">Top selling shoes</p>
            </div>
            
            <div className="p-4">
              {bestSellers.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400">No sales recorded yet</p>
                  <p className="text-gray-500 text-sm mt-1">Sell shoes to see best sellers</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {bestSellers.map((product) => (
                    <div key={product._id} className="flex items-center gap-4 p-3 bg-gray-800/50 rounded-lg">
                      <div className="h-16 w-16 bg-gray-900 rounded overflow-hidden flex-shrink-0">
                        <img
                          src={getImagePath(product.imageFile)}
                          alt={product.name}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/shoes/default-shoe.jpg';
                          }}
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium truncate">{product.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-green-400">Sold: {product.totalSales}</span>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-blue-400">Profit: ₦{product.actualProfit.toFixed(2)}</span>
                          {product.lastSaleDate && (
                            <>
                              <span className="text-xs text-gray-400">•</span>
                              <span className="text-xs text-gray-400">
                                Last: {new Date(product.lastSaleDate).toLocaleDateString()}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleSellClick(product._id, product.sellingPrice)}
                        disabled={product.stockCount === 0}
                        className={`px-4 py-2 rounded-lg text-sm font-medium ${
                          product.stockCount === 0
                            ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                            : 'bg-green-600 hover:bg-green-700 text-white'
                        }`}
                      >
                        {product.stockCount === 0 ? 'Sold Out' : 'Sell'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-bold mb-4">Inventory Health</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-800/50 rounded-lg">
              <p className="text-gray-400 text-sm">Stock Turnover</p>
              <p className="text-2xl font-bold mt-1">
                {stats.totalOriginalStock > 0 
                  ? ((stats.totalSales / stats.totalOriginalStock) * 100).toFixed(1) 
                  : '0'}%
              </p>
              <p className="text-xs text-gray-500 mt-1">of stock sold</p>
            </div>
            <div className="p-4 bg-gray-800/50 rounded-lg">
              <p className="text-gray-400 text-sm">Avg Profit Margin</p>
              <p className="text-2xl font-bold mt-1">
                {stats.totalSales > 0
                  ? ((stats.totalActualProfit / (stats.totalActualProfit + (stats.totalSales * products.reduce((sum, p) => sum + p.price, 0) / products.length))) * 100).toFixed(1)
                  : '0'}%
              </p>
              <p className="text-xs text-gray-500 mt-1">per sale</p>
            </div>
            <div className="p-4 bg-gray-800/50 rounded-lg">
              <p className="text-gray-400 text-sm">Sales Velocity</p>
              <p className="text-2xl font-bold mt-1">
                {stats.totalSales > 0 ? (stats.totalSales / products.length).toFixed(1) : '0'}
              </p>
              <p className="text-xs text-gray-500 mt-1">sales per product</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
