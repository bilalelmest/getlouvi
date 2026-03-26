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
  form_mode: "b2b" | "b2c" | null;
}

export interface Testimonial {
  id: string;
  owner_id: string;
  author_name: string;
  author_role: string | null;
  author_company: string | null;
  author_photo_url: string | null;
  rating: number;
  content: string;
  status: "pending" | "approved" | "rejected";
  tag: string | null;
  gdpr_consent: boolean;
  created_at: string;
}

export type WidgetStyle = "grid" | "carousel" | "list" | "badge";

export const PLAN_LIMITS: Record<string, {
  testimonials: number;
  label: string;
  widgets: WidgetStyle[];
  darkTheme: boolean;
}> = {
  trial: { testimonials: 10, label: "Essai gratuit", widgets: ["grid", "list"], darkTheme: false },
  starter: { testimonials: 50, label: "Starter", widgets: ["grid", "list"], darkTheme: false },
  pro: { testimonials: 500, label: "Pro", widgets: ["grid", "carousel", "list", "badge"], darkTheme: true },
  business: { testimonials: 999999, label: "Business", widgets: ["grid", "carousel", "list", "badge"], darkTheme: true },
};
