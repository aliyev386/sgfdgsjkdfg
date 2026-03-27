import { useState, useEffect, useCallback } from "react";
import {
  dashboardApi,
  productApi,
  categoryApi,
  collectionApi,
  collectionCategoryApi,
  orderApi,
  heroApi,
  campaignApi,
  discountCodeApi,
} from "../../api/adminApi";

// ─── i18n ────────────────────────────────────────────────────────────────────
const translations = {
  az: {
    dashboard: "İdarə Paneli", products: "Məhsullar", categories: "Kateqoriyalar",
    collections: "Kolleksiyalar", collectionCategories: "Kolleksiya Kateqoriyaları",
    orders: "Sifarişlər", heroSections: "Hero Bölmələri", campaigns: "Kampaniyalar",
    discountCodes: "Endirim Kodları", totalOrders: "Ümumi Sifarişlər",
    todayOrders: "Bu günün Sifarişləri", totalRevenue: "Ümumi Gəlir",
    topProducts: "Ən Yaxşı Məhsullar", search: "Axtar...", addNew: "Yeni Əlavə Et",
    edit: "Düzəlt", delete: "Sil", save: "Saxla", cancel: "İmtina",
    name: "Ad", price: "Qiymət", stock: "Stok", category: "Kateqoriya",
    actions: "Əməliyyatlar", status: "Status", date: "Tarix", user: "İstifadəçi",
    description: "Təsvir", image: "Şəkil", title: "Başlıq", subtitle: "Alt Başlıq",
    active: "Aktiv", inactive: "Qeyri-aktiv", activate: "Aktivləşdir",
    deactivate: "Deaktivləşdir", pending: "Gözləyir", confirmed: "Təsdiqləndi",
    shipped: "Göndərildi", delivered: "Çatdırıldı", code: "Kod",
    type: "Növ", value: "Dəyər", usageCount: "İstifadə Sayı", discount: "Endirim",
    dateRange: "Tarix Aralığı", limit: "Limit", percent: "Faiz", fixed: "Sabit",
    selectProducts: "Məhsul Seçin", colors: "Rənglər", images: "Şəkillər",
    loading: "Yüklənir...", error: "Xəta baş verdi", noData: "Məlumat yoxdur",
    logout: "Çıxış", settings: "Parametrlər", support: "Dəstək",
    adminPanel: "Admin Panel", welcomeAdmin: "Xoş Gəldiniz", totalProducts: "Ümumi Məhsullar",
    outOfStock: "Stokda Yoxdur", revenue: "Gəlir", customers: "Müştərilər",
    addProduct: "Məhsul Əlavə Et", editProduct: "Məhsulu Düzəlt",
    addCategory: "Kateqoriya Əlavə Et", addCollection: "Kolleksiya Əlavə Et",
    previous: "Əvvəlki", next: "Növbəti", page: "Səhifə", of: "/",
    showing: "Göstərilir", to: "-", entries: "qeyd",
    orderDetail: "Sifariş Təfərrüatı", address: "Ünvan",
    updateStatus: "Statusu Yenilə", saving: "Saxlanılır...",
    deleting: "Silinir...", successSaved: "Uğurla saxlanıldı!", successDeleted: "Uğurla silindi!",
    confirmDelete: "Silmək istədiyinizə əminsiniz?", required: "Mütləq doldurulmalıdır",
    invalidPrice: "Qiymət 0-dan böyük olmalıdır", invalidStock: "Stok 0 və ya daha çox olmalıdır",
    invalidDiscount: "Endirim 1-100 arası olmalıdır", dateError: "Başlanğıc tarixi son tarixdən əvvəl olmalıdır",
    uploadImage: "Şəkil yükləyin", clickToUpload: "Şəkil əlavə etmək üçün basın",
  },
  en: {
    dashboard: "Dashboard", products: "Products", categories: "Categories",
    collections: "Collections", collectionCategories: "Collection Categories",
    orders: "Orders", heroSections: "Hero Sections", campaigns: "Campaigns",
    discountCodes: "Discount Codes", totalOrders: "Total Orders",
    todayOrders: "Today's Orders", totalRevenue: "Total Revenue",
    topProducts: "Top Products", search: "Search...", addNew: "Add New",
    edit: "Edit", delete: "Delete", save: "Save", cancel: "Cancel",
    name: "Name", price: "Price", stock: "Stock", category: "Category",
    actions: "Actions", status: "Status", date: "Date", user: "User",
    description: "Description", image: "Image", title: "Title", subtitle: "Subtitle",
    active: "Active", inactive: "Inactive", activate: "Activate",
    deactivate: "Deactivate", pending: "Pending", confirmed: "Confirmed",
    shipped: "Shipped", delivered: "Delivered", code: "Code",
    type: "Type", value: "Value", usageCount: "Usage Count", discount: "Discount",
    dateRange: "Date Range", limit: "Limit", percent: "Percent", fixed: "Fixed",
    selectProducts: "Select Products", colors: "Colors", images: "Images",
    loading: "Loading...", error: "An error occurred", noData: "No data available",
    logout: "Logout", settings: "Settings", support: "Support",
    adminPanel: "Admin Panel", welcomeAdmin: "Welcome Back", totalProducts: "Total Products",
    outOfStock: "Out of Stock", revenue: "Revenue", customers: "Customers",
    addProduct: "Add Product", editProduct: "Edit Product",
    addCategory: "Add Category", addCollection: "Add Collection",
    previous: "Previous", next: "Next", page: "Page", of: "of",
    showing: "Showing", to: "to", entries: "entries",
    orderDetail: "Order Detail", address: "Address",
    updateStatus: "Update Status", saving: "Saving...",
    deleting: "Deleting...", successSaved: "Saved successfully!", successDeleted: "Deleted successfully!",
    confirmDelete: "Are you sure you want to delete?", required: "This field is required",
    invalidPrice: "Price must be greater than 0", invalidStock: "Stock must be 0 or more",
    invalidDiscount: "Discount must be between 1 and 100", dateError: "Start date must be before end date",
    uploadImage: "Upload Image", clickToUpload: "Click to upload image",
  },
  ru: {
    dashboard: "Панель управления", products: "Товары", categories: "Категории",
    collections: "Коллекции", collectionCategories: "Категории коллекций",
    orders: "Заказы", heroSections: "Главные баннеры", campaigns: "Кампании",
    discountCodes: "Промокоды", totalOrders: "Всего заказов",
    todayOrders: "Заказы сегодня", totalRevenue: "Общий доход",
    topProducts: "Топ товаров", search: "Поиск...", addNew: "Добавить",
    edit: "Редактировать", delete: "Удалить", save: "Сохранить", cancel: "Отмена",
    name: "Название", price: "Цена", stock: "Остаток", category: "Категория",
    actions: "Действия", status: "Статус", date: "Дата", user: "Пользователь",
    description: "Описание", image: "Изображение", title: "Заголовок", subtitle: "Подзаголовок",
    active: "Активен", inactive: "Неактивен", activate: "Активировать",
    deactivate: "Деактивировать", pending: "Ожидает", confirmed: "Подтверждён",
    shipped: "Отправлен", delivered: "Доставлен", code: "Код",
    type: "Тип", value: "Значение", usageCount: "Использований", discount: "Скидка",
    dateRange: "Диапазон дат", limit: "Лимит", percent: "Процент", fixed: "Фиксированная",
    selectProducts: "Выбрать товары", colors: "Цвета", images: "Изображения",
    loading: "Загрузка...", error: "Произошла ошибка", noData: "Нет данных",
    logout: "Выход", settings: "Настройки", support: "Поддержка",
    adminPanel: "Панель Админа", welcomeAdmin: "Добро пожаловать", totalProducts: "Всего товаров",
    outOfStock: "Нет в наличии", revenue: "Выручка", customers: "Клиенты",
    addProduct: "Добавить товар", editProduct: "Редактировать товар",
    addCategory: "Добавить категорию", addCollection: "Добавить коллекцию",
    previous: "Назад", next: "Вперёд", page: "Стр.", of: "из",
    showing: "Показано", to: "—", entries: "записей",
    orderDetail: "Детали заказа", address: "Адрес",
    updateStatus: "Обновить статус", saving: "Сохранение...",
    deleting: "Удаление...", successSaved: "Успешно сохранено!", successDeleted: "Успешно удалено!",
    confirmDelete: "Вы уверены, что хотите удалить?", required: "Обязательное поле",
    invalidPrice: "Цена должна быть больше 0", invalidStock: "Остаток должен быть 0 или больше",
    invalidDiscount: "Скидка должна быть от 1 до 100", dateError: "Дата начала должна быть раньше даты окончания",
    uploadImage: "Загрузить фото", clickToUpload: "Нажмите для загрузки",
  },
};

