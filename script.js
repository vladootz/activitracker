// ==================== SECURITY UTILITIES ====================

/**
 * Escapes HTML special characters to prevent XSS attacks
 * @param {string} unsafe - The unsafe string to escape
 * @returns {string} - The escaped string safe for HTML insertion
 */
function escapeHtml(unsafe) {
    if (typeof unsafe !== 'string') return '';
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/**
 * Escapes string for safe use in HTML attributes
 * @param {string} unsafe - The unsafe string to escape
 * @returns {string} - The escaped string safe for attribute values
 */
function escapeAttribute(unsafe) {
    if (typeof unsafe !== 'string') return '';
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// ==================== VALIDATION ====================

/**
 * Configuration constants for validation
 */
const VALIDATION_CONFIG = {
    ACTIVITY_NAME_MIN_LENGTH: 1,
    ACTIVITY_NAME_MAX_LENGTH: 100,
    DETAILS_MAX_LENGTH: 500,
    DURATION_MIN: 1,
    DURATION_MAX: 1440, // 24 hours in minutes
    MAX_FUTURE_DAYS: 0, // Don't allow future dates
    MAX_PAST_YEARS: 10
};

/**
 * Validates activity name
 * @param {string} name - The activity name to validate
 * @returns {{valid: boolean, value?: string, error?: string}} Validation result
 */
function validateActivityName(name) {
    if (!name || typeof name !== 'string') {
        return { valid: false, error: 'Activity name is required' };
    }

    const trimmed = name.trim();
    if (trimmed.length < VALIDATION_CONFIG.ACTIVITY_NAME_MIN_LENGTH) {
        return { valid: false, error: 'Activity name cannot be empty' };
    }

    if (trimmed.length > VALIDATION_CONFIG.ACTIVITY_NAME_MAX_LENGTH) {
        return { valid: false, error: `Activity name cannot exceed ${VALIDATION_CONFIG.ACTIVITY_NAME_MAX_LENGTH} characters` };
    }

    return { valid: true, value: trimmed.toLowerCase() };
}

/**
 * Validates duration
 * @param {number|string} duration - The duration in minutes to validate
 * @returns {{valid: boolean, value?: number, error?: string}} Validation result
 */
function validateDuration(duration) {
    const num = parseInt(duration, 10);

    if (isNaN(num)) {
        return { valid: false, error: 'Duration must be a number' };
    }

    if (num < VALIDATION_CONFIG.DURATION_MIN) {
        return { valid: false, error: `Duration must be at least ${VALIDATION_CONFIG.DURATION_MIN} minute` };
    }

    if (num > VALIDATION_CONFIG.DURATION_MAX) {
        return { valid: false, error: `Duration cannot exceed ${VALIDATION_CONFIG.DURATION_MAX} minutes (24 hours)` };
    }

    return { valid: true, value: num };
}

/**
 * Validates datetime
 * @param {string} dateTimeString - The datetime string to validate
 * @returns {{valid: boolean, value?: Date, error?: string}} Validation result
 */
function validateDateTime(dateTimeString) {
    if (!dateTimeString) {
        return { valid: false, error: 'Date and time are required' };
    }

    const date = new Date(dateTimeString);
    if (isNaN(date.getTime())) {
        return { valid: false, error: 'Invalid date and time' };
    }

    const now = new Date();
    const maxPast = new Date();
    maxPast.setFullYear(now.getFullYear() - VALIDATION_CONFIG.MAX_PAST_YEARS);

    if (date > now) {
        return { valid: false, error: 'Cannot log activities in the future' };
    }

    if (date < maxPast) {
        return { valid: false, error: `Cannot log activities older than ${VALIDATION_CONFIG.MAX_PAST_YEARS} years` };
    }

    return { valid: true, value: date };
}

/**
 * Validates details field
 * @param {string} details - The details text to validate
 * @returns {{valid: boolean, value?: string, error?: string}} Validation result
 */
function validateDetails(details) {
    if (!details) {
        return { valid: true, value: '' };
    }

    if (typeof details !== 'string') {
        return { valid: false, error: 'Details must be text' };
    }

    if (details.length > VALIDATION_CONFIG.DETAILS_MAX_LENGTH) {
        return { valid: false, error: `Details cannot exceed ${VALIDATION_CONFIG.DETAILS_MAX_LENGTH} characters` };
    }

    return { valid: true, value: details.trim() };
}

/**
 * Shows validation error to user
 * @param {string} message - The error message to display
 */
function showValidationError(message) {
    // Create or update error display element
    let errorDiv = document.getElementById('validation-error');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.id = 'validation-error';
        errorDiv.className = 'validation-error';
    }
    errorDiv.textContent = message;

    const form = document.getElementById('activity-form');
    form.insertBefore(errorDiv, form.firstChild);

    // Auto-remove after 5 seconds
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

// ==================== CONFIGURATION ====================

/**
 * Application configuration constants
 */
const APP_CONFIG = {
    // Edit restrictions
    EDIT_THRESHOLD_YEARS: 1,

    // Duration adjustments
    DURATION_ADJUSTMENT_STEP: 10,
    DEFAULT_DURATION: 30,

    // Pagination
    ACTIVITIES_PER_PAGE: 50,

    // LocalStorage
    STORAGE_KEY: 'activities',

    // Chart settings
    CHART_COLORS: {
        primary: '#a8b2bd',
        primaryLight: 'rgba(168, 178, 189, 0.1)'
    }
};

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
    const oneYearAgo = new Date(now.getFullYear() - APP_CONFIG.EDIT_THRESHOLD_YEARS, now.getMonth(), now.getDate());
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
        const data = localStorage.getItem(APP_CONFIG.STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Error loading activities:', error);
        return [];
    }
}

// Save activities to localStorage
function saveActivities(activities) {
    try {
        localStorage.setItem(APP_CONFIG.STORAGE_KEY, JSON.stringify(activities));
    } catch (error) {
        console.error('Error saving activities:', error);
        alert('Error saving data. Please try again.');
    }
}

// Add new activity
function addActivity(activity, startDateTime, durationMinutes, details) {
    // Validate inputs
    const nameValidation = validateActivityName(activity);
    if (!nameValidation.valid) {
        showValidationError(nameValidation.error);
        return null;
    }

    const durationValidation = validateDuration(durationMinutes);
    if (!durationValidation.valid) {
        showValidationError(durationValidation.error);
        return null;
    }

    const dateTimeValidation = validateDateTime(startDateTime);
    if (!dateTimeValidation.valid) {
        showValidationError(dateTimeValidation.error);
        return null;
    }

    const detailsValidation = validateDetails(details);
    if (!detailsValidation.valid) {
        showValidationError(detailsValidation.error);
        return null;
    }

    const activities = loadActivities();
    const newActivity = {
        id: generateUUID(),
        activity: nameValidation.value,
        startDateTime: localToUTC(startDateTime),
        durationMinutes: durationValidation.value,
        details: detailsValidation.value
    };
    activities.push(newActivity);
    saveActivities(activities);
    return newActivity;
}

// Update activity
function updateActivity(id, activity, startDateTime, durationMinutes, details) {
    // Validate inputs
    const nameValidation = validateActivityName(activity);
    if (!nameValidation.valid) {
        showValidationError(nameValidation.error);
        return null;
    }

    const durationValidation = validateDuration(durationMinutes);
    if (!durationValidation.valid) {
        showValidationError(durationValidation.error);
        return null;
    }

    const dateTimeValidation = validateDateTime(startDateTime);
    if (!dateTimeValidation.valid) {
        showValidationError(dateTimeValidation.error);
        return null;
    }

    const detailsValidation = validateDetails(details);
    if (!detailsValidation.valid) {
        showValidationError(detailsValidation.error);
        return null;
    }

    const activities = loadActivities();
    const index = activities.findIndex(a => a.id === id);
    if (index !== -1) {
        activities[index] = {
            ...activities[index],
            activity: nameValidation.value,
            startDateTime: localToUTC(startDateTime),
            durationMinutes: durationValidation.value,
            details: detailsValidation.value
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

// Bulk delete activities
function bulkDeleteActivity(activityName) {
    const activities = loadActivities();
    const nameLower = activityName.toLowerCase().trim();
    const countBefore = activities.length;

    const filtered = activities.filter(a => a.activity !== nameLower);
    const countDeleted = countBefore - filtered.length;

    saveActivities(filtered);
    return countDeleted;
}

// ==================== UI STATE ====================

let currentFilter = 'week';
let currentEditingId = null;
let chartInstance = null;
let currentChartPeriod = 'weekly';
let currentChartOffset = 0;
let searchQuery = '';
let currentPage = 1;

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

// ==================== SEARCH & FILTER ====================

/**
 * Debounce function to limit search execution
 * @param {Function} func - The function to debounce
 * @param {number} wait - The debounce delay in milliseconds
 * @returns {Function} - The debounced function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Initialize search functionality
 */
function initializeSearch() {
    const searchInput = document.getElementById('activity-search');
    const clearBtn = document.getElementById('search-clear-btn');

    const debouncedSearch = debounce((query) => {
        searchQuery = query.toLowerCase().trim();
        currentPage = 1;
        renderActivityList();
    }, 300);

    searchInput.addEventListener('input', (e) => {
        const value = e.target.value;
        clearBtn.style.display = value ? 'flex' : 'none';
        debouncedSearch(value);
    });

    clearBtn.addEventListener('click', () => {
        searchInput.value = '';
        clearBtn.style.display = 'none';
        searchQuery = '';
        currentPage = 1;
        renderActivityList();
    });
}

/**
 * Filter activities by search query
 * @param {Array} activities - The activities to filter
 * @returns {Array} - Filtered activities
 */
function filterBySearch(activities) {
    if (!searchQuery) return activities;

    return activities.filter(activity =>
        activity.activity.toLowerCase().includes(searchQuery) ||
        activity.details.toLowerCase().includes(searchQuery)
    );
}

/**
 * Calculate statistics for activities
 * @param {Array} activities - The activities to calculate stats for
 * @returns {Object} - Statistics object
 */
function calculateStatistics(activities) {
    if (activities.length === 0) {
        return {
            totalActivities: 0,
            totalDuration: 0,
            uniqueActivities: 0,
            avgDuration: 0
        };
    }

    const totalDuration = activities.reduce((sum, a) => sum + a.durationMinutes, 0);
    const uniqueActivities = new Set(activities.map(a => a.activity)).size;
    const avgDuration = Math.round(totalDuration / activities.length);

    return {
        totalActivities: activities.length,
        totalDuration,
        uniqueActivities,
        avgDuration
    };
}

/**
 * Format duration for display (convert minutes to hours/mins)
 * @param {number} minutes - Duration in minutes
 * @returns {string} - Formatted duration string
 */
function formatDuration(minutes) {
    if (minutes < 60) {
        return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

/**
 * Render statistics cards
 * @param {Array} activities - The activities to show stats for
 */
function renderStatistics(activities) {
    const statsGrid = document.getElementById('stats-grid');
    const stats = calculateStatistics(activities);

    if (activities.length === 0) {
        statsGrid.innerHTML = '';
        return;
    }

    statsGrid.innerHTML = `
        <div class="stat-card">
            <div class="stat-value">${stats.totalActivities}</div>
            <div class="stat-label">Total Activities</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${formatDuration(stats.totalDuration)}</div>
            <div class="stat-label">Total Time</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${stats.uniqueActivities}</div>
            <div class="stat-label">Unique Activities</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${formatDuration(stats.avgDuration)}</div>
            <div class="stat-label">Avg Duration</div>
        </div>
    `;
}

/**
 * Initialize pagination
 */
function initializePagination() {
    document.getElementById('prev-page').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderActivityList();
        }
    });

    document.getElementById('next-page').addEventListener('click', () => {
        currentPage++;
        renderActivityList();
    });
}

/**
 * Paginate activities array
 * @param {Array} activities - The activities to paginate
 * @returns {Object} - Pagination info and paginated items
 */
function paginateActivities(activities) {
    const startIndex = (currentPage - 1) * APP_CONFIG.ACTIVITIES_PER_PAGE;
    const endIndex = startIndex + APP_CONFIG.ACTIVITIES_PER_PAGE;
    const paginated = activities.slice(startIndex, endIndex);

    const totalPages = Math.ceil(activities.length / APP_CONFIG.ACTIVITIES_PER_PAGE);

    return {
        items: paginated,
        currentPage,
        totalPages,
        totalItems: activities.length,
        hasMore: endIndex < activities.length
    };
}

/**
 * Update pagination controls
 * @param {Object} paginationInfo - Pagination information
 */
function updatePaginationControls(paginationInfo) {
    const controls = document.getElementById('pagination-controls');
    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');
    const pageInfo = document.getElementById('page-info');

    if (paginationInfo.totalPages <= 1) {
        controls.style.display = 'none';
        return;
    }

    controls.style.display = 'flex';
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage >= paginationInfo.totalPages;
    pageInfo.textContent = `Page ${currentPage} of ${paginationInfo.totalPages} (${paginationInfo.totalItems} activities)`;
}

// ==================== TRACK TAB ====================

function initializeTrackTab() {
    // Set current datetime
    document.getElementById('activity-datetime').value = getCurrentLocalDateTime();

    // Duration adjust buttons
    document.getElementById('duration-minus').addEventListener('click', function() {
        const input = document.getElementById('activity-duration');
        const currentValue = parseInt(input.value) || APP_CONFIG.DEFAULT_DURATION;
        input.value = Math.max(1, currentValue - APP_CONFIG.DURATION_ADJUSTMENT_STEP);
    });

    document.getElementById('duration-plus').addEventListener('click', function() {
        const input = document.getElementById('activity-duration');
        const currentValue = parseInt(input.value) || APP_CONFIG.DEFAULT_DURATION;
        input.value = currentValue + APP_CONFIG.DURATION_ADJUSTMENT_STEP;
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
        document.getElementById('activity-duration').value = APP_CONFIG.DEFAULT_DURATION;

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
            currentPage = 1;
            renderActivityList();
        });
    });

    // Initialize search and pagination
    initializeSearch();
    initializePagination();

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
    let activities;

    if (currentFilter === 'all') {
        // No date filtering for "all"
        activities = loadActivities();
    } else {
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
        activities = filterActivitiesByDateRange(boundaries.start, boundaries.end);
    }

    // Apply search filter
    activities = filterBySearch(activities);

    // Sort by date (newest first)
    activities.sort((a, b) => new Date(b.startDateTime) - new Date(a.startDateTime));

    // Render statistics (before pagination)
    renderStatistics(activities);

    if (activities.length === 0) {
        const message = searchQuery
            ? `No activities found matching "${escapeHtml(searchQuery)}"`
            : 'No activities found for this period.';
        container.innerHTML = `<div class="empty-state">${message}</div>`;
        // Hide pagination controls
        document.getElementById('pagination-controls').style.display = 'none';
        return;
    }

    // Apply pagination
    const paginationInfo = paginateActivities(activities);
    updatePaginationControls(paginationInfo);

    // Render paginated activities
    container.innerHTML = paginationInfo.items.map(activity => {
        const canEdit = isWithinOneYear(activity.startDateTime);
        const escapedActivity = escapeHtml(activity.activity);
        const escapedDetails = escapeHtml(activity.details);
        const escapedId = escapeAttribute(activity.id);

        return `
            <div class="activity-item">
                <div class="activity-header">
                    <div class="activity-name">${escapedActivity}</div>
                    <div class="activity-actions">
                        <button class="btn-edit" data-activity-id="${escapedId}" ${!canEdit ? 'disabled title="Cannot edit activities older than 1 year"' : ''}>
                            Edit
                        </button>
                        <button class="btn-delete" data-activity-id="${escapedId}">Delete</button>
                    </div>
                </div>
                <div class="activity-meta">
                    <div>📅 ${formatDisplayDate(activity.startDateTime)}</div>
                    <div>⏱️ ${activity.durationMinutes} mins</div>
                </div>
                ${escapedDetails ? `<div class="activity-details">${escapedDetails}</div>` : ''}
            </div>
        `;
    }).join('');

    // Add event listeners using event delegation (secure alternative to inline onclick)
    container.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.getAttribute('data-activity-id');
            openEditModal(id);
        });
    });

    container.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.getAttribute('data-activity-id');
            handleDelete(id);
        });
    });
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

    const { labels, datasets, periodLabel } = getChartData();

    // Update period label
    document.getElementById('current-period-label').textContent = periodLabel;

    // Update existing chart instead of destroying (performance optimization)
    if (chartInstance) {
        chartInstance.data.labels = labels;
        chartInstance.data.datasets = datasets;
        chartInstance.update('none'); // Skip animation for better performance
        return;
    }

    // Create new chart only if doesn't exist
    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: datasets
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

