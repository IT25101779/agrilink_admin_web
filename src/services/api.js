// Points to the permanently hosted backend on Vercel — same live backend
// the farmer mobile app uses (see agrilink_mobile/lib/services/api_service.dart).
// If you're doing local backend development and want this portal to hit
// your own machine instead, comment the line below out and uncomment the
// localhost one — just remember to switch it back before deploying/demoing.
export const BASE_URL = "https://agrilink-backend.vercel.app/api";
// export const BASE_URL = "http://localhost:5000/api";

async function handleResponse(response) {
  try {
    return await response.json();
  } catch {
    return { success: false, message: `Server returned status ${response.status}.` };
  }
}

function authHeaders(token) {
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

export const api = {
  async register({ fullName, email, phone, password }) {
    const response = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName, email, phone, password, role: "admin" }),
    });
    return handleResponse(response);
  },

  async login({ email, password }) {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(response);
  },

  async getMetrics(token) {
    const response = await fetch(`${BASE_URL}/admin/metrics`, { headers: authHeaders(token) });
    return handleResponse(response);
  },

  async getImpact(token) {
    const response = await fetch(`${BASE_URL}/admin/impact`, { headers: authHeaders(token) });
    return handleResponse(response);
  },

  // ---- Group-chat moderation (admin only) ----
  async getChatStats(token) {
    const response = await fetch(`${BASE_URL}/admin/chat/stats`, { headers: authHeaders(token) });
    return handleResponse(response);
  },

  async getChatReports(token, status = "open") {
    const response = await fetch(`${BASE_URL}/admin/chat/reports?status=${status}`, { headers: authHeaders(token) });
    return handleResponse(response);
  },

  async removeChatMessage(token, messageId, reason = "removed_by_admin") {
    const response = await fetch(`${BASE_URL}/admin/chat/messages/remove`, {
      method: "POST",
      headers: { ...authHeaders(token), "Content-Type": "application/json" },
      body: JSON.stringify({ messageId, reason }),
    });
    return handleResponse(response);
  },

  async restoreChatMessage(token, messageId) {
    const response = await fetch(`${BASE_URL}/admin/chat/messages/restore`, {
      method: "POST",
      headers: { ...authHeaders(token), "Content-Type": "application/json" },
      body: JSON.stringify({ messageId }),
    });
    return handleResponse(response);
  },

  async banChatUser(token, userId, days, unban = false) {
    const response = await fetch(`${BASE_URL}/admin/chat/ban`, {
      method: "POST",
      headers: { ...authHeaders(token), "Content-Type": "application/json" },
      body: JSON.stringify({ userId, days, unban }),
    });
    return handleResponse(response);
  },

  /** Photos are private, so they are fetched with the admin token and shown from a temporary local URL. */
  async fetchChatMedia(token, mediaId) {
    const response = await fetch(`${BASE_URL}/admin/chat/media/${mediaId}`, { headers: authHeaders(token) });
    if (!response.ok) return null;
    return URL.createObjectURL(await response.blob());
  },

  async getMarketHeatmap(token) {
    const response = await fetch(`${BASE_URL}/admin/market-heatmap`, { headers: authHeaders(token) });
    return handleResponse(response);
  },

  async getAllListings() {
    const response = await fetch(`${BASE_URL}/marketplace/listings`);
    return handleResponse(response);
  },

  async getAds() {
    const response = await fetch(`${BASE_URL}/ads`);
    return handleResponse(response);
  },

  async createAd(token, adData) {
    const response = await fetch(`${BASE_URL}/ads`, {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify(adData),
    });
    return handleResponse(response);
  },

  async updateAd(token, id, updates) {
    const response = await fetch(`${BASE_URL}/ads/${id}`, {
      method: "PATCH",
      headers: authHeaders(token),
      body: JSON.stringify(updates),
    });
    return handleResponse(response);
  },

  async deleteAd(token, id) {
    const response = await fetch(`${BASE_URL}/ads/${id}`, {
      method: "DELETE",
      headers: authHeaders(token),
    });
    return handleResponse(response);
  },

  // ---- Suppliers (business listings — seed/fertilizer/tool stores, equipment rental) ----
  // Backend CRUD already existed (controllers/supplierController.js); this
  // was the missing piece — no admin UI ever called it, so suppliers could
  // only be added via the seed script or raw API calls (per the backend
  // README's own "not built yet" note).

  async getAllSuppliers(token) {
    const response = await fetch(`${BASE_URL}/suppliers`, { headers: authHeaders(token) });
    return handleResponse(response);
  },

  async createSupplier(token, supplierData) {
    const response = await fetch(`${BASE_URL}/suppliers`, {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify(supplierData),
    });
    return handleResponse(response);
  },

  async updateSupplier(token, id, updates) {
    const response = await fetch(`${BASE_URL}/suppliers/${id}`, {
      method: "PATCH",
      headers: authHeaders(token),
      body: JSON.stringify(updates),
    });
    return handleResponse(response);
  },

  async deleteSupplier(token, id) {
    const response = await fetch(`${BASE_URL}/suppliers/${id}`, {
      method: "DELETE",
      headers: authHeaders(token),
    });
    return handleResponse(response);
  },

  // ---- Community Listings (farmer-posted rentals & seeds) — moderation only ----
  // Farmers create/edit/delete their own via the mobile app; admin's role
  // here is purely oversight — viewing everything and removing anything
  // inappropriate or spam, same pattern as Marketplace Oversight.

  async getAllCommunityListings(token) {
    const response = await fetch(`${BASE_URL}/community-listings`, { headers: authHeaders(token) });
    return handleResponse(response);
  },

  async adminDeleteCommunityListing(token, id) {
    const response = await fetch(`${BASE_URL}/community-listings/${id}/admin`, {
      method: "DELETE",
      headers: authHeaders(token),
    });
    return handleResponse(response);
  },
};
