import { useState, useEffect, useRef } from "react";

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
    reporting: "Hesabat", purchase: "Alış", inventory: "İnventar",
    adminPanel: "Admin Panel", welcomeAdmin: "Xoş Gəldiniz", totalProducts: "Ümumi Məhsullar",
    outOfStock: "Stokda Yoxdur", revenue: "Gəlir", customers: "Müştərilər",
    addProduct: "Məhsul Əlavə Et", editProduct: "Məhsulu Düzəlt",
    addCategory: "Kateqoriya Əlavə Et", addCollection: "Kolleksiya Əlavə Et",
    addOrder: "Sifariş Əlavə Et", orderDetail: "Sifariş Təfərrüatı",
    address: "Ünvan", delivery: "Çatdırılma", updateStatus: "Statusu Yenilə",
    previous: "Əvvəlki", next: "Növbəti", page: "Səhifə", of: "/",
    showing: "Göstərilir", to: "-", entries: "qeyd",
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
    reporting: "Reporting", purchase: "Purchase", inventory: "Inventory",
    adminPanel: "Admin Panel", welcomeAdmin: "Welcome Back", totalProducts: "Total Products",
    outOfStock: "Out of Stock", revenue: "Revenue", customers: "Customers",
    addProduct: "Add Product", editProduct: "Edit Product",
    addCategory: "Add Category", addCollection: "Add Collection",
    addOrder: "Add Order", orderDetail: "Order Detail",
    address: "Address", delivery: "Delivery", updateStatus: "Update Status",
    previous: "Previous", next: "Next", page: "Page", of: "of",
    showing: "Showing", to: "to", entries: "entries",
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
    reporting: "Отчёты", purchase: "Закупки", inventory: "Склад",
    adminPanel: "Панель Админа", welcomeAdmin: "Добро пожаловать", totalProducts: "Всего товаров",
    outOfStock: "Нет в наличии", revenue: "Выручка", customers: "Клиенты",
    addProduct: "Добавить товар", editProduct: "Редактировать товар",
    addCategory: "Добавить категорию", addCollection: "Добавить коллекцию",
    addOrder: "Добавить заказ", orderDetail: "Детали заказа",
    address: "Адрес", delivery: "Доставка", updateStatus: "Обновить статус",
    previous: "Назад", next: "Вперёд", page: "Стр.", of: "из",
    showing: "Показано", to: "—", entries: "записей",
  },
};

// ─── Fake Data ────────────────────────────────────────────────────────────────
const fakeProducts = [
  { id: 1, name: { az: "Divan", en: "Sofa", ru: "Диван" }, description: { az: "Yumşaq divan", en: "Soft sofa", ru: "Мягкий диван" }, price: 1200, stock: 15, category: "Living Room", colors: [{ hex: "#8B4513", name: "Brown" }, { hex: "#2C2C2C", name: "Charcoal" }], deleted: false },
  { id: 2, name: { az: "Yataq", en: "Bed", ru: "Кровать" }, description: { az: "Kraliça yatağı", en: "Queen bed", ru: "Кровать-квин" }, price: 2400, stock: 8, category: "Bedroom", colors: [{ hex: "#F5F5DC", name: "Beige" }], deleted: false },
  { id: 3, name: { az: "Stol", en: "Table", ru: "Стол" }, description: { az: "Yemək masası", en: "Dining table", ru: "Обеденный стол" }, price: 850, stock: 22, category: "Dining", colors: [{ hex: "#DEB887", name: "Burlywood" }], deleted: false },
  { id: 4, name: { az: "Kreslo", en: "Armchair", ru: "Кресло" }, description: { az: "Rəhatlıq kreslası", en: "Comfort armchair", ru: "Кресло для отдыха" }, price: 650, stock: 30, category: "Living Room", colors: [{ hex: "#708090", name: "Slate" }], deleted: false },
  { id: 5, name: { az: "Kitab rəfi", en: "Bookshelf", ru: "Книжная полка" }, description: { az: "Müasir kitab rəfi", en: "Modern bookshelf", ru: "Современный стеллаж" }, price: 380, stock: 45, category: "Office", colors: [{ hex: "#FFFFFF", name: "White" }], deleted: false },
  { id: 6, name: { az: "Çarpayı", en: "Single Bed", ru: "Односпальная кровать" }, description: { az: "Tək nəfərlik çarpayı", en: "Single bed frame", ru: "Каркас односпальной кровати" }, price: 760, stock: 0, category: "Bedroom", colors: [{ hex: "#A52A2A", name: "Red" }], deleted: false },
  { id: 7, name: { az: "Kofe masası", en: "Coffee Table", ru: "Журнальный столик" }, description: { az: "Aşağı kofe masası", en: "Low coffee table", ru: "Низкий журнальный столик" }, price: 420, stock: 18, category: "Living Room", colors: [{ hex: "#2F4F4F", name: "Dark Slate" }], deleted: false },
  { id: 8, name: { az: "Şkaf", en: "Wardrobe", ru: "Шкаф" }, description: { az: "Böyük gardırop", en: "Large wardrobe", ru: "Большой шкаф" }, price: 1800, stock: 5, category: "Bedroom", colors: [{ hex: "#F0E68C", name: "Khaki" }], deleted: false },
];

const fakeCategories = [
  { id: 1, name: { az: "Qonaq otağı", en: "Living Room", ru: "Гостиная" }, image: null },
  { id: 2, name: { az: "Yataq otağı", en: "Bedroom", ru: "Спальня" }, image: null },
  { id: 3, name: { az: "Yemək otağı", en: "Dining", ru: "Столовая" }, image: null },
  { id: 4, name: { az: "Ofis", en: "Office", ru: "Офис" }, image: null },
];

const fakeCollections = [
  { id: 1, name: { az: "Yaz Kolleksiyası", en: "Spring Collection", ru: "Весенняя коллекция" }, description: { az: "2024 yaz", en: "Spring 2024", ru: "Весна 2024" }, price: 3500, products: [1, 3] },
  { id: 2, name: { az: "Müasir Ev", en: "Modern Home", ru: "Современный дом" }, description: { az: "Müasir dizayn", en: "Modern design", ru: "Современный дизайн" }, price: 5200, products: [2, 4, 7] },
];

