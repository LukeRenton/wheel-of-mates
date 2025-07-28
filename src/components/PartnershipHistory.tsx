import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Partnership {
  week: number;
  partner: string;
}

interface PartnershipHistoryProps {
  currentUser: string;
  partnerships: Partnership[];
}

export const PartnershipHistory = ({ currentUser, partnerships }: PartnershipHistoryProps) => {
  if (partnerships.length === 0) {
    return (
      <Card className="shadow-elevated border-border/50">
        <CardHeader>
          <CardTitle className="text-xl">Partnership History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            No partnerships yet. Spin the wheel to find your first partner!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-elevated border-border/50">
      <CardHeader>
        <CardTitle className="text-xl">Partnership History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {partnerships.map((partnership) => (
            <div 
              key={partnership.week}
              className="flex items-center justify-between p-3 bg-secondary rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <Badge variant="outline" className="bg-primary text-primary-foreground">
                  Week {partnership.week}
                </Badge>
                <span className="font-medium">{partnership.partner}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};