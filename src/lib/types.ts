export type UserRole = 'owner' | 'specialist' | 'admin';
export type SpecialistStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'blocked';
export type RequestStatus = 'created' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'cancelled' | 'completed';
export type ConversationType = 'request' | 'walk' | 'direct' | 'support';

export type Profile = {
  id: string;
  email: string | null;
  role: UserRole;
  full_name: string | null;
  avatar_url: string | null;
  city: string | null;
  district: string | null;
  created_at: string;
};

export type DogProfile = {
  id: string;
  owner_id: string;
  name: string;
  breed: string | null;
  age_months: number | null;
  sex: string | null;
  weight: number | null;
  size: string | null;
  activity_level: string | null;
  city: string | null;
  district: string | null;
  description: string | null;
  photo_url: string | null;
  created_at: string;
};

export type SpecialistProfile = {
  id: string;
  user_id: string;
  public_name: string;
  city: string;
  districts: string[] | null;
  experience_years: number | null;
  education: string | null;
  description: string | null;
  methods: string | null;
  price_from: number | null;
  price_to: number | null;
  works_online: boolean;
  works_offline: boolean;
  verification_status: SpecialistStatus;
  rating: number | null;
  reviews_count: number | null;
  created_at: string;
  specializations?: { specialization_type: string }[];
};

export type OwnerRequest = {
  id: string;
  owner_id: string;
  dog_id: string;
  specialist_id: string;
  problem_type: string;
  description: string | null;
  preferred_format: string | null;
  city: string | null;
  district: string | null;
  budget: number | null;
  status: RequestStatus;
  created_at: string;
};

export type Conversation = {
  id: string;
  type: ConversationType;
  title: string | null;
  owner_request_id: string | null;
  walk_id: string | null;
  created_at: string;
};

export type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  created_at: string;
};
