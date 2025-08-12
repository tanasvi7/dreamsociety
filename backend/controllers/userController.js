const { User, Profile, EducationDetail, EmploymentDetail, FamilyMember } = require('../models');
const { NotFoundError, ValidationError } = require('../middlewares/errorHandler');
const { Op } = require('sequelize');

exports.getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (req.user.id !== Number(id) && !['admin', 'moderator'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const user = await User.findByPk(id, { 
      attributes: { exclude: ['password_hash'] },
      include: [
        {
          model: Profile,
          as: 'profile',
          attributes: ['photo_url', 'village', 'mandal', 'district', 'native_place', 'caste', 'subcaste', 'marital_status', 'dob', 'gender']
        },
        {
          model: EducationDetail,
          as: 'educationDetails',
          attributes: ['degree', 'institution', 'year_of_passing', 'grade'],
          order: [['id', 'DESC']]
        },
        {
          model: EmploymentDetail,
          as: 'employmentDetails',
          attributes: ['role', 'company_name', 'years_of_experience', 'currently_working'],
          order: [['id', 'DESC']]
        }
      ]
    });
    if (!user) throw new NotFoundError('User not found');
    res.json(user);
  } catch (err) { next(err); }
};

// New function for network member profiles - allows authenticated members to view other members
exports.getNetworkMemberProfile = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Ensure the requested user is a member (not admin/moderator)
    const user = await User.findByPk(id, { 
      attributes: { exclude: ['password_hash'] },
      include: [
        {
          model: Profile,
          as: 'profile',
          attributes: ['photo_url', 'village', 'mandal', 'district', 'native_place', 'caste', 'subcaste', 'marital_status', 'dob', 'gender']
        },
        {
          model: EducationDetail,
          as: 'educationDetails',
          attributes: ['degree', 'institution', 'year_of_passing', 'grade'],
          order: [['id', 'DESC']]
        },
        {
          model: EmploymentDetail,
          as: 'employmentDetails',
          attributes: ['role', 'company_name', 'years_of_experience', 'currently_working'],
          order: [['id', 'DESC']]
        },
        {
          model: FamilyMember,
          as: 'familyMembers',
          attributes: ['name', 'relation', 'education', 'profession'],
          order: [['id', 'ASC']]
        }
      ]
    });
    
    if (!user) {
      throw new NotFoundError('Member not found');
    }
    
    // Only allow viewing member profiles (not admin/moderator profiles)
    if (user.role !== 'member') {
      return res.status(403).json({ error: 'Can only view member profiles' });
    }
    
    res.json(user);
  } catch (err) { next(err); }
};

exports.updateUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (req.user.id !== Number(id) && !['admin', 'moderator'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const user = await User.findByPk(id);
    if (!user) throw new NotFoundError('User not found');
    const { full_name, email, phone, role } = req.body;
    if (email || phone) {
          // Check for unique email/phone
    const exists = await User.findOne({ where: { [Op.or]: [{ email }, { phone }], id: { [Op.ne]: id } } });
      if (exists) throw new ValidationError('Email or phone already in use');
    }
    if (full_name) user.full_name = full_name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (role && ['admin', 'moderator'].includes(req.user.role)) user.role = role;
    await user.save();
    res.json({ message: 'User updated' });
  } catch (err) { next(err); }
};

