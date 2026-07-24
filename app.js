/**
 * AAA YVR 办事处 - 室友生活管理 (WeChat Mini Program V1.0 MVP Core Logic)
 * Enhanced Chores: Anyone task claiming (shifts to My Tasks & updates name), Deadline date/time adjustment modal, Uncheck log updates
 */

// Initial Default State
const DEFAULT_STATE = {
  currentUser: "Daisy",
  household: {
    name: "AAA YVR 办事处",
    inviteCode: "AAA123",
    admin: "Daisy",
    members: ["Daisy", "Roommate"]
  },
  categories: ["食品 🍔", "日用 🛒", "房租 🏠", "水电 ⚡", "网费 🌐", "其他 📦"],
  statusOptions: ["🏠 在家", "💼 上班", "🎉 出去玩", "🛒 买东西", "😴 睡觉", "✈️ 旅行", "🚌 外出办事"],
  membersStatus: {
    Daisy: {
      status: "🎉 出去玩",
      returnTime: "23:00",
      updateTime: "20:45"
    },
    Roommate: {
      status: "🏠 在家",
      returnTime: "",
      updateTime: "18:20"
    }
  },
  expenses: [
    {
      id: "exp_1",
      title: "Costco 周末买菜",
      amount: 100.00,
      payer: "Daisy",
      participants: ["Daisy", "Roommate"],
      category: "食品 🍔",
      date: "2026-07-20",
      status: "unsettled"
    },
    {
      id: "exp_2",
      title: "BC Hydro 电费网费",
      amount: 130.00,
      payer: "Daisy",
      participants: ["Daisy", "Roommate"],
      category: "水电 ⚡",
      date: "2026-07-21",
      status: "unsettled"
    },
    {
      id: "exp_3",
      title: "大统华日用品",
      amount: 80.00,
      payer: "Roommate",
      participants: ["Daisy", "Roommate"],
      category: "日用 🛒",
      date: "2026-07-22",
      status: "unsettled"
    }
  ],
  settlementHistory: [],
  tasks: [
    {
      id: "task_1",
      title: "倒垃圾 (周三集中处理)",
      assignee: "Roommate",
      frequency: "每周",
      completed: false,
      deadlineDate: "2026-07-22",
      deadlineTime: "22:00"
    },
    {
      id: "task_2",
      title: "洗碗及清理灶台",
      assignee: "任何人",
      frequency: "每日",
      completed: false,
      deadlineDate: "2026-07-22",
      deadlineTime: "21:00"
    },
    {
      id: "task_3",
      title: "阳台晒衣服",
      assignee: "Daisy",
      frequency: "一次性",
      completed: true,
      deadlineDate: "2026-07-22",
      deadlineTime: "14:00"
    },
    {
      id: "task_4",
      title: "补购抽纸与洗洁精",
      assignee: "Daisy",
      frequency: "一次性",
      completed: false,
      deadlineDate: "2026-07-23",
      deadlineTime: "18:00"
    }
  ],
  taskLog: [
    {
      time: "2026-07-22 14:15",
      text: "Daisy 完成了任务: 阳台晒衣服"
    }
  ],
  notices: [
    {
      id: "notice_1",
      creator: "Daisy",
      time: "7月21日 19:30",
      content: "📢 垃圾车周四早上来，请周三晚上前把厨房大垃圾倒掉并在门口分类。"
    },
    {
      id: "notice_2",
      creator: "Roommate",
      time: "7月20日 12:00",
      content: "📢 网费账单已到，我已经让 Daisy 先垫付啦，请大家注意查收明细。"
    }
  ]
};

// Global App State
let state = loadState();
let selectedStatusChip = state.statusOptions[0] || "🏠 在家";
let isTimeEnabled = true;
let currentExpenseFilter = "all";
let currentTaskFilter = "all";

// Initialize on DOM Ready
document.addEventListener("DOMContentLoaded", () => {
  renderAll();
  updateClock();
  setInterval(updateClock, 1000);
  replaceIconsWithEmoji();
  
  // Register Service Worker for PWA support
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').then(reg => {
      console.log('✓ Service Worker registered successfully', reg);
    }).catch(err => {
      console.log('Service Worker registration failed:', err);
    });
  }
});

// Replace Lucide icons with emoji-based placeholders
function replaceIconsWithEmoji() {
  const iconMap = {
    'building-2': '🏢',
    'smartphone': '📱',
    'rotate-ccw': '🔄',
    'wifi': '📶',
    'battery-charging': '🔋',
    'edit-3': '✏️',
    'qr-code': '📲',
    'more-horizontal': '⋯',
    'circle-dot': '●',
    'users': '👥',
    'chevron-right': '›',
    'wallet': '💼',
    'check-square': '☑️',
    'plus': '➕',
    'megaphone': '📢',
    'check-circle-2': '✅',
    'home': '🏠',
    'circle-dollar-sign': '💵',
    'compass': '🧭',
    'user': '👤',
    'x': '✕',
    'bell': '🔔',
    'check': '✓',
    'edit-2': '✏️',
    'trash-2': '🗑️',
    'building': '🏢',
    'shield-check': '🛡️',
    'user-check': '👤',
    'history': '📜',
    'user-plus': '👤➕',
    'share': '📤',
    'tags': '🏷️',
    'rotate-ccw': '🔄',
    'clock': '⏰',
    'send': '📤',
    'edit': '✏️',
    'copy': '📋',
    'plus-circle': '➕'
  };
  
  document.querySelectorAll('[data-lucide]').forEach(el => {
    const iconName = el.getAttribute('data-lucide');
    el.textContent = iconMap[iconName] || '•';
    el.style.fontStyle = 'normal';
  });
}

