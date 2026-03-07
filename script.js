// ===== Journal PKL App - Fazlur Rahman =====

// Storage key
const STORAGE_KEY = "pkl_jurnal_fazlurrahman";

// Global variables
let journals = [];
let deleteIndex = null;

// ===== Initialize =====
document.addEventListener("DOMContentLoaded", function () {
  // Set today's date as default
  document.getElementById("date").valueAsDate = new Date();

  // Load data from localStorage
  loadJournals();

  // Event listeners
  document
    .getElementById("journalForm")
    .addEventListener("submit", handleSubmit);
  document
    .getElementById("monthFilter")
    .addEventListener("change", filterJournals);
});

// ===== Handle Form Submit =====
function handleSubmit(e) {
  e.preventDefault();

  const form = e.target;
  const formData = {
    date: form.date.value,
    arrivalTime: form.arrivalTime.value,
    departureTime: form.departureTime.value,
    task: form.task.value,
    createdAt: new Date().toISOString(),
  };

  // Add to journals array
  journals.unshift(formData);

  // Save to localStorage
  saveJournals();

  // Reset form
  form.reset();
  document.getElementById("date").valueAsDate = new Date();

  // Show success message
  showNotification("Jurnal berhasil disimpan!", "success");

  // Update table
  renderTable();
}

// ===== Save to LocalStorage =====
function saveJournals() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(journals));
}

// ===== Load from LocalStorage =====
function loadJournals() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    journals = JSON.parse(stored);
  }
  renderTable();
}

// ===== Render Table =====
function renderTable() {
  const tbody = document.getElementById("journalTableBody");
  const emptyState = document.getElementById("emptyState");
  const entryCount = document.getElementById("entryCount");
  const filterValue = document.getElementById("monthFilter").value;

  // Filter by month if selected
  let filteredJournals = journals;
  if (filterValue) {
    filteredJournals = journals.filter((journal) =>
      journal.date.startsWith(filterValue),
    );
  }

  // Update entry count
  entryCount.textContent = filteredJournals.length;

  // Show/hide empty state
  if (filteredJournals.length === 0) {
    tbody.innerHTML = "";
    emptyState.style.display = "block";
    return;
  }

  emptyState.style.display = "none";

  // Render table rows
  tbody.innerHTML = filteredJournals
    .map((journal, index) => {
      // Find original index in journals array
      const originalIndex = journals.indexOf(journal);
      const dateObj = new Date(journal.date);
      const formattedDate = formatDate(dateObj);

      return `
            <tr>
                <td>${index + 1}</td>
                <td>
                    <strong>${formattedDate}</strong>
                </td>
                <td>${journal.arrivalTime || "-"}</td>
                <td>${journal.departureTime || "-"}</td>
                <td>${escapeHtml(journal.task)}</td>
                <td>
                    <button class="btn-delete" onclick="openDeleteModal(${originalIndex})">
                        <i class="fas fa-trash"></i> Hapus
                    </button>
                </td>
            </tr>
        `;
    })
    .join("");
}

// ===== Format Date =====
function formatDate(date) {
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return date.toLocaleDateString("id-ID", options);
}

// ===== Escape HTML (Security) =====
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// ===== Filter Journals =====
function filterJournals() {
  renderTable();
}

// ===== Delete Modal =====
function openDeleteModal(index) {
  deleteIndex = index;
  document.getElementById("confirmModal").style.display = "flex";
}

function closeModal() {
  deleteIndex = null;
  document.getElementById("confirmModal").style.display = "none";
}

function confirmDelete() {
  if (deleteIndex !== null) {
    journals.splice(deleteIndex, 1);
    saveJournals();
    renderTable();
    closeModal();
    showNotification("Entri jurnal berhasil dihapus!", "success");
  }
}

// ===== Export to PDF (Print) =====
function exportToPDF() {
  // Create a printable version
  const printWindow = window.open("", "_blank");

  const journalData = journals
    .map(
      (j, i) => `
        <tr>
            <td>${i + 1}</td>
            <td>${formatDate(new Date(j.date))}</td>
            <td>${j.arrivalTime || "-"}</td>
            <td>${j.departureTime || "-"}</td>
            <td>${j.task || "-"}</td>
        </tr>
    `,
    )
    .join("");

  printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="id">
        <head>
            <meta charset="UTF-8">
            <title>Jurnal PKL - Fazlur Rahman</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                h1 { text-align: center; color: #2C3E50; }
                .header { text-align: center; margin-bottom: 20px; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                th { background: #4A90D9; color: white; }
                .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
            </style>
        </head>
        <body>
            <h1>Jurnal PKL</h1>
            <div class="header">
                <p><strong>Nama:</strong> Fazlur Rahman</p>
                <p><strong>Perusahaan:</strong> Balai Penyuluhan KB</p>
                <p><strong>Periode:</strong> 4 Feb 2026 - 30 Jun 2026</p>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>No</th>
                        <th>Tanggal</th>
                        <th>Jam Datang</th>
                        <th>Jam Pulang</th>
                        <th>Tugas yang Disuruh</th>
                    </tr>
                </thead>
                <tbody>
                    ${journalData || '<tr><td colspan="5" style="text-align:center">Belum ada data</td></tr>'}
                </tbody>
            </table>
            <div class="footer">
                <p>Dicetak pada: ${new Date().toLocaleDateString("id-ID")}</p>
            </div>
            <script>
                window.onload = function() {
                    window.print();
                    window.close();
                }
            <\/script>
        </body>
        </html>
    `);

  printWindow.document.close();
}

// ===== Print Journal =====
function printJournal() {
  window.print();
}

// ===== Show Notification =====
function showNotification(message, type) {
  // Create notification element
  const notification = document.createElement("div");
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
        <i class="fas fa-${type === "success" ? "check-circle" : "exclamation-circle"}"></i>
        ${message}
    `;

  // Add styles
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

  // Add animation keyframes
  const style = document.createElement("style");
  style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `;
  document.head.appendChild(style);

  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.animation = "slideIn 0.3s ease reverse";
    setTimeout(() => {
      notification.remove();
      style.remove();
    }, 300);
  }, 3000);
}

// ===== Close Modal on Outside Click =====
window.onclick = function (event) {
  const modal = document.getElementById("confirmModal");
  if (event.target === modal) {
    closeModal();
  }
};
