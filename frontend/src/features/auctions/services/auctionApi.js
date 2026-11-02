const API_BASE = 'http://127.0.0.1:8001/api/v1';

function getAuthHeaders() {
  const token = localStorage.getItem('kaarvo_access_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

export const auctionApi = {
  // 1. Public / Marketplace auctions
  async getAuctions(params = {}) {
    const query = new URLSearchParams();
    if (params.category && params.category !== 'All') query.append('category', params.category);
    if (params.search) query.append('search', params.search);
    if (params.min_price) query.append('min_price', params.min_price);
    if (params.max_price) query.append('max_price', params.max_price);
    if (params.sort_by) query.append('sort_by', params.sort_by);
    if (params.status) query.append('status', params.status);
    if (params.ending_soon) query.append('ending_soon', 'true');

    const qs = query.toString() ? `?${query.toString()}` : '';
    let res = await fetch(`${API_BASE}/auctions/${qs}`, {
      headers: getAuthHeaders()
    });

    // If 401 occurs (e.g. expired access token in localStorage), retry cleanly without invalid Authorization header
    if (res.status === 401) {
      res = await fetch(`${API_BASE}/auctions/${qs}`, {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!res.ok) throw new Error('Failed to fetch auctions');
    return res.json();
  },

  // 2. Single auction details with bids
  async getAuction(id) {
    let res = await fetch(`${API_BASE}/auctions/${id}/`, {
      headers: getAuthHeaders()
    });

    if (res.status === 401) {
      res = await fetch(`${API_BASE}/auctions/${id}/`, {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!res.ok) throw new Error('Failed to fetch auction details');
    return res.json();
  },

  // 3. Place bid with row-locking concurrency
  async placeBid(auctionId, amount, idempotencyKey = null) {
    const body = {
      amount: parseFloat(amount),
      idempotency_key: idempotencyKey || `bid_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    };
    const res = await fetch(`${API_BASE}/auctions/${auctionId}/bids/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || data.amount?.[0] || 'Failed to place bid');
    }
    return data;
  },

  // 4. Create new auction listing (Seller)
  async createAuction(payload) {
    const res = await fetch(`${API_BASE}/auctions/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    const data = await res.json().catch(() => ({}));
    if (res.status === 401) {
      throw new Error('Your session has expired. Please log in again to launch live auctions.');
    }
    if (!res.ok) {
      throw new Error(data.detail || Object.values(data)[0]?.[0] || 'Failed to create auction');
    }
    return data;
  },

  // 5. Publish auction
  async publishAuction(auctionId) {
    const res = await fetch(`${API_BASE}/auctions/${auctionId}/publish/`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Failed to publish auction');
    return data;
  },

  // 6. Cancel auction
  async cancelAuction(auctionId, reason = '') {
    const res = await fetch(`${API_BASE}/auctions/${auctionId}/cancel/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ reason })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Failed to cancel auction');
    return data;
  },

  // 6b. Delete auction (Strictly seller only)
  async deleteAuction(auctionId) {
    const res = await fetch(`${API_BASE}/auctions/${auctionId}/`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.detail || 'Failed to delete auction');
    return data;
  },

  // 7. Watchlist toggle
  async toggleWatchlist(auctionId, currentlyWatched) {
    const method = currentlyWatched ? 'DELETE' : 'POST';
    const res = await fetch(`${API_BASE}/auctions/${auctionId}/watchlist/`, {
      method,
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to update watchlist');
    return res.json();
  },

  async getWatchlist() {
    const res = await fetch(`${API_BASE}/auction-watchlist/`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch watchlist');
    return res.json();
  },

  // 8. Buyer Dashboards
  async getMyBids() {
    const res = await fetch(`${API_BASE}/my-bids/`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch bids');
    return res.json();
  },

  async getMyWonAuctions() {
    const res = await fetch(`${API_BASE}/my-won-auctions/`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch won auctions');
    return res.json();
  },

  // 9. Seller Dashboard
  async getMyAuctions() {
    const res = await fetch(`${API_BASE}/my-auctions/`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch seller auctions');
    return res.json();
  },

  // 10. Winner Payment Checkout
  async payAuction(auctionId, payload) {
    const res = await fetch(`${API_BASE}/auctions/${auctionId}/pay/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Payment failed');
    return data;
  },

  // 11. In-App Notifications
  async getNotifications() {
    const res = await fetch(`${API_BASE}/auction-notifications/`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch notifications');
    return res.json();
  },

  async markNotificationRead(id) {
    const res = await fetch(`${API_BASE}/auction-notifications/${id}/read/`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return res.json();
  }
};

