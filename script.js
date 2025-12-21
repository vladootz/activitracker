// ==================== UTILITY FUNCTIONS ====================

// Generate UUID
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// Convert local datetime to UTC ISO string
function localToUTC(localDateTimeString) {
    const localDate = new Date(localDateTimeString);
    return localDate.toISOString();
}

// Convert UTC ISO string to local datetime-local format
function utcToLocal(utcISOString) {
    const date = new Date(utcISOString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

// Get current local datetime in datetime-local format
function getCurrentLocalDateTime() {
    const now = new Date();
    return utcToLocal(now.toISOString());
}

// Format date for display
function formatDisplayDate(utcISOString) {
    const date = new Date(utcISOString);
    const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return date.toLocaleDateString('en-US', options);
}

// Check if date is within 1 year
function isWithinOneYear(utcISOString) {
    const date = new Date(utcISOString);
    const now = new Date();
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    return date >= oneYearAgo;
}

// Get week boundaries (Monday to Sunday) in local time
function getWeekBoundaries(date = new Date()) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday

    const monday = new Date(d.setDate(diff));
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    return { start: monday, end: sunday };
}

// Get month boundaries
function getMonthBoundaries(date = new Date()) {
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    start.setHours(0, 0, 0, 0);

    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    end.setHours(23, 59, 59, 999);

    return { start, end };
}

// Get year boundaries
function getYearBoundaries(date = new Date()) {
    const start = new Date(date.getFullYear(), 0, 1);
    start.setHours(0, 0, 0, 0);

    const end = new Date(date.getFullYear(), 11, 31);
    end.setHours(23, 59, 59, 999);

    return { start, end };
}

// ==================== DATA MANAGEMENT ====================

// Load activities from localStorage
function loadActivities() {
    try {
        const data = localStorage.getItem('activities');
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Error loading activities:', error);
        return [];
    }
}

// Save activities to localStorage
function saveActivities(activities) {
    try {
        localStorage.setItem('activities', JSON.stringify(activities));
    } catch (error) {
        console.error('Error saving activities:', error);
        alert('Error saving data. Please try again.');
    }
}

// Add new activity
function addActivity(activity, startDateTime, durationMinutes, details) {
    const activities = loadActivities();
    const newActivity = {
        id: generateUUID(),
        activity: activity.toLowerCase().trim(),
        startDateTime: localToUTC(startDateTime),
        durationMinutes: parseInt(durationMinutes),
        details: details.trim()
    };
    activities.push(newActivity);
    saveActivities(activities);
    return newActivity;
}

// Update activity
function updateActivity(id, activity, startDateTime, durationMinutes, details) {
    const activities = loadActivities();
    const index = activities.findIndex(a => a.id === id);
    if (index !== -1) {
        activities[index] = {
            ...activities[index],
            activity: activity.toLowerCase().trim(),
            startDateTime: localToUTC(startDateTime),
            durationMinutes: parseInt(durationMinutes),
            details: details.trim()
        };
        saveActivities(activities);
        return activities[index];
    }
    return null;
}

// Delete activity
function deleteActivity(id) {
    const activities = loadActivities();
    const filtered = activities.filter(a => a.id !== id);
    saveActivities(filtered);
}

// Get unique activity names
function getUniqueActivities() {
    const activities = loadActivities();
    const unique = [...new Set(activities.map(a => a.activity))];
    return unique.sort();
}

// Filter activities by date range
function filterActivitiesByDateRange(start, end) {
    const activities = loadActivities();
    return activities.filter(activity => {
        const activityDate = new Date(activity.startDateTime);
        return activityDate >= start && activityDate <= end;
    });
}

// Bulk rename activities
function bulkRenameActivity(oldName, newName) {
    const activities = loadActivities();
    let count = 0;
    activities.forEach(activity => {
        if (activity.activity === oldName.toLowerCase().trim()) {
            activity.activity = newName.toLowerCase().trim();
            count++;
        }
    });
    saveActivities(activities);
    return count;
}

// ==================== UI STATE ====================

let currentFilter = 'week';
let currentEditingId = null;
let chartInstance = null;
let currentChartPeriod = 'weekly';
let currentChartOffset = 0;

// ==================== INIT ====================

document.addEventListener('DOMContentLoaded', function() {
    initializeTabs();
    initializeTrackTab();
    initializeAnalyticsTab();
    initializeSettingsTab();
    initializeModal();
});

// ==================== TAB SYSTEM ====================

function initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');

            // Update active states
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            this.classList.add('active');
            document.getElementById(`${targetTab}-tab`).classList.add('active');

            // Refresh content when switching tabs
            if (targetTab === 'analytics') {
                renderChart();
            } else if (targetTab === 'settings') {
                populateRenameDropdown();
            }
        });
    });
}