// State Storage Helpers
function loadState() {
  const saved = localStorage.getItem("aaa_yvr_roommate_state");
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (!parsed.categories) parsed.categories = DEFAULT_STATE.categories;
      if (!parsed.statusOptions) parsed.statusOptions = DEFAULT_STATE.statusOptions;
      if (!parsed.household.members) parsed.household.members = ["Daisy", "Roommate"];
      return parsed;
    } catch(e) { console.error(e); }
  }
  return JSON.parse(JSON.stringify(DEFAULT_STATE));
}

function saveState() {
  localStorage.setItem("aaa_yvr_roommate_state", JSON.stringify(state));
  renderAll();
}

function resetDefaultData() {
  if (confirm("确认恢复到初始演示数据吗？")) {
    state = JSON.parse(JSON.stringify(DEFAULT_STATE));
    saveState();
    showWeChatToast("系统提示", "已成功重置演示数据");
  }
}

// User Perspective Switcher
function switchUserRole(role) {
  state.currentUser = role;
  saveState();
  showWeChatToast("切换身份", `当前以 ${role} 的视角操作`);
}

// Phone Simulator Frame Toggle
function toggleFrameMode() {
  const container = document.getElementById("simulator-container");
  const btnText = document.getElementById("view-mode-text");
  if (container.classList.contains("mode-phone")) {
    container.classList.remove("mode-phone");
    container.classList.add("mode-desktop");
    btnText.textContent = "全屏视图";
  } else {
    container.classList.remove("mode-desktop");
    container.classList.add("mode-phone");
    btnText.textContent = "模拟器视图";
  }
}

// Clock Header
function updateClock() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const clockElem = document.getElementById("phone-clock");
  if (clockElem) clockElem.textContent = `${hours}:${minutes}`;
}

// Tab Navigation
function switchTab(tabId) {
  const tabs = document.querySelectorAll(".tab-view");
  tabs.forEach(t => t.classList.remove("active"));
  
  const targetTab = document.getElementById(`tab-${tabId}`);
  if (targetTab) targetTab.classList.add("active");

  const tabBtns = document.querySelectorAll(".tab-item");
  tabBtns.forEach((btn, idx) => {
    btn.classList.remove("active");
    if (
      (tabId === 'dashboard' && idx === 0) ||
      (tabId === 'finance' && idx === 1) ||
      (tabId === 'chores' && idx === 2) ||
      (tabId === 'status' && idx === 3) ||
      (tabId === 'profile' && idx === 4)
    ) {
      btn.classList.add("active");
    }
  });

  replaceIconsWithEmoji();
}

// Dynamic Calculation Engine for Multi-Member Debt Balance
function calculateNetBalance() {
  const memberSpends = {};
  const memberNetOwed = {}; // Positive = owed money, Negative = owes money to group

  state.household.members.forEach(m => {
    memberSpends[m] = 0;
    memberNetOwed[m] = 0;
  });

  state.expenses.forEach(exp => {
    if (exp.status === "unsettled") {
      const payer = exp.payer;
      const parts = exp.participants.filter(p => state.household.members.includes(p));
      const shareCount = parts.length || 1;
      const perPersonShare = exp.amount / shareCount;

      if (memberSpends[payer] !== undefined) {
        memberSpends[payer] += exp.amount;
        memberNetOwed[payer] += exp.amount;
      }

      parts.forEach(p => {
        if (memberNetOwed[p] !== undefined) {
          memberNetOwed[p] -= perPersonShare;
        }
      });
    }
  });

  return { memberSpends, memberNetOwed };
}

// MAIN RENDER CONTROLLER
function renderAll() {
  // Update Header UI
  document.getElementById("top-brand-title").textContent = state.household.name;
  document.getElementById("display-space-name").innerHTML = `${state.household.name} <i data-lucide="edit-3" style="width:12px;height:12px;"></i>`;
  document.getElementById("display-invite-code").textContent = state.household.inviteCode;

  // Render User Switcher Select Options
  const userSelect = document.getElementById("user-role-select");
  userSelect.innerHTML = state.household.members.map(m => `
    <option value="${m}" ${m === state.currentUser ? 'selected' : ''}>${m} (${m === state.household.admin ? '创建人' : '室友'})</option>
  `).join("");

  document.getElementById("status-current-user-name").textContent = state.currentUser;

  // Compute Financial Balances
  const finCalc = calculateNetBalance();

  // Render Dashboard
  renderDashboard(finCalc);

  // Render Financial Tab
  renderFinanceTab(finCalc);

  // Render Chores Tab
  renderChoresTab();

  // Render Status & Notice Tab
  renderStatusAndNoticesTab();

  // Render Profile Tab
  renderProfileTab();

  replaceIconsWithEmoji();
}

