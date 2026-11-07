import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, Facebook, Link2, Search, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import beltImage from '@/assets/beltsaver-closeup.jpg';
import quarryImage from '@/assets/quarry-aerial.jpg';
import fleetImage from '@/assets/hero-dozer.jpg';

const createPageUrl = 'https://www.facebook.com/pages/create';
const facebookPage = 'https://www.facebook.com/share/18QQKcaRwY/';
const posts = [
  { id: 'belt', category: 'Conveyors', title: 'BeltSaver® conveyor protection', text: 'Tail pulley protection for your conveyor operation.', image: beltImage, path: '/beltsaver', action: 'Explore BeltSaver' },
  { id: 'aggs', category: 'Aggregates', title: 'Cox Aggs · materials & plant setup', text: 'Aggregate products, quote requests, and screen setup planning.', image: quarryImage, path: '/aggregate-opps', action: 'Visit Cox Aggs' },
  { id: 'fleet', category: 'Equipment', title: 'Fleet repair & equipment diagnostics', text: 'Equipment health, diagnostic history, and repair work orders.', image: fleetImage, path: '/fleet-repair-diagnostics', action: 'Open diagnostics' },
];

export default function FacebookHub() {
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const visible = posts.filter(post => (category === 'All' || post.category === category) && `${post.title} ${post.text}`.toLowerCase().includes(search.toLowerCase()));
  const shareUrl = (path: string) => `https://hinjd-ecosystem-hub.lovable.app${path}`;
  const copy = async (path: string) => {
    try { await navigator.clipboard.writeText(shareUrl(path)); toast.success('Link copied'); }
    catch { toast.error('Could not copy the link. Please try again.'); }
  };
  return <div className="min-h-screen bg-background text-foreground">
    <Helmet><title>HINJD Facebook Hub</title><meta name="description" content="HINJD community updates for BeltSaver, Cox Aggs, and equipment maintenance." /></Helmet>
    <header className="border-b border-border"><div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4">
      <Button variant="ghost" asChild><Link to="/"><ArrowLeft /> HINJD Hub</Link></Button>
      <div className="flex flex-wrap gap-2"><Button asChild><Link to="/app/upgrade">Buy the app</Link></Button><Button variant="secondary" asChild><a href={createPageUrl} target="_blank" rel="noopener noreferrer"><Facebook /> Create Facebook Page <ArrowUpRight /></a></Button><Button variant="outline" asChild><a href={facebookPage} target="_blank" rel="noopener noreferrer"><Facebook /> Facebook <ArrowUpRight /></a></Button></div>
    </div></header>
    <main className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-5"><div><p className="mb-2 text-sm text-primary">HINJD GLOBAL / COMMUNITY</p><h1 className="text-3xl font-bold sm:text-4xl">Facebook Hub</h1></div>
        <div className="relative w-full sm:w-72"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input aria-label="Search community updates" placeholder="Search updates" value={search} onChange={e => setSearch(e.target.value)} className="pl-9" /></div>
      </div>
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_260px]">
        <section aria-label="Community feed" className="min-w-0">
          <div className="mb-5 flex flex-wrap gap-2">{['All', 'Conveyors', 'Aggregates', 'Equipment'].map(item => <Button key={item} size="sm" variant={category === item ? 'default' : 'outline'} aria-pressed={category === item} onClick={() => setCategory(item)}>{item}</Button>)}</div>
          <div className="grid gap-5 md:grid-cols-2">{visible.map(post => <article key={post.id} className="overflow-hidden rounded-lg border border-border bg-card">
            <img src={post.image} alt={post.title} className="aspect-[16/10] w-full object-cover" />
            <div className="p-5"><p className="mb-2 text-xs text-primary">HINJD GLOBAL · {post.category}</p><h2 className="mb-3 text-xl font-semibold">{post.title}</h2><p className="mb-5 text-sm text-muted-foreground">{post.text}</p>
              <Button variant="link" className="h-auto p-0" asChild><Link to={post.path}>{post.action}<ArrowUpRight /></Link></Button>
              <div className="mt-5 flex flex-wrap gap-2 border-t border-border pt-4"><Button variant="outline" size="sm" asChild><a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl(post.path))}`} target="_blank" rel="noopener noreferrer"><Facebook /> Share</a></Button><Button variant="ghost" size="icon" aria-label={`Copy link to ${post.title}`} title="Copy link" onClick={() => copy(post.path)}><Link2 /></Button></div>
            </div>
          </article>)}</div>
          {visible.length === 0 && <p className="py-12 text-muted-foreground">No matching updates.</p>}
        </section>
        <aside aria-label="Community sidebar" className="space-y-6 border-t border-border pt-6 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
          <div className="rounded-lg border border-primary p-4"><h2 className="mb-1 text-lg font-semibold text-primary">Get HINJD Hub</h2><p className="mb-3 text-sm text-muted-foreground">Pro $49/mo · Enterprise $300/mo</p><Button className="w-full" asChild><Link to="/app/upgrade">Buy the app</Link></Button></div>
          <div><Users className="mb-3 h-7 w-7 text-primary" /><h2 className="mb-2 text-lg font-semibold">HINJD community</h2><p className="mb-4 text-sm text-muted-foreground">Conveyors. Aggregates. Equipment.</p><Button className="w-full" asChild><a href={facebookPage} target="_blank" rel="noopener noreferrer"><Facebook /> Visit Facebook page</a></Button><Button variant="outline" className="mt-2 w-full" asChild><a href={createPageUrl} target="_blank" rel="noopener noreferrer"><Facebook /> Create Facebook Page</a></Button></div>
          <div className="border-t border-border pt-5"><h2 className="mb-3 font-semibold">Around the hub</h2>{posts.map(post => <Button key={post.id} variant="ghost" className="w-full justify-between" asChild><Link to={post.path}>{post.category}<ArrowUpRight /></Link></Button>)}</div>
          <Button variant="outline" className="w-full" asChild><Link to="/beltsaver/quote">Request a BeltSaver quote</Link></Button>
        </aside>
      </div>
    </main>
  </div>;
}