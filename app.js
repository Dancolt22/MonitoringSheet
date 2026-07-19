// App State & Core Logic for NIGGAS Monitoring Sheets

// --- 1. DEFAULT DATA (To provide a fully working experience out of the box) ---
const DEFAULT_PROFILE = {
    tutorName: "Daniel Anyamene",
    programName: "Frontend",
    reportMonth: "July",
    batchIndexing: "letters" // 'letters' or 'numbers'
};

const DEFAULT_BATCHES = [
    { id: "batch_1", name: "GDP", start: "February", end: "July", duration: "", schedule: "Mondays - Wednesdays" },
    { id: "batch_2", name: "", start: "February", end: "_____________", duration: "", schedule: "Mondays - Wednesdays" },
    { id: "batch_3", name: "", start: "February", end: "July", duration: "", schedule: "Mondays - Wednesdays" },
    { id: "batch_4", name: "", start: "April", end: "_____________", duration: "", schedule: "Thursdays - Fridays" },
    { id: "batch_5", name: "Weekend Batch", start: "February", end: "_____________", duration: "", schedule: "Saturday" }
];

const DEFAULT_WEEKLY_DATA = {
    "1": {
        "batch_1": { topic: "Introduction to css, Css syntax and selectors, Ways of applying css.", attendance: "16", remarks: "Students understood css basics." },
        "batch_2": { topic: "Introduction to Tailwind, colors, typography and spacing", attendance: "2", remarks: "Students showed apt understanding of the basics" },
        "batch_3": { topic: "Introduction to Javascript, JS Syntax and rules, best practices for javascript projects", attendance: "4", remarks: "Students asked a lot of questions which showed there are some parts that need to be rehashed" },
        "batch_4": { topic: "Css Colors, typography and flexbox. Css box model", attendance: "4", remarks: "Students showed understanding of css syntax and did mini class projects" },
        "batch_5": { topic: "React project", attendance: "1", remarks: "Students joined me type code word for word and asked questions where necessary." }
    },
    "2": {
        "batch_1": { topic: "GDP - Completed Html/Css/Js Essentials and successfully hosted their portfolio", attendance: "14", remarks: "Most students did to host their portfolio because they have not finished it yet but they were all taught how to successfully host a project with Vercel." },
        "batch_2": { topic: "Class Project", attendance: "3", remarks: "Students did a class project, asked questions and showed understanding. 2 weeks left for this batch to complete their course." },
        "batch_3": { topic: "Javascript conditional statements(if/else statements)", attendance: "4", remarks: "Students really struggle with logical reasoning and will need at least one more week to try and catch up." },
        "batch_4": { topic: "Html completed, Css Basics, Flex and Grid.", attendance: "4", remarks: "Students showed perfect knowledge of writing tags and now need more practicals with flex and grid." },
        "batch_5": { topic: "Students were absent.", attendance: "0", remarks: "Students were supposed to be 2 but one was having an exam and the other was just unable to come." }
    },
    "3": {
        "batch_1": { topic: "", attendance: "", remarks: "" },
        "batch_2": { topic: "", attendance: "", remarks: "" },
        "batch_3": { topic: "", attendance: "", remarks: "" },
        "batch_4": { topic: "", attendance: "", remarks: "" },
        "batch_5": { topic: "", attendance: "", remarks: "" }
    },
    "4": {
        "batch_1": { topic: "", attendance: "", remarks: "" },
        "batch_2": { topic: "", attendance: "", remarks: "" },
        "batch_3": { topic: "", attendance: "", remarks: "" },
        "batch_4": { topic: "", attendance: "", remarks: "" },
        "batch_5": { topic: "", attendance: "", remarks: "" }
    },
    "5": {
        "batch_1": { topic: "", attendance: "", remarks: "" },
        "batch_2": { topic: "", attendance: "", remarks: "" },
        "batch_3": { topic: "", attendance: "", remarks: "" },
        "batch_4": { topic: "", attendance: "", remarks: "" },
        "batch_5": { topic: "", attendance: "", remarks: "" }
    }
};

// --- 2. LOCAL STORAGE / STATE MANAGEMENT ---
let profile = JSON.parse(localStorage.getItem("df_profile")) || null;
let batches = JSON.parse(localStorage.getItem("df_batches")) || null;
let weeklyData = JSON.parse(localStorage.getItem("df_weekly_data")) || null;
let retainPreviousWeeks = localStorage.getItem("df_retain_previous_weeks") !== "false";

// --- 1.5 ONLINE DATE FETCHING UTILITY ---
let onlineDate = null;

