import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { FaSearch, FaFilter, FaSortAmountDown, FaTimes } from "react-icons/fa";
import { FaPlaystation, FaXbox, FaSteam, FaWindows, FaGamepad, FaMobileAlt } from "react-icons/fa";
import { useLanguage } from "@/hooks/useLanguage";
import { type Product } from "@shared/schema";
import MainLayout from "@/components/MainLayout";
import Footer from "@/components/Footer";

const StorePage = () => {
  const { translate } = useLanguage();
  const [, params] = useLocation();
  
  // Get URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const platformParam = urlParams.get('platform');
  const saleParam = urlParams.get('sale') === 'true';
  const preorderParam = urlParams.get('preorder') === 'true';
  
  // States
  const [searchTerm, setSearchTerm] = useState("");
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(
    platformParam ? [platformParam] : []
  );
  const [showSaleOnly, setShowSaleOnly] = useState(saleParam);
  const [showNewOnly, setShowNewOnly] = useState(false);
  const [showPreOrdersOnly, setShowPreOrdersOnly] = useState(preorderParam);
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);
  
  // Fetch all products
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['/api/products'],
  });
  
  useEffect(() => {
    // Set page title
    document.title = "Sou9Digital - " + translate("store.title");
  }, [translate]);
  
  // Apply filters
  const filteredProducts = products.filter((product: Product) => {
    // Search term filter
    if (searchTerm && !product.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Price range filter
    const price =  product.price;
    if (price < priceRange[0] || price > priceRange[1]) {
      return false;
    }
    
    // Platform filter
    if (selectedPlatforms.length > 0) {
      const productPlatforms = product.platform.split(',').map(p => p.trim().toLowerCase());
      const hasMatchingPlatform = selectedPlatforms.some(platform => 
        productPlatforms.includes(platform.toLowerCase())
      );
      if (!hasMatchingPlatform) {
        return false;
      }
    }
    
    // Sale filter
    if (showSaleOnly && !product.isOnSale) {
      return false;
    }
    
    // New releases filter
    if (showNewOnly && !product.isNewRelease) {
      return false;
    }
    
    // Pre-order filter
    if (showPreOrdersOnly && !(product.isPreOrder === true)) {
      return false;
    }
    
    return true;
  });
  
  // Find max price in products for the slider
  const maxPrice = Math.max(...products.map((product: Product) => product.price), 1000);
  
  useEffect(() => {
    // Initialize price range once products are loaded
    if (products.length > 0 && priceRange[1] === 1000) {
      setPriceRange([0, maxPrice]);
    }
  }, [products, maxPrice, priceRange]);
  
  const togglePlatform = (platform: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };
  
  const resetFilters = () => {
    setSearchTerm("");
    setPriceRange([0, maxPrice]);
    setSelectedPlatforms([]);
    setShowSaleOnly(false);
    setShowNewOnly(false);
    setShowPreOrdersOnly(false);
  };
  
  // Fonction pour trier les produits
  const [sortOption, setSortOption] = useState("newest");
  
  const sortedAndFilteredProducts = useMemo(() => {
    let sorted = [...filteredProducts];
    
    switch(sortOption) {
      case "priceAsc":
        sorted.sort((a, b) => (a.discountedPrice || a.price) - (b.discountedPrice || b.price));
        break;
      case "priceDesc":
        sorted.sort((a, b) => (b.discountedPrice || b.price) - (a.discountedPrice || a.price));
        break;
      case "nameAsc":
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "nameDesc":
        sorted.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "newest":
      default:
        // On suppose que les plus récents ont des ID plus élevés ou une date plus récente
        sorted.sort((a, b) => b.id - a.id);
        break;
    }
    
    return sorted;
  }, [filteredProducts, sortOption]);
  
  const platforms = [
    { id: 'playstation', name: translate("platforms.playstation"), icon: <FaPlaystation /> },
    { id: 'xbox', name: translate("platforms.xbox"), icon: <FaXbox /> },
    { id: 'steam', name: translate("platforms.steam"), icon: <FaSteam /> },
    { id: 'pc', name: translate("platforms.pc"), icon: <FaWindows /> },
    { id: 'nintendo', name: translate("platforms.nintendo"), icon: <FaGamepad /> },
    { id: 'mobile', name: translate("platforms.mobile"), icon: <FaMobileAlt /> }
  ];
  
  return (
    <MainLayout>
      <div className="bg-[#0a0f1a] text-white">
        {/* Page Header */}
        <div className="bg-[#132743] py-20 px-4">
          <div className="container mx-auto">
            <h1 className="font-cairo font-bold text-4xl mb-4 text-center">{translate("store.title")}</h1>
            <p className="text-gray-400 text-center max-w-2xl mx-auto">{translate("store.subtitle")}</p>
          </div>
        </div>
        
        <div className="container mx-auto px-4 py-8">
          {/* Mobile Filter Button */}
          <div className="lg:hidden mb-4">
            <Button 
              onClick={() => setShowFiltersMobile(!showFiltersMobile)}
              className="w-full bg-[#132743] hover:bg-[#132743]/90 text-white border border-[#B8860B]"
            >
              {showFiltersMobile ? (
                <><FaTimes className="mr-2" /> {translate("store.hideFilters")}</>
              ) : (
                <><FaFilter className="mr-2" /> {translate("store.showFilters")}</>
              )}
            </Button>
          </div>
          
          <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
            {/* Filters Sidebar */}
            <div className={`${showFiltersMobile || window.innerWidth >= 1024 ? 'block' : 'hidden'} lg:block lg:w-1/4 bg-[#132743] rounded-[1.25rem] p-4 sm:p-6 h-fit sticky top-24`}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-cairo font-bold text-xl">{translate("store.filters")}</h2>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-sm border-[#B8860B] text-gray-400 hover:bg-[#B8860B] hover:text-white"
                  onClick={resetFilters}
                >
                  {translate("store.resetFilters")}
                </Button>
              </div>
              
              {/* Search */}
              <div className="mb-6">
                <Label htmlFor="search" className="text-gray-400 mb-2 block">{translate("store.search")}</Label>
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input 
                    id="search"
                    className="pl-10 bg-[#0a0f1a] border-[#B8860B] focus:border-primary"
                    placeholder={translate("store.searchPlaceholder")}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              {/* Price Range */}
              <div className="mb-6">
                <Label htmlFor="price-range" className="text-gray-400 mb-2 block">{translate("store.priceRange")}</Label>
                <Slider
                  id="price-range"
                  min={0}
                  max={maxPrice}
                  step={10}
                  value={priceRange}
                  onValueChange={setPriceRange}
                  className="my-4"
                />
                <div className="flex justify-between items-center">
                  <span className="text-primary font-cairo">{priceRange[0]} MAD</span>
                  <span className="text-primary font-cairo">{priceRange[1]} MAD</span>
                </div>
              </div>
              
              {/* Platforms */}
              <div className="mb-6">
                <h3 className="text-gray-400 mb-3">{translate("store.platforms")}</h3>
                <div className="space-y-2">
                  {platforms.map((platform) => (
                    <div key={platform.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`platform-${platform.id}`}
                        checked={selectedPlatforms.includes(platform.id)}
                        onCheckedChange={() => togglePlatform(platform.id)}
                        className="border-[#B8860B] data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                      <Label
                        htmlFor={`platform-${platform.id}`}
                        className="flex items-center cursor-pointer"
                      >
                        <span className="mr-2">{platform.icon}</span>
                        {platform.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Other Filters */}
              <div>
                <h3 className="text-gray-400 mb-3">{translate("store.otherFilters")}</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="sale-only"
                      checked={showSaleOnly}
                      onCheckedChange={() => setShowSaleOnly(!showSaleOnly)}
                      className="border-[#B8860B] data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <Label
                      htmlFor="sale-only"
                      className="cursor-pointer"
                    >
                      {translate("store.onSale")}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="new-only"
                      checked={showNewOnly}
                      onCheckedChange={() => setShowNewOnly(!showNewOnly)}
                      className="border-[#B8860B] data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <Label
                      htmlFor="new-only"
                      className="cursor-pointer"
                    >
                      {translate("store.newReleases")}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="preorder-only"
                      checked={showPreOrdersOnly}
                      onCheckedChange={() => setShowPreOrdersOnly(!showPreOrdersOnly)}
                      className="border-[#B8860B] data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <Label
                      htmlFor="preorder-only"
                      className="cursor-pointer"
                    >
                      {translate("store.preOrders") || "Précommandes"}
                    </Label>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Products Grid */}
            <div className="lg:w-3/4">
              {/* Results Summary */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-cairo font-bold text-xl">
                  {sortedAndFilteredProducts.length} {translate("store.resultsFound")}
                </h2>
                <div className="flex items-center">
                  <div className="relative w-60">
                    <select 
                      className="w-full appearance-none bg-[#101f38] border border-[#1e3a6a] rounded-full py-2 pl-4 pr-12 text-sm font-semibold shadow-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                      value={sortOption}
                      onChange={(e) => setSortOption(e.target.value)}
                    >
                      <option value="newest">{translate("store.sortNewest")}</option>
                      <option value="nameAsc">{translate("store.sortNameAsc")}</option>
                      <option value="nameDesc">{translate("store.sortNameDesc")}</option>
                      <option value="priceAsc">{translate("store.sortPriceAsc")}</option>
                      <option value="priceDesc">{translate("store.sortPriceDesc")}</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 bg-gradient-to-r from-transparent to-[#101f38] rounded-r-full">
                      <FaSortAmountDown className="text-primary" />
                    </div>
                    <div className="absolute inset-0 rounded-full border border-[#B8860B]/30 pointer-events-none"></div>
                  </div>
                </div>
              </div>
              
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-[#132743] rounded-[1.25rem] overflow-hidden shadow-lg animate-pulse">
                      <div className="w-full h-48 bg-gray-700" />
                      <div className="p-5">
                        <div className="h-7 bg-gray-700 rounded mb-2" />
                        <div className="h-16 bg-gray-700 rounded mb-4" />
                        <div className="flex justify-between items-center">
                          <div className="h-6 w-20 bg-gray-700 rounded" />
                          <div className="h-6 w-16 bg-gray-700 rounded" />
                        </div>
                        <div className="h-10 bg-gray-700 rounded mt-4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : sortedAndFilteredProducts.length === 0 ? (
                <div className="bg-[#132743] rounded-[1.25rem] p-8 text-center">
                  <h3 className="font-cairo font-bold text-2xl mb-4">{translate("store.noProducts")}</h3>
                  <p className="text-gray-400 mb-6">{translate("store.tryDifferentFilters")}</p>
                  <Button onClick={resetFilters} className="bg-primary hover:bg-primary/90 text-background">
                    {translate("store.resetFilters")}
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sortedAndFilteredProducts.map((product: Product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default StorePage;