// ─── Icons ────────────────────────────────────────────────────────────────────
const Icon = ({ path, size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d={path} />
  </svg>
);
const Icons = {
  Dashboard: () => <Icon path="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10" />,
  Package: () => <Icon path="M16.5 9.4l-9-5.19M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" />,
  Tag: () => <Icon path="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z M7 7h.01" />,
  Grid: () => <Icon path="M3 3h7v7H3z M14 3h7v7h-7z M14 14h7v7h-7z M3 14h7v7H3z" />,
  ShoppingBag: () => <Icon path="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z M3 6h18 M16 10a4 4 0 0 1-8 0" />,
  Image: () => <Icon path="M21 19H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h3l2-3h8l2 3h3a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2z M12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />,
  Percent: () => <Icon path="M19 5L5 19 M6.5 6a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z M17.5 19a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z" />,
  Ticket: () => <Icon path="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 0 0-2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3a2 2 0 0 0 0-4V7a2 2 0 0 0-2-2H5z" />,
  Search: () => <Icon path="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />,
  Bell: () => <Icon path="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0" />,
  ChevronDown: () => <Icon path="M6 9l6 6 6-6" />,
  ChevronRight: () => <Icon path="M9 18l6-6-6-6" />,
  ChevronLeft: () => <Icon path="M15 18l-6-6 6-6" />,
  Plus: () => <Icon path="M12 5v14M5 12h14" />,
  Edit: () => <Icon path="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7 M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />,
  Trash: () => <Icon path="M3 6h18 M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />,
  Eye: () => <Icon path="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />,
  X: () => <Icon path="M18 6L6 18M6 6l12 12" />,
  Check: () => <Icon path="M20 6L9 17l-5-5" />,
  TrendingUp: () => <Icon path="M23 6l-9.5 9.5-5-5L1 18 M17 6h6v6" />,
  Users: () => <Icon path="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75 M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />,
  DollarSign: () => <Icon path="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />,
  ShoppingCart: () => <Icon path="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z M3 6h18 M16 10a4 4 0 0 1-8 0" />,
  LogOut: () => <Icon path="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9" />,
  Layers: () => <Icon path="M12 2l9 4.5L12 11 3 6.5z M3 12l9 4.5L21 12 M3 17l9 4.5L21 17" />,
  Filter: () => <Icon path="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />,
  Upload: () => <Icon path="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M17 8l-5-5-5 5 M12 3v12" />,
  AlertCircle: () => <Icon path="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M12 8v4 M12 16h.01" />,
  RefreshCw: () => <Icon path="M23 4v6h-6 M1 20v-6h6 M3.51 9a9 9 0 0 1 14.85-3.36L23 10 M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />,
};

// ─── Toast Notification ───────────────────────────────────────────────────────
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium transition-all
      ${type === "success" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"}`}>
      {type === "success" ? <Icons.Check /> : <Icons.AlertCircle />}
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100"><Icons.X /></button>
    </div>
  );
};

// ─── UI Components ────────────────────────────────────────────────────────────
const Badge = ({ status, label }) => {
  const colors = {
    delivered: "bg-emerald-100 text-emerald-700",
    shipped: "bg-blue-100 text-blue-700",
    confirmed: "bg-amber-100 text-amber-700",
    pending: "bg-gray-100 text-gray-600",
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${colors[status] || "bg-gray-100 text-gray-600"}`}>
      {label || status}
    </span>
  );
};

const Btn = ({ children, onClick, variant = "primary", size = "md", className = "", disabled = false, type = "button" }) => {
  const variants = {
    primary: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm",
    secondary: "bg-gray-100 hover:bg-gray-200 text-gray-700",
    danger: "bg-red-50 hover:bg-red-100 text-red-600",
    success: "bg-blue-50 hover:bg-blue-100 text-blue-700",
    ghost: "hover:bg-gray-100 text-gray-600",
  };
  const sizes = { sm: "px-2.5 py-1.5 text-xs gap-1", md: "px-4 py-2 text-sm gap-2" };
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      className={`inline-flex items-center font-semibold rounded-lg transition-all ${variants[variant]} ${sizes[size]} ${disabled ? "opacity-60 cursor-not-allowed" : ""} ${className}`}>
      {children}
    </button>
  );
};

const Input = ({ label, value, onChange, type = "text", placeholder = "", className = "", required = false, error = "" }) => (
  <div className={className}>
    {label && (
      <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1.5">
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </label>
    )}
    <input
      type={type}
      value={value ?? ""}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full px-3 py-2 text-sm bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all
        ${error ? "border-red-400 bg-red-50" : "border-gray-200"}`}
    />
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);

const Select = ({ label, value, onChange, options, className = "" }) => (
  <div className={className}>
    {label && <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1.5">{label}</label>}
    <select value={value} onChange={e => onChange(e.target.value)}
      className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400">
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
);

const Textarea = ({ label, value, onChange, rows = 3, placeholder = "", className = "" }) => (
  <div className={className}>
    {label && <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1.5">{label}</label>}
    <textarea value={value ?? ""} onChange={e => onChange(e.target.value)} rows={rows} placeholder={placeholder}
      className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none" />
  </div>
);

const Modal = ({ open, onClose, title, children, width = "max-w-2xl" }) => {
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-white rounded-2xl shadow-2xl w-full ${width} max-h-[90vh] flex flex-col`}
        style={{ animation: "modalIn 0.2s ease" }}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-800 text-base">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"><Icons.X /></button>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-5">{children}</div>
      </div>
    </div>
  );
};

const Table = ({ columns, data, onEdit, onDelete, onView, extraActions, loading }) => (
  <div className="overflow-x-auto">
    {loading ? (
      <div className="flex items-center justify-center py-16 text-gray-400">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Yüklənir...</span>
        </div>
      </div>
    ) : data.length === 0 ? (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <Icons.Package />
        <p className="text-sm mt-2">Məlumat yoxdur</p>
      </div>
    ) : (
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            {columns.map(c => (
              <th key={c.key} className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">{c.label}</th>
            ))}
            {(onEdit || onDelete || onView || extraActions) && (
              <th className="text-right px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Actions</th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={row.id || i} className="border-b border-gray-50 hover:bg-gray-50/80 transition-colors">
              {columns.map(c => (
                <td key={c.key} className="px-4 py-3">{c.render ? c.render(row) : row[c.key]}</td>
              ))}
              {(onEdit || onDelete || onView || extraActions) && (
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1.5">
                    {extraActions && extraActions(row)}
                    {onView && <Btn size="sm" variant="ghost" onClick={() => onView(row)}><Icons.Eye /></Btn>}
                    {onEdit && <Btn size="sm" variant="secondary" onClick={() => onEdit(row)}><Icons.Edit /></Btn>}
                    {onDelete && <Btn size="sm" variant="danger" onClick={() => onDelete(row)}><Icons.Trash /></Btn>}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </div>
);

const Pagination = ({ total, page, perPage, onChange }) => {
  const totalPages = Math.ceil(total / perPage);
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 text-sm text-gray-500">
      <span>Showing {Math.min((page - 1) * perPage + 1, total)}–{Math.min(page * perPage, total)} of {total}</span>
      <div className="flex gap-1">
        <Btn size="sm" variant="secondary" onClick={() => onChange(page - 1)} disabled={page === 1}><Icons.ChevronLeft /></Btn>
        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
          const p = totalPages <= 5 ? i + 1 : page <= 3 ? i + 1 : page >= totalPages - 2 ? totalPages - 4 + i : page - 2 + i;
          return (
            <button key={p} onClick={() => onChange(p)}
              className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${p === page ? "bg-emerald-600 text-white" : "hover:bg-gray-100 text-gray-600"}`}>
              {p}
            </button>
          );
        })}
        <Btn size="sm" variant="secondary" onClick={() => onChange(page + 1)} disabled={page === totalPages}><Icons.ChevronRight /></Btn>
      </div>
    </div>
  );
};

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm ${className}`}>{children}</div>
);

const StatCard = ({ icon, label, value, trend, color }) => (
  <Card className="p-5">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{label}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
        {trend !== undefined && (
          <p className={`text-xs font-semibold mt-1 ${trend >= 0 ? "text-emerald-600" : "text-red-500"}`}>
            {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}% bu ay
          </p>
        )}
      </div>
      <div className={`p-3 rounded-xl ${color}`}>{icon}</div>
    </div>
  </Card>
);

const LangTabs = ({ lang, onChange }) => (
  <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit mb-2">
    {["az", "en", "ru"].map(l => (
      <button key={l} type="button" onClick={() => onChange(l)}
        className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${lang === l ? "bg-white shadow text-emerald-700" : "text-gray-500 hover:text-gray-700"}`}>
        {l.toUpperCase()}
      </button>
    ))}
  </div>
);

