const PDFDocument = require('pdfkit');
const Order = require('../../models/orderModel');
const User = require('../../models/userModel')
const Variant = require('../../models/variantModel');
const updateOrderStatus = require('../../utils/updateOrderStatus');

const getUserOrders = async (req, res) => {
    try {
        const userId = req.session?.user?._id || req.session?.passport?.user;
        const user = req.session?.user || await User.findById(userId);

        const page = parseInt(req.query.page) || 1;
        const limit = 5;
        const skip = (page - 1) * limit;
        const query = { userId };
        if (req.query.orderId) {
            query.orderId = { $regex: req.query.orderId, $options: 'i' }
        }
        if (req.query.startDate && req.query.endDate) {
            query.createdAt = {
                $gte: new Date(req.query.startDate),
                $lte: new Date(req.query.endDate)
            }
        }
        const orders = await Order.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate({
                path: 'items.productId',
                select: 'name salesPrice'
            })
            .populate({
                path: 'items.variantId',
                select: 'colour'
            })
        const totalOrders = await Order.countDocuments(query)
        const totalPages = Math.ceil(totalOrders / limit);

        res.render('my-orders', {
            user,
            orders,
            currentPage: page,
            totalPages,
            search: req.query.orderId || '',
            startDate: req.query.startDate || '',
            endDate: req.query.endDate || ''
        })

    }
    catch (err) {
        console.error("error loading user orders:", err);
        res.status(500).send('something went wrong')
    }
}

