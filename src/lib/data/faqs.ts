export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export const faqCategories = [
  "Laptop Repair",
  "Computer Repair",
  "Networking",
  "Antivirus",
  "Motherboard Repair",
  "Screen Replacement",
  "Battery Replacement",
  "Data Recovery",
];

export const faqs: FAQ[] = [
  // ── Laptop Repair ──────────────────────────────────────────────
  {
    id: "lr-1",
    category: "Laptop Repair",
    question: "How long does a typical laptop repair take?",
    answer: "Most laptop repairs are completed within 1–2 business days. Simple issues like keyboard replacement or RAM upgrade can be done on the same day. Complex repairs like motherboard or chip-level work may take 3–5 days. We always give you a realistic timeline before starting.",
  },
  {
    id: "lr-2",
    category: "Laptop Repair",
    question: "Do you repair all laptop brands?",
    answer: "Yes! We repair all major laptop brands including HP, Dell, Lenovo, Acer, Asus, MSI, Samsung, Toshiba, HCL, Panasonic, Compaq, MI, and more. Our certified technicians are trained on all major platforms.",
  },
  {
    id: "lr-3",
    category: "Laptop Repair",
    question: "Is there a warranty on laptop repairs?",
    answer: "Yes, all our repairs come with a 365-day service warranty. If the same issue recurs within the warranty period, we fix it free of charge. We use genuine spare parts to ensure long-lasting repairs.",
  },
  {
    id: "lr-4",
    category: "Laptop Repair",
    question: "My laptop is not turning on at all. Can you fix it?",
    answer: "Absolutely. A laptop that won't power on could have a dead battery, faulty charger, failed power circuit, or a motherboard issue. We diagnose the exact cause and provide a transparent quotation before any repair work begins.",
  },
  {
    id: "lr-5",
    category: "Laptop Repair",
    question: "How much does laptop repair cost in India?",
    answer: "Laptop repair costs vary based on the issue: Screen replacement starts from ₹2,500, keyboard replacement from ₹800, battery replacement from ₹1,200, motherboard repair from ₹2,000, and software issues from ₹500. We provide free diagnosis and a transparent quote before starting work.",
  },
  {
    id: "lr-6",
    category: "Laptop Repair",
    question: "Do you offer doorstep laptop repair?",
    answer: "Yes! We offer doorstep laptop repair service at your home or office. Our technician will visit you at your convenience. Simple repairs like OS installation, RAM upgrade, and virus removal are done on-site. For complex repairs, we may need to take the device to our service center.",
  },
  {
    id: "lr-7",
    category: "Laptop Repair",
    question: "My laptop is overheating and shutting down. What should I do?",
    answer: "Overheating is usually caused by dust-clogged cooling fans, dried thermal paste, or a failing fan. We clean the internals, replace thermal paste, and repair/replace the cooling fan if needed. This significantly improves performance and prevents damage.",
  },
  {
    id: "lr-8",
    category: "Laptop Repair",
    question: "Can you recover data from a broken laptop?",
    answer: "Yes, in most cases we can recover data from a broken laptop even if it won't boot. We use professional data recovery tools to extract your files from the hard drive or SSD. Success rates depend on the type and extent of damage.",
  },

  // ── Computer Repair ────────────────────────────────────────────
  {
    id: "cr-1",
    category: "Computer Repair",
    question: "My computer is very slow. Can you fix it?",
    answer: "Yes! A slow computer is usually caused by insufficient RAM, a failing hard drive, too many startup programs, or malware. We diagnose the root cause and recommend the most cost-effective solution — which could be a RAM upgrade, SSD replacement, or software cleanup.",
  },
  {
    id: "cr-2",
    category: "Computer Repair",
    question: "Do you repair desktop computers as well as laptops?",
    answer: "Yes, we repair both desktop PCs and laptops. Our services cover complete desktop PC repair including CPU, motherboard, RAM, graphics card, power supply, storage, and peripherals.",
  },
  {
    id: "cr-3",
    category: "Computer Repair",
    question: "My computer shows a blue screen error. What is the problem?",
    answer: "Blue Screen of Death (BSOD) can be caused by faulty RAM, failing hard drive, driver conflicts, overheating, or motherboard issues. We run a complete hardware diagnostic to identify the exact cause and fix it properly.",
  },
  {
    id: "cr-4",
    category: "Computer Repair",
    question: "Can you upgrade my old desktop to make it faster?",
    answer: "Absolutely! Common upgrades include adding more RAM, replacing the HDD with an SSD, upgrading the graphics card, and cleaning up the system. These upgrades can make an old computer feel brand new at a fraction of the cost of a new PC.",
  },
  {
    id: "cr-5",
    category: "Computer Repair",
    question: "Do you service computers under AMC (Annual Maintenance Contract)?",
    answer: "Yes, we offer AMC plans for computers and IT infrastructure. Our AMC covers preventive maintenance, priority service, discounted repairs, and regular checkups. We have AMC plans for homes, offices, schools, and corporate clients.",
  },
  {
    id: "cr-6",
    category: "Computer Repair",
    question: "My computer won't start after a power cut. Can you help?",
    answer: "Power surges can damage the power supply unit, motherboard, or other components. We diagnose power-related issues and replace faulty components. We also recommend UPS installation to protect your system from future power fluctuations.",
  },

  // ── Networking ─────────────────────────────────────────────────
  {
    id: "nw-1",
    category: "Networking",
    question: "How much does office network setup cost?",
    answer: "Office network setup costs depend on the number of users, area coverage, cabling requirements, and equipment needed. We provide a free site survey and quotation. Basic small office setups start from ₹5,000 and scale based on requirements.",
  },
  {
    id: "nw-2",
    category: "Networking",
    question: "My WiFi is very slow. Can you fix it?",
    answer: "Slow WiFi can be due to router placement, channel congestion, ISP issues, or outdated equipment. We diagnose the issue, optimize router settings, place access points strategically, and upgrade equipment if needed to deliver fast, reliable WiFi.",
  },
  {
    id: "nw-3",
    category: "Networking",
    question: "Can you set up a network for my new office?",
    answer: "Yes! We provide complete office networking solutions including structured cabling, router and switch setup, WiFi access points, server installation, and firewall configuration. We handle everything from design to installation to handover.",
  },
  {
    id: "nw-4",
    category: "Networking",
    question: "Do you provide network security services?",
    answer: "Yes. We configure firewalls, set up VPNs, implement network segmentation, configure secure WiFi with WPA3, and provide regular security audits. Protecting your business network is a top priority for us.",
  },
  {
    id: "nw-5",
    category: "Networking",
    question: "Can you set up remote access for our employees?",
    answer: "Yes. We set up VPN solutions that allow employees to securely access the office network from anywhere. We support various VPN protocols and can integrate with your existing infrastructure.",
  },
  {
    id: "nw-6",
    category: "Networking",
    question: "My network keeps dropping. What could be the issue?",
    answer: "Network drops can be caused by a faulty router, cable issues, ISP problems, interference, or overloaded access points. We run a full network diagnostic to identify the issue and provide a permanent fix rather than just a temporary workaround.",
  },

  // ── Antivirus ──────────────────────────────────────────────────
  {
    id: "av-1",
    category: "Antivirus",
    question: "Which antivirus is best for home use in India?",
    answer: "For home use, we recommend Quick Heal Total Security or K7 Total Security — both are excellent India-focused antivirus solutions with strong malware detection, good performance, and affordable pricing. We are an authorized reseller for both.",
  },
  {
    id: "av-2",
    category: "Antivirus",
    question: "My computer has a virus. Can you remove it without losing data?",
    answer: "Yes, in most cases we remove viruses completely while preserving your data. We use professional malware removal tools and procedures. If the infection is severe, we may need to reinstall the OS, but we always back up your data first.",
  },
  {
    id: "av-3",
    category: "Antivirus",
    question: "How often should I update my antivirus?",
    answer: "Your antivirus should update its virus definitions daily — this is automatic with most modern antivirus software. The software itself should be updated whenever new versions are released. We recommend enabling automatic updates for both.",
  },
  {
    id: "av-4",
    category: "Antivirus",
    question: "Is free antivirus enough for my computer?",
    answer: "Free antivirus provides basic protection but lacks advanced features like ransomware protection, identity theft prevention, VPN, parental controls, and real-time web protection. For businesses and anyone handling sensitive data, a paid solution is highly recommended.",
  },
  {
    id: "av-5",
    category: "Antivirus",
    question: "My files have been encrypted by ransomware. Can you help?",
    answer: "Ransomware is serious. We remove the ransomware immediately and attempt data recovery using professional tools. We also check for backup copies. Going forward, we set up proper backup systems and security policies to prevent recurrence.",
  },
  {
    id: "av-6",
    category: "Antivirus",
    question: "How do I know if my computer has a virus?",
    answer: "Common signs include: unexpected slowdown, frequent crashes, pop-up ads, programs opening on their own, unusual network activity, browser redirects, and high CPU usage with no reason. If you notice any of these, contact us for a free diagnostic.",
  },

  // ── Motherboard Repair ─────────────────────────────────────────
  {
    id: "mb-1",
    category: "Motherboard Repair",
    question: "Can a damaged laptop motherboard be repaired?",
    answer: "Yes, in many cases a damaged motherboard can be repaired instead of replaced. We do chip-level repairs including BGA rework, SMD soldering, power circuit repair, and IC chip replacement. This saves significant cost compared to full motherboard replacement.",
  },
  {
    id: "mb-2",
    category: "Motherboard Repair",
    question: "How much does motherboard repair cost?",
    answer: "Motherboard repair costs range from ₹1,500 to ₹8,000 depending on the fault. A simple power circuit fix is cheaper than a full BGA chip replacement. We provide free diagnosis and a transparent quote before starting work.",
  },
  {
    id: "mb-3",
    category: "Motherboard Repair",
    question: "My laptop shows a power light but won't boot. Is it a motherboard issue?",
    answer: "Not necessarily. This could be a RAM issue, storage failure, or corrupted BIOS. We run a full diagnostic to rule out simpler causes before determining if motherboard repair is needed. We never jump to the most expensive repair option.",
  },
  {
    id: "mb-4",
    category: "Motherboard Repair",
    question: "How long does motherboard repair take?",
    answer: "Simple motherboard repairs take 1–2 days. Complex chip-level repairs like BGA rework or extensive trace repair can take 3–5 days. We keep you updated on progress and any changes to the estimated timeline.",
  },
  {
    id: "mb-5",
    category: "Motherboard Repair",
    question: "Is it worth repairing a motherboard or should I buy a new laptop?",
    answer: "If your laptop is relatively recent (less than 4–5 years old), motherboard repair is usually cost-effective. If the laptop is older, we give you an honest assessment of whether repair or replacement is the better value. We are not here to push unnecessary repairs.",
  },

  // ── Screen Replacement ─────────────────────────────────────────
  {
    id: "sr-1",
    category: "Screen Replacement",
    question: "How much does laptop screen replacement cost in India?",
    answer: "Laptop screen replacement typically costs between ₹2,500 and ₹8,000 depending on the laptop brand, model, and screen type (HD, FHD, 4K, touch). We use genuine or high-quality compatible screens with 365-day warranty.",
  },
  {
    id: "sr-2",
    category: "Screen Replacement",
    question: "How long does screen replacement take?",
    answer: "Laptop screen replacement is usually done within 2–4 hours if we have the compatible screen in stock. If the screen needs to be ordered, it takes 1–2 days. We maintain stock of popular screen sizes and models.",
  },
  {
    id: "sr-3",
    category: "Screen Replacement",
    question: "My laptop screen has lines or is dim but not cracked. Can it be repaired?",
    answer: "Yes. Vertical/horizontal lines, flickering, and dim displays are often caused by a loose display cable, faulty inverter, or failing backlight — not the panel itself. These repairs are less expensive than a full screen replacement.",
  },
  {
    id: "sr-4",
    category: "Screen Replacement",
    question: "Do you replace touch screens on laptops?",
    answer: "Yes, we replace touch screen panels for 2-in-1 laptops and touch-enabled laptops. Touch screen replacement is slightly more expensive than standard screen replacement due to the digitizer component.",
  },
  {
    id: "sr-5",
    category: "Screen Replacement",
    question: "Will my data be safe during screen replacement?",
    answer: "Absolutely. Screen replacement does not affect your data at all. Your hard drive and all files remain completely untouched during the screen replacement process.",
  },

  // ── Battery Replacement ────────────────────────────────────────
  {
    id: "br-1",
    category: "Battery Replacement",
    question: "How do I know if my laptop battery needs replacement?",
    answer: "Signs your battery needs replacement: backup time dropped significantly, laptop only works when plugged in, battery swelling (visible bulge), battery percentage fluctuates randomly, or Windows/macOS shows 'Replace Battery' warning.",
  },
  {
    id: "br-2",
    category: "Battery Replacement",
    question: "How much does laptop battery replacement cost?",
    answer: "Laptop battery replacement costs between ₹1,200 and ₹4,500 depending on the brand and model. We use genuine or high-quality compatible batteries with 6-month warranty on the battery.",
  },
  {
    id: "br-3",
    category: "Battery Replacement",
    question: "My laptop battery is swollen. Is it dangerous?",
    answer: "Yes, a swollen battery is dangerous and should be replaced immediately. Swollen lithium batteries can rupture and cause fire. Please stop using the laptop immediately and contact us. We handle battery disposal safely and replace it with a new one.",
  },
  {
    id: "br-4",
    category: "Battery Replacement",
    question: "How long does a new laptop battery last?",
    answer: "A new quality battery typically provides 4–8 hours of regular use depending on your usage, screen brightness, and running applications. Battery capacity degrades about 20% over 2–3 years of regular use.",
  },
  {
    id: "br-5",
    category: "Battery Replacement",
    question: "My laptop shows 0% battery and won't charge. Is the battery dead?",
    answer: "Not necessarily. It could be the battery, the charging port, the charging cable, or the charging circuit on the motherboard. We diagnose the exact issue — sometimes a simple calibration or port cleaning resolves it without battery replacement.",
  },

  // ── Data Recovery ──────────────────────────────────────────────
  {
    id: "dr-1",
    category: "Data Recovery",
    question: "Can you recover data from a dead hard drive?",
    answer: "Yes, in many cases we can recover data from a dead hard drive using professional data recovery software and techniques. Success rates vary based on the type of failure. We offer a 'No Data, No Charge' policy — if we can't recover your data, you don't pay for data recovery.",
  },
  {
    id: "dr-2",
    category: "Data Recovery",
    question: "How much does data recovery cost?",
    answer: "Data recovery costs start from ₹2,000 for simple logical failures (deleted files, formatted drive). Physical recovery from mechanically failed drives can cost ₹5,000–₹15,000. We provide a free assessment and quote before proceeding.",
  },
  {
    id: "dr-3",
    category: "Data Recovery",
    question: "I accidentally deleted important files. Can you get them back?",
    answer: "Yes! If the drive hasn't been written to significantly after deletion, there's a high chance of recovery. Stop using the drive immediately and contact us — the sooner we start, the better the chances. We use professional recovery tools to retrieve deleted files.",
  },
  {
    id: "dr-4",
    category: "Data Recovery",
    question: "My hard drive is making clicking noises. Is data recovery possible?",
    answer: "Clicking sounds indicate a mechanical failure of the hard drive's read/write heads. Data recovery is possible in many cases but requires specialized equipment. Do NOT attempt to power on the drive repeatedly — this increases damage. Contact us immediately.",
  },
  {
    id: "dr-5",
    category: "Data Recovery",
    question: "Can you recover data from an SSD?",
    answer: "SSD data recovery is more complex than HDD recovery but still possible in many cases, especially for logical failures. Physical SSD failures are harder to recover from. We use specialized SSD recovery tools and techniques.",
  },
  {
    id: "dr-6",
    category: "Data Recovery",
    question: "How long does data recovery take?",
    answer: "Logical data recovery (deleted/formatted) typically takes 1–3 days. Physical drive recovery takes 3–7 days depending on the damage extent. We keep you updated throughout the process and send you a file list for verification before completion.",
  },
];
