const COMMON_PASSWORDS = [
    '123456', 'password', '12345678', 'qwerty', '123456789', '12345', '1234', '111111',
    '1234567', 'dragon', '123123', 'baseball', 'abc123', 'football', 'monkey', 'letmein',
    'shadow', 'master', '666666', 'qwertyuiop'
];

let generationAttempts = 0;
let nicknameValid = false;

const suffixes = ['', 'Pro', 'Star', 'Travel', 'Go', 'World', 'Explorer', 'Adventurer'];

function validatePhone(phone) {
    const phoneRegex = /^\+375(29|33|44|25|17)\d{7}$/;
    return phoneRegex.test(phone);
}

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validateAge(birthDate) {
    if (!birthDate) return false;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age >= 16;
}

function validatePassword(password) {
    if (!password || password.length < 8 || password.length > 20) return false;
    if (!/[A-Z]/.test(password)) return false;
    if (!/[a-z]/.test(password)) return false;
    if (!/[0-9]/.test(password)) return false;
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) return false;
    if (COMMON_PASSWORDS.includes(password.toLowerCase())) return false;
    return true;
}

function validateName(name) {
    return name && name.trim().length >= 2;
}

function generateNickname(firstName, lastName) {
    generationAttempts++;
    
    const firstPart = firstName.slice(0, Math.floor(Math.random() * 3) + 1);
    const lastPart = lastName.slice(0, Math.floor(Math.random() * 3) + 1);
    const number = Math.floor(Math.random() * 990) + 10;
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    
    let nickname = firstPart + lastPart + number;
    if (suffix) nickname += suffix;
    
    return nickname;
}

async function isNicknameUnique(nickname) {
    if (!nickname) return false;
    try {
        const response = await fetch(`${API_BASE}/users`);
        const users = await response.json();
        return !users.some(u => u.nickname === nickname);
    } catch (error) {
        console.error('Error checking nickname:', error);
        return true;
    }
}

function generateRandomPassword() {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const special = '!@#$%^&*()';
    
    let password = '';
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += special[Math.floor(Math.random() * special.length)];
    
    const all = uppercase + lowercase + numbers + special;
    for (let i = password.length; i < 12; i++) {
        password += all[Math.floor(Math.random() * all.length)];
    }
    
    return password.split('').sort(() => Math.random() - 0.5).join('');
}

function showError(elementId, message) {
    const errorEl = document.getElementById(elementId);
    if (errorEl) {
        errorEl.textContent = message;
        errorEl.classList.add('show');
        const inputId = elementId.replace('-error', '');
        const input = document.getElementById(inputId);
        if (input) input.classList.add('error');
    }
}

function hideError(elementId) {
    const errorEl = document.getElementById(elementId);
    if (errorEl) {
        errorEl.classList.remove('show');
        const inputId = elementId.replace('-error', '');
        const input = document.getElementById(inputId);
        if (input) input.classList.remove('error');
    }
}

function clearRegistrationForm() {
    const fields = ['firstname', 'middlename', 'lastname', 'phone', 'email', 'birthdate', 'password', 'password-confirm', 'nickname'];
    fields.forEach(field => {
        const input = document.getElementById(`reg-${field}`);
        if (input) input.value = '';
    });
    
    const manualRadio = document.querySelector('input[name="password-option"][value="manual"]');
    if (manualRadio) manualRadio.checked = true;
    
    const agreement = document.getElementById('agreement');
    if (agreement) agreement.checked = false;
    
    generationAttempts = 0;
    nicknameValid = false;
    
    const manualGroup = document.getElementById('manual-password-group');
    const autoGroup = document.getElementById('auto-password-group');
    if (manualGroup) manualGroup.style.display = 'block';
    if (autoGroup) autoGroup.style.display = 'none';
    
    const errorMessages = document.querySelectorAll('.error-message');
    errorMessages.forEach(el => el.classList.remove('show'));
    
    const statusDiv = document.getElementById('nickname-status');
    if (statusDiv) {
        statusDiv.textContent = '';
        statusDiv.className = 'nickname-status';
    }
}

async function validateFirstName() {
    const firstName = document.getElementById('reg-firstname')?.value || '';
    if (!validateName(firstName)) {
        showError('reg-firstname-error', 'Имя должно содержать минимум 2 символа');
        return false;
    } else {
        hideError('reg-firstname-error');
        return true;
    }
}

async function validateLastName() {
    const lastName = document.getElementById('reg-lastname')?.value || '';
    if (!validateName(lastName)) {
        showError('reg-lastname-error', 'Фамилия должна содержать минимум 2 символа');
        return false;
    } else {
        hideError('reg-lastname-error');
        return true;
    }
}

async function validatePhoneField() {
    const phone = document.getElementById('reg-phone')?.value || '';
    if (!validatePhone(phone)) {
        showError('reg-phone-error', 'Введите корректный номер телефона РБ (+375XXXXXXXXX)');
        return false;
    } else {
        hideError('reg-phone-error');
        return true;
    }
}

