import { useEffect, useState, type FormEvent } from 'react';
import type { ChangePasswordRequest, TaxIdType, UserResponse } from '../../types/auth';
import useAuth from '../../hooks/useAuth';

interface ProfileFormValues {
  userName: string;
  userPhone: string;
  taxIdType: TaxIdType | '';
  taxIdNumber: string;
}

interface PasswordFormValues extends ChangePasswordRequest {
  confirmNewPassword: string;
}

type AlertState = { kind: 'success' | 'danger'; message: string } | null;

const taxIdTypes: TaxIdType[] = ['DNI', 'CUIL', 'CUIT', 'PASAPORTE'];

const getProfileFormValues = (user: UserResponse): ProfileFormValues => ({
  userName: user.userName,
  userPhone: user.userPhone ?? '',
  taxIdType: user.taxIdType ?? '',
  taxIdNumber: user.taxIdNumber ?? '',
});

const formatExpirationDate = (value: string): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'No disponible';
  return new Intl.DateTimeFormat('es-AR', { dateStyle: 'medium' }).format(date);
};

const MyAccount = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const [profileForm, setProfileForm] = useState<ProfileFormValues>(() => (
    user ? getProfileFormValues(user) : { userName: '', userPhone: '', taxIdType: '', taxIdNumber: '' }
  ));
  const [profileAlert, setProfileAlert] = useState<AlertState>(null);
  const [profileSaving, setProfileSaving] = useState(false);
  const [passwordForm, setPasswordForm] = useState<PasswordFormValues>({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [passwordAlert, setPasswordAlert] = useState<AlertState>(null);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  useEffect(() => {
    if (user) setProfileForm(getProfileFormValues(user));
  }, [user]);

  if (!user) return null;

  const savedForm = getProfileFormValues(user);
  const hasProfileChanges = Object.keys(savedForm).some((key) => (
    profileForm[key as keyof ProfileFormValues] !== savedForm[key as keyof ProfileFormValues]
  ));

  const updateProfileField = <K extends keyof ProfileFormValues>(key: K, value: ProfileFormValues[K]) => {
    setProfileForm((current) => ({ ...current, [key]: value }));
    setProfileAlert(null);
  };

  const handleProfileSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = profileForm.userName.trim();
    const phone = profileForm.userPhone.trim();
    const taxIdNumber = profileForm.taxIdNumber.trim();

    if (!name) {
      setProfileAlert({ kind: 'danger', message: 'El nombre completo es obligatorio.' });
      return;
    }
    if (phone && !/^\d{10}$/.test(phone)) {
      setProfileAlert({ kind: 'danger', message: 'El teléfono debe contener exactamente 10 dígitos.' });
      return;
    }
    if (Boolean(profileForm.taxIdType) !== Boolean(taxIdNumber)) {
      setProfileAlert({
        kind: 'danger',
        message: 'Completá tanto el tipo como el número de documento, o dejá ambos vacíos.',
      });
      return;
    }

    setProfileSaving(true);
    setProfileAlert(null);
    const result = await updateProfile({
      userName: name,
      userPhone: phone || null,
      taxIdType: profileForm.taxIdType || null,
      taxIdNumber: taxIdNumber || null,
    });
    setProfileSaving(false);

    if (result.error) {
      setProfileAlert({ kind: 'danger', message: result.error.message });
      return;
    }
    if (result.data) {
      setProfileForm(getProfileFormValues(result.data));
      setProfileAlert({ kind: 'success', message: 'Tus datos se actualizaron correctamente.' });
    }
  };

  const updatePasswordField = (key: keyof PasswordFormValues, value: string) => {
    setPasswordForm((current) => ({ ...current, [key]: value }));
    setPasswordAlert(null);
  };

  const handlePasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (passwordForm.newPassword.length < 8) {
      setPasswordAlert({ kind: 'danger', message: 'La nueva contraseña debe tener al menos 8 caracteres.' });
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      setPasswordAlert({ kind: 'danger', message: 'La confirmación no coincide con la nueva contraseña.' });
      return;
    }

    setPasswordSaving(true);
    setPasswordAlert(null);
    const payload: ChangePasswordRequest = {
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
    };
    const result = await changePassword(payload);
    setPasswordSaving(false);

    if (result.error) {
      setPasswordAlert({ kind: 'danger', message: result.error.message });
      return;
    }

    setPasswordForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    setPasswordAlert({ kind: 'success', message: 'Tu contraseña se actualizó correctamente.' });
  };

  const renderAlert = (alert: AlertState) => alert && (
    <div className={`alert alert-${alert.kind}`} role={alert.kind === 'danger' ? 'alert' : 'status'}>
      {alert.message}
    </div>
  );

  const passwordFields: {
    key: keyof PasswordFormValues;
    label: string;
    visibilityKey: keyof typeof visiblePasswords;
    minLength?: number;
  }[] = [
    { key: 'currentPassword', label: 'Contraseña actual', visibilityKey: 'current' },
    { key: 'newPassword', label: 'Nueva contraseña', visibilityKey: 'new', minLength: 8 },
    { key: 'confirmNewPassword', label: 'Confirmar nueva contraseña', visibilityKey: 'confirm', minLength: 8 },
  ];

  return (
    <div className="row g-4">
      <div className="col-12">
        <section className="card shadow-sm">
          <div className="card-body p-4">
            <h2 className="h4 card-title mb-4">Datos personales y fiscales</h2>
            <dl className="row mb-4">
              <dt className="col-sm-4">Email</dt>
              <dd className="col-sm-8">{user.userEmail}</dd>
              <dt className="col-sm-4">Tipo de cuenta</dt>
              <dd className="col-sm-8">{user.userRole}</dd>
              {user.companyName && (
                <>
                  <dt className="col-sm-4">Razón Social</dt>
                  <dd className="col-sm-8">{user.companyName}</dd>
                </>
              )}
              <dt className="col-sm-4">Vencimiento de contraseña</dt>
              <dd className="col-sm-8">{formatExpirationDate(user.passwordExpiresAt)}</dd>
            </dl>

            {renderAlert(profileAlert)}
            <form onSubmit={handleProfileSubmit} noValidate>
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <label className="form-label" htmlFor="account-name">Nombre completo</label>
                  <input
                    id="account-name"
                    className="form-control"
                    type="text"
                    value={profileForm.userName}
                    onChange={(event) => updateProfileField('userName', event.target.value)}
                    required
                    maxLength={255}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label" htmlFor="account-phone">Teléfono</label>
                  <input
                    id="account-phone"
                    className="form-control"
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]{10}"
                    maxLength={10}
                    value={profileForm.userPhone}
                    onChange={(event) => updateProfileField('userPhone', event.target.value)}
                    aria-describedby="account-phone-help"
                  />
                  <div id="account-phone-help" className="form-text">Opcional; ingresá 10 dígitos.</div>
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label" htmlFor="account-tax-id-type">Tipo de documento</label>
                  <select
                    id="account-tax-id-type"
                    className="form-select"
                    value={profileForm.taxIdType}
                    onChange={(event) => updateProfileField('taxIdType', event.target.value as TaxIdType | '')}
                  >
                    <option value="">Sin especificar</option>
                    {taxIdTypes.map((taxIdType) => (
                      <option key={taxIdType} value={taxIdType}>{taxIdType}</option>
                    ))}
                  </select>
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label" htmlFor="account-tax-id-number">Número de documento</label>
                  <input
                    id="account-tax-id-number"
                    className="form-control"
                    type="text"
                    value={profileForm.taxIdNumber}
                    onChange={(event) => updateProfileField('taxIdNumber', event.target.value)}
                  />
                </div>
              </div>
              <button
                className="btn btn-primary mt-4"
                type="submit"
                disabled={!hasProfileChanges || profileSaving}
              >
                {profileSaving ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </form>
          </div>
        </section>
      </div>

      <div className="col-12">
        <section className="card shadow-sm">
          <div className="card-body p-4">
            <h2 className="h4 card-title mb-4">Seguridad y contraseña</h2>
            {renderAlert(passwordAlert)}
            <form onSubmit={handlePasswordSubmit}>
              <div className="row g-3">
                {passwordFields.map(({ key, label, visibilityKey, minLength }) => (
                  <div className="col-12 col-md-4" key={key}>
                    <label className="form-label" htmlFor={`account-${key}`}>{label}</label>
                    <div className="input-group">
                      <input
                        id={`account-${key}`}
                        className="form-control"
                        type={visiblePasswords[visibilityKey] ? 'text' : 'password'}
                        value={passwordForm[key]}
                        onChange={(event) => updatePasswordField(key, event.target.value)}
                        required
                        minLength={minLength}
                        autoComplete={key === 'currentPassword' ? 'current-password' : 'new-password'}
                      />
                      <button
                        className="btn btn-outline-secondary"
                        type="button"
                        onClick={() => setVisiblePasswords((current) => ({
                          ...current,
                          [visibilityKey]: !current[visibilityKey],
                        }))}
                        aria-label={visiblePasswords[visibilityKey] ? `Ocultar ${label.toLowerCase()}` : `Mostrar ${label.toLowerCase()}`}
                      >
                        <i className={`bi ${visiblePasswords[visibilityKey] ? 'bi-eye-slash' : 'bi-eye'}`} aria-hidden="true" />
                      </button>
                    </div>
                    {minLength && <div className="form-text">Mínimo {minLength} caracteres.</div>}
                  </div>
                ))}
              </div>
              <button className="btn btn-primary mt-4" type="submit" disabled={passwordSaving}>
                {passwordSaving ? 'Actualizando...' : 'Actualizar contraseña'}
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
};

export default MyAccount;
