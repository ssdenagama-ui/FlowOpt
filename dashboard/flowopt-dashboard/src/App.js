import React, { useState, useEffect,
  useCallback } from 'react';
import axios from 'axios';
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

const API = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const C = {
  navy:   '#0B2A4A',
  teal:   '#0D7377',
  green:  '#1A9E5C',
  purple: '#9B59B6',
  orange: '#E67E22',
  red:    '#C0392B',
  white:  '#FFFFFF',
  light:  '#F4F8FB',
};

function getSession() {
  try {
    const s = localStorage.getItem(
      'flowopt_session');
    return s ? JSON.parse(s) : null;
  } catch { return null; }
}

function saveSession(user) {
  if (user) {
    localStorage.setItem(
      'flowopt_session',
      JSON.stringify(user));
  } else {
    localStorage.removeItem(
      'flowopt_session');
  }
}

// ── Toast ─────────────────────────────
function Toast({ msg, type, onClose }) {
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [msg, onClose]);
  if (!msg) return null;
  const bg = type==='success'
    ? C.green
    : type==='error' ? C.red : C.orange;
  return (
    <div style={{
      position:'fixed', top:24, right:24,
      zIndex:9999, background:bg,
      color:C.white, padding:'14px 22px',
      borderRadius:10, fontSize:14,
      fontWeight:'bold',
      boxShadow:
        '0 4px 16px rgba(0,0,0,0.25)',
      display:'flex', alignItems:'center',
      gap:10, maxWidth:360,
    }}>
      <span style={{fontSize:18}}>
        {type==='success'?'✅'
          :type==='error'?'❌':'ℹ️'}
      </span>
      <span>{msg}</span>
      <button onClick={onClose} style={{
        background:'transparent',
        border:'none', color:C.white,
        fontSize:18, cursor:'pointer',
        marginLeft:8,
      }}>×</button>
    </div>
  );
}

// ── Stat Card ─────────────────────────
function StatCard({ title, value, unit,
  color, alert, icon, prev }) {
  const numVal = parseFloat(
    String(value).replace(/[^0-9.-]/g,''));
  const change = prev && !isNaN(numVal)
    ? ((numVal-prev)/prev*100).toFixed(1)
    : null;
  return (
    <div style={{
      background:alert?'#FEF0F0':C.white,
      border:`2px solid ${
        alert?C.red:color}`,
      borderRadius:12,
      padding:'16px 18px',
      flex:1, minWidth:160,
      boxShadow:
        '0 2px 8px rgba(0,0,0,0.08)',
    }}>
      <div style={{
        fontSize:22, marginBottom:4,
      }}>{icon}</div>
      <div style={{
        fontSize:10, color:'#888',
        textTransform:'uppercase',
        letterSpacing:1, marginBottom:5,
      }}>{title}</div>
      <div style={{
        fontSize:20, fontWeight:'bold',
        color:alert?C.red:color,
      }}>{value}</div>
      <div style={{
        fontSize:10, color:'#aaa',
        marginTop:3,
      }}>{unit}</div>
      {change && (
        <div style={{
          fontSize:10, marginTop:5,
          fontWeight:'bold',
          color:parseFloat(change)>=0
            ?C.green:C.red,
        }}>
          {parseFloat(change)>=0
            ?'▲':'▼'}
          {' '}{Math.abs(change)}%
          {' '}vs prev year
        </div>
      )}
      {alert && (
        <div style={{
          marginTop:6, fontSize:10,
          color:C.red, fontWeight:'bold',
        }}>⚠️ HIGH DEMAND ALERT</div>
      )}
    </div>
  );
}

// ── Login ─────────────────────────────
function LoginScreen({ onLogin }) {
  const [username, setUsername] =
    useState('');
  const [password, setPassword] =
    useState('');
  const [error,    setError] =
    useState('');
  const [loading,  setLoading] =
    useState(false);

  const handleLogin = async () => {
    if (!username||!password) {
      setError(
        'Please enter username '
        +'and password.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(
        `${API}/auth/login`, {
        username: username
          .trim().toLowerCase(),
        password,
      });
      onLogin(res.data);
    } catch(err) {
      setError(
        err.response?.data?.detail
        || 'Invalid username or password.');
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight:'100vh',
      background:C.navy,
      display:'flex',
      alignItems:'center',
      justifyContent:'center',
    }}>
      <div style={{
        background:C.white,
        borderRadius:16, padding:40,
        width:380,
        boxShadow:
          '0 8px 32px rgba(0,0,0,0.3)',
      }}>
        <div style={{
          textAlign:'center',
          marginBottom:28,
        }}>
          <div style={{fontSize:48}}>
            🏥
          </div>
          <div style={{
            fontSize:22,
            fontWeight:'bold',
            color:C.navy, marginTop:8,
          }}>FlowOpt</div>
          <div style={{
            fontSize:12, color:'#888',
            marginTop:4,
          }}>
            Hospital Patient Flow
            Optimisation System
          </div>
          <div style={{
            marginTop:8, fontSize:11,
            background:'#EBF5FB',
            padding:'4px 10px',
            borderRadius:5,
            color:C.teal,
            display:'inline-block',
          }}>
            🗄️ Database Connected
          </div>
        </div>

        {[
          ['Username','text',
            username,setUsername],
          ['Password','password',
            password,setPassword],
        ].map(([lbl,type,val,setter])=>(
          <div key={lbl}
            style={{marginBottom:14}}>
            <label style={{
              fontSize:12,
              fontWeight:'bold',
              color:'#555',
            }}>{lbl}</label>
            <input
              type={type}
              placeholder={`Enter ${lbl}`}
              value={val}
              onChange={e=>
                setter(e.target.value)}
              onKeyDown={e=>
                e.key==='Enter'
                  &&handleLogin()}
              style={{
                width:'100%',
                padding:'10px 12px',
                border:'1px solid #ddd',
                borderRadius:8,
                fontSize:14,marginTop:5,
                boxSizing:'border-box',
              }}
            />
          </div>
        ))}

        {error&&(
          <div style={{
            color:C.red,fontSize:13,
            marginBottom:10,
            textAlign:'center',
            background:'#FEF0F0',
            padding:'8px',
            borderRadius:6,
          }}>{error}</div>
        )}

        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            width:'100%', padding:'12px',
            background:loading
              ?'#aaa':C.teal,
            color:C.white, border:'none',
            borderRadius:8, fontSize:15,
            fontWeight:'bold',
            cursor:loading
              ?'not-allowed':'pointer',
          }}>
          {loading
            ?'⏳ Logging in...'
            :'Login'}
        </button>

        <div style={{
          marginTop:16, padding:12,
          background:'#F4F8FB',
          borderRadius:8,
          fontSize:11, color:'#666',
        }}>
          <strong>
            Default Credentials:
          </strong><br/>
          Admin: admin / flowopt2025<br/>
          Viewer: viewer / view123
        </div>
      </div>
    </div>
  );
}

