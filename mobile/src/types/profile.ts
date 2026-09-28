export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  phone_number: string;
  address: string;
  business_name?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateProfilePayload {
  full_name: string;
  phone_number: string;
  address: string;
  business_name?: string | null;
}

export interface UpdateProfilePayload {
  full_name?: string;
  phone_number?: string;
  address?: string;
  business_name?: string | null;
}
