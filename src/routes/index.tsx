import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowDown,
  ArrowRight,
  BookMarked,
  BookOpen,
  CheckCircle2,
  Download,
  FileText,
  GraduationCap,
  Linkedin,
  Mail,
  Menu,
  Quote,
  ScrollText,
  Send,
  X,
} from "lucide-react";
import { FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import libraryImage from "@/assets/scholarly-library.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Harun Chaudhari | English Literature Scholar" },
      { name: "description", content: "Academic portfolio and bio-data of Harun Chaudhari, Ph.D. candidate researching logic and mysticism in Thomas Browne." },
      { property: "og:title", content: "Harun Chaudhari | English Literature Scholar" },
      { property: "og:description", content: "Research, teaching experience, and academic resources from English Literature scholar Harun Chaudhari." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AcademicPortfolio,
});

const navigation = [
  ["About", "about"],
  ["Research", "research"],
  ["Teaching", "teaching"],
  ["Resources", "resources"],
  ["Contact", "contact"],
] as const;

const resources = [
  { type: "Study guide", title: "Approaching Seventeenth-Century Prose", detail: "PDF · 12 pages" },
  { type: "Course material", title: "Literary Theory: Essential Concepts", detail: "PDF · 18 pages" },
  { type: "Research notes", title: "Thomas Browne: Selected Bibliography", detail: "PDF · 8 pages" },
];