// ==================== TRACK TAB ====================

function initializeTrackTab() {
    // Set current datetime
    document.getElementById('activity-datetime').value = getCurrentLocalDateTime();

    // Duration adjust buttons
    document.getElementById('duration-minus').addEventListener('click', function() {
        const input = document.getElementById('activity-duration');
        const currentValue = parseInt(input.value) || 30;
        input.value = Math.max(1, currentValue - 10);
    });

    document.getElementById('duration-plus').addEventListener('click', function() {
        const input = document.getElementById('activity-duration');
        const currentValue = parseInt(input.value) || 30;
        input.value = currentValue + 10;
    });

    // Form submission
    document.getElementById('activity-form').addEventListener('submit', function(e) {
        e.preventDefault();

        const activity = document.getElementById('activity-name').value;
        const dateTime = document.getElementById('activity-datetime').value;
        const duration = document.getElementById('activity-duration').value;
        const details = document.getElementById('activity-details').value;

        addActivity(activity, dateTime, duration, details);

        // Reset form
        this.reset();
        document.getElementById('activity-datetime').value = getCurrentLocalDateTime();
        document.getElementById('activity-duration').value = 30;

        // Refresh UI
        updateActivitySuggestions();
        renderActivityList();
    });

    // Filter buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.getAttribute('data-filter');
            renderActivityList();
        });
    });

    // Initial render
    updateActivitySuggestions();
    renderActivityList();
}

function updateActivitySuggestions() {
    const datalist = document.getElementById('activity-suggestions');
    datalist.innerHTML = '';

    const uniqueActivities = getUniqueActivities();
    uniqueActivities.forEach(activity => {
        const option = document.createElement('option');
        option.value = activity;
        datalist.appendChild(option);
    });
}

function renderActivityList() {
    const container = document.getElementById('activity-list');

    // Get date range based on filter
    let boundaries;
    switch (currentFilter) {
        case 'week':
            boundaries = getWeekBoundaries();
            break;
        case 'month':
            boundaries = getMonthBoundaries();
            break;
        case 'year':
            boundaries = getYearBoundaries();
            break;
    }

    const activities = filterActivitiesByDateRange(boundaries.start, boundaries.end);

    if (activities.length === 0) {
        container.innerHTML = '<div class="empty-state">No activities found for this period.</div>';
        return;
    }

    // Sort by date (newest first)
    activities.sort((a, b) => new Date(b.startDateTime) - new Date(a.startDateTime));

    container.innerHTML = activities.map(activity => {
        const canEdit = isWithinOneYear(activity.startDateTime);
        return `
            <div class="activity-item">
                <div class="activity-header">
                    <div class="activity-name">${activity.activity}</div>
                    <div class="activity-actions">
                        <button class="btn-edit"
                                onclick="openEditModal('${activity.id}')"
                                ${!canEdit ? 'disabled title="Cannot edit activities older than 1 year"' : ''}>
                            Edit
                        </button>
                        <button class="btn-delete" onclick="handleDelete('${activity.id}')">Delete</button>
                    </div>
                </div>
                <div class="activity-meta">
                    <div>📅 ${formatDisplayDate(activity.startDateTime)}</div>
                    <div>⏱️ ${activity.durationMinutes} mins</div>
                </div>
                ${activity.details ? `<div class="activity-details">${activity.details}</div>` : ''}
            </div>
        `;
    }).join('');
}

