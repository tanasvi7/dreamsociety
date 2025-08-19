const { User, Job, JobApplication, Payment, Profile, Skill, EducationDetail, EmploymentDetail, FamilyMember } = require('../models');
const { Op } = require('sequelize');
const { ValidationError } = require('../middlewares/errorHandler');

// Get member dashboard statistics
exports.getMemberDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Profile views (this would need to be tracked in a separate table)
    const profileViews = 0; // Placeholder - would need analytics tracking

    // Job applications count
    const jobApplications = await JobApplication.count({
      where: { user_id: userId }
    });

    // Network connections (users with similar skills or from same location)
    const userProfile = await Profile.findOne({ where: { user_id: userId } });
    let networkConnections = 0;
    if (userProfile && userProfile.location) {
      // Find users with similar skills or from same location
      const similarUsers = await Profile.count({
        where: {
          user_id: { [Op.ne]: userId },
          location: userProfile.location
        }
      });
      networkConnections = similarUsers;
    }

    // Skill endorsements count
    const skillEndorsements = await Skill.count({
      where: { 
        user_id: userId,
        endorsed_by: { [Op.ne]: null }
      }
    });

    const stats = [
      {
        label: 'Profile Views',
        value: profileViews.toString(),
        icon: 'User',
        color: 'blue'
      },
      {
        label: 'Job Applications',
        value: jobApplications.toString(),
        icon: 'Briefcase',
        color: 'green'
      },
      {
        label: 'Network Connections',
        value: networkConnections.toString(),
        icon: 'Users',
        color: 'purple'
      },
      {
        label: 'Skill Endorsements',
        value: skillEndorsements.toString(),
        icon: 'Award',
        color: 'yellow'
      }
    ];

    res.json({ stats });
  } catch (err) {
    next(err);
  }
};

// Get member profile completion percentage
exports.getProfileCompletion = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Check profile completion
    const profile = await Profile.findOne({ where: { user_id: userId } });
    const education = await EducationDetail.findOne({ where: { user_id: userId } });
    const employment = await EmploymentDetail.findOne({ where: { user_id: userId } });
    const skills = await Skill.findOne({ where: { user_id: userId } });
    const family = await FamilyMember.findOne({ where: { user_id: userId } });

    let completion = 0;
    if (profile) completion += 20;
    if (education) completion += 20;
    if (employment) completion += 20;
    if (skills) completion += 20;
    if (family) completion += 20;

    res.json({ profileComplete: completion });
  } catch (err) {
    next(err);
  }
};

// Get recent activities for member
exports.getRecentActivities = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 5;

    const activities = [];

    // Recent job applications
    const recentApplications = await JobApplication.findAll({
      include: [
        {
          model: Job,
          as: 'job',
          attributes: ['title', 'posted_by']
        }
      ],
      where: { user_id: userId },
      order: [['application_date', 'DESC']],
      limit: limit
    });

    recentApplications.forEach(app => {
      activities.push({
        type: 'application',
        text: `Applied for ${app.job.title}`,
        time: app.application_date,
        timestamp: new Date(app.application_date).getTime()
      });
    });

    // Recent skill endorsements
    const recentEndorsements = await Skill.findAll({
      where: { 
        user_id: userId,
        endorsed_by: { [Op.ne]: null }
      },
      limit: limit
    });

    recentEndorsements.forEach(skill => {
      activities.push({
        type: 'skill',
        text: `Received endorsement for ${skill.skill_name}`,
        time: new Date(), // Since no created_at field, use current time
        timestamp: Date.now()
      });
    });

    // Sort by timestamp and take the most recent
    activities.sort((a, b) => b.timestamp - a.timestamp);
    const recentActivities = activities.slice(0, limit);

    // Format time ago
    const formatTimeAgo = (date) => {
      const now = new Date();
      const diff = now - new Date(date);
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const days = Math.floor(hours / 24);
      
      if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
      if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
      return 'Just now';
    };

    const formattedActivities = recentActivities.map(activity => ({
      ...activity,
      time: formatTimeAgo(activity.time)
    }));

    res.json({ activities: formattedActivities });
  } catch (err) {
    next(err);
  }
};

// Get recommended jobs for member
exports.getRecommendedJobs = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 5;

    // Get user's skills
    const userSkills = await Skill.findAll({
      where: { user_id: userId },
      attributes: ['skill_name']
    });

    const skillNames = userSkills.map(skill => skill.skill_name);

    // Find jobs that match user's skills
    let recommendedJobs = [];
    
    if (skillNames.length > 0) {
      recommendedJobs = await Job.findAll({
        where: {
          status: 'accepted',
          [Op.or]: [
            {
              skills_required: {
                [Op.or]: skillNames.map(skill => ({
                  [Op.like]: `%${skill}%`
                }))
              }
            }
          ]
        },
        include: [
          {
            model: User,
            as: 'poster',
            attributes: ['full_name']
          }
        ],
        order: [['created_at', 'DESC']],
        limit: limit
      });
    }

    // If no skill-based recommendations, get recent jobs
    if (recommendedJobs.length === 0) {
      recommendedJobs = await Job.findAll({
        where: { status: 'accepted' },
        include: [
          {
            model: User,
            as: 'poster',
            attributes: ['full_name']
          }
        ],
        order: [['created_at', 'DESC']],
        limit: limit
      });
    }

    const formattedJobs = recommendedJobs.map(job => ({
      id: job.id,
      title: job.title,
      company: job.poster?.full_name || 'Unknown Company',
      location: job.location || 'Remote',
      salary: job.salary_range || 'Not specified',
      type: job.job_type || 'Full-time'
    }));

    res.json({ jobs: formattedJobs });
  } catch (err) {
    next(err);
  }
};

