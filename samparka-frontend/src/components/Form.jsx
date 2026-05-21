import PropTypes from "prop-types";
import { countryCodes } from "../config/countryCodes";

const Form = ({
  className = "",
  formData,
  handleChange,
  handleSubmit,
  store,
  selectedCountryCode,
  setSelectedCountryCode,
}) => {
  return (
    <div
      className={`self-stretch flex flex-col items-center justify-center py-5 px-0 ${className} overflow-hidden`}
    >
      {/* Curved container with shadow */}
      <div className="bg-white rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.3)] p-6 w-[320px] sm:w-auto overflow-hidden">
        <form
          onSubmit={handleSubmit}
          className="m-0 flex flex-col items-center justify-center gap-2.5"
        >
          <div className="self-stretch relative text-mini1 tracking-[0.01em] font-semibold font-poppins text-black text-center">
            Login
          </div>
          <input
            className="border-gray-200 border-[1px] font-poppins border-solid outline-none bg-transparent self-stretch filter drop-shadow-[0px_0px_2px_rgba(0,0,0,0.25)_inset] rounded-6xs1 box-border h-[35px] flex items-center justify-center py-[7px] px-3 text-base1"
            placeholder="Name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
          />
          <input
            className="border-gray-200 border-[1px] font-poppins border-solid outline-none bg-transparent self-stretch filter drop-shadow-[0px_0px_2px_rgba(0,0,0,0.25)_inset] rounded-6xs1 box-border h-[35px] flex items-center justify-center py-[7px] px-3 text-base1"
            name="email"
            placeholder="Email"
            type="email"
            value={formData.email}
            onChange={handleChange}
          />
          <div className="self-stretch flex flex-row items-start justify-start gap-2.5">
            <select
              className="w-20 border-gray-200 border-[1px] font-poppins border-solid outline-none bg-transparent rounded-6xs1 box-border h-[35px] flex items-center justify-center py-[7px] px-3 text-base1"
              value={selectedCountryCode}
              onChange={(e) => setSelectedCountryCode(e.target.value)}
            >
              {countryCodes.map(({ name, code, dial_code }) => (
                <option key={code} value={dial_code}>
                  {name} ({dial_code})
                </option>
              ))}
            </select>

            <input
              className="w-full border-gray-200 border-[1px] font-poppins border-solid outline-none bg-transparent rounded-6xs1 box-border h-[35px] flex items-center justify-center py-[7px] px-3 text-base1"
              placeholder="Phone No"
              type="number"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          {store.needCustomerGender && (
            <div className="self-stretch flex flex-row items-center gap-2">
              <label
                htmlFor="gender"
                className="text-sm font-semibold font-poppins text-gray-800 whitespace-nowrap"
              >
                Gender:
              </label>
              <select
                name="gender"
                id="gender"
                required
                value={formData.gender}
                onChange={handleChange}
                className="border-gray-200 border-[1px] font-poppins border-solid outline-none bg-transparent flex-1 filter drop-shadow-[0px_0px_2px_rgba(0,0,0,0.25)_inset] rounded-6xs1 box-border h-[35px] py-[7px] px-3 text-base1"
              >
                <option value="" disabled>
                  {"Select Gender"}
                </option>
                <option value={"male"}>Male</option>
                <option value={"female"}>Female</option>
                <option value={"others"}>Others</option>
              </select>
            </div>
          )}

          {store.needCustomerDOB && (
            <div className="self-stretch flex flex-row items-center gap-2">
              <label
                htmlFor="dob"
                className="text-sm font-semibold font-poppins text-gray-800 whitespace-nowrap"
              >
                DOB:
              </label>
              <input
                className="border-gray-200 border-[1px] font-poppins border-solid outline-none bg-transparent flex-1 filter drop-shadow-[0px_0px_2px_rgba(0,0,0,0.25)_inset] rounded-6xs1 box-border h-[35px] py-[7px] px-3 text-base1"
                name="dob"
                placeholder="Date of Birth"
                type="date"
                value={formData.dob}
                onChange={handleChange}
                required
              />
            </div>
          )}

          <button
            type="submit"
            className="cursor-pointer border-whitesmoke-100 border-[1px] border-solid py-[9px] px-0 bg-seagreen-100 w-full rounded-3xs1 box-border h-[39px] flex items-center justify-center"
          >
            <div className="relative text-base1 tracking-[0.01em] leading-[149.7%] font-semibold font-poppins text-white">
              Continue
            </div>
          </button>
        </form>
      </div>
    </div>
  );
};

Form.propTypes = {
  className: PropTypes.string,
};

export default Form;