const fakeCollectionCategories = [
  { id: 1, name: { az: "Lüks", en: "Luxury", ru: "Люкс" }, image: null },
  { id: 2, name: { az: "Minimalist", en: "Minimalist", ru: "Минималист" }, image: null },
];

const fakeOrders = [
  { id: 1001, user: "Anar Məmmədov", total: 2400, status: "delivered", date: "2024-06-10", address: "Bakı, Nərimanov r., Əliağa Vahid 12", products: [{ name: "Bed", qty: 1, price: 2400 }] },
  { id: 1002, user: "Leyla Həsənova", total: 1850, status: "shipped", date: "2024-06-12", address: "Bakı, Sabunçu r., İstiqlaliyyət 5", products: [{ name: "Sofa", qty: 1, price: 1200 }, { name: "Coffee Table", qty: 1, price: 420 }] },
  { id: 1003, user: "Rauf Quliyev", total: 850, status: "confirmed", date: "2024-06-14", address: "Bakı, Xətai r., Neftçilər 78", products: [{ name: "Table", qty: 1, price: 850 }] },
  { id: 1004, user: "Nigar Əliyeva", total: 3200, status: "pending", date: "2024-06-15", address: "Bakı, Nəsimi r., Füzuli 34", products: [{ name: "Wardrobe", qty: 1, price: 1800 }, { name: "Armchair", qty: 2, price: 1300 }] },
  { id: 1005, user: "Elnur Babayev", total: 650, status: "delivered", date: "2024-06-08", address: "Bakı, Yasamal r., Hüsü Hacıyev 10", products: [{ name: "Armchair", qty: 1, price: 650 }] },
];

const fakeHeroSections = [
  { id: 1, title: { az: "Yeni Kolleksiya", en: "New Collection", ru: "Новая Коллекция" }, subtitle: { az: "2024 dizaynları", en: "2024 designs", ru: "Дизайны 2024" }, image: null, active: true },
  { id: 2, title: { az: "Yaz Kampaniyası", en: "Spring Campaign", ru: "Весенняя кампания" }, subtitle: { az: "50% endirim", en: "50% off", ru: "Скидка 50%" }, image: null, active: false },
];

const fakeCampaigns = [
  { id: 1, name: { az: "Yay Endirimi", en: "Summer Sale", ru: "Летняя распродажа" }, discount: 25, startDate: "2024-06-01", endDate: "2024-06-30", active: true },
  { id: 2, name: { az: "Qış Kampaniyası", en: "Winter Campaign", ru: "Зимняя кампания" }, discount: 40, startDate: "2024-12-01", endDate: "2024-12-31", active: false },
];

const fakeDiscountCodes = [
  { id: 1, code: "SUMMER25", type: "percent", value: 25, usageCount: 142, limit: 500, active: true, expiration: "2024-06-30" },
  { id: 2, code: "SAVE50", type: "fixed", value: 50, usageCount: 89, limit: 200, active: true, expiration: "2024-07-15" },
  { id: 3, code: "WINTER40", type: "percent", value: 40, usageCount: 0, limit: 300, active: false, expiration: "2024-12-31" },
];

const monthlyData = [
  { month: "Jan", revenue: 18000, orders: 42 },
  { month: "Feb", revenue: 22000, orders: 55 },
  { month: "Mar", revenue: 19500, orders: 48 },
  { month: "Apr", revenue: 31000, orders: 73 },
  { month: "May", revenue: 28500, orders: 65 },
  { month: "Jun", revenue: 35000, orders: 82 },
];

// ─── Icons (Lucide-style SVG) ─────────────────────────────────────────────────
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
  Globe: () => <Icon path="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z M2 12h20 M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />,
  Toggle: () => <Icon path="M5 12a7 7 0 0 1 14 0 7 7 0 0 1-14 0z M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />,
  Filter: () => <Icon path="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />,
  MoreVertical: () => <Icon path="M12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2z M12 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2z M12 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" />,
  Layers: () => <Icon path="M12 2l9 4.5L12 11 3 6.5z M3 12l9 4.5L21 12 M3 17l9 4.5L21 17" />,
};

// ─── Utility Hooks & Helpers ──────────────────────────────────────────────────
const useLocalState = (key, init) => {
  const [v, set] = useState(() => {
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : init; }
    catch { return init; }
  });
  const setV = (val) => { set(val); try { localStorage.setItem(key, JSON.stringify(val)); } catch {} };
  return [v, setV];
};

const STATUS_COLORS = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-emerald-100 text-emerald-700",
};

// ─── Reusable Components ──────────────────────────────────────────────────────
const Badge = ({ status, label }) => (
  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[status] || "bg-gray-100 text-gray-700"}`}>{label || status}</span>
);

const Btn = ({ children, onClick, variant = "primary", size = "md", className = "", disabled = false, type = "button" }) => {
  const base = "inline-flex items-center gap-2 font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1";
  const sizes = { sm: "px-3 py-1.5 text-xs", md: "px-4 py-2 text-sm", lg: "px-5 py-2.5 text-base" };
  const variants = {
    primary: "bg-emerald-600 text-white hover:bg-emerald-700 hover:scale-105 focus:ring-emerald-500 shadow-sm shadow-emerald-200",
    secondary: "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:scale-105 focus:ring-gray-300",
    danger: "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 hover:scale-105 focus:ring-red-300",
    ghost: "text-gray-500 hover:text-gray-700 hover:bg-gray-100",
    success: "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 hover:scale-105",
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${sizes[size]} ${variants[variant]} ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}>
      {children}
    </button>
  );
};

const Input = ({ label, value, onChange, type = "text", placeholder = "", className = "", required = false }) => (
  <div className={`flex flex-col gap-1 ${className}`}>
    {label && <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{label}{required && <span className="text-red-500 ml-1">*</span>}</label>}
    <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
      className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all" />
  </div>
);

const Select = ({ label, value, onChange, options, className = "" }) => (
  <div className={`flex flex-col gap-1 ${className}`}>
    {label && <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{label}</label>}
    <select value={value} onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all appearance-none">
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
);

const Textarea = ({ label, value, onChange, rows = 3, placeholder = "", className = "" }) => (
  <div className={`flex flex-col gap-1 ${className}`}>
    {label && <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{label}</label>}
    <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={rows} placeholder={placeholder}
      className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all resize-none" />
  </div>
);

const Modal = ({ open, onClose, title, children, width = "max-w-2xl" }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-white rounded-2xl shadow-2xl w-full ${width} mx-4 max-h-[90vh] overflow-hidden flex flex-col animate-in`}
        style={{ animation: "modalIn 0.2s ease-out" }}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-800">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"><Icons.X /></button>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-4">{children}</div>
      </div>
    </div>
  );
};

