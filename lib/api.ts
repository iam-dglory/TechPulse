// lib/api.ts
export const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? '';
export const companiesList = async (params = '') => {
  const res = await fetch(`${API_BASE}/api/companies${params}`, { credentials: 'include' });
  return res.json();
};