// Get member analytics
exports.getMemberAnalytics = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Application success rate
    const totalApplications = await JobApplication.count({
      where: { user_id: userId }
    });

    const acceptedApplications = await JobApplication.count({
      where: { 
        user_id: userId,
        status: 'accepted'
      }
    });

    const successRate = totalApplications > 0 ? Math.round((acceptedApplications / totalApplications) * 100) : 0;

    // Skills analysis
    const userSkills = await Skill.findAll({
      where: { user_id: userId },
      attributes: ['skill_name', 'endorsed_by']
    });

    const endorsedSkills = userSkills.filter(skill => skill.endorsed_by !== null);
    const endorsementRate = userSkills.length > 0 ? Math.round((endorsedSkills.length / userSkills.length) * 100) : 0;

    // Application trend (last 6 months)
    const months = [];
    const applicationCounts = [];
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      const count = await JobApplication.count({
        where: {
          user_id: userId,
          application_date: {
            [Op.between]: [startOfMonth, endOfMonth]
          }
        }
      });
      
      months.push(startOfMonth.toLocaleDateString('en-US', { month: 'short' }));
      applicationCounts.push(count);
    }

    // Top skills by endorsements
    const topSkills = await Skill.findAll({
      where: { 
        user_id: userId,
        endorsed_by: { [Op.ne]: null }
      },
      attributes: ['skill_name'],
      limit: 5
    });

    res.json({
      successRate,
      endorsementRate,
      totalApplications,
      acceptedApplications,
      applicationTrend: {
        months,
        applicationCounts
      },
      topSkills: topSkills.map(skill => skill.skill_name)
    });
  } catch (err) {
    next(err);
  }
};

// Get member membership status (placeholder for future implementation)
exports.getMembershipStatus = async (req, res, next) => {
  try {
    // For now, return default free membership status
    res.json({
      isPremium: false,
      membershipType: 'Free',
      expiresAt: null
    });
  } catch (err) {
    next(err);
  }
};

// Get community statistics for member dashboard
exports.getCommunityStats = async (req, res, next) => {
  try {
    // Total members count
    const totalMembers = await User.count({
      where: { role: 'member' }
    });

    // Total jobs posted
    const totalJobs = await Job.count({
      where: { status: 'accepted' }
    });

    // Members by profession (working_type)
    const membersByProfession = await User.findAll({
      attributes: [
        'working_type',
        [User.sequelize.fn('COUNT', User.sequelize.col('id')), 'count']
      ],
      where: { 
        role: 'member',
        working_type: { [Op.ne]: null }
      },
      group: ['working_type']
    });

    // Members by district from profile table
    const membersByDistrict = await Profile.findAll({
      attributes: [
        'district',
        [Profile.sequelize.fn('COUNT', Profile.sequelize.col('user_id')), 'count']
      ],
      where: { 
        district: { 
          [Op.and]: [
            { [Op.ne]: null },
            { [Op.ne]: '' }
          ]
        }
      },
      group: ['district'],
      order: [[Profile.sequelize.fn('COUNT', Profile.sequelize.col('user_id')), 'DESC']]
    });

    // Job statistics
    const jobsByType = await Job.findAll({
      attributes: [
        'job_type',
        [Job.sequelize.fn('COUNT', Job.sequelize.col('id')), 'count']
      ],
      where: { 
        status: 'accepted',
        job_type: { [Op.ne]: null }
      },
      group: ['job_type']
    });

    // Recent job postings (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentJobs = await Job.count({
      where: {
        status: 'accepted',
        created_at: {
          [Op.gte]: thirtyDaysAgo
        }
      }
    });

    // Recent member registrations (last 30 days)
    const recentMembers = await User.count({
      where: {
        role: 'member',
        created_at: {
          [Op.gte]: thirtyDaysAgo
        }
      }
    });

    res.json({
      totalMembers,
      totalJobs,
      recentJobs,
      recentMembers,
      membersByProfession: membersByProfession.map(item => ({
        profession: item.working_type,
        count: parseInt(item.dataValues.count)
      })),
      membersByDistrict: membersByDistrict.map(item => ({
        district: item.district,
        count: parseInt(item.dataValues.count)
      })),
      jobsByType: jobsByType.map(item => ({
        type: item.job_type,
        count: parseInt(item.dataValues.count)
      }))
    });
  } catch (err) {
    next(err);
  }
};

// Get member network statistics
exports.getNetworkStats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Get user's profile to find location-based connections
    const userProfile = await Profile.findOne({ where: { user_id: userId } });
    
    let locationConnections = 0;
    let professionConnections = 0;
    let skillConnections = 0;

    if (userProfile) {
      // Members from same district
      if (userProfile.district) {
        locationConnections = await Profile.count({
          where: {
            user_id: { [Op.ne]: userId },
            district: userProfile.district
          }
        });
      }
    }

    // Members with same profession
    const user = await User.findByPk(userId);
    if (user && user.working_type) {
      professionConnections = await User.count({
        where: {
          id: { [Op.ne]: userId },
          role: 'member',
          working_type: user.working_type
        }
      });
    }

    // Members with similar skills
    const userSkills = await Skill.findAll({
      where: { user_id: userId },
      attributes: ['skill_name']
    });

    if (userSkills.length > 0) {
      const skillNames = userSkills.map(skill => skill.skill_name);
      const usersWithSimilarSkills = await Skill.findAll({
        where: {
          user_id: { [Op.ne]: userId },
          skill_name: { [Op.in]: skillNames }
        },
        attributes: ['user_id'],
        group: ['user_id']
      });
      skillConnections = usersWithSimilarSkills.length;
    }

    res.json({
      locationConnections,
      professionConnections,
      skillConnections,
      totalConnections: locationConnections + professionConnections + skillConnections
    });
  } catch (err) {
    next(err);
  }
}; 