import { Testimonial } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import Avatar from "./Avatar";
import StarRating from "./StarRating";

interface TestimonialCardProps {
  testimonial: Testimonial;
  showStatus?: boolean;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
}

export default function TestimonialCard({
  testimonial,
  showStatus = false,
  onApprove,
  onReject,
}: TestimonialCardProps) {
  const statusBadge = {
    pending: { label: "En attente", className: "bg-yellow-100 text-yellow-800" },
    approved: { label: "Approuvé", className: "bg-green-100 text-green-800" },
    rejected: { label: "Refusé", className: "bg-red-100 text-red-800" },
  };

  return (
    <div className="bg-white rounded-xl border border-stone-200 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start gap-3 mb-3">
        <Avatar name={testimonial.author_name} photoUrl={testimonial.author_photo_url} />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-stone-950 truncate">
            {testimonial.author_name}
          </p>
          <p className="text-sm text-stone-600 truncate">
            {[testimonial.author_role, testimonial.author_company]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
        {showStatus && (
          <span
            className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusBadge[testimonial.status].className}`}
          >
            {statusBadge[testimonial.status].label}
          </span>
        )}
      </div>

      <StarRating rating={testimonial.rating} size="sm" />

      <p className="mt-3 text-stone-700 text-sm leading-relaxed">
        {testimonial.content}
      </p>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs text-stone-400">
            {formatDate(testimonial.created_at)}
          </span>
          {testimonial.source === "google" && (
            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
              <svg className="w-3 h-3" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </span>
          )}
        </div>

        {(onApprove || onReject) && testimonial.status === "pending" && (
          <div className="flex gap-2">
            {onApprove && (
              <button
                onClick={() => onApprove(testimonial.id)}
                className="text-xs px-3 py-1.5 rounded-lg bg-success text-white hover:bg-green-700 transition-colors duration-200"
              >
                Approuver
              </button>
            )}
            {onReject && (
              <button
                onClick={() => onReject(testimonial.id)}
                className="text-xs px-3 py-1.5 rounded-lg bg-danger text-white hover:bg-red-700 transition-colors duration-200"
              >
                Refuser
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
