const db = require("../config/Database");
const moment = require('moment-timezone');

// models/productModel.js
class Product {

//stock for fillter option in product page
    // static stockfetchAllpro(status = null, search = null, startDate = null, endDate = null, batchNo = null) {
    //     return new Promise((resolve, reject) => {
    //         let query = `
    //         SELECT 
    //             p.id,
    //             p.product_name,
    //             c.category_name AS product_category,
    //             p.product_quantity,
    //             p.product_price,
    //             p.product_description,
    //             p.generic_name,                
    //             p.product_batch_no,
    //             p.expiry_date,
    //             p.product_discount,
    //             p.supplier_price,
    //             s.company_name AS supplier,
    //             p.brand_name,
    //             p.selling_price,
    //             p.GST,
    //             p.stock_status,
    //             p.MFD,
    //             p.created_at,
    //             p.updated_at,
    //             p.deleted_at,
    //             p.is_deleted
    //         FROM 
    //             product_table p
    //         JOIN 
    //             product_category c ON p.product_category = c.id
    //         JOIN 
    //             supplier s ON p.supplier = s.supplier_id
    //         WHERE 
    //             p.is_deleted = 0
    //         `;

    //         const queryParams = [];

    //         // Apply status filter if provided
    //         if (status) {
    //             query += ` AND p.stock_status = ? `;
    //             queryParams.push(status);
    //         }

    //         // Apply search filter if provided (for name, category, expiry date, supplier, and batch number)
    //         if (search) {
    //             query += ` AND (
    //                 p.product_name LIKE ? 
    //                 OR c.category_name LIKE ? 
    //                 OR p.expiry_date LIKE ? 
    //                 OR s.company_name LIKE ?
    //                 OR p.product_batch_no LIKE ?
    //             )`;
    //             const searchPattern = `%${search}%`;
    //             queryParams.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern);
    //         }

    //         // Apply expiry date range filter if provided
    //         if (startDate && endDate) {
    //             query += ` AND p.expiry_date BETWEEN ? AND ? `;
    //             queryParams.push(startDate, endDate);
    //         }

    //         // Apply batch number filter if provided
    //         if (batchNo) {
    //             query += ` AND p.product_batch_no = ? `;
    //             queryParams.push(batchNo);
    //         }

    //         query += ` ORDER BY p.expiry_date ASC`;

    //         db.query(query, queryParams, (err, result) => {
    //             if (err) {
    //                 console.error('Database error:', err);
    //                 return reject(new Error('Error fetching products from the database'));
    //             }

    //             if (!result || result.length === 0) {
    //                 return resolve([]);
    //             }

    //             // Format dates to IST (Asia/Kolkata) with correct time format
    //             const formattedProducts = result.map(product => ({
    //                 ...product,
    //                 expiry_date: product.expiry_date
    //                     ? moment(product.expiry_date).tz('Asia/Kolkata').format('YYYY-MM-DD ')
    //                     : null,
    //                 MFD: product.MFD
    //                     ? moment(product.MFD).tz('Asia/Kolkata').format('YYYY-MM-DD ')
    //                     : null,
    //                 created_at: product.created_at
    //                     ? moment(product.created_at).tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss')
    //                     : null,
    //                 updated_at: product.updated_at
    //                     ? moment(product.updated_at).tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss')
    //                     : null
    //             }));

    //             resolve(formattedProducts);
    //         });
    //     });
    // }


