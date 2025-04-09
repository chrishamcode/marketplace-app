import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination
} from '@mui/material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { 
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  ShoppingCart as ShoppingCartIcon,
  AttachMoney as MoneyIcon,
  TrendingUp as TrendingUpIcon,
  Search as SearchIcon,
  Category as CategoryIcon,
  Person as PersonIcon
} from '@mui/icons-material';

// Mock data for development - will be replaced with real API calls
const mockData = {
  summary: {
    activeUsers: 1245,
    newUsers: 87,
    totalPageViews: 15678,
    newListings: 342,
    completedTransactions: 128,
    totalSales: 8750,
    averageOrderValue: 68.36,
    photoToPostUsage: 289
  },
  trends: {
    users: [
      { date: '2025-03-23', activeUsers: 1150, newUsers: 75 },
      { date: '2025-03-24', activeUsers: 1180, newUsers: 82 },
      { date: '2025-03-25', activeUsers: 1210, newUsers: 79 },
      { date: '2025-03-26', activeUsers: 1190, newUsers: 81 },
      { date: '2025-03-27', activeUsers: 1220, newUsers: 85 },
      { date: '2025-03-28', activeUsers: 1235, newUsers: 83 },
      { date: '2025-03-29', activeUsers: 1245, newUsers: 87 }
    ],
    sales: [
      { date: '2025-03-23', transactions: 110, revenue: 7500 },
      { date: '2025-03-24', transactions: 115, revenue: 7850 },
      { date: '2025-03-25', transactions: 118, revenue: 8100 },
      { date: '2025-03-26', transactions: 122, revenue: 8300 },
      { date: '2025-03-27', transactions: 125, revenue: 8500 },
      { date: '2025-03-28', transactions: 126, revenue: 8600 },
      { date: '2025-03-29', transactions: 128, revenue: 8750 }
    ],
    listings: [
      { date: '2025-03-23', newListings: 310, photoToPost: 260 },
      { date: '2025-03-24', newListings: 315, photoToPost: 265 },
      { date: '2025-03-25', newListings: 320, photoToPost: 270 },
      { date: '2025-03-26', newListings: 325, photoToPost: 275 },
      { date: '2025-03-27', newListings: 330, photoToPost: 280 },
      { date: '2025-03-28', newListings: 335, photoToPost: 285 },
      { date: '2025-03-29', newListings: 342, photoToPost: 289 }
    ]
  },
  topCategories: [
    { name: 'Electronics', count: 450 },
    { name: 'Clothing', count: 380 },
    { name: 'Home & Garden', count: 320 },
    { name: 'Sports', count: 280 },
    { name: 'Toys', count: 210 }
  ],
  topSearchTerms: [
    { term: 'iphone', count: 320 },
    { term: 'laptop', count: 280 },
    { term: 'nike', count: 250 },
    { term: 'playstation', count: 220 },
    { term: 'furniture', count: 190 }
  ],
  topSellers: [
    { id: '1', name: 'John Doe', sales: 45, revenue: 3200, rating: 4.8 },
    { id: '2', name: 'Jane Smith', sales: 38, revenue: 2800, rating: 4.9 },
    { id: '3', name: 'Bob Johnson', sales: 32, revenue: 2400, rating: 4.7 },
    { id: '4', name: 'Alice Williams', sales: 28, revenue: 2100, rating: 4.6 },
    { id: '5', name: 'Charlie Brown', sales: 25, revenue: 1900, rating: 4.5 }
  ],
  recentTransactions: [
    { id: 'T1001', buyer: 'User123', seller: 'User456', item: 'iPhone 13', amount: 450, date: '2025-03-29T14:32:00Z' },
    { id: 'T1002', buyer: 'User789', seller: 'User234', item: 'Nike Air Max', amount: 120, date: '2025-03-29T13:45:00Z' },
    { id: 'T1003', buyer: 'User345', seller: 'User678', item: 'Sony Headphones', amount: 85, date: '2025-03-29T12:18:00Z' },
    { id: 'T1004', buyer: 'User567', seller: 'User890', item: 'Coffee Table', amount: 150, date: '2025-03-29T11:05:00Z' },
    { id: 'T1005', buyer: 'User901', seller: 'User123', item: 'Lego Set', amount: 65, date: '2025-03-29T10:22:00Z' }
  ]
};

