import { motion } from "framer-motion";
import { UserPlus, Link2, ClipboardList, TrendingUp, ArrowRight } from "lucide-react";

const studentSteps = [
  { icon: UserPlus, title: "Sign Up", description: "Create your student account" },
  { icon: Link2, title: "Connect", description: "Link with your teacher" },
  { icon: ClipboardList, title: "Receive Tasks", description: "Get assignments instantly" },
  { icon: TrendingUp, title: "Track Progress", description: "Monitor your success" },
];

const teacherSteps = [
  { icon: UserPlus, title: "Sign Up", description: "Create your teacher account" },
  { icon: ClipboardList, title: "Create Subjects", description: "Set up your classes" },
  { icon: Link2, title: "Assign Tasks", description: "Send to students" },
  { icon: TrendingUp, title: "Monitor", description: "Track completion" },
];

const HowItWorksSection = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
      
      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
            How It <span className="gradient-text">Works</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Simple, intuitive workflow for both students and teachers
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Student Flow */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="glass-card p-8 rounded-3xl">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                  <span className="text-xl">🎓</span>
                </div>
                <h3 className="font-heading text-xl font-semibold">Student Journey</h3>
              </div>
              
              <div className="space-y-6">
                {studentSteps.map((step, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-pink/20 flex items-center justify-center border border-primary/30">
                        <step.icon className="w-5 h-5 text-primary" />
                      </div>
                      {i < studentSteps.length - 1 && (
                        <div className="absolute top-full left-1/2 -translate-x-1/2 w-0.5 h-6 bg-gradient-to-b from-primary/50 to-transparent" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">{step.title}</h4>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                    </div>
                    {i < studentSteps.length - 1 && (
                      <ArrowRight className="w-4 h-4 text-primary/50 hidden sm:block" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Teacher Flow */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="glass-card p-8 rounded-3xl">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
                  <span className="text-xl">👩‍🏫</span>
                </div>
                <h3 className="font-heading text-xl font-semibold">Teacher Journey</h3>
              </div>
              
              <div className="space-y-6">
                {teacherSteps.map((step, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center border border-accent/30">
                        <step.icon className="w-5 h-5 text-accent" />
                      </div>
                      {i < teacherSteps.length - 1 && (
                        <div className="absolute top-full left-1/2 -translate-x-1/2 w-0.5 h-6 bg-gradient-to-b from-accent/50 to-transparent" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">{step.title}</h4>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                    </div>
                    {i < teacherSteps.length - 1 && (
                      <ArrowRight className="w-4 h-4 text-accent/50 hidden sm:block" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
