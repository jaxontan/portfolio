import { Progress } from "@/components/ui/progress";

const skills = [
  {
    category: "Frontend",
    items: [
      { name: "React / Next.js", level: 90 },
      { name: "TypeScript", level: 85 },
      { name: "Tailwind CSS", level: 95 },
      { name: "HTML / CSS", level: 95 }
    ]
  },
  {
    category: "Backend",
    items: [
      { name: "Node.js", level: 80 },
      { name: "Python", level: 75 },
      { name: "SQL / NoSQL", level: 70 },
      { name: "REST APIs", level: 85 }
    ]
  },
  {
    category: "Tools & Others",
    items: [
      { name: "Git / GitHub", level: 90 },
      { name: "Figma", level: 70 },
      { name: "Docker", level: 60 },
      { name: "Linux", level: 75 }
    ]
  }
];

export default function Expertise() {
  return (
    <section id="expertise" className="py-24 border-b border-border bg-card">
      <div className="container">
        <div className="mb-16">
          <span className="text-primary font-mono text-sm tracking-wider mb-2 block">03. EXPERTISE</span>
          <h2 className="text-4xl font-bold tracking-tight">TECHNICAL <br />ARSENAL</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {skills.map((group) => (
            <div key={group.category} className="space-y-8">
              <h3 className="text-xl font-bold border-b-2 border-primary pb-2 inline-block">{group.category}</h3>
              <div className="space-y-6">
                {group.items.map((skill) => (
                  <div key={skill.name} className="space-y-2 group">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium group-hover:text-primary transition-colors">{skill.name}</span>
                      <span className="font-mono text-muted-foreground">{skill.level}%</span>
                    </div>
                    <Progress value={skill.level} className="h-1.5 bg-secondary rounded-none [&>div]:bg-primary" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        {/* Tech Stack Marquee (Visual Only) */}
        <div className="mt-24 pt-12 border-t border-border overflow-hidden relative">
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-card to-transparent z-10"></div>
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-card to-transparent z-10"></div>
          
          <div className="flex whitespace-nowrap animate-marquee">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex gap-12 mx-6 font-mono text-4xl font-bold text-muted/20 select-none">
                <span>REACT</span>
                <span>TYPESCRIPT</span>
                <span>NODE.JS</span>
                <span>PYTHON</span>
                <span>NEXT.JS</span>
                <span>TAILWIND</span>
                <span>GIT</span>
                <span>DOCKER</span>
                <span>FIGMA</span>
                <span>LINUX</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
