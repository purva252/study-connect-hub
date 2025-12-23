import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { GraduationCap, Users, Sparkles } from "lucide-react";
import FloatingParticles from "@/components/ui/FloatingParticles";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden py-20">
      <FloatingParticles />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center lg:text-left"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/30 mb-6"
            >
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Learn Smarter, Achieve More</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6"
            >
              Transform Your{" "}
              <span className="gradient-text">Study Journey</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0"
            >
              Where Teachers Guide & Students Excel. Connect, plan, and track your academic progress with our intelligent study planner.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Link to="/auth?role=student" className="btn-gradient flex items-center justify-center gap-2">
                <GraduationCap className="w-5 h-5" />
                I'm a Student
              </Link>
              <Link to="/auth?role=teacher" className="btn-gradient-blue flex items-center justify-center gap-2">
                <Users className="w-5 h-5" />
                I'm a Teacher
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-border/50"
            >
              {[
                { value: "10K+", label: "Students" },
                { value: "500+", label: "Teachers" },
                { value: "50K+", label: "Tasks Done" },
              ].map((stat, i) => (
                <div key={i} className="text-center lg:text-left">
                  <div className="text-2xl md:text-3xl font-bold gradient-text">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right - 3D Illustration Area */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            className="relative hidden lg:block"
          >
            <div className="relative">
              {/* Main illustration container */}
              <div className="glass-card p-8 rounded-3xl">
                <div className="aspect-square relative flex items-center justify-center">
                  {/* Central study icon */}
                  <motion.div
                    animate={{ y: [-10, 10, -10] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="w-48 h-48 rounded-3xl bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center glow-purple"
                  >
                    <GraduationCap className="w-24 h-24 text-primary" />
                  </motion.div>

                  {/* Floating elements */}
                  <motion.div
                    animate={{ y: [-15, 15, -15], x: [-5, 5, -5] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                    className="absolute top-10 right-10 w-16 h-16 rounded-2xl bg-pink/20 flex items-center justify-center border border-pink/30"
                  >
                    <span className="text-3xl">📚</span>
                  </motion.div>

                  <motion.div
                    animate={{ y: [15, -15, 15], x: [5, -5, 5] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute bottom-10 left-10 w-16 h-16 rounded-2xl bg-accent/20 flex items-center justify-center border border-accent/30"
                  >
                    <span className="text-3xl">🎯</span>
                  </motion.div>

                  <motion.div
                    animate={{ y: [-12, 12, -12] }}
                    transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
                    className="absolute top-20 left-5 w-14 h-14 rounded-xl bg-success/20 flex items-center justify-center border border-success/30"
                  >
                    <span className="text-2xl">✨</span>
                  </motion.div>

                  <motion.div
                    animate={{ y: [10, -10, 10] }}
                    transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
                    className="absolute bottom-20 right-5 w-14 h-14 rounded-xl bg-warning/20 flex items-center justify-center border border-warning/30"
                  >
                    <span className="text-2xl">🚀</span>
                  </motion.div>
                </div>
              </div>

              {/* Background glow effects */}
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
              <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-accent/20 rounded-full blur-3xl" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
