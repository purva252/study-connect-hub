import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  ClipboardList, CheckCircle2, Clock, TrendingUp, Plus, 
  Calendar, Brain, Gamepad2, Link2, Bell, User, LogOut,
  MoreVertical, Trash2, Edit2, GraduationCap, Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { Link, useNavigate } from "react-router-dom";

interface Task {
  id: string;
  title: string;
  subject: string;
  description: string;
  dueDate: string;
  priority: "high" | "medium" | "low";
  completed: boolean;
  type: "personal" | "assigned";
  teacherName?: string;
}

const initialTasks: Task[] = [
  {
    id: "1",
    title: "Complete Math Homework",
    subject: "Mathematics",
    description: "Chapter 5 exercises 1-20",
    dueDate: "2025-01-05",
    priority: "high",
    completed: false,
    type: "personal",
  },
  {
    id: "2",
    title: "Physics Lab Report",
    subject: "Physics",
    description: "Write report on pendulum experiment",
    dueDate: "2025-01-08",
    priority: "medium",
    completed: true,
    type: "assigned",
    teacherName: "Ms. Johnson",
  },
  {
    id: "3",
    title: "Read History Chapter",
    subject: "History",
    description: "Chapter 12: World War II",
    dueDate: "2025-01-10",
    priority: "low",
    completed: false,
    type: "assigned",
    teacherName: "Mr. Smith",
  },
];

