import ProtectedRoute from "@/components/ProtectedRoute";
import React from "react";

const page = () => {
	return <ProtectedRoute> Admin</ProtectedRoute>;
};

export default page;