// ==================== MODAL ====================

function initializeModal() {
    const modal = document.getElementById('edit-modal');
    const closeBtn = document.getElementById('modal-close');
    const editForm = document.getElementById('edit-form');

    closeBtn.addEventListener('click', closeEditModal);

    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeEditModal();
        }
    });

    editForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const activity = document.getElementById('edit-activity-name').value;
        const dateTime = document.getElementById('edit-activity-datetime').value;
        const duration = document.getElementById('edit-activity-duration').value;
        const details = document.getElementById('edit-activity-details').value;

        updateActivity(currentEditingId, activity, dateTime, duration, details);

        closeEditModal();
        renderActivityList();
        updateActivitySuggestions();
    });
}

function openEditModal(id) {
    const activities = loadActivities();
    const activity = activities.find(a => a.id === id);

    if (!activity || !isWithinOneYear(activity.startDateTime)) {
        return;
    }

    currentEditingId = id;

    document.getElementById('edit-activity-name').value = activity.activity;
    document.getElementById('edit-activity-datetime').value = utcToLocal(activity.startDateTime);
    document.getElementById('edit-activity-duration').value = activity.durationMinutes;
    document.getElementById('edit-activity-details').value = activity.details;

    document.getElementById('edit-modal').classList.add('active');
}

function closeEditModal() {
    document.getElementById('edit-modal').classList.remove('active');
    currentEditingId = null;
}

function handleDelete(id) {
    if (confirm('Are you sure you want to delete this activity?')) {
        deleteActivity(id);
        renderActivityList();
        updateActivitySuggestions();
    }
}

// ==================== ANALYTICS TAB ====================

function initializeAnalyticsTab() {
    const periodSelect = document.getElementById('period-type');
    const prevBtn = document.getElementById('prev-period');
    const nextBtn = document.getElementById('next-period');

    periodSelect.addEventListener('change', function() {
        currentChartPeriod = this.value;
        currentChartOffset = 0;
        renderChart();
    });

    prevBtn.addEventListener('click', function() {
        currentChartOffset--;
        renderChart();
    });

    nextBtn.addEventListener('click', function() {
        currentChartOffset++;
        renderChart();
    });
}

function renderChart() {
    const canvas = document.getElementById('analytics-chart');
    const ctx = canvas.getContext('2d');

    // Destroy existing chart
    if (chartInstance) {
        chartInstance.destroy();
    }

    const { labels, data, periodLabel } = getChartData();

    // Update period label
    document.getElementById('current-period-label').textContent = periodLabel;

    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Duration (minutes)',
                data: data,
                borderColor: '#5b9dd9',
                backgroundColor: 'rgba(91, 157, 217, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.3,
                pointBackgroundColor: '#5b9dd9',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        color: '#e8eaed'
                    }
                },
                tooltip: {
                    backgroundColor: '#24272f',
                    titleColor: '#e8eaed',
                    bodyColor: '#e8eaed',
                    borderColor: '#3c3f47',
                    borderWidth: 1
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: '#9aa0a6'
                    },
                    grid: {
                        color: '#3c3f47'
                    }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#9aa0a6'
                    },
                    grid: {
                        color: '#3c3f47'
                    }
                }
            }
        }
    });
}

