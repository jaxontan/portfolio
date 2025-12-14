import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, Github } from "lucide-react";

const projects = [
  {
    id: 1,
    title: "Personal Schedule App",
    category: "Full Stack",
    year: "2025",
    description: "A comprehensive scheduling application built with React and Node.js to manage daily tasks and events efficiently.",
    tags: ["React", "Node.js", "MongoDB", "Express"],
    link: "#",
    github: "#"
  },
  {
    id: 2,
    title: "Snake Game (OOP)",
    category: "Game Dev",
    year: "2024",
    description: "A classic Snake game implementation demonstrating Object-Oriented Programming principles and design patterns.",
    tags: ["Python", "PyGame", "OOP"],
    link: "#",
    github: "#"
  },
  {
    id: 3,
    title: "Movie Themed Website",
    category: "Web Design",
    year: "2024",
    description: "An immersive movie discovery platform featuring dynamic content loading and responsive design.",
    tags: ["HTML/CSS", "JavaScript", "API Integration"],
    link: "#",
    github: "#"
  }
];

export default function Work() {
  return (
    <section id="work" className="py-24 border-b border-border bg-secondary/5">
      <div className="container">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div>
            <span className="text-primary font-mono text-sm tracking-wider mb-2 block">01. SELECTED WORK</span>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">FEATURED <br />PROJECTS</h2>
          </div>
          <p className="text-muted-foreground max-w-md text-sm md:text-base">
            A collection of projects that demonstrate my technical capabilities and problem-solving approach.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card key={project.id} className="group border-2 border-border bg-card hover:border-primary transition-colors duration-300 rounded-none overflow-hidden flex flex-col h-full">
              <CardHeader className="p-0">
                <div className="aspect-video bg-muted relative overflow-hidden group-hover:bg-muted/80 transition-colors">
                  {/* Placeholder for project image */}
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/20 font-bold text-6xl select-none">
                    {project.id.toString().padStart(2, '0')}
                  </div>
                  <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <span className="px-4 py-2 bg-background text-foreground font-mono text-xs font-bold uppercase tracking-wider border border-border">
                      View Project
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 flex-grow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-xs font-mono text-primary mb-1 block">{project.category}</span>
                    <h3 className="text-xl font-bold group-hover:text-primary transition-colors">{project.title}</h3>
                  </div>
                  <span className="text-xs font-mono text-muted-foreground border border-border px-2 py-1">{project.year}</span>
                </div>
                <p className="text-muted-foreground text-sm mb-6 line-clamp-3">
                  {project.description}
                </p>
                <div className="flex flex-wrap gap-2 mt-auto">
                  {project.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="rounded-none font-mono text-[10px] font-normal border border-border/50">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="p-6 pt-0 flex justify-between border-t border-border/50 mt-auto bg-muted/10">
                <a href={project.github} className="flex items-center gap-2 text-xs font-mono hover:text-primary transition-colors py-4">
                  <Github size={14} /> CODE
                </a>
                <a href={project.link} className="flex items-center gap-2 text-xs font-mono hover:text-primary transition-colors py-4">
                  LIVE DEMO <ArrowUpRight size={14} />
                </a>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
