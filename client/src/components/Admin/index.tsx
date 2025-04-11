import { useState } from "react";
import { Link } from "wouter";
import { FaUsers, FaBoxOpen, FaShoppingCart, FaFileAlt, FaTags, FaChartBar, FaCreditCard, FaCog, FaTv } from "react-icons/fa";
import OrderManagement from "./OrderManagement";
import ProductManagement from "./ProductManagement";
import UserManagement from "./UserManagement";
import EditionManagement from "./EditionManagement";
import GiftCardManagement from "./GiftCardManagement";
import PromoCodeManagement from "./PromoCodeManagementV2";
import WalletManagement from "./WalletManagement";
import PromoSettings from "./PromoSettings";

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState("orders");

  const tabs = [
    { id: "orders", name: "Commandes", icon: <FaShoppingCart /> },
    { id: "products", name: "Produits", icon: <FaBoxOpen /> },
    { id: "editions", name: "Éditions", icon: <FaFileAlt /> },
    { id: "users", name: "Utilisateurs", icon: <FaUsers /> },
    { id: "gift-cards", name: "Cartes Cadeau", icon: <FaCreditCard /> },
    { id: "promo-codes", name: "Codes Promo", icon: <FaTags /> },
    { id: "wallet", name: "Transactions", icon: <FaChartBar /> },
    { id: "settings", name: "Paramètres", icon: <FaCog /> },
  ];

  const renderActiveTab = () => {
    switch (activeTab) {
      case "orders":
        return <OrderManagement />;
      case "products":
        return <ProductManagement />;
      case "editions":
        return <EditionManagement />;
      case "users":
        return <UserManagement />;
      case "gift-cards":
        return <GiftCardManagement />;
      case "promo-codes":
        return <PromoCodeManagement />;
      case "wallet":
        return <WalletManagement />;
      case "settings":
        return (
          <div className="space-y-6">
            <PromoSettings />
            {/* Autres paramètres peuvent être ajoutés ici */}
          </div>
        );
      default:
        return <OrderManagement />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Administration</h1>
          <p className="text-gray-400 mt-1">Gérez votre boutique Sou9Digital</p>
        </div>
        <Link href="/" className="flex items-center text-white hover:text-primary transition-colors">
          <FaTv className="mr-2" />
          <span>Voir le site</span>
        </Link>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar Navigation */}
        <div className="w-full md:w-64 bg-[#0c1c36] border border-[#1e3a6a] rounded-lg shadow-lg overflow-hidden">
          <div className="p-4 bg-gradient-to-r from-[#0c1c36] to-[#132743]">
            <h2 className="font-bold text-white">Tableau de bord</h2>
          </div>
          <nav className="p-2">
            <ul className="space-y-1">
              {tabs.map((tab) => (
                <li key={tab.id}>
                  <button
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-4 py-3 rounded-md transition-all duration-200 ${
                      activeTab === tab.id
                        ? "bg-primary text-white"
                        : "text-gray-300 hover:bg-[#132743] hover:text-white"
                    }`}
                  >
                    <span className="mr-3">{tab.icon}</span>
                    <span>{tab.name}</span>
                    {activeTab === tab.id && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white"></span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {renderActiveTab()}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;