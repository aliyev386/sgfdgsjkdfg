import { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectLang, setLang as setReduxLang } from "../../store/slices/langSlice";
import { selectIsAuth, logoutAction } from "../../store/slices/authSlice";
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
    actionsCol: "Əməliyyatlar", revenueOverview: "Gəlir Xülasəsi (Son 6 ay)",
    recentOrders: "Son Sifarişlər", orderId: "Sifariş", customer: "Müştəri",
    addressCol: "Ünvan", amount: "Məbləğ", allStatuses: "Bütün statuslar",
    statusPending: "Gözlənilir", statusConfirmed: "Təsdiqləndi",
    statusInProgress: "Hazırlanır", statusDelivered: "Çatdırıldı",
    statusCancelled: "Ləğv edildi", resetFilter: "Sıfırla",
    orderCount: "sifariş", items: "əşya", showingEntries: "Göstərilir",
    specialOrder: "XÜSUSİ", customerInfo: "Müştəri Məlumatları",
    fullName: "Ad Soyad", phone: "Telefon", email: "E-poçt",
    deliveryAddress: "Çatdırılma ünvanı", specialOrderNote: "Xüsusi Sifariş Tələbi",
    paymentSection: "Ödəniş", totalAmount: "Ümumi məbləğ",
    initialPayment: "İlkin ödəniş", creditPeriod: "Kredit müddəti",
    monthly: "Aylıq", productsSection: "Məhsullar", statusControl: "Status İdarəsi",
    currentStatus: "Cari", cancelOrder: "Ləğv et",
    adminNote: "Admin Qeydi (müştəriyə göstərilir)",
    adminNotePh: "məs: Çatdırılma 14:00-da olacaq...",
    estimatedDate: "Razılaşdırılmış Çatdırılma Tarixi",
    saveNoteDate: "Qeydi & Tarixi Saxla", saving2: "Saxlanılır...",
    expiration: "Bitmə tarixi", startDate: "Başlanğıc tarixi",
    endDate: "Bitmə tarixi", advanceTo: "→",
    nameIn3Langs: "Ad (3 dildə məcburidir)", nameOptional: "Ad (3 dildə)",
    dimensions: "Ölçülər (sm / kq)", discountPrice: "Endirimli qiymət (₼)",
    featured: "Öne çıxarılsın (Featured)", addColor: "Rəng əlavə et",
    addImage: "Şəkil əlavə et", mainImage: "Əsas",
    widthCm: "En (sm)", heightCm: "Hündürlük (sm)", depthCm: "Dərinlik (sm)", weightKg: "Çəki (kq)",
    hexPrompt: "Hex rəng kodu (məs: #FF0000 və ya FF0000)", colorNamePrompt: "Rəng adı (məs: Qırmızı)",
    hexError: "Yanlış hex format! Nümunə: #FF0000", select: "Seçin", selected: "seçilib",
    atLeast1Image: "Ən azı 1 şəkil əlavə edin", atLeast1Color: "Ən azı 1 rəng əlavə edin",
    productsLoading: "Məhsullar yüklənir...", selectCategory: "Kateqoriya seçin", displayOrder: "Göstərilmə sırası",
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
    actionsCol: "Actions", revenueOverview: "Revenue Overview (Last 6 months)",
    recentOrders: "Recent Orders", orderId: "Order", customer: "Customer",
    addressCol: "Address", amount: "Amount", allStatuses: "All statuses",
    statusPending: "Pending", statusConfirmed: "Confirmed",
    statusInProgress: "In Progress", statusDelivered: "Delivered",
    statusCancelled: "Cancelled", resetFilter: "Reset",
    orderCount: "orders", items: "items", showingEntries: "Showing",
    specialOrder: "SPECIAL", customerInfo: "Customer Information",
    fullName: "Full Name", phone: "Phone", email: "Email",
    deliveryAddress: "Delivery address", specialOrderNote: "Special Order Request",
    paymentSection: "Payment", totalAmount: "Total amount",
    initialPayment: "Initial payment", creditPeriod: "Credit period",
    monthly: "Monthly", productsSection: "Products", statusControl: "Status Management",
    currentStatus: "Current", cancelOrder: "Cancel",
    adminNote: "Admin Note (shown to customer)",
    adminNotePh: "e.g. Delivery at 14:00, we will call you...",
    estimatedDate: "Agreed Delivery Date",
    saveNoteDate: "Save Note & Date", saving2: "Saving...",
    expiration: "Expiration date", startDate: "Start date",
    endDate: "End date", advanceTo: "→",
    nameIn3Langs: "Name (required in all 3 languages)", nameOptional: "Name (3 languages)",
    dimensions: "Dimensions (cm / kg)", discountPrice: "Discounted price (₼)",
    featured: "Feature this product", addColor: "Add color",
    addImage: "Add image", mainImage: "Main",
    widthCm: "Width (cm)", heightCm: "Height (cm)", depthCm: "Depth (cm)", weightKg: "Weight (kg)",
    hexPrompt: "Hex color code (e.g. #FF0000 or FF0000)", colorNamePrompt: "Color name (e.g. Red)",
    hexError: "Invalid hex format! Example: #FF0000", select: "Select", selected: "selected",
    atLeast1Image: "Add at least 1 image", atLeast1Color: "Add at least 1 color",
    productsLoading: "Loading products...", selectCategory: "Select category", displayOrder: "Display order",
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
    actionsCol: "Действия", revenueOverview: "Обзор выручки (последние 6 мес.)",
    recentOrders: "Последние заказы", orderId: "Заказ", customer: "Клиент",
    addressCol: "Адрес", amount: "Сумма", allStatuses: "Все статусы",
    statusPending: "Ожидает", statusConfirmed: "Подтверждён",
    statusInProgress: "В обработке", statusDelivered: "Доставлен",
    statusCancelled: "Отменён", resetFilter: "Сбросить",
    orderCount: "заказов", items: "товаров", showingEntries: "Показано",
    specialOrder: "ОСОБЫЙ", customerInfo: "Данные клиента",
    fullName: "Имя и фамилия", phone: "Телефон", email: "Эл. почта",
    deliveryAddress: "Адрес доставки", specialOrderNote: "Запрос особого заказа",
    paymentSection: "Оплата", totalAmount: "Общая сумма",
    initialPayment: "Первоначальный взнос", creditPeriod: "Срок кредита",
    monthly: "Ежемесячно", productsSection: "Товары", statusControl: "Управление статусом",
    currentStatus: "Текущий", cancelOrder: "Отменить",
    adminNote: "Заметка администратора (видна клиенту)",
    adminNotePh: "напр.: Доставка в 14:00, мы вам позвоним...",
    estimatedDate: "Согласованная дата доставки",
    saveNoteDate: "Сохранить заметку и дату", saving2: "Сохранение...",
    expiration: "Дата истечения", startDate: "Дата начала",
    endDate: "Дата окончания", advanceTo: "→",
    nameIn3Langs: "Название (обязательно на 3 языках)", nameOptional: "Название (3 языка)",
    dimensions: "Размеры (см / кг)", discountPrice: "Цена со скидкой (₼)",
    featured: "Рекомендуемый товар", addColor: "Добавить цвет",
    addImage: "Добавить фото", mainImage: "Главное",
    widthCm: "Ширина (см)", heightCm: "Высота (см)", depthCm: "Глубина (см)", weightKg: "Вес (кг)",
    hexPrompt: "Hex код цвета (напр. #FF0000 или FF0000)", colorNamePrompt: "Название цвета (напр. Красный)",
    hexError: "Неверный hex формат! Пример: #FF0000", select: "Выбрать", selected: "выбрано",
    atLeast1Image: "Добавьте хотя бы 1 фото", atLeast1Color: "Добавьте хотя бы 1 цвет",
    productsLoading: "Загрузка товаров...", selectCategory: "Выберите категорию", displayOrder: "Порядок отображения",
  },
};

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

