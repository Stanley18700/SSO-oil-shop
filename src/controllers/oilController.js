// Oil operations controller
const prisma = require('../services/prisma');

/**
 * GET /oils - Retrieve all active oils (public endpoint)
 * Used by customers to view available oil products
 */
const getAllOils = async (req, res) => {
  try {
    const oils = await prisma.oil.findMany({
      where: {
        is_active: true // Only show active oils to customers
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    res.status(200).json({
      success: true,
      count: oils.length,
      data: oils
    });
  } catch (error) {
    console.error('Error fetching oils:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch oils'
    });
  }
};

/**
 * POST /oils - Create a new oil (admin only)
 * Adds a new oil product to the database
 */
const createOil = async (req, res) => {
  try {
    const {
      name_en,
      name_my,
      description_en,
      description_my,
      price_per_unit,
      image_url
    } = req.body;

    // Validate required fields
    if (!name_en || !name_my || !description_en || !description_my || !price_per_unit) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    // Validate price is positive
    if (parseFloat(price_per_unit) <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Price must be greater than zero'
      });
    }

    const newOil = await prisma.oil.create({
      data: {
        name_en,
        name_my,
        description_en,
        description_my,
        price_per_unit: parseFloat(price_per_unit),
        image_url: image_url || null
      }
    });

    res.status(201).json({
      success: true,
      message: 'Oil created successfully',
      data: newOil
    });
  } catch (error) {
    console.error('Error creating oil:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create oil'
    });
  }
};

/**
 * PUT /oils/:id - Update an existing oil (admin only)
 * Updates oil information by ID
 */
const updateOil = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name_en,
      name_my,
      description_en,
      description_my,
      price_per_unit,
      image_url,
      is_active
    } = req.body;

    // Check if oil exists
    const existingOil = await prisma.oil.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingOil) {
      return res.status(404).json({
        success: false,
        error: 'Oil not found'
      });
    }

    // Validate price if provided
    if (price_per_unit !== undefined && parseFloat(price_per_unit) <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Price must be greater than zero'
      });
    }

    // Build update data object (only update provided fields)
    const updateData = {};
    if (name_en !== undefined) updateData.name_en = name_en;
    if (name_my !== undefined) updateData.name_my = name_my;
    if (description_en !== undefined) updateData.description_en = description_en;
    if (description_my !== undefined) updateData.description_my = description_my;
    if (price_per_unit !== undefined) updateData.price_per_unit = parseFloat(price_per_unit);
    if (image_url !== undefined) updateData.image_url = image_url;
    if (is_active !== undefined) updateData.is_active = Boolean(is_active);

    const updatedOil = await prisma.oil.update({
      where: { id: parseInt(id) },
      data: updateData
    });

    res.status(200).json({
      success: true,
      message: 'Oil updated successfully',
      data: updatedOil
    });
  } catch (error) {
    console.error('Error updating oil:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update oil'
    });
  }
};

/**
 * DELETE /oils/:id - Soft delete an oil (admin only)
 * Sets is_active to false instead of actually deleting the record
 */
const deleteOil = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if oil exists
    const existingOil = await prisma.oil.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingOil) {
      return res.status(404).json({
        success: false,
        error: 'Oil not found'
      });
    }

    // Soft delete: set is_active to false
    const deletedOil = await prisma.oil.update({
      where: { id: parseInt(id) },
      data: { is_active: false }
    });

    res.status(200).json({
      success: true,
      message: 'Oil deleted successfully (soft delete)',
      data: deletedOil
    });
  } catch (error) {
    console.error('Error deleting oil:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete oil'
    });
  }
};

module.exports = {
  getAllOils,
  createOil,
  updateOil,
  deleteOil
};

