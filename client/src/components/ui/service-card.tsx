import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { ReactNode } from "react";

interface ServiceCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  link: string;
  linkText: string;
  color: 'primary' | 'secondary' | 'accent';
}

export default function ServiceCard({ icon, title, description, link, linkText, color }: ServiceCardProps) {
  const bgColorMap = {
    primary: 'bg-primary/10',
    secondary: 'bg-secondary/10',
    accent: 'bg-accent/10'
  };
  
  const textColorMap = {
    primary: 'text-primary',
    secondary: 'text-secondary',
    accent: 'text-accent'
  };
  
  const hoverGroupMap = {
    primary: 'group-hover:text-primary',
    secondary: 'group-hover:text-secondary',
    accent: 'group-hover:text-accent'
  };

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 flex flex-col">
      <div className={`${bgColorMap[color]} w-16 h-16 rounded-full flex items-center justify-center mb-6`}>
        {icon}
      </div>
      <h3 className="font-heading font-semibold text-xl mb-3">{title}</h3>
      <p className="text-gray-600 mb-6 flex-grow">{description}</p>
      <Link 
        href={link} 
        className={`${textColorMap[color]} font-medium flex items-center group`}
      >
        {linkText} <ArrowRight className={`ml-2 transition-transform group-hover:translate-x-1 ${hoverGroupMap[color]}`} size={16} />
      </Link>
    </div>
  );
}
