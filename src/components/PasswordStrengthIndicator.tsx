import { Check, X } from 'lucide-react';

interface PasswordStrengthIndicatorProps {
  password: string;
}

const PasswordStrengthIndicator = ({ password }: PasswordStrengthIndicatorProps) => {
  const checks = [
    { label: 'At least 8 characters', valid: password.length >= 8 },
    { label: 'Contains uppercase letter', valid: /[A-Z]/.test(password) },
    { label: 'Contains lowercase letter', valid: /[a-z]/.test(password) },
    { label: 'Contains number', valid: /[0-9]/.test(password) },
    { label: 'Contains special character', valid: /[^A-Za-z0-9]/.test(password) },
  ];

  const passedChecks = checks.filter(c => c.valid).length;
  const strengthLevel = passedChecks <= 2 ? 'Weak' : passedChecks <= 4 ? 'Medium' : 'Strong';
  const strengthColor = passedChecks <= 2 ? 'text-destructive' : passedChecks <= 4 ? 'text-primary' : 'text-green-500';

  return (
    <div className="space-y-2 mt-2">
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-300 ${
              passedChecks <= 2 ? 'bg-destructive w-1/3' : 
              passedChecks <= 4 ? 'bg-primary w-2/3' : 
              'bg-green-500 w-full'
            }`}
          />
        </div>
        <span className={`text-xs font-medium ${strengthColor}`}>
          {strengthLevel}
        </span>
      </div>
      <div className="grid grid-cols-1 gap-1">
        {checks.map((check) => (
          <div key={check.label} className="flex items-center gap-2 text-xs">
            {check.valid ? (
              <Check size={12} className="text-green-500 flex-shrink-0" />
            ) : (
              <X size={12} className="text-muted-foreground flex-shrink-0" />
            )}
            <span className={check.valid ? 'text-green-500' : 'text-muted-foreground'}>
              {check.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PasswordStrengthIndicator;
