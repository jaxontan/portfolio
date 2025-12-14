import { Badge } from "@/components/ui/badge";

export default function About() {
  return (
    <section id="about" className="py-24 border-b border-border">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column - Title & Image */}
          <div className="lg:col-span-5 space-y-8">
            <div>
              <span className="text-primary font-mono text-sm tracking-wider mb-2 block">02. ABOUT ME</span>
              <h2 className="text-4xl font-bold tracking-tight mb-6">ENGINEERING <br />THE FUTURE</h2>
            </div>
            
            <div className="relative aspect-[3/4] w-full max-w-md bg-muted border-2 border-border p-2">
              <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-primary z-10"></div>
              <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-primary z-10"></div>
              <div className="w-full h-full bg-secondary/20 overflow-hidden relative grayscale hover:grayscale-0 transition-all duration-500">
                {/* Profile Image Placeholder */}
                <img 
                  src="/profile.jpg" 
                  alt="Jaxon Tan" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "https://placehold.co/600x800/1a1a1a/fafafa?text=JT";
                  }}
                />
                <div className="absolute inset-0 bg-primary/10 mix-blend-overlay"></div>
              </div>
            </div>
          </div>

          {/* Right Column - Content */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-8">
            <div className="space-y-6 text-lg leading-relaxed">
              <p>
                I'm a <span className="font-bold text-foreground bg-primary/10 px-1">Software Engineering student</span> at Nanyang Polytechnic 
                with a passion for building products that make a difference.
              </p>
              <p className="text-muted-foreground">
                My journey began with curiosity about how digital products work, and evolved into creating them. 
                I specialize in full-stack development, with a growing interest in AI integration and product design.
                I believe in writing clean, maintainable code and designing intuitive user experiences.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-8 border-y border-border/50">
              <div className="space-y-2">
                <h3 className="font-mono text-sm text-muted-foreground uppercase tracking-wider">Education</h3>
                <p className="font-bold">Nanyang Polytechnic</p>
                <p className="text-sm text-muted-foreground">Diploma in Infocomm & Media Engineering</p>
                <p className="text-xs font-mono text-primary mt-1">2022 — Present</p>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-mono text-sm text-muted-foreground uppercase tracking-wider">Location</h3>
                <p className="font-bold">Singapore</p>
                <p className="text-sm text-muted-foreground">Available for remote work</p>
                <p className="text-xs font-mono text-primary mt-1">GMT+8</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-mono text-sm text-muted-foreground uppercase tracking-wider">Interests</h3>
              <div className="flex flex-wrap gap-2">
                {["AI Integration", "Web Development", "Product Design", "IoT", "Networking"].map((interest) => (
                  <Badge key={interest} variant="outline" className="rounded-none py-1.5 px-3 font-normal hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors cursor-default">
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
