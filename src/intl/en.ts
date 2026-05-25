/**
 * English translations for Dispatch
 */

const en = {
  // ─── Brand ──────────────────────────────────────────────────────────────────
  brand: {
    name: "Dispatch",
    tagline: "Unified Logistics Platform",
    description:
      "The middleware that bridges merchants with courier providers, simplifying shipment creation, courier selection, and delivery tracking through one powerful platform.",
  },

  // ─── Navigation ─────────────────────────────────────────────────────────────
  nav: {
    features: "Features",
    howItWorks: "How It Works",
    portals: "Portals",
    login: "Log in",
    getStarted: "Get Started",
  },

  // ─── Landing Hero ───────────────────────────────────────────────────────────
  hero: {
    badge: "Built for Addis Ababa's logistics",
    headline1: "Your shortcut to",
    headline2: "every delivery.",
    downloadDriverApp: "Download Driver App",
    merchantLogin: "Merchant Log In",
    scroll: "Scroll",
  },

  // ─── Stats ──────────────────────────────────────────────────────────────────
  stats: {
    courierPartners: "Courier Partners",
    activeMerchants: "Active Merchants",
    deliveriesCompleted: "Deliveries Completed",
    avgDeliveryTime: "Avg Delivery Time",
  },

  // ─── Features Section ────────────────────────────────────────────────────────
  features: {
    sectionLabel: "Platform",
    headline1: "Everything you need.",
    headline2: "Nothing you don't.",
    shipmentManagement: {
      title: "Shipment Management",
      description:
        "Create, track, and manage shipments across multiple courier providers from one unified dashboard.",
    },
    fleetCoordination: {
      title: "Fleet Coordination",
      description:
        "Real-time driver tracking, intelligent route management, and delivery confirmation workflows.",
    },
    performanceAnalytics: {
      title: "Performance Analytics",
      description:
        "Compare courier performance, delivery times, and success rates with interactive analytics.",
    },
    apiIntegration: {
      title: "API Integration",
      description:
        "RESTful API with key management for seamless e-commerce platform integration.",
    },
    locationIntelligence: {
      title: "Location Intelligence",
      description:
        "Landmark-based location resolution tailored for Addis Ababa's unique addressing system.",
    },
    courierRatings: {
      title: "Courier Ratings",
      description:
        "Rate and compare courier providers based on real delivery performance data.",
    },
  },

  // ─── How It Works ───────────────────────────────────────────────────────────
  howItWorks: {
    sectionLabel: "Process",
    headline: "Get started in minutes.",
    step1: {
      title: "Register",
      description:
        "Create your merchant account with business details and get instant platform access.",
    },
    step2: {
      title: "Choose Courier",
      description:
        "Browse available couriers, compare pricing, performance metrics, and delivery zones.",
    },
    step3: {
      title: "Ship and Track",
      description:
        "Create shipments, track in real-time, get proof of delivery, and analyze logistics.",
    },
  },

  // ─── Portals Section ────────────────────────────────────────────────────────
  portals: {
    sectionLabel: "Portals",
    headline: "Built for every role.",
    subheading:
      "Dedicated dashboards tailored to each stakeholder in the delivery chain.",
    merchant: {
      title: "Merchant",
      description: "Create shipments, compare couriers, and track deliveries.",
    },
    supervisor: {
      title: "Courier Supervisor",
      description: "Manage drivers, assign shipments, and monitor fleet.",
    },
    admin: {
      title: "Administrator",
      description: "Oversee the platform, couriers, and system metrics.",
    },
  },

  // ─── CTA Section ────────────────────────────────────────────────────────────
  cta: {
    headline1: "Ready to streamline",
    headline2: "your logistics?",
    subheading:
      "Join Dispatch and connect your business to Addis Ababa's courier network today.",
    createAccount: "Create Merchant Account",
    courierLogin: "Courier Login",
  },

  // ─── Footer ─────────────────────────────────────────────────────────────────
  footer: {
    copyright: "© 2026 Dispatch. Built for Addis Ababa.",
    merchant: "Merchant",
    supervisor: "Supervisor",
    downloadDriverApp: "Download Driver App",
    admin: "Admin",
  },

  // ─── Login Page ─────────────────────────────────────────────────────────────
  login: {
    welcomeBack: "Welcome back",
    platformDescription:
      "Unified logistics platform connecting merchants and courier providers in Addis Ababa.",
    back: "Back",
    emailLabel: "Email",
    emailPlaceholder: "you@example.com",
    passwordLabel: "Password",
    forgotPassword: "Forgot password?",
    signIn: "Sign In",
    signingIn: "Signing in...",
    switchPortal: "Switch portal",

    // Role labels and subtitles
    roles: {
      merchant: {
        label: "Merchant",
        subtitle: "Manage shipments and track deliveries",
      },
      supervisor: {
        label: "Courier Supervisor",
        subtitle: "Manage drivers and fleet operations",
      },
      admin: {
        label: "Administrator",
        subtitle: "Oversee platform operations and metrics",
      },
    },

    // Validation errors
    validation: {
      emailRequired: "Email is required.",
      emailInvalid: "Please enter a valid email address.",
      emailTooLong: "Email must be less than 255 characters.",
      passwordRequired: "Password is required.",
      passwordTooShort: "Password must be at least 8 characters.",
    },

    // Lockout
    lockout: {
      message: "Too many failed attempts. Please try again in {time}.",
    },
  },

  // ─── Dashboard Stubs ────────────────────────────────────────────────────────
  dashboards: {
    merchant: {
      title: "Merchant Dashboard",
      welcome: "Welcome to the streamlined Dispatch Merchant portal.",
    },
    supervisor: {
      title: "Courier Supervisor Dashboard",
      welcome: "Welcome to the streamlined Dispatch Supervisor portal.",
    },
    admin: {
      title: "Administrator Dashboard",
      welcome: "Welcome to the streamlined Dispatch Administration portal.",
    },
    returnToWebsite: "Return to Website",
    logout: "Sign Out",
  },

  // ─── Supervisor Profile ──────────────────────────────────────────────────────
  profile: {
    title: "Company Profile",
    subtitle: "View your courier company information",
    companyInfo: "Company Information",
    contactInfo: "Contact Information",
    companyName: "Company Name",
    companyAddress: "Address",
    supportPhone: "Support Phone",
    email: "Email",
    website: "Website",
    status: "Status",
    operationalZones: "Operational Zones",
    operationalZonesDesc: "Operational zones are configured by the administrator.",
    ratingPricing: "Rating and Pricing",
    rating: "Rating",
    reviews: "reviews",
    maxWeight: "Max Weight",
    basePrice: "Base Price",
    rateDetails: "Rate Details",
    weightRate: "Weight Rate",
    distanceRate: "Distance Rate",
    timeRate: "Time Rate",
    viewProfile: "View Company Profile",
    errorLoading: "Error Loading Profile",
    noProfileData: "No Profile Data",
    noProfileDataDesc: "Profile data is unavailable. Contact Admin.",
    returnToDashboard: "Return to Dashboard",
    tryAgain: "Try Again",
    incomplete: {
      title: "Profile incomplete",
      description: "Contact Admin to complete your company profile.",
    },
  },

  // ─── Supervisor Dashboard ───────────────────────────────────────────────────
  supervisorDashboard: {
    pendingAssignments: "Pending Assignments",
    inTransit: "In Transit",
    completedToday: "Completed Today",
    revenueToday: "Revenue Today",
    driverStatus: "Driver Status",
    viewAll: "View All",
    deliveryRate: "Delivery Rate",
    driverUtilization: "Driver Utilization",
    rating: "Rating",
    assign: "Assign",
    merchants: "Merchants",
    destination: "Destination",
    id: "ID",
    actions: "Actions",
    inProgress: "In Progress",
    success: "Success",
    last7Days: "Last 7 Days",
    totalShipments: "Total Shipments",
    assignShipment: "Assign Shipment",
    overview: "Fleet Overview",
    performanceStatus: "Performance Metrics",
    performanceTitle: "Today's Performance",
    fleetManagement: "Fleet Management",
    deliveriesToday: "Deliveries Today",
    welcomeBack: "Welcome back, {name}",
    todaysOperations: "Today's operations at a glance",
    refresh: "Refresh",
    viewShipments: "View Shipments",
    attentionNeeded: "Attention needed",
    awaitingAssignment: "{count} shipment{s} awaiting driver assignment",
    pendingCount: "{count} pending shipment{s}",
    review: "Review",
    awaitingAssignmentSub: "awaiting assignment",
    onTheRoad: "on the road",
    failedToday: "{count} failed today",
    noFailuresToday: "no failures today",
    fromCompletedDeliveries: "from completed deliveries",
    actionItems: "Action Items",
    viewAllShipments: "View all shipments →",
    allCaughtUp: "All caught up",
    noPendingUnassigned: "No pending or unassigned shipments",
    noDescription: "No description",
    fleetStatus: "Fleet Status",
    detailsLink: "Details →",
    activeLabel: "Active",
    inFleet: "in fleet",
    onDeliveryLabel: "On Delivery",
    utilizationLabel: "{rate}% utilization",
    idleAvailableLabel: "Idle / Available",
    readyForAssignments: "ready for assignments",
    manageDrivers: "Manage Drivers",
  },
  sidebar: {
    dashboard: "Dashboard",
    shipments: "Shipments",
    drivers: "Drivers",
    fleet: "Fleet",
    revenue: "Revenue",
    reports: "Reports",
    supervisors: "Supervisors",
    settings: "Settings",
    logOut: "Log Out",
    roleTitle: "Courier Supervisor",
  },

  supervisors: {
    title: "Supervisors",
    subtitle: "Manage courier company supervisors",
    addSupervisor: "Add Supervisor",
    ownerBadge: "Owner",
    youBadge: "You",
    loading: "Loading supervisors...",
    retry: "Retry",
    cancel: "Cancel",
    close: "Close",
    editAction: "Edit",
    deleteAction: "Delete",
    table: {
      name: "Name",
      email: "Email",
      phone: "Phone",
      status: "Status",
      actions: "Actions",
    },
    status: {
      active: "Active",
      inactive: "Inactive",
      pending: "Pending",
    },
    create: {
      title: "Add Supervisor",
      description: "Create a new supervisor account for your courier company.",
      firstName: "First Name",
      middleName: "Middle Name",
      lastName: "Last Name",
      email: "Email",
      phone: "Phone Number",
      password: "Password",
      generating: "Generating...",
      regenerate: "Regenerate",
      firstNamePlaceholder: "John",
      middleNamePlaceholder: "Optional",
      lastNamePlaceholder: "Doe",
      emailPlaceholder: "john@example.com",
      phonePlaceholder: "+251911234567",
      submit: "Create Supervisor",
      submitting: "Creating...",
      success: "Supervisor created successfully.",
    },
    edit: {
      title: "Edit Supervisor",
      description: "Update supervisor account details.",
      firstName: "First Name",
      middleName: "Middle Name",
      lastName: "Last Name",
      email: "Email",
      phone: "Phone Number",
      status: "Status",
      submit: "Save Changes",
      submitting: "Saving...",
      success: "Supervisor updated successfully.",
    },
    delete: {
      title: "Delete Supervisor",
      description: "This will permanently remove the supervisor account. This action cannot be undone.",
      confirm: "I understand this is irreversible",
      submit: "Delete Supervisor",
      submitting: "Deleting...",
      success: "Supervisor deleted successfully.",
    },
    empty: "No supervisors found.",
    errorLoad: "Failed to load supervisors.",
  },

  // ─── Shipments Management ───────────────────────────────────────────────────
  shipments: {
    title: "Shipments",
    subtitle: "Manage and assign shipments to drivers",
    searchPlaceholder: "Search Shipments...",
    filters: {
      all: "All",
      pending: "Pending",
      assigned: "Assigned",
      inTransit: "In Transit",
      delivered: "Delivered",
      failed: "Failed",
      cancelled: "Cancelled",
      allDrivers: "All Drivers",
      unassigned: "Unassigned",
      advanced: "Advanced Filters",
      narrowDown: "Narrow down your shipment list",
      dateRange: "Date Range",
      to: "to",
      driverAssignment: "Driver Assignment",
      clearAdvanced: "Clear advanced filters",
      resetAll: "Reset all",
      fromLabel: "From:",
      toLabel: "To:",
      driverLabel: "Driver:",
      dateError: "Start date must be before end date",
    },
    table: {
      id: "ID",
      merchant: "Merchant",
      recipient: "Recipient",
      pickup: "Pickup",
      delivery: "Delivery",
      route: "Route",
      driver: "Driver",
      status: "Status",
      fee: "Fee",
      actions: "Actions",
      created: "Created",
    },
    status: {
      urgent: "Urgent",
      pending: "Pending",
      assigned: "Assigned",
      inTransit: "In Transit",
      delivered: "Delivered",
      returned: "Returned",
      failed: "Failed",
      cancelled: "Cancelled",
      unassigned: "Unassigned",
    },
    empty: {
      title: "No Shipments Found",
      description: "Try adjusting your filters or search terms.",
      noAssignments: "No shipments currently assigned to your courier company.",
    },
    batchAssign: "Batch Assign",
    selected: "selected",
    clear: "Clear",
    assignDriver: "Assign Driver",
    viewDetails: "View Details",
    rowsPerPage: "Rows per page",
    pageOf: "Page {page} of {total}",
    totalCount: "{count} shipments",
    details: {
      title: "Shipment Details",
      notFound: "Shipment not found",
      accessDenied: "Access denied",
      failedLoad: "Failed to load shipment",
      backToShipments: "Back to Shipments",
      basicInfo: "Basic Information",
      trackingNumber: "Tracking Number",
      merchant: "Merchant",
      created: "Created",
      statusHistory: "Status History",
      assignedDriver: "Assigned Driver",
      noDriver: "No driver assigned",
      name: "Name",
      phone: "Phone",
      email: "Email",
      pickupAddress: "Pickup Address",
      deliveryAddress: "Delivery Address",
      contact: "Contact:",
      packageDetails: "Package Details",
      weight: "Weight",
      dimensions: "Dimensions",
      deliveryFee: "Delivery Fee",
      items: "Items",
      itemsCount: "{count} item(s)",
      itemList: "Item List",
      notes: "Notes",
    },
    timeline: {
      created: "Created",
      assigned_to_courier: "Assigned to Courier",
      assigned_to_driver: "Assigned to Driver",
      picked_up: "Picked Up",
      in_transit: "In Transit",
      delivered: "Delivered",
      failed: "Failed",
      returned: "Returned",
      cancelled: "Cancelled",
    },
  },

  // ─── Driver Management ──────────────────────────────────────────────────────
  drivers: {
    title: "Drivers",
    subtitle: "Manage your delivery drivers",
    manageFleet: "Manage your fleet of drivers",
    searchPlaceholder: "Search drivers...",
    addDriver: "Add Driver",
    phone: "Phone",
    email: "Email",
    filters: {
      all: "All",
      active: "Active",
      inactive: "Inactive",
      pending: "Pending",
    },
    table: {
      driver: "Driver",
      vehicle: "Vehicle",
      deliveries: "Deliveries",
      status: "Status",
      rating: "Rating",
      actions: "Actions",
      phone: "Phone",
      email: "Email",
    },
    status: {
      active: "Active",
      inactive: "Inactive",
      onBreak: "On Break",
      busy: "Busy",
      pending: "Pending",
    },
    empty: {
      title: "No Drivers Found",
      description: "Check your search term or filter status.",
      noDriversInFleet: "No drivers in your fleet yet.",
    },
    addFirstDriver: "Add your first driver",
    editDriver: "Edit Driver",
    viewPerformance: "View Performance",
    deactivate: "Deactivate",
    activate: "Activate",
    delete: "Delete",
    compare: "Compare",
    selected: "selected",
  },

  // ─── Revenue Management ─────────────────────────────────────────────────────
  revenue: {
    title: "Revenue",
    subtitle: "Earnings from delivered shipments with period comparison",
    export: "Export",
    pdfReport: "PDF Report",
    pdfDesc: "Formatted document",
    excelReport: "Excel Workbook",
    excelDesc: "Editable spreadsheet",
    empty: {
      title: "No revenue data available",
      description: "Revenue is calculated from completed deliveries. Try a wider date range.",
    },
    stats: {
      totalRevenue: "Total Revenue",
      deliveries: "Deliveries",
      avgPerDelivery: "Avg per Delivery",
      priorComparison: "vs {amount} prior",
      avgNote: "across all delivered shipments",
    },
    trend: {
      title: "Revenue Trend",
      subtitle: "Daily revenue across the selected range",
    },
    topDrivers: {
      title: "Top Revenue-Generating Drivers",
      contributed: "{count} {s} contributed",
      driver: "driver",
      drivers: "drivers",
      deliveries: "{count} {s}",
      delivery: "delivery",
      deliveriesPlural: "deliveries",
      share: "{pct}% share",
    },
    presets: {
      d7: "7d",
      d30: "30d",
      d90: "90d",
      custom: "Custom",
    },
    calendar: {
      clear: "Clear",
      apply: "Apply",
    },
  },
  driverPerformance: {
    notFound: "Driver not found",
    backToDrivers: "Back to drivers",
    statusActive: "Active",
    export: "Export",
    presets: {
      d7: "7d",
      d30: "30d",
      d90: "90d",
      custom: "Custom",
    },
    picker: {
      pickStart: "Pick a start date",
      pickEnd: "Pick an end date",
      clear: "Clear",
      apply: "Apply",
    },
    reports: {
      pdf: "PDF Report",
      pdfDesc: "Formatted document",
      excel: "Excel Workbook",
      excelDesc: "Editable spreadsheet",
    },
    empty: {
      title: "No delivery data",
      description: "No shipments assigned to {name} during the selected period.",
    },
    metrics: {
      delivered: "Delivered",
      total: "of {count} total",
      successRate: "Success Rate",
      attempts: "{count} attempts",
      failed: "Failed",
      rate: "{count}% rate",
      avgTime: "Avg Time",
      pickupToDelivery: "pickup → delivered",
      dailyAvg: "Daily Avg",
      deliveriesPerDay: "deliveries / day",
      avgRating: "Avg Rating",
      ratingsCount: "{count} ratings",
      noRatings: "no ratings yet",
    },
    charts: {
      activity: "Delivery Activity",
      breakdown: "Status Breakdown",
      total: "total",
    },
    failureReasons: {
      title: "Failure Reasons",
      failedCount: "{count} failed shipment{s}",
    },
    calendar: {
      custom: "Custom",
      pickStartDate: "Pick a start date",
      pickEndDate: "Pick an end date",
      clear: "Clear",
      apply: "Apply",
    },
  },
  driverCompare: {
    title: "Compare Drivers",
    subtitle: "Side-by-side performance for {count} drivers",
    metrics: "Performance Metrics",
    top: "Top",
    bottom: "Bottom",
    metricCol: "Metric",
    loading: "Loading shipment data for all drivers...",
    empty: {
      title: "Select at least 2 drivers",
      description: "Pick two or more drivers from the driver list to compare their performance.",
      notFoundTitle: "Drivers not found",
      notFoundDescription: "Some of the selected drivers couldn't be loaded. Try again from the driver list.",
    },
    backToDrivers: "Back to drivers",
    calendar: {
      custom: "Custom",
    },
  },
  fleet: {
    title: "Fleet Utilization",
    subtitle: "Capacity, workload distribution, and operational insights",
    presets: {
      today: "Today",
      week: "This week",
      month: "This month",
      custom: "Custom",
    },
    empty: {
      title: "No active drivers in your fleet.",
      description: "Add drivers from the Drivers page to start tracking fleet utilization.",
    },
    stats: {
      activeDrivers: "Active Drivers",
      onDelivery: "On Delivery",
      idleDrivers: "Idle Drivers",
      shipments: "Shipments",
      inFleet: "in fleet",
      fleetPct: "{pct}% of fleet",
      availableNow: "available now",
      deliveredCount: "{count} delivered",
    },
    workload: {
      title: "Workload Distribution",
      summary: "{count} drivers • avg {avg} shipments/driver",
      delivered: "Delivered",
      inProgress: "In Progress",
      failed: "Failed",
      scroll: "Scroll to see all {count} drivers",
    },
    peakHours: {
      title: "Peak Hours",
      subtitle: "Activity by hour of day",
      peak: "Peak: {time}",
    },
    recommendations: {
      title: "Recommendations",
      subtitle: "Insights derived from current workload + activity patterns",
      balanced: "Fleet is balanced. No capacity gaps or workload imbalances detected for this period.",
      atCapacity: {
        title: "Fleet at capacity",
        body: "{pct}% of active drivers are on delivery. Consider activating more drivers or pausing low-priority assignments to absorb new requests.",
      },
      tightening: {
        title: "Capacity tightening",
        body: "{pct}% of fleet is engaged. Watch for spikes — only {count} {s} idle.",
        driver: "driver",
        drivers: "drivers",
      },
      spare: {
        title: "Spare capacity available",
        body: "{idle} of {total} drivers are idle. Fleet can absorb new shipments without rebalancing.",
      },
      activation: {
        title: "Optimal activation windows",
        body: "Demand peaks at {hours}. Schedule additional drivers around these hours to avoid backlogs.",
      },
      overworked: {
        title: "Overworked",
        desc: "Above 1.5x fleet average — reassign new shipments",
      },
      underutilized: {
        title: "Underutilized",
        desc: "Below 0.5x fleet average — assign more shipments",
      },
    },
  },

  // ─── Fleet Map ──────────────────────────────────────────────────────────────
  fleetMap: {
    title: "Fleet Map",
    subtitle: "Real-time geographic distribution of your fleet",
    sidebar: {
      activeDrivers: "Active Drivers",
      idleDrivers: "Idle / Available",
      onDelivery: "On Delivery",
      searchPlaceholder: "Search driver...",
    },
    marker: {
      assignment: "Assignment",
      status: "Status",
      idle: "Idle",
      viewDetails: "View Details",
    },
  },


  settings: {
    title: "Settings",
    subtitle: "Customize your experience across the supervisor portal",
    language: {
      title: "Language",
      description: "Choose the display language for menus, labels, and messages. Your selection is saved on this device.",
    },
    comingSoon: {
      title: "More settings coming soon",
      description: "Notification preferences, theme customization, and account-level defaults will appear here as the underlying backend modules become available.",
    },
  },

  // ─── Reports ────────────────────────────────────────────────────────────────
  reports: {
    title: "Reports",
    subtitle: "Comprehensive fleet performance and operational analytics",
    stats: {
      successRate: "Overall Success",
      avgDeliveryTime: "Avg. Delivery Time",
      onTimePercentage: "On-Time Ratio",
      fleetUtilization: "Fleet Utilization",
      deliveriesChange: "{pct}% deliveries",
      revenueChange: "{pct}% vs prior",
      driversIdle: "{count} drivers idle",
      pickupToDelivery: "pickup → delivered",
    },
    charts: {
      deliveryVolume: "Delivery Volume Trend",
      statusBreakdown: "Delivery Status Breakdown",
      vehicleUsage: "Vehicle Type Utilization",
    },
    leaderboard: {
      title: "Top Performing Drivers",
      table: {
        driver: "Driver",
        trips: "Trips",
        success: "Success %",
        rating: "Rating",
      },
    },
    vehicles: {
      motorcycles: "Motorcycles",
      compactCars: "Compact Cars",
      trucksVans: "Trucks / Vans",
    },
    export: "Export Full Report",
  },

  // ─── Forgot Password ────────────────────────────────────────────────────────
  forgotPassword: {
    panelTitle: "Reset your password",
    panelSubtitle: "We'll send a secure link to your email so you can choose a new password.",
    title: "Forgot password?",
    subtitle: "We'll email you a reset link",
    description: "Enter the email address associated with your account and we'll send you a password reset link.",
    emailLabel: "Email",
    emailPlaceholder: "you@example.com",
    submit: "Send Reset Link",
    sending: "Sending...",
    backToLogin: "Back to Login",
    successTitle: "Check your inbox",
    successBody: "A password reset link has been sent to {email}. Check your spam folder if you don't see it.",
    errorNotFound: "No account found with that email address.",
    errorGeneric: "Something went wrong. Please try again later.",
  },

  // ─── Common ─────────────────────────────────────────────────────────────────
  common: {
    language: "Language",
    theme: "Theme",
    darkMode: "Dark mode",
    lightMode: "Light mode",
    systemMode: "System",
  },
} as const;

// DeepStringify converts all leaf string literals to `string`,
// so am.ts can satisfy this type with different string values.
type DeepStringify<T> = {
  [K in keyof T]: T[K] extends string
    ? string
    : T[K] extends Record<string, unknown>
    ? DeepStringify<T[K]>
    : T[K];
};

export type Messages = DeepStringify<typeof en>;
export default en;