async function validateEmailField() {
    const email = document.getElementById('reg-email')?.value || '';
    if (!validateEmail(email)) {
        showError('reg-email-error', 'Введите корректный email');
        return false;
    } else {
        hideError('reg-email-error');
        return true;
    }
}

async function validateBirthDate() {
    const birthDate = document.getElementById('reg-birthdate')?.value || '';
    if (!birthDate) {
        showError('reg-birthdate-error', 'Укажите дату рождения');
        return false;
    } else if (!validateAge(birthDate)) {
        showError('reg-birthdate-error', 'Вам должно быть не менее 16 лет');
        return false;
    } else {
        hideError('reg-birthdate-error');
        return true;
    }
}

async function validatePasswordFields() {
    const passwordOption = document.querySelector('input[name="password-option"]:checked')?.value || 'manual';
    
    if (passwordOption === 'manual') {
        const password = document.getElementById('reg-password')?.value || '';
        const passwordConfirm = document.getElementById('reg-password-confirm')?.value || '';
        
        if (!validatePassword(password)) {
            showError('reg-password-error', 'Пароль должен содержать 8-20 символов, заглавную и строчную буквы, цифру и спецсимвол');
            return false;
        } else {
            hideError('reg-password-error');
        }
        
        if (password !== passwordConfirm) {
            showError('reg-password-confirm-error', 'Пароли не совпадают');
            return false;
        } else {
            hideError('reg-password-confirm-error');
        }
        return true;
    } else {
        const autoPassword = document.getElementById('auto-password')?.value || '';
        if (!autoPassword) {
            showError('auto-password-error', 'Сгенерируйте пароль');
            return false;
        } else {
            hideError('auto-password-error');
            return true;
        }
    }
}

async function validateNicknameField() {
    const nickname = document.getElementById('reg-nickname')?.value || '';
    const statusDiv = document.getElementById('nickname-status');
    
    if (!nickname) {
        showError('reg-nickname-error', 'Введите никнейм');
        if (statusDiv) {
            statusDiv.textContent = '❌ Введите никнейм';
            statusDiv.className = 'nickname-status error';
        }
        nicknameValid = false;
        return false;
    }
    
    const isUnique = await isNicknameUnique(nickname);
    if (!isUnique) {
        showError('reg-nickname-error', 'Такой никнейм уже существует');
        if (statusDiv) {
            statusDiv.textContent = '❌ Такой никнейм уже существует';
            statusDiv.className = 'nickname-status error';
        }
        nicknameValid = false;
        return false;
    } else {
        hideError('reg-nickname-error');
        if (statusDiv) {
            statusDiv.textContent = '✅ Никнейм доступен';
            statusDiv.className = 'nickname-status success';
        }
        nicknameValid = true;
        return true;
    }
}

async function validateRegistrationForm() {
    const isFirstNameValid = await validateFirstName();
    const isLastNameValid = await validateLastName();
    const isPhoneValid = await validatePhoneField();
    const isEmailValid = await validateEmailField();
    const isBirthDateValid = await validateBirthDate();
    const isPasswordValid = await validatePasswordFields();
    const isNicknameValid = await validateNicknameField();
    const isAgreementChecked = document.getElementById('agreement')?.checked || false;
    
    const isValid = isFirstNameValid && isLastNameValid && isPhoneValid && 
                    isEmailValid && isBirthDateValid && isPasswordValid && 
                    isNicknameValid && isAgreementChecked;
    
    const submitBtn = document.getElementById('register-submit');
    if (submitBtn) {
        submitBtn.disabled = !isValid;
    }
    
    return isValid;
}

async function updateRegisterButton() {
    const isValid = await validateRegistrationForm();
    const btn = document.getElementById('register-submit');
    if (btn) {
        btn.disabled = !isValid;
    }
}

