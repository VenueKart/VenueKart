import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatPrice, formatPriceRange } from '@/lib/priceUtils';

export default function CurrencyTest() {
  const testPrices = [
    1000,
    12000,
    125000,
    1280000,
    12800000,
    50000,
    75000,
    100000,
    250000,
    500000,
    1000000,
    2500000,
    5000000,
    10000000
  ];

  const testRanges = [
    { min: 50000, max: 75000 },
    { min: 125000, max: 250000 },
    { min: 500000, max: 1000000 },
    { min: 1280000, max: 2500000 }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-venue-indigo">
              Indian Currency Formatting Test
            </CardTitle>
            <p className="text-gray-600">
              Testing the implementation of Indian numbering system (xx,xx,xxx format)
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Single Prices */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-venue-dark">Single Prices</h3>
                <div className="space-y-3">
                  {testPrices.map((price, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-white rounded border">
                      <span className="text-gray-600 font-mono">
                        {price.toLocaleString()}
                      </span>
                      <span className="text-xl font-bold text-venue-indigo">
                        {formatPrice(price)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Ranges */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-venue-dark">Price Ranges</h3>
                <div className="space-y-3">
                  {testRanges.map((range, index) => (
                    <div key={index} className="p-3 bg-white rounded border">
                      <div className="text-sm text-gray-600 mb-1">
                        Range: {range.min.toLocaleString()} - {range.max.toLocaleString()}
                      </div>
                      <div className="text-xl font-bold text-venue-indigo">
                        {formatPriceRange(range.min, range.max)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Expected Format Examples */}
            <div className="mt-8 p-4 bg-venue-lavender/20 rounded-lg">
              <h4 className="font-semibold text-venue-dark mb-2">Expected Indian Numbering System:</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• <strong>Thousands:</strong> 12,000 (not 12000)</li>
                <li>• <strong>Lakhs:</strong> 1,25,000 (not 125,000)</li>
                <li>• <strong>Crores:</strong> 1,25,00,000 (not 12,500,000)</li>
                <li>• <strong>Currency Symbol:</strong> All prices should start with ₹</li>
              </ul>
            </div>

            {/* Browser Support Note */}
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">Implementation Notes:</h4>
              <p className="text-sm text-blue-700">
                The Indian numbering system is implemented using <code>toLocaleString('en-IN')</code> 
                which formats numbers according to the Indian locale standards with proper comma placement.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
