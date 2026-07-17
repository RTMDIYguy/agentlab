import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Plus,
  Pencil,
  Trash2,
  Calendar,
  MapPin,
  Users,
  X,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const eventSchema = z.object({
  title: z.string().min(1, "Title required"),
  date: z.string().min(1, "Date required"),
  time: z.string().optional(),
  location: z.string().optional(),
  description: z.string().optional(),
  capacity: z.coerce.number().int().positive().optional(),
  status: z.enum(["upcoming", "draft", "cancelled", "completed"]),
  rsvp_link: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

type EventFormInput = z.input<typeof eventSchema>;
type EventForm = z.output<typeof eventSchema>;

interface ChapterEvent extends EventForm {
  id: string;
  created_at: string;
  attendees: number;
}

const STATUS_COLORS: Record<string, string> = {
  upcoming: "bg-green-100 text-green-800",
  draft: "bg-yellow-100 text-yellow-800",
  cancelled: "bg-red-100 text-red-800",
  completed: "bg-neutral-100 text-neutral-700",
};

const SEED_EVENTS: ChapterEvent[] = [
  {
    id: "1",
    title: "July Independence Chapter Meetup",
    date: "2026-07-15",
    time: "6:30 PM",
    location: "KC Public Library — Central Branch",
    description:
      "Monthly roundtable for Independence chapter founders. Bring a business problem to solve.",
    capacity: 20,
    status: "upcoming",
    rsvp_link: "",
    created_at: "2026-06-01",
    attendees: 7,
  },
  {
    id: "2",
    title: "Q3 Founders Kickoff",
    date: "2026-07-01",
    time: "7:00 PM",
    location: "Virtual — Zoom",
    description: "Quarterly goal-setting session and accountability check-in.",
    capacity: 30,
    status: "draft",
    rsvp_link: "",
    created_at: "2026-06-05",
    attendees: 0,
  },
];

export default function AdminEvents() {
  const [events, setEvents] = useState<ChapterEvent[]>(SEED_EVENTS);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EventFormInput, unknown, EventForm>({
    resolver: zodResolver(eventSchema),
    defaultValues: { status: "draft" },
  });

  const statusValue = watch("status");

  const openNew = () => {
    setEditingId(null);
    reset({ status: "draft" });
    setDialogOpen(true);
  };

  const openEdit = (event: ChapterEvent) => {
    setEditingId(event.id);
    reset(event);
    setDialogOpen(true);
  };

  const onSubmit = (data: EventForm) => {
    if (editingId) {
      setEvents(prev =>
        prev.map(e => (e.id === editingId ? { ...e, ...data } : e))
      );
      toast.success("Event updated.");
    } else {
      const newEvent: ChapterEvent = {
        ...data,
        id: Date.now().toString(),
        created_at: new Date().toISOString().split("T")[0],
        attendees: 0,
      };
      setEvents(prev => [newEvent, ...prev]);
      toast.success("Event created.");
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
    setDeleteConfirmId(null);
    toast.success("Event deleted.");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Independence Chapter Events</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Manage and track chapter events, RSVPs, and attendance
            </p>
          </div>
          <Button onClick={openNew}>
            <Plus className="h-4 w-4 mr-2" />
            New Event
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Events", value: events.length },
          {
            label: "Upcoming",
            value: events.filter(e => e.status === "upcoming").length,
          },
          {
            label: "Total RSVPs",
            value: events.reduce((a, e) => a + e.attendees, 0),
          },
          {
            label: "Drafts",
            value: events.filter(e => e.status === "draft").length,
          },
        ].map(stat => (
          <div key={stat.label} className="rounded-lg border bg-card p-4">
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="max-w-6xl mx-auto px-4 pb-12">
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-10 text-muted-foreground"
                  >
                    No events yet. Create your first one!
                  </TableCell>
                </TableRow>
              )}
              {events.map(event => (
                <TableRow key={event.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-sm">{event.title}</p>
                      {event.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                          {event.description}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-sm">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{event.date}</span>
                      {event.time && (
                        <span className="text-muted-foreground">
                          · {event.time}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {event.location && (
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        <span className="line-clamp-1">{event.location}</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-sm">
                      <Users className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>
                        {event.attendees}/{event.capacity ?? "∞"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[event.status]}`}
                    >
                      {event.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openEdit(event)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleteConfirmId(event.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Event" : "New Event"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Title *</Label>
              <Input {...register("title")} />
              {errors.title && (
                <p className="text-xs text-destructive">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Date *</Label>
                <Input type="date" {...register("date")} />
                {errors.date && (
                  <p className="text-xs text-destructive">
                    {errors.date.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label>Time</Label>
                <Input placeholder="6:30 PM" {...register("time")} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Location</Label>
              <Input
                placeholder="Venue or 'Virtual — Zoom'"
                {...register("location")}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea rows={3} {...register("description")} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Capacity</Label>
                <Input type="number" min={1} {...register("capacity")} />
              </div>
              <div className="space-y-1.5">
                <Label>Status *</Label>
                <Select
                  value={statusValue}
                  onValueChange={v =>
                    setValue("status", v as EventForm["status"])
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>RSVP Link</Label>
              <Input placeholder="https://..." {...register("rsvp_link")} />
              {errors.rsvp_link && (
                <p className="text-xs text-destructive">
                  {errors.rsvp_link.message}
                </p>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                <X className="h-4 w-4 mr-1.5" />
                Cancel
              </Button>
              <Button type="submit">
                <Save className="h-4 w-4 mr-1.5" />
                {editingId ? "Save Changes" : "Create Event"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <Dialog
        open={!!deleteConfirmId}
        onOpenChange={() => setDeleteConfirmId(null)}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Event?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
            >
              <Trash2 className="h-4 w-4 mr-1.5" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
