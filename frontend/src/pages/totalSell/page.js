import React, { useState, useEffect } from 'react';
import MainHeader from '../../components/MainHeader';
import { useNavigate } from 'react-router-dom';
import TopMenu from '../../components/TopMenu';
import SubMenu from '../../components/SubMenu';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const TotalSell = () => {
  const navigate = useNavigate();
  const [orderItems, setOrderItems] = useState([]);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('all'); // 'all', 'week', 'month', 'year'

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = localStorage.getItem('currentUser');
        if (userData) {
          setLoggedInUser(JSON.parse(userData));
          fetch(`http://localhost:5000/api/orderItems/statistic/${JSON.parse(userData).id}`)
            .then(response => response.json())
            .then(data => {
              setOrderItems(data);
            });
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Statistics calculation functions
  const calculateTotalRevenue = (items) => {
    return items.reduce((total, item) => {
      return total + (item.productId.price * item.quantity);
    }, 0);
  };

  const countUniqueCustomers = (items) => {
    const uniqueCustomerIds = new Set(
      items.map(item => item.orderId.buyerId._id)
    );
    return uniqueCustomerIds.size;
  };

  const revenueByCategory = (items) => {
    const categoryRevenue = {};
    
    items.forEach(item => {
      const categoryName = item.productId.categoryId.name;
      const itemRevenue = item.productId.price * item.quantity;
      
      if (categoryRevenue[categoryName]) {
        categoryRevenue[categoryName] += itemRevenue;
      } else {
        categoryRevenue[categoryName] = itemRevenue;
      }
    });
    
    return Object.entries(categoryRevenue).map(([name, value]) => ({
      name,
      value
    }));
  };

  const salesByProduct = (items) => {
    const productSales = {};
    
    items.forEach(item => {
      const productId = item.productId._id;
      const productTitle = item.productId.title;
      
      if (productSales[productId]) {
        productSales[productId].quantity += item.quantity;
        productSales[productId].revenue += item.productId.price * item.quantity;
      } else {
        productSales[productId] = {
          title: productTitle,
          quantity: item.quantity,
          revenue: item.productId.price * item.quantity
        };
      }
    });
    
    return Object.entries(productSales)
      .map(([id, data]) => ({
        id,
        name: data.title,
        quantity: data.quantity,
        revenue: data.revenue
      }))
      .sort((a, b) => b.revenue - a.revenue);
  };

  // New function: Shipping Destinations
  const shippingDestinations = (items) => {
    const cityData = {};
    
    items.forEach(item => {
      const city = item.orderId.addressId.city;
      const itemRevenue = item.productId.price * item.quantity;
      
      if (cityData[city]) {
        cityData[city].count += 1;
        cityData[city].revenue += itemRevenue;
      } else {
        cityData[city] = {
          count: 1,
          revenue: itemRevenue
        };
      }
    });
    
    return Object.entries(cityData)
      .map(([name, data]) => ({
        name,
        value: data.revenue,
        count: data.count
      }))
      .sort((a, b) => b.value - a.value);
  };

  const revenueByDate = (items) => {
    const dateRevenue = {};
    
    items.forEach(item => {
      const orderDate = new Date(item.orderId.orderDate).toISOString().split('T')[0];
      const itemRevenue = item.productId.price * item.quantity;
      
      if (dateRevenue[orderDate]) {
        dateRevenue[orderDate] += itemRevenue;
      } else {
        dateRevenue[orderDate] = itemRevenue;
      }
    });
    
    return Object.entries(dateRevenue)
      .map(([date, revenue]) => ({
        date,
        revenue
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  // Filter data based on time selection
  const getFilteredData = () => {
    if (timeFilter === 'all' || orderItems.length === 0) return orderItems;
    
    const now = new Date();
    let startDate;
    
    if (timeFilter === 'week') {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
    } else if (timeFilter === 'month') {
      startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 1);
    } else if (timeFilter === 'year') {
      startDate = new Date(now);
      startDate.setFullYear(now.getFullYear() - 1);
    }
    
    return orderItems.filter(item => {
      const orderDate = new Date(item.orderId.orderDate);
      return orderDate >= startDate;
    });
  };

  const filteredData = getFilteredData();
  const totalRevenue = calculateTotalRevenue(filteredData);
  const uniqueCustomers = countUniqueCustomers(filteredData);
  const productData = salesByProduct(filteredData);
  const categoryData = revenueByCategory(filteredData);
  const destinationData = shippingDestinations(filteredData);
  const timeData = revenueByDate(filteredData);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  if (loading) return <div className="text-center p-4">Loading data...</div>;

  if (!loggedInUser) {
    return (
      <div id="MainLayout" className="min-w-[1050px] max-w-[1300px] mx-auto">
        <TopMenu />
        <MainHeader />
        <SubMenu />
        <div className="mt-4 text-center p-6 bg-white border rounded-lg shadow-md">
          <p className="text-gray-600">Please log in to view your sales revenue.</p>
        </div>
      </div>
    );
  }

  return (
    <div id="MainLayout" className="min-w-[1050px] max-w-[1300px] mx-auto">
      <TopMenu />
      <MainHeader />
      <SubMenu />
      <div className="mt-4">
        <div className="bg-white border rounded-lg p-6 shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-800">
              Shipped Items Overview (Seller: {loggedInUser.fullname || loggedInUser.username})
            </h3>
            <div className="flex gap-4">
              <select 
                className="px-3 py-2 border rounded"
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
              >
                <option value="all">All Time</option>
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
                <option value="year">Last Year</option>
              </select>
              <button
                onClick={() => navigate('/products')}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Quản lý sản phẩm
              </button>
            </div>
          </div>
          
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <h4 className="text-blue-700 font-medium">Total Revenue (Shipped)</h4>
              <p className="text-2xl font-bold">${totalRevenue.toLocaleString()}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
              <h4 className="text-green-700 font-medium">Unique Customers</h4>
              <p className="text-2xl font-bold">{uniqueCustomers}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
              <h4 className="text-purple-700 font-medium">Products Shipped</h4>
              <p className="text-2xl font-bold">
                {[...new Set(filteredData.map(item => item.productId._id))].length}
              </p>
            </div>
          </div>
          
          {/* Charts Row */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            {/* Category Distribution */}
            <div className="border rounded-lg p-4">
              <h4 className="text-lg font-medium mb-2">Revenue by Category</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Top Shipping Destinations */}
            <div className="border rounded-lg p-4">
              <h4 className="text-lg font-medium mb-2">Top Shipping Destinations</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={destinationData.slice(0, 6)}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {destinationData.slice(0, 6).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name, props) => [`$${value.toLocaleString()}`, props.payload.name]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          
          {/* Revenue Over Time */}
          <div className="border rounded-lg p-4 mb-6">
            <h4 className="text-lg font-medium mb-2">Revenue Over Time</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={timeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                  <Legend />
                  <Bar dataKey="revenue" fill="#8884d8" name="Revenue" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Product Table */}
          <div className="border rounded-lg p-4">
            <h4 className="text-lg font-medium mb-2">Top Products</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-2 px-4 text-left">Product</th>
                    <th className="py-2 px-4 text-left">Quantity Sold</th>
                    <th className="py-2 px-4 text-left">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {productData.slice(0, 5).map((product) => (
                    <tr key={product.id} className="border-t">
                      <td className="py-2 px-4">{product.name}</td>
                      <td className="py-2 px-4">{product.quantity}</td>
                      <td className="py-2 px-4">${product.revenue.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TotalSell;