const Table = ({ columns, data, onEdit, onDelete, onView, extraActions }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-sm">
      <thead>
        <tr className="bg-gray-50 border-b border-gray-100">
          {columns.map(c => (
            <th key={c.key} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{c.label}</th>
          ))}
          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-50">
        {data.length === 0 ? (
          <tr><td colSpan={columns.length + 1} className="px-4 py-10 text-center text-gray-400 text-sm">No data available</td></tr>
        ) : data.map((row, i) => (
          <tr key={row.id || i} className="hover:bg-emerald-50/40 transition-colors group">
            {columns.map(c => (
              <td key={c.key} className="px-4 py-3 text-gray-700 whitespace-nowrap">
                {c.render ? c.render(row) : row[c.key]}
              </td>
            ))}
            <td className="px-4 py-3">
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {onView && <Btn variant="ghost" size="sm" onClick={() => onView(row)}><Icons.Eye /></Btn>}
                {onEdit && <Btn variant="ghost" size="sm" onClick={() => onEdit(row)}><Icons.Edit /></Btn>}
                {extraActions && extraActions(row)}
                {onDelete && <Btn variant="ghost" size="sm" onClick={() => onDelete(row)} className="text-red-400 hover:text-red-600 hover:bg-red-50"><Icons.Trash /></Btn>}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const Pagination = ({ total, page, perPage, onChange }) => {
  const totalPages = Math.ceil(total / perPage);
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
      <span className="text-xs text-gray-500">Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, total)} of {total}</span>
      <div className="flex items-center gap-1">
        <Btn variant="secondary" size="sm" onClick={() => onChange(page - 1)} disabled={page === 1}><Icons.ChevronLeft /></Btn>
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
          return (
            <button key={p} onClick={() => onChange(p)}
              className={`w-8 h-8 text-xs font-medium rounded-lg transition-colors ${p === page ? "bg-emerald-600 text-white" : "text-gray-500 hover:bg-gray-100"}`}>
              {p}
            </button>
          );
        })}
        <Btn variant="secondary" size="sm" onClick={() => onChange(page + 1)} disabled={page === totalPages}><Icons.ChevronRight /></Btn>
      </div>
    </div>
  );
};

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 ${className}`}>{children}</div>
);

const StatCard = ({ icon, label, value, trend, color }) => (
  <Card className="p-5">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{label}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
        {trend && <p className={`text-xs mt-1 font-medium ${trend > 0 ? "text-emerald-600" : "text-red-500"}`}>
          {trend > 0 ? "+" : ""}{trend}% vs last month
        </p>}
      </div>
      <div className={`p-3 rounded-xl ${color}`}>{icon}</div>
    </div>
  </Card>
);

// ─── Mini Bar Chart ───────────────────────────────────────────────────────────
const BarChart = ({ data }) => {
  const max = Math.max(...data.map(d => d.revenue));
  return (
    <div className="flex items-end gap-2 h-32 mt-2">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
          <div className="relative w-full flex items-end justify-center" style={{ height: "100px" }}>
            <div className="relative w-full bg-emerald-100 rounded-t-md transition-all duration-500 group-hover:bg-emerald-500"
              style={{ height: `${(d.revenue / max) * 100}%` }}>
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                ${(d.revenue / 1000).toFixed(0)}k
              </div>
            </div>
          </div>
          <span className="text-xs text-gray-400">{d.month}</span>
        </div>
      ))}
    </div>
  );
};

// ─── Lang Tabs ─────────────────────────────────────────────────────────────────
const LangTabs = ({ lang, onChange }) => (
  <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
    {["az", "en", "ru"].map(l => (
      <button key={l} onClick={() => onChange(l)}
        className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${lang === l ? "bg-white shadow text-emerald-700" : "text-gray-500 hover:text-gray-700"}`}>
        {l.toUpperCase()}
      </button>
    ))}
  </div>
);

// ─── Pages ────────────────────────────────────────────────────────────────────

