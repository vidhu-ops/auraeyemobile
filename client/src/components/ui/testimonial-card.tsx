import { Star, StarHalf } from "lucide-react";

interface TestimonialCardProps {
  rating: number;
  testimonial: string;
  name: string;
  title: string;
  initials: string;
  bgColor: 'primary' | 'secondary' | 'accent';
}

export default function TestimonialCard({ rating, testimonial, name, title, initials, bgColor }: TestimonialCardProps) {
  const bgColorMap = {
    primary: 'bg-primary/50',
    secondary: 'bg-secondary/30',
    accent: 'bg-accent/30'
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`star-${i}`} className="text-accent fill-accent" size={16} />);
    }
    
    if (hasHalfStar) {
      stars.push(<StarHalf key="half-star" className="text-accent fill-accent" size={16} />);
    }
    
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="text-gray-300" size={16} />);
    }
    
    return stars;
  };

  return (
    <div className="bg-dark-light rounded-xl p-6 glass">
      <div className="flex items-center mb-4">
        <div className="flex">
          {renderStars(rating)}
        </div>
        <span className="ml-2 text-black/80 text-sm">{rating.toFixed(1)}</span>
      </div>
      <p className="text-black/90 mb-6">{testimonial}</p>
      <div className="flex items-center">
        <div className={`w-10 h-10 rounded-full ${bgColorMap[bgColor]} flex items-center justify-center mr-3`}>
          <span className="font-medium text-sm">{initials}</span>
        </div>
        <div>
          <p className="font-medium">{name}</p>
          <p className="text-black/70 text-sm">{title}</p>
        </div>
      </div>
    </div>
  );
}
