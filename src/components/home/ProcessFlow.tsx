const steps = [
  {
    step: "01",
    title: "Customer Books Service",
    description: "Book via our website, WhatsApp, or phone. Describe your issue and preferred time.",
    icon: "📋",
  },
  {
    step: "02",
    title: "Technician Assigned",
    description: "A certified technician nearest to you is assigned within minutes.",
    icon: "👨‍🔧",
  },
  {
    step: "03",
    title: "Diagnosis",
    description: "Thorough diagnosis of your device to identify the exact issue.",
    icon: "🔍",
  },
  {
    step: "04",
    title: "Quotation Approval",
    description: "You receive a transparent quote. Work begins only after your approval.",
    icon: "✅",
  },
  {
    step: "05",
    title: "Repair & Testing",
    description: "Expert repair using genuine parts, followed by comprehensive testing.",
    icon: "🔧",
  },
  {
    step: "06",
    title: "Delivery",
    description: "Your repaired device is returned with warranty documentation.",
    icon: "🚀",
  },
];

export default function ProcessFlow() {
  return (
    <section id="process" className="section-padding bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="inline-block px-4 py-1.5 bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400 text-sm font-semibold rounded-full mb-4">
            How It Works
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Simple{" "}
            <span className="text-gradient">6-Step Process</span>
          </h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            Getting your device repaired is easy with Sai Systems.
            From booking to delivery — we handle everything.
          </p>
        </div>

        <div className="relative">
          {/* Connector line */}
          <div className="hidden lg:block absolute top-16 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-green-500 via-emerald-400 to-green-500 opacity-30" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {steps.map((step, idx) => (
              <div key={idx} className="relative group">
                {/* Connector arrow (mobile) */}
                {idx < steps.length - 1 && (
                  <div className="lg:hidden absolute -bottom-4 left-1/2 -translate-x-1/2 text-green-500 text-xl z-10">
                    ↓
                  </div>
                )}

                <div className="card-hover bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-700 text-center h-full">
                  {/* Step number */}
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full gradient-primary text-white font-bold text-sm mb-4 shadow-lg shadow-green-900/30">
                    {step.step}
                  </div>

                  <div className="text-4xl mb-3">{step.icon}</div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
