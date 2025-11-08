import Order from '../../models/orderModel.js';
import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';

export const getSalesReportPage = (req, res) => {
  try {
    res.render('sales-report');
  } catch (error) {
    console.error('Error loading sales report page:', error);
    res.status(500).send('Server error');
  }
};

export const generateReport = async (req, res) => {
  try {
    const { reportType, fromDate, toDate } = req.body;
    
    let startDate, endDate;
    const now = new Date();

    
    switch (reportType) {
      case 'daily':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        endDate = new Date(now.setHours(23, 59, 59, 999));
        break;

      case 'weekly':
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay()); 
        weekStart.setHours(0, 0, 0, 0);
        startDate = weekStart;
        endDate = new Date();
        break;

      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        break;

      case 'yearly':
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
        break;

      case 'custom':
        if (!fromDate || !toDate) {
          return res.status(400).json({
            success: false,
            message: 'Please provide both from and to dates'
          });
        }
        startDate = new Date(fromDate);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(toDate);
        endDate.setHours(23, 59, 59, 999);
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid report type'
        });
    }

    
    const orders = await Order.find({
      createdAt: { $gte: startDate, $lte: endDate },
      status: { $nin: ['Cancelled'] } 
    })
    .populate('userId', 'firstName lastName email')
    .sort({ createdAt: -1 })
    .lean();

    
    let totalOrders = orders.length;
    let totalSales = 0;
    let totalDiscount = 0;
    let totalCouponDiscount = 0;

    const orderDetails = orders.map(order => {
      totalSales += order.total;
      totalDiscount += order.discount || 0;
      totalCouponDiscount += order.discount || 0; 

      return {
        orderId: order.orderId,
        customerName: order.userId 
          ? `${order.userId.firstName} ${order.userId.lastName}` 
          : 'Guest',
        customerEmail: order.userId?.email || 'N/A',
        createdAt: order.createdAt,
        total: order.total,
        discount: order.discount || 0,
        couponDiscount: order.discount || 0,
        status: order.status,
        paymentMethod: order.paymentMethod,
        subtotal: order.subtotal
      };
    });

    res.json({
      success: true,
      summary: {
        totalOrders,
        totalSales,
        totalDiscount,
        totalCouponDiscount
      },
      orders: orderDetails,
      dateRange: {
        from: startDate,
        to: endDate,
        type: reportType
      }
    });

  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate report'
    });
  }
};