    static stockfetchAllpro(status = null, search = null, startDate = null, endDate = null, batchNo = null) {
        return new Promise((resolve, reject) => {
            let query = `
            SELECT 
                p.id,
                p.product_name,
                c.category_name AS product_category,
                p.product_quantity,
                p.product_price,
                p.product_description,
                p.generic_name,                
                p.product_batch_no,
                p.expiry_date,
                p.product_discount,
                p.supplier_price,
                s.company_name AS supplier,
                p.brand_name,
                p.selling_price,
                p.GST,
                p.stock_status,
                p.MFD,
                p.created_at,
                p.updated_at,
                p.deleted_at,
                p.is_deleted
            FROM 
                product_table p
            JOIN 
                product_category c ON p.product_category = c.id
            JOIN 
                supplier s ON p.supplier = s.supplier_id
            WHERE 
                p.is_deleted = 0
            `;

            const queryParams = [];

            if (status) {
                query += ` AND p.stock_status = ? `;
                queryParams.push(status);
            }

            if (search) {
                query += ` AND (
                    p.product_name LIKE ? 
                    OR c.category_name LIKE ? 
                    OR p.expiry_date LIKE ? 
                    OR s.company_name LIKE ?
                    OR p.product_batch_no LIKE ?
                )`;
                const searchPattern = `%${search}%`;
                queryParams.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern);
            }

            // if (startDate && endDate) {
            //     query += ` AND p.expiry_date BETWEEN ? AND ? `;
            //     queryParams.push(startDate, endDate);
            // }

            if (startDate && endDate) {
                query += ` AND p.created_at BETWEEN ? AND ? `;
                queryParams.push(startDate, endDate);
            }

            if (batchNo) {
                query += ` AND p.product_batch_no = ? `;
                queryParams.push(batchNo);
            }

            query += ` ORDER BY p.expiry_date ASC`;

            db.query(query, queryParams, (err, result) => {
                if (err) {
                    console.error('Database error:', err);
                    return reject(new Error('Error fetching products from the database'));
                }

                if (!result || result.length === 0) {
                    return resolve([]);
                }

                const formattedProducts = result.map(product => ({
                    ...product,
                    expiry_date: product.expiry_date ? moment(product.expiry_date).tz('Asia/Kolkata').format('YYYY-MM-DD') : null,
                    MFD: product.MFD ? moment(product.MFD).tz('Asia/Kolkata').format('YYYY-MM-DD') : null,
                    created_at: product.created_at ? moment(product.created_at).tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss') : null,
                    updated_at: product.updated_at ? moment(product.updated_at).tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss') : null
                }));

                resolve(formattedProducts);
            });
        });
    }




