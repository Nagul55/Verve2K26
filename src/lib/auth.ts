import { createClient, User } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// We use the Service Role Key here to confidently query the admin_roles table bypassing RLS
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export interface AdminAuthResult {
  authorized: boolean;
  error?: string;
  user?: User;
  role?: string;
}

/**
 * Validates the Supabase Auth JWT token from the request headers
 * and cross-references the user ID with the admin_roles table.
 * 
 * @param req The incoming HTTP Request containing the 'Authorization: Bearer <token>' header
 * @param targetEventId (Optional) If provided, ensures Coordinators are explicitly assigned to this event
 */
export async function verifyAdminAccess(req: Request, targetEventId?: string): Promise<AdminAuthResult> {
  const authHeader = req.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { authorized: false, error: 'Missing or invalid Authorization Bearer token' };
  }

  const token = authHeader.split(' ')[1];
  
  // 1. Verify token validity with Supabase Auth
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);

  if (authError || !user) {
    return { authorized: false, error: 'Invalid or expired authentication token' };
  }

  // 2. Fetch RBAC (Role-Based Access Control) details from database
  const { data: roleData, error: roleError } = await supabase
    .from('admin_roles')
    .select('role, assigned_events')
    .eq('admin_id', user.id)
    .single();

  if (roleError || !roleData) {
    return { authorized: false, error: 'Access Denied: User does not have admin privileges' };
  }

  // 3. Super Admins bypass all assignment checks
  if (roleData.role === 'Super Admin') {
    return { authorized: true, user, role: roleData.role };
  }

  // 4. Event Coordinators must be assigned to the target event
  if (roleData.role === 'Event Coordinator') {
    if (targetEventId) {
      const assigned = roleData.assigned_events || [];
      if (!assigned.includes(targetEventId)) {
        return { authorized: false, error: 'Access Denied: Coordinator is not assigned to manage this specific event' };
      }
    }
    return { authorized: true, user, role: roleData.role };
  }

  return { authorized: false, error: 'Access Denied: Unknown role classification' };
}
