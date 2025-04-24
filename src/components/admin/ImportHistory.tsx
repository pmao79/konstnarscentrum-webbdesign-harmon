
import React, { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { format } from 'date-fns';
import { sv } from 'date-fns/locale';
import { Badge } from "@/components/ui/badge";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface ImportLog {
  id: string;
  file_name: string;
  supplier: string;
  import_status: string;
  products_added: number;
  products_updated: number;
  created_at: string;
  error_message?: string;
}

const ImportHistory = () => {
  const [logs, setLogs] = useState<ImportLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchImportLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('import_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
          
      if (error) throw error;
      
      setLogs(data || []);
    } catch (error) {
      console.error('Error fetching import logs:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchImportLogs();
    
    // Set up real-time subscription for new imports
    const channel = supabase
      .channel('import_logs_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'import_logs' 
        }, 
        () => {
          fetchImportLogs();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const refreshLogs = () => {
    setIsRefreshing(true);
    fetchImportLogs();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-500">Slutförd</Badge>;
      case 'in_progress':
        return <Badge variant="default" className="bg-blue-500">Pågår</Badge>;
      case 'failed':
        return <Badge variant="destructive">Misslyckad</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-serif">Importhistorik</CardTitle>
          <Button size="sm" variant="outline" onClick={refreshLogs} disabled={isRefreshing}>
            {isRefreshing ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-1" />
            )}
            Uppdatera
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : logs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-2 text-left">Datum</th>
                  <th className="px-4 py-2 text-left">Filnamn</th>
                  <th className="px-4 py-2 text-left">Leverantör</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-right">Antal</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-t">
                    <td className="px-4 py-2">
                      {format(new Date(log.created_at), 'PPP HH:mm', { locale: sv })}
                    </td>
                    <td className="px-4 py-2 font-medium">{log.file_name}</td>
                    <td className="px-4 py-2">{log.supplier || '-'}</td>
                    <td className="px-4 py-2">{getStatusBadge(log.import_status)}</td>
                    <td className="px-4 py-2 text-right">
                      {log.products_added + log.products_updated} produkter
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center py-8 text-muted-foreground">
            Ingen importhistorik tillgänglig
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default ImportHistory;