async function fetchOnlineTime() {
    try {
        const response = await fetch("https://worldtimeapi.org/api/ip");
        if (response.ok) {
            const data = await response.json();
            if (data.datetime) {
                onlineDate = new Date(data.datetime);
                console.log("Online time successfully fetched:", onlineDate);
                return onlineDate;
            }
        }
    } catch (e) {
        console.warn("Could not fetch online time (using offline/system fallback):", e);
    }
    onlineDate = new Date();
    return onlineDate;
}

function getActiveDate() {
    return onlineDate || new Date();
}

// Initialize state
function initializeState() {
    let stateCreated = false;
    
    if (!profile) {
        profile = { ...DEFAULT_PROFILE };
        const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        profile.reportMonth = months[getActiveDate().getMonth()];
        localStorage.setItem("df_profile", JSON.stringify(profile));
        stateCreated = true;
    }
    if (!batches) {
        batches = JSON.parse(JSON.stringify(DEFAULT_BATCHES));
        localStorage.setItem("df_batches", JSON.stringify(batches));
        stateCreated = true;
    }
    if (!weeklyData) {
        weeklyData = JSON.parse(JSON.stringify(DEFAULT_WEEKLY_DATA));
        localStorage.setItem("df_weekly_data", JSON.stringify(weeklyData));
        stateCreated = true;
    }
    
    // Auto-reset check when month changes
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const currentCalendarMonth = months[getActiveDate().getMonth()];
    
    let lastMonth = localStorage.getItem("df_last_month");
    
    // If state was just created, default the tracker
    if (!lastMonth) {
        localStorage.setItem("df_last_month", profile.reportMonth);
    } else if (lastMonth !== currentCalendarMonth) {
        // Auto-reset only the weekly monitoring sheet details (topics, attendance, remarks) to blank
        profile.reportMonth = currentCalendarMonth;
        localStorage.setItem("df_profile", JSON.stringify(profile));
        
        weeklyData = {
            "1": {}, "2": {}, "3": {}, "4": {}, "5": {}
        };
        batches.forEach(b => {
            weeklyData["1"][b.id] = { topic: "", attendance: "", remarks: "" };
            weeklyData["2"][b.id] = { topic: "", attendance: "", remarks: "" };
            weeklyData["3"][b.id] = { topic: "", attendance: "", remarks: "" };
            weeklyData["4"][b.id] = { topic: "", attendance: "", remarks: "" };
            weeklyData["5"][b.id] = { topic: "", attendance: "", remarks: "" };
        });
        localStorage.setItem("df_weekly_data", JSON.stringify(weeklyData));
        localStorage.setItem("df_last_month", currentCalendarMonth);
        
        // Alert user on UI start
        window.dfNewMonthAlert = currentCalendarMonth;
    }
}

// Clear all weekly activity data for a clean month
function resetMonthData() {
    weeklyData = {
        "1": {}, "2": {}, "3": {}, "4": {}, "5": {}
    };
    batches.forEach(b => {
        weeklyData["1"][b.id] = { topic: "", attendance: "", remarks: "" };
        weeklyData["2"][b.id] = { topic: "", attendance: "", remarks: "" };
        weeklyData["3"][b.id] = { topic: "", attendance: "", remarks: "" };
        weeklyData["4"][b.id] = { topic: "", attendance: "", remarks: "" };
        weeklyData["5"][b.id] = { topic: "", attendance: "", remarks: "" };
    });
    localStorage.setItem("df_weekly_data", JSON.stringify(weeklyData));
    
    // Set active week back to Week 1
    document.getElementById("active-week-num").value = 1;
    const tabButtons = document.querySelectorAll("#week-tabs-list .tab-btn");
    tabButtons.forEach(btn => {
        if (parseInt(btn.getAttribute("data-week")) === 1) {
            btn.classList.add("active");
        } else {
            btn.classList.remove("active");
        }
    });
    
    document.getElementById("preview-target-week").value = 1;
    
    renderWeeklyEntryForm();
    renderPreview();
    showToast(`Weekly activity details cleared. Ready for ${profile.reportMonth}!`, "success");
}

// Load default July template data (Daniel Anyamene)
function loadDemoTemplate() {
    profile = { ...DEFAULT_PROFILE };
    batches = JSON.parse(JSON.stringify(DEFAULT_BATCHES));
    weeklyData = JSON.parse(JSON.stringify(DEFAULT_WEEKLY_DATA));
    
    localStorage.setItem("df_profile", JSON.stringify(profile));
    localStorage.setItem("df_batches", JSON.stringify(batches));
    localStorage.setItem("df_weekly_data", JSON.stringify(weeklyData));
    localStorage.setItem("df_last_month", "July"); // lock to July to avoid auto-reset
    
    // Reset active week to Week 2
    document.getElementById("active-week-num").value = 2;
    const tabButtons = document.querySelectorAll("#week-tabs-list .tab-btn");
    tabButtons.forEach(btn => {
        if (parseInt(btn.getAttribute("data-week")) === 2) {
            btn.classList.add("active");
        } else {
            btn.classList.remove("active");
        }
    });
    document.getElementById("preview-target-week").value = 2;
    
    renderProfile();
    renderBatches();
    renderWeeklyEntryForm();
    renderPreview();
    showToast("Demo template data loaded!", "success");
}

