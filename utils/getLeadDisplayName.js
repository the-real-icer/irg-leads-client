/**
 * Returns a display name for a lead using the fallback chain:
 * full name → email → 'Unknown Lead'
 */
const getLeadDisplayName = (lead) => {
    if (!lead) return '';

    const firstName = lead.first_name?.trim() || '';
    const lastName = lead.last_name?.trim() || '';
    const email = lead.email?.trim() || '';

    if (firstName || lastName) {
        return [firstName, lastName].filter(Boolean).join(' ');
    }

    if (email) return email;

    return 'Unknown Lead';
};

/**
 * Returns initials for a lead avatar.
 * Falls back to first character of email, then '?'.
 */
const getLeadInitials = (lead) => {
    const firstName = lead?.first_name?.trim() || '';
    const lastName = lead?.last_name?.trim() || '';

    if (firstName && lastName) {
        return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    if (firstName) return firstName[0].toUpperCase();
    if (lastName) return lastName[0].toUpperCase();

    if (lead?.email) return lead.email[0].toUpperCase();

    return '?';
};

export default getLeadDisplayName;
export { getLeadInitials };
