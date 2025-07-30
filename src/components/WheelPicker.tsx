import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

interface WheelPickerProps {
  names: string[];
  onSelect: (name: string) => void;
  disabled?: boolean;
}

export const WheelPicker = ({ names, onSelect, disabled = false }: WheelPickerProps) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const wheelRef = useRef<HTMLDivElement>(null);

  const segmentAngle = 360 / names.length;
  const colors = [
    '#8B5CF6', // purple
    '#F97316', // orange
    '#10B981', // green
    '#F59E0B', // yellow
    '#3B82F6', // blue
    '#EC4899', // pink
    '#EF4444', // red
    '#6366F1'  // indigo
  ];

  const spinWheel = () => {
    if (isSpinning || disabled) return;

    setIsSpinning(true);
    
    // Random spin between 4-8 full rotations plus random angle
    const spins = Math.floor(Math.random() * 5) + 4;
    const randomAngle = Math.random() * 360;
    const totalRotation = rotation + (spins * 360) + randomAngle;
    
    // Apply rotation with CSS transition
    if (wheelRef.current) {
      wheelRef.current.style.transition = 'transform 4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      wheelRef.current.style.transform = `rotate(${totalRotation}deg)`;
    }

    setTimeout(() => {
      // Calculate which segment the pointer landed on
      const normalizedAngle = (360 - (totalRotation % 360)) % 360;
      const selectedIndex = Math.floor(normalizedAngle / segmentAngle);
      const selectedName = names[selectedIndex];
      
      setIsSpinning(false);
      setRotation(totalRotation);
      
      // Reset transition for next spin
      if (wheelRef.current) {
        wheelRef.current.style.transition = 'none';
      }
      
      onSelect(selectedName);
      
      toast({
        title: "Partner Selected!",
        description: `You've been matched with ${selectedName}`,
      });
    }, 4000);
  };

  return (
    <div className="flex flex-col items-center space-y-8">
      <div className="relative">
        {/* Pointer */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 z-10">
          <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-primary" />
        </div>
        
        {/* Wheel */}
        <div 
          ref={wheelRef}
          className="relative w-80 h-80 rounded-full border-4 border-primary shadow-elevated"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          {names.map((name, index) => {
            const angle = index * segmentAngle;
            const color = colors[index % colors.length];
            const nextAngle = (index + 1) * segmentAngle;
            
            // Calculate the segment points for a proper pie slice
            const x1 = 50 + 50 * Math.cos((angle - 90) * Math.PI / 180);
            const y1 = 50 + 50 * Math.sin((angle - 90) * Math.PI / 180);
            const x2 = 50 + 50 * Math.cos((nextAngle - 90) * Math.PI / 180);
            const y2 = 50 + 50 * Math.sin((nextAngle - 90) * Math.PI / 180);
            
            const largeArcFlag = segmentAngle > 180 ? 1 : 0;
            
            return (
              <div
                key={name}
                className="absolute inset-0"
                style={{
                  clipPath: `polygon(50% 50%, ${x1}% ${y1}%, ${x2}% ${y2}%)`
                }}
              >
                <div 
                  className="w-full h-full"
                  style={{ backgroundColor: color }}
                />
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{
                    transform: `rotate(${angle + segmentAngle / 2}deg)`
                  }}
                >
                  <span 
                    className="text-white font-bold text-xs"
                    style={{
                      transform: `translateY(-100px) rotate(${segmentAngle > 180 ? 180 : 0}deg)`,
                      transformOrigin: 'center'
                    }}
                  >
                    {name}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Button 
        onClick={spinWheel} 
        disabled={isSpinning || disabled}
        className="bg-gradient-primary hover:shadow-glow transition-all duration-300 text-lg px-8 py-6"
      >
        {isSpinning ? 'Spinning...' : 'Spin the Wheel!'}
      </Button>
    </div>
  );
};