
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { formatDistanceToNow, format } from 'date-fns';
import { sv } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { FileSpreadsheet, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface ImportLog {
  id: string;
  created_at: string;
  file_name: string;
  supplier: string | null;
  import_status: string;
  products_added: number;
  products_updated: number;
  error_message: string | null;
}

const ImportHistory = () => {
  const [importLogs, setImportLogs] = useState<ImportLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Use memory variable to avoid state updates after unmount
    let isMounted = true;

    const fetchImportLogs = async () => {
      try {
        setIsLoading(true);
        
        // We're going to use the created_at field from products to create a simulated import history
        const { data: products, error } = await supabase
          .from('products')
          .select('created_at, supplier')
          .order('created_at', { ascending: false });
          
        if (error) {
          console.error('Error fetching import logs:', error);
          return;
        }
        
        if (!products || products.length === 0) {
          setImportLogs([]);
          return;
        }

        // Group products by date (just taking the date part of the timestamp)
        const groupedByDate = products.reduce((acc: Record<string, any[]>, product) => {
          // Get just the date part (without time)
          const dateKey = product.created_at ? product.created_at.split('T')[0] : 'unknown';
          
          if (!acc[dateKey]) {
            acc[dateKey] = [];
          }
          
          acc[dateKey].push(product);
          return acc;
        }, {});
        
        // Convert the grouped products into simulated import logs
        const simulatedLogs = Object.entries(groupedByDate).map(([dateKey, products]) => {
          const supplier = products[0]?.supplier || 'excel-import';
          
          return {
            id: dateKey,
            created_at: `${dateKey}T12:00:00.000Z`,
            file_name: `produkter-${dateKey}.xlsx`,
            supplier,
            import_status: 'completed',
            products_added: products.length,
            products_updated: 0,
            error_message: null
          };
        });
        
        if (isMounted) {
          setImportLogs(simulatedLogs);
        }
      } catch (error) {
        console.error('Error fetching import history:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchImportLogs();

    return () => {
      isMounted = false;
    };
  }, []);

  const renderStatus = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" /> Slutförd
          </Badge>
        );
      case 'in_progress':
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Loader2 className="w-3 h-3 mr-1 animate-spin" /> Pågående
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <AlertCircle className="w-3 h-3 mr-1" /> Misslyckad
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            {status}
          </Badge>
        );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-serif">Importhistorik</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : importLogs.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Datum</TableHead>
                <TableHead>Fil</TableHead>
                <TableHead>Leverantör</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Antal produkter</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {importLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    <div className="font-medium">
                      {format(new Date(log.created_at), 'yyyy-MM-dd')}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(log.created_at), { addSuffix: true, locale: sv })}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
                      {log.file_name}
                    </div>
                  </TableCell>
                  <TableCell>{log.supplier || 'okänd'}</TableCell>
                  <TableCell>{renderStatus(log.import_status)}</TableCell>
                  <TableCell className="text-right">{log.products_added + log.products_updated}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            Ingen importhistorik tillgänglig.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ImportHistory;
