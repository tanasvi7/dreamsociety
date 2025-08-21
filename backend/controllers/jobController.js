const { Job, JobApplication } = require('../models');
const { NotFoundError, ValidationError } = require('../middlewares/errorHandler');
const notificationController = require('./notificationController');

exports.listJobs = async (req, res, next) => {
  try {
    const jobs = await Job.findAll();
    
    // If user is logged in, check which jobs they've applied to
    if (req.user && req.user.role === 'member') {
      const jobIds = jobs.map(job => job.id);
      const applications = await JobApplication.findAll({
        where: { 
          job_id: jobIds,
          user_id: req.user.id 
        },
        attributes: ['job_id']
      });
      
      const appliedJobIds = applications.map(app => app.job_id);
      
      const jobsWithApplicationStatus = jobs.map(job => ({
        ...job.toJSON(),
        hasApplied: appliedJobIds.includes(job.id)
      }));
      
      res.json(jobsWithApplicationStatus);
    } else {
      res.json(jobs);
    }
  } catch (err) { next(err); }
};

exports.getJob = async (req, res, next) => {
  try {
    const job = await Job.findByPk(req.params.id);
    if (!job) throw new NotFoundError('Job not found');
    
    // Check if user is authenticated and subscribed
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'Please login to view job details'
      });
    }
    
    // Check subscription status for job details
    if (!req.user.is_subscribed) {
      return res.status(403).json({ 
        error: 'Subscription required',
        message: 'Please subscribe to view full job details'
      });
    }
    
    // Check if the current user has applied to this job
    let hasApplied = false;
    if (req.user && req.user.role === 'member') {
      const application = await JobApplication.findOne({
        where: { job_id: job.id, user_id: req.user.id }
      });
      hasApplied = !!application;
    }
    
    res.json({ ...job.toJSON(), hasApplied });
  } catch (err) { next(err); }
};

exports.createJob = async (req, res, next) => {
  try {
    // Map frontend fields to backend fields
    const jobData = {
      ...req.body,
      posted_by: req.user.id,
      updated_at: new Date()
    };

    // Handle salary range mapping
    if (req.body.salary_min && req.body.salary_max) {
      jobData.salary_range = `${req.body.salary_min}-${req.body.salary_max}`;
    }

    const job = await Job.create(jobData);
    
    // Create notifications for all members about the new job posting
    try {
      await notificationController.createJobPostingNotification(
        job.id, 
        job.title, 
        req.user.id
      );
    } catch (notificationError) {
      console.error('Error creating job posting notifications:', notificationError);
      // Don't fail the job creation if notification fails
    }
    
    res.status(201).json(job);
  } catch (err) { next(err); }
};

exports.updateJob = async (req, res, next) => {
  try {
    const job = await Job.findByPk(req.params.id);
    if (!job) throw new NotFoundError('Job not found');
    if (job.posted_by !== req.user.id && !['admin', 'moderator'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    Object.assign(job, req.body);
    await job.save();
    res.json(job);
  } catch (err) { next(err); }
};

exports.deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findByPk(req.params.id);
    if (!job) throw new NotFoundError('Job not found');
    if (job.posted_by !== req.user.id && !['admin', 'moderator'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    await job.destroy();
    res.json({ message: 'Job deleted' });
  } catch (err) { next(err); }
};

exports.applyJob = async (req, res, next) => {
  try {
    if (req.user.role !== 'member') return res.status(403).json({ error: 'Only members can apply' });
    const job = await Job.findByPk(req.params.id);
    if (!job) throw new NotFoundError('Job not found');
    const exists = await JobApplication.findOne({ where: { job_id: job.id, user_id: req.user.id } });
    if (exists) throw new ValidationError('Already applied');
    const application = await JobApplication.create({ job_id: job.id, user_id: req.user.id });
    
    // Create notification for job poster
    try {
      await notificationController.createJobApplicationNotification(
        job.id,
        job.title,
        req.user.id,
        req.user.full_name
      );
    } catch (notificationError) {
      console.error('Error creating job application notification:', notificationError);
      // Don't fail the application if notification fails
    }
    
    res.status(201).json(application);
  } catch (err) { next(err); }
};

exports.acceptJob = async (req, res, next) => {
  try {
    const job = await Job.findByPk(req.params.id);
    if (!job) throw new NotFoundError('Job not found');
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admin can accept jobs' });
    }
    job.status = 'accepted';
    await job.save();
    res.json({ message: 'Job accepted', job });
  } catch (err) { next(err); }
};

exports.rejectJob = async (req, res, next) => {
  try {
    const job = await Job.findByPk(req.params.id);
    if (!job) throw new NotFoundError('Job not found');
    if (!['admin', 'moderator'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    job.status = 'rejected';
    await job.save();
    res.json({ message: 'Job rejected', job });
  } catch (err) { next(err); }
};

exports.getMyJobPosts = async (req, res, next) => {
  try {
    const jobs = await Job.findAll({
      where: { posted_by: req.user.id },
      order: [['created_at', 'DESC']]
    });
    res.json(jobs);
  } catch (err) { next(err); }
};

exports.getJobApplications = async (req, res, next) => {
  try {
    const job = await Job.findByPk(req.params.id);
    if (!job) throw new NotFoundError('Job not found');
    
    // Check if user is the job poster or admin
    if (job.posted_by !== req.user.id && !['admin', 'moderator'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const applications = await JobApplication.findAll({
      where: { job_id: req.params.id },
      include: [
        {
          model: require('../models').User,
          as: 'applicant',
          attributes: ['id', 'full_name', 'email', 'phone']
        }
      ],
      order: [['application_date', 'DESC']]
    });

    res.json(applications);
  } catch (err) { next(err); }
};

exports.updateApplicationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const application = await JobApplication.findByPk(req.params.applicationId);
    
    if (!application) throw new NotFoundError('Application not found');
    
    const job = await Job.findByPk(application.job_id);
    if (!job) throw new NotFoundError('Job not found');
    
    // Check if user is the job poster or admin
    if (job.posted_by !== req.user.id && !['admin', 'moderator'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    application.status = status;
    await application.save();
    
    res.json(application);
  } catch (err) { next(err); }
}; 