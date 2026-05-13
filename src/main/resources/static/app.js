const apiBase = '/api';
let currentUser = null;

const elements = {
  authSection: document.getElementById('authSection'),
  dashboard: document.getElementById('dashboard'),
  responseSection: document.getElementById('responseSection'),
  messageSection: document.getElementById('messageSection'),
  responseOutput: document.getElementById('responseOutput'),
  messageText: document.getElementById('messageText'),
  userBar: document.getElementById('userBar'),
  userLabel: document.getElementById('userLabel'),
  loginTab: document.getElementById('loginTab'),
  registerTab: document.getElementById('registerTab'),
  loginForm: document.getElementById('loginForm'),
  registerForm: document.getElementById('registerForm'),
  residentPanel: document.getElementById('residentPanel'),
  guardPanel: document.getElementById('guardPanel'),
  adminPanel: document.getElementById('adminPanel')
};

const fields = {
  loginEmail: document.getElementById('loginEmail'),
  loginPassword: document.getElementById('loginPassword'),
  regName: document.getElementById('regName'),
  regEmail: document.getElementById('regEmail'),
  regPassword: document.getElementById('regPassword'),
  regPhone: document.getElementById('regPhone'),
  regFlat: document.getElementById('regFlat'),
  regRole: document.getElementById('regRole'),
  visitName: document.getElementById('visitName'),
  visitMobile: document.getElementById('visitMobile'),
  visitVehicle: document.getElementById('visitVehicle'),
  visitPurpose: document.getElementById('visitPurpose'),
  visitorId: document.getElementById('visitorId'),
  complaintSubject: document.getElementById('complaintSubject'),
  complaintDesc: document.getElementById('complaintDesc'),
  amenitySelect: document.getElementById('amenitySelect'),
  amenityStart: document.getElementById('amenityStart'),
  amenityEnd: document.getElementById('amenityEnd'),
  billMonth: document.getElementById('billMonth'),
  billAmount: document.getElementById('billAmount'),
  billDue: document.getElementById('billDue'),
  guardVisitName: document.getElementById('guardVisitName'),
  guardVisitMobile: document.getElementById('guardVisitMobile'),
  guardVisitVehicle: document.getElementById('guardVisitVehicle'),
  guardVisitPurpose: document.getElementById('guardVisitPurpose'),
  noticeTitle: document.getElementById('noticeTitle'),
  noticeMessage: document.getElementById('noticeMessage')
};

const buttons = {
  loginBtn: document.getElementById('loginBtn'),
  registerBtn: document.getElementById('registerBtn'),
  logoutBtn: document.getElementById('logoutBtn'),
  inviteBtn: document.getElementById('inviteBtn'),
  approveBtn: document.getElementById('approveBtn'),
  rejectBtn: document.getElementById('rejectBtn'),
  complaintBtn: document.getElementById('complaintBtn'),
  amenityBtn: document.getElementById('amenityBtn'),
  payMaintenanceBtn: document.getElementById('payMaintenanceBtn'),
  addVisitorEntryBtn: document.getElementById('addVisitorEntryBtn'),
  pendingBtn: document.getElementById('pendingBtn'),
  publishNoticeBtn: document.getElementById('publishNoticeBtn'),
  listComplaintsBtn: document.getElementById('listComplaintsBtn'),
  analyticsBtn: document.getElementById('analyticsBtn')
};

function show(element, visible = true) {
  element.classList.toggle('hidden', !visible);
}

function setMessage(text) {
  elements.messageText.textContent = text;
  show(elements.messageSection, Boolean(text));
}

function setResponse(data) {
  elements.responseOutput.textContent = JSON.stringify(data, null, 2);
  show(elements.responseSection, Boolean(data));
}

function clearResponse() {
  setResponse('');
}

function request(path, method = 'POST', body = null) {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' }
  };
  if (body && method !== 'GET') {
    options.body = JSON.stringify(body);
  }
  return fetch(`${apiBase}${path}`, options).then(async res => {
    const text = await res.text();
    if (!res.ok) {
      throw new Error(text || `${res.status} ${res.statusText}`);
    }
    return text ? JSON.parse(text) : null;
  });
}

function updateDashboard() {
  const role = currentUser?.role;
  document.getElementById('dashboardTitle').textContent = `${role} Dashboard`;
  elements.userLabel.textContent = `${currentUser.name} (${currentUser.role})`;
  show(elements.userBar, true);
  show(elements.authSection, false);
  show(elements.dashboard, true);
  show(elements.residentPanel, role === 'RESIDENT');
  show(elements.guardPanel, role === 'GUARD');
  show(elements.adminPanel, role === 'ADMIN');
  clearResponse();
  setMessage(`Welcome ${currentUser.name}`);
}

function resetAuthForms() {
  fields.loginEmail.value = '';
  fields.loginPassword.value = '';
  fields.regName.value = '';
  fields.regEmail.value = '';
  fields.regPassword.value = '';
  fields.regPhone.value = '';
  fields.regFlat.value = '';
  fields.regRole.value = 'RESIDENT';
}

function resetDashboardForms() {
  fields.visitName.value = '';
  fields.visitMobile.value = '';
  fields.visitVehicle.value = '';
  fields.visitPurpose.value = '';
  fields.visitorId.value = '';
  fields.complaintSubject.value = '';
  fields.complaintDesc.value = '';
  fields.amenityStart.value = '';
  fields.amenityEnd.value = '';
  fields.billMonth.value = '';
  fields.billAmount.value = '';
  fields.billDue.value = '';
  fields.guardVisitName.value = '';
  fields.guardVisitMobile.value = '';
  fields.guardVisitVehicle.value = '';
  fields.guardVisitPurpose.value = '';
  fields.noticeTitle.value = '';
  fields.noticeMessage.value = '';
}

