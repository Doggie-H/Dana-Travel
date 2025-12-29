/**
 * =================================================================================================
 * AUTH CONTROLLER - BỘ ĐIỀU KHIỂN XÁC THỰC ADMIN
 * =================================================================================================
 * 
 * Nhiệm vụ:
 * 1. Xử lý Đăng nhập / Đăng xuất (Login/Logout).
 * 2. Quản lý thông tin phiên làm việc (Session/Cookie).
 * 3. Quản lý tài khoản Admin (Account CRUD).
 */

import { randomUUID } from "crypto";
import prisma from "../config/prisma.client.js";
import {
    verifyAdmin,
    createAdmin,
    getAllAdmins,
    updateAdmin,
    deleteAdmin,
    changePassword,
    updateAdminLastLogin,
} from "../services/account.service.js";

/**
 * =================================================================================================
 * AUTHENTICATION HANDLERS
 * =================================================================================================
 */

/**
 * [POST] /api/admin/login
 * Xử lý đăng nhập Admin
 */
export async function loginHandler(req, res) {
    try {
        const { username, password } = req.body;

        // 1. Validate Input
        if (!username || !password) {
            return res.status(400).json({ error: "Vui lòng nhập Username và Password" });
        }

        // 2. Verify Credentials
        const admin = await verifyAdmin(username, password);
        if (!admin) {
            return res.status(401).json({ error: "Sai tên đăng nhập hoặc mật khẩu" });
        }

        // 3. Update Last Login & Log Activity
        await updateAdminLastLogin(admin.id);

        await prisma.accessLog.create({
            data: {
                id: `TC_${randomUUID()}`,
                ip: req.ip || req.connection.remoteAddress,
                userAgent: req.get("User-Agent"),
                endpoint: "/api/admin/login",
                method: "LOGIN",
                username: admin.username,
                role: admin.role,
            },
        });

        // 4. Create Session Token (Basic Implementation)
        // Token = Base64(ID:Timestamp). Valid for 7 days.
        const sessionToken = Buffer.from(`${admin.id}:${Date.now()}`).toString("base64");
        const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days

        // 5. Set Cookie
        // Use fallback for simple Express setups
        res.cookie("admin_token", sessionToken, {
            httpOnly: true,
            sameSite: "lax",
            secure: false, // Set true in production with HTTPS
            path: "/api/admin",
            maxAge: maxAge,
        });

        return res.json({
            success: true,
            admin: {
                id: admin.id,
                username: admin.username,
                email: admin.email,
                role: admin.role,
            },
        });

    } catch (error) {
        console.error("Login Error:", error);
        return res.status(500).json({ error: "Đăng nhập thất bại (Server Error)" });
    }
}

/**
 * [POST] /api/admin/logout
 * Xử lý đăng xuất
 */
export async function logoutHandler(req, res) {
    res.clearCookie("admin_token", { path: "/api/admin" });
    return res.json({ success: true, message: "Đăng xuất thành công" });
}

/**
 * [GET] /api/admin/me
 * Lấy thông tin Admin hiện tại (đã qua middleware auth)
 */
export async function getCurrentAdminHandler(req, res) {
    if (!req.admin) return res.status(401).json({ error: "Chưa xác thực" });

    return res.json({
        success: true,
        admin: {
            id: req.admin.id,
            username: req.admin.username,
            email: req.admin.email,
            role: req.admin.role,
        }
    });
}

/**
 * =================================================================================================
 * ACCOUNT MANAGEMENT HANDLERS
 * =================================================================================================
 */

export async function getAllAccountsHandler(req, res) {
    try {
        const admins = await getAllAdmins();
        return res.json({ success: true, data: admins });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

export async function createAccountHandler(req, res) {
    try {
        const { username, password, email, role } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: "Thiếu username hoặc password" });
        }
        const newAdmin = await createAdmin({ username, password, email, role });
        return res.json({ success: true, data: newAdmin });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
}

export async function updateAccountHandler(req, res) {
    try {
        const updated = await updateAdmin(req.params.id, req.body);
        return res.json({ success: true, data: updated });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
}

export async function deleteAccountHandler(req, res) {
    try {
        await deleteAdmin(req.params.id);
        return res.json({ success: true });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
}

export async function changePasswordHandler(req, res) {
    try {
        const { adminId, oldPassword, newPassword } = req.body;
        if (!adminId || !oldPassword || !newPassword) {
            return res.status(400).json({ error: "Thiếu thông tin để đổi mật khẩu" });
        }
        await changePassword(adminId, oldPassword, newPassword);
        return res.json({ success: true, message: "Đổi mật khẩu thành công" });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
}

export default {
    loginHandler,
    logoutHandler,
    getCurrentAdminHandler,
    getAllAccountsHandler,
    createAccountHandler,
    updateAccountHandler,
    deleteAccountHandler,
    changePasswordHandler
};
