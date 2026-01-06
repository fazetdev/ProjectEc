'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AddBundle() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Age group selection
  const [ageGroup, setAgeGroup] = useState<'adult' | 'child'>('adult');

  // Size ranges
  const adultSizes = ['33', '34', '35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'];
  const childSizes = ['20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32'];

  // Common colors
  const commonColors = ['Black', 'White', 'Blue', 'Red', 'Brown', 'Gray', 'Green', 'Pink', 'Yellow', 'Orange'];

  // Form state
  const [formData, setFormData] = useState({
    baseName: '',
    description: '',
    price: '',
    sellingPrice: '',
    genderCategory: 'neutral',
    selectedSizes: [] as string[],
    selectedColors: [] as string[],
    stockPerItem: '1',
    imageUrl: '',
  });

  // Handle size selection
  const toggleSize = (size: string) => {
    setFormData(prev => ({
      ...prev,
      selectedSizes: prev.selectedSizes.includes(size)
        ? prev.selectedSizes.filter(s => s !== size)
        : [...prev.selectedSizes, size]
    }));
  };

  // Handle color selection
  const toggleColor = (color: string) => {
    setFormData(prev => ({
      ...prev,
      selectedColors: prev.selectedColors.includes(color)
        ? prev.selectedColors.filter(c => c !== color)
        : [...prev.selectedColors, color]
    }));
  };

  // Select all sizes in current range
  const selectAllSizes = () => {
    const allSizes = ageGroup === 'adult' ? adultSizes : childSizes;
    setFormData(prev => ({
      ...prev,
      selectedSizes: [...allSizes]
    }));
  };

  // Clear all sizes
  const clearAllSizes = () => {
    setFormData(prev => ({
      ...prev,
      selectedSizes: []
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      // Calculate total products to create
      const totalProducts = formData.selectedSizes.length * formData.selectedColors.length;
      if (totalProducts === 0) {
        throw new Error('Please select at least one size and one color');
      }

      // Prepare bundle data
      const bundleData = {
        baseName: formData.baseName.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        sellingPrice: parseFloat(formData.sellingPrice),
        genderCategory: formData.genderCategory,
        ageGroup: ageGroup, // adult or child
        sizes: formData.selectedSizes,
        colors: formData.selectedColors,
        stockPerItem: parseInt(formData.stockPerItem) || 1,
        imageUrl: formData.imageUrl,
      };

      const response = await fetch('/api/products/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bundleData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create bundle');
      }

      setSuccess(`Created ${result.count} products successfully!`);

      // Reset form after success
      setTimeout(() => {
        setFormData({
          baseName: '',
          description: '',
          price: '',
          sellingPrice: '',
          genderCategory: 'neutral',
          selectedSizes: [],
          selectedColors: [],
          stockPerItem: '1',
          imageUrl: '',
        });
        setAgeGroup('adult');
      }, 3000);

    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate preview
  const totalProductsPreview = formData.selectedSizes.length * formData.selectedColors.length;
  const profitPerItem = formData.price && formData.sellingPrice 
    ? parseFloat(formData.sellingPrice) - parseFloat(formData.price)
    : 0;

  return (
    <div className="min-h-screen bg-gray-900 text-white py-6">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Add Shoe Bundle</h1>
          <p className="text-gray-400">Quickly add multiple sizes & colors of the same design</p>
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
          </div>
        )}

        {/* Form */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Age Group Selection */}
            <div>
              <h2 className="text-lg font-semibold mb-4 text-white">1. Select Age Group</h2>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setAgeGroup('adult');
                    setFormData(prev => ({ ...prev, selectedSizes: [] }));
                  }}
                  className={`flex-1 py-4 rounded-lg border-2 text-center font-medium ${
                    ageGroup === 'adult'
                      ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                      : 'border-gray-700 bg-gray-800/50 text-gray-400 hover:bg-gray-800'
                  }`}
                >
                  👟 Adult Shoes
                  <div className="text-sm mt-1">Sizes 33-46</div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAgeGroup('child');
                    setFormData(prev => ({ ...prev, selectedSizes: [] }));
                  }}
                  className={`flex-1 py-4 rounded-lg border-2 text-center font-medium ${
                    ageGroup === 'child'
                      ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                      : 'border-gray-700 bg-gray-800/50 text-gray-400 hover:bg-gray-800'
                  }`}
                >
                  👶 Child Shoes
                  <div className="text-sm mt-1">Sizes 20-32</div>
                </button>
              </div>
            </div>

            {/* Basic Information */}
            <div>
              <h2 className="text-lg font-semibold mb-4 text-white">2. Shoe Design</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Design Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.baseName}
                    onChange={(e) => setFormData({...formData, baseName: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Blue Rubber Shoes for Men"
                  />
                  <p className="text-xs text-gray-500 mt-1">Base name for all variations</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Additional Notes
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., New design, comfortable sole"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    For Whom?
                  </label>
                  <select
                    value={formData.genderCategory}
                    onChange={(e) => setFormData({...formData, genderCategory: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="neutral">Unisex/Neutral</option>
                    <option value="male">Men</option>
                    <option value="female">Women</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div>
              <h2 className="text-lg font-semibold mb-4 text-white">3. Pricing (₦ Naira)</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Selling Price *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.sellingPrice}
                    onChange={(e) => setFormData({...formData, sellingPrice: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                    min="0"
                  />
                </div>
              </div>

              {/* Profit Preview */}
              {formData.price && formData.sellingPrice && (
                <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <p className="text-sm text-blue-400">
                    Profit per pair: ₦{profitPerItem.toFixed(2)}
                    {totalProductsPreview > 0 && (
                      <span className="ml-2">
                        • Total potential: ₦{(profitPerItem * totalProductsPreview).toFixed(2)}
                      </span>
                    )}
                  </p>
                </div>
              )}
            </div>

            {/* Size Selection */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-white">4. Select Sizes</h2>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={selectAllSizes}
                    className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded"
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={clearAllSizes}
                    className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded"
                  >
                    Clear
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {(ageGroup === 'adult' ? adultSizes : childSizes).map((size) => (
                  <button
                    type="button"
                    key={size}
                    onClick={() => toggleSize(size)}
                    className={`px-4 py-3 rounded-lg font-medium transition-all ${
                      formData.selectedSizes.includes(size)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>

              {formData.selectedSizes.length > 0 && (
                <p className="text-sm text-gray-400 mt-3">
                  Selected: {formData.selectedSizes.sort((a, b) => parseInt(a) - parseInt(b)).join(', ')}
                </p>
              )}
            </div>

            {/* Color Selection */}
            <div>
              <h2 className="text-lg font-semibold mb-4 text-white">5. Select Colors</h2>

              <div className="flex flex-wrap gap-2">
                {commonColors.map((color) => (
                  <button
                    type="button"
                    key={color}
                    onClick={() => toggleColor(color)}
                    className={`px-4 py-3 rounded-lg font-medium transition-all ${
                      formData.selectedColors.includes(color)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>

              {formData.selectedColors.length > 0 && (
                <p className="text-sm text-gray-400 mt-3">
                  Selected: {formData.selectedColors.join(', ')}
                </p>
              )}
            </div>

            {/* Stock & Image */}
            <div>
              <h2 className="text-lg font-semibold mb-4 text-white">6. Stock & Image</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Stock per Size/Color *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.stockPerItem}
                    onChange={(e) => setFormData({...formData, stockPerItem: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                    placeholder="1"
                  />
                  <p className="text-xs text-gray-500 mt-1">Pairs available per size/color combination</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Image Filename
                  </label>
                  <input
                    type="text"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="blue-shoes.jpg"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Image in <code className="bg-gray-900 px-1 rounded">public/shoes/</code>
                  </p>
                </div>
              </div>
            </div>

            {/* Preview & Submit */}
            <div className="pt-6 border-t border-gray-700">
              {/* Preview */}
              {totalProductsPreview > 0 && (
                <div className="mb-6 p-4 bg-gray-800/30 rounded-lg">
                  <h3 className="font-semibold mb-2">Bundle Preview</h3>
                  <p className="text-gray-300">
                    Creating <span className="text-blue-400 font-bold">{totalProductsPreview}</span> products:
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    {formData.selectedSizes.length} sizes × {formData.selectedColors.length} colors = {totalProductsPreview} total items
                  </p>
                  {/* eslint-disable-next-line react/no-unescaped-entities */}
                  <p className="text-sm text-gray-400">
                    Example: &quot;{formData.baseName || 'Design'} - {formData.selectedColors[0] || 'Color'} (Size {formData.selectedSizes[0] || 'XX'})"
                  </p>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={isSubmitting || totalProductsPreview === 0}
                  className={`flex-1 py-3 rounded-lg font-medium ${
                    isSubmitting || totalProductsPreview === 0
                      ? 'bg-blue-500/50 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  } text-white transition-colors`}
                >
                  {isSubmitting ? 'Creating...' : `Create ${totalProductsPreview} Products`}
                </button>

                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-6 py-3 border border-gray-700 text-gray-300 rounded-lg font-medium hover:bg-gray-800"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Footer Note */}
        <div className="mt-6 p-4 bg-gray-800/30 border border-gray-700 rounded-lg">
          <p className="text-sm text-gray-400 text-center">
            Use this for bundles of same design. For unique single shoes, use <a href="/add-product" className="text-blue-400 hover:underline">Add Single Shoe</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
