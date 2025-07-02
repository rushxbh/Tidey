import React, { useState, useEffect } from 'react';
import { Heart, CreditCard, DollarSign, Users, Waves, ArrowRight, Check, History, MapPin } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

interface DonationOption {
  id: string;
  title: string;
  description: string;
  amount: number;
  impact: string;
  icon: React.ReactNode;
  location: string;
}

interface PastDonation {
  id: string;
  amount: number;
  cause: string;
  date: string;
  status: 'completed' | 'pending';
  transactionId: string;
}

const donationOptions: DonationOption[] = [
    {
      id: 'cleanup-supplies-mumbai',
      title: 'Cleanup Supplies - Mumbai',
      description: 'Provide gloves, bags, and tools for volunteers in Mumbai beaches',
      amount: 500,
      impact: 'Equips 20 volunteers for a cleanup event',
      icon: <Users className="h-6 w-6" />,
      location: 'Mumbai, Maharashtra'
    },
    {
      id: 'beach-restoration-goa',
      title: 'Beach Restoration - Goa',
      description: 'Fund native plant restoration and habitat protection in Goa',
      amount: 1000,
      impact: 'Restores 200 sq ft of beach ecosystem',
      icon: <Waves className="h-6 w-6" />,
      location: 'Goa'
    },
    {
      id: 'education-program-kerala',
      title: 'Education Programs - Kerala',
      description: 'Support environmental education in Kerala schools',
      amount: 750,
      impact: 'Educates 100 students about ocean conservation',
      icon: <Heart className="h-6 w-6" />,
      location: 'Kerala'
    },
    {
      id: 'waste-management-chennai',
      title: 'Waste Management - Chennai',
      description: 'Install waste segregation systems on Chennai beaches',
      amount: 1500,
      impact: 'Prevents 500kg of waste from entering the ocean monthly',
      icon: <Users className="h-6 w-6" />,
      location: 'Chennai, Tamil Nadu'
    },
    {
      id: 'mangrove-restoration-sundarbans',
      title: 'Mangrove Restoration - Sundarbans',
      description: 'Plant mangroves to protect coastal areas in Sundarbans',
      amount: 2000,
      impact: 'Plants 100 mangrove saplings for coastal protection',
      icon: <Waves className="h-6 w-6" />,
      location: 'West Bengal'
    },
    {
      id: 'fisherman-support-odisha',
      title: 'Fisherman Support - Odisha',
      description: 'Provide sustainable fishing equipment to coastal communities',
      amount: 1200,
      impact: 'Supports 10 fishing families with eco-friendly gear',
      icon: <Heart className="h-6 w-6" />,
      location: 'Odisha'
    }
  ];