// Render Dashboard Tab
function renderDashboard(fin) {
  // 1. Status Grid
  const statusGrid = document.getElementById("dashboard-status-grid");
  statusGrid.innerHTML = state.household.members.map(m => {
    const st = state.membersStatus[m] || { status: "🏠 在家", returnTime: "", updateTime: "刚才" };
    return `
      <div class="member-status-tile">
        <div class="tile-avatar ${m === 'Roommate' ? 'roommate' : m !== 'Daisy' ? 'custom' : ''}">${m[0]}</div>
        <div class="tile-info">
          <span class="tile-name">${m}</span>
          <span class="tile-status-tag">${st.status}</span>
          <span class="tile-time">${st.returnTime ? '预计 ' + st.returnTime + ' 回' : '更新于 ' + st.updateTime}</span>
        </div>
      </div>
    `;
  }).join("");

  // 2. Financial Banner
  const heroText = document.getElementById("dash-settlement-text");
  const heroSubtext = document.getElementById("dash-settlement-subtext");
  const badge = document.getElementById("dash-fin-badge");

  const members = state.household.members;
  if (members.length >= 2) {
    const m1 = members[0];
    const m2 = members[1];
    const net1 = fin.memberNetOwed[m1] || 0;

    if (Math.abs(net1) < 0.01) {
      heroText.textContent = "账目已总结清 $0.00";
      heroText.className = "hero-amount";
      heroSubtext.textContent = "室友间互不相欠，太棒啦！";
      badge.textContent = "已自动平衡";
      badge.className = "ios-badge accent";
    } else if (net1 > 0) {
      heroText.textContent = `${m2} 欠 ${m1} $${net1.toFixed(2)}`;
      heroText.className = "hero-amount owe-alert";
      heroSubtext.textContent = `按照分摊人数量自动平摊计算`;
      badge.textContent = "待结算账目";
      badge.className = "ios-badge";
    } else {
      heroText.textContent = `${m1} 欠 ${m2} $${Math.abs(net1).toFixed(2)}`;
      heroText.className = "hero-amount owe-alert";
      heroSubtext.textContent = `按照分摊人数量自动平摊计算`;
      badge.textContent = "待结算账目";
      badge.className = "ios-badge";
    }
  }

  // Spend Row
  const spendRow = document.getElementById("dash-member-spend-row");
  spendRow.innerHTML = state.household.members.map((m, idx) => `
    ${idx > 0 ? '<div class="stat-divider"></div>' : ''}
    <div class="stat-col">
      <span class="stat-meta">${m} 本月支出</span>
      <span class="stat-val">$${(fin.memberSpends[m] || 0).toFixed(2)}</span>
    </div>
  `).join("");

  // 3. Task Quick List
  const dashTaskList = document.getElementById("dashboard-task-list");
  const pendingTasks = state.tasks.filter(t => !t.completed).slice(0, 3);
  if (pendingTasks.length === 0) {
    dashTaskList.innerHTML = `<div class="text-center py-2 color-sec" style="font-size:13px; color:#8E8E93;">🎉 今日所有家务已打卡完毕！</div>`;
  } else {
    dashTaskList.innerHTML = pendingTasks.map(t => `
      <div class="task-item-row">
        <div class="task-left">
          <div class="ios-checkbox ${t.completed ? 'checked' : ''}" onclick="toggleTaskCompletion('${t.id}')">
            ${t.completed ? '<i data-lucide="check" style="width:14px;height:14px;"></i>' : ''}
          </div>
          <span class="task-name ${t.completed ? 'done' : ''}">${t.title}</span>
        </div>
        <div style="display:flex;align-items:center;gap:6px;">
          <span class="task-assignee-badge ${t.assignee === '任何人' ? 'anyone' : t.assignee === 'Roommate' ? 'roommate' : ''}">${t.assignee}</span>
          ${t.assignee === '任何人' ? `<button class="nudge-btn" onclick="claimTask('${t.id}')">认领</button>` : t.assignee !== state.currentUser ? `<button class="nudge-btn" onclick="nudgeTask('${t.title}', '${t.assignee}')">催催</button>` : ''}
        </div>
      </div>
    `).join("");
  }

  // 4. Notice Preview
  const noticePreview = document.getElementById("dashboard-notice-preview");
  if (state.notices.length > 0) {
    const topNotice = state.notices[0];
    noticePreview.innerHTML = `
      <div class="notice-header">
        <span>发布人: ${topNotice.creator}</span>
        <span>${topNotice.time}</span>
      </div>
      <div class="notice-content">${topNotice.content}</div>
    `;
  } else {
    noticePreview.innerHTML = `<div class="color-sec" style="font-size:13px; color:#8E8E93;">暂无公共告示</div>`;
  }
}