// Image Upload Component
const ImageUpload = ({ value, onChange, label, uploadFn, t }) => {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!uploadFn) { onChange(URL.createObjectURL(file)); return; }
    setUploading(true);
    try {
      const res = await uploadFn(file);
      onChange(res.url || res);
    } catch {
      // silently ignore
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      {label && <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1.5">{label}</label>}
      <label className="block cursor-pointer">
        <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} disabled={uploading} />
        {value ? (
          <div className="relative w-full h-32 rounded-xl overflow-hidden border-2 border-emerald-300">
            <img src={value} alt="preview" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity text-white text-xs font-semibold">
              {t.clickToUpload}
            </div>
          </div>
        ) : (
          <div className={`border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-emerald-300 transition-colors
            ${uploading ? "opacity-60 cursor-not-allowed" : ""}`}>
            <div className="flex justify-center mb-2 text-gray-400">{uploading ? <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /> : <Icons.Upload />}</div>
            <p className="text-xs text-gray-400">{uploading ? "Yüklənir..." : t.clickToUpload}</p>
          </div>
        )}
      </label>
    </div>
  );
};

// ─── useAdminData hook ────────────────────────────────────────────────────────
const useAdminData = (fetchFn, deps = []) => {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchFn(params);
      // Support both { data, total } and plain arrays
      if (Array.isArray(res)) {
        setData(res);
        setTotal(res.length);
      } else {
        setData(res.data || res.items || res.results || []);
        setTotal(res.total || res.count || 0);
      }
    } catch (err) {
      setError(err?.userMessage || "Xəta baş verdi");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, deps);

  useEffect(() => { load(); }, [load]);

  return { data, setData, total, setTotal, loading, error, reload: load };
};

// ─── Validation helpers ───────────────────────────────────────────────────────
const validateRequired = (val) => !val || (typeof val === "string" && val.trim() === "");
const validateLangField = (obj) => !obj?.az?.trim() || !obj?.en?.trim();

