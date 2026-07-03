import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { services, getServiceBySlug } from "@/lib/data/services";
import { siteConfig } from "@/lib/config";
import { CheckCircle, Phone, MessageCircle, ArrowRight, ArrowLeft, Activity, Layers, Settings2, ShieldCheck, Server, Briefcase, Cpu } from "lucide-react";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service) return {};
  return {
    title: `${service.title} | Sai Systems`,
    description: service.description,
    keywords: service.keywords,
    alternates: { canonical: `/services/${slug}` },
  };
}

export default async function ServicePage({ params }: Props) {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service) notFound();

  const related = services
    .filter((s) => s.category === service.category && s.id !== service.id)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 pt-24">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav className="flex items-center gap-2 text-sm text-gray-400">
          <Link href="/" className="hover:text-orange-500">Home</Link>
          <span>/</span>
          <Link href="/services" className="hover:text-orange-500">Services</Link>
          <span>/</span>
          <span className="text-gray-700 dark:text-gray-200">{service.title}</span>
        </nav>
      </div>

      {/* Hero */}
      <div className="gradient-dark py-16 px-4 text-center">
        <div className="text-7xl mb-4">{service.icon}</div>
        <div className="inline-block px-3 py-1 bg-orange-500/20 text-orange-400 text-sm rounded-full mb-4">
          {service.category}
        </div>
        <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">{service.title}</h1>
        <p className="text-gray-300 max-w-2xl mx-auto text-lg">{service.description}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
          <Link
            href="/book-service"
            className="flex items-center justify-center gap-2 px-6 py-3 gradient-primary text-white font-bold rounded-xl hover:opacity-90 transition-all"
          >
            <ArrowRight size={18} /> Book This Service
          </Link>
          <a
            href={`tel:${siteConfig.phone}`}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-all border border-white/20"
          >
            <Phone size={18} /> {siteConfig.phone}
          </a>
          <a
            href={`https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(`Hi! I need ${service.title}. Can you help?`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-[#25d366] text-white font-bold rounded-xl hover:bg-[#20bd5a] transition-all"
          >
            <MessageCircle size={18} /> WhatsApp
          </a>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main content */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              What&apos;s Included in {service.title}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
              {service.features.map((feature, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-orange-50/50 dark:bg-orange-950/30 rounded-xl">
                  <CheckCircle className="text-orange-500 flex-shrink-0" size={18} />
                  <span className="text-gray-700 dark:text-gray-200 text-sm">{feature}</span>
                </div>
              ))}
            </div>

            <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Why Choose Us for {service.title}?</h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-orange-500" /> Certified technicians with proven expertise</li>
                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-orange-500" /> Free diagnosis and transparent quotation</li>
                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-orange-500" /> 365-day warranty on all repairs</li>
                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-orange-500" /> Genuine spare parts only</li>
                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-orange-500" /> Same-day and doorstep service available</li>
              </ul>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-orange-50/50 dark:bg-orange-950/30 rounded-2xl p-6 border border-orange-100 dark:border-orange-900/60">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">Get Free Quote</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Contact us now for a free diagnosis and transparent quote.
              </p>
              <div className="space-y-2">
                <a href={`tel:${siteConfig.phone}`}
                  className="flex items-center gap-2 w-full px-4 py-2.5 bg-orange-600 text-white text-sm font-semibold rounded-xl hover:bg-orange-700 transition-all">
                  <Phone size={14} /> {siteConfig.phone}
                </a>
                <a href={`https://wa.me/${siteConfig.whatsapp}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 w-full px-4 py-2.5 bg-[#25d366] text-white text-sm font-semibold rounded-xl hover:bg-[#20bd5a] transition-all">
                  <MessageCircle size={14} /> WhatsApp Now
                </a>
                <Link href="/book-service"
                  className="flex items-center gap-2 w-full px-4 py-2.5 gradient-primary text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-all">
                  <ArrowRight size={14} /> Book Service
                </Link>
              </div>
            </div>

            {related.length > 0 && (
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-4">Related Services</h3>
                <div className="space-y-3">
                  {related.map((s) => (
                    <Link key={s.id} href={`/services/${s.slug}`}
                      className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-xl hover:bg-orange-50/50 dark:hover:bg-orange-950/30 border border-gray-100 dark:border-gray-800 transition-all group">
                      <span className="text-2xl">{s.icon}</span>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-200 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                        {s.title}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Custom IT Consulting Info */}
        {(service.slug === "it-amc-support") && (
          <div className="mt-16 pt-16 border-t border-gray-100 dark:border-gray-800">
            {/* How We Work Section */}
            <div className="mb-16">
              <div className="text-center mb-10">
                <span className="inline-block px-4 py-1.5 bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-400 text-xs font-bold rounded-full mb-3 uppercase tracking-wider">
                  Our Process
                </span>
                <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
                  How We Work
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-xl mx-auto text-sm">
                  Our structured consulting approach ensures your IT systems are reliable, optimized, and ready to scale.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  {
                    step: "01",
                    title: "IT Audit & Assessment",
                    desc: "We analyze your existing hardware, workstations, servers, security, and cabling layout to identify gaps and failure points.",
                    icon: Activity,
                    color: "from-blue-600 to-indigo-700",
                  },
                  {
                    step: "02",
                    title: "Strategic Blueprint",
                    desc: "We design a customized, cost-effective IT road-map detailing upgrades, hardware configuration, and networking setup.",
                    icon: Layers,
                    color: "from-purple-600 to-pink-700",
                  },
                  {
                    step: "03",
                    title: "Setup & Deployment",
                    desc: "Our engineers configure desktops, route structured networking cables, install access points, and test failover systems.",
                    icon: Settings2,
                    color: "from-amber-600 to-orange-700",
                  },
                  {
                    step: "04",
                    title: "24/7 Managed Support",
                    desc: "We deploy monitoring clients, configure secure backups, and deliver ongoing helpdesk assistance under strict SLA response times.",
                    icon: ShieldCheck,
                    color: "from-orange-600 to-amber-700",
                  },
                ].map((item, idx) => (
                  <div key={idx} className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 relative overflow-hidden group">
                    <div className="absolute top-4 right-4 text-3xl font-black text-gray-200/50 dark:text-gray-800/50">
                      {item.step}
                    </div>
                    <div className={`w-12 h-12 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                      <item.icon size={22} />
                    </div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-xs leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* IT Support Models Section */}
            <div>
              <div className="text-center mb-10">
                <span className="inline-block px-4 py-1.5 bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-400 text-xs font-bold rounded-full mb-3 uppercase tracking-wider">
                  Support Models
                </span>
                <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
                  IT Support & Managed Services
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-xl mx-auto text-sm">
                  Flexible IT service packages tailored for small offices, growing startups, and large enterprises.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  {
                    title: "On-Call & Ad-Hoc Support",
                    desc: "Pay-as-you-go emergency IT support. Ideal for small offices needing quick fixes for printers, routers, and workstation breakdowns.",
                    features: ["Doorstep technician visit", "Same-day troubleshooting", "Genuine spares billing", "Pay-per-incident rates"],
                    icon: Cpu,
                  },
                  {
                    title: "Annual Maintenance (AMC)",
                    desc: "Comprehensive IT care under a yearly contract. We keep your systems clean, updated, and secured with zero emergency visit fees.",
                    features: ["Monthly proactive checkups", "Unlimited breakdown calls", "Priority 2-hour SLA response", "Free inventory auditing"],
                    icon: Briefcase,
                    recommended: true,
                  },
                  {
                    title: "Full Managed IT Helpdesk",
                    desc: "Our team becomes your virtual IT department. We monitor servers, protect endpoints, route emails, and configure cloud backups.",
                    features: ["Remote ticketing helpdesk", "24/7 Server monitoring", "Antivirus & backup policies", "Employee onboarding setup"],
                    icon: Server,
                  },
                ].map((model, idx) => (
                  <div key={idx} className={`bg-gray-50 dark:bg-gray-900 rounded-2xl p-8 border ${model.recommended ? "border-orange-500 dark:border-orange-500/50 shadow-lg shadow-orange-500/5 relative" : "border-gray-100 dark:border-gray-800"} flex flex-col`}>
                    {model.recommended && (
                      <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-orange-600 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full">
                        Highly Popular
                      </span>
                    )}
                    <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-400 flex items-center justify-center mb-6">
                      <model.icon size={22} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{model.title}</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-xs leading-relaxed mb-6">{model.desc}</p>
                    <ul className="space-y-3 mt-auto border-t border-gray-100 dark:border-gray-800 pt-6">
                      {model.features.map((f, i) => (
                        <li key={i} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                          <CheckCircle size={14} className="text-orange-500 flex-shrink-0" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="mt-10">
          <Link href="/services" className="inline-flex items-center gap-2 text-orange-600 dark:text-orange-400 hover:underline">
            <ArrowLeft size={16} /> Back to All Services
          </Link>
        </div>
      </div>
    </div>
  );
}