// Render Financial Tab
function renderFinanceTab(fin) {
  const heroStatus = document.getElementById("finance-hero-status");
  const settleBtn = document.getElementById("settle-up-btn");

  const members = state.household.members;
  if (members.length >= 2) {
    const m1 = members[0];
    const m2 = members[1];
    const net1 = fin.memberNetOwed[m1] || 0;

    if (Math.abs(net1) < 0.01) {
      heroStatus.innerHTML = `
        <div class="hero-amount" style="color:#34C759;font-size:22px;font-weight:700;">账目已平 $0.00</div>
        <p class="hero-subtext">目前没有任何未结清的合租费用</p>
      `;
      settleBtn.style.display = "none";
    } else {
      settleBtn.style.display = "flex";
      if (net1 > 0) {
        heroStatus.innerHTML = `
          <div class="hero-amount owe-alert" style="color:#FF9500;font-size:22px;font-weight:700;">${m2} 应还 ${m1} $${net1.toFixed(2)}</div>
          <p class="hero-subtext">自动按参与分摊人数除法计算，可线下转账后一键还款</p>
        `;
      } else {
        heroStatus.innerHTML = `
          <div class="hero-amount owe-alert" style="color:#FF9500;font-size:22px;font-weight:700;">${m1} 应还 ${m2} $${Math.abs(net1).toFixed(2)}</div>
          <p class="hero-subtext">自动按参与分摊人数除法计算，可线下转账后一键还款</p>
        `;
      }
    }
  }

  // Expense List Filtering
  const expContainer = document.getElementById("expense-list");
  let filtered = state.expenses;
  if (currentExpenseFilter === "unsettled") {
    filtered = state.expenses.filter(e => e.status === "unsettled");
  } else if (currentExpenseFilter === "settled") {
    filtered = state.settlementHistory;
  }

  if (currentExpenseFilter === "settled") {
    if (state.settlementHistory.length === 0) {
      expContainer.innerHTML = `<div style="text-align:center;padding:24px;color:#8E8E93;font-size:13px;">暂无历史还款平账记录</div>`;
    } else {
      expContainer.innerHTML = state.settlementHistory.map(s => `
        <div class="expense-card-item">
          <div class="exp-left">
            <div class="exp-icon" style="background:rgba(52,199,89,0.1);color:#34C759;">✓</div>
            <div>
              <div class="exp-title">还款结算</div>
              <div class="exp-meta">${s.from} → ${s.to} • ${s.date}</div>
            </div>
          </div>
          <div class="exp-right">
            <div class="exp-amount" style="color:#34C759;">$${s.amount.toFixed(2)}</div>
            <div class="exp-status-tag">已结清</div>
          </div>
        </div>
      `).join("");
    }
  } else {
    if (filtered.length === 0) {
      expContainer.innerHTML = `<div style="text-align:center;padding:24px;color:#8E8E93;font-size:13px;">暂无相关账单记录</div>`;
    } else {
      expContainer.innerHTML = filtered.map(e => `
        <div class="expense-card-item">
          <div class="exp-left">
            <div class="exp-icon">${e.category.split(' ')[1] || '💰'}</div>
            <div>
              <div class="exp-title">${e.title}</div>
              <div class="exp-meta">${e.payer} 先付 • 分摊: ${e.participants.join('/')} ($${(e.amount/e.participants.length).toFixed(2)}/人) • ${e.date}</div>
            </div>
          </div>
          <div class="exp-right">
            <div class="exp-amount">$${e.amount.toFixed(2)}</div>
            <div class="exp-status-tag ${e.status === 'unsettled' ? 'unsettled' : ''}">${e.status === 'unsettled' ? '待结算' : '已清算'}</div>
          </div>
        </div>
      `).join("");
    }
  }
}

// Handle Settle Up Action
function handleSettleUp() {
  const fin = calculateNetBalance();
  const members = state.household.members;
  if (members.length < 2) return;
  const m1 = members[0];
  const m2 = members[1];
  const net1 = fin.memberNetOwed[m1] || 0;

  if (Math.abs(net1) < 0.01) return;

  const dateStr = new Date().toLocaleDateString("zh-CN");
  let recordText = "";

  if (net1 > 0) {
    state.settlementHistory.unshift({ from: m2, to: m1, amount: net1, date: dateStr });
    recordText = `${m2} 已成功还款给 ${m1} $${net1.toFixed(2)}`;
  } else {
    state.settlementHistory.unshift({ from: m1, to: m2, amount: Math.abs(net1), date: dateStr });
    recordText = `${m1} 已成功还款给 ${m2} $${Math.abs(net1).toFixed(2)}`;
  }

  // Mark all expenses as settled
  state.expenses.forEach(e => e.status = "settled");

  saveState();
  showWeChatToast("结算平账成功 🤝", recordText);
}

// Filter Expenses
function filterExpenses(type, btnElem) {
  currentExpenseFilter = type;
  const parent = btnElem.parentElement;
  parent.querySelectorAll('.segment-btn').forEach(b => b.classList.remove('active'));
  btnElem.classList.add('active');
  renderAll();
}