exports.getAllMembers = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search, 
      sortBy = 'recent',
      district,
      caste,
      experience,
      education,
      company
    } = req.query;
    const offset = (page - 1) * limit;
    
    // Validate and sanitize inputs
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
    const searchTerm = search ? search.trim() : '';
    
    // Check if any search criteria is provided
    const hasSearchCriteria = searchTerm || 
      (district && district !== '') || 
      (caste && caste !== '') || 
      (experience && experience !== '') || 
      (education && education !== '') || 
      (company && company !== '');
    
    // Always include profile for location display, but only require it for location filters
    const shouldIncludeProfile = hasSearchCriteria || true; // Always include for location display
    
    if (!hasSearchCriteria) {
      // Return empty results if no search criteria provided
      return res.json({
        members: [],
        pagination: {
          page: pageNum,
          total: 0,
          limit: limitNum,
          pages: 0
        },
        message: 'Please provide a search term or select filters to find members'
      });
    }
    
    // Build where clause for search - exclude current user
    const where = { 
      role: 'member',
      id: { [Op.ne]: req.user.id } // Exclude current user
    };
    
    if (searchTerm) {
      where[Op.or] = [
        { full_name: { [Op.like]: `%${searchTerm}%` } },
        { email: { [Op.like]: `%${searchTerm}%` } },
        { '$profile.village$': { [Op.like]: `%${searchTerm}%` } },
        { '$profile.mandal$': { [Op.like]: `%${searchTerm}%` } },
        { '$profile.district$': { [Op.like]: `%${searchTerm}%` } },
        { '$profile.native_place$': { [Op.like]: `%${searchTerm}%` } },
        { '$profile.caste$': { [Op.like]: `%${searchTerm}%` } },
        { '$profile.subcaste$': { [Op.like]: `%${searchTerm}%` } }
      ];
    }

    // Add additional filters
    if (district && district !== '') {
      where['$profile.district$'] = district;
    }
    
    if (caste && caste !== '') {
      where['$profile.caste$'] = caste;
    }

    // Note: We'll handle education, company, and experience filters in the include conditions
    // since they require the related tables to be joined

    // Build order clause
    let order = [];
    switch (sortBy) {
      case 'name':
        order = [['full_name', 'ASC']];
        break;
      case 'recent':
        order = [['created_at', 'DESC']];
        break;
      default:
        order = [['created_at', 'DESC']];
    }

    // Determine which includes should be required based on filters
    const includeProfile = {
      model: Profile,
      as: 'profile',
      attributes: ['photo_url', 'village', 'mandal', 'district', 'native_place', 'caste', 'subcaste'],
      required: (district && district !== '') || (caste && caste !== ''),
      // Always include profile for location display
      separate: false
    };

    const includeEducation = {
      model: EducationDetail,
      as: 'educationDetails',
      attributes: ['degree', 'institution', 'year_of_passing', 'grade'],
      limit: 1,
      order: [['id', 'DESC']],
      required: !!(education && education !== ''),
      where: (education && education !== '') ? { degree: education } : undefined
    };

    const includeEmployment = {
      model: EmploymentDetail,
      as: 'employmentDetails',
      attributes: ['role', 'company_name', 'years_of_experience', 'currently_working'],
      limit: 1,
      order: [['id', 'DESC']],
      required: !!(company && company !== '') || !!(experience && experience !== ''),
      where: ((company && company !== '') || (experience && experience !== '')) ? {
        ...((company && company !== '') && { company_name: company }),
        ...((experience && experience !== '') && { years_of_experience: { [Op.gte]: parseInt(experience) } })
      } : undefined
    };

    const result = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password_hash'] },
      include: [includeProfile, includeEducation, includeEmployment],
      limit: limitNum,
      offset: (pageNum - 1) * limitNum,
      order
    });
    
    const count = result.count;
    const users = result.rows;

    // Transform data for frontend
    const members = users.map(user => ({
      id: user.id,
      name: user.full_name,
      email: user.email,
      phone: user.phone,
      avatar: user.profile?.photo_url || '/placeholder.svg',
      location: user.profile?.district || user.profile?.mandal || user.profile?.village || 'Location not specified',
      title: user.employmentDetails?.[0]?.role || 'Professional',
      company: user.employmentDetails?.[0]?.company_name || '',
      education: user.educationDetails?.[0]?.degree || '',
      institution: user.educationDetails?.[0]?.institution || '',
      yearOfPassing: user.educationDetails?.[0]?.year_of_passing || '',
      grade: user.educationDetails?.[0]?.grade || '',
      yearsOfExperience: user.employmentDetails?.[0]?.years_of_experience || '',
      currentlyWorking: user.employmentDetails?.[0]?.currently_working || false,
      village: user.profile?.village || '',
      mandal: user.profile?.mandal || '',
      district: user.profile?.district || '',
      native_place: user.profile?.native_place || '',
      caste: user.profile?.caste || '',
      subcaste: user.profile?.subcaste || '',
      mutualConnections: Math.floor(Math.random() * 20) + 1, // Placeholder for now
      joinedDate: user.created_at
    }));

    res.json({
      members,
      pagination: {
        page: pageNum,
        total: count,
        limit: limitNum,
        pages: Math.ceil(count / limitNum)
      }
    });
  } catch (err) { 
    console.error('Error in getAllMembers:', err);
    next(err); 
  }
};

// Get filter options for network search
exports.getNetworkFilterOptions = async (req, res, next) => {
  try {
    // Get unique districts (excluding null/empty)
    const districts = await Profile.findAll({
      attributes: ['district'],
      where: {
        district: { [Op.ne]: null },
        district: { [Op.ne]: '' }
      },
      group: ['district'],
      order: [['district', 'ASC']]
    });

    // Get unique castes (excluding null/empty)
    const castes = await Profile.findAll({
      attributes: ['caste'],
      where: {
        caste: { [Op.ne]: null },
        caste: { [Op.ne]: '' }
      },
      group: ['caste'],
      order: [['caste', 'ASC']]
    });

    // Get unique education degrees (excluding null/empty)
    const educationDegrees = await EducationDetail.findAll({
      attributes: ['degree'],
      where: {
        degree: { [Op.ne]: null },
        degree: { [Op.ne]: '' }
      },
      group: ['degree'],
      order: [['degree', 'ASC']]
    });

    // Get unique companies (excluding null/empty)
    const companies = await EmploymentDetail.findAll({
      attributes: ['company_name'],
      where: {
        company_name: { [Op.ne]: null },
        company_name: { [Op.ne]: '' }
      },
      group: ['company_name'],
      order: [['company_name', 'ASC']]
    });

    res.json({
      districts: districts.map(d => d.district).filter(Boolean),
      castes: castes.map(c => c.caste).filter(Boolean),
      educationDegrees: educationDegrees.map(e => e.degree).filter(Boolean),
      companies: companies.map(c => c.company_name).filter(Boolean)
    });
  } catch (err) {
    console.error('Error in getNetworkFilterOptions:', err);
    next(err);
  }
}; 

exports.getSubscriptionStatus = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'is_subscribed']
    });
    
    if (!user) {
      throw new NotFoundError('User not found');
    }
    
    res.json({ 
      is_subscribed: user.is_subscribed,
      user_id: user.id
    });
  } catch (err) { next(err); }
}; 