import { Link } from "react-router-dom";
import { Trash2, ArrowRight, Pencil } from "lucide-react";
import TreasureChest from "./TreasureChest.jsx";
import GrandLineRoute from "./GrandLineRoute.jsx";
import { countdownLabel, progressBetween, daysBetween, formatDate } from "../../lib/dates.js";

export default function LetterCard({ letter, userId, email, onDelete }) {
  const isSender = String(letter.sender) === String(userId);
  const isRecipient = letter.recipientEmail?.toLowerCase() === String(email || "").toLowerCase();
  const delivered = letter.status === "delivered";
  const unopened = delivered && isRecipient && !letter.openedAt;
  const openingSoon = !delivered && daysBetween(Date.now(), letter.deliveryDate) <= 7;

  const direction =
    letter.letterType === "self"
      ? "To your future self"
      : letter.letterType === "us"
        ? "Between you two"
        : isSender
          ? `To ${letter.recipientName || "your partner"}`
          : `From ${letter.senderInfo?.displayName || "your crew"}`;

  // The sender can reopen or abandon a chest until 24h before it lands.
  const canModify =
    isSender && !delivered && new Date(letter.deliveryDate) - Date.now() > 24 * 60 * 60 * 1000;

  const Wrapper = delivered
    ? ({ children }) => (
        <Link to={`/treasure/${letter._id}`} className="block">
          {children}
        </Link>
      )
    : ({ children }) => <div>{children}</div>;

  return (
    <div className="relative">
      {unopened ? (
        <span className="absolute -right-2 -top-2 z-10 rounded-full bg-straw-red px-2 py-0.5 text-[11px] font-semibold text-white shadow">
          New treasure!
        </span>
      ) : null}
      <Wrapper>
        <article
          className={`group h-full rounded-2xl border p-4 transition ${
            delivered
              ? "cursor-pointer border-grand-line bg-deep-sea/60 hover:border-gold hover:shadow-glow"
              : "border-grand-line bg-deep-sea/40"
          }`}
        >
          <div className="flex items-start gap-3">
            <TreasureChest
              theme={letter.capsuleTheme}
              opened={delivered}
              glow={openingSoon || unopened}
              size={56}
            />
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-lg text-text-primary">{letter.subject}</p>
              <p className="text-xs text-text-muted">{direction}</p>
            </div>
          </div>

          <div className="mt-4">
            {delivered ? (
              <div className="flex items-center justify-between text-sm">
                <span className="text-delivered">Washed ashore</span>
                <span className="text-text-muted">
                  {formatDate(letter.deliveredAt || letter.deliveryDate)}
                </span>
              </div>
            ) : (
              <GrandLineRoute
                progress={progressBetween(letter.sentAt || letter.createdAt, letter.deliveryDate)}
                label={countdownLabel(letter.deliveryDate)}
              />
            )}
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-grand-line/60 pt-3">
            {delivered ? (
              <span className="flex items-center gap-1 text-sm text-gold transition-all group-hover:gap-2">
                Open the chest <ArrowRight className="h-4 w-4" />
              </span>
            ) : (
              <span className="text-xs uppercase tracking-wider text-sealed">Sailing</span>
            )}
            {canModify ? (
              <div className="flex items-center gap-1">
                <Link
                  to={`/write/${letter._id}/edit`}
                  className="rounded-full p-1.5 text-text-muted transition hover:text-gold"
                  aria-label="Reopen this chest"
                >
                  <Pencil className="h-4 w-4" />
                </Link>
                {onDelete ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      onDelete(letter);
                    }}
                    className="rounded-full p-1.5 text-text-muted transition hover:text-straw-red"
                    aria-label="Send to Davy Jones"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>
        </article>
      </Wrapper>
    </div>
  );
}
