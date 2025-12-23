import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-pink flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="font-heading text-lg font-bold">StudySync</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
              Features
            </Link>
            <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
              About
            </Link>
            <Link to="/auth" className="text-muted-foreground hover:text-foreground transition-colors">
              Login
            </Link>
            <Link to="/auth">
              <Button className="btn-gradient text-sm">Get Started</Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background border-b border-border/50"
          >
            <div className="container mx-auto px-6 py-4 space-y-4">
              <Link to="/" className="block text-muted-foreground hover:text-foreground transition-colors">
                Features
              </Link>
              <Link to="/" className="block text-muted-foreground hover:text-foreground transition-colors">
                About
              </Link>
              <Link to="/auth" className="block text-muted-foreground hover:text-foreground transition-colors">
                Login
              </Link>
              <Link to="/auth" className="block">
                <Button className="btn-gradient w-full">Get Started</Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
