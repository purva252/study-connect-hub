import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Users, ClipboardList, CheckCircle2, BookOpen, Plus, 
  Bell, User, LogOut, Copy, QrCode, Send, MoreVertical,
  Trash2, Edit2, GraduationCap, TrendingUp, Clock,
  AlertCircle, Loader2, Check, X
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
import { Progress } from "@/components/ui/progress";
import { getAcceptedConnections, getPendingConnections, respondToInvite } from "@/services/connectionsApi";
import tasksApi from '@/services/tasksApi';

interface Student {
  id: string;
  name: string;
  grade: string;
  email: string;
  tasksAssigned: number;
  tasksCompleted: number;
  connectedAt: string;
}

interface AssignedTask {
  id: string;
  title: string;
  subject: string;
  description: string;
  dueDate: string;
  priority: "high" | "medium" | "low";
  assignedTo: string[];
  completions: { studentId: string; completed: boolean }[];
  createdAt: string;
}

const initialStudents: Student[] = [
  { id: "1", name: "Alice Johnson", grade: "10th", email: "alice@school.edu", tasksAssigned: 5, tasksCompleted: 3, connectedAt: "2024-12-01" },
  { id: "2", name: "Bob Smith", grade: "10th", email: "bob@school.edu", tasksAssigned: 5, tasksCompleted: 5, connectedAt: "2024-12-05" },
  { id: "3", name: "Carol Davis", grade: "11th", email: "carol@school.edu", tasksAssigned: 4, tasksCompleted: 2, connectedAt: "2024-12-10" },
];

const initialTasks: AssignedTask[] = [];

