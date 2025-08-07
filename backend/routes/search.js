const express = require('express');
const router = express.Router();
const { Job, User, Profile, EmploymentDetail } = require('../models');
const { Op } = require('sequelize');

/**
 * Get popular search terms
 */
router.get('/popular', async (req, res) => {
  try {
    const popularSearches = [
      'Software Engineer',
      'Product Manager', 
      'Data Scientist',
      'UX Designer',
      'Full Stack Developer',
      'DevOps Engineer',
      'Project Manager',
      'Business Analyst',
      'Marketing Manager',
      'Sales Representative'
    ];
    
    res.json({ popular_searches: popularSearches });
  } catch (error) {
    console.error('Error fetching popular searches:', error);
    res.status(500).json({ error: 'Failed to fetch popular searches' });
  }
});

/**
 * Get search suggestions
 */
router.get('/suggestions', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) {
      return res.json({ suggestions: [] });
    }

    const suggestions = [];
    
    // Get job title suggestions
    try {
      const jobTitles = await Job.findAll({
        where: {
          title: {
            [Op.like]: `%${q}%`
          }
        },
        attributes: ['title'],
        limit: 5,
        group: ['title']
      });
      
      jobTitles.forEach(job => {
        if (!suggestions.includes(job.title)) {
          suggestions.push(job.title);
        }
      });
    } catch (jobError) {
      console.error('Error fetching job suggestions:', jobError);
    }

    // Get company name suggestions
    try {
      const companies = await EmploymentDetail.findAll({
        where: {
          company_name: {
            [Op.like]: `%${q}%`
          }
        },
        attributes: ['company_name'],
        limit: 5,
        group: ['company_name']
      });
      
      companies.forEach(company => {
        if (!suggestions.includes(company.company_name)) {
          suggestions.push(company.company_name);
        }
      });
    } catch (companyError) {
      console.error('Error fetching company suggestions:', companyError);
    }

    res.json({ suggestions: suggestions.slice(0, 10) });
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    res.status(500).json({ error: 'Failed to fetch suggestions' });
  }
});

/**
 * Search jobs
 */
router.get('/jobs', async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;
    
    if (!q || q.trim().length === 0) {
      return res.json([]);
    }

    console.log('Searching jobs with query:', q);

    const jobs = await Job.findAll({
      where: {
        [Op.or]: [
          { title: { [Op.like]: `%${q}%` } },
          { description: { [Op.like]: `%${q}%` } },
          { location: { [Op.like]: `%${q}%` } }
        ]
      },
      limit: parseInt(limit),
      order: [['created_at', 'DESC']]
    });

    console.log('Found jobs:', jobs.length);

    const results = jobs.map(job => ({
      type: 'job',
      id: job.id,
      title: job.title,
      company: '',
      location: job.location,
      description: job.description,
      url: `/jobs/${job.id}`
    }));

    res.json(results);
  } catch (error) {
    console.error('Error searching jobs:', error);
    res.status(500).json({ error: 'Failed to search jobs', details: error.message });
  }
});

/**
 * Search members
 */
router.get('/members', async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;
    
    if (!q || q.trim().length === 0) {
      return res.json([]);
    }

    console.log('Searching members with query:', q);

    const members = await User.findAll({
      include: [{
        model: Profile,
        as: 'profile',
        attributes: ['photo_url', 'village', 'district', 'native_place']
      }],
      where: {
        [Op.or]: [
          { email: { [Op.like]: `%${q}%` } },
          { full_name: { [Op.like]: `%${q}%` } },
          { '$profile.village$': { [Op.like]: `%${q}%` } },
          { '$profile.district$': { [Op.like]: `%${q}%` } },
          { '$profile.native_place$': { [Op.like]: `%${q}%` } }
        ]
      },
      limit: parseInt(limit),
      order: [['created_at', 'DESC']]
    });

    console.log('Found members:', members.length);

    const results = members.map(member => {
      let description = '';
      if (member.profile) {
        const parts = [];
        if (member.profile.village) parts.push(member.profile.village);
        if (member.profile.district) parts.push(member.profile.district);
        if (member.profile.native_place) parts.push(member.profile.native_place);
        description = parts.join(' ');
      }

      return {
        type: 'member',
        id: member.id,
        name: member.full_name,
        email: member.email,
        image: member.profile?.photo_url,
        description: description
      };
    });

    res.json(results);
  } catch (error) {
    console.error('Error searching members:', error);
    res.status(500).json({ error: 'Failed to search members', details: error.message });
  }
});

/**
 * Search companies
 */
