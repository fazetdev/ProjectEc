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
  imageFile: string; // Changed to imageFile (just filename)
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

  // Helper function to get image path
  const getImagePath = (imageFile: string) => {
    if (!imageFile) return '/shoes/default-shoe.jpg';
    return `/shoes/${imageFile}`;
  };

  // Filter products based on current filters
  const filteredProducts = products.filter(product => {
    if (filter.gender !== 'all' && product.genderCategory !== filter.gender) return false;
    if (filter.ageGroup !== 'all' && product.ageGroup !== filter.ageGroup) return false;
    if (filter.size && !product.sizes.includes(filter.size)) return false;
    if (filter.inStock === 'instock' && product.stockCount === 0) return false;
    if (filter.inStock === 'outofstock' && product.stockCount > 0) return false;
    return true;
  });

  // Calculate inventory statistics
  const totalValue = filteredProducts.reduce((sum, p) => sum + (p.price * p.stockCount), 0);
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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-600 mt-2">Manage and track all your shoe products</p>
        </div>

        {/* Stats Summary */}
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
            {/* Gender Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
              <select
                value={filter.gender}
                onChange={(e) => setFilter({...filter, gender: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="all">All Genders</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="neutral">Neutral</option>
              </select>
            </div>

            {/* Age Group Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Age Group</label>
              <select
                value={filter.ageGroup}
                onChange={(e) => setFilter({...filter, ageGroup: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="all">All Ages</option>
                <option value="adults">Adults</option>
                <option value="boys">Boys</option>
                <option value="girls">Girls</option>
                <option value="neutral">Neutral</option>
              </select>
            </div>

            {/* Size Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Size</label>
              <input
                type="text"
                placeholder="e.g., 40, 42"
                value={filter.size}
                onChange={(e) => setFilter({...filter, size: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            {/* Stock Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Stock Status</label>
              <select
                value={filter.inStock}
                onChange={(e) => setFilter({...filter, inStock: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="all">All Products</option>
                <option value="instock">In Stock</option>
                <option value="outofstock">Out of Stock</option>
              </select>
            </div>
          </div>

          {/* Active Filters Summary */}
          <div className="mt-4 flex flex-wrap gap-2">
            {filter.gender !== 'all' && (
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                Gender: {filter.gender}
              </span>
            )}
            {filter.ageGroup !== 'all' && (
              <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
                Age: {filter.ageGroup}
              </span>
            )}
            {filter.size && (
              <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                Size: {filter.size}
              </span>
            )}
            {filter.inStock !== 'all' && (
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full">
                {filter.inStock === 'instock' ? 'In Stock' : 'Out of Stock'}
              </span>
            )}
            {(filter.gender !== 'all' || filter.ageGroup !== 'all' || filter.size || filter.inStock !== 'all') && (
              <button
                onClick={() => setFilter({ gender: 'all', ageGroup: 'all', size: '', inStock: 'all' })}
                className="px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full hover:bg-gray-200"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Products Grid */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Shoe Products</h2>
              <p className="text-gray-600 text-sm mt-1">
                Showing {filteredProducts.length} of {products.length} products
                {outOfStockCount > 0 && ` • ${outOfStockCount} out of stock`}
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
            <div className="p-12 text-center">
              <div className="text-gray-400 mb-4">
                <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <p className="text-gray-500 text-lg mb-2">No shoes found</p>
              <p className="text-gray-400 text-sm">
                {products.length === 0 
                  ? "Your inventory is empty. Add your first pair of shoes." 
                  : "No shoes match your current filters. Try changing your filter criteria."}
              </p>
            </div>
          ) : (
            <div className="p-6">
              <div className="overflow-x-auto">
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
                    {filteredProducts.map((product) => (
                      <tr key={product._id} className="hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                              <img
                                src={getImagePath(product.imageFile)}
                                alt={product.name}
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = '/shoes/default-shoe.jpg';
                                }}
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{product.name}</div>
                              <div className="text-sm text-gray-500 truncate max-w-xs">{product.description}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-col gap-1">
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full inline-block w-fit">
                              {product.genderCategory}
                            </span>
                            <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full inline-block w-fit">
                              {product.ageGroup}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-1">
                            {product.sizes.slice(0, 3).map((size) => (
                              <span key={size} className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">
                                {size}
                              </span>
                            ))}
                            {product.sizes.length > 3 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">
                                +{product.sizes.length - 3}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            product.stockCount > 10 
                              ? 'bg-green-100 text-green-800' 
                              : product.stockCount > 0 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {product.stockCount} pairs
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900">
                          ₦{product.price.toFixed(2)}
                        </td>
                        <td className="px-4 py-4 text-sm text-green-600 font-medium">
                          ₦{product.sellingPrice.toFixed(2)}
                        </td>
                        <td className="px-4 py-4">
                          <div className={`text-sm font-medium ${
                            product.isSold 
                              ? 'text-green-600' 
                              : 'text-blue-600'
                          }`}>
                            ₦{product.isSold ? product.actualProfit.toFixed(2) : product.expectedProfit.toFixed(2)}
                            {!product.isSold && (
                              <div className="text-xs text-gray-500">(expected)</div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <button
                            onClick={() => {if (confirm("Delete this product?")) fetch(`/api/products/${product._id}`, { method: "DELETE" }).then(res => res.json()).then(data => {if (data.success) { alert("Product deleted"); fetchProducts(); } else { alert(data.error || "Delete failed"); }}).catch(err => { console.error(err); alert("Network error"); })}}
                            className="px-3 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded text-sm font-medium"
                            title="Delete product"
                          >
                            Delete
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
