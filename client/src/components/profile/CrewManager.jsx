import { useState } from "react";
import { toast } from "sonner";
import { Users, Plus, Trash2, Mail, User } from "lucide-react";
import { useCrew, useAddCrewMember, useRemoveCrewMember } from "../../hooks/useUser.js";

export function CrewManager() {
  const { data: crewMembers = [], isLoading } = useCrew();
  const addCrew = useAddCrewMember();
  const removeCrew = useRemoveCrewMember();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    try {
      await addCrew.mutateAsync({ name: name.trim(), email: email.trim() });
      toast.success(`⚓ ${name.trim() || email.trim()} welcomed to your crew!`);
      setName("");
      setEmail("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't add crew member.");
    }
  };

  const handleRemove = async (id, memberName) => {
    try {
      await removeCrew.mutateAsync(id);
      toast.success(`${memberName || "Crew member"} removed from your logbook.`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't remove crew member.");
    }
  };

  return (
    <div className="space-y-4 rounded-3xl border border-grand-line bg-deep-sea/50 p-6 shadow-xl text-sand">
      <div className="flex items-center gap-2 border-b border-white/10 pb-4">
        <Users className="h-5 w-5 text-gold" />
        <h3 className="font-display text-xl text-gold">Crew Logbook & Address Book</h3>
      </div>

      <p className="text-xs text-sand-dim">
        Save frequent nakama contacts to quickly dispatch time capsules without typing email addresses.
      </p>

      {/* Add Form */}
      <form onSubmit={handleAdd} className="flex flex-col sm:flex-row items-center gap-3 p-3.5 rounded-2xl bg-ocean-abyss/80 border border-white/10">
        <div className="relative flex-1 w-full">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sand-dim" />
          <input
            type="text"
            placeholder="Nakama Name (e.g. Zoro)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-surface-elevated/40 border border-white/10 text-xs text-sand placeholder:text-sand-dim/50 focus:border-gold focus:outline-none"
          />
        </div>
        <div className="relative flex-1 w-full">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sand-dim" />
          <input
            type="email"
            placeholder="Email address *"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-surface-elevated/40 border border-white/10 text-xs text-sand placeholder:text-sand-dim/50 focus:border-gold focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={addCrew.isPending || !email.trim()}
          className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-ocean-abyss text-xs font-bold font-display tracking-wider transition-all disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          <span>Add Nakama</span>
        </button>
      </form>

      {/* Crew List */}
      <div className="space-y-2 pt-2">
        {crewMembers.length > 0 ? (
          <div className="grid gap-2 sm:grid-cols-2">
            {crewMembers.map((member) => (
              <div
                key={member._id}
                className="flex items-center justify-between p-3 rounded-2xl bg-ocean-abyss/40 border border-white/5 hover:border-amber-500/30 transition-all"
              >
                <div className="min-w-0 flex-1 pr-2">
                  <p className="font-display text-sm text-sand truncate">
                    {member.name || "Unnamed Nakama"}
                  </p>
                  <p className="text-[11px] font-mono text-sand-dim truncate">{member.email}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemove(member._id, member.name || member.email)}
                  disabled={removeCrew.isPending}
                  className="p-2 rounded-lg hover:bg-straw-red/20 text-sand-dim hover:text-straw-red transition-all"
                  title="Remove from Crew"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-sand-dim text-xs">
            {isLoading ? "Consulting logbook..." : "No crew members registered yet. Add your first nakama above!"}
          </div>
        )}
      </div>
    </div>
  );
}

export default CrewManager;
