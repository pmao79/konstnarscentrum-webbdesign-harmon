import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useParams } from 'react-router-dom';

export default function Product() {
  const { id } = useParams<{ id: string }>();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Produktinformation</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Produktsida för produkt {id} kommer snart...</p>
      </CardContent>
    </Card>
  );
} 