document.addEventListener('DOMContentLoaded', () => {

    document.querySelectorAll('.auth-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
            tab.classList.add('active');
            const formId = `${tab.dataset.tab}-form`;
            document.getElementById(formId).classList.add('active');
        });
    });
    
    document.querySelectorAll('input[name="password-option"]').forEach(radio => {
        radio.addEventListener('change', async (e) => {
            const manualGroup = document.getElementById('manual-password-group');
            const autoGroup = document.getElementById('auto-password-group');
            
            if (e.target.value === 'manual') {
                if (manualGroup) manualGroup.style.display = 'block';
                if (autoGroup) autoGroup.style.display = 'none';
            } else {
                if (manualGroup) manualGroup.style.display = 'none';
                if (autoGroup) autoGroup.style.display = 'block';
                const autoPassword = generateRandomPassword();
                const autoPasswordInput = document.getElementById('auto-password');
                if (autoPasswordInput) autoPasswordInput.value = autoPassword;
            }
            await updateRegisterButton();
        });
    });
    
    const generateBtn = document.getElementById('generate-nickname');
    if (generateBtn) {
        generateBtn.addEventListener('click', async () => {
            const firstName = document.getElementById('reg-firstname')?.value || '';
            const lastName = document.getElementById('reg-lastname')?.value || '';
            
            if (!firstName || !lastName) {
                alert('Сначала введите имя и фамилию');
                return;
            }
            
            if (generationAttempts >= 5) {
                const statusDiv = document.getElementById('nickname-status');
                if (statusDiv) {
                    statusDiv.textContent = 'Вы исчерпали попытки автогенерации. Введите никнейм вручную.';
                    statusDiv.className = 'nickname-status error';
                }
                const nicknameInput = document.getElementById('reg-nickname');
                if (nicknameInput) nicknameInput.disabled = false;
                return;
            }
            
            let nickname;
            let isUnique = false;
            let attempts = 0;
            
            while (!isUnique && attempts < 10) {
                nickname = generateNickname(firstName, lastName);
                isUnique = await isNicknameUnique(nickname);
                attempts++;
            }
            
            const nicknameInput = document.getElementById('reg-nickname');
            const statusDiv = document.getElementById('nickname-status');
            
            if (nicknameInput && isUnique) {
                nicknameInput.value = nickname;
                if (statusDiv) {
                    statusDiv.textContent = '✅ Никнейм доступен';
                    statusDiv.className = 'nickname-status success';
                }
                hideError('reg-nickname-error');
                nicknameValid = true;
            } else if (statusDiv) {
                statusDiv.textContent = 'Не удалось сгенерировать уникальный никнейм. Попробуйте еще раз или введите вручную.';
                statusDiv.className = 'nickname-status error';
            }
            
            await updateRegisterButton();
        });
    }
    
    const inputFields = [
        'reg-firstname', 'reg-lastname', 'reg-phone', 'reg-email', 
        'reg-birthdate', 'reg-password', 'reg-password-confirm', 'reg-nickname'
    ];
    
    inputFields.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', async () => {
                await updateRegisterButton();
            });
            input.addEventListener('blur', async () => {
                if (id === 'reg-firstname') await validateFirstName();
                if (id === 'reg-lastname') await validateLastName();
                if (id === 'reg-phone') await validatePhoneField();
                if (id === 'reg-email') await validateEmailField();
                if (id === 'reg-birthdate') await validateBirthDate();
                if (id === 'reg-password' || id === 'reg-password-confirm') await validatePasswordFields();
                if (id === 'reg-nickname') await validateNicknameField();
                await updateRegisterButton();
            });
        }
    });
    
    const agreementCheckbox = document.getElementById('agreement');
    if (agreementCheckbox) {
        agreementCheckbox.addEventListener('change', async () => {
            await updateRegisterButton();
        });
    }
    
    const registerSubmit = document.getElementById('register-submit');
    if (registerSubmit) {
        registerSubmit.addEventListener('click', async () => {
            const isValid = await validateRegistrationForm();
            if (!isValid) {
                alert('Пожалуйста, заполните все поля корректно');
                return;
            }
            
            const passwordOption = document.querySelector('input[name="password-option"]:checked')?.value || 'manual';
            let password = '';
            
            if (passwordOption === 'manual') {
                password = document.getElementById('reg-password')?.value || '';
            } else {
                password = document.getElementById('auto-password')?.value || '';
            }
            
            const userData = {
                phone: document.getElementById('reg-phone')?.value || '',
                email: document.getElementById('reg-email')?.value || '',
                birthDate: document.getElementById('reg-birthdate')?.value || '',
                password: password,
                firstName: document.getElementById('reg-firstname')?.value || '',
                lastName: document.getElementById('reg-lastname')?.value || '',
                middleName: document.getElementById('reg-middlename')?.value || '',
                nickname: document.getElementById('reg-nickname')?.value || '',
                role: 'user'
            };
            
            try {
                const result = await registerUser(userData);
                alert('✅ Регистрация успешна! Теперь вы можете войти.');

                clearRegistrationForm();

                const loginTab = document.querySelector('.auth-tab[data-tab="login"]');
                if (loginTab) loginTab.click();
                await updateRegisterButton();
            } catch (error) {
                alert('❌ Ошибка регистрации: ' + error.message);
            }
        });
    }
    
    const loginSubmit = document.getElementById('login-submit');
    if (loginSubmit) {
        loginSubmit.addEventListener('click', async () => {
            const email = document.getElementById('login-email')?.value || '';
            const password = document.getElementById('login-password')?.value || '';
            
            if (!email || !password) {
                alert('Заполните все поля');
                return;
            }
            
            try {
                const user = await loginUser(email, password);
                alert(`Добро пожаловать, ${user.firstName}!`);
                window.location.href = 'index.html';
            } catch (error) {
                alert('Ошибка входа: ' + error.message);
            }
        });
    }
    
    const autoPasswordInput = document.getElementById('auto-password');
    if (autoPasswordInput && autoPasswordInput.value) {
    }
    
    setTimeout(async () => {
        await updateRegisterButton();
    }, 100);
});