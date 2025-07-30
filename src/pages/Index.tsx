import { useState, useEffect } from 'react';
import { NameInput } from '@/components/NameInput';
import { WheelPicker } from '@/components/WheelPicker';
import { PartnershipHistory } from '@/components/PartnershipHistory';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';

interface Partnership {
  week: number;
  partner: string;
  hasSpun?: boolean; // Track if user has spun for this partnership
}

interface UserData {
  name: string;
  partnerships: Partnership[];
  currentWeek: number;
}

const VALID_NAMES = [
  'Sam', 'Luke', 'Zee-Jay', 'Courtney', 'Banele', 'Dumi', 'Ethan', 
  'Jazlyn', 'Justine', 'Lesedi', 'Madi', 'Martin', 'Ndilisa', 'Tino', 'Wilmar', 'Thembi'
];

const PRECOMPUTED_PAIRS = [
  {'week': 1, 'pairs': [['Ndilisa', 'Thembi'], ['Zee-Jay', 'Martin'], ['Ethan', 'Dumi'], ['Sam', 'Banele'], ['Lesedi', 'Courtney'], ['Luke', 'Wilmar'], ['Madi', 'Justine'], ['Jazlyn', 'Tino']]},
  {'week': 2, 'pairs': [['Jazlyn', 'Zee-Jay'], ['Madi', 'Thembi'], ['Justine', 'Martin'], ['Courtney', 'Banele'], ['Ndilisa', 'Tino'], ['Ethan', 'Sam'], ['Dumi', 'Wilmar'], ['Luke', 'Lesedi']]},
  {'week': 3, 'pairs': [['Luke', 'Sam'], ['Dumi', 'Ndilisa'], ['Jazlyn', 'Thembi'], ['Zee-Jay', 'Ethan'], ['Wilmar', 'Banele'], ['Lesedi', 'Justine'], ['Courtney', 'Tino'], ['Madi', 'Martin']]},
  {'week': 4, 'pairs': [['Zee-Jay', 'Sam'], ['Ndilisa', 'Courtney'], ['Tino', 'Luke'], ['Jazlyn', 'Ethan'], ['Lesedi', 'Dumi'], ['Justine', 'Wilmar'], ['Thembi', 'Martin'], ['Madi', 'Banele']]},
  {'week': 5, 'pairs': [['Ethan', 'Wilmar'], ['Zee-Jay', 'Banele'], ['Jazlyn', 'Madi'], ['Luke', 'Thembi'], ['Courtney', 'Martin'], ['Justine', 'Sam'], ['Ndilisa', 'Lesedi'], ['Tino', 'Dumi']]},
  {'week': 6, 'pairs': [['Zee-Jay', 'Tino'], ['Jazlyn', 'Luke'], ['Martin', 'Wilmar'], ['Madi', 'Ethan'], ['Banele', 'Ndilisa'], ['Justine', 'Dumi'], ['Sam', 'Lesedi'], ['Thembi', 'Courtney']]},
  {'week': 7, 'pairs': [['Courtney', 'Dumi'], ['Tino', 'Thembi'], ['Sam', 'Wilmar'], ['Ndilisa', 'Martin'], ['Ethan', 'Lesedi'], ['Zee-Jay', 'Madi'], ['Luke', 'Justine'], ['Jazlyn', 'Banele']]},
  {'week': 8, 'pairs': [['Wilmar', 'Jazlyn'], ['Justine', 'Ndilisa'], ['Dumi', 'Sam'], ['Zee-Jay', 'Lesedi'], ['Banele', 'Martin'], ['Tino', 'Madi'], ['Courtney', 'Luke'], ['Ethan', 'Thembi']]},
  {'week': 9, 'pairs': [['Dumi', 'Banele'], ['Ethan', 'Tino'], ['Zee-Jay', 'Wilmar'], ['Madi', 'Lesedi'], ['Jazlyn', 'Ndilisa'], ['Sam', 'Courtney'], ['Thembi', 'Justine'], ['Luke', 'Martin']]},
  {'week': 10, 'pairs': [['Luke', 'Ndilisa'], ['Courtney', 'Justine'], ['Madi', 'Dumi'], ['Zee-Jay', 'Thembi'], ['Sam', 'Tino'], ['Banele', 'Ethan'], ['Wilmar', 'Lesedi'], ['Martin', 'Jazlyn']]},
  {'week': 11, 'pairs': [['Zee-Jay', 'Justine'], ['Thembi', 'Lesedi'], ['Banele', 'Luke'], ['Jazlyn', 'Sam'], ['Dumi', 'Martin'], ['Ndilisa', 'Ethan'], ['Tino', 'Wilmar'], ['Madi', 'Courtney']]},
  {'week': 12, 'pairs': [['Wilmar', 'Courtney'], ['Banele', 'Lesedi'], ['Luke', 'Zee-Jay'], ['Ndilisa', 'Madi'], ['Sam', 'Thembi'], ['Justine', 'Tino'], ['Jazlyn', 'Dumi'], ['Martin', 'Ethan']]},
  {'week': 13, 'pairs': [['Wilmar', 'Ndilisa'], ['Ethan', 'Courtney'], ['Banele', 'Thembi'], ['Sam', 'Martin'], ['Madi', 'Luke'], ['Lesedi', 'Tino'], ['Zee-Jay', 'Dumi'], ['Jazlyn', 'Justine']]},
  {'week': 14, 'pairs': [['Ethan', 'Justine'], ['Thembi', 'Wilmar'], ['Jazlyn', 'Courtney'], ['Banele', 'Tino'], ['Ndilisa', 'Zee-Jay'], ['Lesedi', 'Martin'], ['Madi', 'Sam'], ['Dumi', 'Luke']]},
  {'week': 15, 'pairs': [['Courtney', 'Zee-Jay'], ['Ethan', 'Luke'], ['Thembi', 'Dumi'], ['Martin', 'Tino'], ['Justine', 'Banele'], ['Wilmar', 'Madi'], ['Ndilisa', 'Sam'], ['Jazlyn', 'Lesedi']]}
];

