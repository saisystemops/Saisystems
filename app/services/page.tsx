import type { Metadata } from "next";
import Link from "next/link";
import { serviceCategories, getServicesByCategory } from "@/lib/data/services";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "All Services | Computer, Laptop, Networking Repair",
  description: "Browse all IT services from Sai Systems — laptop repair, computer repair, networking, antivirus, monitor repair, projector services, and more.",
  alternates: { canonical: "/services" },
};

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 pt-24">
      {/* Hero */}
      <div className="gradient-dark py-16 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Our <span className="text-gradient">Services</span>
        </h1>
        <p className="text-gray-300 max-w-2xl mx-auto text-lg">
          Comprehensive IT services for home users, students, businesses, schools, hospitals, and startups across India.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {serviceCategories.map((category) => {
          const categoryServices = getServicesByCategory(category);
          return (
            <div key={category} className="mb-16">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                <span className="w-1 h-8 gradient-primary rounded-full inline-block" />
                {category}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {categoryServices.map((service) => (
                  <Link
                    key={service.id}
                    href={`/services/${service.slug}`}
                    id={`service-page-${service.id}`}
                    className="group card-hover bg-gray-50 dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 hover:border-orange-200 dark:hover:border-orange-900/60"
                  >
                    <div className="text-3xl mb-3">{service.icon}</div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">
                      {service.description}
                    </p>
                    <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400 text-sm font-medium">
                      Learn More <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
