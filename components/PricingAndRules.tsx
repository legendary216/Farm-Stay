import { Sun, Moon, AlertCircle, Check } from 'lucide-react';

export function PricingAndRules() {
  const rules = [
    'Guests must bring own blankets & bedsheets',
    'Check-in and check-out timings strictly enforced',
    'Maximum 15 guests - no additional guests allowed',
    'No smoking inside the house',
    'Maintain cleanliness and respect the property',
    'Pool supervision is guest responsibility',
  ];

  return (
    <div className="py-24 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left Column: Pricing */}
          <div>
            <h2 className="text-3xl md:text-4xl text-gray-900 mb-8 font-light tracking-tight">
              Packages
            </h2>

            <div className="space-y-6">
              {/* Day Out Card */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-8 border border-amber-100 shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center">
                      <Sun className="w-7 h-7 text-amber-700" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-medium text-gray-900">Day Out</h3>
                      <p className="text-gray-600 text-sm mt-1">9:30 AM - 5:30 PM</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-4xl font-semibold text-green-800">₹3,000</p>
                  </div>
                </div>
              </div>

              {/* Night Stay Card */}
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-3xl p-8 border border-indigo-100 shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center">
                      <Moon className="w-7 h-7 text-indigo-700" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-medium text-gray-900">Night Stay</h3>
                      <p className="text-gray-600 text-sm mt-1">6:30 PM - 9:00 AM</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-4xl font-semibold text-green-800">₹3,000</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Advance Payment Notice */}
            <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-300 rounded-3xl p-6 mt-8">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <AlertCircle className="w-6 h-6 text-yellow-700" />
                </div>
                <div>
                  <h4 className="font-semibold text-lg text-gray-900 mb-2">
                    ₹1,500 Mandatory Advance
                  </h4>
                  <p className="text-gray-700 leading-relaxed">
                    Pay ₹1,500 advance to confirm booking.<br />
                    Remaining ₹1,500 payable at property.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: House Rules */}
          <div>
            <h2 className="text-3xl md:text-4xl text-gray-900 mb-8 font-light tracking-tight">
              House Rules
            </h2>

            <div className="bg-stone-50 rounded-3xl p-8 shadow-md">
              <div className="space-y-5">
                {rules.map((rule, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-6 h-6 rounded-full bg-green-800 flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{rule}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}