const DonationsPage: React.FC = () => {
  const { user } = useAuth();
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [donationType, setDonationType] = useState<'one-time' | 'monthly'>('one-time');
  const [showPayment, setShowPayment] = useState(false);
  const [selectedCause, setSelectedCause] = useState<string>('');
  const [showHistory, setShowHistory] = useState(false);
  const [pastDonations, setPastDonations] = useState<PastDonation[]>([]);

  useEffect(() => {
    fetchPastDonations();
  }, []);

  const fetchPastDonations = async () => {
    try {
      const response = await axios.get('/api/donations/history');
      setPastDonations(response.data.donations || []);
    } catch (error) {
      console.error('Error fetching donation history:', error);
      // Mock data for demo
      setPastDonations([
        {
          id: '1',
          amount: 500,
          cause: 'Beach Restoration - Mumbai',
          date: '2024-01-15',
          status: 'completed',
          transactionId: 'TXN123456'
        },
        {
          id: '2',
          amount: 250,
          cause: 'Cleanup Supplies - Goa',
          date: '2024-01-10',
          status: 'completed',
          transactionId: 'TXN123457'
        }
      ]);
    }
  };

  

  const predefinedAmounts = [250, 500, 1000, 2000, 5000, 10000];

  const handleDonate = () => {
    const amount = selectedAmount || parseFloat(customAmount);
    if (amount && amount > 0 && selectedCause) {
      setShowPayment(true);
    } else {
      alert('Please select an amount and a cause to donate to.');
    }
  };

  const getDonationAmount = () => {
    return selectedAmount || parseFloat(customAmount) || 0;
  };

  const getTotalDonated = () => {
    return pastDonations.reduce((total, donation) => total + donation.amount, 0);
  };

  if (showPayment) {
    return (
      <PaymentPage 
        amount={getDonationAmount()} 
        type={donationType} 
        cause={selectedCause}
        onBack={() => setShowPayment(false)}
        onSuccess={() => {
          setShowPayment(false);
          fetchPastDonations();
        }}
      />
    );
  }

  if (showHistory) {
    return (
      <DonationHistoryPage 
        donations={pastDonations}
        onBack={() => setShowHistory(false)}
        totalDonated={getTotalDonated()}
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Support Beach Conservation in India
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Your donation directly supports beach cleanup efforts, volunteer programs, 
          and ocean conservation initiatives across India's coastline. Every contribution makes a difference.
        </p>
        <div className="mt-6 flex items-center justify-center space-x-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600">₹{getTotalDonated().toLocaleString()}</div>
            <div className="text-sm text-gray-600">Your Total Donations</div>
          </div>
          <button
            onClick={() => setShowHistory(true)}
            className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 font-medium"
          >
            <History className="h-4 w-4" />
            <span>View History</span>
          </button>
        </div>
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

      {/* Donation Causes */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Choose a Cause to Support</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {donationOptions.map((option) => (
            <div
              key={option.id}
              className={`p-6 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                selectedCause === option.id
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => {
                setSelectedCause(option.id);
                setSelectedAmount(option.amount);
                setCustomAmount('');
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-primary-100 rounded-lg text-primary-600">
                  {option.icon}
                </div>
                <div className="text-2xl font-bold text-gray-900">₹{option.amount.toLocaleString()}</div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{option.title}</h3>
              <div className="flex items-center text-sm text-gray-600 mb-2">
                <MapPin className="h-4 w-4 mr-1" />
                {option.location}
              </div>
              <p className="text-gray-600 mb-3">{option.description}</p>
              <div className="text-sm text-green-600 font-medium">
                Impact: {option.impact}
              </div>
            </div>
          ))}
        </div>
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
              ₹{amount.toLocaleString()}
            </button>
          ))}
        </div>

        {/* Custom Amount Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Or enter custom amount
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">₹</span>
            <input
              type="number"
              value={customAmount}
              onChange={(e) => {
                setCustomAmount(e.target.value);
                setSelectedAmount(null);
              }}
              placeholder="0"
              className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              min="1"
              step="1"
            />
          </div>
        </div>

        {/* Donate Button */}
        <button
          onClick={handleDonate}
          disabled={!getDonationAmount() || !selectedCause}
          className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center"
        >
          <Heart className="mr-2 h-5 w-5" />
          Donate ₹{getDonationAmount().toLocaleString()} {donationType === 'monthly' ? '/month' : ''}
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
            <span className="text-sm text-gray-700">Tax Deductible (80G)</span>
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
const PaymentPage: React.FC<{ 
  amount: number; 
  type: 'one-time' | 'monthly'; 
  cause: string;
  onBack: () => void;
  onSuccess: () => void;
}> = ({ amount, type, cause, onBack, onSuccess }) => {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'netbanking'>('upi');
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    upiId: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    name: '',
    address: '',
    city: '',
    pincode: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle payment processing here
    alert('Payment processed successfully! Thank you for your donation.');
    onSuccess();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const selectedCause = donationOptions.find((option: DonationOption) => option.id === cause);

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
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Cause</span>
            <span className="font-medium">{selectedCause?.title}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">
              {type === 'monthly' ? 'Monthly' : 'One-time'} donation
            </span>
            <span className="text-xl font-bold text-gray-900">
              ₹{amount.toLocaleString()}{type === 'monthly' ? '/month' : ''}
            </span>
          </div>
          <div className="text-sm text-green-600 mt-2">
            Impact: {selectedCause?.impact}
          </div>
        </div>
      </div>

      {/* Payment Method */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Payment Method</h3>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <button
            onClick={() => setPaymentMethod('upi')}
            className={`p-4 border rounded-lg transition-colors ${
              paymentMethod === 'upi'
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <div className="text-center">
              <div className="text-lg font-bold mb-1">UPI</div>
              <div className="text-xs text-gray-600">PhonePe, GPay, etc.</div>
            </div>
          </button>
          <button
            onClick={() => setPaymentMethod('card')}
            className={`p-4 border rounded-lg transition-colors ${
              paymentMethod === 'card'
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <CreditCard className="h-6 w-6 mx-auto mb-2" />
            <div className="text-sm font-medium">Credit/Debit Card</div>
          </button>
          <button
            onClick={() => setPaymentMethod('netbanking')}
            className={`p-4 border rounded-lg transition-colors ${
              paymentMethod === 'netbanking'
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <div className="text-center">
              <div className="text-lg font-bold mb-1">Net Banking</div>
              <div className="text-xs text-gray-600">All major banks</div>
            </div>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>
          </div>

          {paymentMethod === 'upi' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">UPI ID</label>
              <input
                type="text"
                name="upiId"
                value={formData.upiId}
                onChange={handleInputChange}
                placeholder="yourname@paytm"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>
          )}

          {paymentMethod === 'card' && (
            <>
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
            </>
          )}

          <button
            type="submit"
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Complete Donation ₹{amount.toLocaleString()}
          </button>
        </form>
      </div>
    </div>
  );
};

// Donation History Page Component
const DonationHistoryPage: React.FC<{
  donations: PastDonation[];
  onBack: () => void;
  totalDonated: number;
}> = ({ donations, onBack, totalDonated }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-4 mb-6">
        <button
          onClick={onBack}
          className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
        >
          ←
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Donation History</h1>
      </div>

      {/* Summary */}
      <div className="bg-gradient-to-r from-primary-50 to-ocean-50 rounded-xl p-6">
        <div className="text-center">
          <div className="text-3xl font-bold text-primary-600 mb-2">₹{totalDonated.toLocaleString()}</div>
          <div className="text-gray-700">Total Donated</div>
          <div className="text-sm text-gray-600 mt-2">{donations.length} donations made</div>
        </div>
      </div>

      {/* Donations List */}
      <div className="space-y-4">
        {donations.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No donations yet</h3>
            <p className="text-gray-600">Your donation history will appear here.</p>
          </div>
        ) : (
          donations.map((donation) => (
            <div key={donation.id} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{donation.cause}</h3>
                  <p className="text-sm text-gray-600">
                    {new Date(donation.date).toLocaleDateString('en-IN')}
                  </p>
                  <p className="text-xs text-gray-500">Transaction ID: {donation.transactionId}</p>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-gray-900">₹{donation.amount.toLocaleString()}</div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    donation.status === 'completed' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {donation.status.charAt(0).toUpperCase() + donation.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DonationsPage;