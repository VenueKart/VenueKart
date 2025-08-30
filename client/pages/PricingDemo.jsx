import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { getPricingInfo, getPriceBreakdownComponent, formatPrice } from '../lib/priceUtils';

export default function PricingDemo() {
  const [basePrice, setBasePrice] = useState(100000);

  const listingPricing = getPricingInfo(basePrice, 'listing');
  const detailPricing = getPriceBreakdownComponent(basePrice);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-venue-dark mb-8 text-center">
          VenueKart Pricing System Demo
        </h1>

        {/* Input Control */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Base Price Input</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Label htmlFor="basePrice" className="text-sm font-medium">
                Enter Base Price (₹):
              </Label>
              <Input
                id="basePrice"
                type="number"
                value={basePrice}
                onChange={(e) => setBasePrice(Number(e.target.value))}
                className="w-40"
                min="0"
                step="1000"
              />
              <div className="flex gap-2">
                <Button onClick={() => setBasePrice(50000)} variant="outline" size="sm">
                  ₹50K
                </Button>
                <Button onClick={() => setBasePrice(100000)} variant="outline" size="sm">
                  ₹1L
                </Button>
                <Button onClick={() => setBasePrice(200000)} variant="outline" size="sm">
                  ₹2L
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Listing Page Display */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-venue-indigo">
                📋 Venue Listing Page Display
              </CardTitle>
              <p className="text-sm text-gray-600">
                This is how the price appears on venue listing pages
              </p>
            </CardHeader>
            <CardContent>
              <div className="text-center p-6 bg-gradient-to-br from-venue-indigo to-venue-purple text-white rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Sample Venue</h3>
                <div className="text-3xl font-bold mb-2">
                  {listingPricing.formattedPrice}
                </div>
                <div className="text-sm opacity-90">/day</div>
                <Button className="mt-4 bg-white text-venue-indigo hover:bg-gray-100">
                  Book Now
                </Button>
              </div>
              
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-sm mb-2">Calculation:</h4>
                <div className="text-sm space-y-1">
                  <div>Base Price: {formatPrice(basePrice)}</div>
                  <div>+ GST (18%): {formatPrice(basePrice * 0.18)}</div>
                  <div>+ Platform Fee (10%): {formatPrice(basePrice * 0.10)}</div>
                  <div className="border-t pt-1 font-semibold">
                    Total: {listingPricing.formattedPrice}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detail Page Display */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-venue-purple">
                📄 Venue Detail Page Display
              </CardTitle>
              <p className="text-sm text-gray-600">
                This is how the price breakdown appears on venue detail pages
              </p>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 rounded-lg p-4 border-2 border-venue-indigo/10">
                <h3 className="text-lg font-semibold text-venue-dark mb-3">Price Breakdown</h3>
                <div className="space-y-2">
                  {detailPricing.items.map((item, index) => (
                    <div key={index} className={`flex justify-between text-sm ${
                      item.type === 'subtotal' ? 'border-t pt-2 mt-2 font-medium' : 
                      item.type === 'discount' ? 'text-green-600 font-medium' :
                      item.type === 'final' ? 'border-t pt-2 mt-2 text-lg font-bold text-venue-indigo' : 
                      ''
                    }`}>
                      <span>{item.label}:</span>
                      <span>{item.formatted}</span>
                    </div>
                  ))}
                  <div className="mt-3 pt-2 border-t border-gray-200">
                    <p className="text-xs text-green-600 font-medium">
                      {detailPricing.discountNote}
                    </p>
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-500 text-center">per day</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-xl">📊 Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">Listing Page Price</h4>
                <div className="text-2xl font-bold text-blue-600">
                  {listingPricing.formattedPrice}
                </div>
                <div className="text-sm text-blue-700 mt-1">
                  Base + GST + Platform Fee
                </div>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">Detail Page Final Price</h4>
                <div className="text-2xl font-bold text-green-600">
                  {detailPricing.breakdown.formattedFinalPrice}
                </div>
                <div className="text-sm text-green-700 mt-1">
                  After 10% new launch discount
                </div>
              </div>
              
              <div className="p-4 bg-orange-50 rounded-lg">
                <h4 className="font-semibold text-orange-800 mb-2">Customer Savings</h4>
                <div className="text-2xl font-bold text-orange-600">
                  {formatPrice(detailPricing.breakdown.discount)}
                </div>
                <div className="text-sm text-orange-700 mt-1">
                  10% discount amount
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm text-gray-600">
          <p>
            This demo shows how VenueKart's dynamic pricing system works:
          </p>
          <ul className="mt-2 space-y-1">
            <li>• Venue listing pages show inflated price (base + 18% GST + 10% platform fee)</li>
            <li>• Venue detail pages show complete breakdown with 10% new launch discount</li>
            <li>• All calculations are done dynamically from the base price set by venue owners</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
