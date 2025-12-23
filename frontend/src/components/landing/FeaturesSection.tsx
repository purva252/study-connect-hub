import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { GraduationCap, Users, Link2, Calendar, Brain, Gamepad2 } from "lucide-react";

const features = [
  {
    icon: GraduationCap,
    title: "For Students",
    description: "Personal study planner with task management, progress tracking, and smart reminders",
    link: "/auth?role=student",
    buttonText: "Get Started",
    gradient: "from-primary to-pink",
    iconBg: "bg-primary/20",
  },
  {
    icon: Users,
    title: "For Teachers",
    description: "Streamlined task assignment, student monitoring, and progress analytics",
    link: "/auth?role=teacher",
    buttonText: "Start Teaching",
    gradient: "from-accent to-primary",
    iconBg: "bg-accent/20",
  },
  {
    icon: Link2,
    title: "Connected Learning",
    description: "Real-time synchronization between teacher assignments and student tasks",
    link: "/auth",
    buttonText: "Learn More",
    gradient: "from-success to-accent",
    iconBg: "bg-success/20",
  },
];

const tools = [
  {
    icon: Calendar,
    title: "Smart Calendar",
    description: "Visualize your schedule with an intuitive calendar view",
  },
  {
    icon: Brain,
    title: "Mind Maps",
    description: "Create visual study guides with our interactive mind mapper",
  },
  {
    icon: Gamepad2,
    title: "Zombie Study Game",
    description: "Make learning fun with gamified study sessions",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const FeaturesSection = () => {
  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
            Everything You Need to <span className="gradient-text">Excel</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Powerful tools designed for both students and teachers to enhance the learning experience
          </p>
        </motion.div>

        {/* Main Feature Cards */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-6 mb-20"
        >
          {features.map((feature, i) => (
            <motion.div key={i} variants={item}>
              <div className="glass-card-hover p-8 h-full flex flex-col">
                <div className={`w-16 h-16 rounded-2xl ${feature.iconBg} flex items-center justify-center mb-6`}>
                  <feature.icon className="w-8 h-8 text-foreground" />
                </div>
                <h3 className="font-heading text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground mb-6 flex-grow">{feature.description}</p>
                <Link
                  to={feature.link}
                  className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r ${feature.gradient} text-white font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg`}
                >
                  {feature.buttonText}
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Study Tools */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h3 className="font-heading text-2xl md:text-3xl font-bold mb-4">
            Powerful <span className="gradient-text-blue">Study Tools</span>
          </h3>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-6"
        >
          {tools.map((tool, i) => (
            <motion.div key={i} variants={item}>
              <div className="glass-card p-6 text-center group hover:border-accent/30 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <tool.icon className="w-6 h-6 text-accent" />
                </div>
                <h4 className="font-heading font-semibold mb-2">{tool.title}</h4>
                <p className="text-sm text-muted-foreground">{tool.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;
