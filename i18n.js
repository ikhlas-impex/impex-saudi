/**
 * IMPEX Web App — Multilingual Engine (English & Arabic)
 * Handles automatic language detection from URL (lang=ar / lang=en), cookie persistence,
 * direction attribute flipping (RTL/LTR), UI switcher controls, and translation binding.
 */

(function () {
  const COOKIE_NAME = "impex_lang";

  const STRINGS = {
    en: {
      // Switcher
      switcher_en: "English",
      switcher_ar: "العربية",
      switcher_label: "Language",

      // index.html (Pickup Form)
      header_title: "🏪 IMPEX Service",
      header_subtitle: "Product Pickup Request",
      loading_dealer: "Loading your dealer details…",
      error_title: "Something went wrong",
      error_no_dealer: "Unable to load dealer information. Please go back to WhatsApp and try again.",
      error_no_phone: "No phone number provided. Please open this link from WhatsApp.",
      click_to_register: "Click here to register as a dealer",
      error_connection: "Could not connect to the server. Please check your connection and try again.",
      step_product: "Product",
      step_confirm: "Confirm",
      dealer_info_title: "🏪 Dealer Info",
      dealer_id: "Dealer ID",
      dealer_name: "Name",
      region: "Region",
      service_center: "Service Center",
      select_products: "📦 Select Product(s)",
      product_num: "Product #",
      remove_product: "✕ Remove",
      category: "Category",
      choose_category: "— Choose category —",
      select_cat_first: "— Select category first —",
      unable_load_cat: "Unable to load categories",
      model: "Model",
      choose_model: "— Choose model —",
      quantity: "Quantity",
      add_another_product: "➕ Add another product",
      max_items_reached: "10/10 items — maximum reached",
      review_request: "Review Request →",
      confirm_title: "✅ Confirm Your Request",
      items: "Items",
      confirm_btn: "Confirm & Create Ticket",
      creating_ticket: "Creating ticket…",
      change_selection: "← Change Selection",
      success_title: "Pickup Request Created!",
      success_msg: "Your request has been submitted successfully. Our team will contact you within 24 hours.",
      created_tickets: "Created Tickets:",
      multiple_tickets: "MULTIPLE TICKETS",
      check_status_wa: "You can check your ticket status anytime by messaging us on WhatsApp.",
      return_to_wa: "↩ Return to WhatsApp",

      // dealer-register.html
      reg_portal_title: "Dealer Registration Portal",
      verifying_status: "Verifying your status...",
      already_registered_title: "Already Registered!",
      already_registered_desc: "We found an existing dealer account associated with this phone number.",
      status_label: "Status",
      status_active: "Active",
      dealer_details_title: "DEALER DETAILS",
      fill_all_fields: "Please fill all fields.",
      shop_name_label: "Shop / Dealer Name",
      shop_name_placeholder: "Enter your business name",
      select_region: "— Select Region —",
      city_label: "City",
      select_region_first: "— Select Region First —",
      select_city: "— Select City —",
      other_city: "+ Other (Enter manually)",
      other_city_placeholder: "Type your city name...",
      enter_city_error: "Please enter your city name.",
      location_label: "Location (Address or GPS)",
      search_places_placeholder: "Search for places...",
      gps_placeholder: "Coordinates will appear here",
      select_map_btn: "Select Location on Map",
      register_btn: "Register Dealer →",
      registering_btn: "Registering...",
      reg_complete_title: "Registration Complete!",
      reg_complete_desc: "Welcome to the IMPEX network. Your details have been saved securely.",

      // status.html
      status_header_title: "Ticket Status",
      loading_tickets: "Loading your tickets…",
      unable_load_tickets: "Unable to load ticket information. Please try again.",
      try_again: "Try Again",
      check_status_title: "🔍 Check Ticket Status",
      enter_wa_phone_desc: "Enter your WhatsApp phone number to check the status of your pickup requests.",
      phone_placeholder: "Phone Number (e.g. 0541234567)",
      lookup_btn: "Lookup Tickets",
      your_requests: "Your Requests",
      no_requests_found: "No Requests Found",
      no_requests_desc: "We couldn't find any pickup requests associated with this number.",
      create_pickup_btn: "Create Pickup Request",
      badge_pending: "Pending",
      badge_in_progress: "In Progress",
      badge_completed: "Completed",
      badge_cancelled: "Cancelled",
      unknown_product: "Unknown Product",
      recent: "Recent",

      // admin/index.html
      admin_brand: "⬢ IMPEX Admin",
      admin_login_title: "⬢ IMPEX Admin",
      username: "Username",
      password: "Password",
      login_btn: "Login",
      invalid_credentials: "Invalid credentials",
      tab_tickets: "Tickets",
      tab_dealers: "Dealers",
      tab_catalog: "Catalog",
      tab_regions: "Regions",
      logout: "Logout",
      title_tickets_dashboard: "Tickets Dashboard",
      subtitle_tickets_dashboard: "Manage Pickup Requests",
      title_dealers: "Dealers Directory",
      subtitle_dealers: "Manage Registered Dealers",
      title_catalog: "Product Catalog Manager",
      subtitle_catalog: "Manage Categories & Models",
      title_regions: "Region & Service Center Manager",
      subtitle_regions: "Manage Regions & Service Centers",
      stat_total_tickets: "Total Tickets",
      stat_pending: "Pending",
      stat_in_progress: "In Progress",
      stat_completed: "Completed",
      stat_total_dealers: "Total Dealers",
      stat_active_dealers: "Active Dealers",
      stat_inactive_dealers: "Inactive Dealers",
      search_tickets_placeholder: "Search ID, Dealer, Product...",
      search_dealers_placeholder: "Search Dealer ID, Name, Phone, Region...",
      all_statuses: "All Statuses",
      all_dealer_statuses: "All Statuses",
      active: "Active",
      inactive: "Inactive",
      refresh: "Refresh",
      export_csv: "📥 Export CSV",
      th_ticket_id: "Ticket ID",
      th_date: "Date",
      th_dealer: "Dealer",
      th_product: "Product",
      th_qty: "Qty",
      th_sc: "Service Center",
      th_status: "Status",
      th_action: "Action",
      th_dealer_id: "Dealer ID",
      th_dealer_name: "Dealer Name",
      th_phone: "Phone",
      th_region_sub: "Region / Subregion",
      th_location: "Location",
      th_reg_date: "Registration Date",
      edit: "Edit",
      no_location: "No location",
      date_from: "From Date",
      date_to: "To Date",
      sort_order: "Sort Order",
      sort_desc: "Newest First (Desc)",
      sort_asc: "Oldest First (Asc)",
      filter_btn: "Filter",
      filter_options: "Filter Options",
      clear_all: "Clear All",
      date_range: "Date Range",

      // Shared dynamic messages
      page_title_pickup: "IMPEX — Product Pickup Request",
      page_title_register: "IMPEX — Dealer Registration",
      page_title_status: "IMPEX — Ticket Status",
      not_available: "N/A",
      unit: "unit",
      units: "units",
      err_select_category: "Please select a category for item #{n}.",
      err_select_model: "Please select a model for item #{n}.",
      err_qty: "Quantity for item #{n} must be at least 1.",
      ticket_failed: "Failed to create ticket. Please try again.",
      connection_error_retry: "Connection error. Please check your internet and try again.",
      reg_failed: "Registration failed. Please try again.",
      server_error: "Server error. Please try again.",
      maps_not_configured: "The map is not available right now. Please try again later.",
      maps_loading: "The map is still loading. Please try again in a few seconds.",
      sc_pending: "Service Center Pending"
    },
    ar: {
      // Switcher
      switcher_en: "English",
      switcher_ar: "العربية",
      switcher_label: "اللغة",

      // index.html (Pickup Form)
      header_title: "🏪 خدمة إمبيكس",
      header_subtitle: "طلب استلام منتج",
      loading_dealer: "جاري تحميل بيانات الوكيل…",
      error_title: "حدث خطأ ما",
      error_no_dealer: "تعذر تحميل معلومات الوكيل. يرجى العودة إلى واتساب والمحاولة مرة أخرى.",
      error_no_phone: "لم يتم توفير رقم هاتف. يرجى فتح هذا الرابط من واتساب.",
      click_to_register: "انقر هنا للتسجيل كوكيل",
      error_connection: "تعذر الاتصال بالخادم. يرجى التحقق من اتصالك والمحاولة مرة أخرى.",
      step_product: "المنتج",
      step_confirm: "تأكيد",
      dealer_info_title: "🏪 معلومات الوكيل",
      dealer_id: "رقم الوكيل",
      dealer_name: "الاسم",
      region: "المنطقة",
      service_center: "مركز الخدمة",
      select_products: "📦 اختيار المنتج (المنتجات)",
      product_num: "المنتج رقم ",
      remove_product: "✕ إزالة",
      category: "الفئة",
      choose_category: "— اختر الفئة —",
      select_cat_first: "— حدد الفئة أولاً —",
      unable_load_cat: "تعذر تحميل الفئات",
      model: "الموديل",
      choose_model: "— اختر الموديل —",
      quantity: "الكمية",
      add_another_product: "➕ إضافة منتج آخر",
      max_items_reached: "10/10 عناصر — تم الوصول للحد الأقصى",
      review_request: "مراجعة الطلب ←",
      confirm_title: "✅ تأكيد طلبك",
      items: "العناصر",
      confirm_btn: "تأكيد وإنشاء التذكرة",
      creating_ticket: "جاري إنشاء التذكرة…",
      change_selection: "تغيير الاختيار →",
      success_title: "تم إنشاء طلب الاستلام!",
      success_msg: "تم تقديم طلبك بنجاح. سيتواصل معك فريقنا خلال 24 ساعة.",
      created_tickets: "التذاكر المنشأة:",
      multiple_tickets: "تذاكر متعددة",
      check_status_wa: "يمكنك التحقق من حالة تذكرتك في أي وقت بمراسلتنا على واتساب.",
      return_to_wa: "↩ العودة إلى واتساب",

      // dealer-register.html
      reg_portal_title: "بوابة تسجيل الوكلاء",
      verifying_status: "جاري التحقق من حالتك...",
      already_registered_title: "مسجل بالفعل!",
      already_registered_desc: "وجدنا حساب وكيل حالي مرتبط برقم الهاتف هذا.",
      status_label: "الحالة",
      status_active: "نشط",
      dealer_details_title: "تفاصيل الوكيل",
      fill_all_fields: "يرجى ملء جميع الحقول.",
      shop_name_label: "اسم المحل / الوكيل",
      shop_name_placeholder: "أدخل اسم نشاطك التجاري",
      select_region: "— اختر المنطقة —",
      city_label: "المدينة",
      select_region_first: "— اختر المنطقة أولاً —",
      select_city: "— اختر المدينة —",
      other_city: "+ أخرى (إدخال يدوي)",
      other_city_placeholder: "اكتب اسم مدينتك...",
      enter_city_error: "يرجى إدخال اسم مدينتك.",
      location_label: "الموقع (العنوان أو الإحداثيات)",
      search_places_placeholder: "البحث عن الأماكن...",
      gps_placeholder: "ستظهر الإحداثيات هنا",
      select_map_btn: "تحديد الموقع على الخريطة",
      register_btn: "تسجيل الوكيل ←",
      registering_btn: "جاري التسجيل...",
      reg_complete_title: "اكتمل التسجيل!",
      reg_complete_desc: "مرحباً بك في شبكة إمبيكس. تم حفظ بياناتك بأمان.",

      // status.html
      status_header_title: "حالة التذكرة",
      loading_tickets: "جاري تحميل تذاكرك…",
      unable_load_tickets: "تعذر تحميل معلومات التذاكر. يرجى المحاولة مرة أخرى.",
      try_again: "إعادة المحاولة",
      check_status_title: "🔍 التحقق من حالة التذكرة",
      enter_wa_phone_desc: "أدخل رقم هاتف واتساب للتحقق من حالة طلبات الاستلام الخاصة بك.",
      phone_placeholder: "رقم الهاتف (مثال: 0541234567)",
      lookup_btn: "بحث عن التذاكر",
      your_requests: "طلباتك",
      no_requests_found: "لم يتم العثور على طلبات",
      no_requests_desc: "لم نتمكن من العثور على أي طلبات استلام مرتبطة بهذا الرقم.",
      create_pickup_btn: "إنشاء طلب استلام",
      badge_pending: "قيد الانتظار",
      badge_in_progress: "قيد المعالجة",
      badge_completed: "مكتمل",
      badge_cancelled: "ملغى",
      unknown_product: "منتج غير معروف",
      recent: "حديث",

      // admin/index.html
      admin_brand: "⬢ إمبيكس المشرف",
      admin_login_title: "⬢ تسجيل دخول المشرف",
      username: "اسم المستخدم",
      password: "كلمة المرور",
      login_btn: "تسجيل الدخول",
      invalid_credentials: "بيانات الدخول غير صحيحة",
      tab_tickets: "التذاكر",
      tab_dealers: "الوكلاء",
      tab_catalog: "الكتالوج",
      tab_regions: "المناطق",
      logout: "تسجيل الخروج",
      title_tickets_dashboard: "لوحة تحكم التذاكر",
      subtitle_tickets_dashboard: "إدارة طلبات الاستلام",
      title_dealers: "دليل الوكلاء",
      subtitle_dealers: "إدارة الوكلاء المسجلين",
      title_catalog: "إدارة كتالوج المنتجات",
      subtitle_catalog: "إدارة الفئات والموديلات",
      title_regions: "إدارة المناطق ومراكز الخدمة",
      subtitle_regions: "إدارة التعيينات والمراكز",
      stat_total_tickets: "إجمالي التذاكر",
      stat_pending: "قيد الانتظار",
      stat_in_progress: "قيد المعالجة",
      stat_completed: "مكتمل",
      stat_total_dealers: "إجمالي الوكلاء",
      stat_active_dealers: "الوكلاء النشطون",
      stat_inactive_dealers: "الوكلاء غير النشطين",
      search_tickets_placeholder: "بحث بالرقم، الوكيل، المنتج...",
      search_dealers_placeholder: "بحث بالرقم، الاسم، الهاتف، المنطقة...",
      all_statuses: "جميع الحالات",
      all_dealer_statuses: "جميع حالات الوكلاء",
      active: "نشط",
      inactive: "غير نشط",
      refresh: "تحديث",
      export_csv: "📥 تصدير CSV",
      th_ticket_id: "رقم التذكرة",
      th_date: "التاريخ",
      th_dealer: "الوكيل",
      th_product: "المنتج",
      th_qty: "الكمية",
      th_sc: "مركز الخدمة",
      th_status: "الحالة",
      th_action: "الإجراء",
      th_dealer_id: "رقم الوكيل",
      th_dealer_name: "اسم الوكيل",
      th_phone: "الهاتف",
      th_region_sub: "المنطقة / المدينة",
      th_location: "الموقع",
      th_reg_date: "تاريخ التسجيل",
      edit: "تعديل",
      no_location: "لا يوجد موقع",
      date_from: "من تاريخ",
      date_to: "إلى تاريخ",
      sort_order: "الترتيب",
      sort_desc: "الأحدث أولاً (تنازلي)",
      sort_asc: "الأقدم أولاً (تصاعدي)",
      filter_btn: "تصفية",
      filter_options: "خيارات التصفية",
      clear_all: "مسح الكل",
      date_range: "نطاق التاريخ",

      // Shared dynamic messages
      page_title_pickup: "إمبيكس — طلب استلام منتج",
      page_title_register: "إمبيكس — تسجيل الوكلاء",
      page_title_status: "إمبيكس — حالة التذكرة",
      not_available: "غير متوفر",
      unit: "وحدة",
      units: "وحدات",
      err_select_category: "يرجى اختيار الفئة للمنتج رقم {n}.",
      err_select_model: "يرجى اختيار الموديل للمنتج رقم {n}.",
      err_qty: "يجب ألا تقل الكمية للمنتج رقم {n} عن 1.",
      ticket_failed: "تعذر إنشاء التذكرة. يرجى المحاولة مرة أخرى.",
      connection_error_retry: "خطأ في الاتصال. يرجى التحقق من الإنترنت والمحاولة مرة أخرى.",
      reg_failed: "تعذر إكمال التسجيل. يرجى المحاولة مرة أخرى.",
      server_error: "خطأ في الخادم. يرجى المحاولة مرة أخرى.",
      maps_not_configured: "الخريطة غير متاحة حالياً. يرجى المحاولة لاحقاً.",
      maps_loading: "الخريطة قيد التحميل. يرجى المحاولة بعد بضع ثوانٍ.",
      sc_pending: "مركز الخدمة قيد التحديد"
    }
  };

  // Arabic display names for data values (regions, cities, service centers,
  // product categories). Values sent to the backend stay in English; only the
  // label shown to the user changes. Keys are matched case-insensitively.
  const NAMES_AR = {
    // Regions
    "Riyadh Province": "منطقة الرياض",
    "Makkah Province": "منطقة مكة المكرمة",
    "Eastern Province": "المنطقة الشرقية",
    "Madinah Province": "منطقة المدينة المنورة",
    "Al-Qassim Province": "منطقة القصيم",
    "Hail Province": "منطقة حائل",
    "Tabuk Province": "منطقة تبوك",
    "Northern Borders Province": "منطقة الحدود الشمالية",
    "Jazan Province": "منطقة جازان",
    "Najran Province": "منطقة نجران",
    "Al-Baha Province": "منطقة الباحة",
    "Al-Jouf Province": "منطقة الجوف",
    "Asir Province": "منطقة عسير",

    // Service centers
    "Riyadh Service Center": "مركز خدمة الرياض",
    "Dammam Service Center": "مركز خدمة الدمام",
    "Madeena Service Center": "مركز خدمة المدينة المنورة",
    "Jeddah Service Center": "مركز خدمة جدة",
    "Darb Service Center": "مركز خدمة الدرب",

    // Cities — Riyadh
    "Riyadh": "الرياض", "Diriyah": "الدرعية", "Al-Kharj": "الخرج", "Dawadmi": "الدوادمي",
    "Al Majma'ah": "المجمعة", "Al-Quway'iyah": "القويعية", "Wadi ad-Dawasir": "وادي الدواسر",
    "Al Aflaj": "الأفلاج", "Al Zulfi": "الزلفي", "Shaqra": "شقراء", "Howtat Bani Tamim": "حوطة بني تميم",
    "Afif": "عفيف", "As Sulayyil": "السليل", "Dhurma": "ضرما", "Al-Muzahmiyya": "المزاحمية",
    "Rumaah": "رماح", "Thadiq": "ثادق", "Huraymila": "حريملاء", "Al Hariq": "الحريق", "Al-Ghat": "الغاط",
    // Makkah
    "Mecca": "مكة المكرمة", "Jeddah": "جدة", "Ta'if": "الطائف", "Al Qunfudhah": "القنفذة",
    "Al Lith": "الليث", "Rabigh": "رابغ", "Al Jumum": "الجموم", "Khulais": "خليص", "Al Kamil": "الكامل",
    "Al Khurmah": "الخرمة", "Ranyah": "رنية", "Turubah": "تربة", "Al Muwayh": "الموية", "Adham": "أضم",
    "Maysaan": "ميسان", "Bahrah": "بحرة",
    // Eastern
    "Dammam": "الدمام", "Al Ahsa": "الأحساء", "Hafar Al-Batin": "حفر الباطن", "Jubail": "الجبيل",
    "Qatif": "القطيف", "Khobar": "الخبر", "Khafji": "الخفجي", "Ras Tanura": "رأس تنورة",
    "Abqaiq": "بقيق", "Al Nairyah": "النعيرية", "Qaryat al-Ulya": "قرية العليا", "Dhahran": "الظهران",
    // Madinah
    "Medina": "المدينة المنورة", "Yanbu": "ينبع", "Al-`Ula": "العلا", "Mahd adh Dhahab": "مهد الذهب",
    "Badr": "بدر", "Khaybar": "خيبر", "Al Hinakiyah": "الحناكية",
    // Al-Qassim
    "Buraidah": "بريدة", "Unaizah": "عنيزة", "Ar Rass": "الرس", "Al Mithnab": "المذنب",
    "Al Bukayriyah": "البكيرية", "Al Badائع": "البدائع", "As Nabhaniyah": "النبهانية",
    "Uyun AlJiwa": "عيون الجواء", "Riyadh Al Khabra": "رياض الخبراء", "Ash Shimasiyah": "الشماسية",
    // Hail
    "Ha'il": "حائل", "Baqaa": "بقعاء", "Al Ghazalah": "الغزالة", "Al Shanan": "الشنان", "Samaheer": "سميراء",
    // Tabuk
    "Tabuk": "تبوك", "Al Wajh": "الوجه", "Duba": "ضباء", "Tayma": "تيماء", "Umluj": "أملج", "Haql": "حقل",
    // Northern Borders
    "Arar": "عرعر", "Rafha": "رفحاء", "Turaif": "طريف",
    // Jazan
    "Jizan": "جازان", "Sabya": "صبيا", "Abu Arish": "أبو عريش", "Samtah": "صامطة", "Al Harth": "الحرث",
    "Damad": "ضمد", "Al Reeth": "الريث", "Baish": "بيش", "Farasan": "فرسان", "Ad Dair": "الدائر",
    "Ahad al Masarihah": "أحد المسارحة", "Al Edabi": "العيدابي", "Al Aridhah": "العارضة", "Al Darb": "الدرب",
    // Najran
    "Najran": "نجران", "Sharurah": "شرورة", "Hubuna": "حبونا", "Badr Al Janoub": "بدر الجنوب",
    "Yadamah": "يدمة", "Thar": "ثار", "Khubash": "خباش", "Al Kharkhir": "الخرخير",
    // Al-Baha
    "Al Baha": "الباحة", "Baljurashi": "بلجرشي", "Al Mandaq": "المندق", "Al Makhwah": "المخواة",
    "Al Aqiq": "العقيق", "Qilwah": "قلوة", "Al Qara": "القرى",
    // Al-Jouf
    "Sakakah": "سكاكا", "Qurayyat": "القريات", "Dumat al-Jandal": "دومة الجندل",
    // Asir
    "Abha": "أبها", "Khamis Mushait": "خميس مشيط", "Bisha": "بيشة", "Al-Namas": "النماص",
    "Mahayil": "محايل عسير", "Sarat Abidah": "سراة عبيدة", "Tathlith": "تثليث", "Rojal Alma'a": "رجال ألمع",
    "Dhahran Al Janub": "ظهران الجنوب", "Balqarn": "بلقرن", "Bariq": "بارق", "Al Majardah": "المجاردة",

    // Product categories (live catalog — unknown ones fall back to the original name)
    "2.0 Computer Speaker": "سماعات كمبيوتر 2.0",
    "2.1 Multimedia Speaker": "سماعات وسائط متعددة 2.1",
    "3.1 Home Theatre": "مسرح منزلي 3.1",
    "5.1 Home Theatre": "مسرح منزلي 5.1",
    "Air Conditioner": "مكيف هواء",
    "Air Cooler": "مبرد هواء",
    "Air Fryer": "قلاية هوائية",
    "Bread Toaster": "محمصة خبز",
    "Ceiling Lamp": "مصباح سقف",
    "Chopper": "مفرمة",
    "Coffe Maker": "صانعة قهوة",
    "Coffee Maker": "صانعة قهوة",
    "Cookware": "أواني طهي",
    "Deep Fryer": "قلاية زيت",
    "Digital Video Broadcast": "جهاز استقبال رقمي",
    "Dish Washer": "غسالة صحون",
    "Electric Cooker": "طباخ كهربائي",
    "Electric Iron Box": "مكواة كهربائية",
    "Garment Steamer": "مكواة بخار للملابس",
    "Electric Kettle": "غلاية كهربائية",
    "Electric Oven": "فرن كهربائي",
    "Emergency Light": "إضاءة طوارئ",
    "Flash Light Combo": "مجموعة كشافات",
    "Gas Stove": "موقد غاز",
    "Grinder": "مطحنة",
    "Heater": "دفاية",
    "Hot Plate": "موقد كهربائي",
    "Induction Cooker": "طباخ بالحث",
    "Infrared Cooktop": "موقد بالأشعة تحت الحمراء",
    "Insect Killer": "صاعق حشرات",
    "Juicer Blender": "عصارة وخلاط",
    "Karaoke Wireless Microphone": "ميكروفون كاريوكي لاسلكي",
    "Kitchen Hob": "سطح طبخ مدمج",
    "Kitchen Scale": "ميزان مطبخ",
    "LED Lamp Flash Light Combo": "مجموعة مصباح LED وكشاف",
    "TV": "تلفزيون",
    "Massager Gun": "مسدس تدليك",
    "Micro Waveoven": "فرن ميكروويف",
    "Microwave Oven": "فرن ميكروويف",
    "Pedestal and Table Fan": "مروحة أرضية ومكتبية",
    "Personal Care": "العناية الشخصية",
    "Personal Scale": "ميزان شخصي",
    "Portable Speaker": "سماعة محمولة",
    "Power Socket": "توصيلة كهربائية",
    "Power Station": "محطة طاقة متنقلة",
    "Pressure Cooker": "قدر ضغط",
    "Radio": "راديو",
    "Recharge Fan": "مروحة قابلة للشحن",
    "Refrigerator": "ثلاجة",
    "Rice Cooker": "طباخ أرز",
    "Roti Maker": "صانعة خبز الروتي",
    "Sandwich Maker": "صانعة سندويتشات",
    "Stage Speaker": "سماعة مسرح",
    "Torch Light": "كشاف يدوي",
    "Trolley Speaker": "سماعة متنقلة بعجلات",
    "Vaccum Flask": "ترمس",
    "Vacuum Flask": "ترمس",
    "Vacuum Cleaner": "مكنسة كهربائية",
    "Washing Mechine": "غسالة ملابس",
    "Washing Machine": "غسالة ملابس",
    "Water Dispenser": "موزع مياه",
    "Wireless Head phone": "سماعة رأس لاسلكية"
  };

  const normalizeName = (s) => String(s || "").toLowerCase().replace(/\s+/g, " ").trim();
  const NAMES_AR_INDEX = {};
  Object.keys(NAMES_AR).forEach((k) => { NAMES_AR_INDEX[normalizeName(k)] = NAMES_AR[k]; });

  // Returns the Arabic display name for a data value when Arabic is active,
  // otherwise the original value. Unknown values are returned unchanged.
  function translateName(value) {
    if (value === undefined || value === null || value === "") return value;
    if (currentLang !== "ar") return value;
    const str = String(value);
    const hit = NAMES_AR_INDEX[normalizeName(str)];
    if (hit) return hit;
    // "LED TV 32 INCH" style model names
    const tv = /^LED TV (\d+) INCH$/i.exec(str.trim());
    if (tv) return `تلفزيون LED ${tv[1]} بوصة`;
    // "Category - Model" combined values
    const dash = str.indexOf(" - ");
    if (dash > 0) {
      const head = NAMES_AR_INDEX[normalizeName(str.slice(0, dash))];
      if (head) return `${head} - ${str.slice(dash + 3)}`;
    }
    return str;
  }

  // Translate with {placeholders}: format("err_qty", { n: 2 })
  function format(key, vars) {
    let out = translate(key);
    Object.keys(vars || {}).forEach((k) => { out = out.split(`{${k}}`).join(vars[k]); });
    return out;
  }

  let currentLang = "en";
  let listeners = [];

  function getCookie(name) {
    if (typeof document === "undefined") return null;
    const match = new RegExp('(^|; )' + name + '=([^;]*)').exec(document.cookie || '');
    return match ? decodeURIComponent(match[2]) : null;
  }

  function setCookie(name, val, days = 365) {
    if (typeof document === "undefined") return;
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(val)}; expires=${expires}; path=/; SameSite=Lax`;
  }

  function resolveLanguage() {
    if (typeof window !== "undefined" && window.location) {
      // 1. URL param (highest priority)
      const params = new URLSearchParams(window.location.search);
      const langParam = (params.get("lang") || "").toLowerCase();
      if (langParam === "ar" || langParam === "en") {
        return langParam;
      }
    }

    // 2. Cookie from previous visit
    const cookieLang = (getCookie(COOKIE_NAME) || "").toLowerCase();
    if (cookieLang === "ar" || cookieLang === "en") {
      return cookieLang;
    }

    // 3. Browser preference
    if (typeof navigator !== "undefined" && navigator.language) {
      if (navigator.language.toLowerCase().startsWith("ar")) return "ar";
    }

    // 4. Default
    return "en";
  }

  function syncUrlParam(lang) {
    if (typeof window === "undefined" || !window.location) return;
    const url = new URL(window.location.href);
    if (url.searchParams.get("lang") !== lang) {
      url.searchParams.set("lang", lang);
      window.history.replaceState({}, "", url.toString());
    }
  }

  function applyDocumentDirection(lang) {
    if (typeof document === "undefined" || !document.documentElement) return;
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";

    // Add or remove an 'rtl' CSS class on document body for easy selector overrides
    if (document.body) {
      if (lang === "ar") {
        document.body.classList.add("rtl");
      } else {
        document.body.classList.remove("rtl");
      }
    }
  }

  function translate(key, fallback = "") {
    const dict = STRINGS[currentLang] || STRINGS.en;
    if (dict && dict[key] !== undefined) {
      return dict[key];
    }
    const fallbackDict = STRINGS.en;
    return fallbackDict[key] !== undefined ? fallbackDict[key] : fallback;
  }

  function applyDOMTranslations(container) {
    if (typeof document === "undefined") return;
    const target = container || document;
    if (!target || !target.querySelectorAll) return;

    // Text contents
    const textEls = target.querySelectorAll("[data-i18n]");
    textEls.forEach((el) => {
      const key = el.getAttribute("data-i18n");
      let vars = null;
      try { vars = JSON.parse(el.getAttribute("data-i18n-vars") || "null"); } catch (e) { vars = null; }
      const val = vars ? format(key, vars) : translate(key);
      if (val) {
        if (el.children.length === 0) {
          el.textContent = val;
        } else {
          let textNodeFound = false;
          for (let node of el.childNodes) {
            if (node.nodeType === (typeof Node !== "undefined" ? Node.TEXT_NODE : 3) && node.textContent.trim() !== "") {
              node.textContent = val;
              textNodeFound = true;
              break;
            }
          }
          if (!textNodeFound) el.innerHTML = val;
        }
      }
    });

    // Placeholders
    const placeholderEls = target.querySelectorAll("[data-i18n-placeholder]");
    placeholderEls.forEach((el) => {
      const key = el.getAttribute("data-i18n-placeholder");
      const val = translate(key);
      if (val) el.setAttribute("placeholder", val);
    });

    // Titles / tooltips
    const titleEls = target.querySelectorAll("[data-i18n-title]");
    titleEls.forEach((el) => {
      const key = el.getAttribute("data-i18n-title");
      const val = translate(key);
      if (val) el.setAttribute("title", val);
    });

    // Data values (region / city / service center / category names)
    target.querySelectorAll("[data-i18n-value]").forEach((el) => {
      el.textContent = translateName(el.getAttribute("data-i18n-value"));
    });

    // Update custom switcher buttons if rendered
    updateSwitcherUI();
  }

  function updateSwitcherUI() {
    if (typeof document === "undefined") return;
    document.querySelectorAll(".impex-lang-btn").forEach((btn) => {
      const targetLang = btn.getAttribute("data-lang");
      if (targetLang === currentLang) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });
    document.querySelectorAll(".impex-lang-label").forEach((el) => {
      el.textContent = currentLang === "ar" ? "English" : "العربية";
    });
  }

  function setLanguage(lang) {
    if (lang !== "en" && lang !== "ar") return;
    currentLang = lang;
    setCookie(COOKIE_NAME, lang);
    syncUrlParam(lang);
    applyDocumentDirection(lang);
    applyDOMTranslations();

    // Trigger registered listeners
    listeners.forEach((fn) => {
      try {
        fn(lang);
      } catch (e) {
        console.error("Language listener error:", e);
      }
    });
  }

  function toggleLanguage() {
    setLanguage(currentLang === "en" ? "ar" : "en");
  }

  function onChange(callback) {
    if (typeof callback === "function") {
      listeners.push(callback);
    }
  }

  function renderSwitcher(containerEl, options = {}) {
    if (!containerEl || typeof document === "undefined") return;

    const isCompact = options.compact || false;
    const customClass = options.className || "";

    const wrapper = document.createElement("div");
    wrapper.className = `impex-lang-switcher ${customClass}`;
    wrapper.style.display = "inline-flex";
    wrapper.style.alignItems = "center";
    wrapper.style.gap = "4px";

    if (isCompact) {
      // Toggle button e.g. 🌐 العربية / 🌐 English
      wrapper.innerHTML = `
        <button type="button" class="impex-lang-toggle-btn" title="Switch Language / تغيير اللغة" style="
          background: rgba(255,255,255,0.15);
          color: currentColor;
          border: 1px solid rgba(128,128,128,0.25);
          border-radius: 20px;
          padding: 4px 12px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s ease;
          font-family: inherit;
          backdrop-filter: blur(4px);
        ">
          <span style="font-size:14px;">🌐</span>
          <span class="impex-lang-label">${currentLang === "ar" ? "English" : "العربية"}</span>
        </button>
      `;
      wrapper.querySelector(".impex-lang-toggle-btn").addEventListener("click", toggleLanguage);
    } else {
      // Pill buttons [ EN | AR ]
      wrapper.innerHTML = `
        <div style="
          display: inline-flex;
          background: var(--muted, #f4f4f5);
          border: 1px solid var(--border, #e4e4e7);
          border-radius: 20px;
          padding: 2px;
          gap: 2px;
        ">
          <button type="button" class="impex-lang-btn ${currentLang === "en" ? "active" : ""}" data-lang="en" style="
            border: none;
            background: transparent;
            padding: 4px 10px;
            border-radius: 16px;
            font-size: 11px;
            font-weight: 600;
            cursor: pointer;
            color: var(--muted-foreground, #71717a);
            transition: all 0.2s ease;
          ">EN</button>
          <button type="button" class="impex-lang-btn ${currentLang === "ar" ? "active" : ""}" data-lang="ar" style="
            border: none;
            background: transparent;
            padding: 4px 10px;
            border-radius: 16px;
            font-size: 11px;
            font-weight: 600;
            cursor: pointer;
            color: var(--muted-foreground, #71717a);
            transition: all 0.2s ease;
          ">عربي</button>
        </div>
      `;

      wrapper.querySelectorAll(".impex-lang-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          setLanguage(btn.getAttribute("data-lang"));
        });
      });
    }

    // Dynamic style rules for active switcher buttons
    if (typeof document !== "undefined" && !document.getElementById("impex-i18n-styles")) {
      const style = document.createElement("style");
      style.id = "impex-i18n-styles";
      style.textContent = `
        .impex-lang-btn.active {
          background: var(--primary, #18181b) !important;
          color: var(--primary-foreground, #ffffff) !important;
          box-shadow: 0 1px 2px rgba(0,0,0,0.1);
        }
        .impex-lang-toggle-btn:hover {
          background: rgba(0,0,0,0.08) !important;
          transform: translateY(-1px);
        }
        body.rtl select {
          background-position: left 12px center !important;
          padding-right: 12px !important;
          padding-left: 36px !important;
        }
        body.rtl .summary-row, body.rtl .ticket-item, body.rtl .detail-row {
          direction: rtl;
        }
      `;
      document.head.appendChild(style);
    }

    containerEl.appendChild(wrapper);
  }

  function init() {
    currentLang = resolveLanguage();
    setCookie(COOKIE_NAME, currentLang);
    syncUrlParam(currentLang);
    applyDocumentDirection(currentLang);

    if (typeof document !== "undefined") {
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => applyDOMTranslations());
      } else {
        applyDOMTranslations();
      }
    }
  }

  // Auto initialize on script load
  init();

  // Export global API
  if (typeof window !== "undefined") {
    window.IMPEX_i18n = {
      getLang: () => currentLang,
      setLang: setLanguage,
      toggle: toggleLanguage,
      t: translate,
      format: format,
      name: translateName,
      // Show a data value (kept in English) as a translated label that follows language switches
      setValue: (el, raw, fallback) => {
        if (!el) return;
        if (raw === undefined || raw === null || raw === "") {
          el.removeAttribute("data-i18n-value");
          el.textContent = fallback !== undefined ? fallback : "";
          return;
        }
        el.removeAttribute("data-i18n");
        el.removeAttribute("data-i18n-vars");
        el.setAttribute("data-i18n-value", raw);
        el.textContent = translateName(raw);
      },
      // Show a message by key that follows language switches
      setText: (el, key, vars) => {
        if (!el) return;
        el.removeAttribute("data-i18n-value");
        el.setAttribute("data-i18n", key);
        if (vars) el.setAttribute("data-i18n-vars", JSON.stringify(vars));
        else el.removeAttribute("data-i18n-vars");
        el.textContent = vars ? format(key, vars) : translate(key);
      },
      apply: applyDOMTranslations,
      renderSwitcher: renderSwitcher,
      onChange: onChange,
      STRINGS: STRINGS
    };
  }
})();
