'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AddProduct() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    sellingPrice: '',
    genderCategory: 'neutral',
    ageGroup: 'neutral',
    sizes: [] as string[],
    stockCount: '1',
    imageFile: '',
  });

  const [currentSize, setCurrentSize] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      // Validate required fields
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

      setSuccess('Shoe added to inventory successfully!');
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        price: '',
        sellingPrice: '',
        genderCategory: 'neutral',
        ageGroup: 'neutral',
        sizes: [],
        stockCount: '1',
        imageFile: '',
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
    <div className="min-h-screen bg-gray-900 text-white py-6">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Add New Shoe</h1>
          <p className="text-gray-400">Add shoes to your inventory</p>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-red-400 text-center">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
            <p className="text-green-400 text-center">{success}</p>
            <p className="text-green-500 text-sm text-center mt-1">Redirecting to inventory...</p>
          </div>
        )}

        {/* Form */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
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
                  <p className="text-xs text-gray-500 mt-1">How you identify this shoe</p>
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

            {/* Image & Stock */}
            <div>
              <h2 className="text-lg font-semibold mb-4 text-white">Image & Stock</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Stock Count */}
                <div>
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

                {/* Image Filename */}
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

        {/* Simple Note */}
        <div className="mt-6 p-4 bg-gray-800/30 border border-gray-700 rounded-lg">
          <p className="text-sm text-gray-400 text-center">
            Add real shoes with actual photos. Images go in <code className="bg-gray-900 px-1 rounded">public/shoes/</code> folder.
          </p>
        </div>
      </div>
    </div>
  );
}