// Render Chores Tab (Pills order: 全部任务 -> 任何人可领 -> 我的任务)
function renderChoresTab() {
  const filterPillsContainer = document.getElementById("chores-filter-pills");
  filterPillsContainer.innerHTML = `
    <button class="pill-filter ${currentTaskFilter === 'all' ? 'active' : ''}" onclick="filterTasks('all', this)">全部任务</button>
    <button class="pill-filter ${currentTaskFilter === 'anyone' ? 'active' : ''}" onclick="filterTasks('anyone', this)">任何人可领</button>
    <button class="pill-filter ${currentTaskFilter === 'my' ? 'active' : ''}" onclick="filterTasks('my', this)">我的任务 (${state.currentUser})</button>
  `;

  const taskContainer = document.getElementById("task-list-container");
  let filtered = state.tasks;
  if (currentTaskFilter === "my") {
    filtered = state.tasks.filter(t => t.assignee === state.currentUser);
  } else if (currentTaskFilter === "anyone") {
    filtered = state.tasks.filter(t => t.assignee === "任何人");
  }

  if (filtered.length === 0) {
    taskContainer.innerHTML = `<div class="ios-card text-center py-4" style="color:#8E8E93;font-size:13px;">没有找到任务</div>`;
  } else {
    taskContainer.innerHTML = `
      <div class="ios-card">
        <div class="task-quick-list">
          ${filtered.map(t => {
            const deadlineText = t.deadlineDate ? `${t.deadlineDate} ${t.deadlineTime || ''}` : t.deadline || '无截止时间';
            return `
              <div class="task-item-row">
                <div class="task-left">
                  <div class="ios-checkbox ${t.completed ? 'checked' : ''}" onclick="toggleTaskCompletion('${t.id}')">
                    ${t.completed ? '<i data-lucide="check" style="width:14px;height:14px;"></i>' : ''}
                  </div>
                  <div>
                    <div class="task-name ${t.completed ? 'done' : ''}">${t.title}</div>
                    <div style="font-size:11px;color:#8E8E93;margin-top:2px;">周期: ${t.frequency} • 截止: ${deadlineText}</div>
                  </div>
                </div>
                <div style="display:flex;align-items:center;gap:6px;">
                  <button class="icon-circle-btn" onclick="openEditTaskModal('${t.id}')" title="调整截止日期/时间/负责人" style="width:22px;height:22px;"><i data-lucide="edit-2" style="width:11px;height:11px;"></i></button>
                  <span class="task-assignee-badge ${t.assignee === '任何人' ? 'anyone' : t.assignee === 'Roommate' ? 'roommate' : ''}">${t.assignee}</span>
                  ${t.assignee === '任何人' ? `<button class="nudge-btn" onclick="claimTask('${t.id}')">认领</button>` : t.assignee !== state.currentUser && !t.completed ? `<button class="nudge-btn" onclick="nudgeTask('${t.title}', '${t.assignee}')">催催</button>` : ''}
                </div>
              </div>
            `;
          }).join("")}
        </div>
      </div>
    `;
  }

  // Render Activity Log
  const logContainer = document.getElementById("task-activity-log");
  if (state.taskLog.length === 0) {
    logContainer.innerHTML = `<div style="font-size:12px;color:#8E8E93;">暂无打卡与变更日志</div>`;
  } else {
    logContainer.innerHTML = state.taskLog.slice(0, 8).map(l => `
      <div class="timeline-item">
        <i data-lucide="${l.text.includes('认领') ? 'user-check' : l.text.includes('取消') ? 'rotate-ccw' : 'check-circle'}" style="width:16px;height:16px;color:${l.text.includes('取消') ? '#FF9500' : '#34C759'};"></i>
        <div class="timeline-text">${l.text}</div>
        <div class="timeline-time">${l.time}</div>
      </div>
    `).join("");
  }
}

function filterTasks(type, btnElem) {
  currentTaskFilter = type;
  renderAll();
}

// Claim Task Function (Assigns to current user & shifts to My Tasks)
function claimTask(taskId) {
  const task = state.tasks.find(t => t.id === taskId);
  if (!task) return;

  const oldAssignee = task.assignee;
  task.assignee = state.currentUser;

  const now = new Date();
  const timeStr = `${now.getMonth()+1}月${now.getDate()}日 ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
  state.taskLog.unshift({
    time: timeStr,
    text: `${state.currentUser} 认领了任务: ${task.title}`
  });

  saveState();
  showWeChatToast("任务认领成功 🧹", `“${task.title}”已放入“我的任务”，负责人修改为 ${state.currentUser}`);
}

// Toggle Task Completion & Log Unchecking
function toggleTaskCompletion(taskId) {
  const task = state.tasks.find(t => t.id === taskId);
  if (!task) return;

  task.completed = !task.completed;
  const now = new Date();
  const timeStr = `${now.getMonth()+1}月${now.getDate()}日 ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;

  if (task.completed) {
    state.taskLog.unshift({
      time: timeStr,
      text: `${state.currentUser} 完成了任务: ${task.title}`
    });
    showWeChatToast("家务打卡成功 🎉", `你已完成“${task.title}”`);
  } else {
    state.taskLog.unshift({
      time: timeStr,
      text: `${state.currentUser} 取消勾选了任务: ${task.title} (重新开放)`
    });
    showWeChatToast("取消完成状态 🔄", `“${task.title}”已重置为待办状态`);
  }
  saveState();
}

function nudgeTask(title, assignee) {
  showWeChatToast("催催提醒 🔔", `已向 ${assignee} 发送提醒: 请尽快完成“${title}”`);
}

