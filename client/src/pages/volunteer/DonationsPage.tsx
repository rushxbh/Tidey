import React, { useState } from 'react';
import { Heart, CreditCard, DollarSign, Users, Waves, ArrowRight, Check } from 'lucide-react';

interface DonationOption {
  id: string;
  title: string;
  description: string;
  amount: number;
  impact: string;
  icon: React.ReactNode;
}

const DonationsPage: React.FC = () => {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [donationType, setDonationType] = useState<'one-time' | 'monthly'>('one-time');
  const [showPayment, setShowPayment] = useState(false);

  const donationOptions: DonationOption[] = [
    {
      id: 'cleanup-supplies',
      title: 'Cleanup Supplies',
      description: 'Provide gloves, bags, and tools for volunteers',
      amount: 25,
      impact: 'Equips 10 volunteers for a cleanup event',
      icon: <Users className="h-6 w-6" />
    },
    {
      id: 'beach-restoration',
      title: 'Beach Restoration',
      description: 'Fund native plant restoration and habitat protection',
      amount: 50,
      impact: 'Restores 100 sq ft of beach ecosystem',
      icon: <Waves className="h-6 w-6" />
    },
    {
      id: 'education-program',
      title: 'Education Programs',
      description: 'Support environmental education in schools',
      amount: 100,
      impact: 'Educates 50 students about ocean conservation',
      icon: <Heart className="h-6 w-6" />
    }
  ];

  const predefinedAmounts = [10, 25, 50, 100, 250, 500];

  const handleDonate = () => {
    const amount = selectedAmount || parseFloat(customAmount);
    if (amount && amount > 0) {
      setShowPayment(true);
    }
  };

  const getDonationAmount = () => {
    return selectedAmount || parseFloat(customAmount) || 0;
  };

  if (showPayment) {
    return <PaymentPage amount={getDonationAmount()} type={donationType} onBack={() => setShowPayment(false)} />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Can't Clean? Help in Another Way
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Your donation directly supports beach cleanup efforts, volunteer programs, 
          and ocean conservation initiatives. Every contribution makes a difference.
        </p>
      </div>

      {/* Impact Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">12,500kg</div>
          <div className="text-blue-800">Waste Removed</div>
          <div className="text-sm text-blue-600 mt-1">Thanks to donor support</div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">2,340</div>
          <div className="text-green-800">Volunteers Equipped</div>
          <div className="text-sm text-green-600 mt-1">With donated supplies</div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl text-center">
          <div className="text-3xl font-bold text-purple-600 mb-2">45</div>
          <div className="text-purple-800">Beaches Restored</div>
          <div className="text-sm text-purple-600 mt-1">Through funded programs</div>
        </div>
      </div>

      {/* Donation Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {donationOptions.map((option) => (
          <div
            key={option.id}
            className={`p-6 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
              selectedAmount === option.amount
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => {
              setSelectedAmount(option.amount);
              setCustomAmount('');
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-primary-100 rounded-lg text-primary-600">
                {option.icon}
              </div>
              <div className="text-2xl font-bold text-gray-900">${option.amount}</div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{option.title}</h3>
            <p className="text-gray-600 mb-3">{option.description}</p>
            <div className="text-sm text-green-600 font-medium">
              Impact: {option.impact}
            </div>
          </div>
        ))}
      </div>

      {/* Custom Amount */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose Your Amount</h3>
        
        {/* Donation Type */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setDonationType('one-time')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              donationType === 'one-time'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            One-time
          </button>
          <button
            onClick={() => setDonationType('monthly')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              donationType === 'monthly'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Monthly
          </button>
        </div>

        {/* Predefined Amounts */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-4">
          {predefinedAmounts.map((amount) => (
            <button
              key={amount}
              onClick={() => {
                setSelectedAmount(amount);
                setCustomAmount('');
              }}
              className={`p-3 border rounded-lg font-medium transition-colors ${
                selectedAmount === amount
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              ${amount}
            </button>
          ))}
        </div>

        {/* Custom Amount Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Or enter custom amount
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="number"
              value={customAmount}
              onChange={(e) => {
                setCustomAmount(e.target.value);
                setSelectedAmount(null);
              }}
              placeholder="0.00"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              min="1"
              step="0.01"
            />
          </div>
        </div>

        {/* Donate Button */}
        <button
          onClick={handleDonate}
          disabled={!getDonationAmount()}
          className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center"
        >
          <Heart className="mr-2 h-5 w-5" />
          Donate ${getDonationAmount().toFixed(2)} {donationType === 'monthly' ? '/month' : ''}
          <ArrowRight className="ml-2 h-5 w-5" />
        </button>
      </div>

      {/* Trust Indicators */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
          Your donation is secure and makes a real impact
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="flex items-center justify-center space-x-2">
            <Check className="h-5 w-5 text-green-600" />
            <span className="text-sm text-gray-700">100% Secure Payment</span>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <Check className="h-5 w-5 text-green-600" />
            <span className="text-sm text-gray-700">Tax Deductible</span>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <Check className="h-5 w-5 text-green-600" />
            <span className="text-sm text-gray-700">Transparent Impact</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Payment Page Component
const PaymentPage: React.FC<{ amount: number; type: 'one-time' | 'monthly'; onBack: () => void }> = ({ 
  amount, 
  type, 
  onBack 
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal'>('card');
  const [formData, setFormData] = useState({
    email: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    name: '',
    address: '',
    city: '',
    zipCode: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle payment processing here
    alert('Payment processed successfully! Thank you for your donation.');
    onBack();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center space-x-4 mb-6">
        <button
          onClick={onBack}
          className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
        >
          ←
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Complete Your Donation</h1>
      </div>

      {/* Order Summary */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Donation Summary</h3>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">
            {type === 'monthly' ? 'Monthly' : 'One-time'} donation
          </span>
          <span className="text-xl font-bold text-gray-900">
            ${amount.toFixed(2)}{type === 'monthly' ? '/month' : ''}
          </span>
        </div>
      </div>

      {/* Payment Method */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Payment Method</h3>
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setPaymentMethod('card')}
            className={`flex-1 p-4 border rounded-lg transition-colors ${
              paymentMethod === 'card'
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <CreditCard className="h-6 w-6 mx-auto mb-2" />
            <div className="text-sm font-medium">Credit Card</div>
          </button>
          <button
            onClick={() => setPaymentMethod('paypal')}
            className={`flex-1 p-4 border rounded-lg transition-colors ${
              paymentMethod === 'paypal'
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <div className="h-6 w-6 mx-auto mb-2 bg-blue-600 rounded text-white text-xs flex items-center justify-center">
              PP
            </div>
            <div className="text-sm font-medium">PayPal</div>
          </button>
        </div>

        {paymentMethod === 'card' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
              <input
                type="text"
                name="cardNumber"
                value={formData.cardNumber}
                onChange={handleInputChange}
                placeholder="1234 5678 9012 3456"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                <input
                  type="text"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleInputChange}
                  placeholder="MM/YY"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                <input
                  type="text"
                  name="cvv"
                  value={formData.cvv}
                  onChange={handleInputChange}
                  placeholder="123"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cardholder Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Complete Donation ${amount.toFixed(2)}
            </button>
          </form>
        )}

        {paymentMethod === 'paypal' && (
          <div className="text-center py-8">
            <button
              onClick={() => alert('Redirecting to PayPal...')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
            >
              Continue with PayPal
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DonationsPage;