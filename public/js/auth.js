document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');
  const collegeInput = document.getElementById('college');
  const courseInput = document.getElementById('course');
  const departmentInput = document.getElementById('department');
  const academicYearInput = document.getElementById('academicYear');
  const yearInput = document.getElementById('year');
  // Academic Year format enforcement
  if (academicYearInput) {
    academicYearInput.addEventListener('blur', () => {
      const val = academicYearInput.value.trim();
      if (!/^\d{4}-\d{4}$/.test(val)) {
        alert('Please enter Academic Year in format: 2024-2025');
        academicYearInput.value = '';
        academicYearInput.focus();
      }
    });
  }

  // Current Year enforcement (1-4 only)
  if (yearInput) {
    yearInput.addEventListener('blur', () => {
      const val = yearInput.value.trim();
      if (!/^[1-4]$/.test(val)) {
        alert('Please enter Current Year as a number between 1 and 4.');
        yearInput.value = '';
        yearInput.focus();
      }
    });
  }
  let collegeList = [];
  let selectedCollege = '';
  let courseList = [];
  let selectedCourse = '';
  let departmentList = [];
  let selectedDepartment = '';

  // If already logged in, honor next redirect without showing the form
  (async () => {
    const params = new URLSearchParams(window.location.search);
    const next = params.get('next');
    const t = localStorage.getItem('token');
    if (!t) return;
    try {
      const res = await fetch('/api/auth/me', { headers: { Authorization: 'Bearer ' + t } });
      if (!res.ok) throw new Error('unauthorized');
      const user = await res.json();
      if (next === '/admin.html') {
        if (user.role === 'admin') {
          window.location.replace(next);
        } else {
          window.location.replace('/dashboard.html');
        }
      } else if (next) {
        window.location.replace(next);
      } else {
        window.location.replace('/dashboard.html');
      }
    } catch (_) {
      // invalid token; clear and show login
      localStorage.removeItem('token');
    }
  })();

  // Autocomplete dropdown container
  let dropdown;
  if (collegeInput) {
    dropdown = document.createElement('div');
    dropdown.id = 'college-suggestions';
    // Use relative positioning so the list takes space and doesn't overlap fields below
    dropdown.style.position = 'relative';
    dropdown.style.width = '100%';
    dropdown.style.marginTop = '6px';
    dropdown.className = 'glass';
    dropdown.style.padding = '6px';
  dropdown.style.maxHeight = '220px';
  dropdown.style.overflowY = 'hidden';
    dropdown.style.overflowX = 'hidden';
    dropdown.style.borderRadius = '14px';
    dropdown.style.backdropFilter = 'blur(8px)';
    dropdown.style.webkitBackdropFilter = 'blur(8px)';
    dropdown.style.display = 'none';

    // Wrap input in a relatively positioned container to anchor dropdown
  const wrapper = document.createElement('div');
  wrapper.style.position = 'relative';
  wrapper.style.width = '100%';
    collegeInput.parentNode.insertBefore(wrapper, collegeInput);
    wrapper.appendChild(collegeInput);
    wrapper.appendChild(dropdown);

    fetch('/data/colleges.json').then(r=>r.json()).then(list => { collegeList = list; });

    const render = (items) => {
      dropdown.innerHTML = '';
      if (!items.length) { dropdown.style.display = 'none'; return; }
      items.slice(0, 8).forEach(name => {
        const item = document.createElement('div');
        item.textContent = name;
        item.style.padding = '8px 10px';
        item.style.cursor = 'pointer';
        item.style.borderRadius = '10px';
        item.addEventListener('mouseenter', ()=> item.style.background = 'rgba(255,255,255,.06)');
        item.addEventListener('mouseleave', ()=> item.style.background = 'transparent');
        // Use mousedown so it runs before input blur clears non-matching text
        item.addEventListener('mousedown', (e) => {
          e.preventDefault();
          collegeInput.value = name;
          selectedCollege = name;
          dropdown.style.display = 'none';
        });
        item.addEventListener('click', () => {
          collegeInput.value = name;
          selectedCollege = name;
          dropdown.style.display = 'none';
        });
        dropdown.appendChild(item);
      });
      dropdown.style.display = 'block';
    };

    const filter = (q) => {
      const s = q.trim().toLowerCase();
      if (!s) { dropdown.style.display = 'none'; return; }
      const items = collegeList.filter(n => n.toLowerCase().includes(s));
      render(items);
    };

    collegeInput.addEventListener('input', (e) => {
      selectedCollege = '';
      filter(e.target.value);
    });
    collegeInput.addEventListener('focus', (e) => filter(e.target.value));
    collegeInput.addEventListener('blur', (e) => {
      const val = collegeInput.value.trim();
      if (!collegeList.find(n => n.toLowerCase() === val.toLowerCase())) {
        collegeInput.value = '';
        selectedCollege = '';
        dropdown.style.display = 'none';
      }
    });
    document.addEventListener('click', (e) => {
      if (!dropdown.contains(e.target) && e.target !== collegeInput) dropdown.style.display = 'none';
    });
  }

  // Department autocomplete dropdown
  let deptDropdown;
  if (departmentInput) {
    deptDropdown = document.createElement('div');
    deptDropdown.id = 'department-suggestions';
    deptDropdown.style.position = 'relative';
    deptDropdown.style.width = '100%';
    deptDropdown.style.marginTop = '6px';
    deptDropdown.className = 'glass';
    deptDropdown.style.padding = '6px';
  deptDropdown.style.maxHeight = '220px';
  deptDropdown.style.overflowY = 'hidden';
    deptDropdown.style.overflowX = 'hidden';
    deptDropdown.style.borderRadius = '14px';
    deptDropdown.style.backdropFilter = 'blur(8px)';
    deptDropdown.style.webkitBackdropFilter = 'blur(8px)';
    deptDropdown.style.display = 'none';

    const dwrap = document.createElement('div');
    dwrap.style.position = 'relative';
    dwrap.style.width = '100%';
    departmentInput.parentNode.insertBefore(dwrap, departmentInput);
    dwrap.appendChild(departmentInput);
    dwrap.appendChild(deptDropdown);

    fetch('/data/departments.json').then(r=>r.json()).then(list => { departmentList = list; });

    const renderDept = (items) => {
      deptDropdown.innerHTML = '';
      if (!items.length) { deptDropdown.style.display = 'none'; return; }
      items.slice(0, 8).forEach(name => {
        const item = document.createElement('div');
        item.textContent = name;
        item.style.padding = '8px 10px';
        item.style.cursor = 'pointer';
        item.style.borderRadius = '10px';
        item.addEventListener('mouseenter', ()=> item.style.background = 'rgba(255,255,255,.06)');
        item.addEventListener('mouseleave', ()=> item.style.background = 'transparent');
        item.addEventListener('mousedown', (e) => {
          e.preventDefault();
          departmentInput.value = name;
          selectedDepartment = name;
          deptDropdown.style.display = 'none';
        });
        item.addEventListener('click', () => {
          departmentInput.value = name;
          selectedDepartment = name;
          deptDropdown.style.display = 'none';
        });
        deptDropdown.appendChild(item);
      });
      deptDropdown.style.display = 'block';
    };

    const filterDept = (q) => {
      const s = q.trim().toLowerCase();
      if (!s) { deptDropdown.style.display = 'none'; return; }
      const items = departmentList.filter(n => n.toLowerCase().includes(s));
      renderDept(items);
    };

    departmentInput.addEventListener('input', (e) => {
      selectedDepartment = '';
      filterDept(e.target.value);
    });
    departmentInput.addEventListener('focus', (e) => filterDept(e.target.value));
    departmentInput.addEventListener('blur', (e) => {
      const val = departmentInput.value.trim();
      if (!departmentList.find(n => n.toLowerCase() === val.toLowerCase())) {
        departmentInput.value = '';
        selectedDepartment = '';
        deptDropdown.style.display = 'none';
      }
    });
    document.addEventListener('click', (e) => {
      if (!deptDropdown.contains(e.target) && e.target !== departmentInput) deptDropdown.style.display = 'none';
    });
  }

  // Course autocomplete dropdown
  let courseDropdown;
  if (courseInput) {
    courseDropdown = document.createElement('div');
    courseDropdown.id = 'course-suggestions';
    courseDropdown.style.position = 'relative';
    courseDropdown.style.width = '100%';
    courseDropdown.style.marginTop = '6px';
    courseDropdown.className = 'glass';
    courseDropdown.style.padding = '6px';
  courseDropdown.style.maxHeight = '220px';
  courseDropdown.style.overflowY = 'hidden';
    courseDropdown.style.overflowX = 'hidden';
    courseDropdown.style.borderRadius = '14px';
    courseDropdown.style.backdropFilter = 'blur(8px)';
    courseDropdown.style.webkitBackdropFilter = 'blur(8px)';
    courseDropdown.style.display = 'none';

    const cwrap = document.createElement('div');
    cwrap.style.position = 'relative';
    cwrap.style.width = '100%';
    courseInput.parentNode.insertBefore(cwrap, courseInput);
    cwrap.appendChild(courseInput);
    cwrap.appendChild(courseDropdown);

    fetch('/data/courses.json').then(r=>r.json()).then(list => { courseList = list; });

    const renderCourse = (items) => {
      courseDropdown.innerHTML = '';
      if (!items.length) { courseDropdown.style.display = 'none'; return; }
      items.slice(0, 8).forEach(name => {
        const item = document.createElement('div');
        item.textContent = name;
        item.style.padding = '8px 10px';
        item.style.cursor = 'pointer';
        item.style.borderRadius = '10px';
        item.addEventListener('mouseenter', ()=> item.style.background = 'rgba(255,255,255,.06)');
        item.addEventListener('mouseleave', ()=> item.style.background = 'transparent');
        item.addEventListener('mousedown', (e) => {
          e.preventDefault();
          courseInput.value = name;
          selectedCourse = name;
          courseDropdown.style.display = 'none';
        });
        item.addEventListener('click', () => {
          courseInput.value = name;
          selectedCourse = name;
          courseDropdown.style.display = 'none';
        });
        courseDropdown.appendChild(item);
      });
      courseDropdown.style.display = 'block';
    };

    const filterCourse = (q) => {
      const s = q.trim().toLowerCase();
      if (!s) { courseDropdown.style.display = 'none'; return; }
      const items = courseList.filter(n => n.toLowerCase().includes(s));
      renderCourse(items);
    };

    courseInput.addEventListener('input', (e) => {
      selectedCourse = '';
      filterCourse(e.target.value);
    });
    courseInput.addEventListener('focus', (e) => filterCourse(e.target.value));
    courseInput.addEventListener('blur', (e) => {
      const val = courseInput.value.trim();
      if (!courseList.find(n => n.toLowerCase() === val.toLowerCase())) {
        courseInput.value = '';
        selectedCourse = '';
        courseDropdown.style.display = 'none';
      }
    });
    document.addEventListener('click', (e) => {
      if (!courseDropdown.contains(e.target) && e.target !== courseInput) courseDropdown.style.display = 'none';
    });
  }

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const params = new URLSearchParams(window.location.search);
      const next = params.get('next');
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.token) {
        localStorage.setItem('token', data.token);
        // If a next path is provided and it's the admin page, ensure user is admin
        if (next === '/admin.html') {
          if (data.user?.role === 'admin') {
            window.location.href = next;
          } else {
            alert('Admin access only. You have been logged into your dashboard.');
            window.location.href = '/dashboard.html';
          }
        } else if (next) {
          window.location.href = next;
        } else {
          window.location.href = '/dashboard.html';
        }
      } else {
        alert(data.error);
      }
      if (departmentInput) {
        const typedD = departmentInput.value.trim();
        const matchD = departmentList.find(n => n.toLowerCase() === typedD.toLowerCase());
        if (!matchD) {
          alert('Please select a department from the suggestions list.');
          departmentInput.focus();
          return;
        }
      }
    });
  }

  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      // Enforce selection from the provided list
      if (collegeInput) {
        const typed = collegeInput.value.trim();
        const match = collegeList.find(n => n.toLowerCase() === typed.toLowerCase());
        if (!match) {
          alert('Please select a college from the suggestions list.');
          collegeInput.focus();
          return;
        }
      }
      if (courseInput) {
        const typedC = courseInput.value.trim();
        const matchC = courseList.find(n => n.toLowerCase() === typedC.toLowerCase());
        if (!matchC) {
          alert('Please select a course from the suggestions list.');
          courseInput.focus();
          return;
        }
      }
      if (academicYearInput) {
        const val = academicYearInput.value.trim();
        if (!/^\d{4}-\d{4}$/.test(val)) {
          alert('Please enter Academic Year in format: 2024-2025');
          academicYearInput.focus();
          return;
        }
      }
      if (yearInput) {
        const val = yearInput.value.trim();
        if (!/^[1-4]$/.test(val)) {
          alert('Please enter Current Year as a number between 1 and 4.');
          yearInput.focus();
          return;
        }
      }
      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const college = document.getElementById('college').value;
      const department = document.getElementById('department').value;
      const course = document.getElementById('course').value;
  const academicYear = document.getElementById('academicYear').value;
  const year = document.getElementById('year')?.value;
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name, email, password, college, department, course, academicYear, year }),
      });
      const data = await res.json();
      if (data.token) {
        localStorage.setItem('token', data.token);
        window.location.href = '/dashboard.html';
      } else {
        alert(data.error);
      }
    });
  }
});
