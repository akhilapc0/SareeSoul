import Order from '../../models/orderModel.js';
import Product from '../../models/productModel.js';
import Category from '../../models/categoryModel.js';
import Brand from '../../models/brandModel.js';
import User from '../../models/userModel.js';

const getDashboard = async (req, res) => {
  const filter = req.query.filter || 'weekly';
  
  // Default values in case of error
  const defaultData = {
    filter: filter,
    totalRevenue: 0,
    revenueChange: 0,
    totalCustomers: 0,
    customerChange: 0,
    totalOrders: 0,
    orderChange: 0,
    salesChartData: '[]',
    customerChartData: '[]',
    ordersChartData: '[]',
    categoryPerformance: '[]',
    topProducts: [],
    topCategories: [],
    topBrands: [],
    recentOrders: []
  };
  
  try {
    // Calculate date range based on filter
    const now = new Date();
    let startDate, endDate = now;
    
    switch(filter) {
      case 'daily':
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'weekly':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case 'monthly':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'yearly':
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
    }

    // Get total revenue
    const revenueData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          paymentStatus: 'Paid'
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$total' }
        }
      }
    ]);
    const totalRevenue = revenueData[0]?.totalRevenue || 0;

    // Get previous period revenue for comparison
    const prevStartDate = new Date(startDate);
    const timeDiff = endDate - startDate;
    prevStartDate.setTime(startDate.getTime() - timeDiff);
    
    const prevRevenueData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: prevStartDate, $lt: startDate },
          paymentStatus: 'Paid'
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$total' }
        }
      }
    ]);
    const prevRevenue = prevRevenueData[0]?.totalRevenue || 0;
    const revenueChange = prevRevenue > 0 
      ? ((totalRevenue - prevRevenue) / prevRevenue * 100).toFixed(1) 
      : (totalRevenue > 0 ? 100 : 0);

    // Get total ACTIVE customers (unique customers who placed orders)
    const activeCustomersData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$userId'
        }
      },
      {
        $count: 'total'
      }
    ]);
    const totalCustomers = activeCustomersData[0]?.total || 0;
    
    // Get previous period active customers
    const prevActiveCustomersData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: prevStartDate, $lt: startDate }
        }
      },
      {
        $group: {
          _id: '$userId'
        }
      },
      {
        $count: 'total'
      }
    ]);
    const prevCustomers = prevActiveCustomersData[0]?.total || 0;
    const customerChange = prevCustomers > 0 
      ? ((totalCustomers - prevCustomers) / prevCustomers * 100).toFixed(1) 
      : (totalCustomers > 0 ? 100 : 0); // If no previous data but has current, show 100% growth

    // Get total orders
    const totalOrders = await Order.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate }
    });
    
    const prevOrders = await Order.countDocuments({
      createdAt: { $gte: prevStartDate, $lt: startDate }
    });
    const orderChange = prevOrders > 0 ? ((totalOrders - prevOrders) / prevOrders * 100).toFixed(1) : 0;

    // Sales Revenue Chart Data
    const salesChartData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          paymentStatus: 'Paid'
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { 
              format: filter === 'yearly' ? '%Y-%m' : filter === 'monthly' ? '%Y-%m-%d' : '%Y-%m-%d',
              date: '$createdAt'
            }
          },
          revenue: { $sum: '$total' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Customer Growth Chart Data (unique active customers per day/month)
    const customerChartData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            date: {
              $dateToString: { 
                format: filter === 'yearly' ? '%Y-%m' : filter === 'monthly' ? '%Y-%m-%d' : '%Y-%m-%d',
                date: '$createdAt'
              }
            },
            userId: '$userId'
          }
        }
      },
      {
        $group: {
          _id: '$_id.date',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Orders Overview Chart Data
    const ordersChartData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { 
              format: filter === 'yearly' ? '%Y-%m' : filter === 'monthly' ? '%Y-%m-%d' : '%Y-%m-%d',
              date: '$createdAt'
            }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Top 10 Best Selling Products
    const topProducts = await Order.aggregate([
      { 
        $match: { 
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $ne: 'Cancelled' }
        } 
      },
      { $unwind: '$items' },
      {
        $match: {
          'items.itemStatus': { $nin: ['Cancelled', 'Returned'] }
        }
      },
      {
        $group: {
          _id: '$items.productId',
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $lookup: {
          from: 'variants',
          localField: '_id',
          foreignField: 'productId',
          as: 'variants'
        }
      },
      {
        $project: {
          name: '$product.name',
          sold: '$totalQuantity',
          revenue: '$totalRevenue',
          image: { $arrayElemAt: ['$variants.images', 0] }
        }
      }
    ]);

    // Top 10 Best Selling Categories
    const topCategories = await Order.aggregate([
      { 
        $match: { 
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $ne: 'Cancelled' }
        } 
      },
      { $unwind: '$items' },
      {
        $match: {
          'items.itemStatus': { $nin: ['Cancelled', 'Returned'] }
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: 'items.productId',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $group: {
          _id: '$product.categoryId',
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'category'
        }
      },
      { $unwind: '$category' },
      {
        $project: {
          name: '$category.name',
          sold: '$totalQuantity',
          revenue: '$totalRevenue'
        }
      }
    ]);

    // Top 10 Best Selling Brands
    const topBrands = await Order.aggregate([
      { 
        $match: { 
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $ne: 'Cancelled' }
        } 
      },
      { $unwind: '$items' },
      {
        $match: {
          'items.itemStatus': { $nin: ['Cancelled', 'Returned'] }
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: 'items.productId',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $group: {
          _id: '$product.brandId',
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'brands',
          localField: '_id',
          foreignField: '_id',
          as: 'brand'
        }
      },
      { $unwind: '$brand' },
      {
        $project: {
          name: '$brand.name',
          sold: '$totalQuantity',
          revenue: '$totalRevenue',
          image: '$brand.image'
        }
      }
    ]);

    // Category Performance for Pie Chart
    const categoryPerformance = await Order.aggregate([
      { 
        $match: { 
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $ne: 'Cancelled' }
        } 
      },
      { $unwind: '$items' },
      {
        $match: {
          'items.itemStatus': { $nin: ['Cancelled', 'Returned'] }
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: 'items.productId',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $group: {
          _id: '$product.categoryId',
          count: { $sum: '$items.quantity' }
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'category'
        }
      },
      { $unwind: '$category' },
      {
        $project: {
          name: '$category.name',
          value: '$count'
        }
      }
    ]);

    // Recent Orders
    const recentOrders = await Order.find()
      .populate('userId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(5);

    return res.render('dashboard', {
      filter,
      totalRevenue,
      revenueChange,
      totalCustomers,
      customerChange,
      totalOrders,
      orderChange,
      salesChartData: JSON.stringify(salesChartData),
      customerChartData: JSON.stringify(customerChartData),
      ordersChartData: JSON.stringify(ordersChartData),
      categoryPerformance: JSON.stringify(categoryPerformance),
      topProducts,
      topCategories,
      topBrands,
      recentOrders
    });

  } catch (error) {
    console.error('Dashboard Error:', error.message);
    console.error('Stack:', error.stack);
    
    // Render with default empty data instead of throwing error
    return res.render('dashboard', defaultData);
  }
};

const dashboardController = {
  getDashboard
};

export default dashboardController;