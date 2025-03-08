import React from "react";
import { Star } from "lucide-react";

const Testimonial = ({ name, role, content, image, rating }) => {
  return (
    <div className="flex flex-col bg-white p-6 rounded-xl shadow-lg min-w-[300px] mx-4">
      <div className="flex items-center gap-4 mb-4">
        <img
          src={image}
          alt={name}
          className="w-12 h-12 rounded-full object-cover"
        />
        <div>
          <h3 className="font-semibold text-gray-800">{name}</h3>
          <p className="text-sm text-gray-600">{role}</p>
        </div>
      </div>
      <div className="flex mb-3">
        {Array.from({ length: rating }).map((_, i) => (
          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
        ))}
      </div>
      <p className="text-gray-700 text-sm">{content}</p>
    </div>
  );
};

export default Testimonial;
