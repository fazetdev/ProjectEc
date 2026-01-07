'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Filter, X, Calendar, Tag, Package, DollarSign } from 'lucide-react';

type Product = {
  id: number;
  shoeCode: string;
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
  color: string;
  condition: string;
  location: string;
  daysInShop: number;
};

type FilterState = {
  gender: string;
  ageGroup: string;
  size: string;
  inStock: string;
  condition: string;
  ageInShop: string;
  color: string;
};

export default function Inventory() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Initialize filters
  const [filters, setFilters] = useState<FilterState>({
    gender: 'all',
    ageGroup: 'all',
    size: '',
    inStock: 'all',
    condition: 'all',
    ageInShop: 'all',
    color: '',
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

  // Extract unique values for filters
  const filterOptions = useMemo(() => {
    const sizes = new Set<string>();
    const colors = new Set<string>();
    
    products.forEach(product => {
      product.sizes.forEach(size => sizes.add(size));
      if (product.color) colors.add(product.color);
    });

    return {
      sizes: Array.from(sizes).sort((a, b) => parseInt(a) - parseInt(b)),
      colors: Array.from(colors).sort(),
      conditions: ['new', 'used', 'refurbished', 'washed'],
    };
  }, [products]);

  // Filter and search logic
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Search term filter (shoe code, name, description, color)
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = 
          product.shoeCode?.toLowerCase().includes(searchLower) ||
          product.name.toLowerCase().includes(searchLower) ||
          product.description?.toLowerCase().includes(searchLower) ||
          product.color?.toLowerCase().includes(searchLower);
        
        if (!matchesSearch) return false;
      }

      // Gender filter
      if (filters.gender !== 'all' && product.genderCategory !== filters.gender) {
        return false;
      }

      // Age group filter
      if (filters.ageGroup !== 'all' && product.ageGroup !== filters.ageGroup) {
        return false;
      }

      // Size filter
      if (filters.size && !product.sizes.includes(filters.size)) {
        return false;
      }

      // Stock filter
      if (filters.inStock === 'instock' && product.stockCount === 0) {
        return false;
      }
      if (filters.inStock === 'outofstock' && product.stockCount > 0) {
        return false;
      }

      // Condition filter
      if (filters.condition !== 'all' && product.condition !== filters.condition) {
        return false;
      }

      // Color filter
      if (filters.color && product.color !== filters.color) {
        return false;
      }

      // Age in shop filter
      if (filters.ageInShop !== 'all') {
        const days = product.daysInShop || 0;
        switch (filters.ageInShop) {
          case 'new': if (days >= 7) return false; break;
          case 'recent': if (days < 7 || days >= 30) return false; break;
          case 'old': if (days < 30 || days >= 90) return false; break;
          case 'veryold': if (days < 90) return false; break;
        }
      }

      return true;
    });
  }, [products, searchTerm, filters]);

  // Calculate age in shop label
  const getAgeLabel = (days: number) => {
    if (days < 7) return { label: 'New', color: 'bg-green-500/20 text-green-400' };
    if (days < 30) return { label: 'Recent', color: 'bg-blue-500/20 text-blue-400' };
    if (days < 90) return { label: 'Old', color: 'bg-yellow-500/20 text-yellow-400' };
    return { label: 'Very Old', color: 'bg-red-500/20 text-red-400' };
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      gender: 'all',
      ageGroup: 'all',
      size: '',
      inStock: 'all',
      condition: 'all',
      ageInShop: 'all',
      color: '',
    });
  };

  // Handle delete
  const handleDelete = async (productId: number) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    
    try {
      const response = await fetch(`/api/products/${productId}`, { method: 'DELETE' });
      const data = await response.json();
      
      if (response.ok && data.success) {
        alert('Product deleted!');
        fetchProducts();
      } else {
        alert(data.error || 'Delete failed');
      }
    } catch (error) {
      alert('Network error');
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="text-xl text-white">Loading inventory...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Shoe Inventory</h1>
          <p className="text-gray-400 mt-2">
            {products.length} total products • {filteredProducts.length} filtered
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by shoe code, name, color... (e.g., ML-SH-001, Blue, Rubber)"
              className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-2">
            {searchTerm ? `Searching for: "${searchTerm}"` : 'Type to instantly search...'}
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-4 mb-6">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 hover:bg-gray-700"
          >
            <Filter className="h-4 w-4" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
            >
              Grid View
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-4 py-2 rounded-lg ${viewMode === 'table' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
            >
              Table View
            </button>
          </div>
          
          <button
            onClick={clearFilters}
            className="px-4 py-2 text-gray-400 hover:text-gray-300"
          >
            Clear Filters
          </button>
          
          <a
            href="/add-product"
            className="ml-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            + Add New Shoe
          </a>
        </div>

        {/* Filters Panel (Collapsible) */}
        {showFilters && (
          <div className="bg-gray-800 border border-gray-700 rounded-xl mb-6 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Gender Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Gender</label>
                <select
                  value={filters.gender}
                  onChange={(e) => setFilters({...filters, gender: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
                >
                  <option value="all">All Genders</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="neutral">Neutral</option>
                </select>
              </div>

              {/* Age Group Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Age Group</label>
                <select
                  value={filters.ageGroup}
                  onChange={(e) => setFilters({...filters, ageGroup: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
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
                <label className="block text-sm font-medium text-gray-300 mb-2">Size</label>
                <select
                  value={filters.size}
                  onChange={(e) => setFilters({...filters, size: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
                >
                  <option value="">All Sizes</option>
                  {filterOptions.sizes.map(size => (
                    <option key={size} value={size}>Size {size}</option>
                  ))}
                </select>
              </div>

              {/* Stock Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Stock Status</label>
                <select
                  value={filters.inStock}
                  onChange={(e) => setFilters({...filters, inStock: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
                >
                  <option value="all">All Products</option>
                  <option value="instock">In Stock</option>
                  <option value="outofstock">Out of Stock</option>
                </select>
              </div>

              {/* Condition Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Condition</label>
                <select
                  value={filters.condition}
                  onChange={(e) => setFilters({...filters, condition: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
                >
                  <option value="all">All Conditions</option>
                  {filterOptions.conditions.map(cond => (
                    <option key={cond} value={cond}>{cond.charAt(0).toUpperCase() + cond.slice(1)}</option>
                  ))}
                </select>
              </div>

              {/* Age in Shop Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Age in Shop</label>
                <select
                  value={filters.ageInShop}
                  onChange={(e) => setFilters({...filters, ageInShop: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
                >
                  <option value="all">All Ages</option>
                  <option value="new">New (&lt;7 days)</option>
                  <option value="recent">Recent (1-4 weeks)</option>
                  <option value="old">Old (1-3 months)</option>
                  <option value="veryold">Very Old (&gt;3 months)</option>
                </select>
              </div>

              {/* Color Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Color</label>
                <select
                  value={filters.color}
                  onChange={(e) => setFilters({...filters, color: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
                >
                  <option value="">All Colors</option>
                  {filterOptions.colors.map(color => (
                    <option key={color} value={color}>{color}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Results Summary */}
        <div className="mb-6 text-gray-400">
          Showing {filteredProducts.length} of {products.length} products
          {searchTerm && ` matching "${searchTerm}"`}
          {filters.gender !== 'all' && ` • Gender: ${filters.gender}`}
          {filters.ageGroup !== 'all' && ` • Age: ${filters.ageGroup}`}
          {filters.size && ` • Size: ${filters.size}`}
        </div>

        {/* Grid View */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map(product => {
              const ageInfo = getAgeLabel(product.daysInShop || 0);
              
              return (
                <div key={product.id} className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
                  {/* Shoe Code Header */}
                  <div className="bg-gray-900 px-4 py-3 border-b border-gray-700">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-blue-400" />
                        <span className="font-mono text-blue-400 font-bold">{product.shoeCode || 'No Code'}</span>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${ageInfo.color}`}>
                        {ageInfo.label}
                      </span>
                    </div>
                  </div>
                  
                  {/* Product Image */}
                  <div className="h-48 bg-gray-700 overflow-hidden">
                    {product.imageFile ? (
                      <img
                        src={`/shoes/${product.imageFile}`}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%232d3748"/><text x="50%" y="50%" font-family="Arial" font-size="20" fill="%236b7280" text-anchor="middle" dy=".3em">No Image</text></svg>';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500">
                        <Package className="h-12 w-12" />
                      </div>
                    )}
                  </div>
                  
                  {/* Product Details */}
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-white truncate">{product.name}</h3>
                    <p className="text-gray-400 text-sm mt-1 truncate">{product.description || 'No description'}</p>
                    
                    {/* Color and Condition */}
                    <div className="flex gap-2 mt-3">
                      {product.color && (
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded">
                          {product.color}
                        </span>
                      )}
                      {product.condition && (
                        <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded">
                          {product.condition}
                        </span>
                      )}
                    </div>
                    
                    {/* Sizes */}
                    <div className="mt-3">
                      <p className="text-sm text-gray-400 mb-1">Sizes:</p>
                      <div className="flex flex-wrap gap-1">
                        {product.sizes.map((size, idx) => (
                          <span key={idx} className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded">
                            {size}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    {/* Pricing */}
                    <div className="mt-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-2xl font-bold text-green-400">₦{product.sellingPrice.toFixed(2)}</div>
                          <div className="text-sm text-gray-500 line-through">₦{product.price.toFixed(2)}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-400">Stock</div>
                          <div className={`text-lg font-bold ${product.stockCount > 0 ? 'text-white' : 'text-red-400'}`}>
                            {product.stockCount}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-2 text-sm text-blue-400">
                        Profit: ₦{product.expectedProfit.toFixed(2)}
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => router.push(`/dashboard?view=${product.id}`)}
                        className="flex-1 px-3 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 text-sm"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="px-3 py-2 bg-red-900/30 text-red-400 rounded-lg hover:bg-red-800/30 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Table View */}
        {viewMode === 'table' && (
          <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Code</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Color</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Sizes</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Stock</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Age</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredProducts.map(product => {
                    const ageInfo = getAgeLabel(product.daysInShop || 0);
                    
                    return (
                      <tr key={product.id} className="hover:bg-gray-750">
                        <td className="px-6 py-4">
                          <div className="font-mono text-blue-400 font-bold">{product.shoeCode || 'No Code'}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-white">{product.name}</div>
                          <div className="text-sm text-gray-400 truncate max-w-xs">{product.description || 'No description'}</div>
                        </td>
                        <td className="px-6 py-4">
                          {product.color ? (
                            <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded">
                              {product.color}
                            </span>
                          ) : (
                            <span className="text-gray-500">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {product.sizes.map((size, idx) => (
                              <span key={idx} className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded">
                                {size}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${product.stockCount > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                            {product.stockCount}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-green-400 font-medium">₦{product.sellingPrice.toFixed(2)}</div>
                          <div className="text-sm text-gray-500">Cost: ₦{product.price.toFixed(2)}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${ageInfo.color}`}>
                            {ageInfo.label} ({product.daysInShop || 0}d)
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => router.push(`/dashboard?view=${product.id}`)}
                              className="px-3 py-1 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 text-sm"
                            >
                              View
                            </button>
                            <button
                              onClick={() => handleDelete(product.id)}
                              className="px-3 py-1 bg-red-900/30 text-red-400 rounded hover:bg-red-800/30 text-sm"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* No Results */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-xl text-gray-400 mb-2">No products found</div>
            <p className="text-gray-500">Try changing your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
