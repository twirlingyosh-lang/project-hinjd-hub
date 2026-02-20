import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, Clock, User } from 'lucide-react';
import { Link } from 'react-router-dom';

const blogPosts = [
  {
    id: 'conveyor-belt-tracking-guide',
    title: '5 Common Conveyor Belt Tracking Problems & How to Fix Them',
    excerpt: 'Belt mistracking is the #1 cause of unplanned downtime in aggregate operations. Learn how to identify and fix the most common tracking issues before they cause costly damage.',
    category: 'Maintenance',
    date: '2025-02-15',
    readTime: '6 min read',
    author: 'HINJD Engineering',
  },
  {
    id: 'tail-pulley-protection',
    title: 'Why Tail Pulley Protection Saves You Thousands',
    excerpt: 'Unprotected tail pulleys cause belt edge damage, material spillage, and expensive repairs. Discover how BeltSaver® technology prevents these issues at the source.',
    category: 'Products',
    date: '2025-02-01',
    readTime: '4 min read',
    author: 'HINJD Engineering',
  },
  {
    id: 'ai-equipment-diagnostics',
    title: 'How AI is Revolutionizing Heavy Equipment Maintenance',
    excerpt: 'From predictive diagnostics to automated parts identification, artificial intelligence is transforming how aggregate operations maintain their fleet.',
    category: 'Technology',
    date: '2025-01-20',
    readTime: '5 min read',
    author: 'HINJD Engineering',
  },
  {
    id: 'reduce-conveyor-downtime',
    title: '7 Proven Strategies to Reduce Conveyor Downtime by 40%',
    excerpt: 'Downtime costs aggregate operations an average of $5,000 per hour. These seven strategies can dramatically reduce unplanned stops and keep your operation running.',
    category: 'Operations',
    date: '2025-01-10',
    readTime: '7 min read',
    author: 'HINJD Engineering',
  },
];

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'Maintenance': return 'bg-blue-500/10 text-blue-500 border-blue-500/30';
    case 'Products': return 'bg-primary/10 text-primary border-primary/30';
    case 'Technology': return 'bg-purple-500/10 text-purple-500 border-purple-500/30';
    case 'Operations': return 'bg-green-500/10 text-green-500 border-green-500/30';
    default: return '';
  }
};

const BlogPage = () => {
  return (
    <>
      <Helmet>
        <title>Blog - Conveyor Belt Maintenance & Aggregate Industry Insights | HINJD</title>
        <meta name="description" content="Expert insights on conveyor belt maintenance, equipment diagnostics, and aggregate operations. Tips to reduce downtime and improve efficiency." />
        <link rel="canonical" href="https://hinjd-ecosystem-hub.lovable.app/blog" />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Home
              </Button>
            </Link>
            <h1 className="text-xl font-bold">Blog</h1>
          </div>
        </header>

        {/* Hero */}
        <section className="max-w-4xl mx-auto px-4 py-12">
          <h2 className="text-3xl font-bold mb-3">Industry Insights & Guides</h2>
          <p className="text-muted-foreground text-lg">
            Expert knowledge on conveyor belt maintenance, equipment diagnostics, and running efficient aggregate operations.
          </p>
        </section>

        {/* Posts */}
        <main className="max-w-4xl mx-auto px-4 pb-16">
          <div className="space-y-6">
            {blogPosts.map((post) => (
              <Card key={post.id} className="hover:border-primary/30 transition-colors">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className={getCategoryColor(post.category)}>
                      {post.category}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl leading-tight">
                    {post.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{post.excerpt}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {post.author}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {post.readTime}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    </>
  );
};

export default BlogPage;
