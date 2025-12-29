import { Facebook, Twitter, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

interface SocialShareButtonsProps {
  title: string;
  text: string;
  url?: string;
}

const SocialShareButtons = ({ title, text, url }: SocialShareButtonsProps) => {
  const shareUrl = url || window.location.href;
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedText = encodeURIComponent(`${title}: ${text}`);
  const encodedTitle = encodeURIComponent(title);

  const handleFacebookShare = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`,
      '_blank',
      'width=600,height=400'
    );
  };

  const handleTwitterShare = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      '_blank',
      'width=600,height=400'
    );
  };

  const handleTikTokShare = async () => {
    // TikTok doesn't have a direct web share API, so we copy link for sharing
    try {
      await navigator.clipboard.writeText(`${title}: ${text}\n${shareUrl}`);
      toast({
        title: "Copied to clipboard!",
        description: "Open TikTok and paste to share your diagnostic results.",
      });
    } catch {
      toast({
        title: "Share on TikTok",
        description: "Copy this link and share it on TikTok: " + shareUrl,
      });
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled or error
      }
    } else {
      try {
        await navigator.clipboard.writeText(`${title}: ${text}\n${shareUrl}`);
        toast({
          title: "Link copied!",
          description: "Share link has been copied to your clipboard.",
        });
      } catch {
        toast({
          title: "Share",
          description: shareUrl,
        });
      }
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Share:</span>
      <Button
        variant="outline"
        size="sm"
        onClick={handleFacebookShare}
        className="flex items-center gap-2 hover:bg-blue-500/10 hover:border-blue-500/50 hover:text-blue-500"
      >
        <Facebook size={16} />
        <span className="hidden sm:inline">Facebook</span>
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleTwitterShare}
        className="flex items-center gap-2 hover:bg-sky-500/10 hover:border-sky-500/50 hover:text-sky-500"
      >
        <Twitter size={16} />
        <span className="hidden sm:inline">X/Twitter</span>
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleTikTokShare}
        className="flex items-center gap-2 hover:bg-pink-500/10 hover:border-pink-500/50 hover:text-pink-500"
      >
        <svg 
          viewBox="0 0 24 24" 
          width="16" 
          height="16" 
          fill="currentColor"
          className="flex-shrink-0"
        >
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
        </svg>
        <span className="hidden sm:inline">TikTok</span>
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleNativeShare}
        className="flex items-center gap-2"
      >
        <Share2 size={16} />
        <span className="hidden sm:inline">More</span>
      </Button>
    </div>
  );
};

export default SocialShareButtons;
