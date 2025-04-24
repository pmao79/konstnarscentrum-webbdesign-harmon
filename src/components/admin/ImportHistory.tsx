
import React, { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { format } from 'date-fns';
import { sv } from 'date-fns/locale';
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

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

  useEffect(() => {
    const fetchImportLogs = async () => {
      try {
        const { data, error } = await supabase
          .from('import_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10);
          
        if (error) throw error;
        
        setLogs(data || []);
      } catch (error) {
        console.error('Error fetching import logs:', error);
      } finally {
        setIsLoading(false);
      }
    };

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
    <div className="p-4 border rounded-lg bg-background">
      <h2 className="text-xl font-serif mb-4">Importhistorik</h2>
      
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
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-right">Antal</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-t">
                  <td className="px-4 py-2">
                    {format(new Date(log.created_at), 'PPP', { locale: sv })}
                  </td>
                  <td className="px-4 py-2 font-medium">{log.file_name}</td>
                  <td className="px-4 py-2">{getStatusBadge(log.import_status)}</td>
                  <td className="px-4 py-2 text-right">
                    {log.products_added} produkter
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
    </div>
  );
};

export default ImportHistory;