// Render Status & Notice Tab (with Delete button on chips & optional return time toggle)
function renderStatusAndNoticesTab() {
  // Status Selector Grid Buttons
  const grid = document.getElementById("status-options-grid");
  grid.innerHTML = state.statusOptions.map(st => `
    <div class="status-chip-wrapper">
      <button class="status-chip ${st === selectedStatusChip ? 'selected' : ''}" onclick="selectStatus('${st}')">
        <span>${st}</span>
        ${state.statusOptions.length > 1 ? `<span class="status-chip-del" onclick="event.stopPropagation(); deleteStatus('${st}')" title="删除该状态">×</span>` : ''}
      </button>
    </div>
  `).join("");

  // Time picker input enable state
  const timeInput = document.getElementById("return-time-input");
  timeInput.disabled = !isTimeEnabled;

  // Full Status List
  const fullStatusList = document.getElementById("full-status-list");
  fullStatusList.innerHTML = state.household.members.map(m => {
    const st = state.membersStatus[m] || { status: "🏠 在家", returnTime: "", updateTime: "刚才" };
    return `
      <div class="full-status-item">
        <div class="full-status-left">
          <div class="tile-avatar ${m === 'Roommate' ? 'roommate' : m !== 'Daisy' ? 'custom' : ''}">${m[0]}</div>
          <div>
            <strong style="font-size:14px;">${m}</strong>
            <div style="font-size:11px;color:#8E8E93;">更新于 ${st.updateTime}</div>
          </div>
        </div>
        <div class="full-status-badge">${st.status} ${st.returnTime ? '(' + st.returnTime + '回)' : ''}</div>
      </div>
    `;
  }).join("");

  // Notice List
  const noticeList = document.getElementById("notice-list");
  if (state.notices.length === 0) {
    noticeList.innerHTML = `<div style="text-align:center;padding:16px;color:#8E8E93;font-size:13px;">暂无任何告示</div>`;
  } else {
    noticeList.innerHTML = state.notices.map(n => `
      <div class="notice-card-item">
        <div class="notice-header">
          <span>${n.creator} • ${n.time}</span>
          <button class="notice-delete-btn" onclick="deleteNotice('${n.id}')"><i data-lucide="trash-2" style="width:14px;height:14px;"></i></button>
        </div>
        <div class="notice-content">${n.content}</div>
      </div>
    `).join("");
  }
}

function toggleTimePicker(enabled) {
  isTimeEnabled = enabled;
  const timeInput = document.getElementById("return-time-input");
  timeInput.disabled = !enabled;
}

function selectStatus(statusStr) {
  selectedStatusChip = statusStr;
  renderStatusAndNoticesTab();
}

function deleteStatus(statusStr) {
  if (confirm(`确认删除状态选项“${statusStr}”吗？`)) {
    state.statusOptions = state.statusOptions.filter(s => s !== statusStr);
    if (selectedStatusChip === statusStr) {
      selectedStatusChip = state.statusOptions[0] || "🏠 在家";
    }
    saveState();
    showWeChatToast("状态已移除", `已删除状态选项“${statusStr}”`);
  }
}

function submitStatusUpdate() {
  const returnTimeVal = isTimeEnabled ? (document.getElementById("return-time-input").value || "23:00") : "";
  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;

  if (!state.membersStatus[state.currentUser]) {
    state.membersStatus[state.currentUser] = {};
  }

  state.membersStatus[state.currentUser] = {
    status: selectedStatusChip,
    returnTime: returnTimeVal,
    updateTime: timeStr
  };

  saveState();
  showWeChatToast("状态已更新 🏠", `${state.currentUser} 的当前状态修改为: ${selectedStatusChip} ${returnTimeVal ? '(预计 ' + returnTimeVal + ' 回)' : ''}`);
}

function deleteNotice(noticeId) {
  state.notices = state.notices.filter(n => n.id !== noticeId);
  saveState();
  showWeChatToast("告示已移除", "所选公共告示已撤销");
}

// Render Profile Tab
function renderProfileTab() {
  document.getElementById("profile-avatar").textContent = state.currentUser[0];
  document.getElementById("profile-nickname").textContent = state.currentUser;
  document.getElementById("profile-role-badge").textContent = state.currentUser === state.household.admin ? "Household Admin (空间创建人)" : "Roommate Member (成员)";
  document.getElementById("profile-space-name").textContent = state.household.name;
  document.getElementById("profile-invite-code").innerHTML = `${state.household.inviteCode} <i data-lucide="copy" style="width:12px;height:12px;"></i>`;
  document.getElementById("profile-members-count").textContent = `${state.household.members.length} 人 (${state.household.members.join(", ")})`;
}

// Modal Controllers
function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.add("active");
  replaceIconsWithEmoji();
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove("active");
}

function openAddExpenseModal() {
  // Populate category select & member checkboxes
  const catSelect = document.getElementById("exp-category");
  catSelect.innerHTML = state.categories.map(c => `<option value="${c}">${c}</option>`).join("");

  const payerSelect = document.getElementById("exp-payer");
  payerSelect.innerHTML = state.household.members.map(m => `<option value="${m}">${m}</option>`).join("");

  const checkGroup = document.getElementById("exp-participants-checkboxes");
  checkGroup.innerHTML = state.household.members.map(m => `
    <label class="ios-checkbox-label">
      <input type="checkbox" class="part-chk" value="${m}" checked onchange="updateSplitPreview()"> ${m}
    </label>
  `).join("");

  updateSplitPreview();
  openModal("modal-add-expense");
}

// Dynamic Split Amount Preview Hint Calculation
function updateSplitPreview() {
  const amountVal = parseFloat(document.getElementById("exp-amount").value) || 0;
  const checkedChks = document.querySelectorAll(".part-chk:checked");
  const count = checkedChks.length;
  const hint = document.getElementById("split-preview-hint");

  if (count === 0) {
    hint.textContent = "⚠️ 请至少勾选 1 位分摊人";
    hint.style.color = "#FF3B30";
  } else {
    const perPerson = amountVal / count;
    hint.textContent = `💡 共 ${count} 人参与分摊，每人应付 $${perPerson.toFixed(2)} CAD`;
    hint.style.color = "#007AFF";
  }
}

