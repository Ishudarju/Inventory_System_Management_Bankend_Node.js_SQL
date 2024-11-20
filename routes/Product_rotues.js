const express = require('express');
const router = express.Router();
const multer = require('multer');
const productController = require('../controller/Product_controller');
const { authMiddleware, adminOnly, adminOrStaff } = require("../middleware/auth_middleware");

const productImportController = require('../controller/Product_import_controller');
const productExportController = require('../controller/Product_export_controller');


// Routes for Product Operations
router.post('/inproduct', authMiddleware, adminOnly, productController.createProduct);  // Create product

router.get('/Allpro', authMiddleware, adminOrStaff, productController.getAllProducts);  // Get all products

router.get('/proByid/:id', authMiddleware, adminOrStaff, productController.getProductById);  // Get product by ID

router.put('/productput/:id', authMiddleware, adminOnly, productController.updateProduct);  // Update product

router.delete('/soft-delete/:id', authMiddleware, adminOnly, productController.softDeleteProduct);  // Soft delete product

router.delete('/permanent-delete/:id', authMiddleware, adminOnly, productController.permanentDeleteProduct);  // Permanent delete product

router.get('/list-soft-deleted', authMiddleware, adminOnly, productController.getSoftDeletedProducts);  // List soft deleted products

// Restore a soft-deleted product
router.put('/restore/:id', productController.restoreProduct);




// / Multer configuration for file uploads
const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter: (req, file, cb) => {
        if (
            file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
            file.mimetype === 'application/zip'
        ) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only .xlsx or .zip allowed.'));
        }
    },
}).single('file');

// import route path

router.post('/import', upload, async (req, res) => {
    const fileBuffer = req.file.buffer;
    const isZip = req.file.mimetype === 'application/zip';

    const result = await productImportController.importProductsToExcel(fileBuffer, isZip);
    if (result.success) {
        return res.status(200).json(result);
    } else {
        return res.status(400).json(result);
    }
});

// export route path

router.get('/export', productExportController.exportProductsToExcel);



module.exports = router;