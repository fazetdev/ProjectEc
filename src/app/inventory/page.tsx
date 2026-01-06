'use client';

import { useEffect, useState } from 'react';

type Product = {
  _id: string;
  name: string;
  description: string;
  price: number;
  sellingPrice: number;
  expectedProfit: number;
  actualProfit: number;
  genderCategory: string;
  ageGroup: string;
  sizes: string[];
  stockCount: number;
  isSold: boolean;
  dateAdded: string;
  dateSold: string | null;
  imageFile: string;
};

export default function Inventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    gender: 'all',
    ageGroup: 'all',
    size: '',
    inStock: 'all',
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const getImagePath = (imageFile: string) => {
    if (!imageFile) return '/shoes/default-shoe.jpg';
    return `/shoes/${imageFile}`;
  };

  const filteredProducts = products.filter(product => {
    if (filter.gender !== 'all' && product.genderCategory !== filter.gender) return false;
    if (filter.ageGroup !== 'all' && product.ageGroup !== filter.ageGroup) return false;
    if (filter.size && !product.sizes.includes(filter.size)) return false;
    if (filter.inStock === 'instock' && product.stockCount === 0) return false;
    if (filter.inStock === 'outofstock' && product.stockCount > 0) return false;
    return true;
  });

  const totalValue = filteredProducts.reduce((sum, p) => sum + p.price * p.stockCount, 0);
  const totalStock = filteredProducts.reduce((sum, p) => sum + p.stockCount, 0);
  const outOfStockCount = filteredProducts.filter(p => p.stockCount === 0).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="text-xl">Loading inventory...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-600 mt-2">Manage and track all your shoe products</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600">Total Products</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{filteredProducts.length}</p>
            <p className="text-sm text-gray-500 mt-1">Different designs</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600">Total Stock</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{totalStock}</p>
            <p className="text-sm text-gray-500 mt-1">Pairs available</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600">Inventory Value</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">₦{totalValue.toFixed(2)}</p>
            <p className="text-sm text-gray-500 mt-1">Purchase cost of current stock</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow mb-8 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Filter Inventory</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
              <select
                value={filter.gender}
                onChange={(e) => setFilter({ ...filter, gender: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="all">All Genders</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="neutral">Neutral</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Age Group</label>
              <select
                value={filter.ageGroup}
                onChange={(e) => setFilter({ ...filter, ageGroup: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="all">All Ages</option>
                <option value="adults">Adults</option>
                <option value="boys">Boys</option>
                <option value="girls">Girls</option>
                <option value="neutral">Neutral</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Size</label>
              <input
                type="text"
                placeholder="e.g., 40, 42"
                value={filter.size}
                onChange={(e) => setFilter({ ...filter, size: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Stock Status</label>
              <select
                value={filter.inStock}
                onChange={(e) => setFilter({ ...filter, inStock: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="all">All Products</option>
                <option value="instock">In Stock</option>
                <option value="outofstock">Out of Stock</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Shoe Products</h2>
              <p className="text-gray-600 text-sm mt-1">
                Showing {filteredProducts.length} of {products.length} products
              </p>
            </div>
            <a
              href="/add-product"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
            >
              Add New Shoe
            </a>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              No shoes found.
            </div>
          ) : (
            <div className="p-6 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shoe</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sizes</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Selling Price</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profit</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredProducts.map(product => (
                    <tr key={product._id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 flex items-center gap-4">
                        <img
                          src={getImagePath(product.imageFile)}
                          alt={product.name}
                          className="h-10 w-10 object-cover rounded"
                          onError={(e) => { (e.target as HTMLImageElement).src = '/shoes/default-shoe.jpg'; }}
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">{product.description}</div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full inline-block w-fit">{product.genderCategory}</span>
                          <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full inline-block w-fit">{product.ageGroup}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">{product.sizes.join(', ')}</td>
                      <td className="px-4 py-4">{product.stockCount}</td>
                      <td className="px-4 py-4">₦{product.price.toFixed(2)}</td>
                      <td className="px-4 py-4 text-green-600 font-medium">₦{product.sellingPrice.toFixed(2)}</td>
                      <td className="px-4 py-4">
                        {product.isSold ? `₦${product.actualProfit.toFixed(2)}` : `₦${product.expectedProfit.toFixed(2)} (expected)`}
                      </td>
                      <td className="px-4 py-4">
                        <button
                          onClick={() => {
                            if(confirm("Delete this product?")) {
                              fetch(`/api/products/${product._id}`, { method: 'DELETE' })
                                .then(res => res.json())
                                .then(data => { if(data.success) { alert("Product deleted"); fetchProducts(); } else { alert(data.error || "Delete failed"); }})
                                .catch(err => { console.error(err); alert("Network error"); });
                            }
                          }}
                          className="px-3 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded text-sm font-medium"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
