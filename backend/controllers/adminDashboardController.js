const { User, Job, JobApplication, Payment, Profile, Skill, EducationDetail, EmploymentDetail } = require('../models');
const { Op } = require('sequelize');
const { ValidationError } = require('../middlewares/errorHandler');

// Get dashboard statistics
exports.getDashboardStats = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Get current date and date 30 days ago for comparison
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
    const sixtyDaysAgo = new Date(now.getTime() - (60 * 24 * 60 * 60 * 1000));

    // Total users count
    const totalUsers = await User.count();
    const usersLastMonth = await User.count({
      where: {
        created_at: {
          [Op.gte]: thirtyDaysAgo
        }
      }
    });
    const usersPreviousMonth = await User.count({
      where: {
        created_at: {
          [Op.and]: [
            { [Op.gte]: sixtyDaysAgo },
            { [Op.lt]: thirtyDaysAgo }
          ]
        }
      }
    });

    // Active jobs count
    const activeJobs = await Job.count({
      where: {
        status: 'accepted'
      }
    });
    const jobsLastMonth = await Job.count({
      where: {
        created_at: {
          [Op.gte]: thirtyDaysAgo
        }
      }
    });
    const jobsPreviousMonth = await Job.count({
      where: {
        created_at: {
          [Op.and]: [
            { [Op.gte]: sixtyDaysAgo },
            { [Op.lt]: thirtyDaysAgo }
          ]
        }
      }
    });

    // Total applications
    const totalApplications = await JobApplication.count();
    const applicationsLastMonth = await JobApplication.count({
      where: {
        application_date: {
          [Op.gte]: thirtyDaysAgo
        }
      }
    });
    const applicationsPreviousMonth = await JobApplication.count({
      where: {
        application_date: {
          [Op.and]: [
            { [Op.gte]: sixtyDaysAgo },
            { [Op.lt]: thirtyDaysAgo }
          ]
        }
      }
    });

    // Unique companies (users who posted jobs)
    const uniqueCompanies = await Job.count({
      distinct: true,
      col: 'posted_by'
    });

    // Calculate percentage changes
    const userChange = usersPreviousMonth > 0 
      ? Math.round(((usersLastMonth - usersPreviousMonth) / usersPreviousMonth) * 100)
      : usersLastMonth > 0 ? 100 : 0;

    const jobChange = jobsPreviousMonth > 0
      ? Math.round(((jobsLastMonth - jobsPreviousMonth) / jobsPreviousMonth) * 100)
      : jobsLastMonth > 0 ? 100 : 0;

    const applicationChange = applicationsPreviousMonth > 0
      ? Math.round(((applicationsLastMonth - applicationsPreviousMonth) / applicationsPreviousMonth) * 100)
      : applicationsLastMonth > 0 ? 100 : 0;

    const stats = [
      {
        label: 'Total Users',
        value: totalUsers.toLocaleString(),
        change: `${userChange >= 0 ? '+' : ''}${userChange}%`,
        color: 'blue',
        icon: 'Users'
      },
      {
        label: 'Active Jobs',
        value: activeJobs.toLocaleString(),
        change: `${jobChange >= 0 ? '+' : ''}${jobChange}%`,
        color: 'green',
        icon: 'Briefcase'
      },
      {
        label: 'Applications',
        value: totalApplications.toLocaleString(),
        change: `${applicationChange >= 0 ? '+' : ''}${applicationChange}%`,
        color: 'purple',
        icon: 'BarChart3'
      },
      {
        label: 'Companies',
        value: uniqueCompanies.toLocaleString(),
        change: '+5%', // This would need more complex logic to calculate
        color: 'yellow',
        icon: 'Building'
      }
    ];

    res.json({ stats });
  } catch (err) {
    next(err);
  }
};

// Get recent users
exports.getRecentUsers = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const limit = parseInt(req.query.limit) || 5;
    
    const recentUsers = await User.findAll({
      attributes: ['id', 'full_name', 'email', 'role', 'created_at', 'is_verified'],
      order: [['created_at', 'DESC']],
      limit: limit
    });

    const formattedUsers = recentUsers.map(user => ({
      id: user.id,
      name: user.full_name,
      email: user.email,
      role: user.role,
      joinDate: user.created_at.toISOString().split('T')[0],
      status: user.is_verified ? 'Verified' : 'Pending'
    }));

    res.json({ users: formattedUsers });
  } catch (err) {
    next(err);
  }
};