// Dashboard
const Dashboard = ({ t, lang }) => {
  const topProds = [...fakeProducts].sort((a, b) => b.price - a.price).slice(0, 5);
  const todayOrders = fakeOrders.filter(o => o.date === "2024-06-15").length;
  const totalRev = fakeOrders.reduce((s, o) => s + o.total, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">{t.dashboard}</h1>
        <p className="text-sm text-gray-500 mt-0.5">{t.welcomeAdmin}, Admin 👋</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Icons.ShoppingCart />} label={t.totalOrders} value={fakeOrders.length} trend={12} color="bg-blue-50 text-blue-600" />
        <StatCard icon={<Icons.ShoppingBag />} label={t.todayOrders} value={todayOrders} trend={8} color="bg-emerald-50 text-emerald-600" />
        <StatCard icon={<Icons.DollarSign />} label={t.totalRevenue} value={`$${(totalRev / 1000).toFixed(1)}k`} trend={18} color="bg-amber-50 text-amber-600" />
        <StatCard icon={<Icons.Package />} label={t.totalProducts} value={fakeProducts.length} trend={-3} color="bg-purple-50 text-purple-600" />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <h2 className="text-sm font-bold text-gray-700 mb-4">Revenue Overview (Last 6 months)</h2>
          <BarChart data={monthlyData} />
        </Card>

        <Card className="p-5">
          <h2 className="text-sm font-bold text-gray-700 mb-4">{t.topProducts}</h2>
          <div className="space-y-3">
            {topProds.map((p, i) => (
              <div key={p.id} className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700 truncate">{p.name[lang]}</p>
                  <div className="h-1.5 bg-gray-100 rounded-full mt-1">
                    <div className="h-1.5 bg-emerald-500 rounded-full" style={{ width: `${(p.price / 2400) * 100}%` }} />
                  </div>
                </div>
                <span className="text-sm font-bold text-gray-700">${p.price}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-700">Recent Orders</h2>
        </div>
        <Table
          columns={[
            { key: "id", label: "Order ID", render: r => <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">#{r.id}</span> },
            { key: "user", label: t.user },
            { key: "total", label: t.totalRevenue, render: r => <span className="font-semibold text-gray-800">${r.total.toLocaleString()}</span> },
            { key: "status", label: t.status, render: r => <Badge status={r.status} label={t[r.status]} /> },
            { key: "date", label: t.date },
          ]}
          data={fakeOrders.slice(0, 5)}
        />
      </Card>
    </div>
  );
};

// Products
const Products = ({ t, lang }) => {
  const [products, setProducts] = useLocalState("admin_products", fakeProducts);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formLang, setFormLang] = useState("en");
  const [form, setForm] = useState({ name: { az: "", en: "", ru: "" }, description: { az: "", en: "", ru: "" }, price: "", stock: "", category: "", colors: [], images: [] });
  const PER_PAGE = 6;

  const filtered = products.filter(p => !p.deleted && p.name[lang].toLowerCase().includes(search.toLowerCase()));
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const openAdd = () => { setEditing(null); setForm({ name: { az: "", en: "", ru: "" }, description: { az: "", en: "", ru: "" }, price: "", stock: "", category: "", colors: [], images: [] }); setModal(true); };
  const openEdit = (p) => { setEditing(p.id); setForm({ ...p }); setModal(true); };
  const onDelete = (p) => setProducts(products.map(x => x.id === p.id ? { ...x, deleted: true } : x));
  const onSave = () => {
    if (editing) setProducts(products.map(x => x.id === editing ? { ...x, ...form } : x));
    else setProducts([...products, { ...form, id: Date.now(), deleted: false }]);
    setModal(false);
  };
  const setFormField = (field, val) => setForm(f => ({ ...f, [field]: val }));
  const setLangField = (field, l, val) => setForm(f => ({ ...f, [field]: { ...f[field], [l]: val } }));

  return (
    <div className="space-y-5">
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
          <span className="text-xs text-gray-500">{filtered.length} items</span>
        </div>
        <Table
          columns={[
            { key: "name", label: t.name, render: r => (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700"><Icons.Package /></div>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{r.name[lang]}</p>
                  <p className="text-xs text-gray-400">{r.category}</p>
                </div>
              </div>
            )},
            { key: "price", label: t.price, render: r => <span className="font-bold text-emerald-700">${r.price.toLocaleString()}</span> },
            { key: "stock", label: t.stock, render: r => (
              <span className={`font-semibold ${r.stock === 0 ? "text-red-500" : r.stock < 10 ? "text-amber-500" : "text-gray-700"}`}>
                {r.stock === 0 ? "Out of stock" : r.stock}
              </span>
            )},
            { key: "colors", label: t.colors, render: r => (
              <div className="flex gap-1">{r.colors.map((c, i) => (
                <div key={i} className="w-5 h-5 rounded-full border-2 border-white shadow-sm" style={{ background: c.hex }} title={c.name} />
              ))}</div>
            )},
          ]}
          data={paged}
          onEdit={openEdit}
          onDelete={onDelete}
        />
        <Pagination total={filtered.length} page={page} perPage={PER_PAGE} onChange={setPage} />
      </Card>

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? t.editProduct : t.addProduct}>
        <div className="space-y-4">
          <LangTabs lang={formLang} onChange={setFormLang} />
          <div className="grid grid-cols-2 gap-4">
            <Input label={`${t.name} (${formLang.toUpperCase()})`} value={form.name[formLang]} onChange={v => setLangField("name", formLang, v)} required />
            <Input label={t.price} value={form.price} onChange={v => setFormField("price", v)} type="number" />
          </div>
          <Textarea label={`${t.description} (${formLang.toUpperCase()})`} value={form.description[formLang]} onChange={v => setLangField("description", formLang, v)} />
          <div className="grid grid-cols-2 gap-4">
            <Input label={t.stock} value={form.stock} onChange={v => setFormField("stock", v)} type="number" />
            <Input label={t.category} value={form.category} onChange={v => setFormField("category", v)} />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-2">{t.colors}</label>
            <div className="flex flex-wrap gap-2">
              {form.colors.map((c, i) => (
                <div key={i} className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs">
                  <div className="w-4 h-4 rounded-full" style={{ background: c.hex }} />
                  <span>{c.name}</span>
                  <button onClick={() => setFormField("colors", form.colors.filter((_, j) => j !== i))} className="text-gray-400 hover:text-red-500"><Icons.X /></button>
                </div>
              ))}
              <Btn size="sm" variant="secondary" onClick={() => {
                const hex = prompt("Hex color (e.g. #FF0000)");
                const name = prompt("Color name");
                if (hex && name) setFormField("colors", [...form.colors, { hex, name }]);
              }}><Icons.Plus />Add Color</Btn>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Btn variant="secondary" onClick={() => setModal(false)}>{t.cancel}</Btn>
            <Btn onClick={onSave}><Icons.Check />{t.save}</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// Categories
const Categories = ({ t, lang }) => {
  const [cats, setCats] = useLocalState("admin_cats", fakeCategories);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formLang, setFormLang] = useState("en");
  const [form, setForm] = useState({ name: { az: "", en: "", ru: "" }, image: null });

  const openAdd = () => { setEditing(null); setForm({ name: { az: "", en: "", ru: "" }, image: null }); setModal(true); };
  const openEdit = (c) => { setEditing(c.id); setForm({ ...c }); setModal(true); };
  const onDelete = (c) => setCats(cats.filter(x => x.id !== c.id));
  const onSave = () => {
    if (editing) setCats(cats.map(x => x.id === editing ? { ...x, ...form } : x));
    else setCats([...cats, { ...form, id: Date.now() }]);
    setModal(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">{t.categories}</h1>
        <Btn onClick={openAdd}><Icons.Plus />{t.addCategory}</Btn>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {cats.map(c => (
          <Card key={c.id} className="p-4 hover:shadow-md transition-shadow group">
            <div className="w-full h-24 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl mb-3 flex items-center justify-center">
              <div className="text-emerald-400"><Icons.Grid /></div>
            </div>
            <h3 className="font-semibold text-gray-800 text-sm">{c.name[lang]}</h3>
            <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <Btn size="sm" variant="secondary" onClick={() => openEdit(c)}><Icons.Edit /></Btn>
              <Btn size="sm" variant="danger" onClick={() => onDelete(c)}><Icons.Trash /></Btn>
            </div>
          </Card>
        ))}
      </div>
      <Modal open={modal} onClose={() => setModal(false)} title={editing ? t.edit : t.addCategory}>
        <div className="space-y-4">
          <LangTabs lang={formLang} onChange={setFormLang} />
          <Input label={`${t.name} (${formLang.toUpperCase()})`} value={form.name[formLang]} onChange={v => setForm(f => ({ ...f, name: { ...f.name, [formLang]: v } }))} />
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-2">{t.image}</label>
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center text-gray-400 hover:border-emerald-300 transition-colors cursor-pointer">
              <div className="flex justify-center mb-2"><Icons.Image /></div>
              <p className="text-xs">Click to upload image</p>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Btn variant="secondary" onClick={() => setModal(false)}>{t.cancel}</Btn>
            <Btn onClick={onSave}><Icons.Check />{t.save}</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// Collections
const Collections = ({ t, lang }) => {
  const [colls, setColls] = useLocalState("admin_colls", fakeCollections);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formLang, setFormLang] = useState("en");
  const [form, setForm] = useState({ name: { az: "", en: "", ru: "" }, description: { az: "", en: "", ru: "" }, price: "", products: [] });

  const openAdd = () => { setEditing(null); setForm({ name: { az: "", en: "", ru: "" }, description: { az: "", en: "", ru: "" }, price: "", products: [] }); setModal(true); };
  const openEdit = (c) => { setEditing(c.id); setForm({ ...c }); setModal(true); };
  const onDelete = (c) => setColls(colls.filter(x => x.id !== c.id));
  const onSave = () => {
    if (editing) setColls(colls.map(x => x.id === editing ? { ...x, ...form } : x));
    else setColls([...colls, { ...form, id: Date.now() }]);
    setModal(false);
  };
  const toggleProduct = (pid) => setForm(f => ({ ...f, products: f.products.includes(pid) ? f.products.filter(x => x !== pid) : [...f.products, pid] }));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">{t.collections}</h1>
        <Btn onClick={openAdd}><Icons.Plus />{t.addCollection}</Btn>
      </div>
      <Card>
        <Table
          columns={[
            { key: "name", label: t.name, render: r => <span className="font-semibold text-gray-800">{r.name[lang]}</span> },
            { key: "description", label: t.description, render: r => <span className="text-gray-500 text-xs">{r.description[lang]}</span> },
            { key: "price", label: t.price, render: r => <span className="font-bold text-emerald-700">${r.price?.toLocaleString()}</span> },
            { key: "products", label: t.products, render: r => <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-xs font-semibold">{r.products?.length || 0} items</span> },
          ]}
          data={colls}
          onEdit={openEdit}
          onDelete={onDelete}
        />
      </Card>
      <Modal open={modal} onClose={() => setModal(false)} title={editing ? t.edit : t.addCollection}>
        <div className="space-y-4">
          <LangTabs lang={formLang} onChange={setFormLang} />
          <Input label={`${t.name} (${formLang.toUpperCase()})`} value={form.name[formLang]} onChange={v => setForm(f => ({ ...f, name: { ...f.name, [formLang]: v } }))} />
          <Textarea label={`${t.description} (${formLang.toUpperCase()})`} value={form.description[formLang]} onChange={v => setForm(f => ({ ...f, description: { ...f.description, [formLang]: v } }))} />
          <Input label={t.price} value={form.price} onChange={v => setForm(f => ({ ...f, price: v }))} type="number" />
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-2">{t.selectProducts}</label>
            <div className="grid grid-cols-2 gap-2">
              {fakeProducts.map(p => (
                <label key={p.id} className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${form.products?.includes(p.id) ? "border-emerald-500 bg-emerald-50" : "border-gray-200 hover:border-gray-300"}`}>
                  <input type="checkbox" checked={form.products?.includes(p.id)} onChange={() => toggleProduct(p.id)} className="accent-emerald-600" />
                  <span className="text-xs font-medium text-gray-700">{p.name[lang]}</span>
                  <span className="ml-auto text-xs text-emerald-700 font-semibold">${p.price}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Btn variant="secondary" onClick={() => setModal(false)}>{t.cancel}</Btn>
            <Btn onClick={onSave}><Icons.Check />{t.save}</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// Collection Categories
const CollectionCategories = ({ t, lang }) => {
  const [cats, setCats] = useLocalState("admin_colcats", fakeCollectionCategories);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formLang, setFormLang] = useState("en");
  const [form, setForm] = useState({ name: { az: "", en: "", ru: "" }, image: null });

  const openAdd = () => { setEditing(null); setForm({ name: { az: "", en: "", ru: "" }, image: null }); setModal(true); };
  const openEdit = (c) => { setEditing(c.id); setForm({ ...c }); setModal(true); };
  const onSave = () => {
    if (editing) setCats(cats.map(x => x.id === editing ? { ...x, ...form } : x));
    else setCats([...cats, { ...form, id: Date.now() }]);
    setModal(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">{t.collectionCategories}</h1>
        <Btn onClick={openAdd}><Icons.Plus />{t.addNew}</Btn>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cats.map(c => (
          <Card key={c.id} className="p-4 hover:shadow-md transition-shadow group">
            <div className="w-full h-20 bg-gradient-to-br from-blue-50 to-purple-100 rounded-xl mb-3 flex items-center justify-center">
              <div className="text-purple-400"><Icons.Layers /></div>
            </div>
            <h3 className="font-semibold text-gray-800">{c.name[lang]}</h3>
            <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <Btn size="sm" variant="secondary" onClick={() => openEdit(c)}><Icons.Edit /></Btn>
              <Btn size="sm" variant="danger" onClick={() => setCats(cats.filter(x => x.id !== c.id))}><Icons.Trash /></Btn>
            </div>
          </Card>
        ))}
      </div>
      <Modal open={modal} onClose={() => setModal(false)} title={t.addNew}>
        <div className="space-y-4">
          <LangTabs lang={formLang} onChange={setFormLang} />
          <Input label={`${t.name} (${formLang.toUpperCase()})`} value={form.name[formLang]} onChange={v => setForm(f => ({ ...f, name: { ...f.name, [formLang]: v } }))} />
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-2">{t.image}</label>
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center text-gray-400 hover:border-emerald-300 transition-colors cursor-pointer">
              <div className="flex justify-center mb-2"><Icons.Image /></div>
              <p className="text-xs">Click to upload image</p>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Btn variant="secondary" onClick={() => setModal(false)}>{t.cancel}</Btn>
            <Btn onClick={onSave}><Icons.Check />{t.save}</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// Orders
const Orders = ({ t, lang }) => {
  const [orders, setOrders] = useLocalState("admin_orders", fakeOrders);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDate, setFilterDate] = useState("");
  const [page, setPage] = useState(1);
  const [detail, setDetail] = useState(null);
  const PER_PAGE = 5;
  const STATUS_FLOW = ["pending", "confirmed", "shipped", "delivered"];

  const filtered = orders.filter(o =>
    (filterStatus === "all" || o.status === filterStatus) &&
    (!filterDate || o.date === filterDate)
  );
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const advanceStatus = (order) => {
    const idx = STATUS_FLOW.indexOf(order.status);
    if (idx < STATUS_FLOW.length - 1) {
      const next = STATUS_FLOW[idx + 1];
      setOrders(orders.map(o => o.id === order.id ? { ...o, status: next } : o));
      if (detail?.id === order.id) setDetail({ ...detail, status: next });
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">{t.orders}</h1>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Icons.Filter />
          <span>Filters</span>
        </div>
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
          columns={[
            { key: "id", label: "Order ID", render: r => <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">#{r.id}</span> },
            { key: "user", label: t.user, render: r => (
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-xs font-bold">{r.user[0]}</div>
                <span className="font-medium text-gray-800 text-sm">{r.user}</span>
              </div>
            )},
            { key: "total", label: "Total", render: r => <span className="font-bold text-gray-800">${r.total.toLocaleString()}</span> },
            { key: "status", label: t.status, render: r => <Badge status={r.status} label={t[r.status]} /> },
            { key: "date", label: t.date, render: r => <span className="text-gray-500 text-xs">{r.date}</span> },
          ]}
          data={paged}
          onView={setDetail}
          extraActions={(row) => (
            row.status !== "delivered" && (
              <Btn size="sm" variant="success" onClick={() => advanceStatus(row)}>
                <Icons.ChevronRight /> Advance
              </Btn>
            )
          )}
        />
        <Pagination total={filtered.length} page={page} perPage={PER_PAGE} onChange={setPage} />
      </Card>

      <Modal open={!!detail} onClose={() => setDetail(null)} title={`${t.orderDetail} #${detail?.id}`}>
        {detail && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-500 mb-1">{t.user}</p>
                <p className="font-semibold text-gray-800">{detail.user}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-500 mb-1">{t.status}</p>
                <Badge status={detail.status} label={t[detail.status]} />
              </div>
              <div className="bg-gray-50 rounded-xl p-3 col-span-2">
                <p className="text-xs text-gray-500 mb-1">{t.address}</p>
                <p className="font-medium text-gray-800 text-sm">{detail.address}</p>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">{t.products}</p>
              <div className="space-y-2">
                {detail.products.map((p, i) => (
                  <div key={i} className="flex items-center justify-between bg-gray-50 rounded-lg p-3 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center"><Icons.Package /></div>
                      <span className="font-medium text-gray-800">{p.name}</span>
                      <span className="text-gray-400 text-xs">×{p.qty}</span>
                    </div>
                    <span className="font-bold text-emerald-700">${p.price.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between bg-emerald-50 rounded-xl p-4">
              <span className="font-semibold text-gray-700">Total</span>
              <span className="text-xl font-bold text-emerald-700">${detail.total.toLocaleString()}</span>
            </div>
            {detail.status !== "delivered" && (
              <div className="flex justify-end">
                <Btn onClick={() => advanceStatus(detail)}><Icons.ChevronRight />{t.updateStatus}: {t[STATUS_FLOW[STATUS_FLOW.indexOf(detail.status) + 1]]}</Btn>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

// Hero Sections
const HeroSections = ({ t, lang }) => {
  const [heros, setHeros] = useLocalState("admin_heros", fakeHeroSections);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formLang, setFormLang] = useState("en");
  const [form, setForm] = useState({ title: { az: "", en: "", ru: "" }, subtitle: { az: "", en: "", ru: "" }, image: null, active: true });

  const openAdd = () => { setEditing(null); setForm({ title: { az: "", en: "", ru: "" }, subtitle: { az: "", en: "", ru: "" }, image: null, active: true }); setModal(true); };
  const openEdit = (h) => { setEditing(h.id); setForm({ ...h }); setModal(true); };
  const onToggle = (h) => setHeros(heros.map(x => x.id === h.id ? { ...x, active: !x.active } : x));
  const onSave = () => {
    if (editing) setHeros(heros.map(x => x.id === editing ? { ...x, ...form } : x));
    else setHeros([...heros, { ...form, id: Date.now() }]);
    setModal(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">{t.heroSections}</h1>
        <Btn onClick={openAdd}><Icons.Plus />{t.addNew}</Btn>
      </div>
      <div className="grid lg:grid-cols-2 gap-4">
        {heros.map(h => (
          <Card key={h.id} className={`overflow-hidden group transition-all ${h.active ? "ring-2 ring-emerald-400" : ""}`}>
            <div className="h-36 bg-gradient-to-br from-slate-800 to-slate-600 relative flex items-center justify-center">
              <div className="text-center text-white">
                <p className="text-xl font-bold">{h.title[lang]}</p>
                <p className="text-sm text-slate-300">{h.subtitle[lang]}</p>
              </div>
              {h.active && <div className="absolute top-3 right-3 bg-emerald-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold">Active</div>}
            </div>
            <div className="p-4 flex items-center justify-between">
              <button onClick={() => onToggle(h)} className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${h.active ? "bg-red-50 text-red-600 hover:bg-red-100" : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"}`}>
                {h.active ? t.deactivate : t.activate}
              </button>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Btn size="sm" variant="secondary" onClick={() => openEdit(h)}><Icons.Edit /></Btn>
                <Btn size="sm" variant="danger" onClick={() => setHeros(heros.filter(x => x.id !== h.id))}><Icons.Trash /></Btn>
              </div>
            </div>
          </Card>
        ))}
      </div>
      <Modal open={modal} onClose={() => setModal(false)} title={editing ? t.edit : t.addNew}>
        <div className="space-y-4">
          <LangTabs lang={formLang} onChange={setFormLang} />
          <Input label={`${t.title} (${formLang.toUpperCase()})`} value={form.title[formLang]} onChange={v => setForm(f => ({ ...f, title: { ...f.title, [formLang]: v } }))} />
          <Input label={`${t.subtitle} (${formLang.toUpperCase()})`} value={form.subtitle[formLang]} onChange={v => setForm(f => ({ ...f, subtitle: { ...f.subtitle, [formLang]: v } }))} />
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-2">{t.image}</label>
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center text-gray-400 hover:border-emerald-300 transition-colors cursor-pointer">
              <div className="flex justify-center mb-2"><Icons.Image /></div>
              <p className="text-xs">Upload hero image</p>
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.active} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} className="accent-emerald-600" />
            <span className="text-sm font-medium text-gray-700">{t.active}</span>
          </label>
          <div className="flex justify-end gap-2">
            <Btn variant="secondary" onClick={() => setModal(false)}>{t.cancel}</Btn>
            <Btn onClick={onSave}><Icons.Check />{t.save}</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// Campaigns
const Campaigns = ({ t, lang }) => {
  const [camps, setCamps] = useLocalState("admin_camps", fakeCampaigns);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formLang, setFormLang] = useState("en");
  const [form, setForm] = useState({ name: { az: "", en: "", ru: "" }, discount: "", startDate: "", endDate: "", active: true });

  const openAdd = () => { setEditing(null); setForm({ name: { az: "", en: "", ru: "" }, discount: "", startDate: "", endDate: "", active: true }); setModal(true); };
  const openEdit = (c) => { setEditing(c.id); setForm({ ...c }); setModal(true); };
  const onToggle = (c) => setCamps(camps.map(x => x.id === c.id ? { ...x, active: !x.active } : x));
  const onSave = () => {
    if (editing) setCamps(camps.map(x => x.id === editing ? { ...x, ...form } : x));
    else setCamps([...camps, { ...form, id: Date.now() }]);
    setModal(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">{t.campaigns}</h1>
        <Btn onClick={openAdd}><Icons.Plus />{t.addNew}</Btn>
      </div>
      <Card>
        <Table
          columns={[
            { key: "name", label: t.name, render: r => <span className="font-semibold text-gray-800">{r.name[lang]}</span> },
            { key: "discount", label: t.discount, render: r => (
              <span className="bg-amber-100 text-amber-700 px-2.5 py-0.5 rounded-full text-xs font-bold">{r.discount}% OFF</span>
            )},
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
          onDelete={(c) => setCamps(camps.filter(x => x.id !== c.id))}
        />
      </Card>
      <Modal open={modal} onClose={() => setModal(false)} title={editing ? t.edit : t.addNew}>
        <div className="space-y-4">
          <LangTabs lang={formLang} onChange={setFormLang} />
          <Input label={`${t.name} (${formLang.toUpperCase()})`} value={form.name[formLang]} onChange={v => setForm(f => ({ ...f, name: { ...f.name, [formLang]: v } }))} />
          <Input label={`${t.discount} %`} value={form.discount} onChange={v => setForm(f => ({ ...f, discount: v }))} type="number" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Start Date" value={form.startDate} onChange={v => setForm(f => ({ ...f, startDate: v }))} type="date" />
            <Input label="End Date" value={form.endDate} onChange={v => setForm(f => ({ ...f, endDate: v }))} type="date" />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.active} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} className="accent-emerald-600" />
            <span className="text-sm font-medium text-gray-700">{t.active}</span>
          </label>
          <div className="flex justify-end gap-2">
            <Btn variant="secondary" onClick={() => setModal(false)}>{t.cancel}</Btn>
            <Btn onClick={onSave}><Icons.Check />{t.save}</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// Discount Codes
const DiscountCodes = ({ t }) => {
  const [codes, setCodes] = useLocalState("admin_codes", fakeDiscountCodes);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ code: "", type: "percent", value: "", limit: "", expiration: "", active: true });

  const openAdd = () => { setEditing(null); setForm({ code: "", type: "percent", value: "", limit: "", expiration: "", active: true }); setModal(true); };
  const openEdit = (c) => { setEditing(c.id); setForm({ ...c }); setModal(true); };
  const onToggle = (c) => setCodes(codes.map(x => x.id === c.id ? { ...x, active: !x.active } : x));
  const onSave = () => {
    if (editing) setCodes(codes.map(x => x.id === editing ? { ...x, ...form } : x));
    else setCodes([...codes, { ...form, id: Date.now(), usageCount: 0 }]);
    setModal(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">{t.discountCodes}</h1>
        <Btn onClick={openAdd}><Icons.Plus />{t.addNew}</Btn>
      </div>
      <Card>
        <Table
          columns={[
            { key: "code", label: t.code, render: r => (
              <span className="font-mono font-bold text-sm bg-emerald-50 text-emerald-700 px-3 py-1 rounded-lg border border-emerald-200">{r.code}</span>
            )},
            { key: "type", label: t.type, render: r => (
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${r.type === "percent" ? "bg-blue-50 text-blue-700" : "bg-purple-50 text-purple-700"}`}>
                {r.type === "percent" ? t.percent : t.fixed}
              </span>
            )},
            { key: "value", label: t.value, render: r => (
              <span className="font-bold text-gray-800">{r.type === "percent" ? `${r.value}%` : `$${r.value}`}</span>
            )},
            { key: "usageCount", label: t.usageCount, render: r => (
              <div className="flex items-center gap-2">
                <div className="w-16 h-1.5 bg-gray-100 rounded-full">
                  <div className="h-1.5 bg-emerald-500 rounded-full" style={{ width: `${Math.min((r.usageCount / r.limit) * 100, 100)}%` }} />
                </div>
                <span className="text-xs text-gray-500">{r.usageCount}/{r.limit}</span>
              </div>
            )},
            { key: "expiration", label: "Expires", render: r => <span className="text-xs text-gray-500">{r.expiration}</span> },
            { key: "active", label: t.status, render: r => (
              <button onClick={() => onToggle(r)} className={`px-2.5 py-0.5 rounded-full text-xs font-semibold transition-colors ${r.active ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                {r.active ? t.active : t.inactive}
              </button>
            )},
          ]}
          data={codes}
          onEdit={openEdit}
          onDelete={(c) => setCodes(codes.filter(x => x.id !== c.id))}
        />
      </Card>
      <Modal open={modal} onClose={() => setModal(false)} title={editing ? t.edit : t.addNew}>
        <div className="space-y-4">
          <Input label={t.code} value={form.code} onChange={v => setForm(f => ({ ...f, code: v.toUpperCase() }))} placeholder="SAVE20" />
          <Select label={t.type} value={form.type} onChange={v => setForm(f => ({ ...f, type: v }))}
            options={[{ value: "percent", label: t.percent }, { value: "fixed", label: t.fixed }]} />
          <div className="grid grid-cols-2 gap-4">
            <Input label={`${t.value} (${form.type === "percent" ? "%" : "$"})`} value={form.value} onChange={v => setForm(f => ({ ...f, value: v }))} type="number" />
            <Input label={t.limit} value={form.limit} onChange={v => setForm(f => ({ ...f, limit: v }))} type="number" />
          </div>
          <Input label="Expiration Date" value={form.expiration} onChange={v => setForm(f => ({ ...f, expiration: v }))} type="date" />
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.active} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} className="accent-emerald-600" />
            <span className="text-sm font-medium text-gray-700">{t.active}</span>
          </label>
          <div className="flex justify-end gap-2">
            <Btn variant="secondary" onClick={() => setModal(false)}>{t.cancel}</Btn>
            <Btn onClick={onSave}><Icons.Check />{t.save}</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// ─── Sidebar ──────────────────────────────────────────────────────────────────
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
    {/* Logo */}
    <div className={`flex items-center gap-3 px-4 py-5 border-b border-white/10`}>
      <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center flex-shrink-0">
        <Icons.Layers />
      </div>
      {!collapsed && <span className="font-bold text-white text-base tracking-wide">FurniAdmin</span>}
      <button onClick={() => setCollapsed(!collapsed)} className="ml-auto text-white/40 hover:text-white transition-colors">
        {collapsed ? <Icons.ChevronRight /> : <Icons.ChevronLeft />}
      </button>
    </div>

    {/* Nav */}
    <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto">
      {NAV.map(item => {
        const active = page === item.key;
        return (
          <button key={item.key} onClick={() => setPage(item.key)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group text-left
              ${active ? "bg-white text-[#1a3a2a] shadow-sm" : "text-white/60 hover:bg-white/10 hover:text-white"}`}>
            <div className={`flex-shrink-0 ${active ? "text-emerald-700" : "text-white/50 group-hover:text-white"}`}>
              {item.icon}
            </div>
            {!collapsed && (
              <span className={`text-sm font-medium truncate ${active ? "text-[#1a3a2a] font-semibold" : ""}`}>
                {t[item.label]}
              </span>
            )}
            {!collapsed && active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-600 flex-shrink-0" />}
          </button>
        );
      })}
    </nav>

    {/* Logout */}
    <div className="p-3 border-t border-white/10">
      <button className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-all`}>
        <Icons.LogOut />
        {!collapsed && <span className="text-sm font-medium">{t.logout}</span>}
      </button>
    </div>
  </aside>
);

// ─── Header ───────────────────────────────────────────────────────────────────
const Header = ({ t, lang, setLang, page }) => {
  const pageLabel = NAV.find(n => n.key === page)?.label || "dashboard";
  return (
    <header className="h-14 bg-white border-b border-gray-100 flex items-center px-5 gap-4 flex-shrink-0">
      <div className="flex-1">
        <h2 className="text-sm font-bold text-gray-700">{t[pageLabel]}</h2>
      </div>

      {/* Search */}
      <div className="relative hidden md:block">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4"><Icons.Search /></div>
        <input placeholder={t.search}
          className="pl-8 pr-4 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-lg w-52 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:w-64 transition-all" />
      </div>

      {/* Lang switcher */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
        {["az", "en", "ru"].map(l => (
          <button key={l} onClick={() => setLang(l)}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${lang === l ? "bg-white shadow text-emerald-700" : "text-gray-500 hover:text-gray-700"}`}>
            {l.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Bell */}
      <div className="relative">
        <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors">
          <Icons.Bell />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>
      </div>

      {/* Admin Avatar */}
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