const { User, Profile, EducationDetail, EmploymentDetail, FamilyMember, sequelize } = require('../models');
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
    
    // Check subscription status for member profile access
    if (!req.user.is_subscribed) {
      return res.status(403).json({ 
        error: 'Subscription required',
        message: 'Please subscribe to view member profiles'
      });
    }
    
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
    // Check subscription status for member list access
    if (!req.user.is_subscribed) {
      return res.status(403).json({ 
        error: 'Subscription required',
        message: 'Please subscribe to view member listings'
      });
    }
    
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
    
    console.log('Filter parameters:', { district, caste, experience, education, company });
    console.log('User ID (excluded):', req.user.id);
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

    // Build include conditions with proper filtering
    const includes = [includeProfile];

    // Add education filter if specified
    if (education && education !== '') {
      // Use a subquery approach for education filtering
      const educationSubquery = `EXISTS (
        SELECT 1 FROM education_details 
        WHERE education_details.user_id = User.id 
        AND education_details.degree = '${education}'
      )`;
      
      where[Op.and] = where[Op.and] || [];
      where[Op.and].push(sequelize.literal(educationSubquery));
      
      includes.push({
        model: EducationDetail,
        as: 'educationDetails',
        attributes: ['degree', 'institution', 'year_of_passing', 'grade'],
        where: { degree: education }, // Add this to ensure we get the filtered degree
        limit: 1,
        order: [['id', 'DESC']],
        required: false
      });
      console.log('Education filter applied: degree =', education);
      console.log('Education subquery:', educationSubquery);
    } else {
      // Include education without filtering
      includes.push({
        model: EducationDetail,
        as: 'educationDetails',
        attributes: ['degree', 'institution', 'year_of_passing', 'grade'],
        limit: 1,
        order: [['id', 'DESC']],
        required: false
      });
      console.log('No education filter applied');
    }

    // Add employment filter if specified
    if (company && company !== '' || experience && experience !== '') {
      const employmentConditions = [];
      
      if (company && company !== '') {
        employmentConditions.push(`employment_details.company_name = '${company}'`);
        console.log('Company filter applied: company =', company);
      }
      
      if (experience && experience !== '') {
        const expValue = parseFloat(experience);
        if (!isNaN(expValue)) {
          employmentConditions.push(`employment_details.years_of_experience >= ${expValue}`);
          console.log('Experience filter applied: min years =', expValue);
        }
      }
      
      if (employmentConditions.length > 0) {
        const employmentSubquery = `EXISTS (
          SELECT 1 FROM employment_details 
          WHERE employment_details.user_id = User.id 
          AND (${employmentConditions.join(' AND ')})
        )`;
        
        where[Op.and] = where[Op.and] || [];
        where[Op.and].push(sequelize.literal(employmentSubquery));
      }
      
      includes.push({
        model: EmploymentDetail,
        as: 'employmentDetails',
        attributes: ['role', 'company_name', 'years_of_experience', 'currently_working'],
        limit: 1,
        order: [['id', 'DESC']],
        required: false
      });
    } else {
      // Include employment without filtering
      includes.push({
        model: EmploymentDetail,
        as: 'employmentDetails',
        attributes: ['role', 'company_name', 'years_of_experience', 'currently_working'],
        limit: 1,
        order: [['id', 'DESC']],
        required: false
      });
      console.log('No employment filter applied');
    }

    console.log('Query includes:', JSON.stringify(includes, null, 2));
    console.log('Final where clause:', JSON.stringify(where, null, 2));
    
    // Log the raw SQL query for debugging
    const queryOptions = {
      where,
      attributes: { exclude: ['password_hash'] },
      include: includes,
      limit: limitNum,
      offset: (pageNum - 1) * limitNum,
      order
    };
    
    console.log('Query options:', JSON.stringify(queryOptions, null, 2));
    
    const result = await User.findAndCountAll(queryOptions);
    
    const count = result.count;
    const users = result.rows;

    console.log(`Found ${count} total users, returning ${users.length} users`);
    
    // Debug: Check if the returned users actually have the filtered education
    if (education && education !== '' && users.length > 0) {
      console.log('Checking returned users for education filter:');
      users.forEach((user, index) => {
        const userEducation = user.educationDetails?.[0]?.degree;
        console.log(`  User ${index + 1}: ${user.full_name} - Education: "${userEducation}" (Expected: "${education}")`);
      });
    }
    
    console.log('Sample user data:', users.length > 0 ? {
      id: users[0].id,
      name: users[0].full_name,
      education: users[0].educationDetails?.[0]?.degree,
      company: users[0].employmentDetails?.[0]?.company_name,
      experience: users[0].employmentDetails?.[0]?.years_of_experience
    } : 'No users found');

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

    console.log('Transformed members data:');
    members.forEach((member, index) => {
      console.log(`  Member ${index + 1}: ${member.name} - Education: "${member.education}"`);
    });

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
    console.log('Fetching filter options...');
    
    // Get unique districts (excluding null/empty)
    const districts = await Profile.findAll({
      attributes: ['district'],
      where: {
        [Op.and]: [
          { district: { [Op.ne]: null } },
          { district: { [Op.ne]: '' } }
        ]
      },
      group: ['district'],
      order: [['district', 'ASC']]
    });

    // Get unique castes (excluding null/empty)
    const castes = await Profile.findAll({
      attributes: ['caste'],
      where: {
        [Op.and]: [
          { caste: { [Op.ne]: null } },
          { caste: { [Op.ne]: '' } }
        ]
      },
      group: ['caste'],
      order: [['caste', 'ASC']]
    });

    // Get unique education degrees (excluding null/empty)
    const educationDegrees = await EducationDetail.findAll({
      attributes: ['degree'],
      where: {
        [Op.and]: [
          { degree: { [Op.ne]: null } },
          { degree: { [Op.ne]: '' } }
        ]
      },
      group: ['degree'],
      order: [['degree', 'ASC']]
    });

    // Get unique companies (excluding null/empty)
    const companies = await EmploymentDetail.findAll({
      attributes: ['company_name'],
      where: {
        [Op.and]: [
          { company_name: { [Op.ne]: null } },
          { company_name: { [Op.ne]: '' } }
        ]
      },
      group: ['company_name'],
      order: [['company_name', 'ASC']]
    });

    const response = {
      districts: districts.map(d => d.district).filter(Boolean),
      castes: castes.map(c => c.caste).filter(Boolean),
      educationDegrees: educationDegrees.map(e => e.degree).filter(Boolean),
      companies: companies.map(c => c.company_name).filter(Boolean)
    };

    console.log('Filter options response:', response);
    res.json(response);
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