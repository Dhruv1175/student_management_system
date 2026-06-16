import React, { useState, useEffect, useRef, useCallback } from 'react';
import API from './services/api.js';

const COURSES = ['Computer Science', 'Data Science', 'Information Technology'];
const GENDERS = ['Male', 'Female', 'Other'];

const EMPTY_FORM = {
  name: '',
  course: 'Computer Science',
  date_of_birth: '',
  email: '',
  phone_number: '',
  gender: 'Male',
  address: '',
  photo: null,
};

const EMPTY_ERRORS = {
  name: '',
  date_of_birth: '',
  email: '',
  phone_number: '',
  address: '',
  photo: '',
};

function validate(form) {
  const errors = { ...EMPTY_ERRORS };
  let valid = true;

  const name = form.name.trim();
  if (!name) { errors.name = 'Name is required.'; valid = false; }
  else if (name.length < 2) { errors.name = 'Name must be at least 2 characters.'; valid = false; }
  else if (/\d/.test(name)) { errors.name = 'Name cannot contain numbers.'; valid = false; }

  const dob = form.date_of_birth;
  if (!dob) { errors.date_of_birth = 'Date of birth is required.'; valid = false; }
  else {
    const d = new Date(dob);
    const now = new Date();
    const age = (now - d) / (1000 * 60 * 60 * 24 * 365.25);
    if (d >= now) { errors.date_of_birth = 'Must be in the past.'; valid = false; }
    else if (age < 5) { errors.date_of_birth = 'Age must be at least 5.'; valid = false; }
    else if (age > 100) { errors.date_of_birth = 'Please enter a realistic DOB.'; valid = false; }
  }

  const email = form.email.trim();
  if (!email) { errors.email = 'Email is required.'; valid = false; }
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { errors.email = 'Enter a valid email.'; valid = false; }

  const phone = form.phone_number.trim();
  if (!phone) { errors.phone_number = 'Phone is required.'; valid = false; }
  else {
    const digits = phone.replace(/[\s\-+()]/g, '');
    if (!/^\d{10,15}$/.test(digits)) { errors.phone_number = 'Enter 10-15 digits.'; valid = false; }
  }

  const addr = form.address.trim();
  if (!addr) { errors.address = 'Address is required.'; valid = false; }
  else if (addr.length < 10) { errors.address = 'Address must be at least 10 characters.'; valid = false; }

  return { valid, errors };
}

const Icons = {
  Dashboard: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  Students: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  Courses: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  ),
  Analytics: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 20V10" />
      <path d="M12 20V4" />
      <path d="M6 20v-6" />
    </svg>
  ),
  Settings: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  Logout: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
  Edit: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  ),
  Delete: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  ),
  Users: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  Book: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  ),
  Clipboard: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    </svg>
  ),
  Plus: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  Trash: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  ),
};


function InputField({ label, id, type = 'text', value, placeholder, error, onChange, accept }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label htmlFor={id} style={styles.label}>{label}</label>
      <input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        accept={accept}
        style={{ ...styles.input, ...(error ? styles.inputError : {}) }}
      />
      {error && <span style={styles.errorText}>{error}</span>}
    </div>
  );
}

function Toast({ message, type = 'success', visible }) {
  if (!visible) return null;
  const bg = type === 'success' ? '#10B981' : '#EF4444';
  return (
    <div style={{ ...styles.toast, background: bg }}>
      <span>{message}</span>
    </div>
  );
}

function ConfirmDialog({ open, studentName, onCancel, onConfirm }) {
  if (!open) return null;
  return (
    <div style={styles.dialogOverlay}>
      <div style={styles.dialog}>
        <div style={styles.dialogIcon}><Icons.Trash /></div>
        <h3 style={{ color: '#111827' }}>Delete this record?</h3>
        <p style={{ color: '#4B5563' }}>&ldquo;{studentName}&rdquo; will be permanently removed.</p>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
          <button style={styles.btnSecondary} onClick={onCancel}>Cancel</button>
          <button style={styles.btnDanger} onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  );
}

