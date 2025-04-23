import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
}

export function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function getTimeRemaining(expiresAt: Date): string {
  const now = new Date();
  const expiry = new Date(expiresAt);
  const diff = expiry.getTime() - now.getTime();
  
  if (diff <= 0) return 'Expired';
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `${hours}h ${minutes}m remaining`;
  }
  
  return `${minutes}m remaining`;
}

export function generateGroupName(startDate: Date): string {
  const date = new Date(startDate);
  const month = date.toLocaleString('default', { month: 'short' });
  const day = date.getDate();
  return `Group ${month} ${day}`;
}

export function isGroupAvailable(group: { users: any[], maxSize: number }): boolean {
  return group.users.length < group.maxSize;
}

export function canSwapGroups(currentGroup: { users: any[], maxSize: number } | null, targetGroup: { users: any[], maxSize: number }): boolean {
  if (!currentGroup || !targetGroup) return false;
  
  // Check if swapping would maintain group balance (within ±1 member)
  const currentSize = currentGroup.users.length;
  const targetSize = targetGroup.users.length;
  
  // If target group is full, can't swap
  if (targetSize >= targetGroup.maxSize) return false;
  
  // If current group would become too small after swap
  if (currentSize <= 1) return false;
  
  // If target group would become too large after swap
  if (targetSize + 1 > targetGroup.maxSize) return false;
  
  return true;
}
