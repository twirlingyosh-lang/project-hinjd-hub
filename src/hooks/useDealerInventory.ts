import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface InventoryItem {
  id: string;
  dealer_id: string;
  part_id: string;
  quantity: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  last_updated: string;
}

export interface DealerInventorySummary {
  dealer_id: string;
  total_parts: number;
  in_stock: number;
  low_stock: number;
  out_of_stock: number;
  overall_status: 'good' | 'warning' | 'critical';
}

export const useDealerInventory = (dealerIds: string[]) => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [summaries, setSummaries] = useState<Map<string, DealerInventorySummary>>(new Map());
  const [isLoading, setIsLoading] = useState(true);

  // Calculate summary for a dealer
  const calculateSummary = (dealerId: string, items: InventoryItem[]): DealerInventorySummary => {
    const dealerItems = items.filter(i => i.dealer_id === dealerId);
    const inStock = dealerItems.filter(i => i.status === 'in_stock').length;
    const lowStock = dealerItems.filter(i => i.status === 'low_stock').length;
    const outOfStock = dealerItems.filter(i => i.status === 'out_of_stock').length;
    const total = dealerItems.length;

    let overallStatus: 'good' | 'warning' | 'critical' = 'good';
    if (total === 0) {
      overallStatus = 'warning'; // No inventory data
    } else if (outOfStock > total * 0.5) {
      overallStatus = 'critical';
    } else if (lowStock + outOfStock > total * 0.3) {
      overallStatus = 'warning';
    }

    return {
      dealer_id: dealerId,
      total_parts: total,
      in_stock: inStock,
      low_stock: lowStock,
      out_of_stock: outOfStock,
      overall_status: overallStatus,
    };
  };

  // Fetch initial inventory
  useEffect(() => {
    if (dealerIds.length === 0) {
      setIsLoading(false);
      return;
    }

    const fetchInventory = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('dealer_inventory')
        .select('*')
        .in('dealer_id', dealerIds);

      if (error) {
        console.error('Error fetching dealer inventory:', error);
        setIsLoading(false);
        return;
      }

      const items = (data || []) as InventoryItem[];
      setInventory(items);

      // Calculate summaries for all dealers
      const newSummaries = new Map<string, DealerInventorySummary>();
      dealerIds.forEach(id => {
        newSummaries.set(id, calculateSummary(id, items));
      });
      setSummaries(newSummaries);
      setIsLoading(false);
    };

    fetchInventory();
  }, [dealerIds.join(',')]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (dealerIds.length === 0) return;

    const channel = supabase
      .channel('dealer-inventory-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'dealer_inventory',
        },
        (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const newItem = payload.new as InventoryItem;
            if (dealerIds.includes(newItem.dealer_id)) {
              setInventory(prev => {
                const updated = prev.filter(i => i.id !== newItem.id);
                return [...updated, newItem];
              });
            }
          } else if (payload.eventType === 'DELETE') {
            const oldItem = payload.old as InventoryItem;
            setInventory(prev => prev.filter(i => i.id !== oldItem.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [dealerIds.join(',')]);

  // Update summaries when inventory changes
  useEffect(() => {
    const newSummaries = new Map<string, DealerInventorySummary>();
    dealerIds.forEach(id => {
      newSummaries.set(id, calculateSummary(id, inventory));
    });
    setSummaries(newSummaries);
  }, [inventory, dealerIds.join(',')]);

  const getStatusColor = (status: 'good' | 'warning' | 'critical' | 'in_stock' | 'low_stock' | 'out_of_stock'): string => {
    switch (status) {
      case 'good':
      case 'in_stock':
        return 'bg-green-500';
      case 'warning':
      case 'low_stock':
        return 'bg-yellow-500';
      case 'critical':
      case 'out_of_stock':
        return 'bg-red-500';
      default:
        return 'bg-muted';
    }
  };

  const getStatusLabel = (status: 'good' | 'warning' | 'critical'): string => {
    switch (status) {
      case 'good':
        return 'In Stock';
      case 'warning':
        return 'Low Stock';
      case 'critical':
        return 'Out of Stock';
      default:
        return 'Unknown';
    }
  };

  return {
    inventory,
    summaries,
    isLoading,
    getStatusColor,
    getStatusLabel,
  };
};
