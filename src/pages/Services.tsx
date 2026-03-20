import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { StaggerChildren, staggerItem } from '@/components/StaggerChildren';

const WHATSAPP_URL = 'https://wa.me/62XXXXXXXXXXXX?text=Hello%2C%20I%27m%20interested%20in%20your%20church%20website%20development%20service';

const features = [
  {
    title: 'Responsive Design',
    desc: 'Looks perfect on every device — desktop, tablet, and smartphone.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>
    ),
  },
  {
    title: 'Worship Schedule',
    desc: 'Display service times, church events, and congregation activities online.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
      </svg>
    ),
  },
  {
    title: 'Online Donations',
    desc: 'Integrate secure and easy-to-use digital offering and donation features.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
        <path d="M12 6v12M8 10h8M9 14h6" />
      </svg>
    ),
  },
  {
    title: 'Content Management',
    desc: 'Manage devotionals, announcements, and church content easily — no technical skills required.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6M8 13h8M8 17h6" />
      </svg>
    ),
  },
];

const steps = [
  { num: '01', title: 'Consultation', desc: 'Tell us about your church\'s needs. We listen and understand your vision.' },
  { num: '02', title: 'Design & Development', desc: 'Our team designs and builds a website that reflects your church\'s identity.' },
  { num: '03', title: 'Launch & Support', desc: 'Your website goes live and we guide your team through the transition.' },
];

export default function Services() {
  const { ref: heroRef, isInView: heroInView } = useScrollReveal();
  const { ref: processRef, isInView: processInView } = useScrollReveal();
  const { ref: ctaRef, isInView: ctaInView } = useScrollReveal();

  return (
    <>
      <Navbar />

      {/* Hero */}
      <section ref={heroRef} className="pt-32 pb-20 md:pt-40 md:pb-28 bg-background">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="inline-block font-sans text-xs uppercase tracking-[0.25em] text-gold mb-5"
          >
            Services
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-serif text-4xl md:text-5xl lg:text-6xl font-semibold text-foreground mb-6 leading-tight"
          >
            We Help Your Church<br />Go Digital
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="font-sans text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          >
            From beautiful design to the features your congregation needs — we build church websites that glorify God and serve others.
          </motion.p>
        </div>
      </section>

      {/* Divider */}
      <div className="h-px opacity-40 max-w-2xl mx-auto" style={{ background: 'linear-gradient(90deg, transparent, hsl(var(--gold)), transparent)' }} />

      {/* Features */}
      <section className="py-20 md:py-28 bg-background">
        <div className="max-w-5xl mx-auto px-8">
          <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {features.map((f) => (
              <motion.div
                key={f.title}
                variants={staggerItem}
                className="group relative p-8 rounded-2xl border border-divider bg-card hover:border-gold/30 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center text-gold mb-5 group-hover:bg-gold/20 transition-colors duration-300">
                  {f.icon}
                </div>
                <h3 className="font-serif text-xl font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="font-sans text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* Process */}
      <section ref={processRef} className="py-20 md:py-28 bg-dark">
        <div className="max-w-4xl mx-auto px-8">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={processInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="font-serif text-3xl md:text-4xl font-semibold text-parchment text-center mb-16"
          >
            How It Works
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
            {steps.map((s, i) => (
              <motion.div
                key={s.num}
                initial={{ opacity: 0, y: 40 }}
                animate={processInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7, delay: 0.15 * i }}
                className="text-center"
              >
                <span className="block font-serif text-5xl font-semibold text-gold/30 mb-3">{s.num}</span>
                <h3 className="font-serif text-xl font-semibold text-parchment mb-2">{s.title}</h3>
                <p className="font-sans text-sm text-muted-warm leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section ref={ctaRef} className="py-24 md:py-32 bg-background">
        <div className="max-w-3xl mx-auto px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={ctaInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
          >
            <svg className="mx-auto mb-6" width="20" height="28" viewBox="0 0 20 28" fill="none">
              <path d="M10 0V28M2 8H18" stroke="hsl(var(--gold))" strokeWidth="1.5" />
            </svg>
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground mb-4">
              Ready to Get Started?
            </h2>
            <p className="font-sans text-base text-muted-foreground mb-10 max-w-lg mx-auto leading-relaxed">
              Reach out to us via WhatsApp for a free consultation. Tell us about your church's needs and let's build it together.
            </p>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 font-sans text-xs uppercase tracking-[0.2em] px-10 py-4 bg-gold text-primary-foreground hover:bg-gold-light transition-all duration-300"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Contact via WhatsApp
            </a>
          </motion.div>
        </div>
      </section>

      <Footer />
    </>
  );
}