static fetchCategoriesWithProductsBySupplier(supplierId) {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT 
                c.id AS category_id,
                c.category_name,
                p.id AS product_id,
                p.product_name,
                p.product_quantity,
                p.product_price,
                p.product_description,
                p.generic_name,                
                p.product_batch_no,
                p.expiry_date,
                p.product_discount,
                p.supplier_price,
                p.brand_name,
                p.selling_price,
                p.GST,
                p.stock_status,                
                p.created_at
            FROM 
                product_category c
            INNER JOIN 
                product_table p ON p.product_category = c.id
            WHERE 
                p.supplier = ? AND p.is_deleted = 0
            ORDER BY c.category_name;`;

        db.query(query, [supplierId], (err, result) => {
            if (err) {
                console.error('Database error:', err);
                return reject(new Error('Error fetching categories and products'));
            }

            const categoryMap = {};

            result.forEach(row => {
                if (!categoryMap[row.category_id]) {
                    categoryMap[row.category_id] = {
                        category: row.category_name,
                        products: []
                    };
                }

                categoryMap[row.category_id].products.push({
                    id: row.product_id,
                    name: row.product_name,
                    MRP: row.product_price, 
                    quantiy:row.product_quantity,                   
                    description: row.product_description,
                    generic_name: row.generic_name,
                    batch_no: row.product_batch_no,
                    expiry_date: row.expiry_date,
                    discount: row.product_discount,
                    supplier_price: row.supplier_price,                    
                    brand_name: row.brand_name,
                    selling_price: row.selling_price,
                    GST: row.GST,
                    stock_status: row.stock_status,                   
                    created_at: row.created_at
                });
            });

            resolve(Object.values(categoryMap));
        });
    });
}



static fetchProductCount() {
    return new Promise((resolve, reject) => {
        const query = `SELECT COUNT(*) AS total_products FROM product_table WHERE is_deleted = 0;`;

        db.query(query, (err, result) => {
            if (err) {
                console.error('Database error:', err);
                return reject(new Error('Error fetching product count from the database'));
            }
            resolve(result[0].total_products);
        });
    });
}

static getProductCount(req, res) {
    Product.fetchProductCount()
        .then(total => {
            res.status(200).json({
                message: 'Total product count fetched successfully',
                total_products: total
            });
        })
        .catch(err => {
            console.error('Error fetching product count:', err);
            res.status(500).json({
                message: 'Error fetching product count',
                error: err.message
            });
        });
}

    

    
    static fetchAllpro() {
        return new Promise((resolve, reject) => {
            const query = `
            SELECT 
                p.id,
                p.product_name,
                c.category_name AS product_category,
                p.product_quantity,
                p.product_price,
                p.product_description,
                p.generic_name,                
                p.product_batch_no,
                p.expiry_date, 
                p.product_discount,
                p.supplier_price,
                s.company_name AS supplier,
                p.brand_name,
                p.selling_price,
                p.GST,
                p.stock_status,
                p.MFD, 
                p.created_at,
                p.updated_at,
                p.deleted_at,
                p.is_deleted
            FROM 
                product_table p
            JOIN 
                product_category c ON p.product_category = c.id
            JOIN 
                supplier s ON p.supplier = s.supplier_id
            WHERE 
                p.is_deleted = 0
            ORDER BY 
                p.expiry_date ASC;`; // Order by expiry_date ascending (soonest expiry first)

            db.query(query, (err, result) => {
                if (err) {
                    console.error('Database error:', err);
                    return reject(new Error('Error fetching products from the database'));
                }

                if (!result || result.length === 0) {
                    return resolve([]); // Return an empty array if no products found
                }

                // Update stock_status based on product_quantity & format dates correctly
                const updatedProducts = result.map(product => {
                    let stockStatus = 'Available';
                    if (product.product_quantity === 0) {
                        stockStatus = 'Out of Stock';
                    } else if (product.product_quantity < 20) {
                        stockStatus = 'Low Stock';
                    }

                    return { 
                        ...product, 
                        stock_status: stockStatus,
                        expiry_date: moment(product.expiry_date).tz('Asia/Kolkata').format('YYYY-MM-DD'),
                        MFD: moment(product.MFD).tz('Asia/Kolkata').format('YYYY-MM-DD'),
                        created_at: moment(product.created_at).tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss'),
                        updated_at: moment(product.updated_at).tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss')
                    };
                });

                resolve(updatedProducts);
            });
        });
    }

    static fetchAll(page = 1, limit = 10) {
        return new Promise((resolve, reject) => {
            const offset = (page - 1) * limit; // Calculate offset for pagination
    
            // Query to fetch paginated products sorted by expiry_date
            const query = `
            SELECT 
                p.id, p.product_name, c.category_name AS product_category, p.product_quantity, 
                p.product_price, p.product_description, p.generic_name, 
                p.product_batch_no, p.expiry_date,  p.product_discount, p.supplier_price, 
                s.company_name AS supplier, p.brand_name, p.selling_price, p.GST, 
                p.stock_status, p.MFD,  p.created_at, p.updated_at, p.deleted_at, p.is_deleted
            FROM 
                product_table p
            JOIN 
                product_category c ON p.product_category = c.id
            JOIN 
                supplier s ON p.supplier = s.supplier_id
            WHERE 
                p.is_deleted = 0
            ORDER BY 
                p.expiry_date ASC  -- Sorting products by expiry date (soonest first)
            LIMIT ? OFFSET ?`; // Limit and Offset for Pagination
    
            // Query to get total product count
            const countQuery = `SELECT COUNT(*) AS total_products FROM product_table WHERE is_deleted = 0`;
    
            db.query(countQuery, [], (countErr, countResult) => {
                if (countErr) {
                    console.error('Database error (count):', countErr);
                    return reject(new Error('Error fetching total product count'));
                }
    
                const totalProducts = countResult[0].total_products; // Extract total count
    
                db.query(query, [limit, offset], (err, result) => {
                    if (err) {
                        console.error('Database error (products):', err);
                        return reject(new Error('Error fetching products from the database'));
                    }
    
                    if (!result || result.length === 0) {
                        return resolve({ products: [], totalProducts });
                    }
    
                    // Update stock_status based on product_quantity
                    const updatedProducts = result.map(product => {
                        let stockStatus = 'Available';
                        if (product.product_quantity === 0) {
                            stockStatus = 'Out of Stock';
                        } else if (product.product_quantity < 20) {
                            stockStatus = 'Low Stock';
                        }
                        return  { 
                            ...product, 
                            stock_status: stockStatus,
                            expiry_date: moment(product.expiry_date).tz('Asia/Kolkata').format('YYYY-MM-DD'),
                            MFD: moment(product.MFD).tz('Asia/Kolkata').format('YYYY-MM-DD'),
                            created_at: moment(product.created_at).tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss'),
                            updated_at: moment(product.updated_at).tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss')
                        };
                    });
    
                    resolve({ products: updatedProducts, totalProducts }); // Return updated product data and count
                });
            });
        });
    }
    
    
    





    static findById(id) {
        console.log('Product ID:', id);
        return new Promise((resolve, reject) => {
            const query = `
                SELECT 
                    p.id,
                    p.product_name,
                    c.category_name AS product_category, -- Fetch category name
                    p.product_quantity,
                    p.product_price,
                    p.product_description,
                    p.generic_name,                   
                    p.product_batch_no,
                    DATE_FORMAT(p.expiry_date, '%Y-%m-%d') AS expiry_date, 
                    p.product_discount,
                    p.supplier_price,
                    s.company_name AS supplier_name, -- Fetch supplier's company name
                    p.brand_name,
                    p.selling_price,
                    p.GST,
                    p.stock_status,
                    DATE_FORMAT(p.MFD, '%Y-%m-%d') AS MFD, -- Format MFD
                    p.created_at,
                    p.updated_at,
                    p.deleted_at,
                    p.is_deleted
                FROM 
                    product_table p
                JOIN 
                    product_category c ON p.product_category = c.id -- Join with product_category table
                JOIN 
                    supplier s ON p.supplier = s.supplier_id -- Join with supplier table
                WHERE 
                    p.id = ? AND p.is_deleted = 0; -- Filter by product ID and exclude soft-deleted products
            `;
            db.query(query, [id], (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results[0]); // Return the first result (single product)
                }
            });
        });
    }




static determineStockStatus(quantity) {
    if (quantity === 0) return 'Out of Stock';
    if (quantity <= 20) return 'Low Stock';
    return 'Available';
}


    static findByAttributes(product_name, product_batch_no, expiry_date, supplier_price,selling_price) {
        const query = `
            SELECT * FROM product_table 
            WHERE LOWER(product_name) = LOWER(?) 
              AND LOWER(product_batch_no) = LOWER(?) 
              AND DATE(expiry_date) = DATE(?) 
              AND supplier_price = ?
              AND selling_price = ?
              AND is_deleted = 0
        `;
        return new Promise((resolve, reject) => {
            db.query(query, [
                product_name.trim(),  // Ensure it's a string and trimmed
                product_batch_no.trim(),  // Ensure it's a string and trimmed
                expiry_date,  // Date field, assumed to be valid
                supplier_price, 
                selling_price // Numeric field
            ], (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
    }
    

    static findByAttributesWithoutBatch(product_name, expiry_date, supplier_price, selling_price) {
        const query = `
            SELECT * FROM product_table 
            WHERE LOWER(product_name) = LOWER(?) 
              AND DATE(expiry_date) = DATE(?) 
              AND supplier_price = ?
              AND selling_price = ?
              AND is_deleted = 0
        `;
        return new Promise((resolve, reject) => {
            db.query(query, [
                product_name.trim(),
                expiry_date,
                supplier_price,
                selling_price
            ], (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
    }
    




    static updateQuantity(product_id, new_quantity, stock_status) {

        return new Promise((resolve, reject) => {
            const query = `
                            UPDATE product_table 
                            SET product_quantity = ?, stock_status = ?, updated_at = NOW()
                            WHERE id = ?
                        `;
            db.query(query, [new_quantity, stock_status, product_id], (err, result) => {
                if (err) return reject(err);
                resolve(result);
                console.log('Updated product quantity:', result);
            });
        });
    }



//my correct code   
    static create(productData) {
        return new Promise((resolve, reject) => {
            const query = `
                            INSERT INTO product_table 
                            (product_name, product_category, product_quantity, product_price, product_description,
                            generic_name, product_batch_no, MFD,expiry_date, product_discount, supplier_price, supplier,
                            brand_name, selling_price, GST, stock_status, created_at, updated_at, deleted_at, is_deleted)
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), NULL, 0)
                        `;
            db.query(query, [
                productData.product_name,
                productData.product_category,
                productData.product_quantity,
                productData.product_price,
                productData.product_description,
                productData.generic_name,
                productData.product_batch_no,
                productData.MFD,
                productData.expiry_date,
                productData.product_discount,
                productData.supplier_price,
                productData.supplier,
                productData.brand_name,
                productData.selling_price,
                productData.GST,
                productData.stock_status,
                // productData.hsn_code 
            ], (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });
    }




    static async bulkCreate(productData) {
        try {
            const query = `
            INSERT INTO product_table (
                product_name, product_category, product_quantity, product_price,product_description,
                generic_name, product_batch_no, expiry_date, product_discount, supplier_price, supplier,
                brand_name, selling_price, GST, stock_status,MFD
            ) VALUES ?
        `;


            const [result] = await db.promise().query(query, [productData]);
            // console.log(productsData);
            return result;
        } catch (err) {
            throw err;
        }
    }



    static update(id, updatedData) {
        return new Promise((resolve, reject) => {
            // Ensure updatedData values are not undefined or null
            const productPrice = updatedData.product_price || null; // Use null as fallback
            const supplierPrice = updatedData.supplier_price || null;
            const productDiscount = updatedData.product_discount || null;

            const query = `
                UPDATE product_table 
                SET 
                    product_name = ?, 
                    product_category = ?, 
                    product_quantity = ?, 
                    product_price = CASE 
                        WHEN ? IS NULL THEN product_price 
                        ELSE ? 
                    END, 
                    product_description = ?, 
                    generic_name = ?, 
                    product_batch_no = ?, 
                    expiry_date = ?, 
                    product_discount = CASE 
                        WHEN ? IS NULL THEN product_discount 
                        ELSE ? 
                    END, 
                    supplier_price = CASE 
                        WHEN ? IS NULL THEN supplier_price 
                        ELSE ? 
                    END,
                    supplier = ?, 
                    brand_name = ?, 
                    selling_price = ?, 
                    GST = ?, 
                    stock_status = CASE 
                        WHEN ? = 0 THEN 'Out of Stock'
                        WHEN ? < 20 THEN 'Low Stock'
                        ELSE 'Available'
                    END,
                    updated_at = NOW()
                WHERE id = ? AND is_deleted = 0`;

            db.query(query, [
                updatedData.product_name,
                updatedData.product_category,
                updatedData.product_quantity,
                productPrice, productPrice, // Handle product_price
                updatedData.product_description,
                updatedData.generic_name,
                updatedData.product_batch_no,
                updatedData.expiry_date,
                productDiscount, productDiscount, // Handle product_discount
                supplierPrice, supplierPrice, // Handle supplier_price
                updatedData.supplier,
                updatedData.brand_name,
                updatedData.selling_price,
                updatedData.GST,
                updatedData.product_quantity,
                updatedData.product_quantity,
                id
            ], (err, result) => {
                if (err) {
                    console.error('Error in query:', err);
                    return reject(err);
                }
                resolve(result);

                // Log for debugging
                console.log('Updated Data:', {
                    productPrice,
                    supplierPrice,
                    productDiscount,
                });
            });
        });
    }



    // static getSoftDeletedProducts() {
    //     return new Promise((resolve, reject) => {
    //         const query = `
    //             SELECT 
    //                 p.*, 
    //                 c.category_name AS product_category, -- Fetch product category name
    //                 s.company_name AS supplier_name -- Fetch supplier's company name
    //             FROM 
    //                 product_table p
    //             JOIN 
    //                 product_category c ON p.product_category = c.id -- Join with product_category table
    //             JOIN 
    //                 supplier s ON p.supplier = s.supplier_id -- Join with supplier table
    //             WHERE 
    //                 p.is_deleted = 1
    //         `;
            
    //         db.query(query, (err, results) => {
    //             if (err) {
    //                 return reject(err);
    //             }
    //             resolve(results);
    //         });
    //     });
    // }
    

    static softDeleteProduct(id) {
        return new Promise((resolve, reject) => {
            const query = 'UPDATE product_table SET is_deleted = 1, deleted_at = NOW() WHERE id = ?';
            db.query(query, [id], (err, results) => {
                if (err) {
                    console.error('Error during soft delete:', err);
                    return reject({ message: 'Error soft deleting the product', error: err });
                }
                resolve(results);
            });
        });
    }
