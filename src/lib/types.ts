export interface Profile {
  id: string;
  company_name: string;
  website: string | null;
  plan: string;
  collect_link_id: string;
  created_at: string;
}

export interface Testimonial {
  id: string;
  owner_id: string;
  author_name: string;
  author_role: string | null;
  author_company: string | null;
  rating: number;
  content: string;
  status: "pending" | "approved" | "rejected";
  tag: string | null;
  created_at: string;
}
