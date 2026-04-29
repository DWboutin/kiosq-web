import {
  RawReservationWithOrdersAndRelations,
  RawOrderItem,
  RawOrder,
  RawKiosq,
  RawProfile,
} from "@/types/app";

export type AuthenticatedUserReservation = {
  id: string;
  ownReservation: boolean;
  customerId: string;
  vendorProfileId: string;
  kiosqId: string | null;
  notes: string | null;
  scheduleId: string | null;
  status: string;
  stripeAccountId: string | null;
  orders: AuthenticatedUserOrder[];
  kiosq: AuthenticatedUserKiosq | null;
  profile: AuthenticatedUserProfile | null;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AuthenticatedUserKiosq = {
  id: string;
  nameTranslations: Record<string, string>;
  descriptionTranslations: Record<string, string>;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  imageUrl: string | null;
  status: string;
  isDefault: boolean;
};

export type AuthenticatedUserProfile = {
  id: string;
  nameTranslations: Record<string, string>;
  slugTranslations: Record<string, string>;
  descriptionTranslations: Record<string, string>;
  bannerImage: string | null;
  type: "personal" | "vendor";
  stripeAccountId: string | null;
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

const authenticatedUserKiosqFactory = (kiosq: RawKiosq): AuthenticatedUserKiosq => ({
  id: kiosq.id,
  nameTranslations: kiosq.name_translations as Record<string, string>,
  descriptionTranslations: kiosq.description_translations as Record<string, string>,
  address: kiosq.address,
  city: kiosq.city,
  state: kiosq.state,
  country: kiosq.country,
  latitude: kiosq.latitude,
  longitude: kiosq.longitude,
  imageUrl: kiosq.image_url,
  status: kiosq.status || "open",
  isDefault: kiosq.is_default,
});

const authenticatedUserProfileFactory = (profile: RawProfile): AuthenticatedUserProfile => ({
  id: profile.id,
  nameTranslations: profile.name_translations as Record<string, string>,
  slugTranslations: profile.slug_translations as Record<string, string>,
  descriptionTranslations: profile.description_translations as Record<string, string>,
  bannerImage: profile.banner_image,
  type: profile.type as "personal" | "vendor",
  stripeAccountId: profile.stripe_account_id,
});

const authenticatedUserReservationFactory = (
  reservation: RawReservationWithOrdersAndRelations,
  userId: string
): AuthenticatedUserReservation => ({
  id: reservation.id,
  ownReservation: reservation.customer_id === userId,
  customerId: reservation.customer_id,
  vendorProfileId: reservation.vendor_profile_id,
  kiosqId: reservation.kiosq_id,
  notes: reservation.notes,
  scheduleId: reservation.schedule_id,
  status: reservation.status,
  stripeAccountId: reservation.stripe_account_id,
  orders: reservation.orders.map(authenticatedUserOrderFactory),
  kiosq: reservation.kiosqs ? authenticatedUserKiosqFactory(reservation.kiosqs) : null,
  profile: reservation.profiles ? authenticatedUserProfileFactory(reservation.profiles) : null,
  isDeleted: reservation.is_deleted,
  createdAt: reservation.created_at,
  updatedAt: reservation.updated_at,
});

export const authenticatedUserReservationsFactory = (
  reservations: RawReservationWithOrdersAndRelations[],
  userId: string
): AuthenticatedUserReservation[] => {
  return reservations.map((reservation) =>
    authenticatedUserReservationFactory(reservation, userId)
  );
};
