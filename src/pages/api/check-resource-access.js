import { getUserFromRequest } from "../../lib/auth";
import { checkResourceAccess, getResource, checkMembership } from "../../lib/db-helpers";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { resourceId, resourceType } = req.query;

  try {
    const user = getUserFromRequest(req);
    
    if (!user) {
      return res.json({ 
        hasAccess: false, 
        reason: "not_logged_in",
        message: "Please log in to access this content"
      });
    }

    // 如果提供了资源类型，直接使用
    if (resourceType) {
      if (resourceType === 'Syllabus Analysis') {
        return res.json({ 
          hasAccess: true, 
          reason: null,
          message: "Access granted",
          debug: { userId: user.id, resourceType }
        });
      }
      
      if (resourceType === 'Mindmap') {
        const membership = await checkMembership(user.id);
        const hasMembership = membership !== null && membership.status === 'active';
        return res.json({ 
          hasAccess: hasMembership, 
          reason: hasMembership ? null : "membership_required",
          message: hasMembership ? "Access granted" : "Membership required to access mindmap content",
          debug: { 
            userId: user.id, 
            resourceType, 
            membership: membership,
            hasMembership 
          }
        });
      }
    }

    // 如果没有resourceId，返回错误
    if (!resourceId) {
      return res.status(400).json({ message: "Resource ID or Resource Type is required" });
    }

    // 否则查询资源详情并检查权限
    const resource = await getResource(resourceId);
    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }

    const hasAccess = await checkResourceAccess(user.id, resourceId);
    
    let reason = null;
    let message = "Access granted";
    
    if (!hasAccess) {
      if (resource.type === 'Mindmap') {
        reason = "membership_required";
        message = "Membership required to access mindmap content";
      } else {
        reason = "access_denied";
        message = "Access denied";
      }
    }

    return res.json({ 
      hasAccess, 
      reason,
      message,
      resourceType: resource.type,
      debug: { userId: user.id, resourceId }
    });

  } catch (error) {
    console.error("Resource access check error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
