// Basic notification functionality
let notificationCount = 0;
let lastNotificationId = 0;
let pollingInterval = null;

function startNotificationPolling() {
    // Clear any existing polling
    if (pollingInterval) {
        clearInterval(pollingInterval);
    }

    // Initial fetch
    fetchNotifications();

    // Set up polling every 1 second
    pollingInterval = setInterval(fetchNotifications, 1000);
}

async function fetchNotifications() {
    const username = sessionStorage.getItem("username");
    const password = sessionStorage.getItem("password");
    
    if (!username || !password) return;

    try {
        const response = await fetch('/api/notifications', {
            headers: {
                'Authorization': 'Basic ' + btoa(username + ':' + password)
            }
        });

        if (!response.ok) {
            console.error('Failed to fetch notifications:', response.status);
            return;
        }

        const notifications = await response.json();
        
        // Process only new notifications
        const newNotifications = notifications.filter(notification => 
            notification.id > lastNotificationId
        );

        if (newNotifications.length > 0) {
            // Update last seen notification ID
            lastNotificationId = Math.max(...notifications.map(n => n.id));
            
            // Add new notifications to the dropdown
            newNotifications.forEach(notification => {
                addNotificationToDropdown(notification);
                notificationCount++;
            });
            
            updateNotificationCount();

            // Show browser notification for the newest one
            if ("Notification" in window && Notification.permission === "granted") {
                const latest = newNotifications[0];
                new Notification(`New Activity in TrackTV`, {
                    body: latest.message,
                    icon: '/favicon.ico'
                });
            }
        }
    } catch (error) {
        console.error('Error fetching notifications:', error);
    }
}

function addNotificationToDropdown(notification) {
    const notificationContent = document.querySelector('.notification-content');
    if (!notificationContent) return;

    // Remove "No Notifications" message if it exists
    const noNotifications = notificationContent.querySelector('.no-notifications');
    if (noNotifications) {
        noNotifications.remove();
    }

    // Create notification element
    const notificationElement = document.createElement('div');
    notificationElement.className = 'notification-item';
    
    // Format the timestamp
    const timestamp = new Date(notification.timestamp);
    const timeAgo = getTimeAgo(timestamp);
    
    notificationElement.innerHTML = `
        <p>${notification.message}</p>
        <small>${timeAgo}</small>
    `;

    // Add to the top of the notifications
    notificationContent.insertBefore(notificationElement, notificationContent.firstChild);
}

function updateNotificationCount() {
    const countElement = document.querySelector('.notification-count');
    if (countElement) {
        if (notificationCount > 0) {
            countElement.style.display = 'block';
            countElement.textContent = notificationCount;
        } else {
            countElement.style.display = 'none';
        }
    }
}

function toggleNotificationDropdown() {
    const dropdown = document.querySelector('.notification-dropdown');
    if (dropdown.classList.contains('show')) {
        dropdown.classList.remove('show');
        // Reset notification count when viewing notifications
        notificationCount = 0;
        updateNotificationCount();
    } else {
        dropdown.classList.add('show');
    }
}

// Helper function to format timestamps
function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    
    let interval = Math.floor(seconds / 31536000);
    if (interval > 1) return interval + ' years ago';
    if (interval === 1) return 'a year ago';
    
    interval = Math.floor(seconds / 2592000);
    if (interval > 1) return interval + ' months ago';
    if (interval === 1) return 'a month ago';
    
    interval = Math.floor(seconds / 86400);
    if (interval > 1) return interval + ' days ago';
    if (interval === 1) return 'yesterday';
    
    interval = Math.floor(seconds / 3600);
    if (interval > 1) return interval + ' hours ago';
    if (interval === 1) return 'an hour ago';
    
    interval = Math.floor(seconds / 60);
    if (interval > 1) return interval + ' minutes ago';
    if (interval === 1) return 'a minute ago';
    
    if (seconds < 10) return 'just now';
    
    return Math.floor(seconds) + ' seconds ago';
}

// Request notification permission and start polling on page load
document.addEventListener('DOMContentLoaded', () => {
    if ("Notification" in window && Notification.permission === "default") {
        Notification.requestPermission();
    }
    startNotificationPolling();
});

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
    const dropdown = document.querySelector('.notification-dropdown');
    const bell = document.querySelector('.notification-bell');
    
    if (!bell.contains(event.target) && dropdown.classList.contains('show')) {
        dropdown.classList.remove('show');
        // Reset notification count when closing dropdown
        notificationCount = 0;
        updateNotificationCount();
    }
}); 