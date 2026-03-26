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
        <Avatar name={testimonial.author_name} />
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
        <span className="text-xs text-stone-400">
          {formatDate(testimonial.created_at)}
        </span>

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
