import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { GraduationCap, Users, Mail, Lock, User, Eye, EyeOff, Hash, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import FloatingParticles from "@/components/ui/FloatingParticles";

type AuthMode = "login" | "signup";
type UserRole = "student" | "teacher";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [mode, setMode] = useState<AuthMode>("login");
  const [role, setRole] = useState<UserRole>((searchParams.get("role") as UserRole) || "student");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    grade: "",
    studentId: "",
    school: "",
    subjects: "",
  });

  useEffect(() => {
    const roleParam = searchParams.get("role") as UserRole;
    if (roleParam) setRole(roleParam);
  }, [searchParams]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload: any = {
        email: formData.email,
        password: formData.password,
      };
      if (mode === 'signup') {
        payload.name = formData.name;
        payload.role = role;
      }

      const url = mode === 'login' ? '/api/auth/login' : '/api/auth/register';

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        const msg = data?.message || (data?.errors ? data.errors.map((e: any) => e.msg).join(', ') : 'Auth failed');
        toast({ title: 'Authentication error', description: String(msg) });
        setIsLoading(false);
        return;
      }

      // store token and navigate
      if (data.token) {
        localStorage.setItem('sc_token', data.token);
      }

      toast({
        title: mode === 'login' ? 'Welcome back!' : 'Account created!',
        description: mode === 'login' ? `Logged in as ${role}` : `Your ${role} account has been created successfully.`,
      });

      navigate(role === 'student' ? '/student' : '/teacher');
    } catch (err: any) {
      toast({ title: 'Network error', description: err?.message || 'Failed to contact server' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Illustration */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <FloatingParticles />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-accent/10" />
        
        <div className="relative z-10 flex flex-col items-center justify-center w-full p-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <Link to="/" className="inline-flex items-center gap-3 mb-8">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-pink flex items-center justify-center glow-purple">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
              <span className="font-heading text-3xl font-bold">StudySync</span>
            </Link>

            <motion.div
              animate={{ y: [-10, 10, -10] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="w-64 h-64 mx-auto mb-8 rounded-3xl bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center glow-purple"
            >
              {role === "student" ? (
                <GraduationCap className="w-32 h-32 text-primary" />
              ) : (
                <Users className="w-32 h-32 text-accent" />
              )}
            </motion.div>

            <h2 className="font-heading text-2xl font-bold mb-4">
              {role === "student" ? "Start Your Journey" : "Empower Your Students"}
            </h2>
            <p className="text-muted-foreground max-w-sm">
              {role === "student"
                ? "Track your tasks, connect with teachers, and achieve your academic goals."
                : "Assign tasks, monitor progress, and help students succeed."}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Role Switcher */}
          <div className="flex gap-2 mb-8">
            <button
              onClick={() => setRole("student")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all duration-300 ${
                role === "student"
                  ? "bg-gradient-to-r from-primary to-pink text-white shadow-lg"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              <GraduationCap className="w-5 h-5" />
              Student
            </button>
            <button
              onClick={() => setRole("teacher")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all duration-300 ${
                role === "teacher"
                  ? "bg-gradient-to-r from-accent to-primary text-white shadow-lg"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              <Users className="w-5 h-5" />
              Teacher
            </button>
          </div>

          {/* Auth Form */}
          <div className="glass-card p-8 rounded-3xl">
            <div className="text-center mb-8">
              <h1 className="font-heading text-2xl font-bold mb-2">
                {mode === "login" ? "Welcome Back" : "Create Account"}
              </h1>
              <p className="text-muted-foreground">
                {mode === "login"
                  ? `Sign in to your ${role} account`
                  : `Sign up as a ${role}`}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "signup" && (
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="name"
                      name="name"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {mode === "signup" && role === "student" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="grade">Grade/Year</Label>
                    <div className="relative">
                      <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="grade"
                        name="grade"
                        placeholder="e.g., 10th Grade"
                        value={formData.grade}
                        onChange={handleInputChange}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </>
              )}

              {mode === "signup" && role === "teacher" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="subjects">Subject(s) Teaching</Label>
                    <div className="relative">
                      <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="subjects"
                        name="subjects"
                        placeholder="e.g., Mathematics, Physics"
                        value={formData.subjects}
                        onChange={handleInputChange}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="school">School/Institution (Optional)</Label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="school"
                        name="school"
                        placeholder="Your school name"
                        value={formData.school}
                        onChange={handleInputChange}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className={`w-full py-6 text-lg font-semibold ${
                  role === "student" ? "btn-gradient" : "btn-gradient-blue"
                }`}
              >
                {isLoading ? "Loading..." : mode === "login" ? "Sign In" : "Create Account"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-muted-foreground">
                {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
                <button
                  onClick={() => setMode(mode === "login" ? "signup" : "login")}
                  className="text-primary hover:underline font-medium"
                >
                  {mode === "login" ? "Sign up" : "Sign in"}
                </button>
              </p>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
              ← Back to home
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