// ─── Dashboard ────────────────────────────────────────────────────────────────
const Dashboard = ({ t, lang }) => {
  const [stats, setStats] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [s, tp, mr] = await Promise.all([
          dashboardApi.getStats(),
          dashboardApi.getTopProducts(5),
          dashboardApi.getMonthlyRevenue(),
        ]);
        setStats(s);
        setTopProducts(Array.isArray(tp) ? tp : tp.data || []);
        setMonthlyData(Array.isArray(mr) ? mr : mr.data || []);
        // Also load recent orders
        const orders = await orderApi.getAll({ page: 1, limit: 5 });
        setRecentOrders(Array.isArray(orders) ? orders.slice(0, 5) : (orders.data || []).slice(0, 5));
      } catch {
        // show empty state
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const maxRevenue = Math.max(...monthlyData.map(d => d.revenue || 0), 1);

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-gray-400">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm">{t.loading}</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">{t.dashboard}</h1>
        <p className="text-sm text-gray-500 mt-0.5">{t.welcomeAdmin}, Admin 👋</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Icons.ShoppingCart />} label={t.totalOrders} value={stats?.totalOrders ?? "—"} trend={stats?.ordersTrend} color="bg-blue-50 text-blue-600" />
        <StatCard icon={<Icons.ShoppingBag />} label={t.todayOrders} value={stats?.todayOrders ?? "—"} trend={stats?.todayTrend} color="bg-emerald-50 text-emerald-600" />
        <StatCard icon={<Icons.DollarSign />} label={t.totalRevenue} value={stats?.totalRevenue ? `$${(stats.totalRevenue / 1000).toFixed(1)}k` : "—"} trend={stats?.revenueTrend} color="bg-amber-50 text-amber-600" />
        <StatCard icon={<Icons.Package />} label={t.totalProducts} value={stats?.totalProducts ?? "—"} trend={stats?.productsTrend} color="bg-purple-50 text-purple-600" />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {monthlyData.length > 0 && (
          <Card className="p-5">
            <h2 className="text-sm font-bold text-gray-700 mb-4">Revenue Overview (Last 6 months)</h2>
            <div className="flex items-end gap-2 h-36">
              {monthlyData.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full bg-emerald-500 rounded-t-md transition-all hover:bg-emerald-600"
                    style={{ height: `${((d.revenue || 0) / maxRevenue) * 100}%`, minHeight: "4px" }} />
                  <span className="text-xs text-gray-400">{d.month}</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {topProducts.length > 0 && (
          <Card className="p-5">
            <h2 className="text-sm font-bold text-gray-700 mb-4">{t.topProducts}</h2>
            <div className="space-y-3">
              {topProducts.map((p, i) => (
                <div key={p.id} className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate">{typeof p.name === "object" ? p.name[lang] : p.name}</p>
                    <div className="h-1.5 bg-gray-100 rounded-full mt-1">
                      <div className="h-1.5 bg-emerald-500 rounded-full" style={{ width: `${Math.min((p.price / (topProducts[0]?.price || 1)) * 100, 100)}%` }} />
                    </div>
                  </div>
                  <span className="text-sm font-bold text-gray-700">${p.price}</span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {recentOrders.length > 0 && (
        <Card>
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-bold text-gray-700">Recent Orders</h2>
          </div>
          <Table
            columns={[
              { key: "id", label: "Order ID", render: r => <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">#{r.id}</span> },
              { key: "user", label: t.user, render: r => typeof r.user === "object" ? `${r.user.firstName || ""} ${r.user.lastName || ""}`.trim() : r.user },
              { key: "total", label: t.totalRevenue, render: r => <span className="font-semibold text-gray-800">${r.total?.toLocaleString()}</span> },
              { key: "status", label: t.status, render: r => <Badge status={r.status} label={t[r.status]} /> },
              { key: "date", label: t.date, render: r => <span className="text-gray-500 text-xs">{r.date || r.createdAt?.split("T")[0]}</span> },
            ]}
            data={recentOrders}
          />
        </Card>
      )}
    </div>
  );
};

// ─── Products ─────────────────────────────────────────────────────────────────
const Products = ({ t, lang }) => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formLang, setFormLang] = useState("en");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);
  const [categories, setCategories] = useState([]);
  const PER_PAGE = 8;

  const emptyForm = { name: { az: "", en: "", ru: "" }, description: { az: "", en: "", ru: "" }, price: "", stock: "", category_id: "", colors: [], images: [] };
  const [form, setForm] = useState(emptyForm);

  const { data: products, total, loading, reload } = useAdminData(
    (params) => productApi.getAll(params),
    []
  );

  useEffect(() => {
    categoryApi.getAll().then(res => {
      const arr = Array.isArray(res) ? res : res.data || [];
      setCategories(arr);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    reload({ page, limit: PER_PAGE, search });
  }, [page, search]);

  const validate = () => {
    const e = {};
    if (validateLangField(form.name)) e.name = t.required;
    if (!form.price || Number(form.price) <= 0) e.price = t.invalidPrice;
    if (form.stock === "" || Number(form.stock) < 0) e.stock = t.invalidStock;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const openAdd = () => { setEditing(null); setForm(emptyForm); setErrors({}); setModal(true); };
  const openEdit = (p) => {
    setEditing(p.id);
    setForm({
      name: p.name || { az: "", en: "", ru: "" },
      description: p.description || { az: "", en: "", ru: "" },
      price: p.price ?? "",
      stock: p.stock ?? "",
      category_id: p.category_id || p.category?.id || "",
      colors: p.colors || [],
      images: p.images || [],
    });
    setErrors({});
    setModal(true);
  };

  const onDelete = async (p) => {
    if (!window.confirm(t.confirmDelete)) return;
    try {
      await productApi.remove(p.id);
      setToast({ message: t.successDeleted, type: "success" });
      reload({ page, limit: PER_PAGE, search });
    } catch (err) {
      setToast({ message: err?.userMessage || t.error, type: "error" });
    }
  };

  const onSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
        category_id: form.category_id || undefined,
      };
      if (editing) await productApi.update(editing, payload);
      else await productApi.create(payload);
      setToast({ message: t.successSaved, type: "success" });
      setModal(false);
      reload({ page, limit: PER_PAGE, search });
    } catch (err) {
      setToast({ message: err?.userMessage || t.error, type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const setLangField = (field, l, val) => setForm(f => ({ ...f, [field]: { ...f[field], [l]: val } }));
  const setField = (field, val) => setForm(f => ({ ...f, [field]: val }));

  return (
    <div className="space-y-5">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">{t.products}</h1>
        <Btn onClick={openAdd}><Icons.Plus />{t.addProduct}</Btn>
      </div>

      <Card>
        <div className="flex items-center gap-3 p-4 border-b border-gray-100">
          <div className="relative flex-1 max-w-sm">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Icons.Search /></div>
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder={t.search}
              className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all" />
          </div>
          <span className="text-xs text-gray-500">{total} items</span>
        </div>
        <Table
          loading={loading}
          columns={[
            { key: "name", label: t.name, render: r => (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 overflow-hidden flex-shrink-0">
                  {r.images?.[0] ? <img src={r.images[0]} alt="" className="w-full h-full object-cover" /> : <Icons.Package />}
                </div>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{typeof r.name === "object" ? r.name[lang] : r.name}</p>
                  <p className="text-xs text-gray-400">{r.category?.name?.[lang] || r.category || ""}</p>
                </div>
              </div>
            )},
            { key: "price", label: t.price, render: r => <span className="font-bold text-emerald-700">${Number(r.price).toLocaleString()}</span> },
            { key: "stock", label: t.stock, render: r => (
              <span className={`font-semibold ${r.stock === 0 ? "text-red-500" : r.stock < 10 ? "text-amber-500" : "text-gray-700"}`}>
                {r.stock === 0 ? t.outOfStock : r.stock}
              </span>
            )},
            { key: "colors", label: t.colors, render: r => (
              <div className="flex gap-1">{(r.colors || []).map((c, i) => (
                <div key={i} className="w-5 h-5 rounded-full border-2 border-white shadow-sm" style={{ background: c.hex }} title={c.name} />
              ))}</div>
            )},
          ]}
          data={products}
          onEdit={openEdit}
          onDelete={onDelete}
        />
        <Pagination total={total} page={page} perPage={PER_PAGE} onChange={setPage} />
      </Card>

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? t.editProduct : t.addProduct}>
        <div className="space-y-4">
          <LangTabs lang={formLang} onChange={setFormLang} />
          <div className="grid grid-cols-2 gap-4">
            <Input label={`${t.name} (${formLang.toUpperCase()})`} value={form.name[formLang]}
              onChange={v => setLangField("name", formLang, v)} required error={errors.name} />
            <Input label={t.price} value={form.price} onChange={v => setField("price", v)} type="number" error={errors.price} />
          </div>
          <Textarea label={`${t.description} (${formLang.toUpperCase()})`} value={form.description[formLang]}
            onChange={v => setLangField("description", formLang, v)} />
          <div className="grid grid-cols-2 gap-4">
            <Input label={t.stock} value={form.stock} onChange={v => setField("stock", v)} type="number" error={errors.stock} />
            <Select label={t.category} value={form.category_id} onChange={v => setField("category_id", v)}
              options={[{ value: "", label: "— Seçin —" }, ...categories.map(c => ({
                value: c.id,
                label: typeof c.name === "object" ? c.name[lang] : c.name,
              }))]} />
          </div>

          {/* Colors */}
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-2">{t.colors}</label>
            <div className="flex flex-wrap gap-2">
              {form.colors.map((c, i) => (
                <div key={i} className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs">
                  <div className="w-4 h-4 rounded-full" style={{ background: c.hex }} />
                  <span>{c.name}</span>
                  <button type="button" onClick={() => setField("colors", form.colors.filter((_, j) => j !== i))} className="text-gray-400 hover:text-red-500"><Icons.X /></button>
                </div>
              ))}
              <Btn size="sm" variant="secondary" onClick={() => {
                const hex = prompt("Hex color (e.g. #FF0000)");
                const name = prompt("Color name");
                if (hex && name) setField("colors", [...form.colors, { hex, name }]);
              }} type="button"><Icons.Plus />Add Color</Btn>
            </div>
          </div>

          {/* Image Upload */}
          <ImageUpload
            label={t.images}
            value={form.images?.[0]}
            onChange={(url) => setField("images", [url])}
            uploadFn={productApi.uploadImage}
            t={t}
          />

          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
            <Btn variant="secondary" onClick={() => setModal(false)} disabled={saving}>{t.cancel}</Btn>
            <Btn onClick={onSave} disabled={saving}>
              {saving ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />{t.saving}</> : <><Icons.Check />{t.save}</>}
            </Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// ─── Categories ───────────────────────────────────────────────────────────────
const Categories = ({ t, lang }) => {
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formLang, setFormLang] = useState("en");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);
  const emptyForm = { name: { az: "", en: "", ru: "" }, image: null };
  const [form, setForm] = useState(emptyForm);

  const { data: cats, loading, reload } = useAdminData(() => categoryApi.getAll());

  const validate = () => {
    const e = {};
    if (validateLangField(form.name)) e.name = t.required;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const openAdd = () => { setEditing(null); setForm(emptyForm); setErrors({}); setModal(true); };
  const openEdit = (c) => { setEditing(c.id); setForm({ name: c.name || { az: "", en: "", ru: "" }, image: c.image || null }); setErrors({}); setModal(true); };

  const onDelete = async (c) => {
    if (!window.confirm(t.confirmDelete)) return;
    try {
      await categoryApi.remove(c.id);
      setToast({ message: t.successDeleted, type: "success" });
      reload();
    } catch (err) {
      setToast({ message: err?.userMessage || t.error, type: "error" });
    }
  };

  const onSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      if (editing) await categoryApi.update(editing, form);
      else await categoryApi.create(form);
      setToast({ message: t.successSaved, type: "success" });
      setModal(false);
      reload();
    } catch (err) {
      setToast({ message: err?.userMessage || t.error, type: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">{t.categories}</h1>
        <Btn onClick={openAdd}><Icons.Plus />{t.addCategory}</Btn>
      </div>
      {loading ? (
        <div className="flex justify-center py-16 text-gray-400"><div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {cats.map(c => (
            <Card key={c.id} className="p-4 hover:shadow-md transition-shadow group">
              <div className="w-full h-24 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl mb-3 flex items-center justify-center overflow-hidden">
                {c.image ? <img src={c.image} alt="" className="w-full h-full object-cover" /> : <div className="text-emerald-400"><Icons.Grid /></div>}
              </div>
              <h3 className="font-semibold text-gray-800 text-sm">{typeof c.name === "object" ? c.name[lang] : c.name}</h3>
              <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <Btn size="sm" variant="secondary" onClick={() => openEdit(c)}><Icons.Edit /></Btn>
                <Btn size="sm" variant="danger" onClick={() => onDelete(c)}><Icons.Trash /></Btn>
              </div>
            </Card>
          ))}
        </div>
      )}
      <Modal open={modal} onClose={() => setModal(false)} title={editing ? t.edit : t.addCategory}>
        <div className="space-y-4">
          <LangTabs lang={formLang} onChange={setFormLang} />
          <Input label={`${t.name} (${formLang.toUpperCase()})`} value={form.name[formLang]}
            onChange={v => setForm(f => ({ ...f, name: { ...f.name, [formLang]: v } }))}
            required error={errors.name} />
          <ImageUpload label={t.image} value={form.image} onChange={url => setForm(f => ({ ...f, image: url }))}
            uploadFn={categoryApi.uploadImage} t={t} />
          <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
            <Btn variant="secondary" onClick={() => setModal(false)} disabled={saving}>{t.cancel}</Btn>
            <Btn onClick={onSave} disabled={saving}>
              {saving ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />{t.saving}</> : <><Icons.Check />{t.save}</>}
            </Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// ─── Collections ──────────────────────────────────────────────────────────────
const Collections = ({ t, lang }) => {
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formLang, setFormLang] = useState("en");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);
  const [availableProducts, setAvailableProducts] = useState([]);
  const emptyForm = { name: { az: "", en: "", ru: "" }, description: { az: "", en: "", ru: "" }, price: "", product_ids: [] };
  const [form, setForm] = useState(emptyForm);

  const { data: colls, loading, reload } = useAdminData(() => collectionApi.getAll());

  useEffect(() => {
    productApi.getAll({ limit: 100 }).then(res => {
      setAvailableProducts(Array.isArray(res) ? res : res.data || []);
    }).catch(() => {});
  }, []);

  const validate = () => {
    const e = {};
    if (validateLangField(form.name)) e.name = t.required;
    if (!form.price || Number(form.price) <= 0) e.price = t.invalidPrice;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const openAdd = () => { setEditing(null); setForm(emptyForm); setErrors({}); setModal(true); };
  const openEdit = (c) => {
    setEditing(c.id);
    setForm({ name: c.name || { az: "", en: "", ru: "" }, description: c.description || { az: "", en: "", ru: "" }, price: c.price || "", product_ids: c.product_ids || c.products?.map(p => p.id || p) || [] });
    setErrors({}); setModal(true);
  };

  const onDelete = async (c) => {
    if (!window.confirm(t.confirmDelete)) return;
    try { await collectionApi.remove(c.id); setToast({ message: t.successDeleted, type: "success" }); reload(); }
    catch (err) { setToast({ message: err?.userMessage || t.error, type: "error" }); }
  };

  const onSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = { ...form, price: Number(form.price) };
      if (editing) await collectionApi.update(editing, payload);
      else await collectionApi.create(payload);
      setToast({ message: t.successSaved, type: "success" });
      setModal(false); reload();
    } catch (err) {
      setToast({ message: err?.userMessage || t.error, type: "error" });
    } finally { setSaving(false); }
  };

  const toggleProduct = (pid) => setForm(f => ({
    ...f, product_ids: f.product_ids.includes(pid) ? f.product_ids.filter(x => x !== pid) : [...f.product_ids, pid]
  }));

  return (
    <div className="space-y-5">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">{t.collections}</h1>
        <Btn onClick={openAdd}><Icons.Plus />{t.addCollection}</Btn>
      </div>
      <Card>
        <Table
          loading={loading}
          columns={[
            { key: "name", label: t.name, render: r => <span className="font-semibold text-gray-800">{typeof r.name === "object" ? r.name[lang] : r.name}</span> },
            { key: "description", label: t.description, render: r => <span className="text-gray-500 text-xs">{typeof r.description === "object" ? r.description[lang] : r.description}</span> },
            { key: "price", label: t.price, render: r => <span className="font-bold text-emerald-700">${Number(r.price).toLocaleString()}</span> },
            { key: "products", label: t.products, render: r => <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-xs font-semibold">{r.product_ids?.length || r.products?.length || 0} items</span> },
          ]}
          data={colls}
          onEdit={openEdit}
          onDelete={onDelete}
        />
      </Card>
      <Modal open={modal} onClose={() => setModal(false)} title={editing ? t.edit : t.addCollection}>
        <div className="space-y-4">
          <LangTabs lang={formLang} onChange={setFormLang} />
          <Input label={`${t.name} (${formLang.toUpperCase()})`} value={form.name[formLang]}
            onChange={v => setForm(f => ({ ...f, name: { ...f.name, [formLang]: v } }))} required error={errors.name} />
          <Textarea label={`${t.description} (${formLang.toUpperCase()})`} value={form.description[formLang]}
            onChange={v => setForm(f => ({ ...f, description: { ...f.description, [formLang]: v } }))} />
          <Input label={t.price} value={form.price} onChange={v => setForm(f => ({ ...f, price: v }))} type="number" error={errors.price} />
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-2">{t.selectProducts}</label>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
              {availableProducts.map(p => (
                <label key={p.id} className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${form.product_ids?.includes(p.id) ? "border-emerald-500 bg-emerald-50" : "border-gray-200 hover:border-gray-300"}`}>
                  <input type="checkbox" checked={form.product_ids?.includes(p.id)} onChange={() => toggleProduct(p.id)} className="accent-emerald-600" />
                  <span className="text-xs font-medium text-gray-700 truncate">{typeof p.name === "object" ? p.name[lang] : p.name}</span>
                  <span className="ml-auto text-xs text-emerald-700 font-semibold flex-shrink-0">${p.price}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
            <Btn variant="secondary" onClick={() => setModal(false)} disabled={saving}>{t.cancel}</Btn>
            <Btn onClick={onSave} disabled={saving}>
              {saving ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />{t.saving}</> : <><Icons.Check />{t.save}</>}
            </Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// ─── Collection Categories ────────────────────────────────────────────────────
const CollectionCategories = ({ t, lang }) => {
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formLang, setFormLang] = useState("en");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);
  const emptyForm = { name: { az: "", en: "", ru: "" }, image: null };
  const [form, setForm] = useState(emptyForm);

  const { data: cats, loading, reload } = useAdminData(() => collectionCategoryApi.getAll());

  const validate = () => {
    const e = {};
    if (validateLangField(form.name)) e.name = t.required;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const openAdd = () => { setEditing(null); setForm(emptyForm); setErrors({}); setModal(true); };
  const openEdit = (c) => { setEditing(c.id); setForm({ name: c.name || { az: "", en: "", ru: "" }, image: c.image || null }); setErrors({}); setModal(true); };

  const onDelete = async (c) => {
    if (!window.confirm(t.confirmDelete)) return;
    try { await collectionCategoryApi.remove(c.id); setToast({ message: t.successDeleted, type: "success" }); reload(); }
    catch (err) { setToast({ message: err?.userMessage || t.error, type: "error" }); }
  };

  const onSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      if (editing) await collectionCategoryApi.update(editing, form);
      else await collectionCategoryApi.create(form);
      setToast({ message: t.successSaved, type: "success" });
      setModal(false); reload();
    } catch (err) {
      setToast({ message: err?.userMessage || t.error, type: "error" });
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-5">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">{t.collectionCategories}</h1>
        <Btn onClick={openAdd}><Icons.Plus />{t.addNew}</Btn>
      </div>
      {loading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cats.map(c => (
            <Card key={c.id} className="p-4 hover:shadow-md transition-shadow group">
              <div className="w-full h-20 bg-gradient-to-br from-blue-50 to-purple-100 rounded-xl mb-3 flex items-center justify-center overflow-hidden">
                {c.image ? <img src={c.image} alt="" className="w-full h-full object-cover" /> : <div className="text-purple-400"><Icons.Layers /></div>}
              </div>
              <h3 className="font-semibold text-gray-800">{typeof c.name === "object" ? c.name[lang] : c.name}</h3>
              <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <Btn size="sm" variant="secondary" onClick={() => openEdit(c)}><Icons.Edit /></Btn>
                <Btn size="sm" variant="danger" onClick={() => onDelete(c)}><Icons.Trash /></Btn>
              </div>
            </Card>
          ))}
        </div>
      )}
      <Modal open={modal} onClose={() => setModal(false)} title={editing ? t.edit : t.addNew}>
        <div className="space-y-4">
          <LangTabs lang={formLang} onChange={setFormLang} />
          <Input label={`${t.name} (${formLang.toUpperCase()})`} value={form.name[formLang]}
            onChange={v => setForm(f => ({ ...f, name: { ...f.name, [formLang]: v } }))} required error={errors.name} />
          <ImageUpload label={t.image} value={form.image} onChange={url => setForm(f => ({ ...f, image: url }))}
            uploadFn={collectionCategoryApi.uploadImage} t={t} />
          <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
            <Btn variant="secondary" onClick={() => setModal(false)} disabled={saving}>{t.cancel}</Btn>
            <Btn onClick={onSave} disabled={saving}>
              {saving ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />{t.saving}</> : <><Icons.Check />{t.save}</>}
            </Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// ─── Orders ───────────────────────────────────────────────────────────────────
const Orders = ({ t, lang }) => {
  const [page, setPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDate, setFilterDate] = useState("");
  const [detail, setDetail] = useState(null);
  const [advancing, setAdvancing] = useState(null);
  const [toast, setToast] = useState(null);
  const PER_PAGE = 8;
  const STATUS_FLOW = ["pending", "confirmed", "shipped", "delivered"];

  const { data: orders, total, loading, reload } = useAdminData(
    (params) => orderApi.getAll(params), []
  );

  useEffect(() => {
    reload({ page, limit: PER_PAGE, status: filterStatus === "all" ? undefined : filterStatus, date: filterDate || undefined });
  }, [page, filterStatus, filterDate]);

  const advanceStatus = async (order) => {
    const idx = STATUS_FLOW.indexOf(order.status);
    if (idx >= STATUS_FLOW.length - 1) return;
    const next = STATUS_FLOW[idx + 1];
    setAdvancing(order.id);
    try {
      await orderApi.updateStatus(order.id, next);
      setToast({ message: t.successSaved, type: "success" });
      if (detail?.id === order.id) setDetail(d => ({ ...d, status: next }));
      reload({ page, limit: PER_PAGE, status: filterStatus === "all" ? undefined : filterStatus });
    } catch (err) {
      setToast({ message: err?.userMessage || t.error, type: "error" });
    } finally { setAdvancing(null); }
  };

  const getUserName = (r) => {
    if (typeof r.user === "object") return `${r.user?.firstName || ""} ${r.user?.lastName || ""}`.trim() || r.user?.email || "—";
    return r.user || "—";
  };

  return (
    <div className="space-y-5">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">{t.orders}</h1>
        <span className="text-sm text-gray-500">{total} total</span>
      </div>

      <Card className="p-4 flex flex-wrap items-center gap-3">
        <Select value={filterStatus} onChange={v => { setFilterStatus(v); setPage(1); }}
          options={[{ value: "all", label: "All Statuses" }, ...STATUS_FLOW.map(s => ({ value: s, label: t[s] }))]} />
        <Input type="date" value={filterDate} onChange={v => { setFilterDate(v); setPage(1); }} className="w-44" />
        {(filterStatus !== "all" || filterDate) && (
          <Btn variant="ghost" size="sm" onClick={() => { setFilterStatus("all"); setFilterDate(""); }}>
            <Icons.X /> Clear
          </Btn>
        )}
      </Card>

      <Card>
        <Table
          loading={loading}
          columns={[
            { key: "id", label: "Order ID", render: r => <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">#{r.id}</span> },
            { key: "user", label: t.user, render: r => (
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-xs font-bold">{getUserName(r)[0] || "?"}</div>
                <span className="font-medium text-gray-800 text-sm">{getUserName(r)}</span>
              </div>
            )},
            { key: "total", label: "Total", render: r => <span className="font-bold text-gray-800">${Number(r.total).toLocaleString()}</span> },
            { key: "status", label: t.status, render: r => <Badge status={r.status} label={t[r.status]} /> },
            { key: "date", label: t.date, render: r => <span className="text-gray-500 text-xs">{r.date || r.createdAt?.split("T")[0]}</span> },
          ]}
          data={orders}
          onView={async (row) => {
            try { const full = await orderApi.getById(row.id); setDetail(full); }
            catch { setDetail(row); }
          }}
          extraActions={(row) => (
            row.status !== "delivered" && (
              <Btn size="sm" variant="success" onClick={() => advanceStatus(row)} disabled={advancing === row.id}>
                {advancing === row.id ? <div className="w-3 h-3 border-2 border-blue-700 border-t-transparent rounded-full animate-spin" /> : <Icons.ChevronRight />}
                Advance
              </Btn>
            )
          )}
        />
        <Pagination total={total} page={page} perPage={PER_PAGE} onChange={setPage} />
      </Card>

      <Modal open={!!detail} onClose={() => setDetail(null)} title={`${t.orderDetail} #${detail?.id}`}>
        {detail && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-500 mb-1">{t.user}</p>
                <p className="font-semibold text-gray-800">{getUserName(detail)}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-500 mb-1">{t.status}</p>
                <Badge status={detail.status} label={t[detail.status]} />
              </div>
              <div className="bg-gray-50 rounded-xl p-3 col-span-2">
                <p className="text-xs text-gray-500 mb-1">{t.address}</p>
                <p className="font-medium text-gray-800 text-sm">{typeof detail.address === "object" ? `${detail.address?.street || ""}, ${detail.address?.city || ""}` : detail.address}</p>
              </div>
            </div>
            {detail.products && (
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">{t.products}</p>
                <div className="space-y-2">
                  {detail.products.map((p, i) => (
                    <div key={i} className="flex items-center justify-between bg-gray-50 rounded-lg p-3 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center"><Icons.Package /></div>
                        <span className="font-medium text-gray-800">{typeof p.name === "object" ? p.name[lang] : p.name}</span>
                        <span className="text-gray-400 text-xs">×{p.qty || p.quantity}</span>
                      </div>
                      <span className="font-bold text-emerald-700">${Number(p.price).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="flex items-center justify-between bg-emerald-50 rounded-xl p-4">
              <span className="font-semibold text-gray-700">Total</span>
              <span className="text-xl font-bold text-emerald-700">${Number(detail.total).toLocaleString()}</span>
            </div>
            {detail.status !== "delivered" && (
              <div className="flex justify-end">
                <Btn onClick={() => advanceStatus(detail)} disabled={advancing === detail.id}>
                  {advancing === detail.id ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Icons.ChevronRight />}
                  {t.updateStatus}: {t[STATUS_FLOW[STATUS_FLOW.indexOf(detail.status) + 1]]}
                </Btn>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

// ─── Hero Sections ────────────────────────────────────────────────────────────
const HeroSections = ({ t, lang }) => {
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formLang, setFormLang] = useState("en");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);
  const emptyForm = { title: { az: "", en: "", ru: "" }, subtitle: { az: "", en: "", ru: "" }, image: null, active: true };
  const [form, setForm] = useState(emptyForm);

  const { data: heros, loading, reload } = useAdminData(() => heroApi.getAll());

  const validate = () => {
    const e = {};
    if (validateLangField(form.title)) e.title = t.required;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const openAdd = () => { setEditing(null); setForm(emptyForm); setErrors({}); setModal(true); };
  const openEdit = (h) => { setEditing(h.id); setForm({ title: h.title || { az: "", en: "", ru: "" }, subtitle: h.subtitle || { az: "", en: "", ru: "" }, image: h.image, active: h.active }); setErrors({}); setModal(true); };

  const onToggle = async (h) => {
    try { await heroApi.toggle(h.id); reload(); }
    catch (err) { setToast({ message: err?.userMessage || t.error, type: "error" }); }
  };

  const onDelete = async (h) => {
    if (!window.confirm(t.confirmDelete)) return;
    try { await heroApi.remove(h.id); setToast({ message: t.successDeleted, type: "success" }); reload(); }
    catch (err) { setToast({ message: err?.userMessage || t.error, type: "error" }); }
  };

  const onSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      if (editing) await heroApi.update(editing, form);
      else await heroApi.create(form);
      setToast({ message: t.successSaved, type: "success" });
      setModal(false); reload();
    } catch (err) {
      setToast({ message: err?.userMessage || t.error, type: "error" });
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-5">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">{t.heroSections}</h1>
        <Btn onClick={openAdd}><Icons.Plus />{t.addNew}</Btn>
      </div>
      {loading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-4">
          {heros.map(h => (
            <Card key={h.id} className={`overflow-hidden group transition-all ${h.active ? "ring-2 ring-emerald-400" : ""}`}>
              <div className="h-36 bg-gradient-to-br from-slate-800 to-slate-600 relative flex items-center justify-center overflow-hidden">
                {h.image && <img src={h.image} alt="" className="absolute inset-0 w-full h-full object-cover opacity-60" />}
                <div className="text-center text-white relative z-10">
                  <p className="text-xl font-bold">{typeof h.title === "object" ? h.title[lang] : h.title}</p>
                  <p className="text-sm text-slate-300">{typeof h.subtitle === "object" ? h.subtitle[lang] : h.subtitle}</p>
                </div>
                {h.active && <div className="absolute top-3 right-3 bg-emerald-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold">Active</div>}
              </div>
              <div className="p-4 flex items-center justify-between">
                <button onClick={() => onToggle(h)} className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${h.active ? "bg-red-50 text-red-600 hover:bg-red-100" : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"}`}>
                  {h.active ? t.deactivate : t.activate}
                </button>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Btn size="sm" variant="secondary" onClick={() => openEdit(h)}><Icons.Edit /></Btn>
                  <Btn size="sm" variant="danger" onClick={() => onDelete(h)}><Icons.Trash /></Btn>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
      <Modal open={modal} onClose={() => setModal(false)} title={editing ? t.edit : t.addNew}>
        <div className="space-y-4">
          <LangTabs lang={formLang} onChange={setFormLang} />
          <Input label={`${t.title} (${formLang.toUpperCase()})`} value={form.title[formLang]}
            onChange={v => setForm(f => ({ ...f, title: { ...f.title, [formLang]: v } }))} required error={errors.title} />
          <Input label={`${t.subtitle} (${formLang.toUpperCase()})`} value={form.subtitle[formLang]}
            onChange={v => setForm(f => ({ ...f, subtitle: { ...f.subtitle, [formLang]: v } }))} />
          <ImageUpload label={t.image} value={form.image} onChange={url => setForm(f => ({ ...f, image: url }))}
            uploadFn={heroApi.uploadImage} t={t} />
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.active} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} className="accent-emerald-600" />
            <span className="text-sm font-medium text-gray-700">{t.active}</span>
          </label>
          <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
            <Btn variant="secondary" onClick={() => setModal(false)} disabled={saving}>{t.cancel}</Btn>
            <Btn onClick={onSave} disabled={saving}>
              {saving ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />{t.saving}</> : <><Icons.Check />{t.save}</>}
            </Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// ─── Campaigns ────────────────────────────────────────────────────────────────
const Campaigns = ({ t, lang }) => {
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formLang, setFormLang] = useState("en");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);
  const emptyForm = { name: { az: "", en: "", ru: "" }, discount: "", startDate: "", endDate: "", active: true };
  const [form, setForm] = useState(emptyForm);

  const { data: camps, loading, reload } = useAdminData(() => campaignApi.getAll());

  const validate = () => {
    const e = {};
    if (validateLangField(form.name)) e.name = t.required;
    if (!form.discount || Number(form.discount) < 1 || Number(form.discount) > 100) e.discount = t.invalidDiscount;
    if (!form.startDate) e.startDate = t.required;
    if (!form.endDate) e.endDate = t.required;
    if (form.startDate && form.endDate && form.startDate > form.endDate) e.endDate = t.dateError;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const openAdd = () => { setEditing(null); setForm(emptyForm); setErrors({}); setModal(true); };
  const openEdit = (c) => { setEditing(c.id); setForm({ name: c.name || { az: "", en: "", ru: "" }, discount: c.discount, startDate: c.startDate, endDate: c.endDate, active: c.active }); setErrors({}); setModal(true); };

  const onToggle = async (c) => {
    try { await campaignApi.toggle(c.id); reload(); }
    catch (err) { setToast({ message: err?.userMessage || t.error, type: "error" }); }
  };

  const onDelete = async (c) => {
    if (!window.confirm(t.confirmDelete)) return;
    try { await campaignApi.remove(c.id); setToast({ message: t.successDeleted, type: "success" }); reload(); }
    catch (err) { setToast({ message: err?.userMessage || t.error, type: "error" }); }
  };

  const onSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = { ...form, discount: Number(form.discount) };
      if (editing) await campaignApi.update(editing, payload);
      else await campaignApi.create(payload);
      setToast({ message: t.successSaved, type: "success" });
      setModal(false); reload();
    } catch (err) {
      setToast({ message: err?.userMessage || t.error, type: "error" });
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-5">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">{t.campaigns}</h1>
        <Btn onClick={openAdd}><Icons.Plus />{t.addNew}</Btn>
      </div>
      <Card>
        <Table
          loading={loading}
          columns={[
            { key: "name", label: t.name, render: r => <span className="font-semibold text-gray-800">{typeof r.name === "object" ? r.name[lang] : r.name}</span> },
            { key: "discount", label: t.discount, render: r => <span className="bg-amber-100 text-amber-700 px-2.5 py-0.5 rounded-full text-xs font-bold">{r.discount}% OFF</span> },
            { key: "startDate", label: "Start", render: r => <span className="text-gray-500 text-xs">{r.startDate}</span> },
            { key: "endDate", label: "End", render: r => <span className="text-gray-500 text-xs">{r.endDate}</span> },
            { key: "active", label: t.status, render: r => (
              <button onClick={() => onToggle(r)} className={`px-2.5 py-0.5 rounded-full text-xs font-semibold transition-colors ${r.active ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                {r.active ? t.active : t.inactive}
              </button>
            )},
          ]}
          data={camps}
          onEdit={openEdit}
          onDelete={onDelete}
        />
      </Card>
      <Modal open={modal} onClose={() => setModal(false)} title={editing ? t.edit : t.addNew}>
        <div className="space-y-4">
          <LangTabs lang={formLang} onChange={setFormLang} />
          <Input label={`${t.name} (${formLang.toUpperCase()})`} value={form.name[formLang]}
            onChange={v => setForm(f => ({ ...f, name: { ...f.name, [formLang]: v } }))} required error={errors.name} />
          <Input label={`${t.discount} %`} value={form.discount} onChange={v => setForm(f => ({ ...f, discount: v }))} type="number" error={errors.discount} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Start Date" value={form.startDate} onChange={v => setForm(f => ({ ...f, startDate: v }))} type="date" error={errors.startDate} />
            <Input label="End Date" value={form.endDate} onChange={v => setForm(f => ({ ...f, endDate: v }))} type="date" error={errors.endDate} />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.active} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} className="accent-emerald-600" />
            <span className="text-sm font-medium text-gray-700">{t.active}</span>
          </label>
          <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
            <Btn variant="secondary" onClick={() => setModal(false)} disabled={saving}>{t.cancel}</Btn>
            <Btn onClick={onSave} disabled={saving}>
              {saving ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />{t.saving}</> : <><Icons.Check />{t.save}</>}
            </Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// ─── Discount Codes ───────────────────────────────────────────────────────────
const DiscountCodes = ({ t }) => {
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);
  const emptyForm = { code: "", type: "percent", value: "", limit: "", expiration: "", active: true };
  const [form, setForm] = useState(emptyForm);

  const { data: codes, loading, reload } = useAdminData(() => discountCodeApi.getAll());

  const validate = () => {
    const e = {};
    if (!form.code.trim()) e.code = t.required;
    if (!form.value || Number(form.value) <= 0) e.value = t.required;
    if (!form.expiration) e.expiration = t.required;
    if (form.type === "percent" && (Number(form.value) < 1 || Number(form.value) > 100)) e.value = t.invalidDiscount;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const openAdd = () => { setEditing(null); setForm(emptyForm); setErrors({}); setModal(true); };
  const openEdit = (c) => { setEditing(c.id); setForm({ code: c.code, type: c.type, value: c.value, limit: c.limit, expiration: c.expiration, active: c.active }); setErrors({}); setModal(true); };

  const onToggle = async (c) => {
    try { await discountCodeApi.toggle(c.id); reload(); }
    catch (err) { setToast({ message: err?.userMessage || t.error, type: "error" }); }
  };

  const onDelete = async (c) => {
    if (!window.confirm(t.confirmDelete)) return;
    try { await discountCodeApi.remove(c.id); setToast({ message: t.successDeleted, type: "success" }); reload(); }
    catch (err) { setToast({ message: err?.userMessage || t.error, type: "error" }); }
  };

  const onSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = { ...form, value: Number(form.value), limit: Number(form.limit) || 0 };
      if (editing) await discountCodeApi.update(editing, payload);
      else await discountCodeApi.create(payload);
      setToast({ message: t.successSaved, type: "success" });
      setModal(false); reload();
    } catch (err) {
      setToast({ message: err?.userMessage || t.error, type: "error" });
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-5">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">{t.discountCodes}</h1>
        <Btn onClick={openAdd}><Icons.Plus />{t.addNew}</Btn>
      </div>
      <Card>
        <Table
          loading={loading}
          columns={[
            { key: "code", label: t.code, render: r => <code className="bg-gray-100 px-2.5 py-1 rounded-lg text-sm font-bold text-gray-800">{r.code}</code> },
            { key: "type", label: t.type, render: r => <span className="text-xs text-gray-600">{r.type === "percent" ? t.percent : t.fixed}</span> },
            { key: "value", label: t.value, render: r => <span className="font-bold text-emerald-700">{r.value}{r.type === "percent" ? "%" : "$"}</span> },
            { key: "usageCount", label: t.usageCount, render: r => <span className="text-gray-600">{r.usageCount || 0} / {r.limit || "∞"}</span> },
            { key: "expiration", label: "Expires", render: r => <span className="text-gray-500 text-xs">{r.expiration}</span> },
            { key: "active", label: t.status, render: r => (
              <button onClick={() => onToggle(r)} className={`px-2.5 py-0.5 rounded-full text-xs font-semibold transition-colors ${r.active ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                {r.active ? t.active : t.inactive}
              </button>
            )},
          ]}
          data={codes}
          onEdit={openEdit}
          onDelete={onDelete}
        />
      </Card>
      <Modal open={modal} onClose={() => setModal(false)} title={editing ? t.edit : t.addNew}>
        <div className="space-y-4">
          <Input label={t.code} value={form.code} onChange={v => setForm(f => ({ ...f, code: v.toUpperCase() }))} placeholder="SAVE20" required error={errors.code} />
          <Select label={t.type} value={form.type} onChange={v => setForm(f => ({ ...f, type: v }))}
            options={[{ value: "percent", label: t.percent }, { value: "fixed", label: t.fixed }]} />
          <div className="grid grid-cols-2 gap-4">
            <Input label={`${t.value} (${form.type === "percent" ? "%" : "$"})`} value={form.value}
              onChange={v => setForm(f => ({ ...f, value: v }))} type="number" error={errors.value} />
            <Input label={t.limit} value={form.limit} onChange={v => setForm(f => ({ ...f, limit: v }))} type="number" />
          </div>
          <Input label="Expiration Date" value={form.expiration} onChange={v => setForm(f => ({ ...f, expiration: v }))} type="date" error={errors.expiration} />
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.active} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} className="accent-emerald-600" />
            <span className="text-sm font-medium text-gray-700">{t.active}</span>
          </label>
          <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
            <Btn variant="secondary" onClick={() => setModal(false)} disabled={saving}>{t.cancel}</Btn>
            <Btn onClick={onSave} disabled={saving}>
              {saving ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />{t.saving}</> : <><Icons.Check />{t.save}</>}
            </Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// ─── Sidebar & Header ─────────────────────────────────────────────────────────
const NAV = [
  { key: "dashboard", icon: <Icons.Dashboard />, label: "dashboard" },
  { key: "products", icon: <Icons.Package />, label: "products" },
  { key: "categories", icon: <Icons.Tag />, label: "categories" },
  { key: "collections", icon: <Icons.Layers />, label: "collections" },
  { key: "collection-categories", icon: <Icons.Grid />, label: "collectionCategories" },
  { key: "orders", icon: <Icons.ShoppingBag />, label: "orders" },
  { key: "hero-sections", icon: <Icons.Image />, label: "heroSections" },
  { key: "campaigns", icon: <Icons.TrendingUp />, label: "campaigns" },
  { key: "discount-codes", icon: <Icons.Ticket />, label: "discountCodes" },
];

const Sidebar = ({ page, setPage, t, collapsed, setCollapsed }) => (
  <aside className={`h-screen bg-[#1a3a2a] flex flex-col transition-all duration-300 ${collapsed ? "w-16" : "w-60"} flex-shrink-0`}>
    <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
      <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center flex-shrink-0">
        <Icons.Layers />
      </div>
      {!collapsed && <span className="font-bold text-white text-base tracking-wide">FurniAdmin</span>}
      <button onClick={() => setCollapsed(!collapsed)} className="ml-auto text-white/40 hover:text-white transition-colors">
        {collapsed ? <Icons.ChevronRight /> : <Icons.ChevronLeft />}
      </button>
    </div>
    <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto">
      {NAV.map(item => {
        const active = page === item.key;
        return (
          <button key={item.key} onClick={() => setPage(item.key)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group text-left
              ${active ? "bg-white text-[#1a3a2a] shadow-sm" : "text-white/60 hover:bg-white/10 hover:text-white"}`}>
            <div className={`flex-shrink-0 ${active ? "text-emerald-700" : "text-white/50 group-hover:text-white"}`}>{item.icon}</div>
            {!collapsed && <span className={`text-sm font-medium truncate ${active ? "text-[#1a3a2a] font-semibold" : ""}`}>{t[item.label]}</span>}
            {!collapsed && active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-600 flex-shrink-0" />}
          </button>
        );
      })}
    </nav>
    <div className="p-3 border-t border-white/10">
      <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-all">
        <Icons.LogOut />
        {!collapsed && <span className="text-sm font-medium">{t.logout}</span>}
      </button>
    </div>
  </aside>
);

const Header = ({ t, lang, setLang, page }) => {
  const pageLabel = NAV.find(n => n.key === page)?.label || "dashboard";
  return (
    <header className="h-14 bg-white border-b border-gray-100 flex items-center px-5 gap-4 flex-shrink-0">
      <div className="flex-1">
        <h2 className="text-sm font-bold text-gray-700">{t[pageLabel]}</h2>
      </div>
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
        {["az", "en", "ru"].map(l => (
          <button key={l} onClick={() => setLang(l)}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${lang === l ? "bg-white shadow text-emerald-700" : "text-gray-500 hover:text-gray-700"}`}>
            {l.toUpperCase()}
          </button>
        ))}
      </div>
      <div className="relative">
        <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors">
          <Icons.Bell />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white text-xs font-bold">A</div>
        <div className="hidden md:block">
          <p className="text-xs font-semibold text-gray-800">Admin</p>
          <p className="text-xs text-gray-400">admin@furni.az</p>
        </div>
        <Icons.ChevronDown />
      </div>
    </header>
  );
};

// ─── App ──────────────────────────────────────────────────────────────────────
export default function AdminPanel() {
  const [page, setPage] = useState("dashboard");
  const [lang, setLang] = useState("en");
  const [collapsed, setCollapsed] = useState(false);
  const t = translations[lang];

  const renderPage = () => {
    const props = { t, lang };
    switch (page) {
      case "dashboard": return <Dashboard {...props} />;
      case "products": return <Products {...props} />;
      case "categories": return <Categories {...props} />;
      case "collections": return <Collections {...props} />;
      case "collection-categories": return <CollectionCategories {...props} />;
      case "orders": return <Orders {...props} />;
      case "hero-sections": return <HeroSections {...props} />;
      case "campaigns": return <Campaigns {...props} />;
      case "discount-codes": return <DiscountCodes {...props} />;
      default: return <Dashboard {...props} />;
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        * { font-family: 'Plus Jakarta Sans', sans-serif; box-sizing: border-box; }
        @keyframes modalIn { from { opacity: 0; transform: translateY(-12px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #d1fae5; border-radius: 99px; }
        ::-webkit-scrollbar-thumb:hover { background: #6ee7b7; }
        .border-3 { border-width: 3px; }
      `}</style>
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        <Sidebar page={page} setPage={setPage} t={t} collapsed={collapsed} setCollapsed={setCollapsed} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header t={t} lang={lang} setLang={setLang} page={page} />
          <main className="flex-1 overflow-y-auto p-5">
            {renderPage()}
          </main>
        </div>
      </div>
    </>
  );
}