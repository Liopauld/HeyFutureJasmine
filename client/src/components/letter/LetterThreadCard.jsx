import { Link } from "react-router-dom";
import { History, ArrowRight } from "lucide-react";
import { formatDate } from "../../lib/dates.js";

export function LetterThreadCard({ replyTo }) {
  if (!replyTo) return null;

  const senderName = replyTo.senderInfo?.displayName || replyTo.senderInfo?.username || "A nakama";

  return (
    <div className="mb-6 rounded-2xl border border-amber-900/20 bg-ink/5 p-4 text-ink shadow-inner">
      <div className="flex items-center gap-2 mb-2 text-xs font-display font-bold uppercase tracking-wider text-amber-800">
        <History className="w-3.5 h-3.5" />
        <span>In Reply to Capsule from {senderName}</span>
      </div>

      <div className="flex items-center justify-between">
        <div className="min-w-0 flex-1 pr-3">
          <p className="font-display font-bold text-sm text-ink truncate">
            {replyTo.subject || "Sealed Memory"}
          </p>
          <p className="text-[11px] text-ink/60">
            Delivered {formatDate(replyTo.deliveredAt || replyTo.deliveryDate)}
          </p>
        </div>

        <Link
          to={`/treasure/${replyTo._id}`}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-ink/10 hover:bg-ink/20 text-ink text-xs font-medium transition shrink-0"
        >
          <span>View Letter</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}

export default LetterThreadCard;
