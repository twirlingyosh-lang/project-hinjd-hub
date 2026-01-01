import { Facebook, Twitter } from 'lucide-react';

// TikTok icon (not in lucide-react)
const TikTokIcon = ({ size = 20 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
);

interface SocialMediaLinksProps {
  variant?: 'footer' | 'inline';
}

const SocialMediaLinks = ({ variant = 'footer' }: SocialMediaLinksProps) => {
  const socialLinks = [
    {
      name: 'Facebook',
      icon: <Facebook size={20} />,
      url: 'https://www.facebook.com/profile.php?id=61577227083498',
      hoverColor: 'hover:text-[#1877F2]'
    },
    {
      name: 'Twitter',
      icon: <Twitter size={20} />,
      url: 'https://twitter.com/hinjdglobal',
      hoverColor: 'hover:text-[#1DA1F2]'
    },
    {
      name: 'TikTok',
      icon: <TikTokIcon size={20} />,
      url: 'https://www.tiktok.com/@hinjdglobal',
      hoverColor: 'hover:text-foreground'
    }
  ];

  if (variant === 'inline') {
    return (
      <div className="flex items-center gap-3">
        {socialLinks.map((link) => (
          <a
            key={link.name}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`text-muted-foreground transition-colors ${link.hoverColor}`}
            aria-label={`Visit Hinjd Global on ${link.name}`}
          >
            {link.icon}
          </a>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-muted-foreground/50 text-[10px] font-black uppercase tracking-[0.3em]">
        Follow Us
      </p>
      <div className="flex items-center gap-6">
        {socialLinks.map((link) => (
          <a
            key={link.name}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`p-3 bg-card border border-border rounded-xl text-muted-foreground transition-all duration-300 hover:scale-110 hover:border-primary/30 ${link.hoverColor}`}
            aria-label={`Visit Hinjd Global on ${link.name}`}
          >
            {link.icon}
          </a>
        ))}
      </div>
    </div>
  );
};

export default SocialMediaLinks;