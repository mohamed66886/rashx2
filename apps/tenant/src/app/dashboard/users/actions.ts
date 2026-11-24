'use server';

import { revalidatePath } from 'next/cache';
import { getTenantSubscriptionSession } from '@/lib/tenant-auth';
import {
  InvitationRepository,
  MembershipRepository,
  hasPermission,
} from '@/lib/firebase-server';
import type { MembershipRole } from '@rashx/database';

export async function inviteUserAction(
  formData: FormData
): Promise<{ success: boolean; invitationId?: string; inviteLink?: string; error?: string }> {
  const session = await getTenantSubscriptionSession();
  if (!session) {
    return { success: false, error: 'غير مصرح لك بتنفيذ هذه العملية' };
  }

  if (!hasPermission(session.membership.role, 'memberships.invite')) {
    return { success: false, error: 'لا تملك صلاحية دعوة مستخدمين جدد للمنظمة' };
  }

  const email = (formData.get('email') as string)?.trim().toLowerCase();
  const role = (formData.get('role') as MembershipRole) || 'STAFF';
  const targetEmployeeId = (formData.get('targetEmployeeId') as string)?.trim() || undefined;

  if (!email || !email.includes('@')) {
    return { success: false, error: 'يرجى إدخال بريد إلكتروني صالح للدعوة' };
  }

  if (role === 'OWNER') {
    return { success: false, error: 'لا يمكن توجيه دعوة لمنصب مالك المنشأة مباشرة' };
  }

  try {
    const inviteRepo = new InvitationRepository();
    const result = await inviteRepo.createInvitation(
      session.tenant.tenantId,
      {
        email,
        role: role as 'MANAGER' | 'STAFF',
        targetEmployeeId,
      },
      session.user.uid
    );

    // Build absolute/relative invite link
    const inviteLink = `/accept-invite?token=${result.rawToken}`;

    revalidatePath('/dashboard/users');
    return {
      success: true,
      invitationId: result.invitation.id,
      inviteLink,
    };
  } catch (err: any) {
    return { success: false, error: err.message || 'حدث خطأ أثناء إرسال الدعوة' };
  }
}

export async function revokeInvitationAction(
  invitationId: string
): Promise<{ success: boolean; error?: string }> {
  const session = await getTenantSubscriptionSession();
  if (!session) {
    return { success: false, error: 'غير مصرح لك بتنفيذ هذه العملية' };
  }

  if (!hasPermission(session.membership.role, 'memberships.invite')) {
    return { success: false, error: 'لا تملك صلاحية إلغاء الدعوات' };
  }

  try {
    const inviteRepo = new InvitationRepository();
    await inviteRepo.revokeInvitation(
      session.tenant.tenantId,
      invitationId,
      session.user.uid
    );

    revalidatePath('/dashboard/users');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'حدث خطأ أثناء إلغاء الدعوة' };
  }
}

export async function updateMemberRoleAction(
  targetUid: string,
  newRole: MembershipRole,
  title?: string
): Promise<{ success: boolean; error?: string }> {
  const session = await getTenantSubscriptionSession();
  if (!session) {
    return { success: false, error: 'غير مصرح لك بتنفيذ هذه العملية' };
  }

  if (!hasPermission(session.membership.role, 'memberships.update_role')) {
    return { success: false, error: 'لا تملك صلاحية تعديل رتب وصلاحيات المستخدمين' };
  }

  if (targetUid === session.user.uid && session.membership.role === 'OWNER' && newRole !== 'OWNER') {
    return { success: false, error: 'لا يمكنك تغيير رتبة مالك المنشأة لنفسك مباشرة بدون نقل الملكية' };
  }

  try {
    const membershipRepo = new MembershipRepository();
    await membershipRepo.changeMemberRole(
      {
        tenantId: session.tenant.tenantId,
        targetUid,
        newRole,
        title,
      },
      { uid: session.user.uid }
    );

    revalidatePath('/dashboard/users');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'حدث خطأ أثناء تغيير رتبة المستخدم' };
  }
}

export async function suspendMemberAction(
  targetUid: string
): Promise<{ success: boolean; error?: string }> {
  const session = await getTenantSubscriptionSession();
  if (!session) {
    return { success: false, error: 'غير مصرح لك بتنفيذ هذه العملية' };
  }

  if (!hasPermission(session.membership.role, 'memberships.suspend')) {
    return { success: false, error: 'لا تملك صلاحية تجميد عضوية المستخدمين' };
  }

  if (targetUid === session.user.uid) {
    return { success: false, error: 'لا يمكنك تجميد حسابك الخاص' };
  }

  try {
    const membershipRepo = new MembershipRepository();
    await membershipRepo.suspendMember(
      {
        tenantId: session.tenant.tenantId,
        targetUid,
      },
      { uid: session.user.uid }
    );

    revalidatePath('/dashboard/users');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'حدث خطأ أثناء تجميد العضوية' };
  }
}

export async function reactivateMemberAction(
  targetUid: string
): Promise<{ success: boolean; error?: string }> {
  const session = await getTenantSubscriptionSession();
  if (!session) {
    return { success: false, error: 'غير مصرح لك بتنفيذ هذه العملية' };
  }

  if (!hasPermission(session.membership.role, 'memberships.suspend')) {
    return { success: false, error: 'لا تملك صلاحية إعادة تنشيط عضوية المستخدمين' };
  }

  try {
    const membershipRepo = new MembershipRepository();
    await membershipRepo.reactivateMember(
      {
        tenantId: session.tenant.tenantId,
        targetUid,
      },
      { uid: session.user.uid }
    );

    revalidatePath('/dashboard/users');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'حدث خطأ أثناء إعادة تنشيط العضوية' };
  }
}
