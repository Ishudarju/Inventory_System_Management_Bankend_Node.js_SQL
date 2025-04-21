
const Shop = require('../model/pharmachy_details_model');
const db=require('../config/Database');

// Create a shop multi shops
// const createShop = (req, res) => {
//     const shopData = req.body;

//     Shop.createShop(shopData)
//     .then(shopId => res.status(201).json({ message: 'Shop created successfully', shop_id: shopId }))
//     .catch(error => {
//         console.error('Error creating shop:', error);
//         res.status(500).json({ message: 'Internal server error' });
//     });
// };


//only one shops
const createShop = async (req, res) => {
    const {
        pharmacy_name,
        pharmacy_address,
        pincode,
        owner_GST_number,
        allow_registration,
        description
    } = req.body;

    // Validate inputs
    if (!pharmacy_name || !pharmacy_address || !pincode || !owner_GST_number || !allow_registration || !description) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    if (owner_GST_number.length !== 15) {
        return res.status(400).json({ message: 'GST number must be exactly 15 characters' });
    }

    try {
        const [rows] = await db.promise().query("SELECT * FROM shop_table");
        if (rows.length > 0) {
            return res.status(409).json({ message: "A shop already exists. Please delete it before creating a new one." });
        }

        const query = `
            INSERT INTO shop_table (
                pharmacy_name, pharmacy_address, pincode, 
                owner_GST_number, allow_registration, description
            ) VALUES (?, ?, ?, ?, ?, ?)`;

        const [result] = await db.promise().query(query, [
            pharmacy_name,
            pharmacy_address,
            pincode,
            owner_GST_number,
            allow_registration,
            description
        ]);

        res.status(201).json({ message: "Shop created successfully", shop_id: result.insertId });

    } catch (error) {
        console.error("Error creating shop:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get a shop by ID
const getShopById = (req, res) => {
    const { shopId } = req.params;

    Shop.getShopById(shopId)
    .then(shop => {
        if (!shop) return res.status(404).json({ message: 'Shop not found' });
        res.status(200).json({ shop });
    })
    .catch(error => {
        console.error('Error getting shop:', error);
        res.status(500).json({ message: 'Internal server error' });
    });
};

// Get all shops
const getAllShops = (req, res) => {
    Shop.getAllShops()
    .then(shops => res.status(200).json({ shops }))
    .catch(error => {
        console.error('Error fetching all shops:', error);
        res.status(500).json({ message: 'Internal server error' });
    });
};

// Update a shop
const updateShop = (req, res) => {
    const { shopId } = req.params;
    const shopData = req.body;

    Shop.updateShop(shopId, shopData)
    .then(updated => {
        if (!updated) return res.status(404).json({ message: 'Shop not found' });
        res.status(200).json({ message: 'Shop updated successfully' });
    })
    .catch(error => {
        console.error('Error updating shop:', error);
        res.status(500).json({ message: 'Internal server error' });
    });
};

// Delete a shop
const deleteShop = (req, res) => {
    const { shopId } = req.params;

    Shop.deleteShop(shopId)
    .then(deleted => {
        if (!deleted) return res.status(404).json({ message: 'Shop not found' });
        res.status(200).json({ message: 'Shop deleted successfully' });
    })
    .catch(error => {
        console.error('Error deleting shop:', error);
        res.status(500).json({ message: 'Internal server error' });
    });
};

module.exports = {
    createShop,
    getShopById,
    getAllShops,
    updateShop,
    deleteShop
};
