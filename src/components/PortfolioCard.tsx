import { ExternalLink } from 'lucide-react';
import { ReactNode } from 'react';

interface PortfolioCardProps {
  title: string;
  description: string;
  url: string;
  icon: ReactNode;
  tag: string;
  colorClass: string;
  bgClass: string;
  thumbnail?: string;
}

const PortfolioCard = ({ title, description, url, icon, tag, colorClass, bgClass, thumbnail }: PortfolioCardProps) => {
  return (
    <a 
      href={url} 
      target="_blank" 
      rel="noopener noreferrer"
      className="group p-5 bg-card/50 border border-border rounded-3xl flex justify-between items-center hover:border-foreground/20 transition-all duration-300"
    >
      <div className="flex items-center gap-4">
        {thumbnail ? (
          <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0">
            <img 
              src={thumbnail} 
              alt={`${title} thumbnail`} 
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          </div>
        ) : (
          <div className={`p-2 rounded-xl ${bgClass} ${colorClass}`}>
            {icon}
          </div>
        )}
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-sm uppercase italic text-foreground">{title}</h4>
            <span className="text-[8px] bg-foreground/5 px-2 py-0.5 rounded text-muted-foreground font-bold uppercase">
              {tag}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        </div>
      </div>
      <ExternalLink size={14} className="text-muted-foreground/50 group-hover:text-foreground/50 transition-colors" />
    </a>
  );
};

export default PortfolioCard;
