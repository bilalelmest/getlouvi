export interface Profile {
  id: string;
  company_name: string;
  website: string | null;
  plan: "trial" | "starter" | "pro" | "business";
  trial_ends_at: string;
  collect_link_id: string;
  created_at: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
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

export const PLAN_LIMITS: Record<string, { testimonials: number; label: string }> = {
  trial: { testimonials: 10, label: "Essai gratuit" },
  starter: { testimonials: 50, label: "Starter" },
  pro: { testimonials: 500, label: "Pro" },
  business: { testimonials: 999999, label: "Business" },
};
