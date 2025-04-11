import { useState, ReactNode, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  FaTachometerAlt,
  FaBoxOpen,
  FaShoppingCart,
  FaUser,
  FaHome,
  FaBars,
  FaTimes,
  FaTags,
  FaGift,
  FaGamepad,
  FaWallet,
  FaCog,
  FaBell,
  FaInfoCircle,
  FaMoon,
  FaSun,
  FaChartBar,
} from "react-icons/fa";
import { useAuth } from "@/context/LocalAuthContext";
import { useLanguage } from "@/hooks/useLanguage";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { user, logout, isAdmin, isManager, isAdminOrManager } = useAuth();
  const { translate } = useLanguage();
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<number>(3); // exemple de notifications
  const [darkMode, setDarkMode] = useState<boolean>(
    localStorage.getItem("admin-theme-mode") === "light" ? false : true,
  );
  const [notificationItems, setNotificationItems] = useState<
    Array<{ id: number; text: string; read: boolean }>
  >([
    { id: 1, text: "Nouvelle commande #1234", read: false },
    { id: 2, text: "Paiement confirmé pour la commande #1145", read: false },
    { id: 3, text: "Nouveau message de support", read: false },
  ]);

  useEffect(() => {
    // Chargement du thème depuis le localStorage au démarrage
    document.documentElement.classList.toggle("dark-mode", darkMode);

    // Compter les notifications non lues
    const unreadCount = notificationItems.filter((item) => !item.read).length;
    setNotifications(unreadCount);
  }, [notificationItems]);

  // Éléments communs pour admin et manager
  const commonItems = [
    {
      name: translate("admin.dashboard") || "Dashboard",
      path: "/admin",
      icon: <FaTachometerAlt className="mr-3" />,
      badge: notifications > 0 ? notifications : undefined,
    },
    {
      name: translate("admin.products") || "Products",
      path: "/admin/products",
      icon: <FaBoxOpen className="mr-3" />,
    },
    {
      name: translate("admin.editions") || "Editions",
      path: "/admin/editions",
      icon: <FaGamepad className="mr-3" />,
    },
    {
      name: translate("admin.orders") || "Orders",
      path: "/admin/orders",
      icon: <FaShoppingCart className="mr-3" />,
      badge: 2,
    },
    {
      name: translate("admin.ordersValidation") || "Orders Validation",
      path: "/admin/orders/validation",
      icon: <FaShoppingCart className="mr-3" />,
      badge: 1,
    },
  ];

  // Éléments uniquement accessibles aux admins
  const adminOnlyItems = [
    {
      name: translate("admin.users") || "Users",
      path: "/admin/users",
      icon: <FaUser className="mr-3" />,
    },
    {
      name: translate("admin.promos") || "Promo Codes",
      path: "/admin/promo-codes",
      icon: <FaTags className="mr-3" />,
    },
  ];

  // Combine les éléments selon le rôle de l'utilisateur
  const navigationItems = isAdmin
    ? [...commonItems, ...adminOnlyItems]
    : commonItems;

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("admin-theme-mode", newMode ? "dark" : "light");
    document.documentElement.classList.toggle("dark-mode", newMode);
  };

  const markNotificationAsRead = (id: number) => {
    setNotificationItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, read: true } : item)),
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotificationItems((prev) =>
      prev.map((item) => ({ ...item, read: true })),
    );
  };

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-white">
      {/* Top Navigation */}
      <header className="bg-[#132743] py-3 px-2 sm:px-4 border-b border-[#B8860B] sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <button
              className="md:hidden text-white hover:text-primary mr-3"
              onClick={toggleSidebar}
            >
              {sidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
            </button>
            <Link href="/admin" className="flex items-center">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center mr-2">
                <span className="font-cairo font-bold text-background text-sm">
                  S9
                </span>
              </div>
              <span className="font-cairo font-bold text-xl text-primary">
                Sou9<span className="text-white hidden sm:inline">Digital</span>
              </span>
            </Link>
          </div>

          <div className="flex items-center space-x-1 sm:space-x-3">
            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="relative border-[#B8860B] text-white hover:bg-[#B8860B] h-8 w-8"
                >
                  <FaBell className="h-4 w-4" />
                  {notifications > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white">
                      {notifications}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-72 bg-[#132743] border border-[#B8860B]">
                <DropdownMenuLabel className="text-white">
                  Notifications
                  {notifications > 0 && (
                    <Button
                      variant="link"
                      size="sm"
                      className="text-xs text-primary float-right p-0 h-auto"
                      onClick={markAllNotificationsAsRead}
                    >
                      Tout marquer comme lu
                    </Button>
                  )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-[#B8860B]" />
                {notificationItems.length > 0 ? (
                  notificationItems.map((item) => (
                    <DropdownMenuItem
                      key={item.id}
                      className={`py-2 text-sm ${item.read ? "text-gray-400" : "text-white"}`}
                    >
                      <div className="flex justify-between w-full">
                        <span className="flex-1">{item.text}</span>
                        {!item.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-5 p-0 ml-2 text-primary"
                            onClick={() => markNotificationAsRead(item.id)}
                          >
                            Lire
                          </Button>
                        )}
                      </div>
                    </DropdownMenuItem>
                  ))
                ) : (
                  <DropdownMenuItem
                    disabled
                    className="text-center text-gray-400 py-4"
                  >
                    Aucune notification
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Dark Mode Toggle */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="border-[#B8860B] text-white hover:bg-[#B8860B] h-8 w-8"
                    onClick={toggleDarkMode}
                  >
                    {darkMode ? (
                      <FaMoon className="h-4 w-4" />
                    ) : (
                      <FaSun className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{darkMode ? "Mode clair" : "Mode sombre"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* View Store Button - Only show on tablet and larger */}
            <Button
              asChild
              variant="outline"
              size="sm"
              className="border-[#B8860B] text-white hover:bg-[#B8860B] hidden sm:flex"
            >
              <Link href="/">
                <FaHome className="mr-2" />
                {"View Store"}
              </Link>
            </Button>

            {/* Mobile Store Link */}
            <Button
              asChild
              variant="outline"
              size="icon"
              className="border-[#B8860B] text-white hover:bg-[#B8860B] sm:hidden h-8 w-8"
            >
              <Link href="/">
                <FaHome className="h-4 w-4" />
              </Link>
            </Button>

            {/* User Profile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-2 cursor-pointer">
                  <Avatar className="h-8 w-8 border border-[#B8860B]">
                    <AvatarFallback className="bg-primary text-background">
                      {user?.firstName?.charAt(0) || user?.email?.charAt(0) || "A"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:flex flex-col">
                    <span className="text-sm font-medium">
                      {user?.firstName || user?.email}
                    </span>
                    <span className="text-xs text-gray-400">
                      {isAdmin ? "Admin" : isManager ? "Manager" : "User"}
                    </span>
                  </div>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-[#132743] border-[#B8860B]">
                <DropdownMenuLabel>Mon Compte</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-[#B8860B]" />
                <DropdownMenuItem onClick={logout} className="text-red-500">
                  <FaTimes className="mr-2" /> {"Logout"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="container mx-auto px-2 sm:px-4 flex flex-col md:flex-row flex-grow overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`
          ${sidebarOpen ? "fixed inset-0 z-50 bg-[#0a0f1a] pt-16 w-72 max-w-[80%]" : "hidden"} 
          md:block md:static md:pt-0 md:bg-transparent md:z-auto
          md:w-64 border-r border-[#B8860B] 
          transition-all duration-300 ease-in-out md:h-[calc(100vh-57px)] overflow-y-auto
        `}
        >
          <nav className="py-6 px-4">
            <ul className="space-y-2">
              {navigationItems.map((item) => (
                <li key={item.path}>
                  <Link
                    href={item.path}
                    className={`
                      flex items-center justify-between py-3 px-3 rounded-md transition-colors
                      ${
                        location === item.path
                          ? "bg-primary text-background"
                          : "text-white hover:bg-[#0a0f1a] hover:text-primary"
                      }
                    `}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <div className="flex items-center">
                      {item.icon}
                      <span className="text-base md:text-sm">
                        {typeof item.name === "string" ? item.name : "Menu Item"}
                      </span>
                    </div>
                    {item.badge && (
                      <Badge className="bg-red-500 text-white">
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                </li>
              ))}
            </ul>

            <Separator className="my-6 bg-[#B8860B] opacity-50" />

            {/* Quick Tips - Hide on mobile */}
            <div className="p-4 bg-[#1a2235] border border-[#B8860B]/30 rounded-md shadow-inner hidden md:block">
              <div className="flex items-center mb-3">
                <FaInfoCircle className="mr-2 text-primary" />
                <h3 className="font-cairo font-bold">{"Quick Tips"}</h3>
              </div>
              <p className="text-sm text-gray-400">
                {
                  "Use the navigation menu to manage your store. Items with badges require your attention."
                }
              </p>

              <div className="mt-4 pt-4 border-t border-[#B8860B]/20">
                <div className="flex items-center text-sm mb-2">
                  <FaChartBar className="text-primary mr-2" />
                  <span className="text-gray-300">{"Today's Stats"}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-[#0a0f1a]/60 rounded p-2">
                    <div className="text-gray-400">Orders</div>
                    <div className="text-white font-bold">2</div>
                  </div>
                  <div className="bg-[#0a0f1a]/60 rounded p-2">
                    <div className="text-gray-400">Revenue</div>
                    <div className="text-white font-bold">$950</div>
                  </div>
                </div>
              </div>
            </div>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col md:h-[calc(100vh-57px)] overflow-hidden">
          <div className="flex-1 overflow-y-auto p-1 md:p-4 md:pr-6 pb-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