// Find product by ID and check if it's soft-deleted
static async findSoftDeletedById(id) {
    try {
        const [rows] = await db.promise().query(
            'SELECT * FROM product_table WHERE id = ? AND is_deleted = 1',
            [id]
        );
        return rows.length > 0 ? rows[0] : null; // Return product if found, else null
    } catch (err) {
        console.error('Error finding product by ID:', err); // Log the error
        throw new Error('Error finding product by ID');
    }
}

// Permanently delete product
static async moveToPermanentDelete(id) {
    try {
        const [result] = await db.promise().query(
            'DELETE FROM product_table WHERE id = ? AND is_deleted = 1',
            [id]
        );
        return result; // Return result (affected rows count)
    } catch (err) {
        console.error('Error during permanent delete:', err); // Log the error
        throw new Error('Error during permanent delete');
    }
}

  
   
       // Fetch all soft-deleted products with category and supplier name (with pagination)
       static getSoftDeletedProducts(limit, offset) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT 
                    p.*, 
                    c.category_name AS product_category, 
                    s.company_name AS supplier_name
                FROM 
                    product_table p
                JOIN 
                    product_category c ON p.product_category = c.id 
                JOIN 
                    supplier s ON p.supplier = s.supplier_id 
                WHERE 
                    p.is_deleted = 1
                LIMIT ? OFFSET ?;
            `;

            db.query(query, [limit, offset], (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });
    }

    // Get total count of soft-deleted products
    static getSoftDeletedProductsCount() {
        return new Promise((resolve, reject) => {
            const query = `SELECT COUNT(*) AS total FROM product_table WHERE is_deleted = 1`;

            db.query(query, (err, results) => {
                if (err) return reject(err);
                resolve(results[0].total);
            });
        });
    }


    // Restore a soft-deleted product
    static restore(productId) {
        return new Promise((resolve, reject) => {
            const query = `
                UPDATE product_table 
                SET is_deleted = 0, deleted_at = NULL 
                WHERE id = ? AND is_deleted = 1
            `;
            db.query(query, [productId], (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });
    }



    static fetchFilteredProducts(searchTerm) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT 
                    p.id,
                    p.product_name,
                    c.category_name AS product_category,
                    p.product_quantity,
                    p.product_price,
                    p.product_description,
                    p.generic_name,                
                    p.product_batch_no,
                    p.expiry_date,
                    p.product_discount,
                    p.supplier_price,
                    s.company_name AS supplier,
                    p.brand_name,
                    p.selling_price,
                    p.GST,
                    p.stock_status,
                    p.MFD,
                    p.created_at,
                    p.updated_at,
                    p.deleted_at,
                    p.is_deleted
                FROM 
                    product_table p
                JOIN 
                    product_category c ON p.product_category = c.id
                JOIN 
                    supplier s ON p.supplier = s.supplier_id
                WHERE 
                    p.is_deleted = 0
                    AND (
                        p.product_name LIKE ? 
                        OR c.category_name LIKE ? 
                        OR s.company_name LIKE ? 
                        OR p.generic_name LIKE ?
                    )
                ORDER BY 
                    p.expiry_date ASC;`;
    
            const searchPattern = `%${searchTerm}%`;
    
            db.query(query, [searchPattern, searchPattern, searchPattern, searchPattern], (err, result) => {
                if (err) {
                    console.error('Database error:', err);
                    return reject(new Error('Error fetching products from the database'));
                }
    
                if (!result || result.length === 0) {
                    return resolve([]); // Return an empty array if no products found
                }
    
                // Update stock_status based on product_quantity
                const updatedProducts = result.map(product => {
                    let stockStatus = 'Available';
                    if (product.product_quantity === 0) {
                        stockStatus = 'Out of Stock';
                    } else if (product.product_quantity < 20) {
                        stockStatus = 'Low Stock';
                    }
                    return { ...product, stock_status: stockStatus };
                });
    
                resolve(updatedProducts); // Return updated product data
            });
        });
    }
    
}

module.exports = Product;



















