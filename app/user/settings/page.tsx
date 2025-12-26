"use client";

import {
  useState,
  useEffect,
  FormEvent,
  ChangeEvent,
} from "react";
import Swal from "sweetalert2";
import { useLang } from "../../providers";

type ProfileFormState = {
  fullName: string;
  email: string;
  phone: string;
};

type PasswordFormState = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export default function UserSettingsPage() {
  const { lang } = useLang();

  const [currentUser, setCurrentUser] = useState<string | null>(null);

  const labels = {
    ar: {
      settingsTitle: "إعدادات الحساب",
      settingsSub: "قم بتعديل بياناتك الشخصية وكلمة المرور.",
      profileSectionTitle: "البيانات الشخصية",
      profileSectionSub: "اسم، بريد إلكتروني، رقم هاتف.",
      fullName: "الاسم الكامل",
      email: "البريد الإلكتروني",
      phone: "رقم الهاتف",
      saveProfile: "حفظ البيانات",
      profileSaved:
        "تم حفظ بياناتك بنجاح (تجريبيًا). اربطها بـ API الحساب في مشروعك.",
      passwordSectionTitle: "تغيير كلمة المرور",
      passwordSectionSub: "قم بتحديث كلمة المرور الخاصة بحسابك.",
      currentPassword: "كلمة المرور الحالية",
      newPassword: "كلمة المرور الجديدة",
      confirmPassword: "تأكيد كلمة المرور الجديدة",
      savePassword: "تحديث كلمة المرور",
      passwordSaved:
        "تم تحديث كلمة المرور (تجريبيًا). اربطها بـ API تغيير كلمة المرور في مشروعك.",
      passwordMismatch: "كلمة المرور الجديدة وتأكيدها غير متطابقين.",
      required: "من فضلك املأ الحقول المطلوبة.",
    },
    en: {
      settingsTitle: "Account settings",
      settingsSub: "Update your personal information and password.",
      profileSectionTitle: "Profile information",
      profileSectionSub: "Name, email and phone number.",
      fullName: "Full name",
      email: "Email",
      phone: "Phone number",
      saveProfile: "Save profile",
      profileSaved:
        "Profile saved (demo only). Connect this to your real account API.",
      passwordSectionTitle: "Change password",
      passwordSectionSub: "Update the password of your account.",
      currentPassword: "Current password",
      newPassword: "New password",
      confirmPassword: "Confirm new password",
      savePassword: "Update password",
      passwordSaved:
        "Password updated (demo only). Connect this to your real password API.",
      passwordMismatch: "New password and confirmation do not match.",
      required: "Please fill all required fields.",
    },
  }[lang];

  const [profileForm, setProfileForm] = useState<ProfileFormState>({
    fullName: "",
    email: "",
    phone: "",
  });

  const [passwordForm, setPasswordForm] = useState<PasswordFormState>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  // قراءة اسم اليوزر من localStorage بعد اللوجين
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("username");
    setCurrentUser(stored || "user1");

    // ممكن تستخدم هنا بيانات حقيقية من API لجلب البروفايل
    setProfileForm({
      fullName: stored || "user1",
      email: "",
      phone: "",
    });
  }, []);

  const handleProfileChange = (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (
      profileForm.fullName.trim() === "" ||
      profileForm.email.trim() === "" ||
      profileForm.phone.trim() === ""
    ) {
      Swal.fire({ icon: "warning", title: labels.required });
      return;
    }

    setSavingProfile(true);

    try {
      // هنا اربط الـ API الحقيقي بتاعك (PUT /api/user/profile مثلاً)
      // await fetch("/api/user/profile", { ... })

      Swal.fire({
        icon: "success",
        title: labels.profileSaved,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (
      passwordForm.currentPassword.trim() === "" ||
      passwordForm.newPassword.trim() === "" ||
      passwordForm.confirmPassword.trim() === ""
    ) {
      Swal.fire({ icon: "warning", title: labels.required });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      Swal.fire({
        icon: "warning",
        title: labels.passwordMismatch,
      });
      return;
    }

    setSavingPassword(true);

    try {
      // هنا اربط الـ API الحقيقي بتاع تغيير الباسورد
      // await fetch("/api/user/change-password", { ... })

      Swal.fire({
        icon: "success",
        title: labels.passwordSaved,
      });

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      console.error(err);
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <section className="panel user-form-panel">
      <div className="panel-header">
        <div>
          <div className="panel-title">
            {labels.settingsTitle}
          </div>
          <div className="panel-subtitle">
            {labels.settingsSub}
          </div>
          {currentUser && (
            <div
              style={{
                marginTop: "0.3rem",
                fontSize: "0.8rem",
                opacity: 0.7,
              }}
            >
              {lang === "ar" ? "المستخدم:" : "User:"}{" "}
              <strong>{currentUser}</strong>
            </div>
          )}
        </div>
      </div>

      {/* Profile form */}
      <form
        onSubmit={handleProfileSubmit}
        style={{ marginBottom: "1.25rem" }}
      >
        <div className="user-form-section">
          <div className="user-section-title">
            {labels.profileSectionTitle}
          </div>
          <div className="user-section-subtitle">
            {labels.profileSectionSub}
          </div>

          <div className="user-fields-grid">
            <div className="filter-group filter-group-full">
              <label className="filter-label">
                {labels.fullName}
              </label>
              <input
                className="filter-input"
                name="fullName"
                value={profileForm.fullName}
                onChange={handleProfileChange}
              />
            </div>

            <div className="filter-group">
              <label className="filter-label">
                {labels.email}
              </label>
              <input
                type="email"
                className="filter-input"
                name="email"
                value={profileForm.email}
                onChange={handleProfileChange}
              />
            </div>

            <div className="filter-group">
              <label className="filter-label">
                {labels.phone}
              </label>
              <input
                className="filter-input"
                name="phone"
                value={profileForm.phone}
                onChange={handleProfileChange}
              />
            </div>
          </div>

          <div className="user-form-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={savingProfile}
            >
              {savingProfile ? "..." : labels.saveProfile}
            </button>
          </div>
        </div>
      </form>

      {/* Password form */}
      <form onSubmit={handlePasswordSubmit}>
        <div className="user-form-section">
          <div className="user-section-title">
            {labels.passwordSectionTitle}
          </div>
          <div className="user-section-subtitle">
            {labels.passwordSectionSub}
          </div>

          <div className="user-fields-grid">
            <div className="filter-group filter-group-full">
              <label className="filter-label">
                {labels.currentPassword}
              </label>
              <input
                type="password"
                className="filter-input"
                name="currentPassword"
                value={passwordForm.currentPassword}
                onChange={handlePasswordChange}
              />
            </div>

            <div className="filter-group">
              <label className="filter-label">
                {labels.newPassword}
              </label>
              <input
                type="password"
                className="filter-input"
                name="newPassword"
                value={passwordForm.newPassword}
                onChange={handlePasswordChange}
              />
            </div>

            <div className="filter-group">
              <label className="filter-label">
                {labels.confirmPassword}
              </label>
              <input
                type="password"
                className="filter-input"
                name="confirmPassword"
                value={passwordForm.confirmPassword}
                onChange={handlePasswordChange}
              />
            </div>
          </div>

          <div className="user-form-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={savingPassword}
            >
              {savingPassword ? "..." : labels.savePassword}
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}
