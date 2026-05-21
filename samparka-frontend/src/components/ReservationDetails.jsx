import PropTypes from "prop-types";

const ReservationDetails = ({ className = "", reservations }) => {
  return (
    <div className="self-stretch flex flex-row items-center justify-center flex-wrap content-center gap-[53px] text-left text-xs-4 text-black font-poppins">
      {reservations.length > 0 ? (
        reservations.map((reservation, index) => {
          <div
            key={index}
            className="w-[270px] shadow-[0px_4px_12.2px_rgba(0,_0,_0,_0.25)] rounded-3xs1 bg-white h-58 flex flex-col items-center justify-start py-4 px-4 box-border relative gap-2.5"
          >
            <div className="self-stretch flex flex-row items-center justify-center gap-[3px]">
              <div className="w-2.5 relative rounded-62xl1 bg-lime border-whitesmoke-200 border-[1px] border-solid box-border h-2.5" />
              <div className="flex flex-row items-center justify-center">
                <div className="relative font-medium">Pending Approval</div>
              </div>
            </div>
            <div className="self-stretch flex-1 flex flex-col items-start justify-center gap-2.5 text-left">
              <div className="self-stretch flex flex-col items-start justify-center py-0 px-3.5 gap-px">
                <div className="self-stretch flex flex-row items-center justify-start">
                  <div className="w-[125.9px] relative font-medium inline-block shrink-0">
                    #1123
                  </div>
                </div>
                <div className="self-stretch flex flex-row items-center justify-start">
                  <div className="w-[125.9px] relative font-medium inline-block shrink-0">
                    Table No: {reservation.tableNumber}
                  </div>
                </div>
                <div className="self-stretch relative font-montserrat text-darkgray-200">
                  <p className="m-0">
                    <span className="font-medium">Reservation Date: </span>
                    <span className="font-montserrat text-darkgray-200">
                      11th Jan 2025
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>;
        })
      ) : (
        <div className="w-[270px] shadow-[0px_4px_12.2px_rgba(0,_0,_0,_0.25)] rounded-3xs1 bg-white h-58 flex flex-col items-center justify-start py-4 px-4 box-border relative gap-2.5">
          No Reservations
        </div>
      )}
    </div>
  );
};

ReservationDetails.propTypes = {
  className: PropTypes.string,
};

export default ReservationDetails;