const Table = ({ columns, data, onEdit, onDelete, onView, extraActions, loading, t }) => (
  <div className="overflow-x-auto">
    {loading ? (
      <div className="flex items-center justify-center py-16 text-gray-400">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">{t?.loading || "Yüklənir..."}</span>
        </div>
      </div>
    ) : data.length === 0 ? (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <Icons.Package />
        <p className="text-sm mt-2">{t?.noData || "Məlumat yoxdur"}</p>
      </div>
    ) : (
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            {columns.map(c => (
              <th key={c.key} className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">{c.label}</th>
            ))}
            {(onEdit || onDelete || onView || extraActions) && (
              <th className="text-right px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">{t?.actionsCol || "Əməliyyatlar"}</th>
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

const Pagination = ({ total, page, perPage, onChange, t }) => {
  const totalPages = Math.ceil(total / perPage);
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 text-sm text-gray-500">
      <span>{t?.showingEntries || "Göstərilir"} {Math.min((page - 1) * perPage + 1, total)}–{Math.min(page * perPage, total)} / {total}</span>
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
            {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}%
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

const ImageUpload = ({ value, onChange, label, uploadFn, t }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadError("");
    if (!uploadFn) { onChange(URL.createObjectURL(file)); return; }
    setUploading(true);
    try {
      const res = await uploadFn(file);
      const url = res?.url || res?.data?.url || (typeof res === "string" ? res : null);
      if (url) {
        onChange(url);
      } else {
        setUploadError(t?.error || "Şəkil URL-i alınamadı");
      }
    } catch (err) {
      setUploadError(err?.userMessage || err?.message || t?.error || "Xəta baş verdi");
    } finally {
      setUploading(false);
      e.target.value = "";
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
      {uploadError && <p className="text-xs text-red-500 mt-1">⚠ {uploadError}</p>}
    </div>
  );
};

const MultiImageUpload = ({ images, onChange, label, uploadFn, t }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    setUploadError("");
    try {
      const uploaded = [];
      for (const file of files) {
        if (uploadFn) {
          const res = await uploadFn(file);
          const url = res?.url || res?.data?.url || (typeof res === "string" ? res : null);
          if (url) {
            uploaded.push(url);
          } else {
            setUploadError(t?.error || "Şəkil URL-i alınamadı.");
          }
        } else {
          uploaded.push(URL.createObjectURL(file));
        }
      }
      if (uploaded.length > 0) onChange([...images, ...uploaded]);
    } catch (err) {
      const msg = err?.userMessage || err?.message || t?.error || "Xəta baş verdi";
      setUploadError(msg);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const removeImage = (idx) => onChange(images.filter((_, i) => i !== idx));

  return (
    <div>
      {label && <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1.5">{label}</label>}
      <div className="flex flex-wrap gap-2 mb-2">
        {images.map((url, idx) => (
          <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden border-2 border-emerald-300 group">
            <img src={url} alt="" className="w-full h-full object-cover" />
            {idx === 0 && (
              <span className="absolute top-0.5 left-0.5 bg-emerald-600 text-white text-[9px] px-1 rounded font-bold">{t?.mainImage || "Ana"}</span>
            )}
            <button
              type="button"
              onClick={() => removeImage(idx)}
              className="absolute top-0.5 right-0.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold"
            >×</button>
          </div>
        ))}
        <label className={`w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-emerald-400 transition-colors ${uploading ? "opacity-60 cursor-not-allowed" : ""}`}>
          <input type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} disabled={uploading} />
          {uploading ? (
            <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Icons.Upload />
              <span className="text-[9px] text-gray-400 mt-1 text-center px-1">{t?.addImage || "Şəkil əlavə et"}</span>
            </>
          )}
        </label>
      </div>
      {uploadError && <p className="text-xs text-red-500 mb-1">⚠ {uploadError}</p>}
      {images.length === 0 && (
        <p className="text-xs text-amber-600">⚠ {t?.atLeast1Image || "Ən azı 1 şəkil əlavə edin"}</p>
      )}
    </div>
  );
};

const useAdminData = (fetchFn, deps = []) => {
  const [data,    setData]    = useState([]);
  const [total,   setTotal]   = useState(0);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const load = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchFn(params);
      if (Array.isArray(res)) {
        setData(res); setTotal(res.length);
      } else {
        const arr = res?.data || res?.items || res?.results || [];
        setData(Array.isArray(arr) ? arr : []);
        setTotal(res?.total ?? res?.pagination?.totalCount ?? (Array.isArray(arr) ? arr.length : 0));
      }
    } catch (err) {
      const msg = err?.validationErrors
        ? Object.values(err.validationErrors).flat().join("; ")
        : err?.userMessage || "Xəta baş verdi";
      setError(msg);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, deps);

  useEffect(() => { load(); }, [load]);

  return { data, setData, total, setTotal, loading, error, reload: load };
};

const validateRequired = (val) => !val || (typeof val === "string" && val.trim() === "");
const validateLangField = (obj) => !obj?.az?.trim();

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
        const orders = await orderApi.getAll({ page: 1, limit: 5 });
        setRecentOrders(Array.isArray(orders) ? orders.slice(0, 5) : (orders.data || []).slice(0, 5));
      } catch {
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
            <h2 className="text-sm font-bold text-gray-700 mb-4">{t.revenueOverview}</h2>
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
            <h2 className="text-sm font-bold text-gray-700">{t.recentOrders}</h2>
          </div>
          <Table
            t={t}
            columns={[
              { key: "id", label: t.orderId, render: r => <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">#{r.id}</span> },
              { key: "user", label: t.user, render: r => typeof r.user === "object" ? `${r.user.name || r.user.firstName || ""} ${r.user.surname || r.user.lastName || ""}`.trim() : r.user },
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

  const emptyForm = { 
    name: { az: "", en: "", ru: "" }, 
    description: { az: "", en: "", ru: "" }, 
    price: "", 
    stock: "", 
    category_id: "", 
    material: "", 
    label: "", 
    width: "", 
    height: "", 
    depth: "", 
    weight: "", 
    colors: [], 
    images: [],
    is_featured: false,
    discount_price: "",
  };  const [form, setForm] = useState(emptyForm);

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
    if (!form.name?.az?.trim()) e.name_az = t.required;
    if (!form.name?.en?.trim()) e.name_en = t.required;
    if (!form.name?.ru?.trim()) e.name_ru = t.required;
    if (!form.price || Number(form.price) <= 0) e.price = t.invalidPrice;
    if (form.stock === "" || Number(form.stock) < 0) e.stock = t.invalidStock;
    if (!form.category_id) e.category_id = t.required;
    if (!form.images || form.images.length === 0) e.images = t.atLeast1Image;
    if (!form.colors || form.colors.length === 0) e.colors = t.atLeast1Color;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const openAdd = () => { setEditing(null); setForm(emptyForm); setErrors({}); setModal(true); };
  const openEdit = async (p) => {
    // Bütün dilləri almaq üçün getById çağırırıq
    let fullProduct = p;
    try {
      fullProduct = await productApi.getById(p.id) || p;
    } catch {
      fullProduct = p;
    }
    setEditing(fullProduct.id || p.id);

    const getLangField = (field) => {
      const langs = { az: "", en: "", ru: "" };
      if (fullProduct.translations && Array.isArray(fullProduct.translations)) {
        fullProduct.translations.forEach(t => {
          if (t.lang && langs.hasOwnProperty(t.lang)) {
            langs[t.lang] = t[field] || "";
          }
        });
      } else if (fullProduct[field]) {
        const val = fullProduct[field];
        if (typeof val === "object") return { az: val.az || "", en: val.en || "", ru: val.ru || "" };
        return { az: val, en: val, ru: val };
      }
      return langs;
    };

    const imgUrls = (fullProduct.images || []).map(img =>
      typeof img === "string" ? img : img?.imageUrl || img?.url || ""
    ).filter(Boolean);
    const clrs = (fullProduct.colors || []).map(c => ({
      name:   c.name   || "",
      hex:    c.hexCode || c.hex || "#000000",
      images: (c.images || []).map(img =>
        typeof img === "string" ? img : img.imageUrl || img.url || ""
      ).filter(Boolean),
    }));
    setForm({
      name:        getLangField("name"),
      description: getLangField("description"),
      price:       fullProduct.price ?? "",
      stock:       fullProduct.stock ?? "",
      category_id: fullProduct.furnitureCategoryId || fullProduct.category_id || fullProduct.category?.id || "",
      material:    fullProduct.material || "",
      label:       fullProduct.label || "",
      width:       fullProduct.width ?? "",
      height:      fullProduct.height ?? "",
      depth:       fullProduct.depth ?? "",
      weight:      fullProduct.weight ?? "",
      colors:        clrs,
      images:        imgUrls,
      is_featured:   fullProduct.isFeatured || false,
      discount_price: fullProduct.discountPrice ?? "",
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
        category_id: Number(form.category_id) || undefined,
        discount_price: form.discount_price ? Number(form.discount_price) : null,
        is_featured: form.is_featured || false,
      };
      if (editing) await productApi.update(editing, payload);
      else await productApi.create(payload);
      setToast({ message: t.successSaved, type: "success" });
      setModal(false);
      reload({ page, limit: PER_PAGE, search });
    } catch (err) {
      if (err?.validationErrors) {
        const mapped = {};
        Object.entries(err.validationErrors).forEach(([field, msgs]) => {
          mapped[field] = Array.isArray(msgs) ? msgs[0] : msgs;
        });
        setErrors(prev => ({ ...prev, ...mapped }));
      }
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
          <span className="text-xs text-gray-500">{total} {t.items}</span>
        </div>
        <Table
          t={t}
          loading={loading}
          columns={[
            { key: "name", label: t.name, render: r => (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 overflow-hidden flex-shrink-0">
                  {(() => {
                    const img = r.images?.[0];
                    const src = typeof img === "string" ? img : img?.imageUrl || img?.url;
                    return src ? <img src={src} alt="" className="w-full h-full object-cover" /> : <Icons.Package />;
                  })()}
                </div>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{typeof r.name === "object" ? r.name[lang] : r.name}</p>
                  <p className="text-xs text-gray-400">{r.categoryName || (typeof r.category === "object" ? r.category?.name?.[lang] : r.category) || ""}</p>
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
                <div key={i} className="w-5 h-5 rounded-full border-2 border-white shadow-sm" style={{ background: c.hexCode || c.hex }} title={c.name} />
              ))}</div>
            )},
          ]}
          data={products}
          onEdit={openEdit}
          onDelete={onDelete}
        />
        <Pagination t={t} total={total} page={page} perPage={PER_PAGE} onChange={setPage} />
      </Card>

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? t.editProduct : t.addProduct} width="max-w-3xl">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-2">{t.nameIn3Langs}</label>
            <div className="grid grid-cols-3 gap-3">
              <Input label="AZ *" value={form.name.az} onChange={v => setLangField("name", "az", v)} error={errors.name_az} />
              <Input label="EN *" value={form.name.en} onChange={v => setLangField("name", "en", v)} error={errors.name_en} />
              <Input label="RU *" value={form.name.ru} onChange={v => setLangField("name", "ru", v)} error={errors.name_ru} />
            </div>
          </div>

          <div>
            <LangTabs lang={formLang} onChange={setFormLang} />
            <Textarea label={`${t.description} (${formLang.toUpperCase()})`} value={form.description[formLang]}
              onChange={v => setLangField("description", formLang, v)} />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Input label={t.price + " *"} value={form.price} onChange={v => setField("price", v)} type="number" error={errors.price} />
            <Input label={t.stock + " *"} value={form.stock} onChange={v => setField("stock", v)} type="number" error={errors.stock} />
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1.5">{t.category} *</label>
              <select value={form.category_id} onChange={e => setField("category_id", e.target.value)}
                className={`w-full px-3 py-2 text-sm bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 ${errors.category_id ? "border-red-400 bg-red-50" : "border-gray-200"}`}>
                <option value="">— {t.select || "Seçin"} —</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{typeof c.name === "object" ? c.name[lang] : c.name}</option>
                ))}
              </select>
              {errors.category_id && <p className="text-xs text-red-500 mt-1">{errors.category_id}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Material" value={form.material || ""} onChange={v => setField("material", v)} placeholder="Wood, Fabric..." />
            <Input label="Label" value={form.label || ""} onChange={v => setField("label", v)} placeholder="NEW, HOT, SALE..." />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label={t.discountPrice} value={form.discount_price || ""} onChange={v => setField("discount_price", v)} type="number" placeholder="0.00" />
            <div className="flex items-center gap-3 pt-5">
              <input
                id="is_featured"
                type="checkbox"
                checked={form.is_featured || false}
                onChange={e => setField("is_featured", e.target.checked)}
                className="w-4 h-4 accent-emerald-600 cursor-pointer"
              />
              <label htmlFor="is_featured" className="text-sm font-medium text-gray-700 cursor-pointer">
                ⭐ {t.featured}
              </label>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-2">{t.dimensions}</label>
            <div className="grid grid-cols-4 gap-3">
              <Input label={t.widthCm || "En (cm)"} value={form.width || ""} onChange={v => setField("width", v)} type="number" placeholder="0" />
              <Input label={t.heightCm || "Hündürlük"} value={form.height || ""} onChange={v => setField("height", v)} type="number" placeholder="0" />
              <Input label={t.depthCm || "Dərinlik"} value={form.depth || ""} onChange={v => setField("depth", v)} type="number" placeholder="0" />
              <Input label={t.weightKg || "Çəki (kg)"} value={form.weight || ""} onChange={v => setField("weight", v)} type="number" placeholder="0" />
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════
               RƏNGLƏR + HƏR RƏNGİN ÖZ ŞƏKİLLƏRİ
          ═══════════════════════════════════════════════════════ */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{t.colors} *</label>
              <Btn size="sm" variant="secondary" onClick={() => {
                let hex = prompt(t.hexPrompt || "Hex rəng kodu (məs: #FF0000)");
                const name = prompt(t.colorNamePrompt || "Rəng adı (məs: Qırmızı)");
                if (hex && name) {
                  hex = hex.trim();
                  if (!hex.startsWith("#")) hex = "#" + hex;
                  if (!/^#[0-9A-Fa-f]{6}$/.test(hex)) { alert("Yanlış hex format! Nümunə: #FF0000"); return; }
                  setField("colors", [...form.colors, { hex, name, images: [] }]);
                }
              }} type="button"><Icons.Plus />{t.addColor}</Btn>
            </div>

            {form.colors.length === 0 && (
              <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 text-sm">
                Hələ rəng yoxdur. "Rəng əlavə et" düyməsini basın.
              </div>
            )}

            {form.colors.map((color, ci) => (
              <div key={ci} className="border border-gray-200 rounded-xl overflow-hidden">
                {/* Rəng başlığı */}
                <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border-b border-gray-200">
                  <div className="w-7 h-7 rounded-full border-2 border-white shadow-sm flex-shrink-0"
                       style={{ background: color.hex || color.hexCode || "#ccc" }} />
                  <span className="font-semibold text-gray-800 text-sm flex-1">{color.name}</span>
                  <span className="text-xs text-gray-400 font-mono">{color.hex || color.hexCode}</span>
                  <button type="button"
                    onClick={() => setField("colors", form.colors.filter((_, j) => j !== ci))}
                    className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <Icons.X />
                  </button>
                </div>

                {/* Bu rəngin şəkilləri */}
                <div className="p-4">
                  <p className="text-xs text-gray-500 mb-3">
                    Bu rəngin şəkilləri — <strong>ilk şəkil əsas şəkil</strong> olacaq (müştəri bu rəngi seçəndə görünür)
                  </p>
                  <MultiImageUpload
                    label=""
                    images={color.images || []}
                    onChange={urls => {
                      const updated = [...form.colors];
                      updated[ci] = { ...updated[ci], images: urls };
                      setField("colors", updated);
                    }}
                    uploadFn={productApi.uploadImage}
                    t={t}
                  />
                  {(!color.images || color.images.length === 0) && (
                    <p className="text-xs text-amber-500 mt-2">
                      ⚠️ Şəkil əlavə etməsəniz məhsulun ümumi şəkilləri göstəriləcək
                    </p>
                  )}
                </div>
              </div>
            ))}

            {errors.colors && <p className="text-xs text-red-500">{errors.colors}</p>}
          </div>

          <MultiImageUpload
            label={`${t.images} * (ilk şəkil əsas şəkil olacaq)`}
            images={form.images || []}
            onChange={urls => setField("images", urls)}
            uploadFn={productApi.uploadImage}
            t={t}
          />
          {errors.images && <p className="text-xs text-red-500">{errors.images}</p>}

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
  const openEdit = (c) => {
    const normName = (val) => {
      if (!val) return { az: "", en: "", ru: "" };
      if (typeof val === "object") return { az: val.az || "", en: val.en || "", ru: val.ru || "" };
      return { az: val, en: val, ru: val };
    };
    setEditing(c.id);
    setForm({ name: normName(c.name), image: c.imageUrl || c.image || null });
    setErrors({});
    setModal(true);
  };

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
      if (err?.validationErrors) {
        const mapped = {};
        Object.entries(err.validationErrors).forEach(([field, msgs]) => {
          mapped[field] = Array.isArray(msgs) ? msgs[0] : msgs;
        });
        setErrors(prev => ({ ...prev, ...mapped }));
      }
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
                {(c.imageUrl || c.image) ? <img src={c.imageUrl || c.image} alt="" className="w-full h-full object-cover" /> : <div className="text-emerald-400"><Icons.Grid /></div>}
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
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-2">Ad (3 dildə)</label>
            <div className="grid grid-cols-3 gap-3">
              <Input label="AZ *" value={form.name.az || ""} onChange={v => setForm(f => ({ ...f, name: { ...f.name, az: v } }))} required error={errors.name} />
              <Input label="EN" value={form.name.en || ""} onChange={v => setForm(f => ({ ...f, name: { ...f.name, en: v } }))} />
              <Input label="RU" value={form.name.ru || ""} onChange={v => setForm(f => ({ ...f, name: { ...f.name, ru: v } }))} />
            </div>
          </div>
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

const Collections = ({ t, lang }) => {
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);

  const emptyForm = {
    name: { az: "", en: "", ru: "" },
    description: { az: "", en: "", ru: "" },
    price: "",
    discount_price: "",
    display_order: 0,
    collection_category_id: "",
    product_ids: [],
    image: null,
  };
  const [form, setForm] = useState(emptyForm);

  const { data: colls, loading, reload } = useAdminData(() => collectionApi.getAll());

  useEffect(() => {
    productApi.getAll({ limit: 200 }).then(res => {
      const arr = Array.isArray(res) ? res : (res?.data ?? res?.items ?? []);
      setAvailableProducts(arr);
    }).catch(() => {});

    collectionCategoryApi.getAll().then(res => {
      const arr = Array.isArray(res) ? res : (res?.data ?? []);
      setAvailableCategories(arr);
    }).catch(() => {});
  }, []);

  const validate = () => {
    const e = {};
    if (!form.name.az?.trim() && !form.name.en?.trim() && !form.name.ru?.trim()) e.name = t.required;
    if (!form.price || Number(form.price) <= 0) e.price = t.invalidPrice || "Qiymət lazımdır";
    if (!form.collection_category_id) e.collection_category_id = t.required;
    if (!form.product_ids || form.product_ids.length === 0) e.product_ids = t.required;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const openAdd = () => { setEditing(null); setForm(emptyForm); setErrors({}); setModal(true); };
  const openEdit = (c) => {
    const getLangField = (field) => {
      const langs = { az: "", en: "", ru: "" };
      if (c.translations && Array.isArray(c.translations)) {
        c.translations.forEach(tr => {
          if (tr.lang && Object.prototype.hasOwnProperty.call(langs, tr.lang)) {
            langs[tr.lang] = tr[field] || "";
          }
        });
        return langs;
      }
      const val = c[field];
      if (!val) return langs;
      if (typeof val === "object") return { az: val.az || "", en: val.en || "", ru: val.ru || "" };
      return { az: val, en: val, ru: val };
    };
    setEditing(c.id);
    setForm({
      name:                   getLangField("name"),
      description:            getLangField("description"),
      price:                  c.totalPrice ?? c.price ?? "",
      discount_price:         c.discountPrice ?? "",
      display_order:          c.displayOrder ?? 0,
      collection_category_id: c.collectionCategoryId ?? "",
      product_ids:            c.products?.map(p => p.id ?? p) || [],
      image:                  c.imagesUrl || c.imageUrl || c.image || null,
    });
    setErrors({});
    setModal(true);
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
      if (editing) await collectionApi.update(editing, form);
      else await collectionApi.create(form);
      setToast({ message: t.successSaved, type: "success" });
      setModal(false); reload();
    } catch (err) {
      setToast({ message: err?.userMessage || t.error, type: "error" });
    } finally { setSaving(false); }
  };

  const toggleProduct = (pid) => setForm(f => ({
    ...f, product_ids: f.product_ids.includes(pid) ? f.product_ids.filter(x => x !== pid) : [...f.product_ids, pid]
  }));

  const getCategoryName = (c) => {
    if (!c.translations) return c.name || "";
    const tr = c.translations.find(x => x.lang === lang) || c.translations[0];
    return tr?.name || c.name || "";
  };

  const getProductName = (p) => {
    if (p.translations) {
      const tr = p.translations.find(x => x.lang === lang) || p.translations[0];
      return tr?.name || p.name || "";
    }
    return typeof p.name === "object" ? (p.name[lang] || p.name.az || p.name.en || "") : (p.name || "");
  };

  return (
    <div className="space-y-5">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">{t.collections}</h1>
        <Btn onClick={openAdd}><Icons.Plus />{t.addCollection}</Btn>
      </div>
      <Card>
        <Table
          t={t}
          loading={loading}
          columns={[
            { key: "name", label: t.name, render: r => {
              const tr = r.translations?.find(x => x.lang === lang) || r.translations?.[0];
              const name = tr?.name || (typeof r.name === "object" ? r.name[lang] : r.name) || "";
              return <span className="font-semibold text-gray-800">{name}</span>;
            }},
            { key: "price", label: t.price, render: r => <span className="font-bold text-emerald-700">₼{Number(r.totalPrice ?? r.price ?? 0).toLocaleString()}</span> },
            { key: "products", label: t.products, render: r => <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-xs font-semibold">{r.products?.length || 0} {t.items}</span> },
          ]}
          data={colls}
          onEdit={openEdit}
          onDelete={onDelete}
        />
      </Card>
      <Modal open={modal} onClose={() => setModal(false)} title={editing ? t.edit : t.addCollection}>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-2">{t.name} * <span className="text-red-500 text-xs normal-case">(az/en/ru — ən az biri doldurulmalı)</span></label>
            <div className="grid grid-cols-3 gap-3">
              <Input label="AZ" value={form.name.az || ""} onChange={v => setForm(f => ({ ...f, name: { ...f.name, az: v } }))} error={errors.name} />
              <Input label="EN" value={form.name.en || ""} onChange={v => setForm(f => ({ ...f, name: { ...f.name, en: v } }))} />
              <Input label="RU" value={form.name.ru || ""} onChange={v => setForm(f => ({ ...f, name: { ...f.name, ru: v } }))} />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-2">{t.description}</label>
            <div className="grid grid-cols-3 gap-3">
              <Textarea label="AZ" value={form.description.az || ""} onChange={v => setForm(f => ({ ...f, description: { ...f.description, az: v } }))} rows={2} />
              <Textarea label="EN" value={form.description.en || ""} onChange={v => setForm(f => ({ ...f, description: { ...f.description, en: v } }))} rows={2} />
              <Textarea label="RU" value={form.description.ru || ""} onChange={v => setForm(f => ({ ...f, description: { ...f.description, ru: v } }))} rows={2} />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1">Kateqoriya *</label>
            <select
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 ${errors.collection_category_id ? "border-red-400" : "border-gray-300"}`}
              value={form.collection_category_id}
              onChange={e => setForm(f => ({ ...f, collection_category_id: e.target.value }))}
            >
              <option value="">— Kateqoriya seçin —</option>
              {availableCategories.map(c => (
                <option key={c.id} value={c.id}>{getCategoryName(c)}</option>
              ))}
            </select>
            {errors.collection_category_id && <p className="text-red-500 text-xs mt-1">{errors.collection_category_id}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label={`${t.price} *`} value={form.price} onChange={v => setForm(f => ({ ...f, price: v }))} type="number" error={errors.price} />
            <Input label={t.discountPrice || "Endirimli qiymət"} value={form.discount_price} onChange={v => setForm(f => ({ ...f, discount_price: v }))} type="number" />
          </div>
          <Input label={t.displayOrder || "Göstərilmə sırası"} value={form.display_order} onChange={v => setForm(f => ({ ...f, display_order: v }))} type="number" />
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-2">
              {t.selectProducts} * <span className="text-emerald-600 font-normal">({form.product_ids.length} {t.selected || "seçilib"})</span>
            </label>
            {errors.product_ids && <p className="text-red-500 text-xs mb-1">{errors.product_ids}</p>}
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-2">
              {availableProducts.length === 0 && <p className="text-gray-400 text-xs col-span-2 text-center py-4">{t.productsLoading}</p>}
              {availableProducts.map(p => (
                <label key={p.id} className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${form.product_ids?.includes(p.id) ? "border-emerald-500 bg-emerald-50" : "border-gray-200 hover:border-gray-300"}`}>
                  <input type="checkbox" checked={form.product_ids?.includes(p.id)} onChange={() => toggleProduct(p.id)} className="accent-emerald-600" />
                  <span className="text-xs font-medium text-gray-700 truncate">{getProductName(p)}</span>
                  <span className="ml-auto text-xs text-emerald-700 font-semibold flex-shrink-0">₼{p.price ?? p.totalPrice ?? ""}</span>
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
  const openEdit = (c) => {
    const normName = (val) => {
      if (!val) return { az: "", en: "", ru: "" };
      if (typeof val === "object") return { az: val.az || "", en: val.en || "", ru: val.ru || "" };
      return { az: val, en: val, ru: val };
    };
    setEditing(c.id);
    setForm({ name: normName(c.name), image: c.imageUrl || c.image || null });
    setErrors({});
    setModal(true);
  };

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
                {(c.imageUrl || c.image) ? <img src={c.imageUrl || c.image} alt="" className="w-full h-full object-cover" /> : <div className="text-purple-400"><Icons.Layers /></div>}
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
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-2">{t.name} *</label>
            <div className="grid grid-cols-3 gap-3">
              <Input label="AZ *" value={form.name.az || ""} onChange={v => setForm(f => ({ ...f, name: { ...f.name, az: v } }))} required error={errors.name} />
              <Input label="EN" value={form.name.en || ""} onChange={v => setForm(f => ({ ...f, name: { ...f.name, en: v } }))} />
              <Input label="RU" value={form.name.ru || ""} onChange={v => setForm(f => ({ ...f, name: { ...f.name, ru: v } }))} />
            </div>
          </div>
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

const ORDER_STATUS_ENUM = {
  Pending: 0, Confirmed: 1, InProgress: 2, Delivered: 3, Cancelled: 4,
  0: "Pending", 1: "Confirmed", 2: "InProgress", 3: "Delivered", 4: "Cancelled",
};
const ORDER_STATUS_LABELS = {
  Pending: "Gözlənilir", Confirmed: "Təsdiqləndi", InProgress: "Hazırlanır",
  Delivered: "Çatdırıldı", Cancelled: "Ləğv edildi",
  0: "Gözlənilir", 1: "Təsdiqləndi", 2: "Hazırlanır", 3: "Çatdırıldı", 4: "Ləğv edildi",
};
const ORDER_STATUS_COLORS = {
  Pending: "bg-amber-100 text-amber-700 border-amber-200",
  Confirmed: "bg-blue-100 text-blue-700 border-blue-200",
  InProgress: "bg-purple-100 text-purple-700 border-purple-200",
  Delivered: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Cancelled: "bg-red-100 text-red-700 border-red-200",
  0: "bg-amber-100 text-amber-700 border-amber-200",
  1: "bg-blue-100 text-blue-700 border-blue-200",
  2: "bg-purple-100 text-purple-700 border-purple-200",
  3: "bg-emerald-100 text-emerald-700 border-emerald-200",
  4: "bg-red-100 text-red-700 border-red-200",
};
const ORDER_STATUS_FLOW = [0, 1, 2, 3];

const Orders = ({ t, lang }) => {
  const [page, setPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState("all");
  const [detail, setDetail] = useState(null);
  const [advancing, setAdvancing] = useState(null);
  const [toast, setToast] = useState(null);
  const [adminNote, setAdminNote] = useState("");
  const [estimatedDate, setEstimatedDate] = useState("");
  const [saving, setSaving] = useState(false);
  const PER_PAGE = 8;

  const { data: orders, total, loading, reload } = useAdminData(
    (params) => orderApi.getAll(params), []
  );

  useEffect(() => {
    const statusParam = filterStatus === "all" ? undefined : Number(filterStatus);
    reload({ page, limit: PER_PAGE, status: statusParam });
  }, [page, filterStatus]);

  const statusStr = (s) => typeof s === "string" ? s : (ORDER_STATUS_ENUM[s] ?? "Pending");
  const statusIdx = (s) => typeof s === "number" ? s : (ORDER_STATUS_ENUM[s] ?? 0);

  const openDetail = async (row) => {
    try {
      const full = await orderApi.getById(row.id);
      setDetail(full);
      setAdminNote(full.adminNote || "");
      setEstimatedDate(full.estimatedDeliveryDate ? full.estimatedDeliveryDate.split("T")[0] : "");
    } catch {
      setDetail(row);
      setAdminNote(row.adminNote || "");
      setEstimatedDate(row.estimatedDeliveryDate ? row.estimatedDeliveryDate.split("T")[0] : "");
    }
  };

  const changeStatus = async (orderId, newStatus, note, estDate) => {
    setAdvancing(orderId);
    try {
      await orderApi.updateStatus(
        orderId,
        newStatus,
        note || null,
        estDate ? new Date(estDate).toISOString() : null
      );
      setToast({ message: t.successSaved, type: "success" });
      if (detail?.id === orderId) {
        setDetail(d => ({ ...d, status: newStatus, adminNote: note, estimatedDeliveryDate: estDate }));
      }
      reload({ page, limit: PER_PAGE, status: filterStatus === "all" ? undefined : Number(filterStatus) });
    } catch (err) {
      setToast({ message: err?.userMessage || t.error, type: "error" });
    } finally { setAdvancing(null); }
  };

  const advanceStatus = (order) => {
    const cur = statusIdx(order.status);
    const nextIdx = ORDER_STATUS_FLOW.indexOf(cur);
    if (nextIdx === -1 || nextIdx >= ORDER_STATUS_FLOW.length - 1) return;
    const next = ORDER_STATUS_FLOW[nextIdx + 1];
    changeStatus(order.id, next, null, null);
  };

  const saveAdminInfo = async () => {
    if (!detail) return;
    setSaving(true);
    await changeStatus(detail.id, statusIdx(detail.status), adminNote, estimatedDate);
    setSaving(false);
  };

  const getUserName = (r) => {
    if (r.userFullName) return r.userFullName;
    if (typeof r.user === "object") return `${r.user?.name || r.user?.firstName || ""} ${r.user?.surname || r.user?.lastName || ""}`.trim() || r.user?.email || "—";
    return r.user || "—";
  };

  const getPayLabel = (pm) => {
    const map = {
      1: "Nağd", 2: "Kart", 3: "Bank köçürməsi", 4: "Kredit", 5: "İlkin ödəniş",
      CashOnDelivery: "Nağd", Card: "Kart", BankTransfer: "Bank", Installment: "Kredit", PartialCard: "İlkin ödəniş",
    };
    return map[pm] ?? pm ?? "—";
  };

  return (
    <div className="space-y-5">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">{t.orders}</h1>
        <span className="text-sm text-gray-500">{total} {t.orderCount}</span>
      </div>

      {/* Filter */}
      <Card className="p-4 flex flex-wrap items-center gap-3">
        <Select value={filterStatus} onChange={v => { setFilterStatus(v); setPage(1); }}
          options={[
            { value: "all", label: t.allStatuses },
            { value: "0", label: t.statusPending },
            { value: "1", label: t.statusConfirmed },
            { value: "2", label: t.statusInProgress },
            { value: "3", label: t.statusDelivered },
            { value: "4", label: t.statusCancelled },
          ]}
        />
        {filterStatus !== "all" && (
          <Btn variant="ghost" size="sm" onClick={() => { setFilterStatus("all"); }}>
            <Icons.X /> {t.resetFilter}
          </Btn>
        )}
      </Card>

      {/* Table */}
      <Card>
        <Table
          t={t}
          loading={loading}
          columns={[
            { key: "id", label: t.orderId, render: r => (
              <div>
                <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">#{r.id}</span>
                {(r.isCustomOrder || r.type === 1) && (
                  <span className="ml-1.5 text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">✦ {t.specialOrder}</span>
                )}
              </div>
            )},
            { key: "user", label: t.customer, render: r => (
              <div>
                <p className="font-semibold text-gray-800 text-sm">{getUserName(r)}</p>
                {r.userPhone && <p className="text-xs text-emerald-600 font-medium">📞 {r.userPhone}</p>}
                {r.userEmail && <p className="text-xs text-gray-400">{r.userEmail}</p>}
              </div>
            )},
            { key: "note", label: t.addressCol, render: r => (
              <p className="text-xs text-gray-500 max-w-xs truncate" title={r.note}>{r.note || "—"}</p>
            )},
            { key: "totalPrice", label: t.amount, render: r => (
              <div>
                <p className="font-bold text-gray-800">₼{Number(r.totalPrice ?? r.total ?? 0).toLocaleString()}</p>
                <p className="text-xs text-gray-400">{getPayLabel(r.paymentMethod)}</p>
                {r.paidAmount && <p className="text-xs text-blue-600">{t.initialPayment}: ₼{r.paidAmount}</p>}
              </div>
            )},
            { key: "status", label: t.status, render: r => (
              <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${ORDER_STATUS_COLORS[r.status] ?? "bg-gray-100 text-gray-600 border-gray-200"}`}>
                {ORDER_STATUS_LABELS[r.status] ?? r.status}
              </span>
            )},
            { key: "createdAt", label: t.date, render: r => (
              <span className="text-gray-500 text-xs">{r.createdAt ? new Date(r.createdAt).toLocaleDateString("az-AZ") : "—"}</span>
            )},
          ]}
          data={orders}
          onView={openDetail}
          extraActions={(row) => {
            const cur = statusIdx(row.status);
            const nextIdx = ORDER_STATUS_FLOW.indexOf(cur);
            const canAdvance = nextIdx !== -1 && nextIdx < ORDER_STATUS_FLOW.length - 1;
            const nextStatus = canAdvance ? ORDER_STATUS_FLOW[nextIdx + 1] : null;
            return canAdvance ? (
              <Btn size="sm" variant="success" onClick={() => advanceStatus(row)} disabled={advancing === row.id}>
                {advancing === row.id
                  ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <Icons.ChevronRight />}
                {ORDER_STATUS_LABELS[nextStatus]}
              </Btn>
            ) : null;
          }}
        />
        <Pagination t={t} total={total} page={page} perPage={PER_PAGE} onChange={setPage} />
      </Card>

      {/* Detail Modal */}
      <Modal open={!!detail} onClose={() => setDetail(null)} title={`${t.orderId} #${detail?.id}`} width="max-w-2xl">
        {detail && (
          <div className="space-y-4">

            {/* Customer info */}
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">📋 {t.customerInfo}</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-400">{t.fullName}</p>
                  <p className="font-semibold text-gray-800">{getUserName(detail)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">{t.phone}</p>
                  <a href={`tel:${detail.userPhone}`} className="font-semibold text-emerald-600 hover:underline flex items-center gap-1">
                    📞 {detail.userPhone || "—"}
                  </a>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-gray-400">{t.email}</p>
                  <p className="font-medium text-gray-700">{detail.userEmail || "—"}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-gray-400">{t.deliveryAddress}</p>
                  <p className="font-medium text-gray-700 text-sm">{detail.note || "—"}</p>
                </div>
              </div>
            </div>

            {/* Special order */}
            {(detail.isCustomOrder || detail.type === 1) && (
              <div className="border border-amber-300 bg-amber-50 rounded-xl p-4">
                <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-2">✦ {t.specialOrderNote}</p>
                <p className="text-sm text-gray-700">{detail.customDescription || t.specialOrderNote}</p>
              </div>
            )}

            {/* Payment */}
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">💳 {t.paymentSection}</p>
              <div className="flex flex-wrap gap-4">
                <div>
                  <p className="text-xs text-gray-400">{t.payment_method || t.paymentSection}</p>
                  <p className="font-semibold text-gray-800">{getPayLabel(detail.paymentMethod)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">{t.totalAmount}</p>
                  <p className="font-bold text-emerald-700 text-lg">₼{Number(detail.totalPrice ?? 0).toFixed(2)}</p>
                </div>
                {detail.paidAmount && (
                  <div>
                    <p className="text-xs text-gray-400">{t.initialPayment}</p>
                    <p className="font-semibold text-blue-600">₼{Number(detail.paidAmount).toFixed(2)}</p>
                  </div>
                )}
                {detail.installmentMonths && (
                  <div>
                    <p className="text-xs text-gray-400">{t.creditPeriod}</p>
                    <p className="font-semibold text-gray-800">{detail.installmentMonths} {t.months || "ay"}</p>
                    {detail.monthlyPayment && <p className="text-xs text-emerald-600">{t.monthly}: ₼{Number(detail.monthlyPayment).toFixed(2)}</p>}
                  </div>
                )}
              </div>
            </div>

            {/* Products */}
            {detail.items && detail.items.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">📦 {t.productsSection}</p>
                <div className="space-y-2">
                  {detail.items.map((it, i) => (
                    <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                      {it.productImage
                        ? <img src={it.productImage} alt="" className="w-10 h-10 object-cover rounded-lg" />
                        : <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center"><Icons.Package /></div>
                      }
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 text-sm truncate">{it.productName || it.collectionName || t.products}</p>
                        <div className="flex gap-2 flex-wrap">
                          {it.selectedColor && <span className="text-xs text-gray-500">🎨 {it.selectedColor}</span>}
                          {it.selectedSize && <span className="text-xs text-gray-500">📐 {it.selectedSize}</span>}
                          <span className="text-xs text-gray-400">×{it.quantity}</span>
                        </div>
                      </div>
                      <span className="font-bold text-emerald-700 text-sm">₼{Number(it.unitPrice ?? 0).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Status management */}
            <div className="border border-gray-200 rounded-xl p-4 space-y-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">⚙️ {t.statusControl}</p>

              {/* Current status */}
              <div className="flex items-center gap-3 flex-wrap">
                <span className={`text-sm font-semibold px-3 py-1.5 rounded-full border ${ORDER_STATUS_COLORS[detail.status] ?? "bg-gray-100 text-gray-600 border-gray-200"}`}>
                  {t.currentStatus}: {ORDER_STATUS_LABELS[detail.status] ?? detail.status}
                </span>

                {/* Status change buttons */}
                <div className="flex gap-2 flex-wrap">
                  {ORDER_STATUS_FLOW.filter(s => s !== statusIdx(detail.status)).map(s => (
                    <button key={s}
                      onClick={() => changeStatus(detail.id, s, adminNote, estimatedDate)}
                      disabled={advancing === detail.id}
                      className={`text-xs font-semibold px-3 py-1.5 border rounded-full transition-colors cursor-pointer
                        ${ORDER_STATUS_COLORS[s]} hover:opacity-80 disabled:opacity-50`}>
                      → {ORDER_STATUS_LABELS[s]}
                    </button>
                  ))}
                  <button
                    onClick={() => changeStatus(detail.id, 4, adminNote, estimatedDate)}
                    disabled={advancing === detail.id || statusIdx(detail.status) === 4}
                    className="text-xs font-semibold px-3 py-1.5 border rounded-full bg-red-50 text-red-600 border-red-200 hover:bg-red-100 disabled:opacity-40 cursor-pointer">
                    ✕ {t.cancelOrder}
                  </button>
                </div>
              </div>

              {/* Admin note */}
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1.5">
                  {t.adminNote}
                </label>
                <textarea
                  value={adminNote}
                  onChange={e => setAdminNote(e.target.value)}
                  placeholder={t.adminNotePh}
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none"
                  rows={2}
                />
              </div>

              {/* Delivery date */}
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1.5">
                  {t.estimatedDate}
                </label>
                <input
                  type="date"
                  value={estimatedDate}
                  onChange={e => setEstimatedDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>

              {/* Saxla */}
              <div className="flex justify-end">
                <Btn onClick={saveAdminInfo} disabled={saving}>
                  {saving
                    ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> {t.saving2}</>
                    : <><Icons.Check /> {t.saveNoteDate}</>
                  }
                </Btn>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
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
    if (!form.title?.az?.trim()) e.title = t.required;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const openAdd = () => { setEditing(null); setForm(emptyForm); setErrors({}); setModal(true); };
  const openEdit = (h) => {
    const normalizeLang = (val) => {
      if (!val) return { az: "", en: "", ru: "" };
      if (typeof val === "object") return { az: val.az || "", en: val.en || "", ru: val.ru || "" };
      return { az: val, en: val, ru: val };
    };
    setEditing(h.id);
    setForm({
      title:    normalizeLang(h.title),
      subtitle: normalizeLang(h.subtitle),
      image:    h.imageUrl || h.image || null,
      active:   h.isActive !== undefined ? h.isActive : (h.active !== undefined ? h.active : true),
    });
    setErrors({});
    setModal(true);
  };

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
{heros?.map(h => {
  const isActive = h.isActive !== undefined ? h.isActive : h.active;
  const title = h.title?.[lang] ?? (typeof h.title === "string" ? h.title : "");
  const subtitle = h.subtitle?.[lang] ?? (typeof h.subtitle === "string" ? h.subtitle : "");

  return (
    <Card key={h.id} className={`overflow-hidden group transition-all ${isActive ? "ring-2 ring-emerald-400" : ""}`}>
      <div className="h-36 bg-gradient-to-br from-slate-800 to-slate-600 relative flex items-center justify-center overflow-hidden">
        {(h.imageUrl || h.image) && <img src={h.imageUrl || h.image} alt="" className="absolute inset-0 w-full h-full object-cover opacity-60" />}
        <div className="text-center text-white relative z-10">
          <p className="text-xl font-bold">{title}</p>
          <p className="text-sm text-slate-300">{subtitle}</p>
        </div>
        {isActive && <div className="absolute top-3 right-3 bg-emerald-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold">Active</div>}
      </div>
      <div className="p-4 flex items-center justify-between">
        <button onClick={() => onToggle(h)} className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${isActive ? "bg-red-50 text-red-600 hover:bg-red-100" : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"}`}>
          {isActive ? t.deactivate : t.activate}
        </button>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Btn size="sm" variant="secondary" onClick={() => openEdit(h)}><Icons.Edit /></Btn>
          <Btn size="sm" variant="danger" onClick={() => onDelete(h)}><Icons.Trash /></Btn>
        </div>
      </div>
    </Card>
  );
})}     </div>
      )}
      <Modal open={modal} onClose={() => setModal(false)} title={editing ? t.edit : t.addNew}>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-2">{t.title} *</label>
            <div className="grid grid-cols-3 gap-3">
              <Input label="AZ *" value={form.title.az || ""} onChange={v => setForm(f => ({ ...f, title: { ...f.title, az: v } }))} required error={errors.title} />
              <Input label="EN" value={form.title.en || ""} onChange={v => setForm(f => ({ ...f, title: { ...f.title, en: v } }))} />
              <Input label="RU" value={form.title.ru || ""} onChange={v => setForm(f => ({ ...f, title: { ...f.title, ru: v } }))} />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-2">{t.subtitle}</label>
            <div className="grid grid-cols-3 gap-3">
              <Input label="AZ" value={form.subtitle.az || ""} onChange={v => setForm(f => ({ ...f, subtitle: { ...f.subtitle, az: v } }))} />
              <Input label="EN" value={form.subtitle.en || ""} onChange={v => setForm(f => ({ ...f, subtitle: { ...f.subtitle, en: v } }))} />
              <Input label="RU" value={form.subtitle.ru || ""} onChange={v => setForm(f => ({ ...f, subtitle: { ...f.subtitle, ru: v } }))} />
            </div>
          </div>
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

// ── Campaign Rule Presets ─────────────────────────────────────────────────────
const RULE_PRESETS = [
  { key: "percent_discount", label: "X% Endirim",         icon: "🏷️", color: "#F59E0B", desc: "Məhsullara faiz endirim tətbiq et" },
  { key: "min_order",        label: "Minimum Sifariş",    icon: "🛒", color: "#3B82F6", desc: "Müəyyən məbləğdən yuxarı sifarişə endirim" },
  { key: "buy_x_get_y",     label: "Al X, Ödə Y",        icon: "🎁", color: "#10B981", desc: 'məs: "3 al 2 ödə"' },
  { key: "new_customer",    label: "Yeni Müştəri",        icon: "👤", color: "#8B5CF6", desc: "Yalnız yeni müştərilərə xüsusi endirim" },
  { key: "limited_time",    label: "Məhdud Müddət",       icon: "⏰", color: "#EF4444", desc: "Yalnız bu həftə / bu gün" },
  { key: "selected_items",  label: "Seçilmiş Məhsullar",  icon: "✅", color: "#06B6D4", desc: "Yalnız seçilmiş məhsullara tətbiq et" },
  { key: "free_shipping",   label: "Pulsuz Çatdırılma",   icon: "🚚", color: "#84CC16", desc: "Müəyyən məbləğdən yuxarı pulsuz çatdır" },
  { key: "custom",          label: "Xüsusi Qayda",        icon: "⚙️", color: "#6B7280", desc: "Öz qayda mətninizi yazın" },
];

function CampaignCountdownPreview({ endDate }) {
  const [left, setLeft] = useState(null);
  useEffect(() => {
    const calc = () => {
      const diff = new Date(endDate) - new Date();
      if (diff <= 0) { setLeft(null); return; }
      setLeft({ d: Math.floor(diff/86400000), h: Math.floor((diff%86400000)/3600000), m: Math.floor((diff%3600000)/60000) });
    };
    calc();
    const id = setInterval(calc, 60000);
    return () => clearInterval(id);
  }, [endDate]);
  if (!endDate) return null;
  if (!left) return <span style={{fontSize:11,color:"#EF4444",fontWeight:600}}>Bitib</span>;
  return (
    <span style={{fontSize:11,color:"#7A9E7E",fontWeight:600,display:"flex",alignItems:"center",gap:4}}>
      {left.d > 0 ? `${left.d}g ` : ""}{String(left.h).padStart(2,"0")}:{String(left.m).padStart(2,"0")} qalıb
    </span>
  );
}

const Campaigns = ({ t, lang }) => {
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);
  const [activeFormTab, setActiveFormTab] = useState("az");
  const [page, setPage] = useState(1);
  const PER_PAGE = 10;

  const emptyForm = {
    name:          { az: "", en: "", ru: "" },
    description:   { az: "", en: "", ru: "" },
    button_text:   { az: "", en: "", ru: "" },
    buttonLink:    "",
    discount:      "",
    startDate:     "",
    endDate:       "",
    display_order: 0,
    imageUrl:      "",
    ruleType:      "",
    ruleNote:      { az: "", en: "", ru: "" },
  };
  const [form, setForm] = useState(emptyForm);
  const { data: camps, total, loading, reload } = useAdminData(
    (params) => campaignApi.getAll(params),
    []
  );

  useEffect(() => {
    reload({ page, limit: PER_PAGE });
  }, [page]);

  const toDateStr = (val) => {
    if (!val) return "";
    if (typeof val === "string" && val.includes("T")) return val.split("T")[0];
    return val;
  };
  const normalizeLang = (val) => {
    if (!val) return { az: "", en: "", ru: "" };
    if (typeof val === "object" && !Array.isArray(val)) return { az: val.az || "", en: val.en || "", ru: val.ru || "" };
    return { az: String(val), en: String(val), ru: String(val) };
  };
  const extractTranslations = (c, field) => {
    if (c.translations && Array.isArray(c.translations)) {
      return {
        az: c.translations.find(x => x.lang === "az")?.[field] || "",
        en: c.translations.find(x => x.lang === "en")?.[field] || "",
        ru: c.translations.find(x => x.lang === "ru")?.[field] || "",
      };
    }
    return normalizeLang(c[field]);
  };

  const validate = () => {
    const e = {};
    if (!form.name?.az?.trim()) e.name = t.required;
    if (form.discount && (Number(form.discount) < 1 || Number(form.discount) > 100)) e.discount = t.invalidDiscount;
    if (!form.startDate) e.startDate = t.required;
    if (!form.endDate) e.endDate = t.required;
    if (form.startDate && form.endDate && form.startDate >= form.endDate) e.endDate = t.dateError;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const openAdd = () => { setEditing(null); setForm(emptyForm); setErrors({}); setActiveFormTab("az"); setModal(true); };
  const openEdit = (c) => {
    setEditing(c.id);
    setForm({
      name:          extractTranslations(c, "title"),
      description:   extractTranslations(c, "description"),
      button_text:   extractTranslations(c, "buttonText"),
      buttonLink:    c.buttonLink || "",
      discount:      c.discountPercent ?? c.discount ?? "",
      startDate:     toDateStr(c.startDate),
      endDate:       toDateStr(c.endDate),
      display_order: c.displayOrder ?? 0,
      imageUrl:      c.imageUrl || "",
      ruleType:      c.ruleType || "",
      ruleNote:      normalizeLang(c.ruleNote),
    });
    setErrors({});
    setActiveFormTab("az");
    setModal(true);
  };

  const handleImageUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const res = await campaignApi.uploadImage(file);
      setForm(f => ({ ...f, imageUrl: res.url || "" }));
    } catch { setToast({ message: t.error, type: "error" }); }
    finally { setUploading(false); }
  };

  const onToggle = async (c) => {
    try { await campaignApi.toggle(c.id); reload({ page, limit: PER_PAGE }); }
    catch (err) { setToast({ message: err?.userMessage || t.error, type: "error" }); }
  };
  const onDelete = async (c) => {
    if (!window.confirm(t.confirmDelete)) return;
    try { await campaignApi.remove(c.id); setToast({ message: t.successDeleted, type: "success" }); reload({ page, limit: PER_PAGE }); }
    catch (err) { setToast({ message: err?.userMessage || t.error, type: "error" }); }
  };

  const onSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      if (editing) await campaignApi.update(editing, form);
      else await campaignApi.create(form);
      setToast({ message: t.successSaved, type: "success" });
      setModal(false); reload({ page, limit: PER_PAGE });
    } catch (err) {
      setToast({ message: err?.userMessage || t.error, type: "error" });
    } finally { setSaving(false); }
  };

  const selectedRule = RULE_PRESETS.find(r => r.key === form.ruleType);

  return (
    <div className="space-y-5">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{t.campaigns}</h1>
          <p className="text-sm text-gray-500 mt-0.5">Kampaniyaları idarə et — qayda sistemi, şəkil, geri sayım</p>
        </div>
        <Btn onClick={openAdd}><Icons.Plus />{t.addNew}</Btn>
      </div>

      {/* Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="h-52 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : !camps?.length ? (
        <Card>
          <div className="text-center py-16">
            <div className="text-5xl mb-3">🏷️</div>
            <p className="text-gray-500 font-medium">Kampaniya tapılmadı</p>
            <p className="text-gray-400 text-sm mt-1">Yeni kampaniya yaratmaq üçün yuxarıdakı düyməyə basın</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {camps.map(c => {
            const active = c.isActive !== undefined ? c.isActive : c.active;
            const rulePreset = RULE_PRESETS.find(r => r.key === c.ruleType);
            const title = c.title || (typeof c.name === "object" ? c.name[lang] : c.name) || "—";
            return (
              <div key={c.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                {/* Thumbnail */}
                <div className="relative h-36 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                  {c.imageUrl
                    ? <img src={c.imageUrl} alt={title} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-5xl opacity-20">🖼️</div>
                  }
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <div className="absolute top-2 left-2 flex gap-1.5 flex-wrap">
                    {c.discountPercent && (
                      <span className="bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow">−{c.discountPercent}%</span>
                    )}
                    {rulePreset && (
                      <span className="text-white text-xs font-semibold px-2 py-0.5 rounded-full shadow" style={{background: rulePreset.color}}>
                        {rulePreset.icon} {rulePreset.label}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => onToggle(c)}
                    className="absolute top-2 right-2 px-2.5 py-0.5 rounded-full text-xs font-bold shadow transition-colors"
                    style={{background: active ? "#10B981" : "#9CA3AF", color: "#fff"}}
                  >
                    {active ? "● Aktiv" : "○ Deaktiv"}
                  </button>
                </div>
                {/* Body */}
                <div className="p-4">
                  <h3 className="font-bold text-gray-800 text-sm truncate mb-1">{title}</h3>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-gray-400">📅 {toDateStr(c.startDate)} → {toDateStr(c.endDate)}</span>
                    <CampaignCountdownPreview endDate={c.endDate} />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(c)} className="flex-1 py-1.5 text-xs font-semibold text-indigo-600 border border-indigo-100 rounded-lg hover:bg-indigo-50 transition-colors">
                      ✏️ Düzəlt
                    </button>
                    <button onClick={() => onDelete(c)} className="flex-1 py-1.5 text-xs font-semibold text-red-500 border border-red-100 rounded-lg hover:bg-red-50 transition-colors">
                      🗑️ Sil
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {total > PER_PAGE && (
        <Pagination t={t} total={total} page={page} perPage={PER_PAGE} onChange={setPage} />
      )}

      {/* Modal */}
      <Modal open={modal} onClose={() => setModal(false)} title={editing ? "Kampaniyanı Düzəlt" : "Yeni Kampaniya Yarat"}>
        <div className="space-y-5" style={{maxHeight:"75vh",overflowY:"auto",paddingRight:4}}>

          {/* IMAGE */}
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-2">🖼️ Kampaniya Şəkli</label>
            <div className="relative border-2 border-dashed border-gray-200 rounded-xl overflow-hidden" style={{height:150}}>
              {form.imageUrl ? (
                <>
                  <img src={form.imageUrl} alt="preview" className="w-full h-full object-cover" />
                  <button onClick={() => setForm(f => ({ ...f, imageUrl: "" }))} className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full text-xs font-bold hover:bg-red-600 flex items-center justify-center">×</button>
                </>
              ) : (
                <label className="flex flex-col items-center justify-center h-full cursor-pointer gap-2 text-gray-400 hover:text-gray-600 transition-colors" style={{background:"#F9FAFB"}}>
                  {uploading
                    ? <div className="w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                    : <><span className="text-3xl">📸</span><span className="text-xs font-medium">Şəkil yükləmək üçün basın</span><span className="text-xs text-gray-300">JPG, PNG, WEBP</span></>
                  }
                  <input type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(e.target.files[0])} disabled={uploading} />
                </label>
              )}
            </div>
            <div className="mt-2">
              <Input label="Şəkil URL (birbaşa link)" value={form.imageUrl} onChange={v => setForm(f => ({ ...f, imageUrl: v }))} placeholder="https://..." />
            </div>
          </div>

          {/* RULE SYSTEM */}
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-2">Kampaniya Qaydası</label>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {RULE_PRESETS.map(rule => (
                <button key={rule.key} type="button" onClick={() => setForm(f => ({ ...f, ruleType: f.ruleType === rule.key ? "" : rule.key }))}
                  className="text-left p-3 rounded-xl border-2 transition-all"
                  style={{ borderColor: form.ruleType === rule.key ? rule.color : "#E5E7EB", background: form.ruleType === rule.key ? rule.color + "15" : "#fff" }}>
                  <div className="font-bold text-gray-800 text-xs flex items-center gap-1.5 mb-0.5">{rule.icon} {rule.label}</div>
                  <div className="text-gray-400 text-[10px] leading-tight">{rule.desc}</div>
                </button>
              ))}
            </div>
            {form.ruleType && (
              <div className="p-3 rounded-xl border" style={{borderColor: selectedRule?.color, background: selectedRule?.color + "08"}}>
                <p className="text-xs font-semibold mb-2" style={{color: selectedRule?.color}}>{selectedRule?.icon} Qayda açıqlaması (istifadəçiyə göstərilir)</p>
                <div className="grid grid-cols-3 gap-2">
                  {["az","en","ru"].map(l => (
                    <div key={l}>
                      <div className="text-[10px] font-bold text-gray-400 mb-1">{l.toUpperCase()}</div>
                      <textarea rows={2} value={form.ruleNote?.[l] || ""}
                        onChange={e => setForm(f => ({ ...f, ruleNote: { ...f.ruleNote, [l]: e.target.value } }))}
                        placeholder={l === "az" ? 'məs: "3 al 2 ödə"' : l === "en" ? '"Buy 3, Pay 2"' : '"Купи 3, плати за 2"'}
                        className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs resize-none focus:outline-none focus:border-indigo-300"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* MULTILANG CONTENT */}
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-2">📝 Məzmun</label>
            <div className="flex gap-1 mb-3">
              {["az","en","ru"].map(l => (
                <button key={l} type="button" onClick={() => setActiveFormTab(l)}
                  className="px-3 py-1 rounded-lg text-xs font-bold transition-colors"
                  style={{ background: activeFormTab === l ? "#4F46E5" : "#F3F4F6", color: activeFormTab === l ? "#fff" : "#6B7280" }}>
                  {l.toUpperCase()} {l === "az" && errors.name ? "⚠" : ""}
                </button>
              ))}
            </div>
            {["az","en","ru"].map(l => (
              <div key={l} className={activeFormTab === l ? "space-y-3" : "hidden"}>
                <Input label={`Başlıq${l === "az" ? " *" : ""} (${l.toUpperCase()})`}
                  value={form.name?.[l] || ""}
                  onChange={v => setForm(f => ({ ...f, name: { ...f.name, [l]: v } }))}
                  error={l === "az" ? errors.name : undefined}
                  placeholder={l === "az" ? "məs: Yaz Endirim Kampaniyası" : l === "en" ? "e.g. Spring Sale Campaign" : "напр. Весенняя распродажа"} />
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Açıqlama ({l.toUpperCase()})</label>
                  <textarea rows={3} value={form.description?.[l] || ""}
                    onChange={e => setForm(f => ({ ...f, description: { ...f.description, [l]: e.target.value } }))}
                    placeholder={l === "az" ? "Kampaniya haqqında qısa məlumat..." : ""}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-50" />
                </div>
                <Input label={`Düymə mətni (${l.toUpperCase()})`}
                  value={form.button_text?.[l] || ""}
                  onChange={v => setForm(f => ({ ...f, button_text: { ...f.button_text, [l]: v } }))}
                  placeholder={l === "az" ? "məs: İndi al" : l === "en" ? "Shop now" : "Купить"} />
              </div>
            ))}
          </div>

          {/* SETTINGS */}
          <div className="grid grid-cols-2 gap-4">
            <Input label="Endirim % (ixtiyari)" value={form.discount} onChange={v => setForm(f => ({ ...f, discount: v }))} type="number" placeholder="məs: 20" error={errors.discount} />
            <Input label="Düymə linki" value={form.buttonLink} onChange={v => setForm(f => ({ ...f, buttonLink: v }))} placeholder="/campaigns" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label={`${t.startDate} *`} value={form.startDate} onChange={v => setForm(f => ({ ...f, startDate: v }))} type="date" error={errors.startDate} />
            <Input label={`${t.endDate} *`}   value={form.endDate}   onChange={v => setForm(f => ({ ...f, endDate: v }))}   type="date" error={errors.endDate} />
          </div>
          <Input label="Göstərilmə sırası" value={form.display_order} onChange={v => setForm(f => ({ ...f, display_order: v }))} type="number" placeholder="0" />

          {/* Countdown Preview */}
          {form.endDate && (
            <div className="p-3 bg-gray-50 rounded-xl flex items-center gap-3 border border-gray-100">
              <span className="text-2xl">⏰</span>
              <div>
                <div className="text-xs font-bold text-gray-600 mb-0.5">Geri sayım önizləməsi:</div>
                <CampaignCountdownPreview endDate={form.endDate} />
              </div>
            </div>
          )}

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


const DiscountCodes = ({ t }) => {
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);
  const emptyForm = { code: "", type: "percent", value: "", limit: "", expiration: "" };
  const [form, setForm] = useState(emptyForm);
  const { data: codes, loading, reload } = useAdminData(() => discountCodeApi.getAll());
  const typeToStr = (t) => {
    if (t === "percent" || t === "fixed") return t;
    if (t === 1 || t === "Percent" || t === 0) return "percent";
    if (t === 2 || t === "Fixed") return "fixed";
    return "percent";
  };

  const toDateStr = (val) => {
    if (!val) return "";
    if (typeof val === "string" && val.includes("T")) return val.split("T")[0];
    return val;
  };

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
  const openEdit = (c) => {
    setEditing(c.id);
    setForm({
      code:       c.code || "",
      type:       typeToStr(c.type),
      value:      c.value ?? c.discountValue ?? "",
      limit:      c.maxUses ?? c.limit ?? "",
      expiration: toDateStr(c.expiresAt || c.expiration),
    });
    setErrors({});
    setModal(true);
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
          t={t}
          loading={loading}
          columns={[
            { key: "code",  label: t.code,  render: r => <code className="bg-gray-100 px-2.5 py-1 rounded-lg text-sm font-bold text-gray-800">{r.code}</code> },
            { key: "type",  label: t.type,  render: r => <span className="text-xs text-gray-600">{typeToStr(r.type) === "percent" ? t.percent : t.fixed}</span> },
            { key: "value", label: t.value, render: r => {
              const isPercent = typeToStr(r.type) === "percent";
              const val = r.value ?? r.discountValue;
              return <span className="font-bold text-emerald-700">{val}{isPercent ? "%" : "$"}</span>;
            }},
            { key: "usageCount", label: t.usageCount, render: r => <span className="text-gray-600">{r.usedCount ?? r.usageCount ?? 0} / {r.maxUses ?? r.limit ?? "∞"}</span> },
            { key: "expiresAt", label: t.expiration, render: r => <span className="text-gray-500 text-xs">{toDateStr(r.expiresAt || r.expiration)}</span> },
            { key: "status", label: t.status, render: r => {
              const isActive = r.status === 1 || r.status === "Active" || r.active === true;
              return (
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${isActive ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                  {isActive ? t.active : t.inactive}
                </span>
              );
            }},
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
          <Input label={t.expiration} value={form.expiration} onChange={v => setForm(f => ({ ...f, expiration: v }))} type="date" error={errors.expiration} />
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

const Sidebar = ({ page, setPage, t, collapsed, setCollapsed, onLogout }) => (
  <aside className={`h-screen bg-[#1a3a2a] flex flex-col transition-all duration-300 ${collapsed ? "w-16" : "w-60"} flex-shrink-0`}>
    <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
      <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center flex-shrink-0">
        <Icons.Layers />
      </div>
      {!collapsed && <span className="font-bold text-white text-base tracking-wide">Amore mebel admin</span>}
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
      <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-all">
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

export default function AdminPanel() {
  const [page,      setPage]      = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const dispatch   = useDispatch();
  const isAuth     = useSelector(selectIsAuth);
  const reduxLang  = useSelector(selectLang);
  const lang = reduxLang || "az";
  const t    = translations[lang] || translations["az"];
  const handleLangChange = (l) => { dispatch(setReduxLang(l)); };
  const handleLogout     = () => { dispatch(logoutAction()); window.location.href = "/login"; };
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
        <Sidebar page={page} setPage={setPage} t={t} collapsed={collapsed} setCollapsed={setCollapsed} onLogout={handleLogout} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header t={t} lang={lang} setLang={handleLangChange} page={page} />
          <main className="flex-1 overflow-y-auto p-5">
            {renderPage()}
          </main>
        </div>
      </div>
    </>
  );
}