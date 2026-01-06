'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type ShoePair = {
  size: string;
  color: string;
};

export default function BundleForm() {
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

  // Form state - SIMPLIFIED: one image for entire bundle
  const [formData, setFormData] = useState({
    baseName: '',
    description: '',
    price: '',
    sellingPrice: '',
    genderCategory: 'neutral',
    shoePairs: [] as ShoePair[],
    stockPerItem: '1',
    bundleImage: '', // ONE image for ALL shoes in bundle
  });

  // Add a new size-color pair
  const addShoePair = () => {
    setFormData(prev => ({
      ...prev,
      shoePairs: [...prev.shoePairs, { size: '', color: '' }]
    }));
  };

  // Update a specific shoe pair
  const updateShoePair = (index: number, field: 'size' | 'color', value: string) => {
    setFormData(prev => {
      const updatedPairs = [...prev.shoePairs];
      updatedPairs[index] = { ...updatedPairs[index], [field]: value };
      return { ...prev, shoePairs: updatedPairs };
    });
  };

  // Remove a shoe pair
  const removeShoePair = (index: number) => {
    setFormData(prev => ({
      ...prev,
      shoePairs: prev.shoePairs.filter((_, i) => i !== index)
    }));
  };

  // Get available sizes
  const getAvailableSizes = () => {
    const selectedSizes = formData.shoePairs.map(pair => pair.size);
    const allSizes = ageGroup === 'adult' ? adultSizes : childSizes;
    return allSizes.filter(size => !selectedSizes.includes(size));
  };

  // Auto-suggest image name
  const suggestImageName = () => {
    if (!formData.baseName) return '';
    const base = formData.baseName.toLowerCase().replace(/\s+/g, '-');
    const colors = Array.from(new Set(formData.shoePairs.map(p => p.color).filter(Boolean)));
    const colorStr = colors.length > 0 ? `-${colors.join('-')}` : '';
    return `${base}${colorStr}-bundle.jpg`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      // Validate
      if (formData.shoePairs.length === 0) {
        throw new Error('Please add at least one shoe to the bundle');
      }

      // Check all shoes have size and color
      for (const pair of formData.shoePairs) {
        if (!pair.size || !pair.color) {
          throw new Error('All shoes must have both size and color selected');
        }
      }

      if (!formData.bundleImage) {
        throw new Error('Please provide an image filename for the bundle');
      }

      // Prepare bundle data - ALL shoes get SAME image
      const bundleData = {
        baseName: formData.baseName.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        sellingPrice: parseFloat(formData.sellingPrice),
        genderCategory: formData.genderCategory,
        ageGroup: ageGroup,
        shoePairs: formData.shoePairs,
        stockPerItem: parseInt(formData.stockPerItem) || 1,
        imageFile: formData.bundleImage, // Same image for ALL shoes
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

      setSuccess(`Created ${result.count} shoes successfully! Redirecting to inventory...`);

      // Redirect after 3 seconds
      setTimeout(() => {
        router.push('/inventory');
      }, 3000);

    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate profit
  const profitPerItem = formData.price && formData.sellingPrice 
    ? parseFloat(formData.sellingPrice) - parseFloat(formData.price)
    : 0;

  // Get unique colors in bundle
  const uniqueColors = Array.from(new Set(formData.shoePairs.map(p => p.color).filter(Boolean)));

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
          </div>
        )}

        {/* Age Group Selection */}
        <div>
          <h2 className="text-lg font-semibold mb-4 text-white">1. Select Age Group</h2>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => {
                setAgeGroup('adult');
                setFormData(prev => ({ ...prev, shoePairs: [] }));
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
                setFormData(prev => ({ ...prev, shoePairs: [] }));
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
              <p className="text-xs text-gray-500 mt-1">Base name for all shoes in bundle</p>
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
                Profit per shoe: ₦{profitPerItem.toFixed(2)}
                {formData.shoePairs.length > 0 && (
                  <span className="ml-2">
                    • Total potential: ₦{(profitPerItem * formData.shoePairs.length).toFixed(2)}
                  </span>
                )}
              </p>
            </div>
          )}
        </div>

        {/* Size-Color Pairs */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-white">4. Add Shoes to Bundle</h2>
            <button
              type="button"
              onClick={addShoePair}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium"
            >
              + Add Shoe
            </button>
          </div>

          {formData.shoePairs.length === 0 ? (
            <div className="text-center py-6 border-2 border-dashed border-gray-700 rounded-lg">
              <p className="text-gray-400">No shoes added yet</p>
              <p className="text-gray-500 text-sm mt-1">Click "Add Shoe" to start</p>
            </div>
          ) : (
            <div className="space-y-4">
              {formData.shoePairs.map((pair, index) => {
                const availableSizes = getAvailableSizes();
                const allSizes = ageGroup === 'adult' ? adultSizes : childSizes;
                const sizesForThisShoe = [...availableSizes, pair.size].filter(Boolean);
                
                return (
                  <div key={index} className="p-4 bg-gray-800/30 border border-gray-700 rounded-lg">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-medium">Shoe #{index + 1}</h3>
                      <button
                        type="button"
                        onClick={() => removeShoePair(index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Size Selection */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Size *
                        </label>
                        <select
                          value={pair.size}
                          onChange={(e) => updateShoePair(index, 'size', e.target.value)}
                          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        >
                          <option value="">Select size</option>
                          {allSizes.map(size => (
                            <option 
                              key={size} 
                              value={size}
                              disabled={!sizesForThisShoe.includes(size)}
                            >
                              Size {size} {pair.size === size ? '' : !availableSizes.includes(size) ? '(already selected)' : ''}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Color Selection */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Color *
                        </label>
                        <select
                          value={pair.color}
                          onChange={(e) => updateShoePair(index, 'color', e.target.value)}
                          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        >
                          <option value="">Select color</option>
                          {commonColors.map(color => (
                            <option key={color} value={color}>
                              {color}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Preview */}
                    {pair.size && pair.color && (
                      <div className="mt-3 p-2 bg-gray-900/50 rounded text-sm">
                        This shoe: <span className="text-blue-400">{formData.baseName || 'Design'} - {pair.color} (Size {pair.size})</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {formData.shoePairs.length > 0 && (
            <div className="mt-4 p-3 bg-gray-800/50 rounded-lg">
              <p className="text-sm text-gray-300">
                Bundle has {formData.shoePairs.length} shoes with {uniqueColors.length} colors: {uniqueColors.join(', ')}
              </p>
            </div>
          )}
        </div>

        {/* Bundle Image */}
        <div>
          <h2 className="text-lg font-semibold mb-4 text-white">5. Bundle Image</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Image Filename *
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={formData.bundleImage}
                  onChange={(e) => setFormData({...formData, bundleImage: e.target.value})}
                  className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., blue-black-red-bundle.jpg"
                />
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, bundleImage: suggestImageName() }))}
                  className="px-4 py-3 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600"
                >
                  Suggest
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Take ONE photo of all {formData.shoePairs.length} shoes together. Save in <code className="bg-gray-900 px-1 rounded">public/shoes/</code>
              </p>
            </div>

            {/* Image Preview Note */}
            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-sm text-blue-400">
                📸 <strong>Photo Tip:</strong> Arrange all {formData.shoePairs.length} shoes together in one photo.
                Customers will see the actual colors in the photo.
              </p>
              <p className="text-xs text-blue-300 mt-1">
                Example filename: "{suggestImageName()}"
              </p>
            </div>
          </div>
        </div>

        {/* Stock */}
        <div>
          <h2 className="text-lg font-semibold mb-4 text-white">6. Stock</h2>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Stock per Shoe *
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
            <p className="text-xs text-gray-500 mt-1">Usually 1 per shoe in bundles</p>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="pt-6 border-t border-gray-700">
          {/* Preview */}
          {formData.shoePairs.length > 0 && (
            <div className="mb-6 p-4 bg-gray-800/30 rounded-lg">
              <h3 className="font-semibold mb-2">Bundle Preview</h3>
              <p className="text-gray-300">
                Creating <span className="text-blue-400 font-bold">{formData.shoePairs.length}</span> shoes with ONE image:
              </p>
              <div className="mt-2 space-y-1">
                {formData.shoePairs.map((pair, index) => (
                  <div key={index} className="text-sm text-gray-400">
                    • {formData.baseName || 'Design'} - {pair.color || '?'} (Size {pair.size || '?'})
                  </div>
                ))}
              </div>
              <div className="mt-3 p-2 bg-gray-900/50 rounded">
                <p className="text-sm text-gray-300">All shoes will use image: <code className="bg-gray-800 px-2 py-1 rounded">{formData.bundleImage || 'No image set'}</code></p>
              </div>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isSubmitting || formData.shoePairs.length === 0 || !formData.bundleImage}
              className={`flex-1 py-3 rounded-lg font-medium ${
                isSubmitting || formData.shoePairs.length === 0 || !formData.bundleImage
                  ? 'bg-blue-500/50 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white transition-colors`}
            >
              {isSubmitting ? 'Creating...' : `Create ${formData.shoePairs.length} Shoes`}
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
  );
}