function openAddTaskModal() {
  const assigneeSelect = document.getElementById("task-assignee");
  assigneeSelect.innerHTML = `
    <option value="任何人">任何人 ( Anyone )</option>
    ${state.household.members.map(m => `<option value="${m}">${m}</option>`).join("")}
  `;

  // Default date to today
  const todayStr = new Date().toISOString().split('T')[0];
  document.getElementById("task-deadline-date").value = todayStr;

  openModal("modal-add-task");
}

function openEditTaskModal(taskId) {
  const task = state.tasks.find(t => t.id === taskId);
  if (!task) return;

  document.getElementById("edit-task-id").value = task.id;
  document.getElementById("edit-task-title").value = task.title;

  const assigneeSelect = document.getElementById("edit-task-assignee");
  assigneeSelect.innerHTML = `
    <option value="任何人" ${task.assignee === '任何人' ? 'selected' : ''}>任何人 ( Anyone )</option>
    ${state.household.members.map(m => `<option value="${m}" ${m === task.assignee ? 'selected' : ''}>${m}</option>`).join("")}
  `;

  const todayStr = new Date().toISOString().split('T')[0];
  document.getElementById("edit-task-deadline-date").value = task.deadlineDate || todayStr;
  document.getElementById("edit-task-deadline-time").value = task.deadlineTime || "22:00";

  openModal("modal-edit-task");
}

function handleEditTaskSubmit(e) {
  e.preventDefault();
  const id = document.getElementById("edit-task-id").value;
  const task = state.tasks.find(t => t.id === id);
  if (!task) return;

  task.title = document.getElementById("edit-task-title").value;
  task.assignee = document.getElementById("edit-task-assignee").value;
  task.deadlineDate = document.getElementById("edit-task-deadline-date").value;
  task.deadlineTime = document.getElementById("edit-task-deadline-time").value;

  const now = new Date();
  const timeStr = `${now.getMonth()+1}月${now.getDate()}日 ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
  state.taskLog.unshift({
    time: timeStr,
    text: `${state.currentUser} 调整了任务“${task.title}”的截止时间与负责人 (${task.assignee})`
  });

  saveState();
  closeModal("modal-edit-task");
  showWeChatToast("任务调整保存 ✏️", `已成功修改“${task.title}”的截止日期与负责人`);
}

function openAddNoticeModal() { openModal("modal-add-notice"); }
function openAddCategoryModal() {
  renderCategoryManageList();
  openModal("modal-add-category");
}

function renderCategoryManageList() {
  const list = document.getElementById("category-manage-list");
  list.innerHTML = state.categories.map(c => `
    <div class="cat-item-pill">
      <span>${c}</span>
      ${state.categories.length > 1 ? `<button class="cat-del-btn" onclick="deleteCategory('${c}')" title="删除分类"><i data-lucide="trash-2" style="width:12px;height:12px;"></i></button>` : ''}
    </div>
  `).join("");
  replaceIconsWithEmoji();
}

function deleteCategory(catName) {
  if (confirm(`确认删除分类“${catName}”吗？`)) {
    state.categories = state.categories.filter(c => c !== catName);
    saveState();
    renderCategoryManageList();
    showWeChatToast("分类已移除", `已删除分类: ${catName}`);
  }
}

function openAddCustomStatusModal() { openModal("modal-add-status"); }
function openRenameSpaceModal() {
  document.getElementById("rename-space-input").value = state.household.name;
  openModal("modal-rename-space");
}
function openRenameMemberModal() {
  document.getElementById("rename-member-input").value = state.currentUser;
  openModal("modal-rename-member");
}
function openAddMemberModal() { openModal("modal-add-member"); }

function showInviteModal() {
  document.getElementById("modal-invite-code-display").textContent = state.household.inviteCode;
  document.getElementById("modal-space-name-display").textContent = state.household.name;
  openModal("modal-invite");
}
function showCreateSpaceModal() { openModal("modal-create-space"); }

// Forms Handlers
function handleAddExpenseSubmit(e) {
  e.preventDefault();
  const title = document.getElementById("exp-title").value;
  const amount = parseFloat(document.getElementById("exp-amount").value);
  const category = document.getElementById("exp-category").value;
  const payer = document.getElementById("exp-payer").value;

  const checkedChks = document.querySelectorAll(".part-chk:checked");
  const participants = Array.from(checkedChks).map(c => c.value);

  if (participants.length === 0) {
    alert("请至少勾选 1 位分摊人！");
    return;
  }

  const newExp = {
    id: "exp_" + Date.now(),
    title,
    amount,
    payer,
    participants,
    category,
    date: new Date().toISOString().split('T')[0],
    status: "unsettled"
  };

  state.expenses.unshift(newExp);
  saveState();
  closeModal("modal-add-expense");
  e.target.reset();
  showWeChatToast("记账成功 💰", `已添加账单: ${title} $${amount.toFixed(2)} (${participants.length}人平摊)`);
}

function handleAddTaskSubmit(e) {
  e.preventDefault();
  const title = document.getElementById("task-title").value;
  const assignee = document.getElementById("task-assignee").value;
  const frequency = document.getElementById("task-frequency").value;
  const deadlineDate = document.getElementById("task-deadline-date").value;
  const deadlineTime = document.getElementById("task-deadline-time").value;

  const newTask = {
    id: "task_" + Date.now(),
    title,
    assignee,
    frequency,
    completed: false,
    deadlineDate,
    deadlineTime
  };

  state.tasks.unshift(newTask);
  saveState();
  closeModal("modal-add-task");
  e.target.reset();
  showWeChatToast("任务已发布 🧹", `已发布任务“${title}” (${assignee}) 截止时间: ${deadlineDate} ${deadlineTime}`);
}

function handleAddNoticeSubmit(e) {
  e.preventDefault();
  const content = document.getElementById("notice-content").value;
  const now = new Date();
  const timeStr = `${now.getMonth()+1}月${now.getDate()}日 ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;

  const newNotice = {
    id: "notice_" + Date.now(),
    creator: state.currentUser,
    time: timeStr,
    content: "📢 " + content
  };

  state.notices.unshift(newNotice);
  saveState();
  closeModal("modal-add-notice");
  e.target.reset();
  showWeChatToast("公告已发布 📢", "房间公共告示已更新");
}