// --- 3. AUTO WEEK DETECTOR ---
// 1-7: Week 1, 8-14: Week 2, 15-21: Week 3, 22-28: Week 4, 29+: Week 5
function calculateCurrentWeek() {
    const day = getActiveDate().getDate();
    if (day <= 7) return 1;
    if (day <= 14) return 2;
    if (day <= 21) return 3;
    if (day <= 28) return 4;
    return 5;
}

// Get batch prefix based on index
function getBatchPrefix(index) {
    if (profile.batchIndexing === "numbers") {
        return (index + 1).toString();
    }
    // Alphabet letters
    return String.fromCharCode(65 + index); // 65 is 'A'
}

// Get full batch display name (e.g. A(GDP) or E(Weekend Batch))
function getBatchDisplayName(batch, index) {
    const prefix = getBatchPrefix(index);
    if (batch.name && batch.name.trim() !== "") {
        return `${prefix}(${batch.name})`;
    }
    return prefix;
}

// --- 4. RENDER PROCEDURES ---

// Render profile inputs
function renderProfile() {
    document.getElementById("tutor-name").value = profile.tutorName || "";
    document.getElementById("program-name").value = profile.programName || "";
    document.getElementById("report-month").value = profile.reportMonth || "July";
    document.getElementById("batch-indexing").value = profile.batchIndexing || "letters";
}

