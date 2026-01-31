'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

// Import the Bundle form component
import BundleForm from './BundleForm';

type TabType = 'single' | 'bundle';

export default function AddProduct() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('single');

  return (
    <div className="min-h-screen bg-gray-900 text-white py-6">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Add Shoes to Inventory</h1>
          <p className="text-gray-400">Choose how you want to add shoes</p>
          <p className="text-sm text-blue-400 mt-2">
            💡 Use shoe codes like: SIMPLE AS SH-FZ-001 ETC
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-gray-700 mb-6">
          <button
            type="button"
            onClick={() => setActiveTab('single')}
            className={`flex-1 py-3 text-center font-medium border-b-2 transition-colors ${
              activeTab === 'single'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            👟 Add Single Shoe
            <div className="text-xs mt-1">Unique designs, one at a time</div>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('bundle')}
            className={`flex-1 py-3 text-center font-medium border-b-2 transition-colors ${
              activeTab === 'bundle'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            📦 Add Shoe Bundle
            <div className="text-xs mt-1">Multiple sizes & colors at once</div>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'single' ? <SingleProductForm /> : <BundleForm />}
      </div>
    </div>
  );
}

// Single Product Form with Shoe Code
function SingleProductForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    shoeCode: '', // NEW: Shoe Code field
    name: '',
    description: '',
    price: '',
    sellingPrice: '',
    genderCategory: 'neutral',
    ageGroup: 'neutral',
    sizes: [] as string[],
    stockCount: '1',
    imageFile: '',
    color: '', // NEW: Color field
    condition: 'new', // NEW: Condition field
    location: '', // NEW: Location field
    notes: '', // NEW: Notes field
  });

  const [currentSize, setCurrentSize] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      // Validate required fields
      if (!formData.shoeCode.trim()) {
        throw new Error('Shoe Code is required (e.g. SH-FZ-001)');
      }
      
      if (!formData.name.trim()) {
        throw new Error('Shoe name/description is required');
      }
      
      if (!formData.price || parseFloat(formData.price) <= 0) {
        throw new Error('Valid purchase price is required');
      }
      
      if (!formData.sellingPrice || parseFloat(formData.sellingPrice) <= 0) {
        throw new Error('Valid selling price is required');
      }

      const productData = {
        shoeCode: formData.shoeCode.trim(),
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        sellingPrice: parseFloat(formData.sellingPrice),
        expectedProfit: parseFloat(formData.sellingPrice) - parseFloat(formData.price),
        actualProfit: 0,
        genderCategory: formData.genderCategory,
        ageGroup: formData.ageGroup,
        sizes: formData.sizes,
        stockCount: parseInt(formData.stockCount),
        isSold: false,
        dateAdded: new Date().toISOString(),
        dateSold: null,
        imageFile: formData.imageFile,
        color: formData.color.trim(),
        condition: formData.condition,
        location: formData.location.trim(),
        notes: formData.notes.trim(),
      };

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add shoe');
      }

      const result = await response.json();
      setSuccess(`Shoe added successfully! Code: ${result.shoeCode}`);

      // Reset form but keep some defaults
      setFormData({
        shoeCode: '',
        name: '',
        description: '',
        price: '',
        sellingPrice: '',
        genderCategory: 'neutral',
        ageGroup: 'neutral',
        sizes: [],
        stockCount: '1',
        imageFile: '',
        color: '',
        condition: 'new',
        location: '',
        notes: '',
      });

      // Redirect to inventory after 2 seconds
      setTimeout(() => {
        router.push('/inventory');
      }, 2000);

    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addSize = () => {
    if (currentSize.trim() && !formData.sizes.includes(currentSize.trim())) {
      setFormData({
        ...formData,
        sizes: [...formData.sizes, currentSize.trim()]
      });
      setCurrentSize('');
    }
  };

  const removeSize = (sizeToRemove: string) => {
    setFormData({
      ...formData,
      sizes: formData.sizes.filter(size => size !== sizeToRemove)
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSize();
    }
  };

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-xl">
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Status Messages */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-red-400 text-center">{error}</p>
          </div>
        )}

        {success && (
          <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
            <p className="text-green-400 text-center">{success}</p>
            <p className="text-green-500 text-sm text-center mt-1">Redirecting to inventory...</p>
          </div>
        )}

        {/* SHOE CODE - MOST IMPORTANT */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-3 text-white">Shoe Tagging System</h2>
          
          <div>
            <label className="block text-sm font-medium text-blue-300 mb-2">
              Shoe Code * (e.g., SH-FZ-001)
            </label>
            <input
              type="text"
              required
              value={formData.shoeCode}
              onChange={(e) => setFormData({...formData, shoeCode: e.target.value})}
              className="w-full px-4 py-3 bg-gray-800 border border-blue-500/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter unique shoe code"
            />
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-blue-300">
              <div>• GENERAL: SH-FZ-001</div>
            
            </div>
          </div>
        </div>

        {/* Basic Information */}
        <div>
          <h2 className="text-lg font-semibold mb-4 text-white">Shoe Details</h2>

          <div className="space-y-4">
            {/* Shoe Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Shoe Name/Description *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Blue Rubber Shoes for Men"
              />
            </div>

            {/* Additional Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Additional Notes
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., New design, comfortable sole"
              />
            </div>

            {/* Color */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Color
              </label>
              <input
                type="text"
                value={formData.color}
                onChange={(e) => setFormData({...formData, color: e.target.value})}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Blue, Red, Black, Multi-color"
              />
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div>
          <h2 className="text-lg font-semibold mb-4 text-white">Pricing (₦ Naira)</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Purchase Price */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Your Cost Price *
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
                min="0"
              />
              <p className="text-xs text-gray-500 mt-1">What you paid to acquire</p>
            </div>

            {/* Selling Price */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Your Selling Price *
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.sellingPrice}
                onChange={(e) => setFormData({...formData, sellingPrice: e.target.value})}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
                min="0"
              />
              <p className="text-xs text-gray-500 mt-1">Price to sell to customers</p>
            </div>
          </div>

          {/* Profit Preview */}
          {formData.price && formData.sellingPrice && (
            <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-sm text-blue-400">
                Expected Profit per pair: ₦{(parseFloat(formData.sellingPrice || '0') - parseFloat(formData.price || '0')).toFixed(2)}
              </p>
            </div>
          )}
        </div>

        {/* Categories */}
        <div>
          <h2 className="text-lg font-semibold mb-4 text-white">Categories</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Gender Category */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                For Whom? *
              </label>
              <select
                value={formData.genderCategory}
                onChange={(e) => setFormData({...formData, genderCategory: e.target.value})}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="male">Men</option>
                <option value="female">Women</option>
                <option value="neutral">Unisex/Neutral</option>
              </select>
            </div>

            {/* Age Group */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Age Group *
              </label>
              <select
                value={formData.ageGroup}
                onChange={(e) => setFormData({...formData, ageGroup: e.target.value})}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="adults">Adults</option>
                <option value="boys">Boys</option>
                <option value="girls">Girls</option>
                <option value="neutral">All Ages</option>
              </select>
            </div>
          </div>
        </div>

        {/* Inventory Details */}
        <div>
          <h2 className="text-lg font-semibold mb-4 text-white">Inventory Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Condition */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Condition
              </label>
              <select
                value={formData.condition}
                onChange={(e) => setFormData({...formData, condition: e.target.value})}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="new">New</option>
                <option value="used">Used</option>
                <option value="refurbished">Refurbished</option>
                <option value="washed">Washed</option>
              </select>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Storage Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Shelf A, Box 3, Front Display"
              />
            </div>
          </div>

          {/* Stock Count */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Stock Count *
            </label>
            <input
              type="number"
              required
              value={formData.stockCount}
              onChange={(e) => setFormData({...formData, stockCount: e.target.value})}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="1"
              placeholder="10"
            />
            <p className="text-xs text-gray-500 mt-1">Number of pairs available</p>
          </div>

          {/* Notes */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Additional Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Any special notes about this shoe..."
              rows={2}
            />
          </div>
        </div>

        {/* Sizes */}
        <div>
          <h2 className="text-lg font-semibold mb-4 text-white">Available Sizes</h2>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Add Shoe Sizes (e.g., 40, 41, 42)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={currentSize}
                onChange={(e) => setCurrentSize(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter size"
              />
              <button
                type="button"
                onClick={addSize}
                className="px-4 py-3 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600"
              >
                Add
              </button>
            </div>
          </div>

          {/* Selected Sizes */}
          {formData.sizes.length > 0 && (
            <div className="mb-4">
              <p className="text-sm text-gray-300 mb-2">Selected Sizes:</p>
              <div className="flex flex-wrap gap-2">
                {formData.sizes.map((size) => (
                  <div
                    key={size}
                    className="flex items-center gap-1 px-3 py-2 bg-blue-500/20 text-blue-400 rounded-lg"
                  >
                    <span>Size {size}</span>
                    <button
                      type="button"
                      onClick={() => removeSize(size)}
                      className="text-blue-300 hover:text-blue-200 ml-2"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Image */}
        <div>
          <h2 className="text-lg font-semibold mb-4 text-white">Image</h2>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Image Filename (Optional)
            </label>
            <input
              type="text"
              value={formData.imageFile}
              onChange={(e) => setFormData({...formData, imageFile: e.target.value})}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., blue-shoes.jpg"
            />
            <p className="text-xs text-gray-500 mt-1">
              Place shoe image in <code className="bg-gray-900 px-1 rounded">public/shoes/</code> folder
            </p>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-4 pt-6 border-t border-gray-700">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-6 py-3 rounded-lg font-medium ${
              isSubmitting
                ? 'bg-blue-500/50 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            } text-white transition-colors`}
          >
            {isSubmitting ? 'Adding Shoe...' : 'Add to Inventory'}
          </button>

          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 border border-gray-700 text-gray-300 rounded-lg font-medium hover:bg-gray-800"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
