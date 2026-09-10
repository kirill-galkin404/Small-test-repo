function ActionButton({ action, onClick, children }) {
  return (
    <button data-action={action} onClick={onClick}>
      {children}
    </button>
  );
}

export default ActionButton;
