
export default function Pagination({ current, total, onPageChange, accentColor = "#000" }) {
  if (total <= 1) return null;

  const pages = [];

  for (let i = 1; i <= total; i++) {
    pages.push(i);
  }

  return (
    <div style={styles.container}>
      <button
        style={styles.btn}
        disabled={current === 1}
        onClick={() => onPageChange(current - 1)}
      >
        {"<"}
      </button>

      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          style={{
            ...styles.page,
            background: current === p ? accentColor : "transparent",
            color: current === p ? "#fff" : "#000",
            borderColor: accentColor,
          }}
        >
          {p}
        </button>
      ))}

      <button
        style={styles.btn}
        disabled={current === total}
        onClick={() => onPageChange(current + 1)}
      >
        {">"}
      </button>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    gap: "8px",
    justifyContent: "center",
    marginTop: "40px",
  },
  btn: {
    padding: "8px 12px",
    border: "1px solid #ccc",
    background: "#fff",
    cursor: "pointer",
  },
  page: {
    padding: "8px 12px",
    border: "1px solid",
    cursor: "pointer",
  },
};