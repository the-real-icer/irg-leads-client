const hasUpcomingReminder = (lead) => {
    if (!lead.reminders || lead.reminders.length === 0) return false;

    const now = new Date();
    const oneWeekFromNow = new Date();
    oneWeekFromNow.setDate(now.getDate() + 7);

    return lead.reminders.some((reminder) => {
        if (reminder.completed) return false;

        const reminderDate = new Date(reminder.reminder_date);

        return reminderDate >= now && reminderDate <= oneWeekFromNow;
    });
};

export default hasUpcomingReminder;
