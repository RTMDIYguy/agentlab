import { useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import { trpc } from "@/lib/trpc";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const starterMessage =
  "Hi, I’m the Founder Intake Agent. I can help you find the right next step, usually a Founder Roundtable or a Business Systems Diagnostic. What’s the biggest thing slowing your business down right now?";

export function LiveChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: starterMessage },
  ]);
  const [draft, setDraft] = useState("");
  const [lead, setLead] = useState({
    name: "",
    email: "",
    company: "",
    painPoint: "",
    interest: "",
  });
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [captureStatus, setCaptureStatus] = useState<"idle" | "saved">("idle");

  const respondMutation = trpc.founderIntake.respond.useMutation();
  const captureLeadMutation = trpc.founderIntake.captureLead.useMutation();

  const sendMessage = async () => {
    const content = draft.trim();
    if (!content || respondMutation.isPending) return;

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content }];
    setMessages(nextMessages);
    setDraft("");

    const nextLead = {
      ...lead,
      painPoint: lead.painPoint || content,
    };

    try {
      const response = await respondMutation.mutateAsync({
        messages: nextMessages,
        lead: nextLead,
      });

      setLead(current => ({
        ...current,
        painPoint: current.painPoint || response.collected.painPoint || content,
        interest: response.collected.interest || current.interest,
      }));

      setMessages(current => [
        ...current,
        { role: "assistant", content: response.reply },
      ]);

      if (response.shouldCaptureLead) {
        setShowLeadForm(true);
      }
    } catch (error) {
      console.error("[Founder Intake Chat] Failed to get response", error);
      setMessages(current => [
        ...current,
        {
          role: "assistant",
          content:
            "I hit a snag, but I can still help. Tell me your name, email, and the biggest thing slowing your business down, and I’ll make sure you get routed to the right next step.",
        },
      ]);
      setShowLeadForm(true);
    }
  };

  const submitLead = async () => {
    if (!lead.name.trim() || !lead.email.trim() || captureLeadMutation.isPending) {
      return;
    }

    try {
      await captureLeadMutation.mutateAsync({
        name: lead.name.trim(),
        email: lead.email.trim(),
        company: lead.company.trim() || undefined,
        painPoint: lead.painPoint.trim() || undefined,
        interest: lead.interest.trim() || undefined,
      });

      setCaptureStatus("saved");
      setMessages(current => [
        ...current,
        {
          role: "assistant",
          content:
            "You’re in. I’ve captured your info and you can now follow up with a Founder Roundtable invite or a Business Systems Diagnostic, depending on fit.",
        },
      ]);
    } catch (error) {
      console.error("[Founder Intake Chat] Failed to capture lead", error);
      setMessages(current => [
        ...current,
        {
          role: "assistant",
          content:
            "I couldn’t save that just yet. You can still use the contact form, or try again in a moment.",
        },
      ]);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex max-w-[calc(100vw-2rem)] flex-col items-end gap-3">
      {isOpen ? (
        <div className="w-[360px] max-w-full overflow-hidden rounded-2xl border border-stone-300 bg-white shadow-2xl">
          <div className="flex items-center justify-between bg-stone-950 px-4 py-3 text-stone-50">
            <div>
              <div className="text-sm font-semibold">Founder Intake Agent</div>
              <div className="text-xs text-stone-300">
                Simplify your stack and find the right path into Ownable OS
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-full p-1 text-stone-200 transition hover:bg-stone-800 hover:text-white"
              aria-label="Close founder intake chat"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="max-h-[420px] space-y-3 overflow-y-auto bg-stone-50 p-4">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-6 ${
                  message.role === "assistant"
                    ? "bg-white text-stone-900 shadow-sm"
                    : "ml-auto bg-stone-950 text-white"
                }`}
              >
                {message.content}
              </div>
            ))}

            {showLeadForm ? (
              <div className="space-y-2 rounded-2xl border border-stone-200 bg-white p-3 shadow-sm">
                <div className="text-sm font-semibold text-stone-900">Get the next step</div>
                <input
                  value={lead.name}
                  onChange={event => setLead(current => ({ ...current, name: event.target.value }))}
                  placeholder="Your name"
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none transition focus:border-stone-950"
                />
                <input
                  value={lead.email}
                  onChange={event => setLead(current => ({ ...current, email: event.target.value }))}
                  placeholder="Email address"
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none transition focus:border-stone-950"
                />
                <input
                  value={lead.company}
                  onChange={event => setLead(current => ({ ...current, company: event.target.value }))}
                  placeholder="Company (optional)"
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none transition focus:border-stone-950"
                />
                <button
                  type="button"
                  onClick={submitLead}
                  disabled={captureLeadMutation.isPending || captureStatus === "saved"}
                  className="w-full rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
                >
                  {captureStatus === "saved"
                    ? "Captured"
                    : captureLeadMutation.isPending
                      ? "Saving..."
                      : "Send my details"}
                </button>
              </div>
            ) : null}
          </div>

          <div className="border-t border-stone-200 bg-white p-3">
            <div className="mb-2 flex flex-wrap gap-2">
              {["Founder Roundtable", "Business Systems Diagnostic", "Ownable OS"].map(option => (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    setDraft(option);
                    setLead(current => ({ ...current, interest: option }));
                  }}
                  className="rounded-full border border-stone-300 px-3 py-1 text-xs text-stone-700 transition hover:border-stone-950 hover:text-stone-950"
                >
                  {option}
                </button>
              ))}
            </div>

            <div className="flex items-end gap-2">
              <textarea
                value={draft}
                onChange={event => setDraft(event.target.value)}
                placeholder="Tell me what’s slowing the business down..."
                rows={2}
                className="min-h-[56px] flex-1 resize-none rounded-xl border border-stone-300 px-3 py-2 text-sm outline-none transition focus:border-stone-950"
              />
              <button
                type="button"
                onClick={sendMessage}
                disabled={respondMutation.isPending}
                className="rounded-xl bg-stone-950 p-3 text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-400"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setIsOpen(current => !current)}
        className="flex items-center gap-2 rounded-full bg-stone-950 px-4 py-3 text-sm font-medium text-white shadow-xl transition hover:bg-stone-800"
      >
        <MessageCircle className="h-4 w-4" />
        Founder Intake
      </button>
    </div>
  );
}

export default LiveChat;
