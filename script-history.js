// ===== History Page JavaScript =====

const STORAGE_KEY = "pkl_jurnal_fazlurrahman";

let journals = [];
let deleteIndex = null;

// ===== Initialize =====
document.addEventListener("DOMContentLoaded", function () {
  loadJournals();

  // Event listener for edit form
  document
    .getElementById("editForm")
    .addEventListener("submit", handleEditSubmit);
});

// ===== Load from LocalStorage =====
function loadJournals() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    journals = JSON.parse(stored);
  }
  renderTable();
}

// ===== Save to LocalStorage =====
function saveJournals() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(journals));
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
      const originalIndex = journals.indexOf(journal);
      const dateObj = new Date(journal.date);
      const formattedDate = formatDate(dateObj);

      // Status badge
      const status = journal.status || "Hadir";
      const statusClass =
        status === "Hadir"
          ? "status-hadir"
          : status === "Izin"
            ? "status-izin"
            : "status-sakit";

      return `
        <tr>
          <td>${index + 1}</td>
          <td><strong>${formattedDate}</strong></td>
          <td><span class="status-badge ${statusClass}">${status}</span></td>
          <td>${journal.arrivalTime || "-"}</td>
          <td>${journal.departureTime || "-"}</td>
          <td>${escapeHtml(journal.task)}</td>
          <td>
            <div class="action-buttons">
              <button class="btn-edit" onclick="openEditModal(${originalIndex})" title="Edit">
                <i class="fas fa-edit"></i>
              </button>
              <button class="btn-delete" onclick="openDeleteModal(${originalIndex})" title="Hapus">
                <i class="fas fa-trash"></i>
              </button>
            </div>
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

// ===== Escape HTML =====
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// ===== Filter Journals =====
function filterJournals() {
  renderTable();
}

// ===== Edit Modal =====
function openEditModal(index) {
  const journal = journals[index];

  document.getElementById("editIndex").value = index;
  document.getElementById("editDate").value = journal.date;
  document.getElementById("editStatus").value = journal.status || "Hadir";
  document.getElementById("editArrivalTime").value = journal.arrivalTime;
  document.getElementById("editDepartureTime").value = journal.departureTime;
  document.getElementById("editTask").value = journal.task;

  document.getElementById("editModal").style.display = "flex";
}

function closeEditModal() {
  document.getElementById("editModal").style.display = "none";
  document.getElementById("editForm").reset();
}

function handleEditSubmit(e) {
  e.preventDefault();

  const index = parseInt(document.getElementById("editIndex").value);
  const form = e.target;

  journals[index] = {
    date: form.date.value,
    status: form.status.value,
    arrivalTime: form.arrivalTime.value,
    departureTime: form.departureTime.value,
    task: form.task.value,
    createdAt: journals[index].createdAt,
    updatedAt: new Date().toISOString(),
  };

  saveJournals();
  renderTable();
  closeEditModal();
  showNotification("Entri jurnal berhasil diperbarui!", "success");
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

// ===== Export to PDF =====
function exportToPDF() {
  const printWindow = window.open("", "_blank");

  const journalData = journals
    .map(
      (j, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${formatDate(new Date(j.date))}</td>
        <td>${j.status || "Hadir"}</td>
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
            <th>Status</th>
            <th>Jam Datang</th>
            <th>Jam Pulang</th>
            <th>Tugas yang Disuruh</th>
          </tr>
        </thead>
        <tbody>
          ${journalData || '<tr><td colspan="6" style="text-align:center">Belum ada data</td></tr>'}
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

// ===== Export to Excel =====
function exportToExcel() {
  // Create CSV content
  const headers = [
    "No",
    "Tanggal",
    "Status",
    "Jam Datang",
    "Jam Pulang",
    "Tugas yang Disuruh",
  ];
  const rows = journals.map((j, i) => [
    i + 1,
    j.date,
    j.status || "Hadir",
    j.arrivalTime || "",
    j.departureTime || "",
    j.task || "",
  ]);

  // Convert to CSV
  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
  ].join("\n");

  // Create download link
  const blob = new Blob(["\ufeff" + csvContent], {
    type: "text/csv;charset=utf-8",
  });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `jurnal_pkl_${new Date().toISOString().split("T")[0]}.csv`;
  link.click();

  showNotification("Berhasil export ke Excel!", "success");
}

// ===== Backup Data =====
function backupData() {
  const dataStr = JSON.stringify(journals, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `backup_jurnal_pkl_${new Date().toISOString().split("T")[0]}.json`;
  link.click();

  showNotification("Backup data berhasil!", "success");
}

// ===== Restore Data =====
function restoreData(input) {
  const file = input.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const restoredData = JSON.parse(e.target.result);
      if (Array.isArray(restoredData)) {
        if (
          confirm(
            `Akan menghapus ${journals.length} data lama dan menggantinya dengan ${restoredData.length} data?`,
          )
        ) {
          journals = restoredData;
          saveJournals();
          renderTable();
          showNotification("Data berhasil direstore!", "success");
        }
      } else {
        showNotification("Format file tidak valid!", "error");
      }
    } catch (err) {
      showNotification("Gagal membaca file!", "error");
    }
  };
  reader.readAsText(file);

  // Reset input
  input.value = "";
}

// ===== Print Journal =====
function printJournal() {
  window.print();
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

// ===== Close Modal on Outside Click =====
window.onclick = function (event) {
  const editModal = document.getElementById("editModal");
  const confirmModal = document.getElementById("confirmModal");

  if (event.target === editModal) {
    closeEditModal();
  }
  if (event.target === confirmModal) {
    closeModal();
  }
};
