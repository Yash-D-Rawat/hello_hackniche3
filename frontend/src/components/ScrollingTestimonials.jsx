import React from "react";
import Testimonial from "./Testimonial";

const testimonials1 = [
  {
    name: "Sarah Johnson",
    role: "Marketing Director",
    content:
      "This product has completely transformed how we work. The efficiency gains are remarkable!",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    rating: 5,
  },
  {
    name: "Michael Chen",
    role: "Software Engineer",
    content:
      "The best solution I've found for our team's needs. Incredibly intuitive and powerful.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    rating: 5,
  },
  {
    name: "Emily Rodriguez",
    role: "Product Designer",
    content: "Outstanding user experience and customer support. Highly recommended!",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
    rating: 4,
  },
  {
    name: "David Kim",
    role: "CEO",
    content: "A game-changer for our business. The ROI has been exceptional.",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
    rating: 5,
  },
];

const testimonials2 = [
  {
    name: "Lisa Thompson",
    role: "UX Designer",
    content: "The attention to detail and user-centric design is impressive. Love using it!",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
    rating: 5,
  },
  {
    name: "James Wilson",
    role: "Tech Lead",
    content: "Robust features and great performance. Exactly what we needed.",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
    rating: 4,
  },
  {
    name: "Anna Martinez",
    role: "Project Manager",
    content: "Has streamlined our workflows significantly. The team loves it!",
    image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150",
    rating: 5,
  },
  {
    name: "Robert Lee",
    role: "CTO",
    content: "Enterprise-grade solution with amazing scalability. Excellent choice!",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    rating: 5,
  },
];

const ScrollingTestimonials = () => {
  return (
    <div className="w-full overflow-hidden bg-blue py-16">
      <div className="mb-12 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">What Our Clients Say</h2>
        <p className="text-white max-w-2xl mx-auto">
          Don't just take our word for it - hear from some of our satisfied clients about their
          experiences working with us.
        </p>
      </div>

      <div className="relative">
        {/* First row - scrolling right */}
        <div className="flex animate-scroll-right">
          <div className="flex ">
            {[...testimonials1, ...testimonials1].map((testimonial, index) => (
              <Testimonial key={`row1-${index}`} {...testimonial} />
            ))}
          </div>
        </div>

        {/* Second row - scrolling left */}
        <div className="flex mt-8 animate-scroll-left">
          <div className="flex ">
            {[...testimonials2, ...testimonials2].map((testimonial, index) => (
              <Testimonial key={`row2-${index}`} {...testimonial} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScrollingTestimonials;