function handleCreateCategory(e) {
  e.preventDefault();
  const cat = document.getElementById("new-cat-input").value.trim();
  if (cat && !state.categories.includes(cat)) {
    state.categories.push(cat);
    saveState();
    renderCategoryManageList();
    document.getElementById("new-cat-input").value = "";
    showWeChatToast("分类已新增 🏷️", `已增加自定义分类: ${cat}`);
  }
}

function handleCreateStatus(e) {
  e.preventDefault();
  const st = document.getElementById("new-status-input").value.trim();
  if (st && !state.statusOptions.includes(st)) {
    state.statusOptions.push(st);
    selectedStatusChip = st;
    saveState();
    closeModal("modal-add-status");
    showWeChatToast("状态已增加 🌟", `已创建自定义状态: ${st}`);
  }
}

function handleRenameSpace(e) {
  e.preventDefault();
  const newName = document.getElementById("rename-space-input").value.trim();
  if (newName) {
    state.household.name = newName;
    saveState();
    closeModal("modal-rename-space");
    showWeChatToast("名称修改成功 🏠", `家庭空间名称改名位: ${newName}`);
  }
}

function handleRenameMember(e) {
  e.preventDefault();
  const newName = document.getElementById("rename-member-input").value.trim();
  if (newName) {
    const oldName = state.currentUser;
    const idx = state.household.members.indexOf(oldName);
    if (idx !== -1) {
      state.household.members[idx] = newName;
    }
    if (state.household.admin === oldName) state.household.admin = newName;

    // Migrate statuses
    if (state.membersStatus[oldName]) {
      state.membersStatus[newName] = state.membersStatus[oldName];
      delete state.membersStatus[oldName];
    }
    state.currentUser = newName;

    saveState();
    closeModal("modal-rename-member");
    showWeChatToast("昵称修改成功 👤", `你的昵称已修改为: ${newName}`);
  }
}

function handleAddMemberSubmit(e) {
  e.preventDefault();
  const name = document.getElementById("add-member-name-input").value.trim();
  if (name && !state.household.members.includes(name)) {
    state.household.members.push(name);
    state.membersStatus[name] = { status: "🏠 在家", returnTime: "--:--", updateTime: "新加入" };
    saveState();
    closeModal("modal-add-member");
    showWeChatToast("新室友加入 🤝", `已成功添加室友: ${name}`);
  }
}

function switchSpaceTab(type) {
  const createForm = document.getElementById("form-create-space");
  const joinForm = document.getElementById("form-join-space");
  const btnCreate = document.getElementById("tab-btn-create");
  const btnJoin = document.getElementById("tab-btn-join");

  if (type === "create") {
    createForm.style.display = "block";
    joinForm.style.display = "none";
    btnCreate.classList.add("active");
    btnJoin.classList.remove("active");
  } else {
    createForm.style.display = "none";
    joinForm.style.display = "block";
    btnJoin.classList.add("active");
    btnCreate.classList.remove("active");
  }
}

function handleCreateSpace(e) {
  e.preventDefault();
  const name = document.getElementById("new-space-name").value;
  const newCode = "AAA" + Math.floor(100 + Math.random() * 900);
  state.household.name = name;
  state.household.inviteCode = newCode;
  saveState();
  closeModal("modal-create-space");
  showWeChatToast("新空间创建成功 🏠", `已创建 ${name}，邀请码: ${newCode}`);
}

function handleJoinSpace(e) {
  e.preventDefault();
  const code = document.getElementById("join-invite-code").value.trim();
  if (!code) return;
  state.household.inviteCode = code.toUpperCase();
  saveState();
  closeModal("modal-create-space");
  showWeChatToast("已加入空间 🔑", `成功加入邀请码为 ${code.toUpperCase()} 的家庭空间`);
}

function copyInviteCode() {
  navigator.clipboard.writeText(state.household.inviteCode).then(() => {
    showWeChatToast("已复制到剪贴板 📋", `邀请码 ${state.household.inviteCode} 已复制，可直接粘贴发给室友`);
  }).catch(() => {
    showWeChatToast("邀请码", state.household.inviteCode);
  });
}

function simulateWeChatSubscribe() {
  showWeChatToast("微信订阅成功 🔔", "已开启室友晚回、家务到期与催催消息提醒");
}

// Simulated WeChat Notification Toast
function showWeChatToast(title, desc) {
  const toast = document.getElementById("wechat-toast");
  document.getElementById("toast-title").textContent = title;
  document.getElementById("toast-desc").textContent = desc;

  toast.classList.add("active");
  setTimeout(() => {
    toast.classList.remove("active");
  }, 3200);
}