/**
 * Generate a color for an activity based on its index
 * @param {number} index - The index of the activity
 * @param {number} total - Total number of activities
 * @returns {string} - RGB color string
 */
function getActivityColor(index, total) {
    const hue = (index * 360) / Math.max(total, 1);
    return `hsl(${hue}, 70%, 60%)`;
}

function getChartData() {
    const activities = loadActivities();
    let labels = [];
    let periodLabel = '';
    let start, end;
    let numDataPoints = 0;

    const now = new Date();

    // Determine time range and labels based on period
    if (currentChartPeriod === 'weekly') {
        const targetDate = new Date(now);
        targetDate.setDate(now.getDate() + (currentChartOffset * 7));
        const boundaries = getWeekBoundaries(targetDate);
        start = boundaries.start;
        end = boundaries.end;
        numDataPoints = 7;

        for (let i = 0; i < 7; i++) {
            const day = new Date(start);
            day.setDate(start.getDate() + i);
            labels.push(day.toLocaleDateString('en-US', { weekday: 'short' }));
        }

        periodLabel = `Week of ${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;

    } else if (currentChartPeriod === 'monthly') {
        const targetDate = new Date(now.getFullYear(), now.getMonth() + currentChartOffset, 1);
        const boundaries = getMonthBoundaries(targetDate);
        start = boundaries.start;
        end = boundaries.end;

        const daysInMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0).getDate();
        numDataPoints = daysInMonth;

        for (let i = 1; i <= daysInMonth; i++) {
            labels.push(i.toString());
        }

        periodLabel = targetDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });

    } else if (currentChartPeriod === 'yearly') {
        const targetYear = now.getFullYear() + currentChartOffset;
        start = new Date(targetYear, 0, 1);
        end = new Date(targetYear, 11, 31, 23, 59, 59, 999);
        numDataPoints = 12;

        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        labels = monthNames;

        periodLabel = targetYear.toString();
    }

    // Filter activities by date range
    const filteredActivities = activities.filter(activity => {
        const activityDate = new Date(activity.startDateTime);
        return activityDate >= start && activityDate <= end;
    });

    // Get unique activity names
    const uniqueActivities = [...new Set(filteredActivities.map(a => a.activity))].sort();

    // Create datasets: one for each activity + one for total
    const datasets = [];
    const totalData = new Array(numDataPoints).fill(0);

    // Dataset for each unique activity
    uniqueActivities.forEach((activityName, index) => {
        const activityData = new Array(numDataPoints).fill(0);

        filteredActivities.forEach(activity => {
            if (activity.activity === activityName) {
                const activityDate = new Date(activity.startDateTime);
                let dataIndex;

                if (currentChartPeriod === 'weekly') {
                    dataIndex = (activityDate.getDay() + 6) % 7; // Monday=0
                } else if (currentChartPeriod === 'monthly') {
                    dataIndex = activityDate.getDate() - 1;
                } else if (currentChartPeriod === 'yearly') {
                    dataIndex = activityDate.getMonth();
                }

                activityData[dataIndex] += activity.durationMinutes;
                totalData[dataIndex] += activity.durationMinutes;
            }
        });

        const color = getActivityColor(index, uniqueActivities.length);

        datasets.push({
            label: activityName.charAt(0).toUpperCase() + activityName.slice(1),
            data: activityData,
            borderColor: color,
            backgroundColor: color.replace('hsl', 'hsla').replace(')', ', 0.1)'),
            borderWidth: 2,
            fill: false,
            tension: 0.3,
            pointRadius: 3,
            pointHoverRadius: 5
        });
    });

    // Add "Total" dataset
    if (uniqueActivities.length > 0) {
        datasets.push({
            label: 'Total',
            data: totalData,
            borderColor: '#ffffff',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderWidth: 3,
            fill: false,
            tension: 0.3,
            pointRadius: 4,
            pointHoverRadius: 6,
            borderDash: [5, 5] // Dashed line to distinguish from activities
        });
    }

    return { labels, datasets, periodLabel };
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

    // Bulk delete
    document.getElementById('bulk-delete-btn').addEventListener('click', function() {
        const activityName = document.getElementById('bulk-delete-activity').value;

        if (!activityName) {
            alert('Please select an activity to delete.');
            return;
        }

        const confirmed = confirm(
            `Are you sure you want to permanently delete ALL instances of "${activityName}"?\n\nThis action cannot be undone.`
        );

        if (!confirmed) return;

        const count = bulkDeleteActivity(activityName);
        alert(`Deleted ${count} activities of type "${activityName}".`);

        // Refresh UI
        document.getElementById('bulk-delete-activity').value = '';
        populateBulkDeleteDropdown();
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
    populateBulkDeleteDropdown();
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

function populateBulkDeleteDropdown() {
    const select = document.getElementById('bulk-delete-activity');
    select.innerHTML = '<option value="">-- Select Activity --</option>';

    const uniqueActivities = getUniqueActivities();
    uniqueActivities.forEach(activity => {
        const option = document.createElement('option');
        option.value = activity;
        option.textContent = activity;
        select.appendChild(option);
    });
}