function downloadPlaceholder(fileName: string, title: string) {
  const content = `${title}\n\nAcademic resource by Harun Chaudhari.\nThis is a placeholder document for the portfolio demonstration.`;
  const url = URL.createObjectURL(new Blob([content], { type: "text/plain" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

function AcademicPortfolio() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.currentTarget.reset();
    setSent(true);
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-primary-foreground/10 bg-primary/95 text-primary-foreground backdrop-blur-md">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-12">
          <a href="#home" className="group flex items-center gap-3" aria-label="Harun Chaudhari, home">
            <span className="grid size-9 place-items-center border border-primary-foreground/30 font-serif text-sm font-bold">HC</span>
            <span className="hidden font-serif text-base sm:block">Harun Chaudhari</span>
          </a>
          <nav className="hidden items-center gap-7 lg:flex" aria-label="Main navigation">
            {navigation.map(([label, id]) => (
              <a key={id} href={`#${id}`} className="text-sm text-primary-foreground/75 transition-colors hover:text-primary-foreground">
                {label}
              </a>
            ))}
          </nav>
          <Button variant="heroOutline" size="icon" className="lg:hidden" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? "Close navigation" : "Open navigation"}>
            {menuOpen ? <X /> : <Menu />}
          </Button>
        </div>
        {menuOpen && (
          <nav className="border-t border-primary-foreground/10 bg-primary px-5 py-4 lg:hidden" aria-label="Mobile navigation">
            {navigation.map(([label, id]) => (
              <a key={id} href={`#${id}`} onClick={() => setMenuOpen(false)} className="block border-b border-primary-foreground/10 py-3 text-sm text-primary-foreground/80 last:border-0">
                {label}
              </a>
            ))}
          </nav>
        )}
      </header>

      <main>
        <section id="home" className="relative flex min-h-[min(860px,100svh)] scroll-mt-18 items-end overflow-hidden bg-primary pt-24 text-primary-foreground">
          <img src={libraryImage} alt="An open historic book in a scholarly reading room" width={1600} height={1000} className="absolute inset-0 h-full w-full object-cover object-[68%_center]" />
          <div className="hero-overlay absolute inset-0" />
          <div className="relative mx-auto w-full max-w-7xl px-5 pb-16 sm:px-8 sm:pb-20 lg:px-12 lg:pb-24">
            <div className="max-w-3xl">
              <div className="mb-7 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.22em] text-accent">
                <span className="h-px w-10 bg-accent" /> English Literature & Academic Research
              </div>
              <h1 className="font-serif text-5xl leading-[1.08] sm:text-6xl lg:text-7xl">Harun<br className="hidden sm:block" /> Chaudhari</h1>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-primary-foreground/80 sm:text-xl">Ph.D. Candidate in English Literature &amp; Academic Researcher</p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Button variant="hero" size="lg" asChild><a href="#research">View Research <ArrowDown /></a></Button>
                <Button variant="heroOutline" size="lg" onClick={() => downloadPlaceholder("Harun-Chaudhari-CV.txt", "Curriculum Vitae — Harun Chaudhari")}><Download /> Download Full CV</Button>
              </div>
            </div>
            <a href="#about" aria-label="Continue to biography" className="absolute bottom-8 right-8 hidden size-12 place-items-center rounded-full border border-primary-foreground/30 text-primary-foreground/70 transition-colors hover:text-primary-foreground lg:grid"><ArrowDown className="size-5" /></a>
          </div>
        </section>

        <section id="about" className="scroll-mt-18 bg-background py-20 sm:py-28">
          <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20 lg:px-12">
            <div>
              <SectionLabel number="01">About &amp; Bio-Data</SectionLabel>
              <h2 className="mt-5 max-w-xl font-serif text-3xl leading-tight sm:text-4xl">A life dedicated to literature, inquiry, and the classroom.</h2>
              <p className="mt-7 max-w-xl text-base leading-8 text-muted-foreground">A dedicated literature scholar with a focused interest in seventeenth-century prose, Harun Chaudhari studies the rich intersections of reason, faith, language, and imagination. His academic work brings close reading and historical inquiry together to illuminate enduring literary questions.</p>
              <blockquote className="mt-8 border-l-2 border-accent pl-5 font-serif text-lg italic leading-relaxed text-primary">“To read deeply is to enter a conversation across centuries.”</blockquote>
            </div>
            <div className="border border-border bg-card shadow-sm">
              <div className="border-b border-border px-6 py-5 sm:px-8"><p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Personal particulars</p></div>
              <dl className="divide-y divide-border">
                <BioRow term="Age" value="33" />
                <BioRow term="Marital Status" value="Married" />
                <BioRow term="Core Qualification" value="GSET (Gujarat State Eligibility Test) Cleared" important />
              </dl>
            </div>
          </div>
        </section>

        <section id="research" className="scroll-mt-18 bg-secondary py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
            <SectionLabel number="02">Research &amp; Scholarship</SectionLabel>
            <div className="mt-10 grid overflow-hidden border border-border bg-card shadow-md lg:grid-cols-[0.37fr_0.63fr]">
              <div className="flex min-h-72 flex-col justify-between bg-primary p-8 text-primary-foreground sm:p-10">
                <GraduationCap className="size-10 text-accent" strokeWidth={1.5} />
                <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Current doctoral research</p><p className="mt-3 text-sm leading-6 text-primary-foreground/60">English Literature<br />Seventeenth-Century Studies</p></div>
              </div>
              <div className="p-8 sm:p-10 lg:p-14">
                <Quote className="size-8 text-accent" />
                <h2 className="mt-6 font-serif text-3xl leading-tight sm:text-4xl">“Logic and mysticism in the selected works of Thomas Browne”</h2>
                <p className="mt-7 leading-8 text-muted-foreground">This doctoral study examines the productive tension between rational inquiry and mystical thought in selected prose works by Sir Thomas Browne. Through close analysis of seventeenth-century treatises and essays, the research considers how Browne’s language reconciles empirical observation, theological reflection, and imaginative wonder.</p>
                <div className="mt-8 flex flex-wrap gap-2"><Tag>Thomas Browne</Tag><Tag>Early Modern Prose</Tag><Tag>Logic &amp; Mysticism</Tag></div>
              </div>
            </div>
          </div>
        </section>

        <section id="teaching" className="scroll-mt-18 bg-background py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
            <SectionLabel number="03">Teaching &amp; Professional Experience</SectionLabel>
            <div className="mt-10 grid gap-12 lg:grid-cols-2 lg:gap-20">
              <div className="relative border-l border-border pl-8">
                <span className="absolute -left-2 top-1 size-4 rounded-full border-4 border-background bg-accent" />
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Previous role</p>
                <h2 className="mt-3 font-serif text-2xl leading-snug sm:text-3xl">Assistant Professor of English</h2>
                <p className="mt-3 text-base font-semibold text-primary">Shree Morarji Desai Arts &amp; Com. College, Buhari</p>
                <p className="mt-6 leading-8 text-muted-foreground">Taught undergraduate English with an emphasis on rigorous textual interpretation, accessible instruction, and active student engagement.</p>
              </div>
              <div>
                <div className="flex items-center gap-3"><BookOpen className="size-6 text-accent" /><h3 className="font-serif text-2xl">Pedagogical Expertise</h3></div>
                <p className="mt-5 leading-8 text-muted-foreground">Experienced in developing higher education curricula, structured study guides, and multiple-choice questions designed to strengthen comprehension and assessment outcomes.</p>
                <div className="mt-7 flex flex-wrap gap-2"><Tag>Environmental Literature</Tag><Tag>Literary Theory</Tag><Tag>English Grammar</Tag></div>
              </div>
            </div>
          </div>
        </section>

        <section id="resources" className="scroll-mt-18 border-y border-border bg-secondary py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div><SectionLabel number="04">Resources &amp; Portfolio</SectionLabel><h2 className="mt-5 font-serif text-3xl sm:text-4xl">Materials for students &amp; scholars</h2></div>
              <p className="max-w-md text-sm leading-6 text-muted-foreground">Selected guides, course materials, and working notes from teaching and research.</p>
            </div>
            <div className="mt-10 grid gap-px border border-border bg-border md:grid-cols-3">
              {resources.map((resource, index) => (
                <article key={resource.title} className="group flex min-h-72 flex-col bg-card p-7 sm:p-8">
                  <div className="flex items-start justify-between"><span className="grid size-11 place-items-center bg-secondary text-primary"><FileText className="size-5" /></span><span className="font-serif text-sm text-muted-foreground">0{index + 1}</span></div>
                  <p className="mt-8 text-xs font-bold uppercase tracking-[0.16em] text-accent-foreground">{resource.type}</p>
                  <h3 className="mt-3 font-serif text-xl leading-snug">{resource.title}</h3>
                  <div className="mt-auto flex items-center justify-between pt-7"><span className="text-xs text-muted-foreground">{resource.detail}</span><Button variant="ghost" size="icon" aria-label={`Download ${resource.title}`} onClick={() => downloadPlaceholder(`${resource.title.replaceAll(" ", "-")}.txt`, resource.title)}><Download /></Button></div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="contact" className="scroll-mt-18 bg-primary py-20 text-primary-foreground sm:py-28">
          <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20 lg:px-12">
            <div><SectionLabel number="05" inverse>Contact</SectionLabel><h2 className="mt-5 font-serif text-4xl leading-tight sm:text-5xl">Let’s begin a scholarly conversation.</h2><p className="mt-6 max-w-md leading-7 text-primary-foreground/65">For academic correspondence, research discussions, or teaching opportunities, please send a message.</p><div className="mt-9 flex items-center gap-3 text-sm text-primary-foreground/75"><Mail className="size-5 text-accent" /> Academic enquiries welcome</div></div>
            <form onSubmit={handleSubmit} className="grid gap-5" aria-label="Contact form">
              <div className="grid gap-5 sm:grid-cols-2"><Field label="Name" name="name" type="text" /><Field label="Email" name="email" type="email" /></div>
              <label className="grid gap-2 text-sm"><span className="text-primary-foreground/70">Message</span><textarea required name="message" rows={5} className="resize-none border border-primary-foreground/25 bg-primary-foreground/5 px-4 py-3 text-primary-foreground outline-none transition-colors placeholder:text-primary-foreground/35 focus:border-accent" placeholder="Write your message here..." /></label>
              <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center"><Button variant="hero" size="lg" type="submit"><Send /> Submit Message</Button>{sent && <p className="flex items-center gap-2 text-sm text-accent" role="status"><CheckCircle2 className="size-4" /> Thank you. Your message has been noted.</p>}</div>
            </form>
          </div>
        </section>
      </main>

      <footer className="bg-footer text-footer-foreground">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-8 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-12">
          <div><p className="font-serif">Harun Chaudhari</p><p className="mt-1 text-xs text-footer-foreground/55">© 2026. Academic Portfolio. All rights reserved.</p></div>
          <div className="flex items-center gap-2"><a href="https://www.linkedin.com" target="_blank" rel="noreferrer" className="grid size-10 place-items-center border border-footer-foreground/20 transition-colors hover:border-accent hover:text-accent" aria-label="LinkedIn"><Linkedin className="size-4" /></a><a href="https://scholar.google.com" target="_blank" rel="noreferrer" className="grid size-10 place-items-center border border-footer-foreground/20 transition-colors hover:border-accent hover:text-accent" aria-label="Google Scholar"><BookMarked className="size-4" /></a></div>
        </div>
      </footer>
    </div>
  );
}

function SectionLabel({ number, children, inverse = false }: { number: string; children: React.ReactNode; inverse?: boolean }) {
  return <div className={`flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] ${inverse ? "text-accent" : "text-accent-foreground"}`}><span>{number}</span><span className={`h-px w-8 ${inverse ? "bg-accent" : "bg-accent-foreground"}`} />{children}</div>;
}

function BioRow({ term, value, important = false }: { term: string; value: string; important?: boolean }) {
  return <div className="grid gap-2 px-6 py-5 sm:grid-cols-[0.4fr_0.6fr] sm:px-8"><dt className="text-sm text-muted-foreground">{term}</dt><dd className={`text-sm font-semibold ${important ? "flex items-start gap-2 text-primary" : "text-foreground"}`}>{important && <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-accent-foreground" />}{value}</dd></div>;
}

function Tag({ children }: { children: React.ReactNode }) {
  return <span className="border border-border bg-background px-3 py-1.5 text-xs font-semibold text-primary">{children}</span>;
}

function Field({ label, name, type }: { label: string; name: string; type: string }) {
  return <label className="grid gap-2 text-sm"><span className="text-primary-foreground/70">{label}</span><input required name={name} type={type} className="h-12 border border-primary-foreground/25 bg-primary-foreground/5 px-4 text-primary-foreground outline-none transition-colors placeholder:text-primary-foreground/35 focus:border-accent" placeholder={label === "Name" ? "Your full name" : "you@example.com"} /></label>;
}