function Drawer({ open, mode, form, errors, globalError, onClose, onChange, onGender, onSave, saving, onPhotoChange, onRemovePhoto }) {
  const isEdit = mode === 'edit';
  const photoPreview = form.photo instanceof File ? URL.createObjectURL(form.photo) : (form.photo || null);

  return (
    <div
      style={{ ...styles.drawerOverlay, opacity: open ? 1 : 0, pointerEvents: open ? 'all' : 'none' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ ...styles.drawer, transform: open ? 'translateX(0)' : 'translateX(100%)' }}>
        <div style={styles.drawerHeader}>
          <h2 style={{ color: '#111827' }}>{isEdit ? 'Edit Student' : 'Add Student'}</h2>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>
        <div style={styles.drawerBody}>
          {globalError && <div style={styles.globalError}>{globalError}</div>}

          {/* Photo upload */}
          <div style={{ marginBottom: 16 }}>
            <label style={styles.label}>Student Photo</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={styles.photoPreview}>
                {photoPreview ? (
                  <img src={photoPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ color: '#9CA3AF', fontSize: 12 }}>No photo</span>
                )}
              </div>
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => onPhotoChange(e.target.files[0])}
                  style={{ fontSize: 12, color: '#111827' }}
                />
                {photoPreview && (
                  <button style={styles.removePhotoBtn} onClick={onRemovePhoto}>Remove</button>
                )}
              </div>
            </div>
            {errors.photo && <span style={styles.errorText}>{errors.photo}</span>}
          </div>

          <InputField label="Full Name" id="name" value={form.name} placeholder="e.g. Arjun Sharma" error={errors.name} onChange={(e) => onChange('name', e.target.value)} />

          <div style={{ marginBottom: 16 }}>
            <label style={styles.label}>Course</label>
            <select value={form.course} onChange={(e) => onChange('course', e.target.value)} style={styles.select}>
              {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <InputField label="Date of Birth" id="dob" type="date" value={form.date_of_birth} error={errors.date_of_birth} onChange={(e) => onChange('date_of_birth', e.target.value)} />

          <InputField label="Email Address" id="email" type="email" value={form.email} placeholder="student@example.com" error={errors.email} onChange={(e) => onChange('email', e.target.value)} />

          <InputField label="Phone Number" id="phone" value={form.phone_number} placeholder="+91 98765 43210" error={errors.phone_number} onChange={(e) => onChange('phone_number', e.target.value)} />

          <div style={{ marginBottom: 16 }}>
            <label style={styles.label}>Gender</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {GENDERS.map(g => (
                <label
                  key={g}
                  style={{ ...styles.radioOption, ...(form.gender === g ? styles.radioSelected : {}) }}
                  onClick={() => onGender(g)}
                >
                  <input type="radio" name="gender" value={g} readOnly checked={form.gender === g} />
                  {g}
                </label>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={styles.label}>Address</label>
            <textarea
              rows={3}
              value={form.address}
              placeholder="Flat 4B, Sector 7, Vashi..."
              onChange={(e) => onChange('address', e.target.value)}
              style={{ ...styles.input, resize: 'vertical', ...(errors.address ? styles.inputError : {}) }}
            />
            {errors.address && <span style={styles.errorText}>{errors.address}</span>}
          </div>
        </div>
        <div style={styles.drawerFooter}>
          <button style={styles.btnSecondary} onClick={onClose}>Cancel</button>
          <button style={styles.btnPrimary} onClick={onSave} disabled={saving}>
            {saving ? 'Saving...' : (isEdit ? 'Update' : 'Save')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [search, setSearch] = useState('');
  const [course, setCourse] = useState('');

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mode, setMode] = useState('create');
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState(EMPTY_ERRORS);
  const [globalError, setGlobalError] = useState('');
  const [saving, setSaving] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });
  const toastTimer = useRef(null);

  const showToast = (msg, type = 'success') => {
    setToast({ visible: true, message: msg, type });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(t => ({ ...t, visible: false })), 3000);
  };

  const fetchStudents = useCallback(async (overridePage) => {
    setLoading(true);
    try {
      const res = await API.get('/students', {
        params: { page: overridePage ?? page, limit: 7, search, course },
      });
      if (res.data.success) {
        setStudents(res.data.data);
        setTotalPages(res.data.pagination.totalPages);
        setTotalItems(res.data.pagination.totalItems);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to load students', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, search, course]);

  useEffect(() => { fetchStudents(); }, [page, course]);

  const handleSearchKey = (e) => {
    if (e.key === 'Enter') { setPage(1); fetchStudents(1); }
  };

  const handleCourseChange = (e) => { setCourse(e.target.value); setPage(1); };

  const openCreate = () => {
    setMode('create'); setEditId(null);
    setForm(EMPTY_FORM); setErrors(EMPTY_ERRORS); setGlobalError('');
    setDrawerOpen(true);
  };

  const openEdit = (student) => {
    setMode('edit'); setEditId(student.id);
    setForm({
      name: student.name,
      course: student.course,
      date_of_birth: student.date_of_birth ? student.date_of_birth.slice(0, 10) : '',
      email: student.email,
      phone_number: student.phone_number,
      gender: student.gender,
      address: student.address || '',
      photo: student.photo || null,
    });
    setErrors(EMPTY_ERRORS); setGlobalError('');
    setDrawerOpen(true);
  };

  const handleFieldChange = (key, value) => {
    setForm(f => ({ ...f, [key]: value }));
    setErrors(e => ({ ...e, [key]: '' }));
  };

  const handlePhotoChange = (file) => {
    if (file) {
      setForm(f => ({ ...f, photo: file }));
      setErrors(e => ({ ...e, photo: '' }));
    }
  };

  const handleRemovePhoto = () => {
    setForm(f => ({ ...f, photo: null }));
  };

  const handleSave = async () => {
    const { valid, errors: errs } = validate(form);
    if (!valid) { setErrors(errs); return; }
    setSaving(true); setGlobalError('');

    try {
      const formData = new FormData();
      formData.append('name', form.name.trim());
      formData.append('course', form.course);
      formData.append('date_of_birth', form.date_of_birth);
      formData.append('email', form.email.trim());
      formData.append('phone_number', form.phone_number.trim());
      formData.append('gender', form.gender);
      formData.append('address', form.address.trim());
      if (form.photo instanceof File) {
        formData.append('photo', form.photo);
      }

      let url, method;
      if (mode === 'edit') {
        url = `/students/${editId}`;
        method = 'put';
      } else {
        url = '/students';
        method = 'post';
      }

      const res = await API({ method, url, data: formData, headers: { 'Content-Type': 'multipart/form-data' } });

      if (res.data.success) {
        setDrawerOpen(false);
        if (mode === 'create') { setPage(1); fetchStudents(1); }
        else fetchStudents();
        showToast(mode === 'create' ? 'Student added successfully' : 'Student updated');
      } else {
        setGlobalError(res.data.message || 'Operation failed.');
      }
    } catch (err) {
      setGlobalError(err.response?.data?.message || 'Server error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const openDelete = (student) => { setDeleteTarget(student); setConfirmOpen(true); };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await API.delete(`/students/${deleteTarget.id}`);
      if (res.data.success) {
        setConfirmOpen(false); setDeleteTarget(null);
        const next = students.length === 1 && page > 1 ? page - 1 : page;
        setPage(next); fetchStudents(next);
        showToast('Student removed');
      }
    } catch {
      setConfirmOpen(false); showToast('Delete failed', 'error');
    }
  };

  const renderPhotoThumb = (photo) => {
    if (!photo) return <span style={{ color: '#9CA3AF', fontSize: 12 }}>—</span>;
    return (
      <img
        src={`${API.defaults.baseURL}/uploads/${photo}`}
        alt="student"
        style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }}
        onError={(e) => { e.target.style.display = 'none'; }}
      />
    );
  };

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #F0F2F5; font-family: 'Inter', system-ui, -apple-system, sans-serif; }
        .app { display: flex; min-height: 100vh; }
        .sidebar { width: 260px; background: linear-gradient(180deg, #1E1B4B 0%, #312E81 100%); padding: 24px 16px; color: #fff; position: fixed; top: 0; left: 0; height: 100%; overflow-y: auto; z-index: 30; }
        .sidebar .logo { font-size: 20px; font-weight: 700; margin-bottom: 32px; letter-spacing: -0.5px; display: flex; align-items: center; gap: 10px; }
        .sidebar .logo span { background: #818CF8; padding: 2px 8px; border-radius: 6px; font-size: 12px; }
        .sidebar nav a { display: flex; align-items: center; gap: 12px; padding: 10px 14px; border-radius: 10px; color: #C7D2FE; text-decoration: none; transition: 0.2s; margin-bottom: 2px; font-size: 14px; }
        .sidebar nav a:hover, .sidebar nav a.active { background: rgba(255,255,255,0.08); color: #fff; }
        .sidebar nav a.active { background: rgba(255,255,255,0.12); box-shadow: 0 0 0 1px rgba(255,255,255,0.05); }
        .main { margin-left: 260px; flex: 1; padding: 24px 32px; }
        .main, .main * { color: #111827; }
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 28px; }
        .header h1 { font-size: 26px; font-weight: 600; color: #111827; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-bottom: 28px; }
        .stat-card { background: #fff; padding: 20px 18px; border-radius: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); border: 1px solid #E5E7EB; transition: 0.2s; }
        .stat-card:hover { box-shadow: 0 6px 20px rgba(0,0,0,0.06); }
        .stat-card .label { font-size: 12px; font-weight: 500; color: #6B7280; text-transform: uppercase; letter-spacing: 0.5px; display: flex; align-items: center; gap: 6px; }
        .stat-card .value { font-size: 28px; font-weight: 700; color: #111827; margin-top: 4px; }
        .toolbar { display: flex; gap: 12px; flex-wrap: wrap; background: #fff; padding: 12px 20px; border-radius: 16px; margin-bottom: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); border: 1px solid #E5E7EB; }
        .toolbar input, .toolbar select { padding: 8px 14px; border: 1px solid #D1D5DB; border-radius: 10px; font-size: 14px; background: #F9FAFB; transition: 0.2s; color: #111827; }
        .toolbar input::placeholder { color: #6B7280; }
        .toolbar input:focus, .toolbar select:focus { outline: none; border-color: #4F46E5; box-shadow: 0 0 0 3px rgba(79,70,229,0.1); }
        .table-wrap { background: #fff; border-radius: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); border: 1px solid #E5E7EB; overflow: hidden; }
        .table-wrap table { width: 100%; border-collapse: collapse; font-size: 14px; }
        .table-wrap th { background: #F9FAFB; padding: 14px 18px; text-align: left; font-weight: 500; color: #4B5563; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #E5E7EB; }
        .table-wrap td { padding: 14px 18px; border-bottom: 1px solid #F3F4F6; color: #111827; }
        .table-wrap tbody tr:hover { background: #F8FAFC; }
        .badge { display: inline-block; padding: 2px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; background: #EEF2FF; color: #4F46E5; }
        .actions { display: flex; gap: 6px; }
        .actions button { background: none; border: none; cursor: pointer; padding: 4px 8px; border-radius: 8px; transition: 0.2s; font-size: 15px; color: #4B5563; }
        .actions .edit:hover { background: #EEF2FF; color: #4F46E5; }
        .actions .delete:hover { background: #FEF2F2; color: #EF4444; }
        .pagination { display: flex; justify-content: space-between; align-items: center; padding: 14px 18px; border-top: 1px solid #E5E7EB; flex-wrap: wrap; gap: 8px; color: #111827; }
        .pagination button { padding: 6px 16px; border: 1px solid #D1D5DB; border-radius: 10px; background: #fff; cursor: pointer; transition: 0.2s; font-size: 13px; color: #111827; }
        .pagination button:hover:not(:disabled) { background: #F3F4F6; border-color: #9CA3AF; }
        .pagination button:disabled { opacity: 0.4; cursor: not-allowed; }
        @media (max-width: 768px) {
          .sidebar { transform: translateX(-100%); position: fixed; width: 240px; }
          .sidebar.open { transform: translateX(0); }
          .main { margin-left: 0; padding: 16px; }
          .stats { grid-template-columns: 1fr 1fr; }
          .header { flex-direction: column; align-items: stretch; gap: 12px; }
        }
        @media (max-width: 480px) {
          .stats { grid-template-columns: 1fr; }
          .toolbar { flex-direction: column; }
          .table-wrap { overflow-x: auto; }
        }
      `}</style>

      <div className="app">
        <aside className="sidebar" id="sidebar">
          <div className="logo">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#818CF8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5-10-5z" />
              <path d="M6 12v5c3 3 9 3 12 0v-5" />
            </svg>
            EduStream <span>v2</span>
          </div>
          <nav>
            <a href="#" className="active"><Icons.Dashboard /> Dashboard</a>
            <a href="#"><Icons.Students /> Students</a>
            <a href="#"><Icons.Courses /> Courses</a>
            <a href="#"><Icons.Analytics /> Analytics</a>
            <a href="#"><Icons.Settings /> Settings</a>
          </nav>
          <div style={{ marginTop: 'auto', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <a href="#" style={{ color: '#C7D2FE', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', borderRadius: '8px', fontSize: '13px', textDecoration: 'none' }}>
              <Icons.Logout /> Sign out
            </a>
          </div>
        </aside>

        <div className="main">
          <div className="header">
            <h1>Student Records</h1>
            <button style={styles.btnPrimary} onClick={openCreate}>
              <Icons.Plus /> Add Student
            </button>
          </div>

          <div className="stats">
            <div className="stat-card">
              <div className="label"><Icons.Users /> Total Enrolled</div>
              <div className="value">{totalItems}</div>
            </div>
            <div className="stat-card">
              <div className="label"><Icons.Book /> Active Courses</div>
              <div className="value">3</div>
            </div>
            <div className="stat-card">
              <div className="label"><Icons.Clipboard /> On This Page</div>
              <div className="value">{students.length}</div>
            </div>
          </div>

          <div className="toolbar">
            <input type="text" placeholder="Search by name…" value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={handleSearchKey} style={{ flex: 1, minWidth: '150px' }} />
            <select value={course} onChange={handleCourseChange}>
              <option value="">All Courses</option>
              {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Admission No.</th>
                  <th>Photo</th>
                  <th>Name</th>
                  <th>Course</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Gender</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="8" style={{ textAlign: 'center', padding: '40px' }}>⏳ Loading...</td></tr>
                ) : students.length === 0 ? (
                  <tr><td colSpan="8" style={{ textAlign: 'center', padding: '40px' }}>📭 No students found.</td></tr>
                ) : students.map(s => (
                  <tr key={s.id}>
                    <td style={{ fontFamily: 'monospace', fontSize: '13px' }}>{s.admission_number}</td>
                    <td>{renderPhotoThumb(s.photo)}</td>
                    <td><strong>{s.name}</strong></td>
                    <td><span className="badge">{s.course}</span></td>
                    <td>{s.email}</td>
                    <td>{s.phone_number}</td>
                    <td>{s.gender}</td>
                    <td>
                      <div className="actions">
                        <button className="edit" onClick={() => openEdit(s)}><Icons.Edit /></button>
                        <button className="delete" onClick={() => openDelete(s)}><Icons.Delete /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="pagination">
              <span>Page {page} of {totalPages}</span>
              <div>
                <button disabled={page <= 1 || loading} onClick={() => setPage(p => p - 1)}>← Prev</button>
                <button disabled={page >= totalPages || loading} onClick={() => setPage(p => p + 1)}>Next →</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Drawer
        open={drawerOpen}
        mode={mode}
        form={form}
        errors={errors}
        globalError={globalError}
        onClose={() => setDrawerOpen(false)}
        onChange={handleFieldChange}
        onGender={(g) => setForm(f => ({ ...f, gender: g }))}
        onSave={handleSave}
        saving={saving}
        onPhotoChange={handlePhotoChange}
        onRemovePhoto={handleRemovePhoto}
      />

      <ConfirmDialog
        open={confirmOpen}
        studentName={deleteTarget?.name}
        onCancel={() => { setConfirmOpen(false); setDeleteTarget(null); }}
        onConfirm={confirmDelete}
      />

      <Toast message={toast.message} type={toast.type} visible={toast.visible} />
    </>
  );
}

// ---------- Styles ----------
const styles = {
  btnPrimary: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: '#4F46E5',
    color: '#fff',
    border: 'none',
    padding: '10px 24px',
    borderRadius: '10px',
    fontWeight: 500,
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'background 0.2s, transform 0.1s',
    fontFamily: 'inherit',
    boxShadow: '0 2px 8px rgba(79,70,229,0.3)',
  },
  btnSecondary: {
    background: '#F3F4F6',
    color: '#111827',
    border: '1px solid #D1D5DB',
    padding: '8px 20px',
    borderRadius: '10px',
    fontWeight: 500,
    fontSize: '14px',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  btnDanger: {
    background: '#EF4444',
    color: '#fff',
    border: 'none',
    padding: '8px 20px',
    borderRadius: '10px',
    fontWeight: 500,
    fontSize: '14px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    boxShadow: '0 2px 8px rgba(239,68,68,0.25)',
  },

  label: {
    display: 'block',
    fontSize: '13px',
    fontWeight: 500,
    color: '#374151',
    marginBottom: '4px',
  },
  input: {
    width: '100%',
    padding: '10px 14px',
    border: '1px solid #D1D5DB',
    borderRadius: '10px',
    fontSize: '14px',
    background: '#fff',
    color: '#111827',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    fontFamily: 'inherit',
  },
  inputError: {
    borderColor: '#EF4444',
    boxShadow: '0 0 0 3px rgba(239,68,68,0.1)',
  },
  select: {
    width: '100%',
    padding: '10px 14px',
    border: '1px solid #D1D5DB',
    borderRadius: '10px',
    fontSize: '14px',
    background: '#fff',
    color: '#111827',
    outline: 'none',
    fontFamily: 'inherit',
  },
  errorText: {
    fontSize: '12px',
    color: '#EF4444',
    marginTop: '4px',
    display: 'block',
  },

  radioOption: {
    flex: 1,
    border: '1px solid #D1D5DB',
    borderRadius: '10px',
    padding: '8px 12px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontSize: '14px',
    color: '#111827',
    background: '#fff',
  },
  radioSelected: {
    borderColor: '#4F46E5',
    background: '#EEF2FF',
    color: '#4F46E5',
    fontWeight: 500,
  },

  photoPreview: {
    width: 80,
    height: 80,
    borderRadius: '50%',
    overflow: 'hidden',
    background: '#F3F4F6',
    border: '2px solid #E5E7EB',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  removePhotoBtn: {
    background: 'none',
    border: 'none',
    color: '#EF4444',
    fontSize: '12px',
    cursor: 'pointer',
    marginTop: '4px',
    textDecoration: 'underline',
  },

  drawerOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.3)',
    zIndex: 50,
    display: 'flex',
    justifyContent: 'flex-end',
    transition: 'opacity 0.25s',
  },
  drawer: {
    width: '100%',
    maxWidth: '440px',
    background: '#fff',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
    transform: 'translateX(100%)',
    transition: 'transform 0.25s cubic-bezier(0.4,0,0.2,1)',
  },
  drawerHeader: {
    padding: '20px 24px',
    borderBottom: '1px solid #E5E7EB',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: '#F8FAFC',
  },
  drawerBody: {
    padding: '24px',
    overflowY: 'auto',
    flex: 1,
  },
  drawerFooter: {
    padding: '16px 24px',
    borderTop: '1px solid #E5E7EB',
    display: 'flex',
    gap: '8px',
    justifyContent: 'flex-end',
    background: '#F8FAFC',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    color: '#6B7280',
  },
  globalError: {
    background: '#FEF2F2',
    color: '#B91C1C',
    padding: '10px 14px',
    borderRadius: '10px',
    marginBottom: '16px',
    fontSize: '13px',
    border: '1px solid #FCA5A5',
  },

  dialogOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.4)',
    zIndex: 60,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  },
  dialog: {
    background: '#fff',
    borderRadius: '20px',
    padding: '32px 24px 24px',
    maxWidth: '400px',
    width: '100%',
    textAlign: 'center',
    boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
  },
  dialogIcon: {
    fontSize: '40px',
    marginBottom: '12px',
    color: '#EF4444',
  },

  toast: {
    position: 'fixed',
    bottom: '24px',
    left: '50%',
    transform: 'translateX(-50%)',
    color: '#fff',
    padding: '12px 28px',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: 500,
    zIndex: 70,
    boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
    transition: 'opacity 0.3s, transform 0.3s',
    opacity: 1,
  },
};