// Render active batches
function renderBatches() {
    const tbody = document.getElementById("batches-list-body");
    tbody.innerHTML = "";
    
    if (batches.length === 0) {
        tbody.innerHTML = `
            <tr class="empty-state-row">
                <td colspan="4">No batches added yet. Click "+ Add Batch" above to start.</td>
            </tr>
        `;
        return;
    }
    
    batches.forEach((batch, index) => {
        const tr = document.createElement("tr");
        const prefix = getBatchPrefix(index);
        const displayName = getBatchDisplayName(batch, index);
        
        tr.innerHTML = `
            <td style="font-weight: bold; color: var(--cyan);">${prefix}</td>
            <td>
                <div style="font-weight: 500;">${displayName}</div>
                <div style="font-size: 11px; color: var(--text-muted);">
                    Start: ${batch.start || "-"} | End: ${batch.end || "-"} ${batch.duration ? `(${batch.duration})` : ""}
                </div>
            </td>
            <td style="color: var(--text-secondary); font-size: 12px;">${batch.schedule}</td>
            <td>
                <div style="display: flex; gap: 6px;">
                    <button type="button" class="btn-edit-icon" onclick="editBatch('${batch.id}')" title="Edit Batch">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                    <button type="button" class="btn-danger-icon" onclick="deleteBatch('${batch.id}')" title="Delete Batch">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Render weekly entry rows for selected week
function renderWeeklyEntryForm() {
    const container = document.getElementById("weekly-rows-container");
    const activeWeek = document.getElementById("active-week-num").value;
    
    container.innerHTML = "";
    
    if (batches.length === 0) {
        container.innerHTML = `
            <div class="empty-state-weeks">
                <p>Please configure your <strong>Instructor Profile</strong> and add at least one <strong>Active Batch</strong> to begin filling report details.</p>
            </div>
        `;
        return;
    }
    
    // Ensure weeklyData structure exists for this week
    if (!weeklyData[activeWeek]) {
        weeklyData[activeWeek] = {};
    }
    
    batches.forEach((batch, index) => {
        const displayName = getBatchDisplayName(batch, index);
        const savedValue = weeklyData[activeWeek][batch.id] || { topic: "", attendance: "", remarks: "" };
        
        const card = document.createElement("div");
        card.className = "batch-input-card";
        card.innerHTML = `
            <div class="batch-input-card-title">
                <span>Batch ${displayName}</span>
                <span class="batch-card-schedule">${batch.schedule}</span>
            </div>
            <div class="batch-input-grid">
                <div class="form-group">
                    <label for="topic-${activeWeek}-${batch.id}">Topic Covered</label>
                    <textarea id="topic-${activeWeek}-${batch.id}" placeholder="What topics did this batch cover in Week ${activeWeek}?">${savedValue.topic || ""}</textarea>
                </div>
                <div class="form-group">
                    <label for="att-${activeWeek}-${batch.id}">Attendance</label>
                    <input type="number" id="att-${activeWeek}-${batch.id}" min="0" placeholder="Count" value="${savedValue.attendance || ""}">
                </div>
                <div class="form-group batch-input-grid-row-2">
                    <label for="remarks-${activeWeek}-${batch.id}">Remarks</label>
                    <textarea id="remarks-${activeWeek}-${batch.id}" rows="2" placeholder="e.g. Students understood the concepts well.">${savedValue.remarks || ""}</textarea>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

// Render live report preview
function renderPreview() {
    const targetWeek = parseInt(document.getElementById("preview-target-week").value);
    
    // Update Meta display
    document.getElementById("preview-meta-month").innerText = `Month: ${profile.reportMonth}`;
    document.getElementById("preview-meta-program").innerText = `Program: ${profile.programName}`;
    document.getElementById("preview-meta-instructor").innerText = `Instructor: ${profile.tutorName}`;
    
    const previewContent = document.getElementById("preview-tables-content");
    previewContent.innerHTML = "";
    
    if (batches.length === 0) {
        previewContent.innerHTML = `<p style="text-align: center; color: #8a8d9a; padding: 20px 0;">No active batches or report data to preview.</p>`;
        return;
    }
    
    // 1. Render Batch Information Table
    const batchTitle = document.createElement("div");
    batchTitle.className = "preview-week-header";
    batchTitle.innerText = "Batch Information";
    previewContent.appendChild(batchTitle);
    
    let batchTableHTML = `
        <table class="preview-table">
            <thead>
                <tr>
                    <th style="width: 20%">Batch Name</th>
                    <th style="width: 20%">Batch Start Date</th>
                    <th style="width: 20%">Batch End Date</th>
                    <th style="width: 15%">Batch Duration</th>
                    <th style="width: 25%">Schedule (Days/Time)</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    batches.forEach((batch, index) => {
        const name = getBatchDisplayName(batch, index);
        batchTableHTML += `
            <tr>
                <td><strong>${name}</strong></td>
                <td>${batch.start || ""}</td>
                <td>${batch.end || ""}</td>
                <td>${batch.duration || ""}</td>
                <td>${batch.schedule || ""}</td>
            </tr>
        `;
    });
    batchTableHTML += `</tbody></table>`;
    
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = batchTableHTML;
    previewContent.appendChild(tempDiv.firstElementChild);
    
    // 2. Render Activity Tables for each week up to targetWeek
    const startWeek = retainPreviousWeeks ? 1 : targetWeek;
    for (let w = startWeek; w <= targetWeek; w++) {
        const weekHeader = document.createElement("div");
        weekHeader.className = "preview-week-header";
        weekHeader.innerText = `WEEK ${w}`;
        previewContent.appendChild(weekHeader);
        
        let weekTableHTML = `
            <table class="preview-table">
                <thead>
                    <tr>
                        <th style="width: 20%">Batch Name</th>
                        <th style="width: 45%">Topic Covered</th>
                        <th style="width: 15%">Attendance</th>
                        <th style="width: 20%">Remarks</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        batches.forEach((batch, index) => {
            const name = getBatchDisplayName(batch, index);
            const data = (weeklyData[w] && weeklyData[w][batch.id]) || { topic: "", attendance: "", remarks: "" };
            
            weekTableHTML += `
                <tr>
                    <td><strong>${name}</strong></td>
                    <td>${data.topic || ""}</td>
                    <td>${data.attendance || ""}</td>
                    <td>${data.remarks || ""}</td>
                </tr>
            `;
        });
        
        weekTableHTML += `</tbody></table>`;
        const tempWeekDiv = document.createElement("div");
        tempWeekDiv.innerHTML = weekTableHTML;
        previewContent.appendChild(tempWeekDiv.firstElementChild);
    }
}

// Show toast notification
function showToast(message, type = "info") {
    const container = document.getElementById("toast-container");
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    
    let icon = "ℹ️";
    if (type === "success") icon = "✅";
    if (type === "warning") icon = "⚠️";
    if (type === "danger") icon = "🚨";
    
    toast.innerHTML = `
        <span>${icon}</span>
        <span>${message}</span>
    `;
    
    container.appendChild(toast);
    
    // Remove after 4 seconds
    setTimeout(() => {
        toast.classList.add("toast-exit");
        toast.addEventListener("animationend", () => {
            toast.remove();
        });
    }, 4000);
}

// --- 5. EVENT LISTENERS & ACTION HANDLERS ---

// Setup event listeners
function setupListeners() {
    // 1. Profile Form Submit
    document.getElementById("profile-form").addEventListener("submit", function(e) {
        e.preventDefault();
        profile.tutorName = document.getElementById("tutor-name").value;
        profile.programName = document.getElementById("program-name").value;
        profile.reportMonth = document.getElementById("report-month").value;
        profile.batchIndexing = document.getElementById("batch-indexing").value;
        
        localStorage.setItem("df_profile", JSON.stringify(profile));
        showToast("Profile settings saved successfully!", "success");
        
        renderBatches();
        renderWeeklyEntryForm();
        renderPreview();
    });
    
    // 2. Add Batch collapsibility
    document.getElementById("btn-show-add-batch").addEventListener("click", function() {
        document.getElementById("add-batch-form").reset();
        document.getElementById("edit-batch-id").value = "";
        document.getElementById("batch-form-title").innerText = "New Batch Details";
        document.getElementById("btn-submit-batch").innerText = "Save Batch";
        document.getElementById("add-batch-panel").style.display = "block";
    });
    
    document.getElementById("btn-cancel-add-batch").addEventListener("click", function() {
        document.getElementById("add-batch-panel").style.display = "none";
        document.getElementById("add-batch-form").reset();
    });
    
    // 3. Add Batch form submit
    document.getElementById("add-batch-form").addEventListener("submit", function(e) {
        e.preventDefault();
        
        const editId = document.getElementById("edit-batch-id").value;
        
        if (editId) {
            // Update existing batch details
            const idx = batches.findIndex(b => b.id === editId);
            if (idx !== -1) {
                batches[idx].name = document.getElementById("new-batch-name").value;
                batches[idx].start = document.getElementById("new-batch-start").value;
                batches[idx].end = document.getElementById("new-batch-end").value;
                batches[idx].duration = document.getElementById("new-batch-duration").value;
                batches[idx].schedule = document.getElementById("new-batch-schedule").value;
                
                localStorage.setItem("df_batches", JSON.stringify(batches));
                showToast("Batch updated successfully!", "success");
            }
        } else {
            // Create a new batch
            const newBatch = {
                id: "batch_" + Date.now(),
                name: document.getElementById("new-batch-name").value,
                start: document.getElementById("new-batch-start").value,
                end: document.getElementById("new-batch-end").value,
                duration: document.getElementById("new-batch-duration").value,
                schedule: document.getElementById("new-batch-schedule").value
            };
            
            batches.push(newBatch);
            localStorage.setItem("df_batches", JSON.stringify(batches));
            showToast("Active batch added successfully!", "success");
        }
        
        document.getElementById("add-batch-panel").style.display = "none";
        document.getElementById("add-batch-form").reset();
        document.getElementById("edit-batch-id").value = "";
        
        renderBatches();
        renderWeeklyEntryForm();
        renderPreview();
    });
    
    // 4. Save Weekly Progress Form Submit
    document.getElementById("weekly-details-form").addEventListener("submit", function(e) {
        e.preventDefault();
        const activeWeek = document.getElementById("active-week-num").value;
        
        if (!weeklyData[activeWeek]) {
            weeklyData[activeWeek] = {};
        }
        
        batches.forEach(batch => {
            const topicVal = document.getElementById(`topic-${activeWeek}-${batch.id}`).value;
            const attVal = document.getElementById(`att-${activeWeek}-${batch.id}`).value;
            const remarksVal = document.getElementById(`remarks-${activeWeek}-${batch.id}`).value;
            
            weeklyData[activeWeek][batch.id] = {
                topic: topicVal,
                attendance: attVal,
                remarks: remarksVal
            };
        });
        
        localStorage.setItem("df_weekly_data", JSON.stringify(weeklyData));
        
        // Show status message temporarily
        const saveStatus = document.getElementById("save-status-msg");
        saveStatus.classList.add("visible");
        setTimeout(() => {
            saveStatus.classList.remove("visible");
        }, 3000);
        
        showToast(`Week ${activeWeek} details saved locally!`, "success");
        renderPreview();
    });
    
    // 5. Week tabs switching
    const tabButtons = document.querySelectorAll("#week-tabs-list .tab-btn");
    tabButtons.forEach(btn => {
        btn.addEventListener("click", function() {
            // Deactivate others
            tabButtons.forEach(b => b.classList.remove("active"));
            // Activate this
            this.classList.add("active");
            
            const weekNum = this.getAttribute("data-week");
            document.getElementById("active-week-num").value = weekNum;
            
            renderWeeklyEntryForm();
        });
    });
    
    // 6. Preview Target Week Selector change
    document.getElementById("preview-target-week").addEventListener("change", function() {
        renderPreview();
    });
    
    // 7. Toggle Retain Previous Weeks change
    const toggleRetainWeeksInput = document.getElementById("toggle-retain-weeks");
    if (toggleRetainWeeksInput) {
        toggleRetainWeeksInput.checked = retainPreviousWeeks;
        toggleRetainWeeksInput.addEventListener("change", function() {
            retainPreviousWeeks = this.checked;
            localStorage.setItem("df_retain_previous_weeks", retainPreviousWeeks.toString());
            renderPreview();
            showToast(retainPreviousWeeks ? "Retaining previous weeks in compile/preview." : "Only compile/preview selected week.", "info");
        });
    }
    

    
    // 8. Word Doc Download Action
    document.getElementById("btn-download-word").addEventListener("click", function() {
        downloadWordDocument();
    });
    
    // 9. Send Email Action
    document.getElementById("btn-send-email").addEventListener("click", function() {
        sendReportViaYahoo();
    });
    
    // 10. Reset Month Action
    document.getElementById("btn-reset-month").addEventListener("click", function() {
        if (confirm(`Are you sure you want to clear all weekly activity details for ${profile.reportMonth}? Settings and active batches will be kept.`)) {
            resetMonthData();
        }
    });

    // 11. Load Demo Action
    document.getElementById("btn-load-demo").addEventListener("click", function() {
        if (confirm("Restore the initial demo template (Daniel Anyamene, July, batches A-E)? This will overwrite your current progress.")) {
            loadDemoTemplate();
        }
    });

    // Gamepad Modal Listeners
    const gamepadBadge = document.getElementById("btn-gamepad-reminder");
    if (gamepadBadge) {
        gamepadBadge.addEventListener("click", openGamepadModal);
    }
    
    const gamepadClose = document.getElementById("btn-close-gamepad-modal");
    if (gamepadClose) {
        gamepadClose.addEventListener("click", closeGamepadModal);
    }
    
    const gamepadAcknowledge = document.getElementById("btn-acknowledge-gamepad");
    if (gamepadAcknowledge) {
        gamepadAcknowledge.addEventListener("click", function() {
            closeGamepadModal();
            localStorage.setItem("df_gamepad_budget_acknowledged", "true");
            showToast("Awesome! Gamepad budget recorded in next month's planning.", "success");
        });
    }
}

// --- 5.5 GAMEPAD BUDGET MODAL LOGIC ---
function openGamepadModal() {
    const modal = document.getElementById("gamepad-modal");
    if (modal) {
        modal.classList.add("active");
    }
}

function closeGamepadModal() {
    const modal = document.getElementById("gamepad-modal");
    if (modal) {
        modal.classList.remove("active");
    }
}

// Delete Batch
window.deleteBatch = function(batchId) {
    if (confirm("Are you sure you want to delete this batch? This will also remove its associated weekly entries.")) {
        // Remove batch
        batches = batches.filter(b => b.id !== batchId);
        localStorage.setItem("df_batches", JSON.stringify(batches));
        
        // Clean up weekly data entries for this batch
        Object.keys(weeklyData).forEach(week => {
            if (weeklyData[week][batchId]) {
                delete weeklyData[week][batchId];
            }
        });
        localStorage.setItem("df_weekly_data", JSON.stringify(weeklyData));
        
        showToast("Batch deleted.", "warning");
        renderBatches();
        renderWeeklyEntryForm();
        renderPreview();
    }
};

// Edit Batch
window.editBatch = function(batchId) {
    const batch = batches.find(b => b.id === batchId);
    if (!batch) return;
    
    document.getElementById("edit-batch-id").value = batchId;
    document.getElementById("new-batch-name").value = batch.name || "";
    document.getElementById("new-batch-start").value = batch.start || "";
    document.getElementById("new-batch-end").value = batch.end || "";
    document.getElementById("new-batch-duration").value = batch.duration || "";
    document.getElementById("new-batch-schedule").value = batch.schedule || "";
    
    document.getElementById("batch-form-title").innerText = "Edit Batch Details";
    document.getElementById("btn-submit-batch").innerText = "Update Batch";
    
    // Show the panel
    document.getElementById("add-batch-panel").style.display = "block";
    
    // Smooth scroll to the form panel
    document.getElementById("batches-section").scrollIntoView({ behavior: 'smooth' });
    
    showToast("Batch details loaded into the editor form above.", "info");
};

// --- 6. EXPORT / GENERATORS LOGIC ---

// Helper: Generate Clean Table HTML string for Doc/Clipboard
function compileCleanReportHTML() {
    const targetWeek = parseInt(document.getElementById("preview-target-week").value);
    
    let html = `
    <html>
    <head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; color: #000000; background-color: #ffffff; }
        .title { font-size: 16px; font-weight: bold; text-align: center; margin-bottom: 5px; text-transform: uppercase; }
        .meta-info { font-size: 12px; text-align: center; margin-bottom: 20px; font-weight: bold; }
        .section-header { font-size: 13px; font-weight: bold; margin-top: 25px; margin-bottom: 8px; text-transform: uppercase; }
        table { border-collapse: collapse; width: 100%; margin-bottom: 20px; font-size: 12px; }
        th, td { border: 1px solid #000000; padding: 8px 10px; text-align: left; vertical-align: top; }
        th { background-color: #f2f2f2; font-weight: bold; }
    </style>
    </head>
    <body>
        <div class="title">NIGGAS MONITORING SHEET</div>
        <div class="meta-info">Month: ${profile.reportMonth} &nbsp;&nbsp;|&nbsp;&nbsp; Program: ${profile.programName} &nbsp;&nbsp;|&nbsp;&nbsp; Instructor: ${profile.tutorName}</div>
        
        <div class="section-header">Batch Information</div>
        <table>
            <thead>
                <tr>
                    <th style="width: 20%">Batch Name</th>
                    <th style="width: 20%">Batch Start Date</th>
                    <th style="width: 20%">Batch End Date</th>
                    <th style="width: 15%">Batch Duration</th>
                    <th style="width: 25%">Schedule (Days/Time)</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    batches.forEach((batch, index) => {
        const name = getBatchDisplayName(batch, index);
        html += `
            <tr>
                <td><strong>${name}</strong></td>
                <td>${batch.start || ""}</td>
                <td>${batch.end || ""}</td>
                <td>${batch.duration || ""}</td>
                <td>${batch.schedule || ""}</td>
            </tr>
        `;
    });
    
    html += `
            </tbody>
        </table>
    `;
    
    const startWeek = retainPreviousWeeks ? 1 : targetWeek;
    for (let w = startWeek; w <= targetWeek; w++) {
        html += `
            <div class="section-header">WEEK ${w}</div>
            <table>
                <thead>
                    <tr>
                        <th style="width: 20%">Batch Name</th>
                        <th style="width: 45%">Topic Covered</th>
                        <th style="width: 15%">Attendance</th>
                        <th style="width: 20%">Remarks</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        batches.forEach((batch, index) => {
            const name = getBatchDisplayName(batch, index);
            const data = (weeklyData[w] && weeklyData[w][batch.id]) || { topic: "", attendance: "", remarks: "" };
            html += `
                <tr>
                    <td><strong>${name}</strong></td>
                    <td>${data.topic || ""}</td>
                    <td>${data.attendance || ""}</td>
                    <td>${data.remarks || ""}</td>
                </tr>
            `;
        });
        
        html += `
                </tbody>
            </table>
        `;
    }
    
    html += `
    </body>
    </html>
    `;
    
    return html;
}

// Copy HTML rich text table to Clipboard
async function copyRichTableToClipboard() {
    const rawHTML = compileCleanReportHTML();
    
    try {
        // Modern Clipboard API support for copying Rich HTML
        const blob = new Blob([rawHTML], { type: "text/html" });
        const textBlob = new Blob([extractPlainTextReport()], { type: "text/plain" });
        
        const clipboardItem = new ClipboardItem({
            "text/html": blob,
            "text/plain": textBlob
        });
        
        await navigator.clipboard.write([clipboardItem]);
        showToast("Rich tables copied! You can now paste (Ctrl+V) directly into Yahoo Mail.", "success");
    } catch (err) {
        console.error("Failed to copy rich HTML: ", err);
        // Fallback to text copy
        try {
            await navigator.clipboard.writeText(extractPlainTextReport());
            showToast("Copied as plain text (Rich format not supported in this browser).", "warning");
        } catch (e) {
            showToast("Clipboard copy failed. Please select report manually.", "danger");
        }
    }
}

// Generate Word Document download (.doc XML format)
function downloadWordDocument() {
    const content = compileCleanReportHTML();
    
    // Add Word namespaces to enable standard print view and page settings
    const docWrapper = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' 
              xmlns:w='urn:schemas-microsoft-com:office:word' 
              xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
            <title>NIGGAS Monitoring Sheet</title>
            <!--[if gte mso 9]>
            <xml>
                <w:WordDocument>
                    <w:View>Print</w:View>
                    <w:Zoom>100</w:Zoom>
                    <w:DoNotOptimizeForBrowser/>
                </w:WordDocument>
            </xml>
            <![endif]-->
        </head>
        <body>
            ${content}
        </body>
        </html>
    `;
    
    const blob = new Blob([docWrapper], { type: "application/msword;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement("a");
    a.href = url;
    a.download = `Niggas_Monitoring_Sheet_${profile.tutorName.replace(/\s+/g, "_")}_${profile.reportMonth}.doc`;
    document.body.appendChild(a);
    a.click();
    
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 100);
    
    showToast("Microsoft Word document downloaded successfully!", "success");
}

// Generate plain text summary for mailto / Yahoo
function extractPlainTextReport() {
    const targetWeek = parseInt(document.getElementById("preview-target-week").value);
    let txt = `NIGGAS MONITORING SHEET\n`;
    txt += `Month: ${profile.reportMonth} | Program: ${profile.programName} | Instructor: ${profile.tutorName}\n\n`;
    
    txt += `=== BATCH INFORMATION ===\n`;
    batches.forEach((batch, index) => {
        const name = getBatchDisplayName(batch, index);
        txt += `- ${name} | Start: ${batch.start || "-"} | End: ${batch.end || "-"} | Schedule: ${batch.schedule}\n`;
    });
    txt += `\n`;
    
    const startWeek = retainPreviousWeeks ? 1 : targetWeek;
    for (let w = startWeek; w <= targetWeek; w++) {
        txt += `=== WEEK ${w} ===\n`;
        batches.forEach((batch, index) => {
            const name = getBatchDisplayName(batch, index);
            const data = (weeklyData[w] && weeklyData[w][batch.id]) || { topic: "", attendance: "", remarks: "" };
            txt += `Batch ${name}:\n`;
            txt += `  * Topic Covered: ${data.topic || "(none)"}\n`;
            txt += `  * Attendance: ${data.attendance || "0"}\n`;
            txt += `  * Remarks: ${data.remarks || "(none)"}\n\n`;
        });
    }
    
    txt += `(Note: Please find the beautifully formatted rich table copied to your clipboard, which you can paste directly here!)`;
    return txt;
}

// Trigger .doc download and open Yahoo Mail compose tab (manual attachment)
function sendReportViaYahoo() {
    const recipient = "akowonjoaccount@digitalfortressltd.com";
    const cc = "Gideon";
    const subject = `${profile.reportMonth} Monitoring sheet`;
    
    // 1. Download the compiled Word doc file automatically!
    downloadWordDocument();
    
    // 2. Draft the exact simple body text from the picture
    const body = `Kindly find attached`;
                 
    // Yahoo Mail compose URL structure with To, Cc, Subject, and Body
    const yahooUrl = `https://compose.mail.yahoo.com/?to=${encodeURIComponent(recipient)}&cc=${encodeURIComponent(cc)}&subj=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    // 3. Open Yahoo Mail Compose in new tab
    window.open(yahooUrl, "_blank");
    showToast("Word document downloaded and Yahoo Mail compose opened!", "success");
}

// --- 7. STARTUP SETUP ---
document.addEventListener("DOMContentLoaded", function() {
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    
    // 1. Initial display using local clock
    document.getElementById("current-date-display").innerText = getActiveDate().toLocaleDateString('en-US', dateOptions);
    
    initializeState();
    
    let autoWeek = calculateCurrentWeek();
    document.getElementById("active-week-num").value = autoWeek;
    
    const updateUIForWeek = (week) => {
        const tabButtons = document.querySelectorAll("#week-tabs-list .tab-btn");
        tabButtons.forEach(btn => {
            if (parseInt(btn.getAttribute("data-week")) === week) {
                btn.classList.add("active");
            } else {
                btn.classList.remove("active");
            }
        });
        document.getElementById("preview-target-week").value = week;
    };
    updateUIForWeek(autoWeek);
    
    renderProfile();
    renderBatches();
    renderWeeklyEntryForm();
    renderPreview();
    setupListeners();
    
    if (window.dfNewMonthAlert) {
        setTimeout(() => {
            showToast(`Welcome to ${window.dfNewMonthAlert}! A new month has started: weekly activity details are reset to blank, but your profile and batches remain saved.`, "info");
        }, 1000);
    }
    
    // 2. Fetch and sync with verified online time asynchronously
    fetchOnlineTime().then(date => {
        document.getElementById("current-date-display").innerText = date.toLocaleDateString('en-US', dateOptions);
        
        // Recheck month-reset and week calculations using verified online time
        initializeState();
        
        const verifiedWeek = calculateCurrentWeek();
        document.getElementById("active-week-num").value = verifiedWeek;
        updateUIForWeek(verifiedWeek);
        
        // Refresh views to match verified date
        renderProfile();
        renderWeeklyEntryForm();
        renderPreview();
        
        if (window.dfNewMonthAlert) {
            showToast(`Welcome to ${window.dfNewMonthAlert}! A new month has started: weekly activity details are reset to blank.`, "info");
            window.dfNewMonthAlert = null;
        }
    });

    // 3. Smoothly fade out the welcome loader screen after 2 seconds
    setTimeout(() => {
        const overlay = document.getElementById("loading-overlay");
        if (overlay) {
            overlay.classList.add("fade-out");
        }
    }, 2000);

    // 4. Auto-open Gamepad Budget Modal after 2.5 seconds if not yet acknowledged
    setTimeout(() => {
        const acknowledged = localStorage.getItem("df_gamepad_budget_acknowledged");
        if (acknowledged !== "true") {
            openGamepadModal();
        }
    }, 2500);
});