const getOrderDetail = async (req, res) => {
    try {
        const userId = req.session?.user?._id || req.session?.passport?.user;
        const orderId = req.params.orderId;
        const order = await Order.findOne({ orderId, userId })
            .populate({
                path: 'items.productId',
                select: 'name description salesPrice'
            })
            .populate({
                path: 'items.variantId',
                select: 'colour images'
            })

        if (!order) {
            return res.status(400).send('order not found')
        }
        const user = req.session?.user || await User.findById(userId);
        res.render('order-detail', { user, order })

    }
    catch (error) {
        console.error('Error fetching order detail:', error);
        res.status(500).send('something went wrong')
    }
}
const cancelOrder = async (req, res) => {
    try {
        const userId = req.session?.user?._id || req.session?.passport?.user;
        const orderId = req.params.orderId;
        const { reason } = req.body;

        const order = await Order.findOne({ orderId, userId });
        if (!order) return res.status(400).json({ message: 'Order not found' });

        // Only allow cancellation if items are Pending or Shipped
        const canCancel = order.items.every(i => ['Pending', 'Shipped'].includes(i.itemStatus));
        if (!canCancel) {
            return res.status(400).json({ message: 'Order cannot be cancelled. Some items are already delivered, cancelled, or returned.' });
        }

        // Cancel all items and restore stock
        for (const item of order.items) {
            const variant = await Variant.findById(item.variantId);
            if (variant) {
                variant.stock += item.quantity;
                await variant.save();
            }

            item.itemStatus = 'Cancelled';
            item.cancelReason = reason || '';
        }

        // Update overall order status using helper
        updateOrderStatus(order);

        await order.save();
        return res.json({ message: 'Order cancelled successfully', order });

    } catch (error) {
        console.error('Error cancelling order:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

const cancelOrderItem = async (req, res) => {
    try {
        const userId = req.session?.user?._id || req.session?.passport?.user;
        const { orderId, itemId } = req.params;
        const { reason } = req.body; // User-provided cancel reason

        const order = await Order.findOne({ orderId, userId });
        if (!order) return res.status(400).json({ message: 'Order not found' });

        const item = order.items.id(itemId);
        if (!item) return res.status(400).json({ message: 'Item not found in order' });

        // Only allow cancelling if Pending or Shipped
        if (!['Pending', 'Shipped'].includes(item.itemStatus)) {
            return res.status(400).json({ message: `Cannot cancel item with status: ${item.itemStatus}` });
        }

        // Restore stock
        const variant = await Variant.findById(item.variantId);
        if (variant) {
            variant.stock += item.quantity;
            await variant.save();
        }

        // Update item status and store cancel reason
        item.itemStatus = 'Cancelled';
        item.cancelReason = reason || '';

        // Update overall order status
        updateOrderStatus(order);

        await order.save();

        return res.json({ message: 'Item cancelled successfully', order });

    } catch (error) {
        console.error('Error cancelling order item:', error);
        return res.status(500).json({ message: "Server error" });
    }
};

const returnItem = async (req, res) => {
    try {
        const userId = req.session?.user?._id || req.session?.passport?.user;
        const { orderId, itemId } = req.params;
        const { reason } = req.body;

        if (!reason || reason.trim() === '') {
            return res.status(400).json({ message: "Return reason is required" });
        }

        const order = await Order.findOne({ orderId, userId });
        if (!order) return res.status(400).json({ message: "Order not found" });

        const item = order.items.id(itemId);
        if (!item) return res.status(400).json({ message: "Item not found in order" });

        if (item.itemStatus !== 'Delivered') {
            return res.status(400).json({ message: "Only delivered items can be returned" });
        }

        item.itemStatus = 'ReturnRequested';
        item.returnReason = reason;

        // Update overall order status
        updateOrderStatus(order);

        await order.save();
        return res.json({ message: 'Return request submitted successfully', order });

    } catch (error) {
        console.error('Error submitting return request:', error);
        return res.status(500).json({ message: "Server error" });
    }
};

const returnOrder = async (req, res) => {
    try {
        const userId = req.session?.user?._id || req.session?.passport?.user;
        const { orderId } = req.params;
        const { reason } = req.body;

        if (!reason || reason.trim() === '') {
            return res.status(400).json({ message: "Return reason is required" });
        }

        const order = await Order.findOne({ orderId, userId });
        if (!order) return res.status(400).json({ message: "Order not found" });

        // Only delivered items can be requested for return
        const deliveredItems = order.items.filter(item => item.itemStatus === "Delivered");
        if (deliveredItems.length === 0) {
            return res.status(400).json({ message: "No delivered items to return" });
        }

        // Update all delivered items to ReturnRequested
        deliveredItems.forEach(item => {
            item.itemStatus = "ReturnRequested";
            item.returnReason = reason;
        });

        // Recalculate overall order status
        updateOrderStatus(order);

        await order.save();
        return res.json({ message: "Return request for order submitted successfully", order });

    } catch (err) {
        console.error("Error returning order:", err);
        return res.status(500).json({ message: "Server error" });
    }
};


const downloadInvoice = async (req, res) => {
    try {
        const userId = req.session?.user?._id || req.session?.passport?.user;
        const { orderId } = req.params;
        const order = await Order.findOne({ orderId, userId })
            .populate('items.productId')
            .populate('items.variantId');
            
        if (!order) {
            return res.status(400).send("Order not found");
        }

        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        
        res.setHeader('Content-Disposition', `attachment; filename=invoice_${order.orderId}.pdf`);
        res.setHeader('Content-Type', 'application/pdf');
        
        doc.pipe(res);

        // Header Section
        doc.rect(0, 0, doc.page.width, 80).fill('#0d6efd');
        doc.fillColor('#ffffff')
           .fontSize(28)
           .font('Helvetica-Bold')
           .text('INVOICE', 50, 30, { align: 'center' });

        doc.fillColor('#000000').font('Helvetica');

        // Order Information Box
        let yPosition = 120;
        doc.fontSize(16)
           .font('Helvetica-Bold')
           .text('Order Information', 50, yPosition);
        
        yPosition += 25;
        doc.strokeColor('#0d6efd')
           .lineWidth(2)
           .moveTo(50, yPosition)
           .lineTo(545, yPosition)
           .stroke();

        yPosition += 15;
        doc.fontSize(11).font('Helvetica');
        
        // Two column layout for order info
        const leftColumn = 50;
        const rightColumn = 320;
        
        doc.font('Helvetica-Bold').text('Order ID:', leftColumn, yPosition);
        doc.font('Helvetica').text(order.orderId, leftColumn + 100, yPosition);
        
        doc.font('Helvetica-Bold').text('Order Date:', rightColumn, yPosition);
        doc.font('Helvetica').text(new Date(order.createdAt).toLocaleDateString(), rightColumn + 100, yPosition);
        
        yPosition += 20;
        doc.font('Helvetica-Bold').text('Status:', leftColumn, yPosition);
        doc.font('Helvetica').text(order.status, leftColumn + 100, yPosition);
        
        doc.font('Helvetica-Bold').text('Payment Method:', rightColumn, yPosition);
        doc.font('Helvetica').text(order.paymentMethod, rightColumn + 100, yPosition);

        yPosition += 40;

        // Shipping Address Section
        if (order.address) {
            doc.fontSize(16)
               .font('Helvetica-Bold')
               .text('Shipping Address', 50, yPosition);
            
            yPosition += 25;
            doc.strokeColor('#0d6efd')
               .lineWidth(2)
               .moveTo(50, yPosition)
               .lineTo(545, yPosition)
               .stroke();

            yPosition += 15;
            doc.fontSize(11)
               .font('Helvetica-Bold')
               .text(order.address.fullName, 50, yPosition);
            
            yPosition += 18;
            doc.font('Helvetica')
               .text(order.address.street, 50, yPosition);
            
            yPosition += 15;
            doc.text(`${order.address.city}, ${order.address.state} - ${order.address.pincode}`, 50, yPosition);
            
            yPosition += 15;
            doc.text(`Phone: ${order.address.phone}`, 50, yPosition);
            
            yPosition += 40;
        }

        // Items Section
        doc.fontSize(16)
           .font('Helvetica-Bold')
           .text('Order Items', 50, yPosition);
        
        yPosition += 25;
        doc.strokeColor('#0d6efd')
           .lineWidth(2)
           .moveTo(50, yPosition)
           .lineTo(545, yPosition)
           .stroke();

        yPosition += 15;

        // Table Header
        doc.fontSize(10)
           .font('Helvetica-Bold')
           .fillColor('#ffffff');
        
        doc.rect(50, yPosition, 495, 25).fill('#0d6efd');
        
        doc.text('#', 60, yPosition + 8);
        doc.text('Product', 100, yPosition + 8);
        doc.text('Colour', 280, yPosition + 8);
        doc.text('Qty', 360, yPosition + 8);
        doc.text('Price', 420, yPosition + 8);
        doc.text('Subtotal', 480, yPosition + 8);

        yPosition += 25;
        doc.fillColor('#000000').font('Helvetica');

        // Table Rows
        order.items.forEach((item, index) => {
            // Check if we need a new page
            if (yPosition > 700) {
                doc.addPage();
                yPosition = 50;
            }

            const rowHeight = 30;
            
            // Alternating row colors
            if (index % 2 === 0) {
                doc.rect(50, yPosition, 495, rowHeight).fill('#f8f9fa');
            }

            doc.fillColor('#000000')
               .fontSize(10)
               .text(index + 1, 60, yPosition + 10);
            
            const productName = item.productId?.name || 'Product';
            doc.text(productName.substring(0, 25), 100, yPosition + 10, { width: 170 });
            
            doc.text(item.variantId?.colour || 'N/A', 280, yPosition + 10);
            doc.text(item.quantity.toString(), 360, yPosition + 10);
            doc.text(`Rs. ${item.price}`, 420, yPosition + 10);
            doc.text(`Rs. ${item.quantity * item.price}`, 480, yPosition + 10);
            
            yPosition += rowHeight;
        });

        yPosition += 20;

        // Summary Section
        if (yPosition > 650) {
            doc.addPage();
            yPosition = 50;
        }

        doc.fontSize(16)
           .font('Helvetica-Bold')
           .text('Order Summary', 50, yPosition);
        
        yPosition += 25;
        doc.strokeColor('#0d6efd')
           .lineWidth(2)
           .moveTo(50, yPosition)
           .lineTo(545, yPosition)
           .stroke();

        yPosition += 20;

        // Summary Box
        const summaryBoxX = 350;
        const summaryBoxWidth = 195;
        
        doc.fontSize(11).font('Helvetica');
        
        // Clean all summary values
        const cleanSubtotal = String(order.subtotal).replace(/[^\d.]/g, '');
        const cleanDiscount = order.discount ? String(order.discount).replace(/[^\d.]/g, '') : '0';
        const cleanDelivery = order.deliveryCharge ? String(order.deliveryCharge).replace(/[^\d.]/g, '') : '0';
        const cleanTotal = String(order.total).replace(/[^\d.]/g, '');
        
        doc.text('Subtotal:', summaryBoxX, yPosition);
        doc.text(`Rs. ${parseFloat(cleanSubtotal).toFixed(2)}`, summaryBoxX + 120, yPosition, { align: 'right', width: 75 });
        
        yPosition += 20;
        
        if (order.discount) {
            doc.fillColor('#28a745')
               .text('Discount:', summaryBoxX, yPosition);
            doc.text(`Rs. ${parseFloat(cleanDiscount).toFixed(2)}`, summaryBoxX + 120, yPosition, { align: 'right', width: 75 });
            doc.fillColor('#000000');
            yPosition += 20;
        }
        
        if (order.deliveryCharge) {
            doc.fillColor('#000000')
               .text('Delivery Charge:', summaryBoxX, yPosition);
            doc.text(`Rs. ${parseFloat(cleanDelivery).toFixed(2)}`, summaryBoxX + 120, yPosition, { align: 'right', width: 75 });
            yPosition += 20;
        }

        // Total Line
        doc.strokeColor('#0d6efd')
           .lineWidth(1)
           .moveTo(summaryBoxX, yPosition)
           .lineTo(545, yPosition)
           .stroke();

        yPosition += 15;
        
        doc.fontSize(14)
           .font('Helvetica-Bold')
           .fillColor('#0d6efd')
           .text('Total Amount:', summaryBoxX, yPosition);
        doc.text(`Rs. ${parseFloat(cleanTotal).toFixed(2)}`, summaryBoxX + 120, yPosition, { align: 'right', width: 75 });

        // Footer
        const footerY = doc.page.height - 80;
        doc.fontSize(9)
           .fillColor('#666666')
           .font('Helvetica')
           .text('Thank you for your purchase!', 50, footerY, { align: 'center', width: 495 });
        
        doc.fontSize(8)
           .text('This is a computer-generated invoice and does not require a signature.', 50, footerY + 15, { align: 'center', width: 495 });

        doc.end();

    } catch (err) {
        console.error('Error generating invoice:', err);
        res.status(500).send('Server error while generating invoice');
    }
};




module.exports = {
    getUserOrders,
    getOrderDetail,
    cancelOrder,
    cancelOrderItem,
    returnItem,
    returnOrder,
    downloadInvoice
}

