import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, Mail, MapPin, Phone } from "lucide-react";

export default function Contact() {
  return (
    <section id="contact" className="py-24 bg-secondary/5">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div className="space-y-8">
            <div>
              <span className="text-primary font-mono text-sm tracking-wider mb-2 block">04. CONTACT</span>
              <h2 className="text-5xl md:text-6xl font-bold tracking-tighter mb-6">LET'S WORK <br />TOGETHER</h2>
              <p className="text-lg text-muted-foreground max-w-md">
                Have a project in mind or just want to say hi? I'm always open to discussing new opportunities and ideas.
              </p>
            </div>

            <div className="space-y-6 py-8">
              <a href="mailto:yjtanyuejun@outlook.com" className="flex items-center gap-4 group">
                <div className="w-12 h-12 bg-card border border-border flex items-center justify-center group-hover:border-primary group-hover:text-primary transition-colors">
                  <Mail size={20} />
                </div>
                <div>
                  <div className="text-xs font-mono text-muted-foreground uppercase">Email</div>
                  <div className="text-lg font-medium group-hover:text-primary transition-colors">yjtanyuejun@outlook.com</div>
                </div>
              </a>
              
              <a href="tel:+6588336542" className="flex items-center gap-4 group">
                <div className="w-12 h-12 bg-card border border-border flex items-center justify-center group-hover:border-primary group-hover:text-primary transition-colors">
                  <Phone size={20} />
                </div>
                <div>
                  <div className="text-xs font-mono text-muted-foreground uppercase">Phone</div>
                  <div className="text-lg font-medium group-hover:text-primary transition-colors">+65 8833 6542</div>
                </div>
              </a>
              
              <div className="flex items-center gap-4 group">
                <div className="w-12 h-12 bg-card border border-border flex items-center justify-center group-hover:border-primary group-hover:text-primary transition-colors">
                  <MapPin size={20} />
                </div>
                <div>
                  <div className="text-xs font-mono text-muted-foreground uppercase">Location</div>
                  <div className="text-lg font-medium group-hover:text-primary transition-colors">Singapore</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border p-8 md:p-12 shadow-2xl relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-transparent"></div>
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-mono uppercase">Name</label>
                  <Input id="name" placeholder="John Doe" className="rounded-none border-border focus:border-primary bg-background" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-mono uppercase">Email</label>
                  <Input id="email" type="email" placeholder="john@example.com" className="rounded-none border-border focus:border-primary bg-background" />
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="subject" className="text-sm font-mono uppercase">Subject</label>
                <Input id="subject" placeholder="Project Inquiry" className="rounded-none border-border focus:border-primary bg-background" />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-mono uppercase">Message</label>
                <Textarea id="message" placeholder="Tell me about your project..." className="min-h-[150px] rounded-none border-border focus:border-primary bg-background resize-none" />
              </div>
              
              <Button type="submit" size="lg" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-mono rounded-none group">
                SEND MESSAGE <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
