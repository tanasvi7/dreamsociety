const { Notification, User, Job } = require('../models');
const { NotFoundError, ValidationError } = require('../middlewares/errorHandler');

// Get user notifications
exports.getUserNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const notifications = await Notification.findAll({
      where: { user_id: userId },
      order: [['created_at', 'DESC']],
      limit: limit,
      offset: offset
    });

    const totalCount = await Notification.count({
      where: { user_id: userId }
    });

    const unreadCount = await Notification.count({
      where: { 
        user_id: userId,
        is_read: false 
      }
    });

    res.json({
      notifications,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      },
      unreadCount
    });
  } catch (err) {
    next(err);
  }
};

// Mark notification as read
exports.markAsRead = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const notificationId = req.params.id;

    const notification = await Notification.findOne({
      where: { 
        id: notificationId,
        user_id: userId 
      }
    });

    if (!notification) {
      throw new NotFoundError('Notification not found');
    }

    notification.is_read = true;
    await notification.save();

    res.json({ message: 'Notification marked as read' });
  } catch (err) {
    next(err);
  }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user.id;

    await Notification.update(
      { is_read: true },
      { 
        where: { 
          user_id: userId,
          is_read: false 
        } 
      }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    next(err);
  }
};

// Delete notification
exports.deleteNotification = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const notificationId = req.params.id;

    const notification = await Notification.findOne({
      where: { 
        id: notificationId,
        user_id: userId 
      }
    });

    if (!notification) {
      throw new NotFoundError('Notification not found');
    }

    await notification.destroy();

    res.json({ message: 'Notification deleted' });
  } catch (err) {
    next(err);
  }
};

// Create notification (internal use)
exports.createNotification = async (userId, type, title, message, data = null) => {
  try {
    const notification = await Notification.create({
      user_id: userId,
      type,
      title,
      message,
      data
    });
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// Create job posting notification for all members
exports.createJobPostingNotification = async (jobId, jobTitle, postedBy) => {
  try {
    // Get all members (users with role 'member')
    const members = await User.findAll({
      where: { role: 'member' }
    });

    const notifications = [];
    for (const member of members) {
      // Don't notify the person who posted the job
      if (member.id !== postedBy) {
        const notification = await Notification.create({
          user_id: member.id,
          type: 'job_posting',
          title: 'New Job Opportunity',
          message: `A new job "${jobTitle}" has been posted. Check it out!`,
          data: { jobId, jobTitle, postedBy }
        });
        notifications.push(notification);
      }
    }

    return notifications;
  } catch (error) {
    console.error('Error creating job posting notifications:', error);
    throw error;
  }
};

// Create job application notification for job poster
exports.createJobApplicationNotification = async (jobId, jobTitle, applicantId, applicantName) => {
  try {
    // Get the job to find the poster
    const job = await Job.findByPk(jobId);
    if (!job) {
      throw new Error('Job not found');
    }

    // Create notification for the job poster
    const notification = await Notification.create({
      user_id: job.posted_by,
      type: 'job_application',
      title: 'New Job Application',
      message: `${applicantName} has applied for your job "${jobTitle}"`,
      data: { jobId, jobTitle, applicantId, applicantName }
    });

    return notification;
  } catch (error) {
    console.error('Error creating job application notification:', error);
    throw error;
  }
};

// Get notification count for navbar
exports.getNotificationCount = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const unreadCount = await Notification.count({
      where: { 
        user_id: userId,
        is_read: false 
      }
    });

    res.json({ unreadCount });
  } catch (err) {
    next(err);
  }
};
