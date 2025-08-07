const { Job, JobApplication } = require('../models');
const { NotFoundError, ValidationError } = require('../middlewares/errorHandler');

exports.listJobs = async (req, res, next) => {
  try {
    const jobs = await Job.findAll();
    res.json(jobs);
  } catch (err) { next(err); }
};

exports.getJob = async (req, res, next) => {
  try {
    const job = await Job.findByPk(req.params.id);
    if (!job) throw new NotFoundError('Job not found');
    res.json(job);
  } catch (err) { next(err); }
};

exports.createJob = async (req, res, next) => {
  try {
    const data = { ...req.body, posted_by: req.user.id };
    const job = await Job.create(data);
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