// Dashboard component
const AdminDashboard = () => {
  const [tabValue, setTabValue] = useState(0);
  const [timeRange, setTimeRange] = useState('week');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(mockData);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Handle time range change
  const handleTimeRangeChange = (event) => {
    setTimeRange(event.target.value);
    // In a real implementation, this would trigger a new data fetch
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  // Handle pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Fetch data on component mount
  useEffect(() => {
    // In a real implementation, this would fetch data from the API
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <Container maxWidth="xl">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Admin Dashboard
        </Typography>
        
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="dashboard tabs">
            <Tab icon={<DashboardIcon />} label="Overview" />
            <Tab icon={<PeopleIcon />} label="Users" />
            <Tab icon={<ShoppingCartIcon />} label="Listings" />
            <Tab icon={<MoneyIcon />} label="Transactions" />
            <Tab icon={<TrendingUpIcon />} label="Analytics" />
          </Tabs>
          
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel id="time-range-label">Time Range</InputLabel>
            <Select
              labelId="time-range-label"
              id="time-range"
              value={timeRange}
              label="Time Range"
              onChange={handleTimeRangeChange}
            >
              <MenuItem value="day">Today</MenuItem>
              <MenuItem value="week">Last 7 Days</MenuItem>
              <MenuItem value="month">Last 30 Days</MenuItem>
              <MenuItem value="quarter">Last 90 Days</MenuItem>
            </Select>
          </FormControl>
        </Box>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 10 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Overview Tab */}
            {tabValue === 0 && (
              <>
                {/* Summary Cards */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card>
                      <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                          Active Users
                        </Typography>
                        <Typography variant="h5" component="div">
                          {data.summary.activeUsers.toLocaleString()}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {data.summary.newUsers} new today
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card>
                      <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                          New Listings
                        </Typography>
                        <Typography variant="h5" component="div">
                          {data.summary.newListings.toLocaleString()}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {data.summary.photoToPostUsage} using Photo to Post
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card>
                      <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                          Transactions
                        </Typography>
                        <Typography variant="h5" component="div">
                          {data.summary.completedTransactions.toLocaleString()}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          ${data.summary.averageOrderValue.toFixed(2)} avg. value
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card>
                      <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                          Total Sales
                        </Typography>
                        <Typography variant="h5" component="div">
                          ${data.summary.totalSales.toLocaleString()}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          This {timeRange}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
                
                {/* Charts */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                  <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="h6" gutterBottom>
                        User Activity
                      </Typography>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart
                          data={data.trends.users}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="activeUsers" stroke="#8884d8" name="Active Users" />
                          <Line type="monotone" dataKey="newUsers" stroke="#82ca9d" name="New Users" />
                        </LineChart>
                      </ResponsiveContainer>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="h6" gutterBottom>
                        Top Categories
                      </Typography>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={data.topCategories}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="count"
                          >
                            {data.topCategories.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </Paper>
                  </Grid>
                </Grid>
                
                {/* Recent Transactions */}
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Recent Transactions
                  </Typography>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>ID</TableCell>
                          <TableCell>Buyer</TableCell>
                          <TableCell>Seller</TableCell>
                          <TableCell>Item</TableCell>
                          <TableCell align="right">Amount</TableCell>
                          <TableCell>Date</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {data.recentTransactions.map((transaction) => (
                          <TableRow key={transaction.id}>
                            <TableCell>{transaction.id}</TableCell>
                            <TableCell>{transaction.buyer}</TableCell>
                            <TableCell>{transaction.seller}</TableCell>
                            <TableCell>{transaction.item}</TableCell>
                            <TableCell align="right">${transaction.amount}</TableCell>
                            <TableCell>{new Date(transaction.date).toLocaleString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={data.recentTransactions.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                  />
                </Paper>
              </>
            )}
            
            {/* Users Tab */}
            {tabValue === 1 && (
              <Typography variant="h6">
                User analytics content would go here
              </Typography>
            )}
            
            {/* Listings Tab */}
            {tabValue === 2 && (
              <Typography variant="h6">
                Listings analytics content would go here
              </Typography>
            )}
            
            {/* Transactions Tab */}
            {tabValue === 3 && (
              <Typography variant="h6">
                Transactions analytics content would go here
              </Typography>
            )}
            
            {/* Analytics Tab */}
            {tabValue === 4 && (
              <Typography variant="h6">
                Detailed analytics content would go here
              </Typography>
            )}
          </>
        )}
      </Box>
    </Container>
  );
};

export default AdminDashboard;
