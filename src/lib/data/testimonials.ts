export interface Testimonial {
  id: string;
  name: string;
  role: string;
  location: string;
  rating: number;
  review: string;
  service: string;
  date: string;
}

export const testimonials: Testimonial[] = [
  {
    id: "1",
    name: "Rajesh Kumar",
    role: "Business Owner",
    location: "Chennai, Tamil Nadu",
    rating: 5,
    review: "Absolutely fantastic service! My laptop motherboard was fried and I thought it was done for. Sai Systems fixed it within 2 days at a very reasonable price. The technician was professional, knowledgeable, and kept me updated throughout. Highly recommended!",
    service: "Laptop Motherboard Repair",
    date: "March 2025",
  },
  {
    id: "2",
    name: "Divya Krishnan",
    role: "College Student",
    location: "Coimbatore, Tamil Nadu",
    rating: 5,
    review: "I spilled water on my laptop keyboard and it stopped working completely. Sai Systems replaced the keyboard the same day I walked in. The price was affordable and the service was quick. My laptop works perfectly now. Thank you so much!",
    service: "Laptop Keyboard Repair",
    date: "February 2025",
  },
  {
    id: "3",
    name: "Suresh Nair",
    role: "IT Manager",
    location: "Bengaluru, Karnataka",
    rating: 5,
    review: "We hired Sai Systems to set up the office network for our new branch. They did an excellent job — structured cabling, WiFi access points, server setup. Everything was completed on time and within budget. Their team is very professional.",
    service: "Office Networking",
    date: "January 2025",
  },
  {
    id: "4",
    name: "Anita Reddy",
    role: "School Principal",
    location: "Warangal, Telangana",
    rating: 5,
    review: "Our school computer lab had multiple PCs breaking down. Sai Systems took an AMC contract and now maintains all 40 computers regularly. Downtime has reduced to almost zero. Staff and students are very happy. Excellent team!",
    service: "Computer Maintenance (AMC)",
    date: "April 2025",
  },
  {
    id: "5",
    name: "Mohammed Iqbal",
    role: "Freelance Designer",
    location: "Hyderabad, Telangana",
    rating: 5,
    review: "My Dell laptop screen cracked accidentally and I was devastated. Sai Systems replaced it with a genuine screen in just a few hours. The color accuracy is perfect for my design work. Very satisfied with the service and the price!",
    service: "Laptop Screen Repair",
    date: "March 2025",
  },
  {
    id: "6",
    name: "Deepa Menon",
    role: "Home User",
    location: "Thiruvananthapuram, Kerala",
    rating: 5,
    review: "I called for a doorstep repair and the technician arrived within 2 hours. My computer was running very slow — they cleaned it, upgraded the RAM and SSD, installed antivirus. It now works like a brand new machine! Amazing service at home.",
    service: "Computer Repair at Home",
    date: "May 2025",
  },
  {
    id: "7",
    name: "Venkata Prasad",
    role: "Hospital Administrator",
    location: "Visakhapatnam, Andhra Pradesh",
    rating: 5,
    review: "Sai Systems handles all IT support for our hospital. From networking to server maintenance to workstation repairs — they do it all. Response time is excellent, which is critical for us. We trust them completely for our IT needs.",
    service: "IT Support (Hospital)",
    date: "February 2025",
  },
  {
    id: "8",
    name: "Kavitha Rajan",
    role: "Startup Founder",
    location: "Mysore, Karnataka",
    rating: 5,
    review: "As a startup, we needed complete IT infrastructure setup on a tight budget. Sai Systems delivered everything — workstations, networking, server, cloud setup, antivirus — at a very competitive price. Couldn't have asked for a better partner!",
    service: "Startup IT Setup",
    date: "January 2025",
  },
  {
    id: "9",
    name: "Arun Krishnan",
    role: "College Professor",
    location: "Kochi, Kerala",
    rating: 5,
    review: "My HP laptop was showing the blue screen of death. I sent it to Sai Systems and they diagnosed the issue — a faulty RAM stick — and fixed it the same day. Data was intact, laptop is running perfectly. Great service, great price!",
    service: "Laptop Hardware Repair",
    date: "April 2025",
  },
  {
    id: "10",
    name: "Sneha Rao",
    role: "Small Business Owner",
    location: "Vijayawada, Andhra Pradesh",
    rating: 5,
    review: "We had a virus attack that encrypted all our business files. Sai Systems removed the malware, recovered most of our data, and set up proper antivirus protection. They also trained our staff on safe browsing. Lifesavers! Highly recommended.",
    service: "Virus Removal & Data Recovery",
    date: "May 2025",
  },
];