function getChartData() {
    const activities = loadActivities();
    let labels = [];
    let data = [];
    let periodLabel = '';
    let start, end;

    const now = new Date();

    if (currentChartPeriod === 'weekly') {
        // Calculate week with offset
        const targetDate = new Date(now);
        targetDate.setDate(now.getDate() + (currentChartOffset * 7));
        const boundaries = getWeekBoundaries(targetDate);
        start = boundaries.start;
        end = boundaries.end;

        // Generate labels for each day
        for (let i = 0; i < 7; i++) {
            const day = new Date(start);
            day.setDate(start.getDate() + i);
            labels.push(day.toLocaleDateString('en-US', { weekday: 'short' }));
            data.push(0);
        }

        periodLabel = `Week of ${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;

        // Aggregate data
        activities.forEach(activity => {
            const activityDate = new Date(activity.startDateTime);
            if (activityDate >= start && activityDate <= end) {
                const dayIndex = (activityDate.getDay() + 6) % 7; // Convert to Monday=0
                data[dayIndex] += activity.durationMinutes;
            }
        });

    } else if (currentChartPeriod === 'monthly') {
        // Calculate month with offset
        const targetDate = new Date(now.getFullYear(), now.getMonth() + currentChartOffset, 1);
        const boundaries = getMonthBoundaries(targetDate);
        start = boundaries.start;
        end = boundaries.end;

        const daysInMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0).getDate();

        // Generate labels for each day
        for (let i = 1; i <= daysInMonth; i++) {
            labels.push(i.toString());
            data.push(0);
        }

        periodLabel = targetDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });

        // Aggregate data
        activities.forEach(activity => {
            const activityDate = new Date(activity.startDateTime);
            if (activityDate >= start && activityDate <= end) {
                const dayIndex = activityDate.getDate() - 1;
                data[dayIndex] += activity.durationMinutes;
            }
        });

    } else if (currentChartPeriod === 'yearly') {
        // Calculate year with offset
        const targetYear = now.getFullYear() + currentChartOffset;
        start = new Date(targetYear, 0, 1);
        end = new Date(targetYear, 11, 31, 23, 59, 59, 999);

        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        labels = monthNames;
        data = new Array(12).fill(0);

        periodLabel = targetYear.toString();

        // Aggregate data
        activities.forEach(activity => {
            const activityDate = new Date(activity.startDateTime);
            if (activityDate >= start && activityDate <= end) {
                const monthIndex = activityDate.getMonth();
                data[monthIndex] += activity.durationMinutes;
            }
        });
    }

    return { labels, data, periodLabel };
}

// ==================== SETTINGS TAB ====================

function initializeSettingsTab() {
    // Bulk rename
    document.getElementById('rename-btn').addEventListener('click', function() {
        const oldName = document.getElementById('rename-old').value;
        const newName = document.getElementById('rename-new').value.trim();

        if (!oldName || !newName) {
            alert('Please select an activity and enter a new name.');
            return;
        }

        if (oldName.toLowerCase() === newName.toLowerCase()) {
            alert('New name is the same as the old name.');
            return;
        }

        const count = bulkRenameActivity(oldName, newName);
        alert(`Renamed ${count} activities from "${oldName}" to "${newName}".`);

        // Refresh UI
        document.getElementById('rename-old').value = '';
        document.getElementById('rename-new').value = '';
        populateRenameDropdown();
        updateActivitySuggestions();
        renderActivityList();
    });

    // Export data
    document.getElementById('export-btn').addEventListener('click', function() {
        const activities = loadActivities();
        const dataStr = JSON.stringify(activities, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `activity-tracker-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
    });

    // Import data
    document.getElementById('import-file').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(event) {
            try {
                const importedData = JSON.parse(event.target.result);

                // Validate schema
                if (!Array.isArray(importedData)) {
                    throw new Error('Invalid format: data must be an array');
                }

                for (const item of importedData) {
                    if (!item.id || !item.activity || !item.startDateTime || typeof item.durationMinutes !== 'number') {
                        throw new Error('Invalid schema: missing required fields');
                    }
                }

                // Save data
                saveActivities(importedData);
                alert('Data imported successfully!');

                // Refresh UI
                updateActivitySuggestions();
                renderActivityList();
                populateRenameDropdown();

            } catch (error) {
                alert('Error importing data: ' + error.message);
            }

            // Reset file input
            e.target.value = '';
        };
        reader.readAsText(file);
    });

    populateRenameDropdown();
}

function populateRenameDropdown() {
    const select = document.getElementById('rename-old');
    select.innerHTML = '<option value="">-- Select Activity --</option>';

    const uniqueActivities = getUniqueActivities();
    uniqueActivities.forEach(activity => {
        const option = document.createElement('option');
        option.value = activity;
        option.textContent = activity;
        select.appendChild(option);
    });
}

// Make functions globally accessible for inline handlers
window.openEditModal = openEditModal;
window.handleDelete = handleDelete;