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
  },

  // ─── Shipments Management ───────────────────────────────────────────────────
  shipments: {
    title: "Shipments",
    subtitle: "Manage and assign shipments to drivers",
    searchPlaceholder: "Search Shipments...",
    filters: {
      all: "All",
      pending: "Pending",
      inTransit: "In Transit",
      delivered: "Delivered",
    },
    table: {
      id: "ID",
      merchant: "Merchant",
      route: "Route",
      driver: "Driver",
      status: "Status",
      fee: "Fee",
      actions: "Actions",
    },
    status: {
      urgent: "Urgent",
      pending: "Pending",
      assigned: "Assigned",
      inTransit: "In Transit",
      delivered: "Delivered",
      returned: "Returned",
    },
    empty: {
      title: "No Shipments Found",
      description: "Try adjusting your filters or search terms.",
    },
  },

  // ─── Driver Management ──────────────────────────────────────────────────────
  drivers: {
    title: "Drivers",
    subtitle: "Manage your delivery drivers",
    searchPlaceholder: "Search drivers...",
    filters: {
      all: "All",
      active: "Active",
      inactive: "Inactive",
    },
    table: {
      driver: "Driver",
      vehicle: "Vehicle",
      deliveries: "Deliveries",
      status: "Status",
      rating: "Rating",
      actions: "Actions",
    },
    status: {
      active: "Active",
      inactive: "Inactive",
      onBreak: "On Break",
      busy: "Busy",
    },
    empty: {
      title: "No Drivers Found",
      description: "Check your search term or filter status.",
    },
  },

  // ─── Revenue Management ─────────────────────────────────────────────────────
  revenue: {
    title: "Revenue",
    subtitle: "Track Delivery Fees and in-cash collections",
    stats: {
      deliveryFees: "Delivery Fees",
      codCollected: "COD Collected",
      avgPerDelivery: "Avg. per Delivery",
      successRate: "{rate}% Success",
      last7Days: "Last 7 Days",
      totalShipments: "Total Shipments",
    },
    trend: {
      title: "Revenue Trend",
    },
    collections: {
      title: "Driver Collections",
      table: {
        driver: "Driver",
        deliveries: "Deliveries",
        feesCollected: "Delivery Fees Collected",
        date: "Date",
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

  // ─── Reports ────────────────────────────────────────────────────────────────
  reports: {
    title: "Reports",
    subtitle: "Comprehensive fleet performance and operational analytics",
    stats: {
      successRate: "Overall Success",
      avgDeliveryTime: "Avg. Delivery Time",
      onTimePercentage: "On-Time Ratio",
      fleetUtilization: "Fleet Utilization",
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
    export: "Export Full Report",
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
