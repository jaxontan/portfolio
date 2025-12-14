import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Terminal, Code, Cpu } from "lucide-react";

export default function Hero() {
  const [text, setText] = useState("");
  const fullText = "Building digital experiences through code.";
  
  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      setText(fullText.slice(0, i + 1));
      i++;
      if (i > fullText.length) clearInterval(timer);
    }, 50);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="min-h-[90vh] flex items-center relative overflow-hidden border-b border-border">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      
      <div className="container relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 border border-primary/30 bg-primary/5 text-primary text-xs font-mono uppercase tracking-wider">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
            System Online • Available for work
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-tight">
            SOFTWARE <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-600">ENGINEER</span>
          </h1>
          
          <div className="h-8 font-mono text-lg md:text-xl text-muted-foreground">
            {">"} {text}<span className="animate-pulse">_</span>
          </div>
          
          <p className="text-lg text-muted-foreground max-w-md">
            I'm Jaxon Tan, a software engineering student at Nanyang Polytechnic. 
            I specialize in full-stack development, AI integration, and building 
            products that solve real-world problems.
          </p>
          
          <div className="flex flex-wrap gap-4">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-mono rounded-none border-2 border-transparent hover:border-primary hover:bg-transparent hover:text-primary transition-all">
              VIEW PROJECTS <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
            <Button size="lg" variant="outline" className="font-mono rounded-none border-2 hover:bg-secondary transition-all">
              CONTACT ME
            </Button>
          </div>
        </div>

        {/* Terminal / Code Block Visual */}
        <div className="relative hidden lg:block">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent opacity-20 blur-xl"></div>
          <div className="relative bg-card border border-border p-1 shadow-2xl">
            <div className="bg-muted/50 border-b border-border p-3 flex items-center justify-between">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
              </div>
              <div className="text-xs font-mono text-muted-foreground">jaxon.config.ts</div>
            </div>
            <div className="p-6 font-mono text-sm space-y-2 overflow-hidden">
              <div className="flex">
                <span className="text-muted-foreground w-8 select-none">1</span>
                <span className="text-purple-500">export</span> <span className="text-blue-500">const</span> <span className="text-yellow-500">developer</span> = {"{"}
              </div>
              <div className="flex">
                <span className="text-muted-foreground w-8 select-none">2</span>
                <span className="pl-4 text-red-400">name</span>: <span className="text-green-500">"Jaxon Tan"</span>,
              </div>
              <div className="flex">
                <span className="text-muted-foreground w-8 select-none">3</span>
                <span className="pl-4 text-red-400">role</span>: <span className="text-green-500">"Software Engineer"</span>,
              </div>
              <div className="flex">
                <span className="text-muted-foreground w-8 select-none">4</span>
                <span className="pl-4 text-red-400">skills</span>: [
              </div>
              <div className="flex">
                <span className="text-muted-foreground w-8 select-none">5</span>
                <span className="pl-8 text-green-500">"TypeScript"</span>, <span className="text-green-500">"React"</span>, <span className="text-green-500">"Python"</span>
              </div>
              <div className="flex">
                <span className="text-muted-foreground w-8 select-none">6</span>
                <span className="pl-4">],</span>
              </div>
              <div className="flex">
                <span className="text-muted-foreground w-8 select-none">7</span>
                <span className="pl-4 text-red-400">status</span>: <span className="text-blue-500">"Ready to deploy"</span>
              </div>
              <div className="flex">
                <span className="text-muted-foreground w-8 select-none">8</span>
                {"};"}
              </div>
            </div>
            
            {/* Floating Badges */}
            <div className="absolute -right-6 top-20 bg-card border border-border p-3 shadow-lg flex items-center gap-3 animate-bounce duration-[3000ms]">
              <div className="p-2 bg-blue-500/10 text-blue-500 rounded-sm">
                <Code size={20} />
              </div>
              <div>
                <div className="text-xs text-muted-foreground font-mono">Stack</div>
                <div className="font-bold text-sm">Full Stack</div>
              </div>
            </div>
            
            <div className="absolute -left-6 bottom-20 bg-card border border-border p-3 shadow-lg flex items-center gap-3 animate-bounce duration-[4000ms]">
              <div className="p-2 bg-primary/10 text-primary rounded-sm">
                <Cpu size={20} />
              </div>
              <div>
                <div className="text-xs text-muted-foreground font-mono">Focus</div>
                <div className="font-bold text-sm">AI & Web</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50 animate-pulse">
        <span className="text-[10px] font-mono uppercase tracking-widest">Scroll</span>
        <div className="w-[1px] h-12 bg-gradient-to-b from-foreground to-transparent"></div>
      </div>
    </section>
  );
}
