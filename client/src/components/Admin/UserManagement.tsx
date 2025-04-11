import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/useLanguage";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// UI Components
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  FaEdit, 
  FaTrash, 
  FaSearch, 
  FaUserPlus, 
  FaWallet,
  FaMoneyBill,
  FaUser,
  FaEnvelope,
  FaIdCard,
  FaCalendarAlt
} from "react-icons/fa";

// Type for User from the API
interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  firstName: string | null;
  lastName: string | null;
  phoneNumber: string | null;
  createdAt: string;
  walletBalance?: number;
}

// Schema for form validation
const userSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  phoneNumber: z.string().optional().nullable(),
  role: z.string(),
});

// Schema for wallet transactions
const walletTransactionSchema = z.object({
  amount: z.coerce.number().min(1, "Amount must be at least 1"),
  type: z.enum(["deposit", "withdrawal", "cashback", "payment", "refund"]),
  description: z.string().min(3, "Description must be at least 3 characters"),
  status: z.enum(["pending", "completed", "failed", "cancelled"]),
});

const UserManagement = () => {
  const { translate } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Form for editing users
  const form = useForm<z.infer<typeof userSchema>>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      phoneNumber: "",
      role: "customer",
    },
  });

  // Create wallet transaction form
  const walletTransactionForm = useForm<z.infer<typeof walletTransactionSchema>>({
    resolver: zodResolver(walletTransactionSchema),
    defaultValues: {
      amount: 0,
      type: "deposit",
      description: "",
      status: "completed"
    },
  });

  // Fetch users
  const { data: users = [], isLoading, refetch } = useQuery({
    queryKey: ["/api/users"],
    retry: 3,
    retryDelay: 1000,
    staleTime: 60000,
    queryFn: async () => {
      try {
        // Ajouter des en-têtes personnalisés explicites pour garantir l'authentification admin
        const customHeaders: Record<string, string> = {
          'X-User-Id': localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') || '{}').id.toString() : '',
          'X-User-Role': 'admin',
          'X-Admin-Request': 'true'
        };
        
        const response = await apiRequest("GET", "/api/users", undefined, customHeaders);
        const data = await response.json();
        return data as User[];
      } catch (error) {
        console.error("Error fetching users:", error);
        throw error;
      }
    },
  });

  // Filtered users based on search term
  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.firstName &&
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.lastName &&
        user.lastName.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  // Create wallet transaction mutation
  const createWalletTransactionMutation = useMutation({
    mutationFn: async (
      transactionData: z.infer<typeof walletTransactionSchema> & { userId: number }
    ) => {
      const headers: Record<string, string> = {
        'X-User-Id': localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') || '{}').id.toString() : '',
        'X-User-Role': 'admin'
      };
      
      const response = await apiRequest(
        "POST", 
        "/api/wallet/transactions", 
        { ...transactionData, adminRequest: true },
        headers
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: translate("admin.success"),
        description: translate("admin.walletTransactionProcessed"),
      });
      setIsWalletModalOpen(false);
      walletTransactionForm.reset({
        amount: 0,
        type: "deposit",
        description: "",
        status: "completed"
      });
    },
    onError: (error) => {
      toast({
        title: translate("admin.error"),
        description: `${translate("admin.walletTransactionError")}: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async (
      userData: z.infer<typeof userSchema> & { id: number },
    ) => {
      const { id, ...rest } = userData;
      const payload = { ...rest, adminRequest: true };

      const headers: Record<string, string> = {
        'X-User-Id': localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') || '{}').id.toString() : '',
        'X-User-Role': 'admin'
      };

      const response = await apiRequest("PUT", `/api/users/${id}`, payload, headers);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: translate("admin.success"),
        description: translate("admin.userUpdated"),
      });
      setIsEditModalOpen(false);
    },
    onError: (error) => {
      toast({
        title: translate("admin.error"),
        description: `${translate("admin.updateUserError")}: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (userData: z.infer<typeof userSchema>) => {
      const headers: Record<string, string> = {
        'X-User-Id': localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') || '{}').id.toString() : '',
        'X-User-Role': 'admin'
      };
      
      const payload = { ...userData, adminRequest: true };
      
      const response = await apiRequest("POST", "/api/auth/register", payload, headers);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: translate("admin.success"),
        description: translate("admin.userAdded"),
      });
      setIsEditModalOpen(false);
      form.reset({
        username: "",
        email: "",
        password: "",
        firstName: "",
        lastName: "",
        phoneNumber: "",
        role: "customer",
      });
    },
    onError: (error) => {
      toast({
        title: translate("admin.error"),
        description: `${translate("admin.addUserError")}: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (id: number) => {
      const headers: Record<string, string> = {
        'X-User-Id': localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') || '{}').id.toString() : '',
        'X-User-Role': 'admin'
      };

      await apiRequest("DELETE", `/api/users/${id}`, undefined, headers);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: translate("admin.success"),
        description: translate("admin.userDeleted"),
      });
    },
    onError: (error) => {
      toast({
        title: translate("admin.error"),
        description: `${translate("admin.deleteUserError")}: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Handle opening edit modal
  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    form.reset({
      username: user.username,
      email: user.email,
      password: "", // Don't include password in edit form
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      role: user.role,
    });
    setIsEditModalOpen(true);
  };

  // Handle opening wallet transaction modal
  const handleWalletTransaction = (user: User) => {
    setSelectedUser(user);
    walletTransactionForm.reset({
      amount: 0,
      type: "deposit",
      description: "",
      status: "completed"
    });
    setIsWalletModalOpen(true);
  };

  // Handle delete user
  const handleDeleteUser = (id: number, userRole: string) => {
    // Empêcher la suppression des comptes admin
    if (userRole === 'admin') {
      toast({
        title: translate("admin.actionNotAllowed"),
        description: translate("admin.cannotDeleteAdmin"),
        variant: "destructive",
      });
      return;
    }
    
    // Pour les comptes non-admin, confirmer la suppression
    if (window.confirm(translate("admin.confirmDeleteUser"))) {
      deleteUserMutation.mutate(id);
    }
  };

  // Handle wallet form submission
  const onWalletSubmit = async (values: z.infer<typeof walletTransactionSchema>) => {
    if (!selectedUser) {
      toast({
        title: translate("admin.error"),
        description: translate("admin.noUserSelected"),
        variant: "destructive",
      });
      return;
    }

    try {
      createWalletTransactionMutation.mutate({ 
        ...values, 
        userId: selectedUser.id 
      });
    } catch (error: any) {
      toast({
        title: translate("admin.error"),
        description: error.message || translate("admin.walletTransactionError"),
        variant: "destructive",
      });
    }
  };

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof userSchema>) => {
    // Create a clean data object
    const userData: any = { ...values };

    // Add flag for admin requests to bypass role protection in API
    userData.adminRequest = true;

    try {
      if (selectedUser) {
        // Update existing user
        // If password is empty, remove it from the request
        if (userData.password === "") {
          delete userData.password;
        }
        updateUserMutation.mutate({ ...userData, id: selectedUser.id });
      } else {
        // Create new user
        // For new users, password is required
        if (!userData.password) {
          toast({
            title: translate("admin.error"),
            description: translate("admin.passwordRequired"),
            variant: "destructive",
          });
          return;
        }
        createUserMutation.mutate(userData);
      }
    } catch (error: any) {
      toast({
        title: translate("admin.error"),
        description: error.message || translate("admin.processingError"),
        variant: "destructive",
      });
    }
  };

  // Helper to get role badge color
  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-900/50 text-red-200';
      case 'manager':
        return 'bg-blue-900/50 text-blue-200';
      default:
        return 'bg-green-900/50 text-green-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
        <h1 className="font-cairo font-bold text-2xl sm:text-3xl text-white">
          {translate("admin.users")}
        </h1>
        <Button
          onClick={() => {
            setSelectedUser(null);
            form.reset({
              username: "",
              email: "",
              password: "",
              firstName: "",
              lastName: "",
              phoneNumber: "",
              role: "customer",
            });
            setIsEditModalOpen(true);
          }}
          className="bg-primary hover:bg-primary/90 text-background"
        >
          <FaUserPlus className="mr-2" />
          {translate("admin.addUser")}
        </Button>
      </div>
      
      <div className="bg-[#132743] rounded-[0.75rem] p-4">
        <div className="relative mb-4">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input 
            className="pl-10 bg-[#0a0f1a] border-[#B8860B] focus:border-primary"
            placeholder={translate("admin.searchUsers")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {isLoading ? (
          <div className="text-center py-10">
            <svg className="animate-spin h-8 w-8 text-primary mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-gray-400 mt-2">{translate("admin.loadingUsers")}</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-6 bg-[#0a0f1a] border border-[#1d3a56] rounded-md">
            <FaUser className="mx-auto text-4xl text-gray-500 mb-2" />
            <p className="text-gray-400">
              {searchTerm 
                ? translate("admin.noUsersFound") 
                : translate("admin.noUsers")}
            </p>
          </div>
        ) : (
          <>
            {/* Vue mobile - cartes pour petits écrans */}
            <div className="md:hidden space-y-4">
              {filteredUsers.map((user) => (
                <div key={user.id} className="bg-[#0a0f1a] rounded-lg overflow-hidden border border-[#1d3a56]">
                  <div className="flex items-center p-3 bg-[#132743] border-b border-[#1d3a56]">
                    <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 mr-3 bg-primary/20 flex items-center justify-center">
                      <FaUser className="text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-white">{user.username}</div>
                      <div className="text-sm text-gray-400 flex items-center">
                        <FaEnvelope className="mr-1" size={12} />
                        <span className="truncate">{user.email}</span>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${getRoleBadgeClass(user.role)}`}>
                      {user.role}
                    </span>
                  </div>
                  
                  <div className="p-3 space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-400 flex items-center">
                        <FaIdCard className="mr-1" size={14} />
                        <span>{user.firstName} {user.lastName}</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-400 flex items-center">
                        <FaWallet className="mr-1" size={14} />
                        <span>{translate("admin.wallet")}:</span>
                      </div>
                      <span className="text-yellow-400 font-medium">
                        {user.walletBalance?.toFixed(2) || "0.00"} MAD
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-400 flex items-center">
                        <FaCalendarAlt className="mr-1" size={14} />
                        <span>{translate("admin.registered")}:</span>
                      </div>
                      <span className="text-gray-300">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex border-t border-[#1d3a56]">
                    <Button 
                      variant="ghost" 
                      className="flex-1 rounded-none h-10 text-blue-500 hover:bg-blue-900 hover:text-blue-300"
                      onClick={() => handleEditUser(user)}
                    >
                      <FaEdit className="mr-1" />
                      {translate("admin.edit")}
                    </Button>
                    <div className="w-px bg-[#1d3a56]"></div>
                    <Button 
                      variant="ghost" 
                      className="flex-1 rounded-none h-10 text-yellow-500 hover:bg-yellow-900 hover:text-yellow-300"
                      onClick={() => handleWalletTransaction(user)}
                    >
                      <FaMoneyBill className="mr-1" />
                      {translate("admin.wallet")}
                    </Button>
                    <div className="w-px bg-[#1d3a56]"></div>
                    <Button 
                      variant="ghost" 
                      className="flex-1 rounded-none h-10 text-red-500 hover:bg-red-900 hover:text-red-300"
                      onClick={() => handleDeleteUser(user.id, user.role)}
                      disabled={user.role === 'admin'}
                    >
                      <FaTrash className="mr-1" />
                      {translate("admin.delete")}
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Vue desktop - tableau pour grands écrans */}
            <div className="hidden md:block overflow-hidden w-full">
              <div className="w-full overflow-x-auto">
                <Table className="w-full table-fixed">
                  <TableHeader className="bg-[#0a0f1a]">
                    <TableRow>
                      <TableHead className="text-primary w-[5%]">ID</TableHead>
                      <TableHead className="text-primary w-[12%]">{translate("admin.username")}</TableHead>
                      <TableHead className="text-primary w-[18%]">{translate("admin.email")}</TableHead>
                      <TableHead className="text-primary w-[15%]">{translate("admin.fullName")}</TableHead>
                      <TableHead className="text-primary w-[10%]">{translate("admin.role")}</TableHead>
                      <TableHead className="text-primary w-[12%]">{translate("admin.wallet")}</TableHead>
                      <TableHead className="text-primary w-[13%]">{translate("admin.registered")}</TableHead>
                      <TableHead className="text-primary w-[15%] text-right">{translate("admin.actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow
                        key={user.id}
                        className="border-b border-[#B8860B]/20 hover:bg-[#0a0f1a]/30"
                      >
                        <TableCell className="w-[5%]">{user.id}</TableCell>
                        <TableCell className="w-[12%] truncate">{user.username}</TableCell>
                        <TableCell className="w-[18%] truncate">{user.email}</TableCell>
                        <TableCell className="w-[15%] truncate">
                          {user.firstName} {user.lastName}
                        </TableCell>
                        <TableCell className="w-[10%]">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${getRoleBadgeClass(user.role)}`}
                          >
                            {user.role}
                          </span>
                        </TableCell>
                        <TableCell className="w-[12%]">
                          <span className="text-yellow-400 font-medium">
                            {user.walletBalance?.toFixed(2) || "0.00"} MAD
                          </span>
                        </TableCell>
                        <TableCell className="w-[13%]">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="w-[15%] text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-primary hover:text-primary/80 hover:bg-[#B8860B]/10"
                              onClick={() => handleEditUser(user)}
                            >
                              <FaEdit />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-yellow-500 hover:text-yellow-400 hover:bg-yellow-900/20"
                              onClick={() => handleWalletTransaction(user)}
                            >
                              <FaWallet />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-[#E63946] hover:text-[#E63946]/80 hover:bg-[#E63946]/10"
                              onClick={() => handleDeleteUser(user.id, user.role)}
                              disabled={user.role === 'admin'}
                            >
                              <FaTrash />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Edit User Dialog */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="bg-[#132743] text-white border-[#B8860B] max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-cairo text-2xl">
              {selectedUser ? translate("admin.editUser") : translate("admin.addUser")}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {translate("admin.userFormDescription")}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{translate("admin.username")}</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        className="bg-[#0a0f1a] border-[#B8860B] text-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{translate("admin.email")}</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="email" 
                        className="bg-[#0a0f1a] border-[#B8860B] text-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {selectedUser 
                        ? `${translate("admin.password")} (${translate("admin.leaveEmptyIfUnchanged")})`
                        : translate("admin.password")}
                    </FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="password" 
                        className="bg-[#0a0f1a] border-[#B8860B] text-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{translate("admin.firstName")}</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          value={field.value || ''}
                          className="bg-[#0a0f1a] border-[#B8860B] text-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{translate("admin.lastName")}</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          value={field.value || ''}
                          className="bg-[#0a0f1a] border-[#B8860B] text-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{translate("admin.phone")}</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        value={field.value || ''}
                        className="bg-[#0a0f1a] border-[#B8860B] text-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{translate("admin.role")}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-[#0a0f1a] border-[#B8860B] text-white">
                          <SelectValue placeholder={translate("admin.selectRole")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-[#0a0f1a] border-[#B8860B] text-white">
                        <SelectItem value="customer">{translate("admin.customer")}</SelectItem>
                        <SelectItem value="manager">{translate("admin.manager")}</SelectItem>
                        <SelectItem value="admin">{translate("admin.admin")}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter className="flex justify-between sm:justify-between mt-6">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditModalOpen(false)}
                  className="border-[#E63946] text-[#E63946] hover:bg-[#E63946] hover:text-white"
                >
                  {translate("admin.cancel")}
                </Button>
                
                <Button 
                  type="submit" 
                  className="bg-primary hover:bg-primary/90 text-background"
                  disabled={updateUserMutation.isPending || createUserMutation.isPending}
                >
                  {(updateUserMutation.isPending || createUserMutation.isPending) ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {translate("admin.saving")}
                    </span>
                  ) : (
                    selectedUser ? translate("admin.saveChanges") : translate("admin.createUser")
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Wallet Transaction Dialog */}
      <Dialog open={isWalletModalOpen} onOpenChange={setIsWalletModalOpen}>
        <DialogContent className="bg-[#132743] text-white border-[#B8860B] max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-cairo text-2xl">
              {translate("admin.manageWallet")}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {selectedUser && (
                <span>
                  {translate("admin.userWallet")}: <span className="text-primary font-bold">{selectedUser.username}</span>
                  <div className="mt-1 text-yellow-400 font-bold text-lg">
                    {selectedUser.walletBalance?.toFixed(2) || "0.00"} MAD
                  </div>
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...walletTransactionForm}>
            <form onSubmit={walletTransactionForm.handleSubmit(onWalletSubmit)} className="space-y-4">
              <FormField
                control={walletTransactionForm.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{translate("admin.amount")}</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="number"
                        min="0"
                        step="0.01"
                        className="bg-[#0a0f1a] border-[#B8860B] text-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={walletTransactionForm.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{translate("admin.transactionType")}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-[#0a0f1a] border-[#B8860B] text-white">
                          <SelectValue placeholder={translate("admin.selectTransactionType")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-[#0a0f1a] border-[#B8860B] text-white">
                        <SelectItem value="deposit">{translate("admin.deposit")}</SelectItem>
                        <SelectItem value="withdrawal">{translate("admin.withdrawal")}</SelectItem>
                        <SelectItem value="cashback">{translate("admin.cashback")}</SelectItem>
                        <SelectItem value="payment">{translate("admin.payment")}</SelectItem>
                        <SelectItem value="refund">{translate("admin.refund")}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={walletTransactionForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{translate("admin.description")}</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        className="bg-[#0a0f1a] border-[#B8860B] text-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={walletTransactionForm.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{translate("admin.status")}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-[#0a0f1a] border-[#B8860B] text-white">
                          <SelectValue placeholder={translate("admin.selectStatus")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-[#0a0f1a] border-[#B8860B] text-white">
                        <SelectItem value="completed">{translate("admin.completed")}</SelectItem>
                        <SelectItem value="pending">{translate("admin.pending")}</SelectItem>
                        <SelectItem value="failed">{translate("admin.failed")}</SelectItem>
                        <SelectItem value="cancelled">{translate("admin.cancelled")}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter className="flex justify-between sm:justify-between mt-6">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsWalletModalOpen(false)}
                  className="border-[#E63946] text-[#E63946] hover:bg-[#E63946] hover:text-white"
                >
                  {translate("admin.cancel")}
                </Button>
                
                <Button 
                  type="submit" 
                  className="bg-primary hover:bg-primary/90 text-background"
                  disabled={createWalletTransactionMutation.isPending}
                >
                  {createWalletTransactionMutation.isPending ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {translate("admin.processing")}
                    </span>
                  ) : (
                    translate("admin.processTransaction")
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;