router.get('/companies', async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;
    
    if (!q || q.trim().length === 0) {
      return res.json([]);
    }

    console.log('Searching companies with query:', q);

    const companies = await EmploymentDetail.findAll({
      where: {
        company_name: {
          [Op.like]: `%${q}%`
        }
      },
      attributes: ['company_name'],
      limit: parseInt(limit),
      group: ['company_name'],
      order: [['company_name', 'ASC']]
    });

    console.log('Found companies:', companies.length);

    const results = companies.map(company => ({
      type: 'company',
      id: company.id,
      name: company.company_name,
      description: `Company: ${company.company_name}`
    }));

    res.json(results);
  } catch (error) {
    console.error('Error searching companies:', error);
    res.status(500).json({ error: 'Failed to search companies', details: error.message });
  }
});

/**
 * Search resources (placeholder)
 */
router.get('/resources', async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;
    
    if (!q || q.trim().length === 0) {
      return res.json([]);
    }

    // For now, return empty array as resources are not implemented
    res.json([]);
  } catch (error) {
    console.error('Error searching resources:', error);
    res.status(500).json({ error: 'Failed to search resources' });
  }
});

/**
 * Global search across all content types
 */
router.get('/global', async (req, res) => {
  try {
    const { query, type = 'all', limit = 20 } = req.query;
    
    if (!query || query.trim().length === 0) {
      return res.json([]);
    }

    console.log('Global search with query:', query, 'type:', type);

    const results = [];
    const searchLimit = Math.floor(parseInt(limit) / 4);

    if (type === 'all' || type === 'job') {
      try {
        const jobs = await Job.findAll({
          where: {
            [Op.or]: [
              { title: { [Op.like]: `%${query}%` } },
              { description: { [Op.like]: `%${query}%` } },
              { location: { [Op.like]: `%${query}%` } }
            ]
          },
          limit: searchLimit,
          order: [['created_at', 'DESC']]
        });

        jobs.forEach(job => {
          results.push({
            type: 'job',
            id: job.id,
            title: job.title,
            company: '',
            location: job.location,
            description: job.description,
            url: `/jobs/${job.id}`
          });
        });
      } catch (jobError) {
        console.error('Error searching jobs in global search:', jobError);
      }
    }

    if (type === 'all' || type === 'member') {
      try {
        const members = await User.findAll({
          include: [{
            model: Profile,
            as: 'profile',
            attributes: ['photo_url', 'village', 'district', 'native_place']
          }],
          where: {
            [Op.or]: [
              { email: { [Op.like]: `%${query}%` } },
              { full_name: { [Op.like]: `%${query}%` } },
              { '$profile.village$': { [Op.like]: `%${query}%` } },
              { '$profile.district$': { [Op.like]: `%${query}%` } },
              { '$profile.native_place$': { [Op.like]: `%${query}%` } }
            ]
          },
          limit: searchLimit,
          order: [['created_at', 'DESC']]
        });

        members.forEach(member => {
          let description = '';
          if (member.profile) {
            const parts = [];
            if (member.profile.village) parts.push(member.profile.village);
            if (member.profile.district) parts.push(member.profile.district);
            if (member.profile.native_place) parts.push(member.profile.native_place);
            description = parts.join(' ');
          }

          results.push({
            type: 'member',
            id: member.id,
            name: member.full_name,
            email: member.email,
            image: member.profile?.photo_url,
            description: description
          });
        });
      } catch (memberError) {
        console.error('Error searching members in global search:', memberError);
      }
    }

    if (type === 'all' || type === 'company') {
      try {
        const companies = await EmploymentDetail.findAll({
          where: {
            company_name: {
              [Op.like]: `%${query}%`
            }
          },
          attributes: ['company_name'],
          limit: searchLimit,
          group: ['company_name'],
          order: [['company_name', 'ASC']]
        });

        companies.forEach(company => {
          results.push({
            type: 'company',
            id: company.id,
            name: company.company_name,
            description: `Company: ${company.company_name}`
          });
        });
      } catch (companyError) {
        console.error('Error searching companies in global search:', companyError);
      }
    }

    // Sort results by relevance (jobs first, then members, then companies)
    const sortedResults = results.sort((a, b) => {
      const typeOrder = { job: 0, member: 1, company: 2, resource: 3 };
      return typeOrder[a.type] - typeOrder[b.type];
    });

    console.log('Global search results:', sortedResults.length);

    res.json(sortedResults.slice(0, parseInt(limit)));
  } catch (error) {
    console.error('Error in global search:', error);
    res.status(500).json({ error: 'Failed to perform global search', details: error.message });
  }
});

module.exports = router;
