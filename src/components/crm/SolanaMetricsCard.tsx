import { useState, useEffect } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Wallet, ArrowUpRight, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TransactionSignature {
  signature: string;
  slot: number;
  blockTime: number | null;
}

interface SolMetrics {
  solBalance: string;
  history: TransactionSignature[];
}

const WALLET_ADDRESS = "Fa65TzfhxASYXWaniMsVt16TDb5gMSSQpbhEQEh71NHloATA";

export const SolanaMetricsCard = () => {
  const [solMetrics, setSolMetrics] = useState<SolMetrics>({ solBalance: '0.00', history: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const syncBlockchain = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const connection = new Connection("https://api.mainnet-beta.solana.com", "confirmed");
      const pubKey = new PublicKey(WALLET_ADDRESS);
      
      // Fetch Real Balance
      const balance = await connection.getBalance(pubKey);
      
      // Fetch Last 5 "Milestone" Transactions
      const signatures = await connection.getSignaturesForAddress(pubKey, { limit: 5 });
      
      setSolMetrics({
        solBalance: (balance / 1e9).toFixed(4),
        history: signatures.map(sig => ({
          signature: sig.signature,
          slot: sig.slot,
          blockTime: sig.blockTime
        }))
      });
      setLastUpdated(new Date());
    } catch (e) {
      console.error("Blockchain Sync Error", e);
      setError("Failed to sync blockchain data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    syncBlockchain();
    const interval = setInterval(syncBlockchain, 30000); // Auto-refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const formatDate = (timestamp: number | null) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateSignature = (sig: string) => {
    return `${sig.slice(0, 8)}...${sig.slice(-8)}`;
  };

  return (
    <Card className="border-border">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <Wallet className="h-5 w-5 text-primary" />
          <CardTitle className="text-base font-medium">Solana Wallet</CardTitle>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={syncBlockchain}
          disabled={loading}
          className="h-8 w-8"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Balance */}
        <div className="flex items-baseline justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Balance</p>
            {loading && !solMetrics.solBalance ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <p className="text-2xl font-bold">{solMetrics.solBalance} SOL</p>
            )}
          </div>
          {lastUpdated && (
            <p className="text-xs text-muted-foreground">
              Updated {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        {/* Recent Transactions */}
        <div>
          <p className="text-sm font-medium mb-2">Recent Transactions</p>
          {loading && solMetrics.history.length === 0 ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : solMetrics.history.length === 0 ? (
            <p className="text-sm text-muted-foreground">No transactions found</p>
          ) : (
            <div className="space-y-2">
              {solMetrics.history.map((tx) => (
                <a
                  key={tx.signature}
                  href={`https://solscan.io/tx/${tx.signature}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2 rounded-lg border border-border hover:bg-muted/50 transition-colors group"
                >
                  <div>
                    <p className="text-sm font-mono">{truncateSignature(tx.signature)}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(tx.blockTime)}</p>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Wallet Address */}
        <div className="pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground">Wallet Address</p>
          <a
            href={`https://solscan.io/account/${WALLET_ADDRESS}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-mono text-primary hover:underline break-all"
          >
            {WALLET_ADDRESS}
          </a>
        </div>
      </CardContent>
    </Card>
  );
};

export default SolanaMetricsCard;
