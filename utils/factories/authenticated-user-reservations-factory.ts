import { RawReservationWithOrders, RawOrderItem, RawOrder } from "@/types/app";

export type AuthenticatedUserReservation = {
  id: string;
  customerId: string;
  vendorProfileId: string;
  kiosqId: string | null;
  notes: string | null;
  scheduleId: string | null;
  status: string;
  stripeAccountId: string | null;
  orders: AuthenticatedUserOrder[];
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AuthenticatedUserOrder = {
  createdAt: string;
  customerId: string;
  id: string;
  kiosqId: string | null;
  maxTime: string | null;
  notes: string | null;
  orderItems: AuthenticatedUserOrderItem[];
  orderTime: string;
  reservationId: string | null;
  status: string;
  stripePaymentIntentId: string | null;
  totalAmount: number;
  updatedAt: string;
  vendorProfileId: string;
};

export type AuthenticatedUserOrderItem = {
  id: string;
  options: Record<string, unknown> | null;
  orderId: string | null;
  productVariantId: string;
  quantity: number;
  reservationId: string | null;
  totalPrice: number | null;
  unit: string;
  unitPrice: number;
  createdAt: string;
};

const authenticatedUserOrderItemFactory = (
  orderItem: RawOrderItem
): AuthenticatedUserOrderItem => ({
  id: orderItem.id,
  options: orderItem.options as Record<string, unknown> | null,
  orderId: orderItem.order_id,
  productVariantId: orderItem.product_variant_id,
  quantity: orderItem.quantity,
  reservationId: orderItem.reservation_id,
  totalPrice: orderItem.total_price,
  unit: orderItem.unit,
  unitPrice: orderItem.unit_price,
  createdAt: orderItem.created_at,
});

const authenticatedUserOrderFactory = (
  order: RawOrder & { order_items: RawOrderItem[] }
): AuthenticatedUserOrder => ({
  createdAt: order.created_at,
  customerId: order.customer_id,
  id: order.id,
  kiosqId: order.kiosq_id,
  maxTime: order.max_time,
  notes: order.notes,
  orderItems: order.order_items.map(authenticatedUserOrderItemFactory),
  orderTime: order.order_time,
  reservationId: order.reservation_id,
  status: order.status,
  stripePaymentIntentId: order.stripe_payment_intent_id,
  totalAmount: order.total_amount,
  updatedAt: order.updated_at,
  vendorProfileId: order.vendor_profile_id,
});

const authenticatedUserReservationFactory = (
  reservation: RawReservationWithOrders
): AuthenticatedUserReservation => ({
  id: reservation.id,
  customerId: reservation.customer_id,
  vendorProfileId: reservation.vendor_profile_id,
  kiosqId: reservation.kiosq_id,
  notes: reservation.notes,
  scheduleId: reservation.schedule_id,
  status: reservation.status,
  stripeAccountId: reservation.stripe_account_id,
  orders: reservation.orders.map(authenticatedUserOrderFactory),
  isDeleted: reservation.is_deleted,
  createdAt: reservation.created_at,
  updatedAt: reservation.updated_at,
});

export const authenticatedUserReservationsFactory = (
  reservations: RawReservationWithOrders[]
): AuthenticatedUserReservation[] => {
  return reservations.map(authenticatedUserReservationFactory);
};
