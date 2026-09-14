export default function ActionButton({ action, label, onClick }) {
  return (
    <button data-action={action} onClick={onClick}>
      {label}
    </button>
  );
}
