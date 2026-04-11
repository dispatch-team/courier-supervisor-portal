// ─── Pagination ──────────────────────────────────────────

export interface PaginatedResponse<T> {
  total: number;
  page: number;
  page_size: number;
  data: T[];
}

// ─── Driver ──────────────────────────────────────────────

export interface Driver {
  id: number;
  keycloak_id: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  courier_company_id: number;
  status: "active" | "inactive" | "pending";
  profile_picture_id: string | null;
  additional_documents_id: string | null;
  rating_aggregate: number;
  rating_count: number;
}

// ─── Shipment ────────────────────────────────────────────

export type ShipmentStatus =
  | "pending"
  | "assigned_to_courier"
  | "assigned_to_driver"
  | "picked_up"
  | "in_transit"
  | "delivered"
  | "failed"
  | "returned"
  | "cancelled";

export interface Shipment {
  id: number;
  code: string;
  merchant_id: number;
  merchant_user_id: string;
  description: string;
  items: string[];
  weight_kg: number;
  dimensions: string;
  total_fee: number;
  status: ShipmentStatus;
  remark: string;
  courier_company_id: number;
  assigned_driver_id: number | null;
  start_address: string;
  start_address_contact_name: string;
  start_address_phone_number: string;
  start_address_additional_contact: string;
  end_address: string;
  end_address_contact_name: string;
  end_address_phone_number: string;
  end_address_additional_contact: string;
  rating: number;
  webhook_url: string;
  delivered_at: string | null;
  assigned_to_courier_at: string | null;
  assigned_to_driver_at: string | null;
  picked_up_at: string | null;
  in_transit_at: string | null;
  failed_at: string | null;
  returned_at: string | null;
  cancelled_at: string | null;
  created_at: string;
}

// Detail response includes nested merchant, courier, driver objects
export interface ShipmentMerchant {
  id: number;
  company_name: string;
  company_address: string;
  phone_number: string;
  email: string;
  website_url: string;
}

export interface ShipmentDetail extends Shipment {
  merchant: ShipmentMerchant | null;
  courier_company: CourierCompany | null;
  assigned_driver: Driver | null;
}

export interface ShipmentListResponse {
  total: number;
  page: number;
  page_size: number;
  shipments: Shipment[];
}

// ─── Courier Company ────────────────────────────────────

export interface CourierCompany {
  id: number;
  company_name: string;
  company_address: string;
  status: string;
  company_logo_id: string | null;
  phone_number: string;
  email: string;
  website_url: string;
  rating_aggregate: number;
  rating_count: number;
  max_weight: number;
  base_price: number;
  weight_rate: number;
  distance_rate: number;
  time_rate: number;
  owner_supervisor_id: number;
}
