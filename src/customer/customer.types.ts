export type Gender = 'male' | 'female' | 'other';

export interface CustomerProfile {
  fullName: string;
  email: string;
  phone: string;
  gender: Gender;
  fileName?: string;
}