const StudentDashboard = () => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    subject: "",
    description: "",
    dueDate: "",
    priority: "medium" as "high" | "medium" | "low",
  });
  const { toast } = useToast();
  const navigate = useNavigate();
  const [teacherCode, setTeacherCode] = useState("");

  useEffect(() => {
    // fetch tasks from backend
    const load = async () => {
      try {
        const token = localStorage.getItem('sc_token');
        const res = await fetch('/api/tasks', {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        if (!res.ok) return;
        const data = await res.json();
        // map backend tasks to UI Task shape
        const mapped = (data.tasks || data).map((t: any) => ({
          id: t._id,
          title: t.title,
          subject: t.subject || '',
          description: t.description || '',
          dueDate: t.dueDate ? new Date(t.dueDate).toISOString().slice(0,10) : '',
          priority: t.priority || 'medium',
          completed: t.status === 'completed',
          type: String(t.assignedBy) === String(t.assignedTo) ? 'personal' : (t.assignedBy && t.assignedBy === t.assignedTo ? 'personal' : (t.assignedBy ? 'assigned' : 'personal')),
          teacherName: t.assignedByName || undefined,
        }));
        setTasks(mapped);
      } catch (err) {
        // silent
      }
    };
    load();
  }, []);

  const stats = {
    total: tasks.length,
    completed: tasks.filter((t) => t.completed).length,
    pending: tasks.filter((t) => !t.completed).length,
    progress: Math.round((tasks.filter((t) => t.completed).length / tasks.length) * 100) || 0,
  };

  const handleAddTask = async () => {
    if (!newTask.title || !newTask.subject) {
      toast({ title: "Missing fields", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }
    try {
      const token = localStorage.getItem('sc_token');
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({
          title: newTask.title,
          description: newTask.description,
          dueDate: newTask.dueDate || undefined,
          priority: newTask.priority,
          assignedTo: token ? undefined : undefined,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast({ title: 'Create failed', description: err.message || 'Failed to create task', variant: 'destructive' });
        return;
      }
      const created = await res.json();
      const task: Task = {
        id: created._id || Date.now().toString(),
        title: created.title,
        subject: created.subject || newTask.subject,
        description: created.description || newTask.description,
        dueDate: created.dueDate ? new Date(created.dueDate).toISOString().slice(0,10) : newTask.dueDate,
        priority: created.priority || newTask.priority,
        completed: created.status === 'completed',
        type: 'personal',
      };
      setTasks([...tasks, task]);
      setNewTask({ title: '', subject: '', description: '', dueDate: '', priority: 'medium' });
      setIsAddDialogOpen(false);
      toast({ title: 'Task created!', description: 'Your new task has been added.' });
    } catch (err: any) {
      toast({ title: 'Network error', description: err?.message || 'Failed to contact server', variant: 'destructive' });
    }
  };

  const toggleComplete = (id: string) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
    toast({
      title: "Task updated",
      description: "Task status has been changed.",
    });
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter((t) => t.id !== id));
    toast({
      title: "Task deleted",
      description: "The task has been removed.",
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-pink/20 text-pink border-pink/30";
      case "medium":
        return "bg-warning/20 text-warning border-warning/30";
      case "low":
        return "bg-success/20 text-success border-success/30";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getSubjectColor = (subject: string) => {
    const colors: Record<string, string> = {
      Mathematics: "bg-primary/20 text-primary",
      Physics: "bg-accent/20 text-accent",
      History: "bg-pink/20 text-pink",
      Chemistry: "bg-success/20 text-success",
      English: "bg-warning/20 text-warning",
    };
    return colors[subject] || "bg-muted text-muted-foreground";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-pink flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="font-heading text-lg font-bold">StudySync</span>
            </Link>

            <div className="flex items-center gap-4">
              <button className="relative p-2 rounded-lg hover:bg-muted transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-pink rounded-full" />
              </button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem>
                    <User className="w-4 h-4 mr-2" /> Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/")}>
                    <LogOut className="w-4 h-4 mr-2" /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-12 px-6">
        <div className="container mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="font-heading text-3xl font-bold mb-2">Welcome back, Student! 👋</h1>
            <p className="text-muted-foreground">Here's your study progress overview</p>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
          >
            {[
              { label: "Total Tasks", value: stats.total, icon: ClipboardList, gradient: "from-primary to-pink" },
              { label: "Completed", value: stats.completed, icon: CheckCircle2, gradient: "from-success to-accent" },
              { label: "Pending", value: stats.pending, icon: Clock, gradient: "from-warning to-pink" },
              { label: "Progress", value: `${stats.progress}%`, icon: TrendingUp, gradient: "from-accent to-primary" },
            ].map((stat, i) => (
              <div key={i} className="glass-card p-6 rounded-2xl">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center mb-4`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </motion.div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Tasks Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2"
            >
              <div className="glass-card rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-border/50 flex items-center justify-between">
                  <h2 className="font-heading text-xl font-semibold">My Tasks</h2>
                  <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="btn-gradient gap-2">
                        <Plus className="w-4 h-4" /> Add Task
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="glass-card border-border/50">
                      <DialogHeader>
                        <DialogTitle>Create New Task</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 mt-4">
                        <div className="space-y-2">
                          <Label>Task Title</Label>
                          <Input
                            placeholder="Enter task title"
                            value={newTask.title}
                            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Subject</Label>
                          <Input
                            placeholder="e.g., Mathematics"
                            value={newTask.subject}
                            onChange={(e) => setNewTask({ ...newTask, subject: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Description</Label>
                          <Textarea
                            placeholder="Task details..."
                            value={newTask.description}
                            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Due Date</Label>
                            <Input
                              type="date"
                              value={newTask.dueDate}
                              onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Priority</Label>
                            <Select
                              value={newTask.priority}
                              onValueChange={(v) => setNewTask({ ...newTask, priority: v as "high" | "medium" | "low" })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="low">Low</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <Button onClick={handleAddTask} className="w-full btn-gradient">
                          Create Task
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <Tabs defaultValue="personal" className="p-6">
                  <TabsList className="w-full grid grid-cols-2 mb-6">
                    <TabsTrigger value="personal">Personal Tasks</TabsTrigger>
                    <TabsTrigger value="assigned">Teacher Assigned</TabsTrigger>
                  </TabsList>

                  <TabsContent value="personal" className="space-y-3">
                    {tasks.filter((t) => t.type === "personal").length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <ClipboardList className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No personal tasks yet. Create your first task!</p>
                      </div>
                    ) : (
                      tasks
                        .filter((t) => t.type === "personal")
                        .map((task) => (
                          <TaskCard
                            key={task.id}
                            task={task}
                            onToggle={toggleComplete}
                            onDelete={deleteTask}
                            getPriorityColor={getPriorityColor}
                            getSubjectColor={getSubjectColor}
                          />
                        ))
                    )}
                  </TabsContent>

                  <TabsContent value="assigned" className="space-y-3">
                    {tasks.filter((t) => t.type === "assigned").length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No assignments from teachers yet.</p>
                      </div>
                    ) : (
                      tasks
                        .filter((t) => t.type === "assigned")
                        .map((task) => (
                          <TaskCard
                            key={task.id}
                            task={task}
                            onToggle={toggleComplete}
                            onDelete={deleteTask}
                            getPriorityColor={getPriorityColor}
                            getSubjectColor={getSubjectColor}
                            isAssigned
                          />
                        ))
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            </motion.div>

            {/* Sidebar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-6"
            >
              {/* Connect with Teacher */}
              <div className="glass-card p-6 rounded-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
                    <Link2 className="w-5 h-5 text-accent" />
                  </div>
                  <h3 className="font-heading font-semibold">Connect with Teacher</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Enter your teacher's code to receive assignments directly.
                </p>
                <div className="flex gap-2">
                  <Input placeholder="Enter teacher id/code" className="flex-1" maxLength={64} value={teacherCode} onChange={(e) => setTeacherCode(e.target.value)} />
                  <Button onClick={async () => {
                    const code = teacherCode?.trim();
                    if (!code) { toast({ title: 'Enter code', description: 'Please enter teacher code', variant: 'destructive' }); return; }
                    try {
                      const token = localStorage.getItem('sc_token');
                      const res = await fetch('/api/connections/request', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
                        body: JSON.stringify({ teacherId: code }),
                      });
                      const data = await res.json();
                      if (!res.ok) { toast({ title: 'Request failed', description: data?.message || 'Failed to send request', variant: 'destructive' }); return; }
                      toast({ title: 'Request sent', description: 'Connection request sent to teacher.' });
                      setTeacherCode('');
                    } catch (err: any) {
                      toast({ title: 'Network error', description: err?.message || 'Failed to contact server', variant: 'destructive' });
                    }
                  }} className="btn-gradient-blue">Connect</Button>
                </div>
              </div>

              {/* Study Tools */}
              <div className="glass-card p-6 rounded-2xl">
                <h3 className="font-heading font-semibold mb-4">Study Tools</h3>
                <div className="space-y-3">
                  <button className="w-full flex items-center gap-3 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors text-left">
                    <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                      <Brain className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">Mind Map</div>
                      <div className="text-xs text-muted-foreground">Create visual guides</div>
                    </div>
                  </button>
                  <button className="w-full flex items-center gap-3 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors text-left">
                    <div className="w-10 h-10 rounded-xl bg-pink/20 flex items-center justify-center">
                      <Gamepad2 className="w-5 h-5 text-pink" />
                    </div>
                    <div>
                      <div className="font-medium">Zombie Game</div>
                      <div className="text-xs text-muted-foreground">Learn while playing</div>
                    </div>
                  </button>
                  <button className="w-full flex items-center gap-3 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors text-left">
                    <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <div className="font-medium">Calendar</div>
                      <div className="text-xs text-muted-foreground">View schedule</div>
                    </div>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
};

interface TaskCardProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  getPriorityColor: (priority: string) => string;
  getSubjectColor: (subject: string) => string;
  isAssigned?: boolean;
}

const TaskCard = ({ task, onToggle, onDelete, getPriorityColor, getSubjectColor, isAssigned }: TaskCardProps) => (
  <motion.div
    layout
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className={`p-4 rounded-xl border transition-all duration-300 ${
      task.completed
        ? "bg-muted/30 border-border/30 opacity-60"
        : "bg-card/50 border-border/50 hover:border-primary/30"
    }`}
  >
    <div className="flex items-start gap-4">
      <button
        onClick={() => onToggle(task.id)}
        className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
          task.completed
            ? "bg-success border-success"
            : "border-muted-foreground hover:border-primary"
        }`}
      >
        {task.completed && <CheckCircle2 className="w-3 h-3 text-white" />}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-xs px-2 py-0.5 rounded-full ${getSubjectColor(task.subject)}`}>
            {task.subject}
          </span>
          <span className={`text-xs px-2 py-0.5 rounded-full border ${getPriorityColor(task.priority)}`}>
            {task.priority}
          </span>
        </div>
        <h4 className={`font-medium ${task.completed ? "line-through" : ""}`}>{task.title}</h4>
        {task.description && (
          <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{task.description}</p>
        )}
        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {task.dueDate}
          </span>
          {isAssigned && task.teacherName && (
            <span className="flex items-center gap-1">
              <User className="w-3 h-3" />
              {task.teacherName}
            </span>
          )}
        </div>
      </div>

      {!isAssigned && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-1 rounded hover:bg-muted transition-colors">
              <MoreVertical className="w-4 h-4 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Edit2 className="w-4 h-4 mr-2" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(task.id)} className="text-destructive">
              <Trash2 className="w-4 h-4 mr-2" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  </motion.div>
);

export default StudentDashboard;
