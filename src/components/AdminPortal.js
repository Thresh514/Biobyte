import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Image from 'next/image';

const AdminPortalComponent = () => {
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState([]);
    const [resources, setResources] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [membershipType, setMembershipType] = useState("premium");
    const [membershipDays, setMembershipDays] = useState(30);
    const [selectedResourceId, setSelectedResourceId] = useState("");
    const [message, setMessage] = useState({ type: "", text: "" });
    const [activeTab, setActiveTab] = useState("membership");
    const router = useRouter();

    useEffect(() => {
        verifyAdmin();
        loadResources();
    }, []);

    const verifyAdmin = async () => {
        try {
            const response = await fetch("/api/admin/verify", {
                method: "GET",
                credentials: 'include', // 发送cookie
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (response.ok) {
                const data = await response.json();
                if (data.isAdmin) {
                    setIsAdmin(true);
                } else {
                    setMessage({ type: "error", text: "Access denied. Admin role required." });
                    setTimeout(() => router.push("/dashboard"), 2000);
                }
            } else {
                setMessage({ type: "error", text: "Authentication failed." });
                setTimeout(() => router.push("/login"), 2000);
            }
        } catch (error) {
            console.error("Admin verify error:", error);
            setMessage({ type: "error", text: "Error verifying admin access." });
        } finally {
            setLoading(false);
        }
    };

    const loadResources = async () => {
        try {
            const response = await fetch("/api/admin/resources", {
                method: "GET",
                credentials: 'include', // 发送cookie
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (response.ok) {
                const data = await response.json();
                setResources(data);
            }
        } catch (error) {
            console.error("Load resources error:", error);
        }
    };

    const searchUsers = async () => {
        if (!searchQuery.trim()) {
            setUsers([]);
            setSelectedUser(null);
            return;
        }

        try {
            const response = await fetch(`/api/admin/users?search=${encodeURIComponent(searchQuery)}`, {
                method: "GET",
                credentials: 'include', // 发送cookie
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (response.ok) {
                const data = await response.json();
                setUsers(data);
                if (data.length === 1) {
                    setSelectedUser(data[0]);
                } else {
                    setSelectedUser(null);
                }
            }
        } catch (error) {
            console.error("Search users error:", error);
            setMessage({ type: "error", text: "Error searching users" });
        }
    };

    const handleGrantMembership = async () => {
        if (!selectedUser) {
            setMessage({ type: "error", text: "Please select a user first" });
            return;
        }

        if (membershipType === "premium" && (!membershipDays || membershipDays <= 0)) {
            setMessage({ type: "error", text: "Please enter a valid number of days" });
            return;
        }

        try {
            const response = await fetch("/api/admin/grant-membership", {
                method: "POST",
                credentials: 'include', // 发送cookie
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    userId: selectedUser.id,
                    userEmail: selectedUser.email,
                    membershipType: membershipType,
                    days: membershipType === "premium" ? membershipDays : null,
                }),
            });

            const data = await response.json();
            if (response.ok) {
                setMessage({ 
                    type: "success", 
                    text: `Successfully granted ${membershipType === "premium" ? `${membershipDays}-day Premium` : "Lifetime"} membership to ${selectedUser.email}` 
                });
                setTimeout(() => {
                    setMessage({ type: "", text: "" });
                }, 3000);
            } else {
                setMessage({ type: "error", text: data.message || "Failed to grant membership" });
            }
        } catch (error) {
            console.error("Grant membership error:", error);
            setMessage({ type: "error", text: "Error granting membership" });
        }
    };

    const handleGrantResource = async () => {
        if (!selectedUser) {
            setMessage({ type: "error", text: "Please select a user first" });
            return;
        }

        if (!selectedResourceId) {
            setMessage({ type: "error", text: "Please select a resource first" });
            return;
        }

        try {
            const response = await fetch("/api/admin/grant-resource", {
                method: "POST",
                credentials: 'include', // 发送cookie
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    userId: selectedUser.id,
                    userEmail: selectedUser.email,
                    resourceId: parseInt(selectedResourceId),
                }),
            });

            const data = await response.json();
            if (response.ok) {
                const resource = resources.find(r => r.id === parseInt(selectedResourceId));
                setMessage({ 
                    type: "success", 
                    text: `Successfully granted resource "${resource?.title || selectedResourceId}" to ${selectedUser.email}` 
                });
                setSelectedResourceId("");
                setTimeout(() => {
                    setMessage({ type: "", text: "" });
                }, 3000);
            } else {
                setMessage({ type: "error", text: data.message || "Failed to grant resource" });
            }
        } catch (error) {
            console.error("Grant resource error:", error);
            setMessage({ type: "error", text: "Error granting resource" });
        }
    };

    if (loading) {
        return (
            <div className="w-full h-screen flex justify-center items-center">
                <p className="text-lg font-light">Verifying admin access...</p>
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div className="w-full h-screen flex justify-center items-center">
                <p className="text-lg text-red-500 font-light">{message.text || "Access denied"}</p>
            </div>
        );
    }

    return (
        <div className="w-full h-full">
            <div className="relative h-[500px]">
                <Image 
                    src="/dashboardbg4-compress.jpg" 
                    alt="adminbg" 
                    fill
                    quality={80}
                    priority
                    className="object-cover"
                />
                <p className="absolute bottom-0 left-8 text-4xl text-black md:text-7xl tracking-wide">ADMIN PORTAL</p>
            </div>

            {/* Message notification */}
            {message.text && (
                <div className={`px-4 md:px-24 pt-8 ${message.type === "success" ? "text-green-600" : "text-red-600"}`}>
                    <p className="text-sm font-light">{message.text}</p>
                </div>
            )}

            {/* Mobile design */}
            <div className="block md:hidden px-4 pt-12 mt-12 space-y-24">
                {/* User Search - Mobile */}
                <div className="bg-white mb-8 pb-6">
                    <h2 className="text-xl font-medium mb-4">User Search</h2>
                    <div className="space-y-4">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyPress={(e) => e.key === "Enter" && searchUsers()}
                                placeholder="Email or User ID"
                                className="flex-1 px-4 py-2 border border-gray-400 focus:outline-none focus:border-black font-light text-sm"
                            />
                            <button
                                onClick={searchUsers}
                                className="px-4 py-2 bg-black text-white font-light text-sm tracking-wider hover:bg-opacity-75"
                            >
                                SEARCH
                            </button>
                        </div>

                        {users.length > 0 && (
                            <div className="space-y-2 mt-4">
                                <p className="text-sm text-gray-600 font-light">Search Results ({users.length}):</p>
                                {users.map((user) => (
                                    <div
                                        key={user.id}
                                        onClick={() => setSelectedUser(user)}
                                        className={`p-4 border cursor-pointer ${
                                            selectedUser?.id === user.id
                                                ? "border-black bg-gray-50"
                                                : "border-gray-300"
                                        }`}
                                    >
                                        <p className="text-sm font-medium">ID: {user.id}</p>
                                        <p className="text-sm text-gray-600 font-light">Email: {user.email}</p>
                                        {user.name && <p className="text-sm text-gray-600 font-light">Name: {user.name}</p>}
                                        <p className="text-sm text-gray-600 font-light">Role: {user.role}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {selectedUser && (
                            <div className="p-4 bg-green-50 border border-green-300">
                                <p className="text-sm font-medium text-green-800">Selected User:</p>
                                <p className="text-sm text-green-700 font-light">ID: {selectedUser.id} | Email: {selectedUser.email}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Tabs - Mobile */}
                <div className="flex gap-4 border-b">
                    <button
                        onClick={() => setActiveTab("membership")}
                        className={`px-4 py-2 font-light tracking-wider text-sm ${
                            activeTab === "membership"
                                ? "border-b-2 border-black text-black"
                                : "text-gray-500"
                        }`}
                    >
                        MEMBERSHIP
                    </button>
                    <button
                        onClick={() => setActiveTab("resource")}
                        className={`px-4 py-2 font-light tracking-wider text-sm ${
                            activeTab === "resource"
                                ? "border-b-2 border-black text-black"
                                : "text-gray-500"
                        }`}
                    >
                        RESOURCE
                    </button>
                </div>

                {/* Membership Management - Mobile */}
                {activeTab === "membership" && (
                    <div className="bg-white mb-8 pb-6">
                        <h2 className="text-xl font-medium mb-4">Grant Membership</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-light mb-2">Membership Type</label>
                                <select
                                    value={membershipType}
                                    onChange={(e) => {
                                        setMembershipType(e.target.value);
                                        if (e.target.value === "lifetime") {
                                            setMembershipDays(null);
                                        } else {
                                            setMembershipDays(30);
                                        }
                                    }}
                                    className="w-full px-4 py-2 border border-gray-400 focus:outline-none focus:border-black font-light text-sm"
                                >
                                    <option value="premium">Premium</option>
                                    <option value="lifetime">Lifetime</option>
                                </select>
                            </div>

                            {membershipType === "premium" && (
                                <div>
                                    <label className="block text-sm font-light mb-2">Trial Days</label>
                                    <input
                                        type="number"
                                        value={membershipDays}
                                        onChange={(e) => setMembershipDays(parseInt(e.target.value) || 0)}
                                        min="1"
                                        placeholder="Enter days"
                                        className="w-full px-4 py-2 border border-gray-400 focus:outline-none focus:border-black font-light text-sm"
                                    />
                                </div>
                            )}

                            <button
                                onClick={handleGrantMembership}
                                className="w-full py-2 bg-black text-white font-light text-sm tracking-wider hover:bg-opacity-75"
                            >
                                GRANT MEMBERSHIP
                            </button>
                        </div>
                    </div>
                )}

                {/* Resource Grant - Mobile */}
                {activeTab === "resource" && (
                    <div className="bg-white mb-8 pb-6">
                        <h2 className="text-xl font-medium mb-4">Grant Resource</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-light mb-2">Select Resource</label>
                                <select
                                    value={selectedResourceId}
                                    onChange={(e) => setSelectedResourceId(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-400 focus:outline-none focus:border-black font-light text-sm"
                                >
                                    <option value="">-- Select Resource --</option>
                                    {resources.map((resource) => (
                                        <option key={resource.id} value={resource.id}>
                                            {resource.title} (ID: {resource.id}, Type: {resource.type}
                                            {resource.level && `, Level: ${resource.level}`})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {selectedResourceId && (
                                <div className="p-4 bg-gray-50 border border-gray-300">
                                    <p className="text-sm text-gray-700 font-light">
                                        Will grant: {resources.find(r => r.id === parseInt(selectedResourceId))?.title}
                                    </p>
                                </div>
                            )}

                            <button
                                onClick={handleGrantResource}
                                className="w-full py-2 bg-black text-white font-light text-sm tracking-wider hover:bg-opacity-75"
                            >
                                GRANT RESOURCE
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Desktop design */}
            <div className="hidden md:block">
                <div className="flex px-24 m-24 space-x-24 items-start">
                    {/* Left side - User Search and Management */}
                    <div className="w-2/3 space-y-12">
                        {/* User Search */}
                        <div className="bg-white">
                            <h2 className="text-xl font-light tracking-wider mb-8">User Search</h2>
                            <div className="space-y-6">
                                <div className="flex gap-4">
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyPress={(e) => e.key === "Enter" && searchUsers()}
                                        placeholder="Email or User ID"
                                        className="flex-1 px-4 py-2 border border-gray-400 focus:outline-none focus:border-black font-light"
                                    />
                                    <button
                                        onClick={searchUsers}
                                        className="px-6 py-2 bg-black text-white font-light tracking-wider text-sm hover:bg-opacity-[75%]"
                                    >
                                        SEARCH
                                    </button>
                                </div>

                                {users.length > 0 && (
                                    <div className="space-y-2">
                                        <p className="text-sm text-gray-600 font-light">Search Results ({users.length}):</p>
                                        {users.map((user) => (
                                            <div
                                                key={user.id}
                                                onClick={() => setSelectedUser(user)}
                                                className={`p-4 border cursor-pointer ${
                                                    selectedUser?.id === user.id
                                                        ? "border-black bg-gray-50"
                                                        : "border-gray-300 hover:border-gray-400"
                                                }`}
                                            >
                                                <p className="text-sm font-medium">ID: {user.id}</p>
                                                <p className="text-sm text-gray-600 font-light">Email: {user.email}</p>
                                                {user.name && <p className="text-sm text-gray-600 font-light">Name: {user.name}</p>}
                                                <p className="text-sm text-gray-600 font-light">Role: {user.role}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {selectedUser && (
                                    <div className="p-4 bg-green-50 border border-green-300">
                                        <p className="text-sm font-medium text-green-800">Selected User:</p>
                                        <p className="text-sm text-green-700 font-light">ID: {selectedUser.id} | Email: {selectedUser.email}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex gap-4 border-b">
                            <button
                                onClick={() => setActiveTab("membership")}
                                className={`px-6 py-2 font-light tracking-wider ${
                                    activeTab === "membership"
                                        ? "border-b-2 border-black text-black"
                                        : "text-gray-500 hover:text-black"
                                }`}
                            >
                                MEMBERSHIP MANAGEMENT
                            </button>
                            <button
                                onClick={() => setActiveTab("resource")}
                                className={`px-6 py-2 font-light tracking-wider ${
                                    activeTab === "resource"
                                        ? "border-b-2 border-black text-black"
                                        : "text-gray-500 hover:text-black"
                                }`}
                            >
                                RESOURCE GRANT
                            </button>
                        </div>

                        {/* Membership Management */}
                        {activeTab === "membership" && (
                            <div className="bg-white">
                                <h2 className="text-xl font-light tracking-wider mb-8">Grant Membership</h2>
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-light mb-2">Membership Type</label>
                                        <select
                                            value={membershipType}
                                            onChange={(e) => {
                                                setMembershipType(e.target.value);
                                                if (e.target.value === "lifetime") {
                                                    setMembershipDays(null);
                                                } else {
                                                    setMembershipDays(30);
                                                }
                                            }}
                                            className="w-64 px-4 py-2 border border-gray-400 focus:outline-none focus:border-black font-light"
                                        >
                                            <option value="premium">Premium</option>
                                            <option value="lifetime">Lifetime</option>
                                        </select>
                                    </div>

                                    {membershipType === "premium" && (
                                        <div>
                                            <label className="block text-sm font-light mb-2">Trial Days</label>
                                            <input
                                                type="number"
                                                value={membershipDays}
                                                onChange={(e) => setMembershipDays(parseInt(e.target.value) || 0)}
                                                min="1"
                                                placeholder="Enter days"
                                                className="w-64 px-4 py-2 border border-gray-400 focus:outline-none focus:border-black font-light"
                                            />
                                        </div>
                                    )}

                                    <button
                                        onClick={handleGrantMembership}
                                        className="px-6 py-2 bg-black text-white font-light tracking-wider text-sm hover:bg-opacity-[75%]"
                                    >
                                        GRANT MEMBERSHIP
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Resource Grant */}
                        {activeTab === "resource" && (
                            <div className="bg-white">
                                <h2 className="text-xl font-light tracking-wider mb-8">Grant Resource</h2>
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-light mb-2">Select Resource</label>
                                        <select
                                            value={selectedResourceId}
                                            onChange={(e) => setSelectedResourceId(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-400 focus:outline-none focus:border-black font-light"
                                        >
                                            <option value="">-- Select Resource --</option>
                                            {resources.map((resource) => (
                                                <option key={resource.id} value={resource.id}>
                                                    {resource.title} (ID: {resource.id}, Type: {resource.type}
                                                    {resource.level && `, Level: ${resource.level}`})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {selectedResourceId && (
                                        <div className="p-4 bg-gray-50 border border-gray-300">
                                            <p className="text-sm text-gray-700 font-light">
                                                Will grant: {resources.find(r => r.id === parseInt(selectedResourceId))?.title}
                                            </p>
                                        </div>
                                    )}

                                    <button
                                        onClick={handleGrantResource}
                                        className="px-6 py-2 bg-black text-white font-light tracking-wider text-sm hover:bg-opacity-[75%]"
                                    >
                                        GRANT RESOURCE
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminPortalComponent;