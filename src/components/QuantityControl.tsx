import { Minus, Plus } from "lucide-react";
import { formatWeight } from "../utils/format";
import { getDecreasedQuantity, WEIGHT_STEP_KG } from "../utils/shopLogic";

interface QuantityControlProps {
  quantityKg: number;
  maximumQuantityKg: number;
  onQuantityChange: (quantityKg: number) => void;
  productName: string;
}

export default function QuantityControl({
  quantityKg,
  maximumQuantityKg,
  onQuantityChange,
  productName,
}: QuantityControlProps) {
  const canDecrease = quantityKg > WEIGHT_STEP_KG && maximumQuantityKg >= WEIGHT_STEP_KG;
  const canIncrease = quantityKg + WEIGHT_STEP_KG <= maximumQuantityKg;

  function decreaseQuantity() {
    if (canDecrease === true) {
      onQuantityChange(getDecreasedQuantity(quantityKg, maximumQuantityKg));
    }
  }

  function increaseQuantity() {
    if (canIncrease === true) {
      onQuantityChange(quantityKg + WEIGHT_STEP_KG);
    }
  }

  return (
    <div className="inline-flex items-center rounded-xl border border-[#dfe7de] bg-white">
      <button
        type="button"
        aria-label={"Giảm khối lượng " + productName}
        className="rounded-l-xl p-2.5 disabled:cursor-not-allowed disabled:opacity-35"
        disabled={canDecrease === false}
        onClick={decreaseQuantity}
      >
        <Minus size={15} />
      </button>
      <span className="min-w-[68px] text-center text-xs font-bold" aria-live="polite">
        {formatWeight(quantityKg)}
      </span>
      <button
        type="button"
        aria-label={"Tăng khối lượng " + productName}
        className="rounded-r-xl p-2.5 disabled:cursor-not-allowed disabled:opacity-35"
        disabled={canIncrease === false}
        onClick={increaseQuantity}
      >
        <Plus size={15} />
      </button>
    </div>
  );
}