const TeacherDashboard = () => {
  const [connectedStudents, setConnectedStudents] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [tasks, setTasks] = useState<AssignedTask[]>(initialTasks);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [groupDialogOpen, setGroupDialogOpen] = useState(false);
  const [selectedGroupStudents, setSelectedGroupStudents] = useState<any[]>([]);
  const [selectedGroupTitle, setSelectedGroupTitle] = useState("");
  const [newTask, setNewTask] = useState({
    title: "",
    subject: "",
    description: "",
    dueDate: "",
    priority: "medium" as "high" | "medium" | "low",
  });
  const [teacherCode, setTeacherCode] = useState("ABC123");
  const [copiedCode, setCopiedCode] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Load teacher code
    const loadTeacherInfo = async () => {
      try {
        const token = localStorage.getItem('sc_token');
        if (!token) return;
        
        const res = await fetch('/api/teachers/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (res.ok) {
          const data = await res.json();
          if (data.code) setTeacherCode(data.code);
        }
      } catch (err) {
        console.error('Failed to load teacher info:', err);
      }
    };

    // Load connected students
    const loadStudents = async () => {
      setLoadingStudents(true);
      try {
        const token = localStorage.getItem('sc_token');
        if (!token) {
          console.error('No token found');
          return;
        }

        console.log('[TeacherDashboard] Loading connections...');
        
        const [accepted, pending] = await Promise.all([
          getAcceptedConnections(),
          getPendingConnections()
        ]);
        
        console.log('[TeacherDashboard] Accepted:', accepted);
        console.log('[TeacherDashboard] Pending:', pending);
        
        setConnectedStudents(accepted);
        setPendingRequests(pending);
      } catch (err: any) {
        console.error('Failed to load students:', err);
        toast({
          title: 'Error',
          description: err.message || 'Failed to load connected students',
          variant: 'destructive'
        });
      } finally {
        setLoadingStudents(false);
      }
    };

    loadTeacherInfo();
    loadStudents();
    // load teacher tasks
    loadTasks();
  }, [toast]);

  // load tasks for teacher
  async function loadTasks() {
    try {
      const res = await tasksApi.getTasks();
      const backendTasks = res.tasks || [];
      const mapped = backendTasks.map((t: any) => ({
        id: t._id,
        title: t.title,
        subject: t.subject || '',
        description: t.description || '',
        dueDate: t.dueDate ? new Date(t.dueDate).toISOString().slice(0,10) : '',
        priority: t.priority || 'medium',
        assignedTo: [String(t.assignedTo && (t.assignedTo._id || t.assignedTo))],
        completions: [{ studentId: String(t.assignedTo && (t.assignedTo._id || t.assignedTo)), completed: t.status === 'completed' }],
        createdAt: t.createdAt || ''
      }));
      setTasks(mapped);
    } catch (err) {
      console.error('Failed to load tasks:', err);
    }
  };

  const stats = {
    totalStudents: connectedStudents.length,
    totalTasks: tasks.length,
    pendingTasks: tasks.reduce((acc, t) => acc + t.completions.filter((c) => !c.completed).length, 0),
    completedThisWeek: tasks.reduce((acc, t) => acc + t.completions.filter((c) => c.completed).length, 0),
    subjects: new Set(tasks.map(t => t.subject)).size,
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(teacherCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
      toast({
        title: "Copied!",
        description: "Share this code with your students.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy code",
        variant: "destructive"
      });
    }
  };

  const handleRespondToRequest = async (connectionId: string, action: 'accept' | 'reject') => {
    try {
      await respondToInvite(connectionId, action);
      toast({
        title: action === 'accept' ? 'Accepted!' : 'Rejected',
        description: action === 'accept' ? 'Student connection accepted.' : 'Connection request declined.'
      });

      // Reload both pending and accepted
      const [accepted, pending] = await Promise.all([
        getAcceptedConnections(),
        getPendingConnections()
      ]);
      setConnectedStudents(accepted);
      setPendingRequests(pending);
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to respond to request',
        variant: 'destructive'
      });
    }
  };

  const handleAssignTask = async () => {
    if (!newTask.title || !newTask.subject || selectedStudents.length === 0) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields and select at least one student.",
        variant: "destructive",
      });
      return;
    }

    try {
      const payload = {
        title: newTask.title,
        description: newTask.description,
        dueDate: newTask.dueDate || undefined,
        priority: newTask.priority,
        assignedTo: selectedStudents,
      };
      const tasksRes = await (await import('@/services/tasksApi')).assignTasks(payload);
      // refresh teacher tasks from backend
      const assignedCount = (tasksRes && tasksRes.tasks) ? tasksRes.tasks.length : selectedStudents.length;
      await loadTasks();
      setNewTask({ title: "", subject: "", description: "", dueDate: "", priority: "medium" });
      setSelectedStudents([]);
      setIsAssignDialogOpen(false);
      toast({ title: 'Task assigned!', description: `Assigned to ${assignedCount} student(s)` });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to assign tasks', variant: 'destructive' });
    }
  };

  const deleteTask = async (identifier: string) => {
    try {
      // if identifier matches a task id, delete single; otherwise treat as title and delete all matching
      const isId = tasks.some((t) => t.id === identifier);
      if (isId) {
        // call backend delete if possible
        try {
          const token = localStorage.getItem('sc_token');
          await fetch(`/api/tasks/${identifier}`, { method: 'DELETE', headers: token ? { Authorization: `Bearer ${token}` } : {} });
        } catch (_) {}
        setTasks(tasks.filter((t) => t.id !== identifier));
        toast({ title: 'Task deleted', description: 'The task has been removed.' });
        return;
      }

      // treat as title
      const title = identifier;
      const toDelete = tasks.filter((t) => t.title === title).map((t) => t.id);
      for (const id of toDelete) {
        try {
          const token = localStorage.getItem('sc_token');
          await fetch(`/api/tasks/${id}`, { method: 'DELETE', headers: token ? { Authorization: `Bearer ${token}` } : {} });
        } catch (_) {}
      }
      setTasks(tasks.filter((t) => t.title !== title));
      toast({ title: 'Tasks deleted', description: `Removed ${toDelete.length} task(s).` });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to delete task(s)', variant: 'destructive' });
    }
  };

  const toggleStudentSelection = (id: string) => {
    setSelectedStudents((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
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

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-accent to-primary flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="font-heading text-lg font-bold">StudySync</span>
            </Link>

            <div className="flex items-center gap-4">
              <button className="relative p-2 rounded-lg hover:bg-muted transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full" />
              </button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center">
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
            <h1 className="font-heading text-3xl font-bold mb-2">Welcome, Teacher! 👩‍🏫</h1>
            <p className="text-muted-foreground">Manage your students and assignments</p>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8"
          >
            {[
              { label: "Students", value: stats.totalStudents, icon: Users, gradient: "from-primary to-pink" },
              { label: "Tasks Created", value: stats.totalTasks, icon: ClipboardList, gradient: "from-accent to-primary" },
              { label: "Pending", value: stats.pendingTasks, icon: Clock, gradient: "from-warning to-pink" },
              { label: "Completed", value: stats.completedThisWeek, icon: CheckCircle2, gradient: "from-success to-accent" },
              { label: "Subjects", value: stats.subjects, icon: BookOpen, gradient: "from-pink to-primary" },
            ].map((stat, i) => (
              <div key={i} className="glass-card p-5 rounded-2xl">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center mb-3`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <div className="text-2xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </motion.div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - Students & Tasks */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2 space-y-6"
            >
              {/* Tabs for Students and Tasks */}
              <div className="glass-card rounded-2xl overflow-hidden">
                <Tabs defaultValue="students" className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <TabsList>
                      <TabsTrigger value="students">My Students</TabsTrigger>
                      <TabsTrigger value="tasks">Assigned Tasks</TabsTrigger>
                    </TabsList>
                    <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="btn-gradient-blue gap-2">
                          <Send className="w-4 h-4" /> Assign Task
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="glass-card border-border/50 max-w-lg">
                        <DialogHeader>
                          <DialogTitle>Assign New Task</DialogTitle>
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
                              placeholder="e.g., Physics"
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
                          <div className="space-y-2">
                            <Label>Select Students</Label>
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                              {loadingStudents ? (
                                <p className="text-sm text-muted-foreground">Loading students...</p>
                              ) : connectedStudents.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No connected students yet</p>
                              ) : (
                                connectedStudents.map((connection: any) => (
                                  <label
                                    key={connection.student._id}
                                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                                      selectedStudents.includes(connection.student._id)
                                        ? "bg-primary/10 border-primary/50"
                                        : "border-border/50 hover:border-primary/30"
                                    }`}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={selectedStudents.includes(connection.student._id)}
                                      onChange={() => toggleStudentSelection(connection.student._id)}
                                      className="w-4 h-4 rounded border-muted-foreground text-primary focus:ring-primary"
                                    />
                                    <span className="font-medium">{connection.student.name}</span>
                                    <span className="text-sm text-muted-foreground ml-auto">{connection.student.email}</span>
                                  </label>
                                ))
                              )}
                            </div>
                          </div>
                          <Button onClick={handleAssignTask} className="w-full btn-gradient-blue">
                            Assign Task
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <TabsContent value="students" className="space-y-3">
                    {loadingStudents ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : connectedStudents.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No connected students yet.</p>
                        <p className="text-sm mt-2">Share your teacher code to get started!</p>
                      </div>
                    ) : (
                      connectedStudents.map((connection: any) => (
                        <motion.div
                          key={connection.student._id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="p-4 rounded-xl bg-card/50 border border-border/50 hover:border-accent/30 transition-all"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center">
                              <span className="text-lg font-bold text-white">{connection.student.name[0]}</span>
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium">{connection.student.name}</h4>
                              <p className="text-sm text-muted-foreground">{connection.student.email}</p>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button className="p-1 rounded hover:bg-muted transition-colors">
                                  <MoreVertical className="w-4 h-4 text-muted-foreground" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => {
                                  setSelectedStudents([connection.student._id]);
                                  setIsAssignDialogOpen(true);
                                }}>
                                  <Send className="w-4 h-4 mr-2" /> Assign Task
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive" onClick={async () => {
                                  try {
                                    const res = await (await import('@/services/connectionsApi')).removeConnection(connection._id);
                                    toast({ title: 'Removed', description: res.message });
                                    // refresh lists
                                    const [accepted, pending] = await Promise.all([getAcceptedConnections(), getPendingConnections()]);
                                    setConnectedStudents(accepted);
                                    setPendingRequests(pending);
                                  } catch (err: any) {
                                    toast({ title: 'Error', description: err.message || 'Failed to remove connection', variant: 'destructive' });
                                  }
                                }}>
                                  <Trash2 className="w-4 h-4 mr-2" /> Remove
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </TabsContent>

                  <TabsContent value="tasks" className="space-y-3">
                    {(() => {
                      // Group tasks by title
                      const groupsMap: Record<string, any> = {};
                      tasks.forEach((t) => {
                        const key = t.title || t.id;
                        if (!groupsMap[key]) {
                          groupsMap[key] = { title: t.title, subject: t.subject, dueDate: t.dueDate, priority: t.priority, items: [] };
                        }
                        groupsMap[key].items.push(t);
                      });

                      const groups = Object.values(groupsMap).map((g: any) => {
                        // aggregate students and completion status per group
                        const studentsById: Record<string, any> = {};
                        g.items.forEach((it: any) => {
                          (it.assignedTo || []).forEach((sid: string, idx: number) => {
                            const id = String(sid);
                            const completedFlag = it.completions && it.completions[idx] ? !!it.completions[idx].completed : false;
                            if (!studentsById[id]) {
                              const conn = connectedStudents.find((c) => String(c.student._id) === id || String(c.student._id) === String(sid));
                              studentsById[id] = {
                                id,
                                name: conn?.student?.name || `Student ${id}`,
                                email: conn?.student?.email || "",
                                completed: completedFlag,
                              };
                            } else {
                              studentsById[id].completed = studentsById[id].completed || completedFlag;
                            }
                          });
                        });

                        const studentsArr = Object.values(studentsById);
                        return {
                          title: g.title,
                          subject: g.subject,
                          dueDate: g.dueDate,
                          priority: g.priority,
                          totalAssigned: studentsArr.length,
                          completedCount: studentsArr.filter((s: any) => s.completed).length,
                          students: studentsArr,
                        };
                      });

                      if (groups.length === 0) {
                        return (
                          <div className="text-center py-12 text-muted-foreground">
                            <p>No assigned tasks yet.</p>
                          </div>
                        );
                      }

                      return groups.map((group: any) => (
                        <motion.div
                          key={group.title}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="p-4 rounded-xl bg-card/50 border border-border/50 hover:border-primary/30 transition-all"
                        >
                          <div className="flex items-start gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs px-2 py-0.5 rounded-full bg-accent/20 text-accent">
                                  {group.subject}
                                </span>
                                <span className={`text-xs px-2 py-0.5 rounded-full border ${getPriorityColor(group.priority)}`}>
                                  {group.priority}
                                </span>
                              </div>
                              <h4 className="font-medium">{group.title}</h4>
                              <p className="text-sm text-muted-foreground line-clamp-1">Due: {group.dueDate}</p>
                              <div className="flex items-center gap-4 mt-2">
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Users className="w-3 h-3" />
                                  Assigned to: {group.totalAssigned}
                                </span>
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Check className="w-3 h-3" />
                                  Completed: {group.completedCount} / {group.totalAssigned}
                                </span>
                              </div>
                            </div>

                            <div className="flex flex-col gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setSelectedGroupStudents(group.students);
                                  setSelectedGroupTitle(group.title);
                                  setGroupDialogOpen(true);
                                }}
                              >
                                View Students &nbsp; ▶
                              </Button>
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
                                  <DropdownMenuItem onClick={() => deleteTask(group.title)} className="text-destructive">
                                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </motion.div>
                      ));
                    })()}
                  </TabsContent>
                </Tabs>
              </div>

              {/* Group students dialog */}
              <Dialog open={groupDialogOpen} onOpenChange={setGroupDialogOpen}>
                <DialogContent className="glass-card border-border/50 max-w-md">
                  <DialogHeader>
                    <DialogTitle>Students for: {selectedGroupTitle}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-3 mt-2">
                    {selectedGroupStudents.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No students found for this assignment.</p>
                    ) : (
                      selectedGroupStudents.map((s) => (
                        <div key={s.id} className="flex items-center gap-3 p-3 rounded-lg border border-border/50">
                          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                            <span className="font-medium">{s.name?.[0] || "S"}</span>
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">{s.name}</div>
                            <div className="text-xs text-muted-foreground">{s.email}</div>
                          </div>
                          <div className="text-sm">
                            {s.completed ? (
                              <span className="text-success font-medium">Completed</span>
                            ) : (
                              <span className="text-muted-foreground">Pending</span>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                    <div className="text-right">
                      <Button onClick={() => setGroupDialogOpen(false)}>Close</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

            </motion.div>

            {/* Right Column - Teacher Code & Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-6"
            >
              {/* Teacher Code Card */}
              <div className="glass-card p-6 rounded-2xl glow-blue">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
                    <Copy className="w-5 h-5 text-accent" />
                  </div>
                  <h3 className="font-heading font-semibold">Your Teacher Code</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Share this code with students to connect with them.
                </p>
                <div className="flex gap-2 items-stretch mb-4">
                  <div className="flex-1 px-4 py-3 rounded-lg bg-card/50 border border-border/50 font-mono font-bold text-lg flex items-center justify-center tracking-widest">
                    {teacherCode}
                  </div>
                  <Button
                    onClick={copyCode}
                    className={`btn-gradient-blue ${copiedCode ? 'bg-success' : ''}`}
                  >
                    {copiedCode ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  {copiedCode ? '✓ Copied to clipboard!' : 'Click to copy'}
                </p>
              </div>

              {/* Connection Requests */}
              {pendingRequests.length > 0 && (
                <div className="glass-card p-6 rounded-2xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-warning/20 flex items-center justify-center">
                      <AlertCircle className="w-5 h-5 text-warning" />
                    </div>
                    <h3 className="font-heading font-semibold">Connection Requests</h3>
                    <span className="ml-auto text-xs bg-warning/20 text-warning px-2 py-1 rounded-full font-semibold">
                      {pendingRequests.length}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {pendingRequests.map((req) => (
                      <motion.div
                        key={req._id}
                        layout
                        className="p-3 bg-card/50 rounded-lg border border-border/50 hover:border-warning/30 transition-colors"
                      >
                        <p className="font-medium text-sm mb-2">{req.student.name}</p>
                        <p className="text-xs text-muted-foreground mb-3">{req.student.email}</p>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleRespondToRequest(req._id, 'accept')}
                            className="btn-gradient-blue flex-1 h-8"
                          >
                            <Check className="w-3 h-3 mr-1" /> Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRespondToRequest(req._id, 'reject')}
                            className="flex-1 h-8"
                          >
                            <X className="w-3 h-3 mr-1" /> Decline
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Stats */}
              <div className="glass-card p-6 rounded-2xl">
                <h3 className="font-heading font-semibold mb-4">Class Performance</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Overall Completion</span>
                      <span className="font-medium">75%</span>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">On-time Submissions</span>
                      <span className="font-medium">88%</span>
                    </div>
                    <Progress value={88} className="h-2" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TeacherDashboard;
