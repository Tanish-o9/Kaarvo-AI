import React, { useState } from 'react';
import { X, CreditCard, ShieldCheck, CheckCircle2, AlertTriangle, Truck, Package, Clock, Copy } from 'lucide-react';
import { auctionApi } from '../services/auctionApi';

export default function AuctionCheckoutModal({
  auction,
  isOpen,
  onClose,
  onPaymentSuccess
}) {
  const [paymentMethod, setPaymentMethod] = useState('razorpay'); // 'razorpay' | 'upi' | 'netbanking'
  const [shippingAddress, setShippingAddress] = useState('Flat 402, Heritage Residency, Civil Lines, Jaipur, Rajasthan - 302006');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [completedOrder, setCompletedOrder] = useState(null);

  if (!isOpen || !auction) return null;

  const winningAmount = parseFloat(auction.current_highest_bid || auction.starting_price || 0);
  const gstAmount = Math.round(winningAmount * 0.05); // 5% handicraft GST
  const shippingFee = 0; // Free insured artisan shipping
  const totalPayable = winningAmount + gstAmount + shippingFee;

  const handlePayNow = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setError('');

    try {
      const payload = {
        payment_method: paymentMethod,
        shipping_address: shippingAddress,
        notes: 'Handcrafted artisan product auction settlement'
      };

      const result = await auctionApi.payAuctionWinner(auction.id, payload);
      setCompletedOrder(result.order);
      if (onPaymentSuccess) onPaymentSuccess(result);
    } catch (err) {
      setError(err.message || 'Payment processing failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#141210] border border-[#38342e] rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#1c1916] to-[#121110] border-b border-[#2e2a25] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#c5a66a]/20 border border-[#c5a66a] flex items-center justify-center text-[#c5a66a]">
              <CreditCard size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {completedOrder ? 'Payment Confirmed & Order Created' : 'Auction Settlement & Checkout'}
              </h3>
              <p className="text-xs text-[#a39e93]">
                {completedOrder ? 'Your handcrafted piece is now scheduled for dispatch' : `Auction #${auction.id}: ${auction.product_title || auction.title}`}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#888] hover:text-white hover:bg-[#222] transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {completedOrder ? (
            /* Order Success View */
            <div className="space-y-5 text-center py-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-950/80 border-2 border-emerald-500 flex items-center justify-center text-emerald-400">
                <CheckCircle2 size={36} />
              </div>

              <div>
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-900/40 text-emerald-300 border border-emerald-800">
                  Order Successfully Placed
                </span>
                <h4 className="text-xl font-bold text-[#f5f2eb] mt-2">
                  Thank You for Supporting Authentic Heritage Artisans!
                </h4>
                <p className="text-xs text-[#a39e93] max-w-md mx-auto mt-1">
                  Your payment has been securely confirmed. An official invoice and ONDC logistics bill have been generated.
                </p>
              </div>

              {/* Order Info Card */}
              <div className="bg-[#0e0d0c] border border-[#2a2622] rounded-xl p-4 text-left space-y-3 font-mono text-xs">
                <div className="flex justify-between border-b border-[#222] pb-2">
                  <span className="text-[#888]">Order ID:</span>
                  <span className="font-bold text-[#dfbe7d]">#{completedOrder.id || 'AUC-ORD-' + auction.id}</span>
                </div>
                <div className="flex justify-between border-b border-[#222] pb-2">
                  <span className="text-[#888]">Tracking ID (ONDC):</span>
                  <span className="font-bold text-emerald-400">{completedOrder.tracking_number || 'ONDC-EXP-99281'}</span>
                </div>
                <div className="flex justify-between border-b border-[#222] pb-2">
                  <span className="text-[#888]">Total Paid:</span>
                  <span className="font-bold text-white">₹{parseFloat(completedOrder.final_amount || totalPayable).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#888]">Estimated Delivery:</span>
                  <span className="text-white">3 - 5 Business Days (Insured)</span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full bg-[#c5a66a] hover:bg-[#dfbe7d] text-[#121212] font-black text-sm uppercase tracking-wider py-3 rounded-xl transition-colors cursor-pointer"
              >
                Back to Auctions
              </button>
            </div>
          ) : (
            /* Checkout Form View */
            <form onSubmit={handlePayNow} className="space-y-5">
              {/* Product Snippet */}
              <div className="flex items-center gap-4 p-3.5 rounded-xl bg-[#0e0d0c] border border-[#222]">
                <img
                  src={auction.product_image || 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=800&q=80'}
                  alt={auction.product_title || auction.title}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-white truncate">
                    {auction.product_title || auction.title}
                  </h4>
                  <p className="text-xs text-[#8e8a83] truncate">
                    Seller: {auction.seller?.artisan_name || auction.seller?.username || 'Verified Artisan'}
                  </p>
                  <span className="inline-block mt-1 text-xs font-mono font-bold text-[#c5a66a]">
                    Winning Bid: ₹{winningAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="p-4 rounded-xl bg-[#0c0b0a] border border-[#262422] space-y-2 text-xs">
                <div className="flex justify-between text-[#a39e93]">
                  <span>Hammer Price (Winning Bid)</span>
                  <span className="font-mono text-white">₹{winningAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-[#a39e93]">
                  <span>Artisan Guild GST (5%)</span>
                  <span className="font-mono text-white">₹{gstAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-[#a39e93]">
                  <span>Handcrafted Insured Logistics (ONDC)</span>
                  <span className="font-mono text-emerald-400 font-bold">FREE</span>
                </div>
                <div className="border-t border-[#222] pt-2 flex justify-between text-sm font-bold">
                  <span className="text-[#f5f2eb]">Total Payable</span>
                  <span className="text-base font-black font-mono text-[#c5a66a]">
                    ₹{totalPayable.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Shipping Address */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#a39e93] mb-1.5 flex items-center gap-1.5">
                  <Truck size={14} className="text-[#c5a66a]" /> Shipping Destination
                </label>
                <textarea
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  rows={2}
                  className="w-full bg-[#0a0a09] border border-[#333] focus:border-[#c5a66a] rounded-xl p-3 text-xs text-white focus:outline-none"
                  required
                />
              </div>

              {/* Payment Gateways */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#a39e93] mb-2">
                  Select Payment Gateway
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { id: 'razorpay', label: 'Razorpay', sub: 'Cards, UPI & Netbanking' },
                    { id: 'upi', label: 'Instant UPI', sub: 'GPay, PhonePe, Paytm' },
                    { id: 'cashfree', label: 'Cashfree / Escrow', sub: 'Artisan Safe Escrow' }
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        paymentMethod === m.id
                          ? 'bg-[#c5a66a]/15 border-[#c5a66a] text-white shadow-md'
                          : 'bg-[#0f0e0d] border-[#262422] text-[#8e8a83] hover:border-[#444]'
                      }`}
                    >
                      <span className="block text-xs font-bold text-[#f5f2eb]">{m.label}</span>
                      <span className="block text-[10px] text-[#8e8a83] mt-0.5">{m.sub}</span>
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-950/50 border border-red-700/70 text-red-300 text-xs flex items-center gap-2">
                  <AlertTriangle size={15} className="shrink-0 text-red-400" />
                  <span>{error}</span>
                </div>
              )}

              {/* Submit Payment */}
              <button
                type="submit"
                disabled={processing}
                className="w-full bg-gradient-to-r from-[#c5a66a] via-[#dfbe7d] to-[#c5a66a] text-[#121212] font-black text-sm uppercase tracking-wider py-3.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:shadow-[#c5a66a]/20 disabled:opacity-50"
              >
                <ShieldCheck size={16} />
                {processing ? 'Processing Secure Settlement...' : `Pay ₹${totalPayable.toLocaleString('en-IN')} & Confirm Order`}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