export const downloadPDF = async (req, res) => {
  try {
    const { summary, orders, dateRange } = req.body;

    const doc = new PDFDocument({ 
      margin: 40, 
      size: 'A4',
      bufferPages: true
    });
    
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=sales-report-${Date.now()}.pdf`);
    
    doc.pipe(res);


    const formatCurrency = (amount) => {
      return `Rs ${amount.toFixed(2)}`;
    };


    const primaryColor = '#008B8B';
    const lightGray = '#F5F5F5';
    const darkGray = '#333333';

    
    doc.rect(0, 0, doc.page.width, 80).fill(primaryColor);
    
    doc.fillColor('#FFFFFF')
       .fontSize(24)
       .font('Helvetica-Bold')
       .text('SALES REPORT', 0, 30, { align: 'center' });
    
    doc.fontSize(10)
       .font('Helvetica')
       .text(
         `Report Period: ${new Date(dateRange.from).toLocaleDateString('en-IN')} to ${new Date(dateRange.to).toLocaleDateString('en-IN')}`,
         0, 55,
         { align: 'center' }
       );

    doc.fillColor(darkGray);
    let yPos = 100;

    
    doc.fontSize(16)
       .font('Helvetica-Bold')
       .fillColor(primaryColor)
       .text('Sales Summary', 40, yPos);
    
    yPos += 25;

    
    doc.rect(40, yPos, doc.page.width - 80, 100)
       .fillAndStroke(lightGray, darkGray)
       .lineWidth(0.5);

    yPos += 15;

    
    const summaryData = [
      ['Total Orders:', summary.totalOrders.toString()],
      ['Total Sales Amount:', formatCurrency(summary.totalSales)],
      ['Total Discount:', formatCurrency(summary.totalDiscount)],
      ['Total Coupon Discount:', formatCurrency(summary.totalCouponDiscount)]
    ];

    doc.fontSize(11).font('Helvetica');
    summaryData.forEach(([label, value], index) => {
      const xLeft = 60;
      const xRight = 300;
      
      doc.fillColor(darkGray)
         .text(label, xLeft, yPos, { width: 200 })
         .font('Helvetica-Bold')
         .text(value, xRight, yPos, { width: 200 });
      
      yPos += 20;
      doc.font('Helvetica');
    });

    yPos += 30;

    
    doc.fontSize(16)
       .font('Helvetica-Bold')
       .fillColor(primaryColor)
       .text('Order Details', 40, yPos);
    
    yPos += 30;

    
    const tableLeft = 40;
    const tableWidth = doc.page.width - 80;
    const colWidths = [70, 100, 70, 80, 70, 70, 60];
    const headers = ['Order ID', 'Customer', 'Date', 'Amount', 'Discount', 'Coupon', 'Status'];
    
    
    doc.rect(tableLeft, yPos, tableWidth, 25)
       .fill(primaryColor);
    
    
    let xPos = tableLeft + 5;
    doc.fontSize(9)
       .font('Helvetica-Bold')
       .fillColor('#FFFFFF');
    
    headers.forEach((header, i) => {
      doc.text(header, xPos, yPos + 8, { 
        width: colWidths[i] - 5, 
        align: 'left' 
      });
      xPos += colWidths[i];
    });

    yPos += 25;
    
    
    doc.fontSize(9).font('Helvetica').fillColor(darkGray);
    
    orders.forEach((order, rowIndex) => {
    
      if (yPos > doc.page.height - 100) {
        doc.addPage();
        yPos = 40;
        
        
        doc.rect(tableLeft, yPos, tableWidth, 25).fill(primaryColor);
        xPos = tableLeft + 5;
        doc.fontSize(9).font('Helvetica-Bold').fillColor('#FFFFFF');
        
        headers.forEach((header, i) => {
          doc.text(header, xPos, yPos + 8, { 
            width: colWidths[i] - 5, 
            align: 'left' 
          });
          xPos += colWidths[i];
        });
        
        yPos += 25;
        doc.font('Helvetica').fillColor(darkGray);
      }

      
      if (rowIndex % 2 === 0) {
        doc.rect(tableLeft, yPos, tableWidth, 22).fill('#FAFAFA');
      }

      xPos = tableLeft + 5;
      
      const rowData = [
        order.orderId,
        order.customerName.length > 15 ? order.customerName.substring(0, 15) + '...' : order.customerName,
        new Date(order.createdAt).toLocaleDateString('en-IN', { 
          day: '2-digit', 
          month: '2-digit', 
          year: 'numeric' 
        }),
        formatCurrency(order.total),
        formatCurrency(order.discount),
        formatCurrency(order.couponDiscount),
        order.status
      ];

      doc.fillColor(darkGray);
      rowData.forEach((data, i) => {
        doc.text(data, xPos, yPos + 5, { 
          width: colWidths[i] - 5, 
          align: 'left',
          lineBreak: false
        });
        xPos += colWidths[i];
      });

      yPos += 22;
    });

    
    doc.rect(tableLeft, yPos, tableWidth, 0).stroke(darkGray);

    
    const range = doc.bufferedPageRange();
    for (let i = range.start; i < range.start + range.count; i++) {
      doc.switchToPage(i);
      
      doc.fontSize(8)
         .fillColor('#888888')
         .text(
           `Generated on ${new Date().toLocaleString('en-IN')} | Page ${i + 1} of ${range.count}`,
           40,
           doc.page.height - 40,
           { align: 'center', width: doc.page.width - 80 }
         );
    }

    doc.end();

  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ success: false, message: 'Failed to generate PDF' });
  }
};

export const downloadExcel = async (req, res) => {
  try {
    const { summary, orders, dateRange } = req.body;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sales Report');

    
    const formatCurrency = (amount) => {
      return `Rs ${amount.toFixed(2)}`;
    };

    
    worksheet.columns = [
      { width: 15 },  // A - Order ID
      { width: 20 },  // B - Customer Name
      { width: 25 },  // C - Customer Email
      { width: 12 },  // D - Date
      { width: 15 },  // E - Amount
      { width: 15 },  // F - Discount
      { width: 12 }   // G - Status
    ];

    
    worksheet.mergeCells('A1:G1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = 'SALES REPORT';
    titleCell.font = { size: 18, bold: true, color: { argb: 'FFFFFFFF' } };
    titleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF008B8B' }
    };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    worksheet.getRow(1).height = 30;

    
    worksheet.mergeCells('A2:G2');
    const dateCell = worksheet.getCell('A2');
    dateCell.value = `Report Period: ${new Date(dateRange.from).toLocaleDateString('en-IN')} to ${new Date(dateRange.to).toLocaleDateString('en-IN')}`;
    dateCell.font = { size: 11, italic: true };
    dateCell.alignment = { horizontal: 'center', vertical: 'middle' };
    worksheet.getRow(2).height = 20;

    
    worksheet.addRow([]);

    
    const summaryTitleRow = worksheet.addRow(['Sales Summary']);
    summaryTitleRow.getCell(1).font = { bold: true, size: 14, color: { argb: 'FF008B8B' } };
    summaryTitleRow.height = 25;

    
    const summaryRows = [
      ['Total Orders', summary.totalOrders],
      ['Total Sales Amount', formatCurrency(summary.totalSales)],
      ['Total Discount', formatCurrency(summary.totalDiscount)],
      ['Total Coupon Discount', formatCurrency(summary.totalCouponDiscount)]
    ];

    summaryRows.forEach(([label, value]) => {
      const row = worksheet.addRow([label, value]);
      row.getCell(1).font = { bold: true, size: 11 };
      row.getCell(2).font = { size: 11 };
      row.getCell(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF0F0F0' }
      };
      row.height = 20;
    });

    
    worksheet.addRow([]);
    worksheet.addRow([]);

    
    const detailsTitleRow = worksheet.addRow(['Order Details']);
    detailsTitleRow.getCell(1).font = { bold: true, size: 14, color: { argb: 'FF008B8B' } };
    detailsTitleRow.height = 25;

    
    const headerRow = worksheet.addRow([
      'Order ID',
      'Customer Name',
      'Customer Email',
      'Date',
      'Amount',
      'Discount',
      'Status'
    ]);

    
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF008B8B' }
      };
      cell.font = { 
        bold: true, 
        size: 11,
        color: { argb: 'FFFFFFFF' } 
      };
      cell.alignment = { 
        horizontal: 'center', 
        vertical: 'middle' 
      };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FF000000' } },
        left: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'thin', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } }
      };
    });
    headerRow.height = 25;

    
    orders.forEach((order, index) => {
      const row = worksheet.addRow([
        order.orderId,
        order.customerName,
        order.customerEmail,
        new Date(order.createdAt).toLocaleDateString('en-IN'),
        formatCurrency(order.total),
        formatCurrency(order.discount),
        order.status
      ]);

      
      row.eachCell((cell, colNumber) => {
        if (index % 2 === 0) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFAFAFA' }
          };
        }
        
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFE0E0E0' } },
          left: { style: 'thin', color: { argb: 'FFE0E0E0' } },
          bottom: { style: 'thin', color: { argb: 'FFE0E0E0' } },
          right: { style: 'thin', color: { argb: 'FFE0E0E0' } }
        };

        cell.alignment = { 
          horizontal: colNumber === 2 || colNumber === 3 ? 'left' : 'center',
          vertical: 'middle' 
        };

        
        if (colNumber === 7) {
          const status = order.status.toLowerCase();
          if (status === 'delivered') {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFD4EDDA' }
            };
            cell.font = { color: { argb: 'FF155724' }, bold: true };
          } else if (status === 'pending') {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFFFF3CD' }
            };
            cell.font = { color: { argb: 'FF856404' }, bold: true };
          } else if (status === 'cancelled') {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFF8D7DA' }
            };
            cell.font = { color: { argb: 'FF721C24' }, bold: true };
          }
        }
      });

      row.height = 20;
    });


    worksheet.addRow([]);
    const footerRow = worksheet.addRow([`Generated on ${new Date().toLocaleString('en-IN')}`]);
    worksheet.mergeCells(footerRow.number, 1, footerRow.number, 7);
    footerRow.getCell(1).font = { italic: true, size: 9, color: { argb: 'FF888888' } };
    footerRow.getCell(1).alignment = { horizontal: 'center' };

    
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=sales-report-${Date.now()}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error('Error generating Excel:', error);
    res.status(500).json({ success: false, message: 'Failed to generate Excel' });
  }
};

const salesReportController = {
  getSalesReportPage,
  generateReport,
  downloadPDF,
  downloadExcel
};

export default salesReportController;