import React from 'react';
import { 
  Award, 
  Trophy,
  Flame,
  Zap,
  Target
} from 'lucide-react';

const ContributionStats = ({ contributionData, userStats }) => {
  try {
    // Early return if no data available
    if (!contributionData && !userStats) {
      return null;
    }

    // Use contributionData if available, otherwise fall back to userStats
    const data = contributionData || userStats;
    
    // Ensure data is an object and has the required properties
    if (!data || typeof data !== 'object') {
      console.error('ContributionStats: Invalid data provided', { contributionData, userStats });
      return null;
    }

    // Provide default values for all required properties
    const safeData = {
      reputation_tier: data.reputation_tier || 'Bronze',
      contribution: data.contribution || 0,
      current_streak: data.current_streak || 0,
      longest_streak: data.longest_streak || 0,
      ...data
    };
  
  // Tier configuration with proper styling
  const getTierConfig = (tier) => {
    const configs = {
      Bronze: {
        icon: Trophy,
        color: 'text-orange-600 dark:text-orange-400',
        bgGradient: 'from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30',
        borderColor: 'border-orange-300 dark:border-orange-700',
        ringColor: 'ring-orange-100 dark:ring-orange-900/50'
      },
      Silver: {
        icon: Trophy,
        color: 'text-gray-600 dark:text-gray-400',
        bgGradient: 'from-gray-100 to-gray-200 dark:from-gray-900/30 dark:to-gray-800/30',
        borderColor: 'border-gray-300 dark:border-gray-700',
        ringColor: 'ring-gray-100 dark:ring-gray-900/50'
      },
      Gold: {
        icon: Trophy,
        color: 'text-yellow-600 dark:text-yellow-400',
        bgGradient: 'from-yellow-100 to-yellow-200 dark:from-yellow-900/30 dark:to-yellow-800/30',
        borderColor: 'border-yellow-300 dark:border-yellow-700',
        ringColor: 'ring-yellow-100 dark:ring-yellow-900/50'
      },
      Platinum: {
        icon: Trophy,
        color: 'text-purple-600 dark:text-purple-400',
        bgGradient: 'from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30',
        borderColor: 'border-purple-300 dark:border-purple-700',
        ringColor: 'ring-purple-100 dark:ring-purple-900/50'
      },
      Diamond: {
        icon: Trophy,
        color: 'text-cyan-600 dark:text-cyan-400',
        bgGradient: 'from-cyan-100 to-cyan-200 dark:from-cyan-900/30 dark:to-cyan-800/30',
        borderColor: 'border-cyan-300 dark:border-cyan-700',
        ringColor: 'ring-cyan-100 dark:ring-cyan-900/50'
      }
    };
    return configs[tier] || configs.Bronze;
  };

  const currentTier = safeData.reputation_tier || 'Bronze';
  const tierConfig = getTierConfig(currentTier);
  const TierIcon = tierConfig.icon;

  // Calculate next tier progress
  const getNextTierProgress = () => {
    const tiers = [
      { name: 'Bronze', min: 0, max: 99 },
      { name: 'Silver', min: 100, max: 499 },
      { name: 'Gold', min: 500, max: 1499 },
      { name: 'Platinum', min: 1500, max: 4999 },
      { name: 'Diamond', min: 5000, max: Infinity }
    ];

    const currentTierIndex = tiers.findIndex(t => t.name === currentTier);
    const nextTier = tiers[currentTierIndex + 1];
    
    if (!nextTier) {
      return { nextTier: null, progress: 100, pointsNeeded: 0 };
    }

    const currentPoints = safeData.contribution || 0;
    const pointsInCurrentTier = currentPoints - tiers[currentTierIndex].min;
    const pointsForNextTier = nextTier.min - tiers[currentTierIndex].min;
    const progress = Math.min((pointsInCurrentTier / pointsForNextTier) * 100, 100);
    const pointsNeeded = Math.max(0, nextTier.min - currentPoints);

    return { nextTier, progress, pointsNeeded };
  };

  const { nextTier, progress, pointsNeeded } = getNextTierProgress();

  return (
    <div className="space-y-6">
      {/* Tier Badge Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-all duration-200 hover:shadow-md">
        <div className={`bg-gradient-to-r ${tierConfig.bgGradient} px-4 py-3 border-b ${tierConfig.borderColor}`}>
          <div className="flex items-center">
            <Trophy className="w-4 h-4 text-gray-700 dark:text-gray-300 mr-2" />
            <h3 className="text-base font-bold text-gray-800 dark:text-white tracking-tight">Reputation Tier</h3>
          </div>
        </div>

        <div className="p-6">
          <div className="text-center">
            {/* Tier Badge */}
            <div className={`w-20 h-20 mx-auto mb-4 bg-gradient-to-br ${tierConfig.bgGradient} rounded-full flex items-center justify-center shadow-lg border-2 ${tierConfig.borderColor} ring-4 ${tierConfig.ringColor} transition-all duration-200 hover:ring-6 hover:shadow-xl`}>
              <TierIcon className={`w-10 h-10 ${tierConfig.color}`} />
            </div>

            {/* Tier Name */}
            <h4 className="text-xl font-bold text-gray-800 dark:text-white mb-1 tracking-tight">
              {currentTier} Tier
            </h4>
            
            {/* Contribution Points */}
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Award className="w-4 h-4 text-amber-500" />
              <span className="text-lg font-bold text-amber-600 dark:text-amber-400">
                {safeData.contribution || 0} points
              </span>
            </div>

            {/* Progress to Next Tier */}
            {nextTier && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Progress to {nextTier.name}</span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 shadow-inner">
                  <div 
                    className={`bg-gradient-to-r ${getTierConfig(nextTier.name).bgGradient} h-2 rounded-full transition-all duration-500 shadow-sm`}
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                  {pointsNeeded} more points needed
                </p>
              </div>
            )}

            {currentTier === 'Diamond' && (
              <div className="mt-4 p-3 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-lg border border-cyan-200 dark:border-cyan-800">
                <p className="text-sm font-medium text-cyan-700 dark:text-cyan-300">
                  🎉 Maximum tier reached! You're a top contributor!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Streak Information */}
      {(safeData.current_streak > 0 || safeData.longest_streak > 0) && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-all duration-200 hover:shadow-md">
          <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 px-4 py-3 border-b border-gray-100 dark:border-gray-600">
            <div className="flex items-center">
              <Flame className="w-4 h-4 text-orange-600 dark:text-orange-400 mr-2" />
              <h3 className="text-base font-bold text-gray-800 dark:text-white tracking-tight">Activity Streaks</h3>
            </div>
          </div>

          <div className="p-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-orange-50/50 dark:bg-orange-900/10 rounded-lg border border-orange-100 dark:border-orange-800/50">
                <div className="flex items-center justify-center mb-2">
                  <Zap className="w-5 h-5 text-orange-500" />
                </div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Current Streak</p>
                <p className="text-xl font-bold text-orange-600 dark:text-orange-400">
                  {safeData.current_streak || 0}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">days</p>
              </div>

              <div className="text-center p-3 bg-red-50/50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-800/50">
                <div className="flex items-center justify-center mb-2">
                  <Target className="w-5 h-5 text-red-500" />
                </div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Best Streak</p>
                <p className="text-xl font-bold text-red-600 dark:text-red-400">
                  {safeData.longest_streak || 0}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">days</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
  } catch (error) {
    console.error('ContributionStats component error:', error);
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p className="text-red-600 dark:text-red-400 text-sm">
          Error loading contribution stats. Please refresh the page.
        </p>
      </div>
    );
  }
};

export default ContributionStats;