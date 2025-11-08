import express from 'express';
import salesReportController from '../../controllers/admin/salesReportController.js';

const router = express.Router();


router.get('/sales-report', salesReportController.getSalesReportPage);


router.post('/sales-report/generate', salesReportController.generateReport);


router.post('/sales-report/download-pdf', salesReportController.downloadPDF);


router.post('/sales-report/download-excel', salesReportController.downloadExcel);

export default router;