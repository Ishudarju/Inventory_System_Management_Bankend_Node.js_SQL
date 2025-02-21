const Invoice = require('../model/Invoice_model');


// Generate Invoice Number
exports.generateInvoiceNumber = async (req, res) => {
    try {
        const invoiceNumber = await Invoice.generateInvoiceNumber();
        res.status(200).json({ invoiceNumber });
    } catch (error) {
        console.error('Error generating invoice number:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// //insert invoice details


exports.createInvoice = async (req, res) => {
    try {
        const { customer_id, products, payment_status} = req.body;
        console.log('Products:', req.body);

        // Validate customer existence
        const customerExists = await Invoice.checkCustomerExists(customer_id);
        if (!customerExists) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        // Initialize totals and product details array
        let totalPrice = 0;
        let totalGST = 0;
        let totalDiscount = 0;
        const detailedProducts = []; // To store detailed product information

        // Validate products and calculate totals
        for (const item of products) {
            const productDetails = await Invoice.checkProductExists(item.product_id);
            console.log("Product Details:", productDetails);

            if (!productDetails) {
                return res.status(404).json({ message: `Product with ID ${item.product_id} not found` });
            }
            if (productDetails.product_quantity < item.quantity) {
                return res.status(400).json({
                    message: `Insufficient stock for product with ID ${item.product_id}`,
                });
            }

            // Calculate the price, GST, and discount for this product
            const unitPrice = parseFloat(productDetails.product_price);
            const subtotal = unitPrice * item.quantity;

            // Calculate GST and Discount for this product
            const gstAmount = parseFloat(((subtotal * productDetails.GST) / 100).toFixed(2));
            const discountAmount = parseFloat(((subtotal * productDetails.product_discount) / 100).toFixed(2));

            // Update totals
            totalPrice += subtotal;
            totalGST += gstAmount;
            totalDiscount += discountAmount;

            // Add to detailed products list
            detailedProducts.push({
                product_id: item.product_id,
                product_name: productDetails.product_name,
                unit_price: unitPrice.toFixed(2),
                quantity: item.quantity,
                subtotal: subtotal.toFixed(2),
                discount: discountAmount.toFixed(2),
                gst: gstAmount.toFixed(2),
                final_price: (subtotal + gstAmount - discountAmount).toFixed(2),
            });
        }

        // Calculate the final price for the invoice
        const finalPrice = parseFloat((totalPrice + totalGST - totalDiscount).toFixed(2));

        // Check for calculation errors
        if (isNaN(finalPrice) || isNaN(totalPrice) || isNaN(totalGST) || isNaN(totalDiscount)) {
            return res.status(400).json({ message: 'Error in calculating prices' });
        }

        // Generate an invoice number
        const invoiceNumber = await Invoice.generateInvoiceNumber();

        try {
            // Update stock for all products
            for (const item of products) {
                await Invoice.updateStock(item.product_id, item.quantity);
            }

            // Prepare invoice data for saving
            const invoiceData = {
                invoice_number: invoiceNumber,
                customer_id,
                product_id: products.map((p) => p.product_id),
                quantity: products.map((p) => p.quantity),
                discount: totalDiscount.toFixed(2),
                total_price: totalPrice.toFixed(2),
                final_price: finalPrice.toFixed(2),
                payment_status
            };

            // Create the invoice in the database
            const invoice = await Invoice.createInvoice(invoiceData);

            // Send the response with the invoice details
            res.status(201).json({
                message: 'Invoice created successfully',
                invoice_details: {
                    invoice_id: invoice.invoice_id,
                    invoice_number: invoice.invoice_number,
                    customer_id: invoice.customer_id,
                    payment_status: invoice.payment_status,
                 
                    products: detailedProducts,
                    summary: {
                        total_price: totalPrice.toFixed(2),
                        total_discount: totalDiscount.toFixed(2),
                        total_gst: totalGST.toFixed(2),
                        final_price: finalPrice.toFixed(2),
                    },
                },
            });
        } catch (error) {
            console.error('Error creating invoice:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    } catch (error) {
        console.error('Error creating invoice:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};







// get all invoices

//my correct code

// exports.getAllInvoices = async (req, res) => {
//     try {
//         // Call the model method to fetch invoices
//         const invoices = await Invoice.getAllInvoices();

//         // Send a successful response with the fetched data
//         res.status(200).json({
//             success: true,
//             message: 'Invoices fetched successfully',
//             data: invoices,
//         });
//     } catch (error) {
//         console.error('Error fetching invoices:', error);

//         // Send an error response if something goes wrong
//         res.status(500).json({
//             success: false,
//             message: 'Failed to fetch invoices',
//             error: error.message,
//         });
//     }
// };

exports.getAllInvoices = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1; // Default page 1
        const limit = parseInt(req.query.limit) || 10; // Default limit 10 invoices per page

        const { invoices, totalInvoices, totalPages } = await Invoice.getAllInvoices(page, limit);

        if (invoices.length === 0) {
            return res.status(404).json({ success: false, message: 'No invoices found' });
        }

        res.status(200).json({
            success: true,
            message: 'Invoices fetched successfully',
            total_invoice: totalInvoices,
            total_page: totalPages,
            page: page,
            limit: limit,
            data: invoices,
        });
    } catch (error) {
        console.error('Error fetching invoices:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch invoices',
            error: error.message,
        });
    }
};



//update the invoice
exports.updateInvoice = async (req, res) => {
    try {
        const invoiceId = req.params.id; // Get the invoice ID from the URL
        const { invoice_number, customer_id, products, payment_status } = req.body;

        // Check if customer exists before updating the invoice
        const customerExists = await Invoice.checkCustomerExists(customer_id);
        if (!customerExists) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        // Update invoice data
        const updatedInvoiceData = {
            invoice_number,
            customer_id,
            products,
            payment_status,
            invoice_updated_at : new Date(),
        };

        // Call the model method to update the invoice
        const updatedInvoice = await Invoice.updateInvoice(invoiceId, updatedInvoiceData);

        res.status(200).json({
            message: 'Invoice updated successfully',
            invoice: updatedInvoice,
        });
    } catch (error) {
        console.error('Error updating invoice:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};


//invoice number to use the details

// exports.getInvoiceDetails = async (req, res) => {
//     try {
//         const { invoice_number } = req.params;
//         console.log(req.params);

//         const results = await Invoice.getInvoiceDetails(invoice_number); // No need to destructure it
//         if (results.length === 0) {
//             return res.status(404).json({ message: "Invoice not found" });
//         }

//         res.status(200).json({ data: results[0] }); // Return the first result
//     } catch (error) {
//         console.error("Error fetching invoice:", error);
//         res.status(500).json({ message: "Server error", error: error.message });
//     }
// };




const PDFDocument = require('pdfkit');

exports.getInvoiceById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id || isNaN(Number(id))) {
            return res.status(400).json({ message: "Invalid invoice ID" });
        }

        const invoice = await Invoice.getInvoiceById(id);

        if (!invoice) {
            return res.status(404).json({ message: "Invoice not found" });
        }

        res.status(200).json({ data: invoice });
    } catch (error) {
        console.error("Error fetching invoice by ID:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};





exports.downloadInvoicePdf = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id || isNaN(Number(id))) {
            return res.status(400).json({ message: "Invalid invoice ID" });
        }

        const invoice = await Invoice.getInvoiceById(id);

        if (!invoice) {
            return res.status(404).json({ message: "Invoice not found" });
        }

        const doc = new PDFDocument();

        // Attach the PDF response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Invoice_${invoice.invoice_number}.pdf`);

        // Stream the PDF to the response
        doc.pipe(res);

        // Add shop details
        doc.fontSize(20).text(invoice.shop.pharmacy_name, { align: 'center', underline: true });
        doc.fontSize(12).text(`Address: ${invoice.shop.pharmacy_address}`, { align: 'center' });
        doc.text(`GST: ${invoice.shop.owner_GST_number}`, { align: 'center' });
        doc.text(`Pincode: ${invoice.shop.pincode}`, { align: 'center' });
        doc.moveDown();

        // Add customer details
        doc.fontSize(16).text(`Invoice Number#${invoice.invoice_number}`, { align: 'center', underline: true });
        doc.moveDown();
        doc.fontSize(12).text(`Customer Name: ${invoice.customer_name}`);
        doc.text(`Phone: ${invoice.phone}`);
        doc.text(`Email: ${invoice.email}`);
        doc.text(`Address: ${invoice.address}`);
        doc.moveDown();

        // Add table header for products
        doc.fontSize(14).text('Products:', { underline: true });
        doc.moveDown();

        doc.fontSize(12);
        const tableHeader = ['#', 'Product Name', 'Batch No', 'Qty', 'MRP', 'Selling Price', 'GST'];
        const tableColumnWidths = [30, 150, 80, 40, 60, 80, 40];

        // Draw table header
        let cursorY = doc.y; // Capture current Y position
        doc.text(tableHeader[0], 50, cursorY, { width: tableColumnWidths[0], align: 'center' });
        doc.text(tableHeader[1], 80, cursorY, { width: tableColumnWidths[1] });
        doc.text(tableHeader[2], 230, cursorY, { width: tableColumnWidths[2], align: 'center' });
        doc.text(tableHeader[3], 310, cursorY, { width: tableColumnWidths[3], align: 'center' });
        doc.text(tableHeader[4], 360, cursorY, { width: tableColumnWidths[4], align: 'center' });
        doc.text(tableHeader[5], 420, cursorY, { width: tableColumnWidths[5], align: 'center' });
        doc.text(tableHeader[6], 500, cursorY, { width: tableColumnWidths[6], align: 'center' });

        // Draw a line below the header
        doc.moveTo(50, cursorY + 15).lineTo(550, cursorY + 15).stroke();

        // Add product rows
        invoice.products.forEach((product, index) => {
            cursorY += 20;
            doc.text(index + 1, 50, cursorY, { width: tableColumnWidths[0], align: 'center' });
            doc.text(product.product_name, 80, cursorY, { width: tableColumnWidths[1] });
            doc.text(product.product_batch_no, 230, cursorY, { width: tableColumnWidths[2], align: 'center' });
            doc.text(invoice.invoice_quantity, 310, cursorY, { width: tableColumnWidths[3], align: 'center' });
            doc.text(parseFloat(product.product_price).toFixed(2), 360, cursorY, { width: tableColumnWidths[4], align: 'center' });
            doc.text(parseFloat(product.selling_price).toFixed(2), 420, cursorY, { width: tableColumnWidths[5], align: 'center' });
            doc.text(parseFloat(product.product_gst).toFixed(2) + '%', 500, cursorY, { width: tableColumnWidths[6], align: 'center' });
        });

        // Add a line below the last product
        doc.moveTo(50, cursorY + 15).lineTo(550, cursorY + 15).stroke();

        // Add invoice summary
        doc.moveDown(2);
        doc.fontSize(12).text(`Subtotal: ${parseFloat(invoice.total_price).toFixed(2)}`, { align: 'right' });
        doc.text(`Discount: ${parseFloat(invoice.discount).toFixed(2)}`, { align: 'right' });
        doc.text(`Final Price: ${parseFloat(invoice.final_price).toFixed(2)}`, { align: 'right' });

        // End the document
        doc.end();
    } catch (error) {
        console.error("Error downloading invoice PDF:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};






// Delete Invoice


exports.deleteInvoice = async (req, res) => {
    try {
        const { id } = req.params; 
        console.log(req.params);// Get the invoice ID from the URL params

        // Call the model's deleteInvoice method
        const result = await Invoice.deleteInvoice(id); // Ensure this returns the result of the deletion

        // Check if any rows were affected (i.e., the invoice was deleted)
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Invoice not found" });
        }

        // Respond with success if the invoice was deleted
        res.status(200).json({ message: "Invoice deleted successfully" });
    } catch (error) {
        console.error("Error deleting invoice:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};









exports.getMostSoldMedicinesController = (req, res) => {
    const { period } = req.query; // Get the time period from the query parameters
    let interval;

    // Set interval based on input
    if (period === "1week") {
        interval = "7 DAY";
    } else if (period === "2week") {
        interval = "14 DAY";
    } else if (period === "1month") {
        interval = "30 DAY";
    } else {
        return res.status(400).json({ message: "Invalid period. Use 1week, 2week, or 1month." });
    }

    Invoice.getMostSoldMedicines(interval)
        .then(response => {
            return res.status(200).json(response);
        })
        .catch(error => {
            console.error(error);
            return res.status(500).json({
                message: "Error fetching most sold medicines",
                error: error.message,
            });
        });
};





// // Controller Function
// exports.getMostSoldMedicinesControllerwith = (req, res) => { 
//     const { period, startDate, endDate } = req.query;
//     let interval = null;

//     // Set interval based on input
//     if (period === "1week") {
//         interval = "7 DAY";
//     } else if (period === "2week") {
//         interval = "14 DAY";
//     } else if (period === "1month") {
//         interval = "30 DAY";
//     } else if (period) {
//         return res.status(400).json({ message: "Invalid period. Use 1week, 2week, or 1month." });
//     }

//     // Remove time part from startDate & endDate (only keep the date)
//     const formattedStartDate = startDate ? startDate.split(" ")[0] : null;
//     const formattedEndDate = endDate ? endDate.split(" ")[0] : null;

//     Invoice.getMostSoldMedicineswithout(formattedStartDate, formattedEndDate, interval)
//         .then(response => {
//             return res.status(200).json(response);
//         })
//         .catch(error => {
//             console.error(error);
//             return res.status(500).json({
//                 message: "Error fetching most sold medicines",
//                 error: error.message,
//             });
//         });
// };



exports.getAllSoldProductsController = (req, res) => { 
    const { startDate, endDate, period } = req.query;
    let interval = null;

    // Set interval if provided
    if (period === "1week") {
        interval = "7 DAY";
    } else if (period === "2week") {
        interval = "14 DAY";
    } else if (period === "1month") {
        interval = "30 DAY";
    } else if (period) {
        return res.status(400).json({ message: "Invalid period. Use 1week, 2week, or 1month." });
    }

    Invoice.getAllSoldProductsWithInvoices(startDate, endDate, interval)
        .then(response => {
            return res.status(200).json(response);
        })
        .catch(error => {
            console.error(error);
            return res.status(500).json({
                message: "Error fetching all sold products",
                error: error.message,
            });
        });
};
