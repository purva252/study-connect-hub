import { motion } from "framer-motion";

const particles = [
  { size: 4, x: "10%", y: "20%", delay: 0, duration: 8 },
  { size: 6, x: "80%", y: "15%", delay: 1, duration: 7 },
  { size: 3, x: "30%", y: "70%", delay: 2, duration: 9 },
  { size: 5, x: "70%", y: "60%", delay: 0.5, duration: 6 },
  { size: 4, x: "20%", y: "80%", delay: 1.5, duration: 8 },
  { size: 7, x: "90%", y: "40%", delay: 2.5, duration: 7 },
  { size: 3, x: "50%", y: "30%", delay: 3, duration: 9 },
  { size: 5, x: "15%", y: "50%", delay: 0.8, duration: 6 },
];

const FloatingParticles = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-primary/30"
          style={{
            width: particle.size,
            height: particle.size,
            left: particle.x,
            top: particle.y,
          }}
          animate={{
            y: [-20, 20, -20],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
      {/* Larger glowing orbs */}
      <motion.div
        className="absolute w-64 h-64 rounded-full bg-primary/10 blur-3xl"
        style={{ left: "5%", top: "10%" }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute w-96 h-96 rounded-full bg-accent/10 blur-3xl"
        style={{ right: "0%", top: "30%" }}
        animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute w-72 h-72 rounded-full bg-pink/10 blur-3xl"
        style={{ left: "40%", bottom: "5%" }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.35, 0.2] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
};

export default FloatingParticles;
