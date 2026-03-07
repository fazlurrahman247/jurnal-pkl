// ===== Entry Page JavaScript =====

const STORAGE_KEY = "pkl_jurnal_fazlurrahman";
const PROFILE_KEY = "pkl_profile_settings";

// ===== Default Profile =====
const defaultProfile = {
  name: "Nama Anda",
  location: "Lokasi PKL",
  startDate: "2026-01-01",
  endDate: "2026-06-30",
};

// ===== Format Date =====
function formatDate(dateString) {
  const date = new Date(dateString);
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

// ===== Load Profile Settings =====
function loadProfileSettings() {
  const savedProfile = localStorage.getItem(PROFILE_KEY);
  const profile = savedProfile ? JSON.parse(savedProfile) : defaultProfile;

  // Update display
  document.getElementById("displayName").textContent =
    profile.name || defaultProfile.name;
  document.getElementById("displayLocation").textContent =
    profile.location || defaultProfile.location;
  document.getElementById("displayDuration").textContent =
    `${formatDate(profile.startDate || defaultProfile.startDate)} - ${formatDate(profile.endDate || defaultProfile.endDate)}`;
}

// ===== Save Profile Settings =====
function saveProfileSettings() {
  const profile = {
    name: document.getElementById("profileNameInput").value,
    location: document.getElementById("profileLocationInput").value,
    startDate: document.getElementById("profileStartDateInput").value,
    endDate: document.getElementById("profileEndDateInput").value,
  };
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));

  // Update display
  loadProfileSettings();
  showNotification("Profil berhasil diperbarui!", "success");
}

// ===== Open Profile Modal =====
function openProfileModal() {
  const savedProfile = localStorage.getItem(PROFILE_KEY);
  const profile = savedProfile ? JSON.parse(savedProfile) : defaultProfile;

  document.getElementById("profileNameInput").value = profile.name || "";
  document.getElementById("profileLocationInput").value =
    profile.location || "";
  document.getElementById("profileStartDateInput").value =
    profile.startDate || "";
  document.getElementById("profileEndDateInput").value = profile.endDate || "";

  document.getElementById("profileModal").style.display = "flex";
}

// ===== Close Profile Modal =====
function closeProfileModal() {
  document.getElementById("profileModal").style.display = "none";
}

// ===== Toggle Navbar (Mobile) =====
function toggleNavbar() {
  const navbarMenu = document.getElementById("navbarMenu");
  navbarMenu.classList.toggle("active");
}

// ===== Initialize =====
document.addEventListener("DOMContentLoaded", function () {
  // Load profile settings
  loadProfileSettings();

  // Set today's date as default
  document.getElementById("date").valueAsDate = new Date();

  // Set default time
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  document.getElementById("arrivalTime").value = `${hours}:${minutes}`;

  // Event listener for form submission
  document
    .getElementById("journalForm")
    .addEventListener("submit", handleSubmit);

  // Event listener for profile form
  document
    .getElementById("profileForm")
    .addEventListener("submit", function (e) {
      e.preventDefault();
      saveProfileSettings();
      closeProfileModal();
    });

  // Close modal on outside click
  window.addEventListener("click", function (event) {
    const modal = document.getElementById("profileModal");
    if (event.target === modal) {
      closeProfileModal();
    }
  });
});

// ===== Handle Form Submit =====
function handleSubmit(e) {
  e.preventDefault();

  const form = e.target;

  // Get existing journals
  let journals = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

  const formData = {
    date: form.date.value,
    status: form.status.value,
    arrivalTime: form.arrivalTime.value,
    departureTime: form.departureTime.value,
    task: form.task.value,
    createdAt: new Date().toISOString(),
  };

  // Add to journals array (at beginning)
  journals.unshift(formData);

  // Save to localStorage
  localStorage.setItem(STORAGE_KEY, JSON.stringify(journals));

  // Reset form (keep today's date)
  form.reset();
  document.getElementById("date").valueAsDate = new Date();
  document.getElementById("status").value = "Hadir";

  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  document.getElementById("arrivalTime").value = `${hours}:${minutes}`;

  // Show success message
  showNotification("Jurnal berhasil disimpan!", "success");
}

// ===== Reset Form =====
function resetForm() {
  document.getElementById("date").valueAsDate = new Date();
  document.getElementById("status").value = "Hadir";
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  document.getElementById("arrivalTime").value = `${hours}:${minutes}`;
}

// ===== Show Notification =====
function showNotification(message, type) {
  const notification = document.createElement("div");
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
    <i class="fas fa-${type === "success" ? "check-circle" : "exclamation-circle"}"></i>
    ${message}
  `;

  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === "success" ? "#00B894" : "#E74C3C"};
    color: white;
    padding: 15px 25px;
    border-radius: 8px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    z-index: 2000;
    animation: slideIn 0.3s ease;
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: 500;
  `;

  document.body.appendChild(notification);

  const style = document.createElement("style");
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `;
  document.head.appendChild(style);

  setTimeout(() => {
    notification.style.animation = "slideIn 0.3s ease reverse";
    setTimeout(() => {
      notification.remove();
      style.remove();
    }, 300);
  }, 3000);
}
