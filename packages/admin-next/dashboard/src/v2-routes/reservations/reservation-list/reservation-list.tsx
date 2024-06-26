import { Outlet } from "react-router-dom"
import { ReservationListTable } from "./components/reservation-list-table"

export const ReservationList = () => {
  return (
    <div className="flex flex-col gap-y-2">
      <ReservationListTable />
      <Outlet />
    </div>
  )
}
