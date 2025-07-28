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
}

interface UserData {
  name: string;
  partnerships: Partnership[];
  currentWeek: number;
}

const VALID_NAMES = [
  'Sam', 'Luke', 'Zee-Jay', 'Courtney', 'Banele', 'Dumi', 'Ethan', 
  'Jazlyn', 'Justine', 'Lesedi', 'Madi', 'Martin', 'Ndilisa', 'Tino', 'Wilmar'
];

const Index = () => {
  const [currentUser, setCurrentUser] = useState<string>('');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [currentPartner, setCurrentPartner] = useState<string>('');
  const [allPartnerships, setAllPartnerships] = useState<Record<string, UserData>>({});

  // Load data from localStorage on component mount
  useEffect(() => {
    const saved = localStorage.getItem('partnerPickerData');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setAllPartnerships(data);
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    }
  }, []);

  // Save data to localStorage whenever allPartnerships changes
  useEffect(() => {
    if (Object.keys(allPartnerships).length > 0) {
      localStorage.setItem('partnerPickerData', JSON.stringify(allPartnerships));
    }
  }, [allPartnerships]);

  // Update userData when currentUser or allPartnerships changes
  useEffect(() => {
    if (currentUser && allPartnerships[currentUser]) {
      setUserData(allPartnerships[currentUser]);
      const latestPartnership = allPartnerships[currentUser].partnerships[allPartnerships[currentUser].partnerships.length - 1];
      if (latestPartnership) {
        setCurrentPartner(latestPartnership.partner);
      }
    }
  }, [currentUser, allPartnerships]);

  const handleNameSubmit = (name: string) => {
    setCurrentUser(name);
    
    // Initialize user data if it doesn't exist
    if (!allPartnerships[name]) {
      const newUserData: UserData = {
        name,
        partnerships: [],
        currentWeek: 1
      };
      
      setAllPartnerships(prev => ({
        ...prev,
        [name]: newUserData
      }));
      setUserData(newUserData);
    }
  };

  const getAvailablePartners = () => {
    if (!userData) return [];
    
    const previousPartners = userData.partnerships.map(p => p.partner);
    return VALID_NAMES.filter(name => 
      name !== currentUser && !previousPartners.includes(name)
    );
  };

  const handlePartnerSelection = (selectedPartner: string) => {
    if (!userData) return;

    const newWeek = userData.currentWeek;
    
    // Update current user's data
    const updatedUserData: UserData = {
      ...userData,
      partnerships: [...userData.partnerships, { week: newWeek, partner: selectedPartner }],
      currentWeek: newWeek + 1
    };

    // Update selected partner's data
    const partnerData = allPartnerships[selectedPartner] || {
      name: selectedPartner,
      partnerships: [],
      currentWeek: 1
    };

    const updatedPartnerData: UserData = {
      ...partnerData,
      partnerships: [...partnerData.partnerships, { week: newWeek, partner: currentUser }],
      currentWeek: Math.max(partnerData.currentWeek, newWeek + 1)
    };

    // Update state
    setAllPartnerships(prev => ({
      ...prev,
      [currentUser]: updatedUserData,
      [selectedPartner]: updatedPartnerData
    }));

    setCurrentPartner(selectedPartner);
    setUserData(updatedUserData);
  };

  const startNewWeek = () => {
    setCurrentPartner('');
    toast({
      title: "New Week Started!",
      description: "Time to find a new partner for this week.",
    });
  };

  const resetUser = () => {
    setCurrentUser('');
    setUserData(null);
    setCurrentPartner('');
  };

  if (!currentUser) {
    return <NameInput validNames={VALID_NAMES} onNameSubmit={handleNameSubmit} />;
  }

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
          {/* Left Column - Current Status */}
          <div className="space-y-6">
            {currentPartner ? (
              <Card className="shadow-elevated border-border/50">
                <CardHeader>
                  <CardTitle className="text-2xl text-center">Current Partner</CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-6">
                  <div className="p-6 bg-gradient-success rounded-lg">
                    <h2 className="text-3xl font-bold text-success-foreground">
                      {currentPartner}
                    </h2>
                    <p className="text-success-foreground/80 mt-2">
                      Week {userData?.currentWeek ? userData.currentWeek - 1 : 1} Partner
                    </p>
                  </div>
                  
                  <Button 
                    onClick={startNewWeek}
                    className="w-full bg-gradient-accent hover:shadow-glow transition-all duration-300 text-lg py-6"
                    disabled={getAvailablePartners().length === 0}
                  >
                    {getAvailablePartners().length === 0 ? 'No More Partners Available' : 'Start New Week'}
                  </Button>
                  
                  {getAvailablePartners().length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      You've been partnered with everyone! 🎉
                    </p>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="shadow-elevated border-border/50">
                <CardHeader>
                  <CardTitle className="text-2xl text-center">Find Your Partner</CardTitle>
                </CardHeader>
                <CardContent>
                  {getAvailablePartners().length > 0 ? (
                    <WheelPicker 
                      names={getAvailablePartners()}
                      onSelect={handlePartnerSelection}
                    />
                  ) : (
                    <div className="text-center py-8">
                      <h3 className="text-xl font-semibold mb-2">All Done! 🎉</h3>
                      <p className="text-muted-foreground">
                        You've been partnered with everyone available.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - History */}
          <div>
            <PartnershipHistory 
              currentUser={currentUser}
              partnerships={userData?.partnerships || []}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
