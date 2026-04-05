import { useEffect, useRef } from "react";

export function useMount(callback) {
  const mountedRef = useRef(true);

  useEffect(() => {
    callback(mountedRef);

    return () => {
      mountedRef.current = false;
    };
  }, []);
}

// ============ Authentication Helpers ============

/**
 * Kiểm tra người dùng đã đăng nhập chưa
 * @returns {boolean} true nếu đã đăng nhập, false nếu chưa
 */
export const isUserLoggedIn = () => {
  try {
    const user = localStorage.getItem("user");
    const token = localStorage.getItem("access_token");
    return !!(user && token);
  } catch {
    return false;
  }
};

/**
 * Lấy thông tin người dùng từ localStorage
 * @returns {Object|null} thông tin user hoặc null
 */
export const getUser = () => {
  try {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};

/**
 * Lấy role của người dùng hiện tại
 * @returns {string|null} role của user hoặc null
 */
export const getUserRole = () => {
  const user = getUser();
  return user?.role || null;
};

/**
 * Kiểm tra người dùng có role cụ thể không
 * @param {string|string[]} requiredRole - role cần kiểm tra (có thể là 1 role hoặc mảng roles)
 * @returns {boolean} true nếu user có role, false nếu không
 */
export const hasRole = (requiredRole) => {
  if (!isUserLoggedIn()) return false;
  
  const userRole = getUserRole();
  
  // Nếu requiredRole là mảng, kiểm tra user có một trong các roles đó không
  if (Array.isArray(requiredRole)) {
    return requiredRole.includes(userRole);
  }
  
  // Kiểm tra role đơn
  return userRole === requiredRole;
};

/**
 * Kiểm tra người dùng có phải admin không
 * @returns {boolean} true nếu là admin, false nếu không
 */
export const isAdmin = () => {
  return hasRole("ADMIN");
};

/**
 * Kiểm tra người dùng có phải user thường không
 * @returns {boolean} true nếu là user thường, false nếu không
 */
export const isRegularUser = () => {
  return hasRole("USER");
};

/**
 * Lấy ID của người dùng hiện tại
 * @returns {string|number|null} ID của user hoặc null
 */
export const getUserId = () => {
  const user = getUser();
  return user?.id || user?._id || null;
};

/**
 * Lấy email của người dùng hiện tại
 * @returns {string|null} email của user hoặc null
 */
export const getUserEmail = () => {
  const user = getUser();
  return user?.email || null;
};

/**
 * Kiểm tra quyền truy cập dựa trên role
 * @param {string|string[]} requiredRoles - role cần kiểm tra
 * @returns {Object} { hasAccess: boolean, userRole: string|null, message: string }
 */
export const checkPermission = (requiredRoles) => {
  if (!isUserLoggedIn()) {
    return {
      hasAccess: false,
      userRole: null,
      message: "Vui lòng đăng nhập để tiếp tục",
    };
  }

  const userRole = getUserRole();
  const rolesArray = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
  const hasAccess = rolesArray.includes(userRole);

  return {
    hasAccess,
    userRole,
    message: hasAccess ? "Bạn có quyền truy cập" : "Bạn không có quyền truy cập",
  };
};