interface AnswerOptionProps {
  label: string;
  selected: boolean;
  correct?: boolean;
  incorrect?: boolean;
  disabled: boolean;
  onClick: () => void;
}

export default function AnswerOption({
  label, selected, correct, incorrect, disabled, onClick,
}: AnswerOptionProps) {
  let base = 'w-full text-left px-5 py-4 rounded-xl border-2 text-base transition-all ';

  if (correct)        base += 'bg-green-50 border-green-500 text-green-800';
  else if (incorrect) base += 'bg-red-50 border-red-500 text-red-800';
  else if (selected)  base += 'bg-blue-50 border-[#004ac6] text-[#004ac6]';
  else                base += 'bg-white border-gray-200 text-gray-800 hover:bg-blue-50 hover:border-[#004ac6]';

  if (disabled) base += ' cursor-default';

  return (
    <button className={base} onClick={onClick} disabled={disabled}>
      {label}
    </button>
  );
}