function logout() {
  currentUser = null;
  show(elements.authSection, true);
  show(elements.dashboard, false);
  show(elements.userBar, false);
  setMessage('Logged out');
  setResponse('');
}

function login() {
  request('/auth/login', 'POST', {
    email: fields.loginEmail.value,
    password: fields.loginPassword.value
  })
    .then(user => {
      currentUser = user;
      updateDashboard();
      resetAuthForms();
    })
    .catch(err => setMessage(err.message));
}

function register() {
  request('/auth/register', 'POST', {
    name: fields.regName.value,
    email: fields.regEmail.value,
    password: fields.regPassword.value,
    role: fields.regRole.value,
    phone: fields.regPhone.value,
    flatNumber: fields.regFlat.value
  })
    .then(user => {
      currentUser = user;
      updateDashboard();
      resetAuthForms();
    })
    .catch(err => setMessage(err.message));
}

function inviteGuest() {
  request(`/residents/${currentUser.id}/invite-guest`, 'POST', {
    visitorName: fields.visitName.value,
    visitorMobile: fields.visitMobile.value,
    vehicleNumber: fields.visitVehicle.value,
    purpose: fields.visitPurpose.value,
    visitorType: 'Guest'
  })
    .then(setResponse)
    .catch(err => setMessage(err.message));
}

function approveVisitor() {
  request(`/residents/${currentUser.id}/approve-visitor/${fields.visitorId.value}`, 'POST')
    .then(setResponse)
    .catch(err => setMessage(err.message));
}

function rejectVisitor() {
  request(`/residents/${currentUser.id}/reject-visitor/${fields.visitorId.value}`, 'POST')
    .then(setResponse)
    .catch(err => setMessage(err.message));
}

function raiseComplaint() {
  request(`/residents/${currentUser.id}/complaints`, 'POST', {
    subject: fields.complaintSubject.value,
    description: fields.complaintDesc.value
  })
    .then(setResponse)
    .catch(err => setMessage(err.message));
}

function bookAmenity() {
  request(`/residents/${currentUser.id}/amenities/book`, 'POST', {
    amenity: fields.amenitySelect.value,
    startTime: fields.amenityStart.value,
    endTime: fields.amenityEnd.value
  })
    .then(setResponse)
    .catch(err => setMessage(err.message));
}

function payMaintenance() {
  request(`/residents/${currentUser.id}/pay-maintenance`, 'POST', {
    month: fields.billMonth.value,
    amount: Number(fields.billAmount.value),
    dueDate: fields.billDue.value
  })
    .then(setResponse)
    .catch(err => setMessage(err.message));
}

function addVisitorEntry() {
  request(`/guards/${currentUser.id}/visitor-entry`, 'POST', {
    visitorName: fields.guardVisitName.value,
    visitorMobile: fields.guardVisitMobile.value,
    vehicleNumber: fields.guardVisitVehicle.value,
    purpose: fields.guardVisitPurpose.value,
    visitorType: 'Delivery'
  })
    .then(setResponse)
    .catch(err => setMessage(err.message));
}

function loadPendingVisitors() {
  request('/guards/pending-visitors', 'GET')
    .then(setResponse)
    .catch(err => setMessage(err.message));
}

function publishNotice() {
  request('/admin/notices', 'POST', {
    title: fields.noticeTitle.value,
    message: fields.noticeMessage.value
  })
    .then(setResponse)
    .catch(err => setMessage(err.message));
}

function listComplaints() {
  request('/admin/complaints', 'GET')
    .then(setResponse)
    .catch(err => setMessage(err.message));
}

function loadAnalytics() {
  request('/admin/analytics', 'GET')
    .then(setResponse)
    .catch(err => setMessage(err.message));
}

function wireEvents() {
  buttons.loginBtn.addEventListener('click', login);
  buttons.registerBtn.addEventListener('click', register);
  buttons.logoutBtn.addEventListener('click', logout);
  buttons.inviteBtn.addEventListener('click', inviteGuest);
  buttons.approveBtn.addEventListener('click', approveVisitor);
  buttons.rejectBtn.addEventListener('click', rejectVisitor);
  buttons.complaintBtn.addEventListener('click', raiseComplaint);
  buttons.amenityBtn.addEventListener('click', bookAmenity);
  buttons.payMaintenanceBtn.addEventListener('click', payMaintenance);
  buttons.addVisitorEntryBtn.addEventListener('click', addVisitorEntry);
  buttons.pendingBtn.addEventListener('click', loadPendingVisitors);
  buttons.publishNoticeBtn.addEventListener('click', publishNotice);
  buttons.listComplaintsBtn.addEventListener('click', listComplaints);
  buttons.analyticsBtn.addEventListener('click', loadAnalytics);

  elements.loginTab.addEventListener('click', () => {
    elements.loginTab.classList.add('active');
    elements.registerTab.classList.remove('active');
    show(elements.loginForm, true);
    show(elements.registerForm, false);
  });

  elements.registerTab.addEventListener('click', () => {
    elements.registerTab.classList.add('active');
    elements.loginTab.classList.remove('active');
    show(elements.registerForm, true);
    show(elements.loginForm, false);
  });
}

wireEvents();
