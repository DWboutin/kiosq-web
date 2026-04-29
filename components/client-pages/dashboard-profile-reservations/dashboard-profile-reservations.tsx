"use client";

import { useCurrentUserReservations } from "@/hooks/use-current-user-profile-id-reservations";
import { AuthenticatedUserReservation } from "@/utils/factories/authenticated-user-reservations-factory";

type DashboardProfileReservationsProps = {
  reservationsData: AuthenticatedUserReservation[];
};

export const DashboardProfileReservations = ({
  reservationsData,
}: DashboardProfileReservationsProps) => {
  const {
    selectors: { reservations },
  } = useCurrentUserReservations(reservationsData);

  return (
    <div className="flex flex-wrap gap-6 justify-start">
      {reservations.map((reservation) => (
        <pre key={reservation.id}>{JSON.stringify(reservation, null, 2)}</pre>
      ))}
    </div>
  );
};
