import React, { useState, useRef } from 'react';
import {
  X, Gavel, Clock, AlertCircle, Upload, Image as ImageIcon,
  Trash2, Plus, Star, Link as LinkIcon
} from 'lucide-react';
import { auctionApi } from '../services/auctionApi';

export default function CreateAuctionModal({
  isOpen,
  onClose,
  onAuctionCreated
}) {
  // 1. Plain, clean inputs (No suggestions, no static text)
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Terracotta Pottery');
  const [customCategory, setCustomCategory] = useState('');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [catalogLink, setCatalogLink] = useState('');
  const [description, setDescription] = useState('');
  
  // 2. Multiple photos state
  const [photos, setPhotos] = useState([]); // array of { id, url, name }
  const [primaryPhotoIndex, setPrimaryPhotoIndex] = useState(0);
  const [pastedUrl, setPastedUrl] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);

  // 3. Financial & scheduling inputs
  const [startingPrice, setStartingPrice] = useState('');
  const [minIncrement, setMinIncrement] = useState('50');
  const [reservePrice, setReservePrice] = useState('');
  const [buyNowPrice, setBuyNowPrice] = useState('');
  const [durationHours, setDurationHours] = useState('24');
  const [customDurationHours, setCustomDurationHours] = useState('');
  const [publishImmediately, setPublishImmediately] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  // Handle multiple file browse & upload from device
  const handleMultipleFilesChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setError('');
    files.forEach((file) => {
      if (!file.type.startsWith('image/')) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result;
        if (typeof dataUrl === 'string') {
          setPhotos((prev) => [
            ...prev,
            {
              id: `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
              url: dataUrl,
              name: file.name
            }
          ]);
        }
      };
      reader.readAsDataURL(file);
    });

    // Reset input so same file can be re-selected if desired
    e.target.value = '';
  };

  // Add photo via URL
  const handleAddPhotoUrl = () => {
    if (!pastedUrl.trim()) return;
    setPhotos((prev) => [
      ...prev,
      {
        id: `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        url: pastedUrl.trim(),
        name: 'Web Image URL'
      }
    ]);
    setPastedUrl('');
    setShowUrlInput(false);
  };

  // Remove photo
  const handleRemovePhoto = (indexToRemove) => {
    setPhotos((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    if (primaryPhotoIndex >= indexToRemove && primaryPhotoIndex > 0) {
      setPrimaryPhotoIndex((prev) => prev - 1);
    }
  };

  // Submit auction
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const trimmedTitle = title.trim();
      if (!trimmedTitle) {
        throw new Error('Please enter an auction title.');
      }

      const parsedStartPrice = parseFloat(startingPrice);
      if (isNaN(parsedStartPrice) || parsedStartPrice <= 0) {
        throw new Error('Please enter a valid starting price greater than ₹0.');
      }

      const parsedMinInc = parseFloat(minIncrement) || 50;
      if (parsedMinInc <= 0) {
        throw new Error('Minimum increment must be greater than ₹0.');
      }

      const parsedReserve = reservePrice ? parseFloat(reservePrice) : null;
      if (parsedReserve && parsedReserve < parsedStartPrice) {
        throw new Error('Reserve price cannot be less than starting price.');
      }

      const parsedBuyNow = buyNowPrice ? parseFloat(buyNowPrice) : null;
      if (parsedBuyNow && parsedBuyNow <= parsedStartPrice) {
        throw new Error('Buy Now price must be higher than starting price.');
      }

      const activeCategory = isCustomCategory && customCategory.trim()
        ? customCategory.trim()
        : category;

      const finalDuration = customDurationHours ? parseInt(customDurationHours, 10) : parseInt(durationHours, 10);
      const hoursToUse = isNaN(finalDuration) || finalDuration <= 0 ? 24 : finalDuration;

      const now = new Date();
      const endTime = new Date(now.getTime() + hoursToUse * 3600 * 1000);

      // Reorder photos so primary photo is at index 0
      const orderedPhotos = [...photos];
      if (primaryPhotoIndex > 0 && primaryPhotoIndex < orderedPhotos.length) {
        const [primaryItem] = orderedPhotos.splice(primaryPhotoIndex, 1);
        orderedPhotos.unshift(primaryItem);
      }

      const fallbackImage = 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=800&q=80';
      const photoUrls = orderedPhotos.map((p) => p.url);
      const primaryImageUrl = photoUrls[0] || fallbackImage;

      const payload = {
        title: trimmedTitle,
        category: activeCategory,
        catalog_link: catalogLink.trim() || null,
        description: description.trim() || `Authentic handcrafted ${activeCategory} piece created by verified master artisans.`,
        image_url: primaryImageUrl,
        images: photoUrls.length > 0 ? photoUrls : [primaryImageUrl],
        starting_price: parsedStartPrice,
        minimum_increment: parsedMinInc,
        min_bid_increment: parsedMinInc,
        start_time: now.toISOString(),
        end_time: endTime.toISOString(),
        publish_immediately: publishImmediately
      };

      if (parsedReserve) payload.reserve_price = parsedReserve;
      if (parsedBuyNow) payload.buy_now_price = parsedBuyNow;

      const created = await auctionApi.createAuction(payload);
      if (onAuctionCreated) onAuctionCreated(created);
      onClose();
    } catch (err) {
      let msg = err.message || 'Failed to list auction. Check required fields.';
      if (msg.includes('This field may not be null')) {
        msg = 'Invalid input: Please verify all required fields.';
      }
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#141210] border border-[#38342e] rounded-2xl shadow-2xl overflow-hidden max-h-[94vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#1c1916] to-[#121110] border-b border-[#2e2a25] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#c5a66a]/20 border border-[#c5a66a] flex items-center justify-center text-[#c5a66a]">
              <Gavel size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Create New Artisan Auction</h3>
              <p className="text-xs text-[#a39e93]">List your master craft for live English bidding</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#888] hover:text-white hover:bg-[#222] transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4">
          
          {/* 1. Auction Title (Default, clean input - no suggestions, no static text) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#a39e93] mb-1">
              Auction Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => { setError(''); setTitle(e.target.value); }}
              placeholder="Auction Title"
              className="w-full bg-[#0c0b0a] border border-[#333] focus:border-[#c5a66a] rounded-xl p-3 text-xs text-white focus:outline-none"
              required
            />
          </div>

          {/* 2. Category & Catalog Link (Disconnected from Title) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#a39e93] mb-1">
                Category *
              </label>
              <select
                value={isCustomCategory ? '__custom__' : category}
                onChange={(e) => {
                  if (e.target.value === '__custom__') {
                    setIsCustomCategory(true);
                  } else {
                    setIsCustomCategory(false);
                    setCategory(e.target.value);
                  }
                }}
                className="w-full bg-[#0c0b0a] border border-[#333] focus:border-[#c5a66a] rounded-xl p-3 text-xs text-white focus:outline-none"
              >
                <option value="Terracotta Pottery">Terracotta Pottery</option>
                <option value="Handloom Textiles">Handloom Textiles</option>
                <option value="Brass & Metal Craft">Brass & Metal Craft</option>
                <option value="Channapatna Woodcraft">Channapatna Woodcraft</option>
                <option value="Folk Art & Paintings">Folk Art & Paintings</option>
                <option value="Blue Pottery & Ceramics">Blue Pottery & Ceramics</option>
                <option value="__custom__">✍️ Custom Category...</option>
              </select>

              {isCustomCategory && (
                <input
                  type="text"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="Enter custom category"
                  className="w-full bg-[#0c0b0a] border border-[#c5a66a] rounded-xl p-2.5 text-xs text-white focus:outline-none mt-2"
                  required
                />
              )}
            </div>

            {/* Catalog Link (Only allows link/URL, does not touch Title or Price) */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#a39e93] mb-1 flex items-center gap-1">
                <LinkIcon size={12} className="text-[#c5a66a]" /> Catalog Link (Optional)
              </label>
              <input
                type="url"
                value={catalogLink}
                onChange={(e) => setCatalogLink(e.target.value)}
                placeholder="https://..."
                className="w-full bg-[#0c0b0a] border border-[#333] focus:border-[#c5a66a] rounded-xl p-3 text-xs text-white focus:outline-none"
              />
            </div>
          </div>

          {/* 3. Multiple Photos Upload System */}
          <div className="p-4 rounded-xl bg-[#0c0b0a] border border-[#2e2a25] space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-[#dfbe7d] flex items-center gap-1.5">
                <ImageIcon size={14} className="text-[#c5a66a]" /> Artifact Photos (Upload Multiple Photos)
              </label>
              {photos.length > 0 && (
                <span className="text-[11px] font-mono text-[#a39e93]">
                  {photos.length} {photos.length === 1 ? 'photo' : 'photos'} added
                </span>
              )}
            </div>

            {/* Hidden Multiple File Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleMultipleFilesChange}
              accept="image/*"
              multiple
              className="hidden"
            />

            {/* Photos Grid Display */}
            {photos.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {photos.map((photo, idx) => {
                  const isPrimary = idx === primaryPhotoIndex;
                  return (
                    <div
                      key={photo.id || idx}
                      onClick={() => setPrimaryPhotoIndex(idx)}
                      className={`relative rounded-xl overflow-hidden aspect-square border-2 transition-all cursor-pointer group ${
                        isPrimary
                          ? 'border-[#c5a66a] shadow-lg shadow-[#c5a66a]/20'
                          : 'border-[#333] hover:border-[#666]'
                      }`}
                    >
                      <img
                        src={photo.url}
                        alt={`Photo ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />

                      {/* Primary Cover Badge */}
                      {isPrimary ? (
                        <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded text-[9px] font-black uppercase bg-[#c5a66a] text-black flex items-center gap-1 shadow">
                          <Star size={10} fill="currentColor" /> Cover
                        </span>
                      ) : (
                        <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase bg-black/70 text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity">
                          Set Cover
                        </span>
                      )}

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemovePhoto(idx);
                        }}
                        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-600/90 hover:bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove photo"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  );
                })}

                {/* Add More Photos Box */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-xl border-2 border-dashed border-[#444] hover:border-[#c5a66a] flex flex-col items-center justify-center aspect-square text-center p-2 cursor-pointer bg-[#141210] transition-colors"
                >
                  <Plus size={20} className="text-[#c5a66a] mb-1" />
                  <span className="text-[11px] font-bold text-white">Add Photo</span>
                </div>
              </div>
            )}

            {/* Initial Big Browse Box if no photos added yet */}
            {photos.length === 0 && (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[#38342e] hover:border-[#c5a66a] rounded-xl p-5 text-center cursor-pointer bg-[#141210] transition-colors group"
              >
                <div className="w-10 h-10 mx-auto rounded-full bg-[#1e1c18] border border-[#333] group-hover:border-[#c5a66a] flex items-center justify-center text-[#c5a66a] mb-2">
                  <Upload size={18} />
                </div>
                <span className="text-xs font-bold text-white block">
                  Click to Browse & Upload Photos from Device
                </span>
                <span className="text-[11px] text-[#8e8a83] block mt-0.5">
                  Select one or multiple photos (JPG, PNG, WEBP)
                </span>
              </div>
            )}

            {/* Optional: Add photo via URL */}
            <div className="pt-1 flex items-center justify-between text-[11px]">
              <button
                type="button"
                onClick={() => setShowUrlInput(!showUrlInput)}
                className="text-[#888] hover:text-white underline cursor-pointer"
              >
                {showUrlInput ? 'Hide image URL input' : '+ Add photo via image URL'}
              </button>
            </div>

            {showUrlInput && (
              <div className="flex gap-2 mt-2">
                <input
                  type="url"
                  value={pastedUrl}
                  onChange={(e) => setPastedUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="flex-1 bg-[#141210] border border-[#333] focus:border-[#c5a66a] rounded-xl p-2.5 text-xs text-white focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddPhotoUrl}
                  className="px-3 py-2 bg-[#c5a66a] hover:bg-[#dfbe7d] text-black font-bold text-xs rounded-xl"
                >
                  Add URL
                </button>
              </div>
            )}
          </div>

          {/* 4. Description & Provenance Details */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#a39e93] mb-1">
              Artifact Description & Provenance
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Artifact Description & Provenance"
              className="w-full bg-[#0c0b0a] border border-[#333] focus:border-[#c5a66a] rounded-xl p-3 text-xs text-white focus:outline-none"
            />
          </div>

          {/* 5. Pricing Inputs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#a39e93] mb-1">
                Starting Price (₹) *
              </label>
              <input
                type="number"
                min="1"
                placeholder="1200"
                value={startingPrice}
                onChange={(e) => setStartingPrice(e.target.value)}
                className="w-full bg-[#0c0b0a] border border-[#333] focus:border-[#c5a66a] rounded-xl p-3 font-mono font-bold text-xs text-white focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#a39e93] mb-1">
                Min Increment (₹) *
              </label>
              <input
                type="number"
                min="1"
                placeholder="50"
                value={minIncrement}
                onChange={(e) => setMinIncrement(e.target.value)}
                className="w-full bg-[#0c0b0a] border border-[#333] focus:border-[#c5a66a] rounded-xl p-3 font-mono font-bold text-xs text-white focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#a39e93] mb-1">
                Reserve Price (₹)
              </label>
              <input
                type="number"
                placeholder="Optional"
                value={reservePrice}
                onChange={(e) => setReservePrice(e.target.value)}
                className="w-full bg-[#0c0b0a] border border-[#333] focus:border-[#c5a66a] rounded-xl p-3 font-mono text-xs text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#a39e93] mb-1">
                Buy Now (₹)
              </label>
              <input
                type="number"
                placeholder="Optional"
                value={buyNowPrice}
                onChange={(e) => setBuyNowPrice(e.target.value)}
                className="w-full bg-[#0c0b0a] border border-[#333] focus:border-[#c5a66a] rounded-xl p-3 font-mono text-xs text-white focus:outline-none"
              />
            </div>
          </div>

          {/* 6. Auction Duration */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#a39e93] mb-1.5 flex items-center gap-1.5">
              <Clock size={13} className="text-[#c5a66a]" /> Auction Duration (Server-Authoritative)
            </label>
            <div className="grid grid-cols-4 gap-2 mb-2">
              {[
                { hours: '1', label: '1 Hour (Flash)' },
                { hours: '24', label: '24 Hours (1 Day)' },
                { hours: '72', label: '3 Days' },
                { hours: '168', label: '7 Days' }
              ].map((d) => (
                <button
                  key={d.hours}
                  type="button"
                  onClick={() => { setDurationHours(d.hours); setCustomDurationHours(''); }}
                  className={`py-2 px-1 text-center rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                    durationHours === d.hours && !customDurationHours
                      ? 'bg-[#c5a66a] text-[#121212] border-[#c5a66a]'
                      : 'bg-[#0e0d0c] border-[#2c2824] text-[#8e8a83] hover:text-white'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-[#8e8a83]">Or enter custom hours:</span>
              <input
                type="number"
                min="1"
                max="720"
                placeholder="12"
                value={customDurationHours}
                onChange={(e) => setCustomDurationHours(e.target.value)}
                className="w-24 bg-[#0c0b0a] border border-[#333] focus:border-[#c5a66a] rounded-lg p-1.5 text-xs text-white font-mono"
              />
              <span className="text-[11px] text-[#8e8a83]">hours</span>
            </div>
          </div>

          {/* 7. Publish Live Immediately Toggle */}
          <div className="flex items-center gap-2 p-3 rounded-xl bg-[#0e0d0c] border border-[#2a2622]">
            <input
              type="checkbox"
              id="publish_live_checkbox"
              checked={publishImmediately}
              onChange={(e) => setPublishImmediately(e.target.checked)}
              className="w-4 h-4 rounded cursor-pointer accent-[#c5a66a]"
            />
            <label htmlFor="publish_live_checkbox" className="text-xs font-semibold text-white cursor-pointer">
              Launch Live Immediately (Bidders can start placing bids right away)
            </label>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-700 text-red-200 text-xs flex items-center gap-2.5">
              <AlertCircle size={16} className="shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-[#c5a66a] via-[#dfbe7d] to-[#c5a66a] hover:opacity-95 text-[#121212] font-black text-xs uppercase tracking-wider py-3.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
            >
              <Gavel size={16} />
              {submitting ? 'Publishing Live Auction...' : 'Launch Live Auction to Collectors'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
