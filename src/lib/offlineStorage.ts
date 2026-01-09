// Utility for offline data storage and sync

type PendingSale = {
    id: string;
    productId: string;
    productName: string;
    salePrice: number;
    timestamp: number;
    status: 'pending' | 'syncing' | 'failed';
  };
  
  type OfflineCache = {
    products: any[];
    stats: any;
    lastUpdated: number;
  };
  
  class OfflineStorage {
    private readonly PENDING_SALES_KEY = 'pending_sales';
    private readonly CACHE_KEY = 'dashboard_cache';
    
    // Save pending sale to localStorage
    savePendingSale(sale: Omit<PendingSale, 'id' | 'timestamp' | 'status'>): string {
      const pendingSales = this.getPendingSales();
      const newSale: PendingSale = {
        ...sale,
        id: Date.now().toString(),
        timestamp: Date.now(),
        status: 'pending'
      };
      
      pendingSales.push(newSale);
      localStorage.setItem(this.PENDING_SALES_KEY, JSON.stringify(pendingSales));
      
      return newSale.id;
    }
    
    // Get all pending sales
    getPendingSales(): PendingSale[] {
      try {
        const data = localStorage.getItem(this.PENDING_SALES_KEY);
        return data ? JSON.parse(data) : [];
      } catch {
        return [];
      }
    }
    
    // Remove a pending sale after successful sync
    removePendingSale(saleId: string): void {
      const pendingSales = this.getPendingSales();
      const updated = pendingSales.filter(sale => sale.id !== saleId);
      localStorage.setItem(this.PENDING_SALES_KEY, JSON.stringify(updated));
    }
    
    // Update sale status
    updateSaleStatus(saleId: string, status: 'syncing' | 'failed'): void {
      const pendingSales = this.getPendingSales();
      const updated = pendingSales.map(sale => 
        sale.id === saleId ? { ...sale, status } : sale
      );
      localStorage.setItem(this.PENDING_SALES_KEY, JSON.stringify(updated));
    }
    
    // Cache dashboard data for offline viewing
    cacheDashboardData(products: any[], stats: any): void {
      const cache: OfflineCache = {
        products,
        stats,
        lastUpdated: Date.now()
      };
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(cache));
    }
    
    // Get cached dashboard data
    getCachedData(): OfflineCache | null {
      try {
        const data = localStorage.getItem(this.CACHE_KEY);
        return data ? JSON.parse(data) : null;
      } catch {
        return null;
      }
    }
    
    // Clear all offline data
    clearAll(): void {
      localStorage.removeItem(this.PENDING_SALES_KEY);
      localStorage.removeItem(this.CACHE_KEY);
    }
    
    // Check if there are pending sales
    hasPendingSales(): boolean {
      return this.getPendingSales().length > 0;
    }
  }
  
  export const offlineStorage = new OfflineStorage();
  export type { PendingSale };