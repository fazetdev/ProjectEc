'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type ShoePair = {
  size: string;
  color: string;
  shoeCode: string; // Added: Individual shoe code for each pair
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
    bundleCodePrefix: '', // e.g., ML-SH, FM-SH, CH-SH
    location: '',
    condition: 'new',
  });

  // Generate shoe code based on size and color
  const generateShoeCode = (size: string, color: string, index: number) => {
    if (!formData.bundleCodePrefix) return '';
    
    const sizeCode = size.padStart(2, '0');
    const colorCode = color.substring(0, 3).toUpperCase();
    const sequence = (index + 1).toString().padStart(3, '0');
    
    return `${formData.bundleCodePrefix}-${sizeCode}-${colorCode}-${sequence}`;
  };

  // Update shoe codes when prefix, sizes, or colors change
  const updateShoeCodes = () => {
    setFormData(prev => ({
      ...prev,
      shoePairs: prev.shoePairs.map((pair, index) => ({
        ...pair,
        shoeCode: generateShoeCode(pair.size, pair.color, index)
      }))
    }));
  };

  // Add a new size-color pair
  const addShoePair = () => {
    setFormData(prev => {
      const newPairs = [...prev.shoePairs, { size: '', color: '', shoeCode: '' }];
      return {
        ...prev,
        shoePairs: newPairs
      };
    });
  };

  // Update a specific shoe pair
  const updateShoePair = (index: number, field: 'size' | 'color', value: string) => {
    setFormData(prev => {
      const updatedPairs = [...prev.shoePairs];
      updatedPairs[index] = {
        ...updatedPairs[index],
        [field]: value,
        shoeCode: generateShoeCode(
          field === 'size' ? value : updatedPairs[index].size,
          field === 'color' ? value : updatedPairs[index].color,
          index
        )
      };
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      // Validate required fields
      if (!formData.baseName.trim()) {
        throw new Error('Bundle design name is required');
      }

      if (!formData.bundleCodePrefix.trim()) {
        throw new Error('Bundle code prefix is required (e.g., ML-SH, FM-SH, CH-SH)');
      }

      if (!formData.price || parseFloat(formData.price) <= 0) {
        throw new Error('Valid purchase price is required');
      }

      if (!formData.sellingPrice || parseFloat(formData.sellingPrice) <= 0) {
        throw new Error('Valid selling price is required');
      }

      if (formData.shoePairs.length === 0) {
        throw new Error('Add at least one size-color combination');
      }

      // Validate each shoe pair has size and color
      for (const pair of formData.shoePairs) {
        if (!pair.size || !pair.color) {
          throw new Error('Each shoe must have both size and color');
        }
      }

      if (!formData.bundleImage.trim()) {
        throw new Error('Bundle image filename is required');
      }

      // Prepare bundle data
      const bundleData = {
        baseName: formData.baseName.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        sellingPrice: parseFloat(formData.sellingPrice),
        genderCategory: formData.genderCategory,
        ageGroup: ageGroup === 'adult' ? 'adults' : 'children',
        shoePairs: formData.shoePairs.map((pair, index) => ({
          size: pair.size,
          color: pair.color,
          shoeCode: pair.shoeCode || generateShoeCode(pair.size, pair.color, index)
        })),
        stockPerItem: parseInt(formData.stockPerItem) || 1,
        imageFile: formData.bundleImage,
        bundleCodePrefix: formData.bundleCodePrefix.trim(),
        location: formData.location.trim(),
        condition: formData.condition,
      };

      const response = await fetch('/api/products/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bundleData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create bundle');
      }

      const result = await response.json();
      setSuccess(`Bundle created successfully! ${result.count} shoes added with prefix: ${formData.bundleCodePrefix}`);

      // Reset form
      setFormData({
        baseName: '',
        description: '',
        price: '',
        sellingPrice: '',
        genderCategory: 'neutral',
        shoePairs: [],
        stockPerItem: '1',
        bundleImage: '',
        bundleCodePrefix: '',
        location: '',
        condition: 'new',
      });
      setAgeGroup('adult');

      // Redirect to inventory after 3 seconds
      setTimeout(() => {
        router.push('/inventory');
      }, 3000);

    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsSubmitting(false);
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

        {/* Bundle Code Prefix */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-3 text-white">Bundle Tagging System</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-blue-300 mb-2">
              Bundle Code Prefix * (e.g., ML-SH, FM-SH, CH-SH, BOY-SH, GIRL-SH)
            </label>
            <input
              type="text"
              required
              value={formData.bundleCodePrefix}
              onChange={(e) => {
                setFormData({...formData, bundleCodePrefix: e.target.value});
                setTimeout(updateShoeCodes, 100); // Update codes after a delay
              }}
              className="w-full px-4 py-3 bg-gray-800 border border-blue-500/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter bundle prefix"
            />
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-blue-300">
              <div>• ML-SH = Men's Large Shoes</div>
              <div>• FM-SH = Female Medium Shoes</div>
              <div>• CH-SH = Children Shoes</div>
              <div>• BOY-SH = Boys Shoes</div>
              <div>• GIRL-SH = Girls Shoes</div>
            </div>
          </div>

          {/* Generated Codes Preview */}
          {formData.bundleCodePrefix && formData.shoePairs.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-blue-300 mb-2">Generated Shoe Codes:</p>
              <div className="flex flex-wrap gap-2">
                {formData.shoePairs.map((pair, index) => (
                  <div key={index} className="px-3 py-2 bg-blue-500/20 text-blue-400 rounded-lg text-sm">
                    {pair.shoeCode || generateShoeCode(pair.size, pair.color, index)}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Basic Bundle Info */}
        <div>
          <h2 className="text-lg font-semibold mb-4 text-white">Bundle Information</h2>

          <div className="space-y-4">
            {/* Base Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Bundle Design Name *
              </label>
              <input
                type="text"
                required
                value={formData.baseName}
                onChange={(e) => setFormData({...formData, baseName: e.target.value})}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Classic Rubber Shoes, Sports Sneakers"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Comfortable design, good for daily wear"
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
                Cost Price per Pair *
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
            </div>

            {/* Selling Price */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Selling Price per Pair *
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
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setAgeGroup('adult')}
                  className={`px-4 py-3 rounded-lg font-medium ${
                    ageGroup === 'adult' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  Adults
                </button>
                <button
                  type="button"
                  onClick={() => setAgeGroup('child')}
                  className={`px-4 py-3 rounded-lg font-medium ${
                    ageGroup === 'child' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  Children
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Size-Color Combinations */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-white">Size & Color Combinations</h2>
            <button
              type="button"
              onClick={addShoePair}
              className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600"
            >
              + Add Combination
            </button>
          </div>

          {formData.shoePairs.length === 0 ? (
            <div className="text-center py-6 text-gray-500 border-2 border-dashed border-gray-700 rounded-lg">
              <p>No size-color combinations added yet</p>
              <p className="text-sm mt-1">Click "Add Combination" to start</p>
            </div>
          ) : (
            <div className="space-y-4">
              {formData.shoePairs.map((pair, index) => (
                <div key={index} className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-sm font-medium text-gray-300">Combination #{index + 1}</h3>
                    <button
                      type="button"
                      onClick={() => removeShoePair(index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Size Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Size *
                      </label>
                      <select
                        required
                        value={pair.size}
                        onChange={(e) => updateShoePair(index, 'size', e.target.value)}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select size</option>
                        {(ageGroup === 'adult' ? adultSizes : childSizes).map(size => (
                          <option key={size} value={size}>{size}</option>
                        ))}
                      </select>
                    </div>

                    {/* Color Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Color *
                      </label>
                      <div className="flex gap-2">
                        <select
                          required
                          value={pair.color}
                          onChange={(e) => updateShoePair(index, 'color', e.target.value)}
                          className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Select color</option>
                          {commonColors.map(color => (
                            <option key={color} value={color}>{color}</option>
                          ))}
                        </select>
                        <input
                          type="text"
                          value={pair.color}
                          onChange={(e) => updateShoePair(index, 'color', e.target.value)}
                          className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Or type custom color"
                        />
                      </div>
                    </div>

                    {/* Generated Code Display */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Shoe Code
                      </label>
                      <div className="px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-blue-400 font-mono text-sm">
                        {pair.shoeCode || 'Enter prefix, size, and color'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Inventory Details */}
        <div>
          <h2 className="text-lg font-semibold mb-4 text-white">Inventory Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Stock per Item */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Stock per Size-Color *
              </label>
              <input
                type="number"
                required
                value={formData.stockPerItem}
                onChange={(e) => setFormData({...formData, stockPerItem: e.target.value})}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="1"
                placeholder="1"
              />
              <p className="text-xs text-gray-500 mt-1">Pairs per combination</p>
            </div>

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
                placeholder="e.g., Shelf A, Box 3"
              />
            </div>
          </div>
        </div>

        {/* Bundle Image */}
        <div>
          <h2 className="text-lg font-semibold mb-4 text-white">Bundle Image</h2>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Image Filename * (Same for all shoes in bundle)
            </label>
            <input
              type="text"
              required
              value={formData.bundleImage}
              onChange={(e) => setFormData({...formData, bundleImage: e.target.value})}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., classic-rubber-shoes.jpg"
            />
            <p className="text-xs text-gray-500 mt-1">
              Place bundle image in <code className="bg-gray-900 px-1 rounded">public/shoes/</code> folder
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
            {isSubmitting ? 'Creating Bundle...' : `Create Bundle (${formData.shoePairs.length} shoes)`}
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
