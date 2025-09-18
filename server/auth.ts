import type { Express, RequestHandler } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { storage } from "./storage";

const JWT_SECRET = process.env.JWT_SECRET || "default-jwt-secret-key";
const JWT_EXPIRES_IN = "7d"; // 7 days

// JWT utility functions
export function generateToken(user: any): string {
  return jwt.sign({ 
    id: user.id,
    email: user.email,
    role: user.role,
    branchId: user.branchId 
  }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);

  // Login endpoint
  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    try {
      // Check branch manager credentials
      const branch = await storage.getBranchByEmail(email);
      
      if (branch && branch.generatedPassword === password && branch.isActive === "true") {
        const userPayload = {
          id: `branch-${branch.id}`,
          email: branch.email,
          firstName: branch.managerName.split(' ')[0] || branch.managerName,
          lastName: branch.managerName.split(' ').slice(1).join(' ') || '',
          role: "manager" as const,
          isActive: "true",
          profileImageUrl: null,
          branchId: branch.id,
          branchName: branch.name
        };

        const token = generateToken(userPayload);
        
        res.cookie('jwt', token, {
          httpOnly: true,
          secure: false, // Set to false for development
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
          sameSite: 'lax'
        });
        
        return res.json(userPayload);
      }

      // Check branch staff user credentials
      const branchUser = await storage.getBranchUserByEmail(email);
      
      if (branchUser && branchUser.generatedPassword === password && branchUser.isActive === "true") {
        // Get branch info for the user
        const userBranch = await storage.getBranch(branchUser.branchId);
        
        if (userBranch && userBranch.isActive === "true") {
          const userPayload = {
            id: `branch-user-${branchUser.id}`,
            email: branchUser.email,
            firstName: branchUser.firstName,
            lastName: branchUser.lastName,
            role: branchUser.role,
            isActive: "true",
            profileImageUrl: null,
            branchId: branchUser.branchId,
            branchName: userBranch.name
          };

          const token = generateToken(userPayload);
        
          res.cookie('jwt', token, {
            httpOnly: true,
            secure: false, // Set to false for development
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            sameSite: 'lax'
          });
          
          return res.json(userPayload);
        }
      }

      // Check regular staff users created through admin interface
      const staffUser = await storage.getUserByEmail(email);
      
      if (staffUser && staffUser.isActive === "true") {
        // Verify password (decode from base64 and compare)
        const storedPassword = staffUser.password ? Buffer.from(staffUser.password, 'base64').toString() : '';
        
        if (storedPassword === password) {
          const userPayload = {
            id: staffUser.id,
            email: staffUser.email,
            firstName: staffUser.firstName,
            lastName: staffUser.lastName,
            role: staffUser.role,
            isActive: staffUser.isActive,
            profileImageUrl: staffUser.profileImageUrl,
            branchId: staffUser.branchId
          };

          const token = generateToken(userPayload);
        
          res.cookie('jwt', token, {
            httpOnly: true,
            secure: false, // Set to false for development
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            sameSite: 'lax'
          });
          
          return res.json(userPayload);
        }
      }
    } catch (error) {
      console.error("Error checking credentials:", error);
    }

    return res.status(401).json({ message: "Invalid credentials" });
  });

  // Logout endpoint
  app.post("/api/auth/logout", (req, res) => {
    // Clear the JWT cookie
    res.clearCookie('jwt', {
      path: '/',
      httpOnly: true,
      secure: false // Set to false for development
    });
    
    res.json({ message: "Logged out successfully" });
  });

  // Get current user endpoint
  app.get("/api/auth/user", (req, res) => {
    const token = req.cookies?.jwt;
    
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Return the user data from the JWT payload
    res.json(decoded);
  });

  // Add a redirect route for /api/login to prevent 404 errors
  app.get("/api/login", (req, res) => {
    res.redirect("/");
  });
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
  const token = req.cookies?.jwt;
  
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Set user on request object for easy access in routes
  (req as any).user = decoded;
  next();
};

export const requireAdmin: RequestHandler = (req, res, next) => {
  const token = req.cookies?.jwt;
  
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (decoded.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }

  // Set user on request object for easy access in routes
  (req as any).user = decoded;
  next();
};