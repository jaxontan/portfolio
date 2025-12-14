import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { name: "WORK", href: "#work" },
    { name: "ABOUT", href: "#about" },
    { name: "EXPERTISE", href: "#expertise" },
    { name: "CONTACT", href: "#contact" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-primary-foreground">
      {/* Top System Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-primary z-50" />
      
      {/* Navigation */}
      <header 
        className={cn(
          "fixed top-0 left-0 w-full z-40 transition-all duration-300 border-b border-border/0",
          scrolled ? "bg-background/80 backdrop-blur-md border-border/100 py-4" : "bg-transparent py-6"
        )}
      >
        <div className="container flex items-center justify-between">
          <Link href="/">
            <a className="text-xl font-bold tracking-tighter hover:text-primary transition-colors">
              JAXON_TAN<span className="text-primary">.dev</span>
            </a>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <a 
                key={item.name}
                href={item.href}
                className="text-sm font-mono font-medium hover:text-primary transition-colors relative group"
              >
                <span className="text-primary opacity-0 group-hover:opacity-100 absolute -left-3 transition-opacity">{">"}</span>
                {item.name}
              </a>
            ))}
            <a 
              href="/resume.pdf" 
              className="px-4 py-2 bg-primary text-primary-foreground font-mono text-sm font-bold hover:bg-primary/90 transition-colors"
            >
              RESUME_V2.0
            </a>
          </nav>

          {/* Mobile Menu Toggle (Placeholder) */}
          <button className="md:hidden p-2 text-foreground">
            <span className="sr-only">Menu</span>
            <div className="w-6 h-0.5 bg-current mb-1.5"></div>
            <div className="w-6 h-0.5 bg-current mb-1.5"></div>
            <div className="w-6 h-0.5 bg-current"></div>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-20">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-12">
        <div className="container grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h2 className="text-2xl font-bold mb-4">JAXON TAN</h2>
            <p className="text-muted-foreground max-w-md font-mono text-sm">
              Software Engineer crafting digital experiences with precision and purpose.
              Based in Singapore.
            </p>
          </div>
          
          <div>
            <h3 className="font-mono font-bold mb-4 text-primary">LINKS</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#work" className="hover:text-primary transition-colors">Selected Work</a></li>
              <li><a href="#about" className="hover:text-primary transition-colors">About Me</a></li>
              <li><a href="#expertise" className="hover:text-primary transition-colors">Technical Skills</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-mono font-bold mb-4 text-primary">SOCIAL</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="https://github.com/jaxontan" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">GitHub</a></li>
              <li><a href="https://linkedin.com/in/jaxon-tan" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">LinkedIn</a></li>
              <li><a href="mailto:yjtanyuejun@outlook.com" className="hover:text-primary transition-colors">Email</a></li>
            </ul>
          </div>
        </div>
        <div className="container mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center text-xs font-mono text-muted-foreground">
          <p>© {new Date().getFullYear()} Jaxon Tan. All systems operational.</p>
          <p>Designed & Built with React + Tailwind</p>
        </div>
      </footer>
    </div>
  );
}
