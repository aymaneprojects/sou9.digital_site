import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FaShoppingCart, FaMoneyBill, FaUsers, FaGamepad, FaBoxOpen, FaChartLine, FaUserPlus } from "react-icons/fa";
import { Bar, BarChart, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend } from "recharts";
import { formatCurrency } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";

interface OrderStatus {
  status: string;
  count: number;
}

interface UserRole {
  role: string;
  count: number;
}

const Dashboard = () => {
  const { translate } = useLanguage();
  
  // Fetch orders
  const { data: orders = [] } = useQuery({
    queryKey: ['/api/orders'],
  });
  
  // Fetch products
  const { data: products = [] } = useQuery({
    queryKey: ['/api/products'],
  });
  
  // Fetch users
  const { data: users = [] } = useQuery({
    queryKey: ['/api/users'],
  });
  
  // Calculate stats
  const totalSales = orders.reduce((sum: number, order: any) => {
    if (order.paymentStatus === 'completed') {
      return sum + order.totalAmount;
    }
    return sum;
  }, 0);
  
  const pendingOrders = orders.filter((order: any) => order.status === 'pending').length;
  const totalProducts = products.length;
  const lowStockProducts = products.filter((product: any) => product.stock < 5).length;
  const totalUsers = users.length;
  const newUsers = users.filter((user: any) => {
    const createdDate = new Date(user.createdAt);
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return createdDate > oneWeekAgo;
  }).length;
  
  // Prepare order status data for chart
  const orderStatusData = orders.reduce((acc: { [key: string]: number }, order: any) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {});
  
  const chartData = Object.entries(orderStatusData).map(([status, count]) => ({
    status: status.charAt(0).toUpperCase() + status.slice(1),
    count
  }));
  
  // Recent orders
  const recentOrders = [...orders]
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);
  
  // Set page title when component mounts
  useEffect(() => {
    document.title = `${translate("admin.dashboard")} | Sou9Digital`;
  }, [translate]);

  return (
    <div className="space-y-6">
      <h1 className="font-cairo font-bold text-3xl text-white">
        {translate("admin.dashboard")}
      </h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 sm:gap-6">
        <Card className="bg-[#132743] text-white border-none shadow-md hover:shadow-lg transition-shadow lg:col-span-1 xl:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center text-primary">
              <FaMoneyBill className="mr-2" />
              {translate("admin.totalSales")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-cairo font-bold">{formatCurrency(totalSales)}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-[#132743] text-white border-none shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center text-[#E63946]">
              <FaShoppingCart className="mr-2" />
              {translate("admin.pendingOrders")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-cairo font-bold">{pendingOrders}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-[#132743] text-white border-none shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center text-primary">
              <FaGamepad className="mr-2" />
              {translate("admin.totalProducts")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-cairo font-bold">{totalProducts}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-[#132743] text-white border-none shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center text-[#E63946]">
              <FaBoxOpen className="mr-2" />
              {translate("admin.lowStock")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-cairo font-bold">{lowStockProducts}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-[#132743] text-white border-none shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center text-primary">
              <FaUsers className="mr-2" />
              {translate("admin.totalUsers") || "Utilisateurs"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-cairo font-bold">{totalUsers}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-[#132743] text-white border-none shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center text-[#E63946]">
              <FaUserPlus className="mr-2" />
              {translate("admin.newUsers") || "Nouveaux utilisateurs"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-cairo font-bold">{newUsers}</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-[#132743] text-white border-none shadow-md">
          <CardHeader>
            <CardTitle className="font-cairo flex items-center">
              <FaChartLine className="mr-2 text-primary" />
              {translate("admin.orderStatus")}
            </CardTitle>
            <CardDescription className="text-gray-400">
              {translate("admin.orderStatusDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-60 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#B8860B" opacity={0.2} />
                  <XAxis 
                    dataKey="status" 
                    stroke="#C0C0C0"
                    tick={{ fill: '#C0C0C0' }}
                  />
                  <YAxis
                    stroke="#C0C0C0"
                    tick={{ fill: '#C0C0C0' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#132743',
                      borderColor: '#B8860B',
                      color: '#FFFFFF'
                    }}
                    labelStyle={{ color: '#FFFFFF' }}
                  />
                  <Bar dataKey="count" fill="#FFD700" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-[#132743] text-white border-none shadow-md">
          <CardHeader>
            <CardTitle className="font-cairo flex items-center">
              <FaShoppingCart className="mr-2 text-primary" />
              {translate("admin.recentOrders")}
            </CardTitle>
            <CardDescription className="text-gray-400">
              {translate("admin.recentOrdersDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.length > 0 ? (
                recentOrders.map((order: any) => (
                  <div key={order.id} className="flex justify-between items-center p-3 bg-[#0a0f1a] rounded-[0.75rem] hover:border hover:border-[#B8860B] transition-all">
                    <div>
                      <p className="font-medium">Order #{order.id}</p>
                      <p className="text-sm text-gray-400">
                        {new Date(order.createdAt).toLocaleDateString()} - {order.firstName} {order.lastName}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-cairo font-bold text-primary">{formatCurrency(order.totalAmount)}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        order.status === 'pending' 
                          ? 'bg-yellow-900 text-yellow-300' 
                          : order.status === 'delivered'
                          ? 'bg-green-900 text-green-300'
                          : order.status === 'cancelled'
                          ? 'bg-red-900 text-red-300'
                          : 'bg-blue-900 text-blue-300'
                      }`}>
                        {order.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-400">{translate("admin.noOrders")}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