const Index = () => {
  const [currentUser, setCurrentUser] = useState<string>('');
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [userSpinHistory, setUserSpinHistory] = useState<Record<string, number[]>>({});

  // Load data from localStorage on component mount
  useEffect(() => {
    const saved = localStorage.getItem('partnerPickerSpinHistory');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setUserSpinHistory(data);
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    }
  }, []);

  // Save data to localStorage whenever userSpinHistory changes
  useEffect(() => {
    if (Object.keys(userSpinHistory).length > 0) {
      localStorage.setItem('partnerPickerSpinHistory', JSON.stringify(userSpinHistory));
    }
  }, [userSpinHistory]);

  const handleNameSubmit = (name: string) => {
    setCurrentUser(name);
  };

  const getPartnerForWeek = (week: number) => {
    const weekData = PRECOMPUTED_PAIRS.find(w => w.week === week);
    if (!weekData) return null;
    
    for (const pair of weekData.pairs) {
      if (pair[0] === currentUser) return pair[1];
      if (pair[1] === currentUser) return pair[0];
    }
    return null;
  };

  const hasUserSpunForWeek = (week: number) => {
    return userSpinHistory[currentUser]?.includes(week) || false;
  };

  const handlePartnerSelection = (selectedPartner: string) => {
    // Mark this week as spun for current user
    setUserSpinHistory(prev => ({
      ...prev,
      [currentUser]: [...(prev[currentUser] || []), selectedWeek]
    }));

    toast({
      title: "Partner Revealed! 🎉",
      description: `You've been matched with ${selectedPartner} for Week ${selectedWeek}!`,
    });
  };

  const getAvailablePartners = () => {
    const partner = getPartnerForWeek(selectedWeek);
    return partner ? [partner] : [];
  };

  const resetUser = () => {
    setCurrentUser('');
    setSelectedWeek(1);
  };

  const getUserSpinHistory = () => {
    return userSpinHistory[currentUser] || [];
  };

  if (!currentUser) {
    return <NameInput validNames={VALID_NAMES} onNameSubmit={handleNameSubmit} />;
  }

  const currentPartner = hasUserSpunForWeek(selectedWeek) ? getPartnerForWeek(selectedWeek) : null;

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
            Partner Picker
          </h1>
          <p className="text-muted-foreground">
            Welcome back, <span className="font-semibold text-foreground">{currentUser}</span>!
          </p>
          <Button 
            variant="outline" 
            onClick={resetUser}
            className="mt-2"
          >
            Switch User
          </Button>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Week Selection and Wheel */}
          <div className="space-y-6">
            {/* Week Selection */}
            <Card className="shadow-elevated border-border/50">
              <CardHeader>
                <CardTitle className="text-2xl text-center">Select Week</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {Array.from({ length: 15 }, (_, i) => i + 1).map(week => (
                    <Button
                      key={week}
                      variant={selectedWeek === week ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedWeek(week)}
                      className={`${hasUserSpunForWeek(week) ? 'bg-green-600 hover:bg-green-700' : ''}`}
                    >
                      Week {week} {hasUserSpunForWeek(week) && '✓'}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Partner Section */}
            {currentPartner ? (
              <Card className="shadow-elevated border-border/50">
                <CardHeader>
                  <CardTitle className="text-2xl text-center">Week {selectedWeek} Partner</CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-6">
                  <div className="p-6 bg-gradient-success rounded-lg">
                    <h2 className="text-3xl font-bold text-success-foreground">
                      {currentPartner}
                    </h2>
                    <p className="text-success-foreground/80 mt-2">
                      Already revealed!
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="shadow-elevated border-border/50">
                <CardHeader>
                  <CardTitle className="text-2xl text-center">Find Your Week {selectedWeek} Partner</CardTitle>
                </CardHeader>
                <CardContent>
                  {getAvailablePartners().length > 0 ? (
                    <WheelPicker 
                      names={getAvailablePartners()}
                      onSelect={handlePartnerSelection}
                    />
                  ) : (
                    <div className="text-center py-8">
                      <h3 className="text-xl font-semibold mb-2">No partner available</h3>
                      <p className="text-muted-foreground">
                        Select a different week to find your partner.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - History */}
          <div>
            <Card className="shadow-elevated border-border/50">
              <CardHeader>
                <CardTitle className="text-2xl text-center">Your Spin History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getUserSpinHistory().map(week => {
                    const partner = getPartnerForWeek(week);
                    return (
                      <div key={week} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                        <span className="font-medium">Week {week}</span>
                        <span className="text-primary font-semibold">{partner}</span>
                      </div>
                    );
                  })}
                  {getUserSpinHistory().length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      No spins yet! Select a week and spin the wheel.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
