import { matchStore } from "@/store";

const DatePicker = () => {
  const { date, setDate } = matchStore();

  return (
    <div className="font-semibold w-full font-normal text-sm text-gray-400">
      <span className="block  flex-1 mb-1 w-full">Fecha</span>
      <input
        type="date"
        className="border-gray-300 rounded-md w-full h-8"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />
    </div>
  );
};

export default DatePicker;