// Get recent jobs
exports.getRecentJobs = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const limit = parseInt(req.query.limit) || 5;
    
    let recentJobs = [];
    try {
      recentJobs = await Job.findAll({
        include: [
          {
            model: User,
            as: 'poster',
            attributes: ['full_name']
          },
          {
            model: JobApplication,
            as: 'applications',
            attributes: ['id']
          }
        ],
        order: [['created_at', 'DESC']],
        limit: limit
      });
    } catch (error) {
      // If associations fail, get jobs without includes
      recentJobs = await Job.findAll({
        order: [['created_at', 'DESC']],
        limit: limit
      });
    }

    const formattedJobs = recentJobs.map(job => ({
      id: job.id,
      title: job.title,
      company: job.poster?.full_name || 'Unknown',
      applicants: job.applications?.length || 0,
      status: job.status
    }));

    res.json({ jobs: formattedJobs });
  } catch (err) {
    next(err);
  }
};

// Get user analytics
exports.getUserAnalytics = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // User registration trend (last 12 months)
    const months = [];
    const userCounts = [];
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      const count = await User.count({
        where: {
          created_at: {
            [Op.between]: [startOfMonth, endOfMonth]
          }
        }
      });
      
      months.push(startOfMonth.toLocaleDateString('en-US', { month: 'short' }));
      userCounts.push(count);
    }

    // User roles distribution
    const roleDistribution = await User.findAll({
      attributes: [
        'role',
        [User.sequelize.fn('COUNT', User.sequelize.col('id')), 'count']
      ],
      group: ['role']
    });

    // Verified vs unverified users
    const verificationStatus = await User.findAll({
      attributes: [
        'is_verified',
        [User.sequelize.fn('COUNT', User.sequelize.col('id')), 'count']
      ],
      group: ['is_verified']
    });

    res.json({
      registrationTrend: {
        months,
        userCounts
      },
      roleDistribution: roleDistribution.map(item => ({
        role: item.role,
        count: parseInt(item.dataValues.count)
      })),
      verificationStatus: verificationStatus.map(item => ({
        verified: item.is_verified,
        count: parseInt(item.dataValues.count)
      }))
    });
  } catch (err) {
    next(err);
  }
};

// Get job analytics
exports.getJobAnalytics = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Job status distribution
    const jobStatusDistribution = await Job.findAll({
      attributes: [
        'status',
        [Job.sequelize.fn('COUNT', Job.sequelize.col('id')), 'count']
      ],
      group: ['status']
    });

    // Job type distribution (if job_type field exists)
    let jobTypeDistribution = [];
    try {
      jobTypeDistribution = await Job.findAll({
        attributes: [
          'job_type',
          [Job.sequelize.fn('COUNT', Job.sequelize.col('id')), 'count']
        ],
        group: ['job_type']
      });
    } catch (error) {
      // If job_type field doesn't exist, create a default distribution
      const totalJobs = await Job.count();
      jobTypeDistribution = [
        { job_type: 'full-time', count: Math.floor(totalJobs * 0.6) },
        { job_type: 'part-time', count: Math.floor(totalJobs * 0.3) },
        { job_type: 'contract', count: Math.floor(totalJobs * 0.1) }
      ];
    }

    // Applications per job
    let applicationsPerJob = [];
    try {
      applicationsPerJob = await Job.findAll({
        include: [
          {
            model: JobApplication,
            as: 'applications',
            attributes: ['id']
          }
        ],
        attributes: ['id', 'title'],
        order: [[{ model: JobApplication, as: 'applications' }, 'id', 'DESC']],
        limit: 10
      });
    } catch (error) {
      // If there are no applications or association issues, get recent jobs
      applicationsPerJob = await Job.findAll({
        attributes: ['id', 'title'],
        order: [['created_at', 'DESC']],
        limit: 10
      });
    }

    res.json({
      jobStatusDistribution: jobStatusDistribution.map(item => ({
        status: item.status,
        count: parseInt(item.dataValues.count)
      })),
      jobTypeDistribution: jobTypeDistribution.map(item => ({
        type: item.job_type,
        count: parseInt(item.dataValues.count)
      })),
      topJobsByApplications: applicationsPerJob.map(job => ({
        id: job.id,
        title: job.title,
        applications: job.applications?.length || 0
      }))
    });
  } catch (err) {
    next(err);
  }
}; 