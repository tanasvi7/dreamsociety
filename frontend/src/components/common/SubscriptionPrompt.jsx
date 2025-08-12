import React from 'react';
import { Link } from 'react-router-dom';
import { Lock, Star, Users, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const SubscriptionPrompt = ({ 
  title = "Subscribe to Unlock Premium Features", 
  description = "Get access to exclusive features and connect with our community",
  features = [],
  showFeatures = true,
  className = ""
}) => {
  const defaultFeatures = [
    { icon: Users, text: "Connect with members" },
    { icon: Briefcase, text: "Apply for jobs" },
    { icon: Star, text: "View detailed profiles" },
    { icon: Lock, text: "Premium access" }
  ];

  const displayFeatures = features.length > 0 ? features : defaultFeatures;

  return (
    <Card className={`bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-800 dark:to-slate-700 border-2 border-blue-200 dark:border-blue-700 ${className}`}>
      <CardContent className="p-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full mb-4">
            <Lock className="h-6 w-6 text-white" />
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {title}
          </h3>
          
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {description}
          </p>

          {showFeatures && (
            <div className="grid grid-cols-2 gap-3 mb-6">
              {displayFeatures.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <feature.icon className="h-4 w-4 text-blue-600" />
                  <span>{feature.text}</span>
                </div>
              ))}
            </div>
          )}

          <Link to="/membership">
            <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3">
              Subscribe Now
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default SubscriptionPrompt;
