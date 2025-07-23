const buildProductQuery = (queryParams) => {
  const {
    search,
    category,
    minPrice,
    maxPrice,
    organic,
    certifications,
    farmerId,
    inSeason,
    sortBy,
    page = 1,
    limit = 12,
    distance,
    coordinates,
  } = queryParams;

  let query = {};
  
  // Text search
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search, 'i')] } },
    ];
  }

  // Category filter
  if (category) {
    query.category = category;
  }

  // Price range
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  // Organic filter
  if (organic !== undefined) {
    query.organic = organic === 'true';
  }

  // Certifications filter
  if (certifications) {
    query.certifications = { $in: certifications.split(',') };
  }

  // Farmer filter
  if (farmerId) {
    query.farmerId = farmerId;
  }

  // Seasonal availability
  if (inSeason === 'true') {
    const currentMonth = new Date().getMonth() + 1;
    query.$or = [
      {
        $and: [
          { 'seasonality.startMonth': { $lte: currentMonth } },
          { 'seasonality.endMonth': { $gte: currentMonth } },
        ],
      },
      {
        $and: [
          { 'seasonality.startMonth': { $gt: 'seasonality.endMonth' } },
          {
            $or: [
              { 'seasonality.startMonth': { $lte: currentMonth } },
              { 'seasonality.endMonth': { $gte: currentMonth } },
            ],
          },
        ],
      },
    ];
  }

  // Geospatial query
  if (coordinates && distance) {
    const [lng, lat] = coordinates.split(',').map(Number);
    query['origin.location'] = {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [lng, lat],
        },
        $maxDistance: Number(distance) * 1000, // Convert km to meters
      },
    };
  }

  // Status filter - only show active products by default
  if (!query.status) {
    query.status = 'active';
  }

  // Sorting
  let sort = {};
  if (sortBy) {
    switch (sortBy) {
      case 'price_asc':
        sort.price = 1;
        break;
      case 'price_desc':
        sort.price = -1;
        break;
      case 'rating':
        sort['ratings.average'] = -1;
        break;
      case 'newest':
        sort.createdAt = -1;
        break;
      default:
        sort.createdAt = -1;
    }
  } else {
    sort.createdAt = -1;
  }

  // Pagination
  const skip = (page - 1) * limit;

  return {
    query,
    sort,
    skip,
    limit: Number(limit),
  };
};

const calculateProductAnalytics = async (Product) => {
  const analytics = await Product.aggregate([
    {
      $group: {
        _id: null,
        totalProducts: { $sum: 1 },
        averagePrice: { $avg: '$price' },
        totalOrganicProducts: {
          $sum: { $cond: ['$organic', 1, 0] },
        },
        categoryCounts: {
          $push: '$category',
        },
      },
    },
    {
      $project: {
        _id: 0,
        totalProducts: 1,
        averagePrice: { $round: ['$averagePrice', 2] },
        totalOrganicProducts: 1,
        categoryDistribution: {
          $arrayToObject: {
            $map: {
              input: {
                $setUnion: '$categoryCounts',
              },
              as: 'category',
              in: {
                k: '$$category',
                v: {
                  $size: {
                    $filter: {
                      input: '$categoryCounts',
                      cond: { $eq: ['$$this', '$$category'] },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  ]);

  return analytics[0];
};

module.exports = {
  buildProductQuery,
  calculateProductAnalytics,
};