// ── User Management ───────────────────
function UserManagement({ showToast }) {
  const [users,    setUsers]    =
    useState([]);
  const [showForm, setShowForm] =
    useState(false);
  const [editUser, setEditUser] =
    useState(null);
  const [form,     setForm]     =
    useState({
      username:'', password:'',
      name:'', email:'', role:'viewer',
    });
  const [loadingU, setLoadingU] =
    useState(false);

  const loadUsers = useCallback(
    async()=>{
    setLoadingU(true);
    try {
      const res =
        await axios.get(`${API}/users`);
      setUsers(res.data);
    } catch(err) {
      showToast(
        'Failed to load users.',
        'error');
    }
    setLoadingU(false);
  },[showToast]);

  useEffect(()=>{
    loadUsers();
  },[loadUsers]);

  const resetForm = ()=>{
    setForm({
      username:'', password:'',
      name:'', email:'', role:'viewer',
    });
    setEditUser(null);
    setShowForm(false);
  };

  const handleEdit = (u)=>{
    setEditUser(u);
    setForm({
      username: u.username,
      password: '',
      name:     u.name,
      email:    u.email||'',
      role:     u.role,
    });
    setShowForm(true);
  };

  const handleDelete = async(u)=>{
    if (!window.confirm(
      `Delete user "${u.username}"?`))
      return;
    try {
      await axios.delete(
        `${API}/users/${u.id}`);
      showToast(
        `User "${u.username}" deleted.`,
        'success');
      await loadUsers();
    } catch(err) {
      showToast(
        err.response?.data?.detail
        ||'Failed to delete user.',
        'error');
    }
  };

  const handleSave = async()=>{
    if (!form.name||
      (!editUser&&!form.username)||
      (!editUser&&!form.password)) {
      showToast(
        'Please fill in all '
        +'required fields.','error');
      return;
    }
    try {
      if (editUser) {
        const updates = {};
        if (form.password)
          updates.password = form.password;
        if (form.name)
          updates.name = form.name;
        if (form.email!==undefined)
          updates.email = form.email;
        if (form.role)
          updates.role = form.role;
        await axios.put(
          `${API}/users/${editUser.id}`,
          updates);
        showToast(
          `User "${editUser.username}"`
          +` updated successfully.`,
          'success');
      } else {
        await axios.post(
          `${API}/users`, {
          username: form.username
            .trim().toLowerCase(),
          password: form.password,
          name:     form.name,
          email:    form.email||'',
          role:     form.role,
        });
        showToast(
          `User "${form.username}"`
          +` created successfully.`
          +` They can login now!`,
          'success');
      }
      resetForm();
      await loadUsers();
    } catch(err) {
      showToast(
        err.response?.data?.detail
        ||'Failed to save user.',
        'error');
    }
  };

  const inp = {
    width:'100%', padding:'8px 10px',
    border:'1px solid #ddd',
    borderRadius:6, fontSize:13,
    marginTop:4, boxSizing:'border-box',
  };
  const lbl = {
    fontSize:12, fontWeight:'bold',
    color:'#555',
  };

  return (
    <div>
      <div style={{
        display:'flex',
        justifyContent:'space-between',
        alignItems:'center',
        marginBottom:14, paddingBottom:8,
        borderBottom:
          `2px solid ${C.light}`,
      }}>
        <div style={{
          fontSize:15, fontWeight:'bold',
          color:C.navy,
          display:'flex',
          alignItems:'center', gap:8,
        }}>
          👥 User Management
          <span style={{
            background:'#EBF5FB',
            color:C.teal,
            fontSize:11,
            padding:'2px 8px',
            borderRadius:4,
          }}>
            🗄️ Database
          </span>
        </div>
        <button onClick={()=>{
          resetForm();
          setShowForm(true);
        }} style={{
          background:C.teal,
          color:C.white, border:'none',
          borderRadius:7,
          padding:'7px 14px',
          cursor:'pointer', fontSize:13,
          fontWeight:'bold',
        }}>➕ Add New User</button>
      </div>

      {loadingU&&(
        <div style={{
          textAlign:'center',
          padding:20, color:C.teal,
          fontSize:13,
        }}>
          ⏳ Loading users from database...
        </div>
      )}

      {showForm&&(
        <div style={{
          background:'#F4F8FB',
          borderRadius:10, padding:18,
          marginBottom:18,
          border:'1px solid #dde6ef',
        }}>
          <div style={{
            fontSize:14,
            fontWeight:'bold',
            color:C.navy, marginBottom:12,
          }}>
            {editUser
              ?`✏️ Edit — `
                +`${editUser.username}`
              :'➕ Add New User'}
          </div>
          <div style={{
            display:'grid',
            gridTemplateColumns:
              'repeat(auto-fill,'
              +'minmax(190px,1fr))',
            gap:12, marginBottom:14,
          }}>
            <div>
              <label style={lbl}>
                Username
                {!editUser&&
                  <span style={{
                    color:C.red,
                  }}> *</span>}
              </label>
              <input
                style={{...inp,
                  background:editUser
                    ?'#f5f5f5':C.white}}
                placeholder=
                  "Enter username"
                value={form.username}
                disabled={!!editUser}
                onChange={e=>setForm(p=>({
                  ...p,
                  username:e.target.value
                }))}
              />
              {editUser&&(
                <div style={{
                  fontSize:10,
                  color:'#aaa',
                  marginTop:2,
                }}>
                  Username cannot
                  be changed
                </div>
              )}
            </div>
            <div>
              <label style={lbl}>
                Password
                {!editUser&&
                  <span style={{
                    color:C.red,
                  }}> *</span>}
              </label>
              <input
                style={inp}
                type="text"
                placeholder={editUser
                  ?"Leave blank to keep"
                  :"Enter password"}
                value={form.password}
                onChange={e=>setForm(p=>({
                  ...p,
                  password:e.target.value
                }))}
              />
            </div>
            <div>
              <label style={lbl}>
                Full Name
                <span style={{
                  color:C.red,
                }}> *</span>
              </label>
              <input
                style={inp}
                placeholder=
                  "Enter full name"
                value={form.name}
                onChange={e=>setForm(p=>({
                  ...p,name:e.target.value
                }))}
              />
            </div>
            <div>
              <label style={lbl}>
                Email
              </label>
              <input
                style={inp}
                type="email"
                placeholder="Enter email"
                value={form.email}
                onChange={e=>setForm(p=>({
                  ...p,email:e.target.value
                }))}
              />
            </div>
            <div>
              <label style={lbl}>
                Role
                <span style={{
                  color:C.red,
                }}> *</span>
              </label>
              <select
                style={inp}
                value={form.role}
                onChange={e=>setForm(p=>({
                  ...p,role:e.target.value
                }))}>
                <option value="admin">
                  Admin
                </option>
                <option value="viewer">
                  Viewer
                </option>
              </select>
            </div>
          </div>
          <div style={{
            display:'flex', gap:8,
          }}>
            <button
              onClick={handleSave}
              style={{
                background:C.teal,
                color:C.white,
                border:'none',
                borderRadius:7,
                padding:'8px 20px',
                cursor:'pointer',
                fontSize:13,
                fontWeight:'bold',
              }}>
              {editUser
                ?'💾 Update User'
                :'💾 Save User'}
            </button>
            <button onClick={resetForm}
              style={{
                background:'#eee',
                color:'#555',
                border:'none',
                borderRadius:7,
                padding:'8px 20px',
                cursor:'pointer',
                fontSize:13,
              }}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{overflowX:'auto'}}>
        <table style={{
          width:'100%',
          borderCollapse:'collapse',
          fontSize:13,
        }}>
          <thead>
            <tr style={{
              background:C.navy,
              color:C.white,
            }}>
              {['#','Username',
                'Full Name','Email',
                'Role','Actions']
                .map(h=>(
                <th key={h} style={{
                  padding:'9px 12px',
                  textAlign:'left',
                  whiteSpace:'nowrap',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.length===0?(
              <tr><td colSpan={6}
                style={{
                  padding:20,
                  textAlign:'center',
                  color:'#aaa',
                }}>
                {loadingU
                  ?'Loading...'
                  :'No users found'}
              </td></tr>
            ):users.map((u,i)=>(
              <tr key={u.id} style={{
                background:i%2===0
                  ?'#F4F8FB':C.white,
                borderBottom:
                  '1px solid #eee',
              }}>
                <td style={{
                  padding:'9px 12px',
                  color:'#999',
                }}>{i+1}</td>
                <td style={{
                  padding:'9px 12px',
                  fontWeight:'bold',
                  color:C.navy,
                }}>{u.username}</td>
                <td style={{
                  padding:'9px 12px',
                }}>{u.name}</td>
                <td style={{
                  padding:'9px 12px',
                  color:'#666',
                }}>{u.email||'—'}</td>
                <td style={{
                  padding:'9px 12px',
                }}>
                  <span style={{
                    background:
                      u.role==='admin'
                        ?C.teal:C.purple,
                    color:C.white,
                    padding:'2px 10px',
                    borderRadius:20,
                    fontSize:11,
                    fontWeight:'bold',
                  }}>
                    {u.role.toUpperCase()}
                  </span>
                </td>
                <td style={{
                  padding:'9px 12px',
                }}>
                  <div style={{
                    display:'flex',gap:6,
                  }}>
                    <button
                      onClick={()=>
                        handleEdit(u)}
                      style={{
                        background:
                          '#EBF5FB',
                        color:C.teal,
                        border:`1px solid
                          ${C.teal}`,
                        borderRadius:5,
                        padding:'4px 10px',
                        cursor:'pointer',
                        fontSize:12,
                      }}>
                      ✏️ Edit
                    </button>
                    <button
                      onClick={()=>
                        handleDelete(u)}
                      style={{
                        background:
                          '#FEF0F0',
                        color:C.red,
                        border:`1px solid
                          ${C.red}`,
                        borderRadius:5,
                        padding:'4px 10px',
                        cursor:'pointer',
                        fontSize:12,
                      }}>
                      🗑️ Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{
        marginTop:12, padding:10,
        background:'#EBF5FB',
        borderRadius:7, fontSize:11,
        color:C.teal,
        borderLeft:`3px solid ${C.teal}`,
      }}>
        🗄️ Users stored in SQLite database.
        New users can login immediately
        after being added.
      </div>
    </div>
  );
}

// ── Add Data Form ─────────────────────
function AddDataForm({
  onSubmit, lastYear, showToast,
}) {
  const nextYear = lastYear + 1;
  const [form, setForm] = useState({
    year:nextYear, inpat:'',
    disc_t:'', death_t:'',
    bor:'', ados:'', opd:'', beds:'',
  });
  const [done,     setDone]     =
    useState(false);
  const [saving,   setSaving]   =
    useState(false);
  const [addedData,setAddedData]=
    useState([]);
  const [loadingD, setLoadingD] =
    useState(false);

  // Load only admin-added records
  const loadAdminData =
    useCallback(async()=>{
    setLoadingD(true);
    try {
      const res = await axios.get(
        `${API}/hospital-data`);
      // Show only admin added records
      const adminOnly = res.data.filter(
        d => d.added_by === 'admin');
      setAddedData(adminOnly);
    } catch(err) {
      showToast(
        'Failed to load data.',
        'error');
    }
    setLoadingD(false);
  },[showToast]);

  useEffect(()=>{
    loadAdminData();
  },[loadAdminData]);

  const handleDelete = async(year)=>{
    if (!window.confirm(
      `Delete data for year ${year}?`))
      return;
    try {
      await axios.delete(
        `${API}/hospital-data/${year}`);
      showToast(
        `Year ${year} data deleted.`,
        'success');
      await loadAdminData();
    } catch(err) {
      showToast(
        err.response?.data?.detail
        ||`Cannot delete ${year}.`,
        'error');
    }
  };

  const fields = [
    ['inpat',  'Total Inpatients',
      'patients'],
    ['disc_t', 'Live Discharges',
      'patients'],
    ['death_t','Total Deaths',
      'patients'],
    ['bor',    'Bed Occupancy Rate',
      '%'],
    ['ados',   'Avg Duration of Stay',
      'days'],
    ['opd',    'Total OPD Visits',
      'visits'],
    ['beds',   'Total Hospital Beds',
      'beds'],
  ];

  const handleSubmit = async()=>{
    const empty =
      fields.filter(([k])=>!form[k]);
    if (empty.length) {
      alert('Please fill in all fields.');
      return;
    }
    setSaving(true);
    const parsed = {};
    Object.keys(form).forEach(k=>{
      parsed[k] = k==='year'
        ?parseInt(form[k])
        :parseFloat(form[k]);
    });
    try {
      await axios.post(
        `${API}/hospital-data`,{
        year:    parsed.year,
        inpat:   parsed.inpat,
        disc:    parsed.disc_t,
        death_t: parsed.death_t,
        bor:     parsed.bor,
        ados:    parsed.ados,
        opd:     parsed.opd,
        beds:    parsed.beds,
        added_by:'admin',
      });
      showToast(
        `Year ${parsed.year} saved!`,
        'success');
      await loadAdminData();
      onSubmit(parsed);
      setDone(true);
    } catch(err) {
      showToast(
        err.response?.data?.detail
        ||'Failed to save data.',
        'error');
    }
    setSaving(false);
  };

  if (done) return (
    <div style={{
      textAlign:'center', padding:30,
    }}>
      <div style={{fontSize:44}}>✅</div>
      <h3 style={{color:C.green}}>
        Data Saved!
      </h3>
      <p style={{
        color:'#666', fontSize:13,
      }}>
        Year {form.year} saved to
        database and predictions updated.
      </p>
      <button
        onClick={()=>{
          setDone(false);
          setForm({
            year:nextYear,
            inpat:'', disc_t:'',
            death_t:'', bor:'',
            ados:'', opd:'', beds:'',
          });
        }}
        style={{
          background:C.teal,
          color:C.white, border:'none',
          borderRadius:8,
          padding:'9px 22px',
          cursor:'pointer',
          fontSize:13, marginTop:8,
        }}>
        ➕ Add Another Year
      </button>
    </div>
  );

  return (
    <div>

      {/* ── FORM SECTION ── */}
      <div style={{
        fontSize:15, fontWeight:'bold',
        color:C.navy, marginBottom:8,
        paddingBottom:8,
        borderBottom:
          `2px solid ${C.light}`,
      }}>
        ➕ Add New Year Data — {nextYear}
      </div>

      <p style={{
        color:'#666', fontSize:13,
        marginBottom:16,
      }}>
        Enter annual hospital statistics
        from the Sri Lanka Ministry of
        Health IMMR and Annual Health
        Bulletin.
      </p>

      <div style={{
        display:'grid',
        gridTemplateColumns:
          'repeat(auto-fill,'
          +'minmax(210px,1fr))',
        gap:12, marginBottom:18,
      }}>
        {fields.map(([key,label,unit])=>(
          <div key={key}>
            <label style={{
              fontSize:12,
              fontWeight:'bold',
              color:'#555',
            }}>
              {label}
              <span style={{
                color:'#999',
                fontWeight:'normal',
              }}> ({unit})</span>
            </label>
            <input
              type="number"
              placeholder=
                {`Enter ${label}`}
              value={form[key]}
              onChange={e=>setForm(p=>({
                ...p,
                [key]:e.target.value,
              }))}
              style={{
                width:'100%',
                padding:'8px 10px',
                border:'1px solid #ddd',
                borderRadius:6,
                fontSize:13,
                marginTop:4,
                boxSizing:'border-box',
              }}
            />
          </div>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        disabled={saving}
        style={{
          background:saving
            ?'#aaa':C.teal,
          color:C.white,
          border:'none',
          borderRadius:8,
          padding:'11px 32px',
          fontSize:14,
          fontWeight:'bold',
          cursor:saving
            ?'not-allowed':'pointer',
          display:'block',
          margin:'0 auto',
        }}>
        {saving
          ?'⏳ Saving...'
          :'💾 Save to Database'}
      </button>

      {/* ── ADDED DATA LIST ── */}
      <div style={{
        marginTop:28,
        paddingTop:20,
        borderTop:
          `2px solid ${C.light}`,
      }}>
        <div style={{
          display:'flex',
          justifyContent:'space-between',
          alignItems:'center',
          marginBottom:12,
        }}>
          <div style={{
            fontSize:14,
            fontWeight:'bold',
            color:C.navy,
          }}>
            📋 Admin Added Records
            {addedData.length > 0 && (
              <span style={{
                background:C.green,
                color:C.white,
                fontSize:11,
                padding:'2px 8px',
                borderRadius:10,
                marginLeft:8,
                fontWeight:'normal',
              }}>
                {addedData.length}
                {' '}record
                {addedData.length!==1
                  ?'s':''}
              </span>
            )}
          </div>
          <button
            onClick={loadAdminData}
            style={{
              background:'transparent',
              color:C.teal,
              border:
                `1px solid ${C.teal}`,
              borderRadius:6,
              padding:'4px 10px',
              cursor:'pointer',
              fontSize:11,
            }}>
            🔄 Refresh
          </button>
        </div>

        {loadingD && (
          <div style={{
            textAlign:'center',
            padding:12,
            color:'#aaa',
            fontSize:13,
          }}>
            ⏳ Loading...
          </div>
        )}

        {!loadingD &&
          addedData.length === 0 && (
          <div style={{
            textAlign:'center',
            padding:20,
            background:'#F4F8FB',
            borderRadius:10,
            color:'#aaa',
            fontSize:13,
          }}>
            No admin-added records yet.
            <br/>
            <span style={{fontSize:11}}>
              Records you add above will
              appear here and can be deleted.
            </span>
          </div>
        )}

        {addedData.length > 0 && (
          <div style={{
            display:'flex',
            flexDirection:'column',
            gap:8,
          }}>
            {addedData.map(d=>(
              <div key={d.year} style={{
                display:'flex',
                alignItems:'center',
                justifyContent:
                  'space-between',
                background:'#F0FEF4',
                border:
                  `1px solid #C3E6CB`,
                borderRadius:10,
                padding:'12px 16px',
              }}>
                {/* Year badge */}
                <div style={{
                  background:C.green,
                  color:C.white,
                  fontWeight:'bold',
                  fontSize:14,
                  padding:'4px 12px',
                  borderRadius:6,
                  minWidth:50,
                  textAlign:'center',
                }}>
                  {d.year}
                </div>

                {/* Stats */}
                <div style={{
                  display:'flex',
                  gap:16,
                  flexWrap:'wrap',
                  flex:1,
                  margin:'0 16px',
                }}>
                  {[
                    ['🏥',
                      (d.inpat/1e6)
                        .toFixed(2)+'M',
                      'Inpatients'],
                    ['🛏️',
                      d.bor+'%',
                      'BOR'],
                    ['📅',
                      d.ados+'d',
                      'ADOS'],
                    ['👥',
                      (d.opd/1e6)
                        .toFixed(1)+'M',
                      'OPD'],
                    ['🚪',
                      (d.disc/1e6)
                        .toFixed(2)+'M',
                      'Discharges'],
                  ].map(([
                    icon,val,label
                  ])=>(
                    <div key={label}
                      style={{
                        textAlign:
                          'center',
                      }}>
                      <div style={{
                        fontSize:10,
                        color:'#888',
                        marginBottom:2,
                      }}>
                        {icon} {label}
                      </div>
                      <div style={{
                        fontSize:13,
                        fontWeight:'bold',
                        color:C.navy,
                      }}>
                        {val}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Delete button */}
                <button
                  onClick={()=>
                    handleDelete(d.year)}
                  style={{
                    background:'#FEF0F0',
                    color:C.red,
                    border:
                      `1px solid ${C.red}`,
                    borderRadius:7,
                    padding:'7px 14px',
                    cursor:'pointer',
                    fontSize:12,
                    fontWeight:'bold',
                    whiteSpace:'nowrap',
                    display:'flex',
                    alignItems:'center',
                    gap:4,
                  }}>
                  🗑️ Delete
                </button>
              </div>
            ))}
          </div>
        )}

        <div style={{
          marginTop:12,
          padding:'8px 12px',
          background:'#FFF9E6',
          borderRadius:7,
          fontSize:11,
          color:'#886600',
          borderLeft:
            `3px solid ${C.orange}`,
        }}>
          ℹ️ Only records added by admin
          appear here. Original Ministry
          of Health data (2013–2024)
          is protected and cannot
          be deleted.
        </div>
      </div>
    </div>
  );
}

// ── Main App ──────────────────────────
export default function App() {
  const [user, setUser] = useState(
    ()=>getSession());

  const [predictions,
    setPredictions] = useState(null);
  const [allPredictions,
    setAllPredictions] = useState(null);
  const [loading, setLoading] =
    useState(false);
  const [error, setError] =
    useState(null);
  const [activeTab, setActiveTab] =
    useState('dashboard');
  const [apiStatus, setApiStatus] =
    useState('checking');
  const [dataStore, setDataStore] =
    useState([]);
  const [newDataMsg, setNewDataMsg] =
    useState('');
  const [selectedYear, setSelectedYear] =
    useState(null);
  const [predictionYear,
    setPredictionYear] = useState(null);
  const [showYearView,
    setShowYearView] = useState(false);
  const [toast, setToast] = useState({
    msg:'', type:'success',
  });

  const showToast =
    (msg,type='success')=>
      setToast({msg,type});
  const clearToast = ()=>
    setToast({msg:'',type:'success'});

  // Load hospital data from database
  const loadHospitalData =
    useCallback(async()=>{
    try {
      const res = await axios.get(
        `${API}/hospital-data`);
      setDataStore(res.data);
      if (res.data.length>0) {
        setSelectedYear(
          res.data[res.data.length-1]
            .year);
      }
    } catch(err) {
      console.error(
        'Failed to load hospital data:',
        err);
    }
  },[]);

  useEffect(()=>{
    axios.get(`${API}/health`)
      .then(()=>setApiStatus('online'))
      .catch(()=>setApiStatus('offline'));
    loadHospitalData();
  },[loadHospitalData]);

  const handleLogin = (foundUser)=>{
    setUser(foundUser);
    saveSession(foundUser);
  };

  const handleLogout = ()=>{
    setUser(null);
    saveSession(null);
    setPredictions(null);
    setAllPredictions(null);
    setActiveTab('dashboard');
    setNewDataMsg('');
    setShowYearView(false);
  };

  const lastRow = dataStore.length>0
    ? dataStore[dataStore.length-1]
    : null;
  const lastYear = lastRow?.year||2024;

  const buildInputs = (row,prev)=>({
    disc_t:row.disc||row.disc_t||0,
    death_t:row.death_t||0,
    inpat_lag1:prev.inpat,
    disc_t_lag1:
      prev.disc||prev.disc_t||0,
    death_t_lag1:prev.death_t||0,
    growth:((row.inpat-prev.inpat)
      /prev.inpat*100),
    covid:row.year<=2021?1:0,
    beds:row.beds,
    bor_lag1:prev.bor,
    beds_lag1:prev.beds,
    bor_growth:row.bor-prev.bor,
    bor:row.bor,
    ados_lag1:prev.ados,
    ados_growth:row.ados-prev.ados,
    opd_lag1:prev.opd,
    opd_growth:((row.opd-prev.opd)
      /prev.opd*100),
    inpat:row.inpat,
  });

  const callAllEndpoints =
    async(inp)=>{
    const [adm,bed,los,opd,disc]=
      await Promise.all([
        axios.post(
          `${API}/predict/admissions`,{
          disc_t:inp.disc_t,
          death_t:inp.death_t,
          inpat_lag1:inp.inpat_lag1,
          disc_t_lag1:inp.disc_t_lag1,
          death_t_lag1:inp.death_t_lag1,
          growth:inp.growth,
          covid:inp.covid,
        }),
        axios.post(
          `${API}/predict/bed-occupancy`,
          {
          beds:inp.beds,
          bor_lag1:inp.bor_lag1,
          beds_lag1:inp.beds_lag1,
          growth:inp.bor_growth,
          covid:inp.covid,
        }),
        axios.post(
          `${API}/predict/length-of-stay`,
          {
          bor:inp.bor,
          ados_lag1:inp.ados_lag1,
          bor_lag1:inp.bor_lag1,
          growth:inp.ados_growth,
          covid:inp.covid,
        }),
        axios.post(
          `${API}/predict/opd`,{
          opd_lag1:inp.opd_lag1,
          growth:inp.opd_growth,
          covid:inp.covid,
        }),
        axios.post(
          `${API}/predict/discharges`,{
          inpat:inp.inpat,
          death_t:inp.death_t,
          disc_t_lag1:inp.disc_t_lag1,
          inpat_lag1:inp.inpat_lag1,
          death_t_lag1:inp.death_t_lag1,
          growth:inp.growth,
          covid:inp.covid,
        }),
      ]);
    return {
      admissions:adm.data,
      bed:bed.data,
      los:los.data,
      opd:opd.data,
      discharges:disc.data,
    };
  };

  const fetchLatestPredictions =
    async()=>{
    if (!lastRow||dataStore.length<2)
      return;
    setLoading(true);
    setError(null);
    try {
      const li=dataStore.length-1;
      const result = await
        callAllEndpoints(buildInputs(
          dataStore[li],
          dataStore[li-1]));
      setPredictions(result);
      setPredictionYear(lastYear+1);
    } catch(err){
      setError(
        'Cannot connect to FlowOpt API.');
    }
    setLoading(false);
  };

  const fetchYearPredictions =
    async(row,prev,baseYear)=>{
    setLoading(true);
    setError(null);
    try {
      const result = await
        callAllEndpoints(
          buildInputs(row,prev));
      setAllPredictions({
        ...result,
        forYear:baseYear+1,
        baseYear,
      });
    } catch(err){
      setError(
        'Cannot connect to FlowOpt API.');
    }
    setLoading(false);
  };

  const handleNewData = async(newRow)=>{
    await loadHospitalData();
    setLoading(true);
    setError(null);
    try {
      const updatedData =
        await axios.get(
          `${API}/hospital-data`);
      const data = updatedData.data;
      setDataStore(data);
      const li = data.length-1;
      if (li>0) {
        const result = await
          callAllEndpoints(
            buildInputs(
              data[li],data[li-1]));
        setPredictions(result);
        setPredictionYear(
          data[li].year+1);
      }
    } catch(err){
      setError(
        'Cannot connect to FlowOpt API.');
    }
    setLoading(false);
    setNewDataMsg(
      `✅ Data for ${newRow.year} saved `
      +`to database! Predictions updated.`
    );
    setActiveTab('dashboard');
    setShowYearView(false);
  };

  const chartData = dataStore.map(d=>({
    year:String(d.year),
    inpat:d.inpat, bor:d.bor,
    ados:d.ados, opd:d.opd,
    disc:d.disc,
  }));
  if (predictions&&predictionYear) {
    chartData.push({
      year:`${predictionYear}(Pred.)`,
      inpat:predictions.admissions
        .predicted_value,
      bor:predictions.bed.predicted_value,
      ados:predictions.los.predicted_value,
      opd:predictions.opd.predicted_value,
      disc:predictions.discharges
        .predicted_value,
    });
  }

  const s={
    app:{
      fontFamily:
        "'Segoe UI',Arial,sans-serif",
      background:C.light,
      minHeight:'100vh',
    },
    header:{
      background:C.navy,color:C.white,
      padding:'13px 26px',
      display:'flex',alignItems:'center',
      justifyContent:'space-between',
    },
    nav:{
      display:'flex',gap:4,
      padding:'0 26px',
      background:C.white,
      borderBottom:'2px solid #e0e8ef',
      overflowX:'auto',
    },
    navBtn:(active)=>({
      padding:'11px 15px',border:'none',
      borderBottom:active
        ?`3px solid ${C.teal}`
        :'3px solid transparent',
      background:'transparent',
      color:active?C.teal:'#666',
      fontWeight:active?'bold':'normal',
      cursor:'pointer',fontSize:13,
      whiteSpace:'nowrap',
    }),
    main:{padding:'18px 26px'},
    card:{
      background:C.white,
      borderRadius:12,
      padding:20,marginBottom:18,
      boxShadow:
        '0 2px 8px rgba(0,0,0,0.06)',
    },
    cardTitle:{
      fontSize:14,fontWeight:'bold',
      color:C.navy,marginBottom:13,
      paddingBottom:8,
      borderBottom:`2px solid ${C.light}`,
    },
    btn:{
      background:C.teal,color:C.white,
      border:'none',borderRadius:8,
      padding:'10px 26px',fontSize:14,
      fontWeight:'bold',cursor:'pointer',
      display:'block',margin:'0 auto',
    },
  };

  if (!user) return (
    <LoginScreen onLogin={handleLogin}/>
  );

  const tabs=[
    ['dashboard','📊 Dashboard'],
    ['trends','📈 Trends'],
    ...(user.role==='admin'?[
      ['adddata','➕ Add New Data'],
      ['users','👥 Manage Users'],
    ]:[]),
    ['about','ℹ️ About'],
  ];

  return (
    <div style={s.app}>
      <Toast
        msg={toast.msg}
        type={toast.type}
        onClose={clearToast}
      />

      {/* Header */}
      <div style={s.header}>
        <div>
          <div style={{
            fontSize:19,fontWeight:'bold',
          }}>🏥 FlowOpt</div>
          <div style={{
            fontSize:11,opacity:0.7,
          }}>
            AI-Powered Hospital Patient
            Flow Optimisation System
          </div>
        </div>
        <div style={{
          display:'flex',
          alignItems:'center',gap:12,
        }}>
          <div style={{textAlign:'right'}}>
            <div style={{
              fontSize:11,
              background:
                apiStatus==='online'
                  ?C.green:C.red,
              color:C.white,
              padding:'3px 9px',
              borderRadius:20,
              display:'inline-block',
            }}>
              {apiStatus==='online'
                ?'✅ API Online'
                :'❌ API Offline'}
            </div>
            <div style={{
              fontSize:10,opacity:0.6,
              marginTop:3,
            }}>
              {user.name} •{' '}
              <span style={{
                textTransform:'capitalize',
              }}>{user.role}</span>
            </div>
          </div>
          <button onClick={handleLogout}
            style={{
              background:
                'rgba(255,255,255,0.15)',
              color:C.white,border:'none',
              borderRadius:6,
              padding:'5px 11px',
              cursor:'pointer',fontSize:12,
            }}>Logout</button>
        </div>
      </div>

      {/* Nav */}
      <div style={s.nav}>
        {tabs.map(([key,label])=>(
          <button key={key}
            style={s.navBtn(
              activeTab===key)}
            onClick={()=>
              setActiveTab(key)}
          >{label}</button>
        ))}
      </div>

      <div style={s.main}>

        {/* ════ DASHBOARD ════ */}
        {activeTab==='dashboard'&&(
          <>
            {newDataMsg&&(
              <div style={{
                padding:'9px 14px',
                background:'#F0FEF4',
                borderRadius:8,
                marginBottom:14,
                borderLeft:
                  `4px solid ${C.green}`,
                fontSize:13,color:C.green,
                fontWeight:'bold',
              }}>{newDataMsg}</div>
            )}

            {/* Main prediction card */}
            <div style={s.card}>
              <div style={s.cardTitle}>
                🤖 Generate Predictions
              </div>
              <p style={{
                color:'#666',fontSize:13,
                marginBottom:14,
              }}>
                Generate FlowOpt predictions
                for all 5 hospital operational
                indicators based on{' '}
                {lastYear} Sri Lanka Ministry
                of Health data
                (R² = 0.9988–1.0000).
              </p>
              <button
                style={s.btn}
                onClick={
                  fetchLatestPredictions}
                disabled={loading
                  ||dataStore.length<2}
              >
                {loading
                  ?'⏳ Generating...'
                  :'🚀 Generate All '
                  +'Predictions'}
              </button>
              {error&&(
                <p style={{
                  color:C.red,
                  textAlign:'center',
                  marginTop:12,
                  fontSize:13,
                }}>{error}</p>
              )}
            </div>

            {/* 5 Stat cards */}
            {predictions&&(
              <>
                {predictionYear&&(
                  <div style={{
                    display:'flex',
                    alignItems:'center',
                    gap:10,marginBottom:12,
                    padding:'10px 16px',
                    background:
                      `linear-gradient(`
                      +`135deg,`
                      +`${C.navy},`
                      +`${C.teal})`,
                    borderRadius:10,
                    color:C.white,
                  }}>
                    <span style={{
                      fontSize:20,
                    }}>📊</span>
                    <div>
                      <div style={{
                        fontSize:14,
                        fontWeight:'bold',
                      }}>
                        Predictions for
                        {' '}Year{' '}
                        {predictionYear}
                      </div>
                      <div style={{
                        fontSize:11,
                        opacity:0.75,
                      }}>
                        Based on {lastYear}
                        {' '}Sri Lanka
                        Ministry of Health
                        data
                      </div>
                    </div>
                  </div>
                )}

                <div style={{
                  display:'flex',gap:10,
                  flexWrap:'wrap',
                  marginBottom:18,
                }}>
                  <StatCard
                    title=
                      "Total Inpatient Admissions"
                    value={predictions
                      .admissions
                      .predicted_value
                      .toLocaleString()}
                    unit="patients per year"
                    color={C.navy}
                    alert={predictions
                      .admissions
                      .high_demand_alert}
                    icon="🏥"
                    prev={lastRow?.inpat}
                  />
                  <StatCard
                    title=
                      "Bed Occupancy Rate"
                    value={predictions.bed
                      .predicted_value+'%'}
                    unit="% beds occupied"
                    color={
                      predictions.bed
                        .predicted_value>85
                        ?C.red:C.teal}
                    alert={predictions.bed
                      .high_demand_alert}
                    icon="🛏️"
                    prev={lastRow?.bor}
                  />
                  <StatCard
                    title=
                      "Avg Length of Stay"
                    value={predictions.los
                      .predicted_value
                      +' days'}
                    unit="days per admission"
                    color={C.purple}
                    alert={false}
                    icon="📅"
                    prev={lastRow?.ados}
                  />
                  <StatCard
                    title="OPD Attendance"
                    value={(predictions.opd
                      .predicted_value/1e6)
                      .toFixed(1)+'M'}
                    unit="outpatient visits"
                    color={C.orange}
                    alert={predictions.opd
                      .high_demand_alert}
                    icon="👥"
                    prev={lastRow?.opd}
                  />
                  <StatCard
                    title=
                      "Discharge Volume"
                    value={predictions
                      .discharges
                      .predicted_value
                      .toLocaleString()}
                    unit="live discharges"
                    color={C.green}
                    alert={false}
                    icon="🚪"
                    prev={lastRow?.disc}
                  />
                </div>

                {/* Alerts */}
                <div style={s.card}>
                  <div style={s.cardTitle}>
                    🔔 System Alerts
                  </div>
                  {[
                    predictions.admissions,
                    predictions.bed,
                    predictions.opd,
                  ].map((p,i)=>(
                    <div key={i} style={{
                      padding:'8px 13px',
                      borderRadius:7,
                      marginBottom:7,
                      background:
                        p.high_demand_alert
                          ?'#FEF0F0'
                          :'#F0FEF4',
                      borderLeft:
                        `4px solid ${
                          p.high_demand_alert
                            ?C.red:C.green}`,
                      fontSize:13,
                    }}>
                      {p.alert_message}
                    </div>
                  ))}
                </div>

                {/* R² chart */}
                <div style={s.card}>
                  <div style={s.cardTitle}>
                    📊 Model Performance
                    — R² Scores
                  </div>
                  <ResponsiveContainer
                    width="100%"
                    height={190}>
                    <BarChart data={[
                      {name:'Admissions',
                        r2:1.0000},
                      {name:'Bed Occ.',
                        r2:0.9997},
                      {name:'LOS',
                        r2:0.9998},
                      {name:'OPD',
                        r2:0.9988},
                      {name:'Discharges',
                        r2:1.0000},
                    ]}>
                      <CartesianGrid
                        strokeDasharray=
                          "3 3"/>
                      <XAxis
                        dataKey="name"
                        fontSize={11}/>
                      <YAxis
                        domain={[0.99,1.0]}
                        fontSize={11}
                        tickFormatter={
                          v=>v.toFixed(3)}/>
                      <Tooltip formatter={
                        v=>v.toFixed(4)}/>
                      <Bar
                        dataKey="r2"
                        fill={C.teal}
                        name="R² Score"
                        radius={[4,4,0,0]}/>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}

            {/* Year view section */}
            <div style={s.card}>
              <div style={{
                display:'flex',
                justifyContent:
                  'space-between',
                alignItems:'center',
                marginBottom:
                  showYearView?12:0,
              }}>
                <div style={s.cardTitle}
                  >
                  📅 View by Year
                </div>
                <button
                  onClick={()=>
                    setShowYearView(
                      !showYearView)}
                  style={{
                    background:
                      showYearView
                        ?C.navy:C.teal,
                    color:C.white,
                    border:'none',
                    borderRadius:7,
                    padding:'6px 14px',
                    cursor:'pointer',
                    fontSize:12,
                    fontWeight:'bold',
                  }}>
                  {showYearView
                    ?'▲ Hide':'▼ Show'}
                </button>
              </div>

              {showYearView&&(
                <>
                  {/* Year buttons */}
                  <div style={{
                    display:'flex',
                    flexWrap:'wrap',
                    gap:8,marginBottom:14,
                  }}>
                    {/* All Years */}
                    <button
                      onClick={()=>{
                        setSelectedYear(
                          'all');
                        setAllPredictions(
                          null);
                        const li=
                          dataStore.length-1;
                        if (li>0) {
                          fetchYearPredictions(
                            dataStore[li],
                            dataStore[li-1],
                            dataStore[li]
                              .year);
                        }
                      }}
                      style={{
                        padding:'7px 14px',
                        borderRadius:7,
                        border:
                          `2px solid ${
                            selectedYear===
                              'all'
                              ?C.orange
                              :'#ddd'}`,
                        background:
                          selectedYear===
                            'all'
                            ?C.orange
                            :C.white,
                        color:
                          selectedYear===
                            'all'
                            ?C.white:'#555',
                        fontWeight:
                          selectedYear===
                            'all'
                            ?'bold':'normal',
                        cursor:'pointer',
                        fontSize:13,
                      }}>
                      📊 All Years
                    </button>

                    {/* 2013 locked */}
                    <button disabled
                      style={{
                        padding:'7px 14px',
                        borderRadius:7,
                        border:
                          '2px solid #eee',
                        background:
                          '#f5f5f5',
                        color:'#bbb',
                        fontSize:13,
                        cursor:'not-allowed',
                      }}
                      title=
                        "Cannot predict — needs 2012 lag data"
                    >
                      2013 🔒
                    </button>

                    {/* 2014–latest */}
                    {dataStore.slice(1)
                      .map(d=>(
                      <button
                        key={d.year}
                        onClick={()=>{
                          setSelectedYear(
                            d.year);
                          setAllPredictions(
                            null);
                        }}
                        style={{
                          padding:
                            '7px 14px',
                          borderRadius:7,
                          border:
                            `2px solid ${
                              selectedYear===
                                d.year
                                ?C.teal
                                :'#ddd'}`,
                          background:
                            selectedYear===
                              d.year
                              ?C.teal
                              :C.white,
                          color:
                            selectedYear===
                              d.year
                              ?C.white
                              :'#555',
                          fontWeight:
                            selectedYear===
                              d.year
                              ?'bold'
                              :'normal',
                          cursor:'pointer',
                          fontSize:13,
                        }}>
                        {d.year}
                        {d.year===lastYear
                          ?' ⭐':''}
                      </button>
                    ))}
                  </div>

                  {/* All years table */}
                  {selectedYear==='all'&&(
                    <div>
                      <div style={{
                        fontSize:12,
                        fontWeight:'bold',
                        color:C.navy,
                        marginBottom:10,
                        display:'flex',
                        alignItems:'center',
                        gap:6,
                      }}>
                        <span style={{
                          background:
                            C.orange,
                          color:C.white,
                          padding:
                            '2px 7px',
                          borderRadius:4,
                          fontSize:10,
                        }}>
                          ALL YEARS
                        </span>
                        Actual (2013–
                        {lastYear})
                        + {lastYear+1}
                        {' '}Forecast
                      </div>

                      {loading&&(
                        <div style={{
                          textAlign:
                            'center',
                          padding:12,
                          color:C.teal,
                          fontSize:13,
                        }}>
                          ⏳ Loading...
                        </div>
                      )}

                      <div style={{
                        overflowX:'auto',
                      }}>
                        <table style={{
                          width:'100%',
                          borderCollapse:
                            'collapse',
                          fontSize:12,
                          minWidth:700,
                        }}>
                          <thead>
                            <tr style={{
                              background:
                                C.navy,
                              color:C.white,
                            }}>
                              {['Year',
                                'Type',
                                '🏥 Inpatients',
                                '🛏️ BOR%',
                                '📅 ADOS',
                                '👥 OPD',
                                '🚪 Discharges',
                                '💀 Deaths',
                                '🏨 Beds']
                                .map(h=>(
                                <th key={h}
                                  style={{
                                    padding:
                                      '8px 10px',
                                    textAlign:
                                      h==='Year'
                                      ||h==='Type'
                                        ?'left'
                                        :'right',
                                    whiteSpace:
                                      'nowrap',
                                  }}>
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {dataStore
                              .map((d,i)=>(
                              <tr
                                key={d.year}
                                style={{
                                  background:
                                    d.year===
                                      lastYear
                                      ?'#EBF5FB'
                                      :i%2===0
                                        ?'#F4F8FB'
                                        :C.white,
                                  borderBottom:
                                    '1px solid'
                                    +' #eee',
                                }}>
                                <td style={{
                                  padding:
                                    '7px 10px',
                                  fontWeight:
                                    'bold',
                                  color:C.navy,
                                }}>
                                  {d.year}
                                  {d.year===
                                    lastYear&&
                                    ' ⭐'}
                                </td>
                                <td style={{
                                  padding:
                                    '7px 10px',
                                }}>
                                  <span
                                    style={{
                                      background:
                                        C.teal,
                                      color:
                                        C.white,
                                      padding:
                                        '1px 6px',
                                      borderRadius:
                                        3,
                                      fontSize:
                                        10,
                                    }}>
                                    ACTUAL
                                  </span>
                                </td>
                                {[
                                  d.inpat
                                    ?.toLocaleString()
                                    ||'—',
                                  d.bor+'%',
                                  d.ados+'d',
                                  d.opd
                                    ?(d.opd/1e6)
                                      .toFixed(1)
                                      +'M'
                                    :'—',
                                  d.disc
                                    ?.toLocaleString()
                                    ||'—',
                                  d.death_t
                                    ?.toLocaleString()
                                    ||'—',
                                  d.beds
                                    ?.toLocaleString()
                                    ||'—',
                                ].map((v,j)=>(
                                  <td key={j}
                                    style={{
                                      padding:
                                        '7px 10px',
                                      textAlign:
                                        'right',
                                      fontWeight:
                                        j===0
                                          ?'bold'
                                          :'normal',
                                    }}>
                                    {v}
                                  </td>
                                ))}
                              </tr>
                            ))}

                            {/* Predicted */}
                            {allPredictions
                              &&(
                              <tr style={{
                                background:
                                  '#F0FEF4',
                                borderTop:
                                  `2px solid`
                                  +` ${C.green}`,
                              }}>
                                <td style={{
                                  padding:
                                    '8px 10px',
                                  fontWeight:
                                    'bold',
                                  color:
                                    C.green,
                                }}>
                                  {lastYear+1}
                                  {' '}🔮
                                </td>
                                <td style={{
                                  padding:
                                    '8px 10px',
                                }}>
                                  <span
                                    style={{
                                      background:
                                        C.green,
                                      color:
                                        C.white,
                                      padding:
                                        '1px 6px',
                                      borderRadius:
                                        3,
                                      fontSize:
                                        10,
                                    }}>
                                    PREDICTED
                                  </span>
                                </td>
                                {[
                                  [allPredictions
                                    .admissions
                                    .predicted_value
                                    .toLocaleString(),
                                    allPredictions
                                      .admissions
                                      .high_demand_alert],
                                  [allPredictions
                                    .bed
                                    .predicted_value
                                    +'%',
                                    allPredictions
                                      .bed
                                      .high_demand_alert],
                                  [allPredictions
                                    .los
                                    .predicted_value
                                    +'d',false],
                                  [(allPredictions
                                    .opd
                                    .predicted_value
                                    /1e6)
                                    .toFixed(1)
                                    +'M',
                                    allPredictions
                                      .opd
                                      .high_demand_alert],
                                  [allPredictions
                                    .discharges
                                    .predicted_value
                                    .toLocaleString(),
                                    false],
                                  ['—',false],
                                  ['—',false],
                                ].map(
                                  ([v,alert],
                                  j)=>(
                                  <td key={j}
                                    style={{
                                      padding:
                                        '8px 10px',
                                      textAlign:
                                        'right',
                                      fontWeight:
                                        j===0
                                          ?'bold'
                                          :'normal',
                                      color:
                                        alert
                                          ?C.red
                                          :C.green,
                                    }}>
                                    {v}
                                    {alert&&
                                      ' ⚠️'}
                                  </td>
                                ))}
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Single year view */}
                  {selectedYear!=='all'
                    &&selectedYear&&(
                    (()=>{
                      const row =
                        dataStore.find(
                          d=>d.year===
                            selectedYear);
                      const idx =
                        dataStore.findIndex(
                          d=>d.year===
                            selectedYear);
                      const canPredict =
                        idx>0;
                      const hasPred =
                        allPredictions
                        &&allPredictions
                          .baseYear===
                          selectedYear;

                      return (
                        <div>
                          <div style={{
                            display:'grid',
                            gridTemplateColumns:
                              '1fr 1fr',
                            gap:14,
                            marginBottom:14,
                          }}>
                            {/* Actual */}
                            <div style={{
                              background:
                                '#F4F8FB',
                              borderRadius:
                                10,
                              padding:14,
                              border:
                                '1px solid'
                                +' #dde6ef',
                            }}>
                              <div style={{
                                fontSize:12,
                                fontWeight:
                                  'bold',
                                color:C.navy,
                                marginBottom:
                                  10,
                                paddingBottom:
                                  7,
                                borderBottom:
                                  '1px solid'
                                  +' #dde6ef',
                                display:
                                  'flex',
                                alignItems:
                                  'center',
                                gap:6,
                              }}>
                                <span style={{
                                  background:
                                    C.navy,
                                  color:
                                    C.white,
                                  padding:
                                    '1px 7px',
                                  borderRadius:
                                    4,
                                  fontSize:10,
                                }}>
                                  ACTUAL
                                </span>
                                {selectedYear}
                                {' '}Data
                              </div>
                              {[
                                ['🏥',
                                  'Inpatients',
                                  row?.inpat
                                    ?.toLocaleString()],
                                ['🛏️',
                                  'BOR',
                                  row?.bor+'%'],
                                ['📅',
                                  'Avg LOS',
                                  row?.ados
                                    +' days'],
                                ['👥',
                                  'OPD',
                                  row?.opd
                                    ?(row.opd/1e6)
                                      .toFixed(1)
                                      +'M':'—'],
                                ['🚪',
                                  'Discharges',
                                  row?.disc
                                    ?.toLocaleString()],
                                ['💀',
                                  'Deaths',
                                  row?.death_t
                                    ?.toLocaleString()
                                    ||'—'],
                                ['🏨',
                                  'Beds',
                                  row?.beds
                                    ?.toLocaleString()],
                              ].map(([
                                icon,lbl,val
                              ])=>(
                                <div
                                  key={lbl}
                                  style={{
                                    display:
                                      'flex',
                                    justifyContent:
                                      'space-between',
                                    alignItems:
                                      'center',
                                    padding:
                                      '5px 0',
                                    borderBottom:
                                      '1px solid'
                                      +' #eef2f7',
                                    fontSize:12,
                                  }}>
                                  <span style={{
                                    color:'#555',
                                    display:
                                      'flex',
                                    gap:4,
                                    alignItems:
                                      'center',
                                  }}>
                                    {icon}
                                    {' '}{lbl}
                                  </span>
                                  <span style={{
                                    fontWeight:
                                      'bold',
                                    color:C.navy,
                                  }}>
                                    {val||'—'}
                                  </span>
                                </div>
                              ))}
                            </div>

                            {/* Predicted */}
                            <div style={{
                              background:
                                hasPred
                                  ?'#F0FEF4'
                                  :'#FAFAFA',
                              borderRadius:
                                10,
                              padding:14,
                              border:
                                `1px solid ${
                                  hasPred
                                    ?'#C3E6CB'
                                    :'#eee'}`,
                            }}>
                              <div style={{
                                fontSize:12,
                                fontWeight:
                                  'bold',
                                color:hasPred
                                  ?C.green
                                  :'#aaa',
                                marginBottom:
                                  10,
                                paddingBottom:
                                  7,
                                borderBottom:
                                  `1px solid ${
                                    hasPred
                                      ?'#C3E6CB'
                                      :'#eee'}`,
                                display:
                                  'flex',
                                alignItems:
                                  'center',
                                gap:6,
                              }}>
                                <span style={{
                                  background:
                                    hasPred
                                      ?C.green
                                      :'#ccc',
                                  color:
                                    C.white,
                                  padding:
                                    '1px 7px',
                                  borderRadius:
                                    4,
                                  fontSize:10,
                                }}>
                                  PREDICTED
                                </span>
                                {selectedYear
                                  +1}
                                {' '}Forecast
                              </div>

                              {!canPredict?(
                                <div style={{
                                  textAlign:
                                    'center',
                                  padding:20,
                                  color:'#aaa',
                                  fontSize:12,
                                }}>
                                  🔒 Cannot
                                  predict
                                  from 2013
                                </div>
                              ):!hasPred?(
                                <div style={{
                                  textAlign:
                                    'center',
                                  padding:20,
                                  color:'#aaa',
                                  fontSize:12,
                                }}>
                                  Click
                                  Generate
                                  below
                                </div>
                              ):(
                                [
                                  ['🏥',
                                    'Inpatients',
                                    allPredictions
                                      .admissions
                                      .predicted_value
                                      .toLocaleString(),
                                    allPredictions
                                      .admissions
                                      .high_demand_alert],
                                  ['🛏️',
                                    'BOR',
                                    allPredictions
                                      .bed
                                      .predicted_value
                                      +'%',
                                    allPredictions
                                      .bed
                                      .high_demand_alert],
                                  ['📅',
                                    'Avg LOS',
                                    allPredictions
                                      .los
                                      .predicted_value
                                      +' days',
                                    false],
                                  ['👥',
                                    'OPD',
                                    (allPredictions
                                      .opd
                                      .predicted_value
                                      /1e6)
                                      .toFixed(1)
                                      +'M',
                                    allPredictions
                                      .opd
                                      .high_demand_alert],
                                  ['🚪',
                                    'Discharges',
                                    allPredictions
                                      .discharges
                                      .predicted_value
                                      .toLocaleString(),
                                    false],
                                ].map(([
                                  icon,lbl,
                                  val,alert
                                ])=>(
                                  <div
                                    key={lbl}
                                    style={{
                                      display:
                                        'flex',
                                      justifyContent:
                                        'space-between',
                                      alignItems:
                                        'center',
                                      padding:
                                        '5px 0',
                                      borderBottom:
                                        '1px solid'
                                        +' #d4edda',
                                      fontSize:
                                        12,
                                    }}>
                                    <span
                                      style={{
                                        color:
                                          '#555',
                                        display:
                                          'flex',
                                        gap:4,
                                        alignItems:
                                          'center',
                                      }}>
                                      {icon}
                                      {' '}{lbl}
                                    </span>
                                    <span
                                      style={{
                                        fontWeight:
                                          'bold',
                                        color:
                                          alert
                                            ?C.red
                                            :C.green,
                                      }}>
                                      {val}
                                      {alert&&
                                        ' ⚠️'}
                                    </span>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>

                          {canPredict&&(
                            <button
                              onClick={()=>
                                fetchYearPredictions(
                                  dataStore[idx],
                                  dataStore[
                                    idx-1],
                                  selectedYear)}
                              disabled={
                                loading}
                              style={{
                                background:
                                  C.teal,
                                color:C.white,
                                border:'none',
                                borderRadius:
                                  7,
                                padding:
                                  '9px 20px',
                                fontSize:13,
                                fontWeight:
                                  'bold',
                                cursor:
                                  'pointer',
                                display:
                                  'block',
                                margin:
                                  '0 auto',
                              }}>
                              {loading
                                ?'⏳ ...'
                                :`🚀 Generate`
                                +` ${selectedYear
                                  +1}`
                                +` Predictions`}
                            </button>
                          )}
                        </div>
                      );
                    })()
                  )}
                </>
              )}
            </div>
          </>
        )}

        {/* ════ TRENDS ════ */}
        {activeTab==='trends'&&(
          <>
            {[
              ['inpat',
                '🏥 Total Inpatients',
                C.navy,
                v=>(v/1e6).toFixed(1)
                  +'M',
                v=>v.toLocaleString()
                  +' patients'],
              ['bor',
                '🛏️ Bed Occupancy %',
                C.teal,
                v=>v+'%',v=>v+'%'],
              ['opd',
                '👥 OPD Attendance',
                C.orange,
                v=>(v/1e6).toFixed(0)
                  +'M',
                v=>v.toLocaleString()
                  +' visits'],
              ['ados',
                '📅 Avg LOS',
                C.purple,
                v=>v+' days',
                v=>v+' days'],
            ].map(([key,title,color,
              tickFmt,tooltipFmt])=>(
              <div key={key}
                style={s.card}>
                <div style={s.cardTitle}>
                  {title}
                </div>
                <ResponsiveContainer
                  width="100%"
                  height={240}>
                  <LineChart
                    data={chartData}>
                    <CartesianGrid
                      strokeDasharray=
                        "3 3"/>
                    <XAxis
                      dataKey="year"
                      fontSize={11}/>
                    <YAxis
                      tickFormatter={
                        tickFmt}
                      fontSize={11}/>
                    <Tooltip
                      formatter={
                        tooltipFmt}/>
                    <Legend/>
                    <Line
                      type="monotone"
                      dataKey={key}
                      stroke={color}
                      strokeWidth={2}
                      dot={{r:4}}
                      name={title}/>
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ))}
          </>
        )}

        {/* ════ ADD DATA ════ */}
        {activeTab==='adddata'
          &&user.role==='admin'&&(
          <div style={s.card}>
            <AddDataForm
              onSubmit={handleNewData}
              lastYear={lastYear}
              showToast={showToast}
            />
          </div>
        )}

        {/* ════ MANAGE USERS ════ */}
        {activeTab==='users'
          &&user.role==='admin'&&(
          <div style={s.card}>
            <UserManagement
              showToast={showToast}
            />
          </div>
        )}

        {/* ════ ABOUT ════ */}
        {activeTab==='about'&&(
          <div style={s.card}>
            <div style={s.cardTitle}>
              ℹ️ About FlowOpt
            </div>
            {[
              ['System',
                'FlowOpt v2.0.0'],
              ['Author',
                'Samadhi Santhushee '
                +'Denagama'],
              ['Student ID',
                'st20283337'],
              ['Programme',
                'BSc (Hons) '
                +'Data Science'],
              ['Institution',
                'Cardiff Metropolitan '
                +'University / '
                +'ICBT Campus'],
              ['Data Source',
                'Sri Lanka MoH '
                +'IMMR & AHB 2013–2024'],
              ['Training',
                '2014–2024 '
                +'(11 observations)'],
              ['Algorithm',
                'Linear Regression '
                +'(R²=0.9988–1.0000)'],
              ['Backend',
                'FastAPI + SQLite '
                +'(Python 3.11)'],
              ['Frontend',
                'React.js + Recharts'],
              ['Database',
                'SQLite — stores users '
                +'& hospital data'],
              ['Auth',
                'Database-backed '
                +'(bcrypt hashed passwords)'],
            ].map(([k,v])=>(
              <div key={k} style={{
                display:'flex',
                padding:'8px 0',
                borderBottom:
                  '1px solid #f0f0f0',
                fontSize:13,
              }}>
                <div style={{
                  width:180,
                  fontWeight:'bold',
                  color:C.navy,
                  flexShrink:0,
                }}>{k}</div>
                <div style={{
                  color:'#444',
                }}>{v}</div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div style={{
          textAlign:'center',
          color:'#aaa', fontSize:11,
          marginTop:18, paddingTop:12,
          borderTop:'1px solid #e0e8ef',
        }}>
          FlowOpt v2.0.0 — Samadhi
          Santhushee Denagama —
          st20283337 — Cardiff
          Metropolitan University /
          ICBT Campus Sri Lanka
        </div>
      </div>
    </div>
  );
}
